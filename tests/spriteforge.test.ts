import assert from 'node:assert/strict';
import test from 'node:test';
import { KNOWN_ASSET_IDS, resolveAssetColors } from '../src/assets/registry.ts';
import { evaluateAnimationFrame, evaluateDialoguePhoneme } from '../src/engine/animation/evaluator.ts';
import { cubicBezier, evaluateSpring } from '../src/engine/animation/math.ts';
import { computeBodyMetrics } from '../src/engine/character/bodyGeometry.ts';
import { computeSkeletonWorld, DEFAULT_RIG_POSE } from '../src/engine/character/skeleton.ts';
import { solveExpression } from '../src/engine/expression/expressionSolver.ts';
import { evaluateProductionFrame, getProductionDurationSec } from '../src/engine/production/sequencer.ts';
import { PRODUCTION_DEMOS } from '../src/examples/productionDemos.ts';
import { SAMPLE_PRODUCTION_SCRIPT } from '../src/examples/sampleProduction.ts';
import {
  AnimationConfig,
  CHARACTER_PRESETS,
  validateCharacterDefinition,
} from '../src/schemas/character.schema.ts';
import { buildMasterDirectorPrompt } from '../src/studio/promptGenerator.ts';

test('Character schema validation accepts all 8 presets with unique voices and flags invalid ranges/assets', () => {
  assert.equal(CHARACTER_PRESETS.length, 8, 'Expected 8 curated CinemaToon cast presets');
  const voices = new Set<string>();
  for (const preset of CHARACTER_PRESETS) {
    const res = validateCharacterDefinition(preset, KNOWN_ASSET_IDS);
    assert.equal(res.valid, true, `Preset ${preset.id} should be valid`);
    assert.equal(res.issues.length, 0, `Preset ${preset.id} should have zero warnings`);
    assert.ok(preset.voice, `Preset ${preset.id} should define a Kokoro voice`);
    assert.equal(voices.has(preset.voice!), false, `Preset ${preset.id} reuses voice ${preset.voice}`);
    voices.add(preset.voice!);
  }

  const broken = structuredClone(CHARACTER_PRESETS[0]);
  broken.body.height = 5.0; // out of range
  broken.equipment.hair = 'non_existent_hair_999';
  const res = validateCharacterDefinition(broken, KNOWN_ASSET_IDS);
  assert.equal(res.valid, false);
  assert.ok(res.issues.some((i) => i.field === 'body.height' && i.level === 'error'));
  assert.ok(res.issues.some((i) => i.field === 'equipment.hair' && i.level === 'warning'));
});

test('Skeleton attachment alignment holds across arbitrary body scaling & joint rotations', () => {
  const customBody = {
    ...CHARACTER_PRESETS[0].body,
    height: 1.24,
    shoulderWidth: 1.3,
    armLength: 1.18,
    legLength: 0.85,
  };
  const metrics = computeBodyMetrics(customBody);
  const pose = {
    ...DEFAULT_RIG_POSE,
    torsoRot: 18,
    upperArmLRot: 45,
    forearmLRot: -60,
    thighRRot: -35,
    shinRRot: 70,
  };
  const world = computeSkeletonWorld(metrics, pose);

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(b.x - a.x, b.y - a.y);

  assert.ok(Math.abs(dist(world.shoulderL, world.elbowL) - metrics.upperArmLen) < 1e-6);
  assert.ok(Math.abs(dist(world.elbowL, world.wristL) - metrics.forearmLen) < 1e-6);
  assert.ok(Math.abs(dist(world.hipR, world.kneeR) - metrics.thighLen) < 1e-6);
  assert.ok(Math.abs(dist(world.kneeR, world.ankleR) - metrics.shinLen) < 1e-6);
});

test('Color token resolver applies overrides without mutating asset defaults', () => {
  const base = resolveAssetColors('police_uniform_001', 'upperBody', {});
  assert.equal(base.main, '#1E3A5F');

  const overridden = resolveAssetColors('police_uniform_001', 'upperBody', {
    upperBody: { main: '#0EA5E9' },
  });
  assert.equal(overridden.main, '#0EA5E9');
  assert.equal(overridden.highlight, base.highlight);
});

test('Emotion engine blends simultaneous emotions, clamps extremes, and applies regional overrides', () => {
  const extreme = solveExpression({
    emotion: {
      scared: 1.0,
      angry: 1.0,
      happy: 1.0,
      surprised: 1.0,
      nervous: 1.0,
    },
  });

  assert.ok(extreme.eyeOpenL >= 0 && extreme.eyeOpenL <= 1.35);
  assert.ok(extreme.mouthOpen >= 0 && extreme.mouthOpen <= 1);
  assert.ok(extreme.mouthCurve >= -1 && extreme.mouthCurve <= 1);

  const overridden = solveExpression({
    emotion: { scared: 0.8 },
    faceOverrides: { brows: 'worried', eyes: 'suspicious', mouth: 'nervous_smile' },
  });
  assert.ok(overridden.browLTilt > 0.7);
  assert.ok(overridden.eyeOpenL < 0.7);
  assert.ok(overridden.teethShow > 0.8);
});

test('Animation evaluator is deterministic across repeated & out-of-order frame queries and 30/60 FPS parity', () => {
  const anim: AnimationConfig = {
    basePose: 'stand',
    action: 'run',
    actionIntensity: 1.1,
    speed: 1.2,
    enableBreathing: true,
    enableAutoBlink: true,
    enablePhysics: true,
  };
  const expr = { emotion: { determined: 0.7, scared: 0.3 } };

  const f15At30First = evaluateAnimationFrame(15, 30, anim, expr);
  const f90At30 = evaluateAnimationFrame(90, 30, anim, expr);
  const f15At30Second = evaluateAnimationFrame(15, 30, anim, expr);

  assert.deepEqual(f15At30First, f15At30Second);
  assert.notEqual(f15At30First.pose.thighLRot, f90At30.pose.thighLRot);

  // 30 FPS frame 15 (t=0.5s) must equal 60 FPS frame 30 (t=0.5s)
  const f30At60 = evaluateAnimationFrame(30, 60, anim, expr);
  assert.ok(Math.abs(f15At30First.pose.thighLRot - f30At60.pose.thighLRot) < 1e-6);
  assert.ok(Math.abs(f15At30First.pose.hairSwingDeg - f30At60.pose.hairSwingDeg) < 1e-6);
});

test('Cubic Bezier, spring interpolation, and dialogue phoneme cues behave smoothly', () => {
  assert.equal(cubicBezier(0.4, 0, 0.2, 1, 0), 0);
  assert.ok(Math.abs(cubicBezier(0.4, 0, 0.2, 1, 1) - 1) < 1e-5);
  assert.equal(evaluateSpring(0), 0);
  assert.ok(evaluateSpring(2.5) > 0.99);
  assert.equal(evaluateDialoguePhoneme(0.5), 'D');
  assert.equal(evaluateDialoguePhoneme(5.0), 'X');
});

test('Multi-scene production sequencer interpolates camera, transitions, actions, and captions deterministically', () => {
  const totalSec = getProductionDurationSec(SAMPLE_PRODUCTION_SCRIPT);
  assert.equal(totalSec, 8.0);

  // Frame 0: scene 0 with fade-in active
  const f0 = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 0);
  assert.equal(f0.sceneIndex, 0);
  assert.equal(f0.fadeOverlayOpacity, 1);
  assert.equal(f0.camera.zoom, 1.0);

  // Frame 45 (1.5s): camera zooming in, dialogue line 1 active with caption
  const f45 = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 45);
  assert.equal(f45.sceneIndex, 0);
  assert.ok(f45.camera.zoom > 1.0 && f45.camera.zoom < 1.22);
  assert.ok(f45.activeCaption !== null);
  assert.equal(f45.activeCaption!.speakerName, 'Officer Miller');

  // Frame 150 (5.0s): transitioned into scene 1 (4.5s -> 8.0s)
  const f150 = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 150);
  assert.equal(f150.sceneIndex, 1);
  assert.equal(f150.scene.id, 'scene_2_relief');
  assert.equal(f150.actors[0].evaluated.activeChannels.action, 'shrug');

  // Determinism check
  const f150Again = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 150);
  assert.deepEqual(f150, f150Again);
});

test('Master Director Prompt generator embeds user idea, pacing options, and live asset catalog IDs', () => {
  const prompt = buildMasterDirectorPrompt({
    idea: 'Two astronauts realize they locked the keys inside the rover',
    aspectRatio: '9:16',
    targetDurationSec: 25,
    tone: 'comedy',
  });

  assert.ok(prompt.includes('Two astronauts realize they locked the keys inside the rover'));
  assert.ok(prompt.includes('9:16'));
  assert.ok(prompt.includes('~25 seconds'));
  assert.ok(prompt.includes('comedy'));
  assert.ok(prompt.includes('police_uniform_001'));
  assert.ok(prompt.includes('hair_messy_001'));
  assert.ok(prompt.includes('emotionKeyframes'));
});

test('All 25 animation actions obey anatomical forward elbow limits and smooth action crossfading', () => {
  const actions = [
    'idle', 'walk', 'run', 'sprint', 'jump', 'point', 'wave', 'shrug',
    'lean_in', 'think_chin', 'nod_agree', 'desk_slam',
    'clap', 'punch', 'kick', 'dodge', 'laugh', 'cry', 'panic', 'tremble',
    'celebrate', 'facepalm', 'look_around', 'gasp', 'hold_prop',
  ] as const;

  for (const action of actions) {
    for (const f of [0, 8, 17, 29]) {
      const ev = evaluateAnimationFrame(
        f,
        30,
        {
          basePose: 'stand',
          action,
          actionIntensity: 1.0,
          speed: 1.0,
          enableBreathing: true,
          enableAutoBlink: true,
          enablePhysics: true,
        },
        { emotion: {} }
      );
      assert.ok(
        ev.pose.forearmLRot <= 16 && ev.pose.forearmRRot <= 16,
        `Action ${action} frame ${f} bent elbow backward: L=${ev.pose.forearmLRot}, R=${ev.pose.forearmRRot}`
      );
    }
  }

  // Verify smooth crossfade at scene_2_relief transition (t = 1.2s is start of celebrate after shrug)
  // Global frame 135 = 4.5s (scene 2 start), +36 frames = 1.2s (5.7s), +38 frames = 1.267s
  const beforeSwitch = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 170); // t=1.167s in scene 2 (shrug)
  const midBlend = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 174); // t=1.30s in scene 2 (0.10s into blend)
  const afterBlend = evaluateProductionFrame(SAMPLE_PRODUCTION_SCRIPT, 184); // t=1.633s in scene 2 (full celebrate)

  assert.ok(
    midBlend.actors[0].evaluated.pose.upperArmRRot < beforeSwitch.actors[0].evaluated.pose.upperArmRRot &&
      midBlend.actors[0].evaluated.pose.upperArmRRot > afterBlend.actors[0].evaluated.pose.upperArmRRot,
    'Expected smooth pose blend between shrug and celebrate instead of 1-frame snap'
  );
});

test('Speaking dialogue drives subtle head/torso acting and single-keyframe scenes still move camera smoothly', () => {
  const anim: AnimationConfig = {
    basePose: 'stand',
    action: 'idle',
    actionIntensity: 1.0,
    speed: 1.0,
    enableBreathing: true,
    enableAutoBlink: true,
    enablePhysics: true,
  };
  const silent = evaluateAnimationFrame(15, 30, anim, { emotion: { happy: 0.4 }, phoneme: 'X' });
  const speaking = evaluateAnimationFrame(15, 30, anim, { emotion: { happy: 0.4 }, phoneme: 'D' });
  assert.notEqual(
    silent.pose.headRot,
    speaking.pose.headRot,
    'Active speech phoneme should drive subtle conversational head movement'
  );

  // Single-keyframe camera should gently drift/zoom instead of staying dead frozen
  const oneKfScript = structuredClone(SAMPLE_PRODUCTION_SCRIPT);
  oneKfScript.scenes[0].cameraKeyframes = [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 }];
  const camStart = evaluateProductionFrame(oneKfScript, 0).camera;
  const camMid = evaluateProductionFrame(oneKfScript, 60).camera;
  assert.ok(camMid.zoom > camStart.zoom, 'Single-keyframe scene should gently push in');
  assert.notEqual(camMid.panX, camStart.panX, 'Single-keyframe scene should gently pan');
});

test('Master Director Prompt embeds CinemaToon 2.5D rules, 8 presets, new actions, shot modes, and Kokoro voices', () => {
  const prompt = buildMasterDirectorPrompt({
    idea: 'Two friends debate on a podcast',
    aspectRatio: '16:9',
    targetDurationSec: 30,
    tone: 'drama',
    preferredBackgrounds: ['podcast_studio', 'cafe_diner'],
    cameraStyle: 'podcast',
  });

  assert.ok(prompt.includes('CinemaToon 2.5D'));
  assert.ok(prompt.includes('lean_in'));
  assert.ok(prompt.includes('think_chin'));
  assert.ok(prompt.includes('nod_agree'));
  assert.ok(prompt.includes('desk_slam'));
  assert.ok(prompt.includes('over_shoulder_left'));
  assert.ok(prompt.includes('reaction_cut'));
  assert.ok(prompt.includes('split_screen'));
  assert.ok(prompt.includes('podcast_studio, cafe_diner'));
  assert.ok(prompt.includes('am_michael'));
  assert.ok(prompt.includes('af_heart'));
  assert.ok(prompt.includes('neighborhood_street'));
});

test('Thin outline range (0.8..1.45) and stickman characterType pass validation & metrics', () => {
  const stickChar = structuredClone(CHARACTER_PRESETS[0]);
  stickChar.characterType = 'stickman';
  stickChar.body.outlineWidth = 1.1;

  const validation = validateCharacterDefinition(stickChar, KNOWN_ASSET_IDS);
  assert.equal(validation.valid, true);
  assert.equal(validation.issues.length, 0);

  const metrics = computeBodyMetrics(stickChar.body);
  assert.ok(Math.abs(metrics.outlineWidth - 1.1) < 1e-6);
});

test('Fluid limb evaluator produces wrist follow-through wave and podcast multi-angle / split-screen shots', () => {
  const walkFrames = [0, 6, 12, 18].map((f) =>
    evaluateAnimationFrame(
      f,
      30,
      {
        basePose: 'stand',
        action: 'walk',
        actionIntensity: 1.0,
        speed: 1.0,
        enableBreathing: true,
        enableAutoBlink: true,
        enablePhysics: true,
      },
      { emotion: {} }
    )
  );
  const wristValues = new Set(walkFrames.map((ev) => Number(ev.pose.handLRot.toFixed(2))));
  assert.ok(wristValues.size >= 3, 'Walk cycle should drive overlapping wrist follow-through');

  const podcastScript = structuredClone(SAMPLE_PRODUCTION_SCRIPT);
  podcastScript.characterType = 'stickman';
  podcastScript.cameraMode = 'podcast';
  podcastScript.scenes = [
    {
      ...podcastScript.scenes[0],
      id: 'scene_podcast_1',
      background: 'podcast_studio',
      durationSec: 6.0,
      cameraKeyframes: [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 }],
      actors: podcastScript.scenes[0].actors.map((a, idx) => ({
        ...a,
        positionKeyframes: [{ timeSec: 0, x: idx === 0 ? 0.28 : 0.72, y: 0.78, scale: 1.0, facing: idx === 0 ? 1 : -1 }],
        actionTracks: [{ startSec: 0, endSec: 6.0, basePose: 'sit', type: 'idle', intensity: 0.9 }],
        emotionKeyframes: [
          { timeSec: 0, emotion: { happy: 0.5, confident: 0.4 } },
          { timeSec: 3.6, emotion: { excited: 0.9, surprised: 0.9 } },
        ],
      })),
      dialogue: [
        {
          id: 'pod_1',
          actorId: podcastScript.scenes[0].actors[0].id,
          speakerName: 'Host A',
          text: 'Welcome back to the late night show!',
          startSec: 0.5,
          endSec: 2.5,
          phonemes: [{ startSec: 0.5, endSec: 2.5, phoneme: 'D' }],
        },
        {
          id: 'pod_2',
          actorId: podcastScript.scenes[0].actors[1].id,
          speakerName: 'Guest B',
          text: 'Wait until you hear what actually happened!',
          startSec: 2.8,
          endSec: 5.5,
          phonemes: [{ startSec: 2.8, endSec: 5.5, phoneme: 'E' }],
        },
      ],
    },
  ];

  // Speaker 1 close-up angled shot during line 1 (t=1.0s, frame 30)
  const speaker1Frame = evaluateProductionFrame(podcastScript, 30);
  assert.ok(speaker1Frame.camera.zoom > 1.35, 'Podcast speaker closeup should zoom in strongly');
  assert.equal(speaker1Frame.camera.tiltDeg, 0, 'Podcast closeup should keep level broadcast camera horizon');
  const maxPanX = (1280 / 2) * (1 - 1 / speaker1Frame.camera.zoom);
  const maxPanY = (720 / 2) * (1 - 1 / speaker1Frame.camera.zoom);
  assert.ok(
    Math.abs(speaker1Frame.camera.panX) <= maxPanX + 1e-6 &&
      Math.abs(speaker1Frame.camera.panY) <= maxPanY + 1e-6,
    'Podcast camera pan must stay strictly inside stage bounds'
  );
  assert.ok(
    speaker1Frame.shotMode === 'angle_left' || speaker1Frame.shotMode === 'angle_right',
    `Expected angled closeup shot, got ${speaker1Frame.shotMode}`
  );
  assert.equal(speaker1Frame.actors[0].character.characterType, 'stickman');

  // Peak emotional reaction moment during line 2 tail (t=4.4s -> frame 132)
  const peakFrame = evaluateProductionFrame(podcastScript, 132);
  assert.equal(peakFrame.shotMode, 'split_screen', 'Peak emotional beat in podcast mode should trigger split_screen');
});

test('Expressive facial solver populates eyelid slant, visual cues, calm grounded idle, and preserves emotion during lip-sync', () => {
  const angry = solveExpression({ emotion: { angry: 0.95 } });
  const surprised = solveExpression({ emotion: { surprised: 0.95 } });
  const excited = solveExpression({ emotion: { happy: 0.9, excited: 0.9 } });
  const confused = solveExpression({ emotion: { confused: 0.9 } });
  const sad = solveExpression({ emotion: { sad: 0.95 } });

  assert.ok(angry.angerVein > 0.5 && angry.browFurrow > 0.5 && angry.lidSlantL < -0.5);
  assert.ok(angry.happyCrescentL < 0.1, 'Angry expression should keep happy crescent eyes suppressed');
  assert.ok(surprised.shockLines > 0.5);
  assert.ok(excited.sparkleLevel > 0.5 && excited.cheekSquint > 0.5);
  assert.ok(excited.happyCrescentL > 0.65, 'High joy+excitement should activate ^_^ crescent eyes');
  assert.ok(confused.confusedMarks > 0.5);
  assert.ok(sad.gloomLines > 0.4 && sad.tearLevel > 0.4 && sad.lidSlantL > 0.5);

  const happyTalking = solveExpression({ emotion: { happy: 0.9 }, phoneme: 'D' });
  const angryTalking = solveExpression({ emotion: { angry: 0.9 }, phoneme: 'D' });
  assert.ok(happyTalking.mouthCurve > 0.4, 'Smiling speech must retain upward emotional curve');
  assert.ok(angryTalking.mouthCurve < -0.4, 'Angry speech must retain downward scowl curve');

  // Grounded idle must keep hips planted and arms calm across time
  const idleCfg: AnimationConfig = {
    basePose: 'stand',
    action: 'idle',
    actionIntensity: 1.0,
    speed: 1.0,
    enableBreathing: true,
    enableAutoBlink: true,
    enablePhysics: true,
  };
  const idleA = evaluateAnimationFrame(0, 30, idleCfg, { emotion: {} });
  const idleB = evaluateAnimationFrame(35, 30, idleCfg, { emotion: {} });
  assert.equal(idleA.pose.pelvisX, 0);
  assert.equal(idleB.pose.pelvisX, 0);
  assert.ok(
    Math.abs(idleB.pose.upperArmRRot - idleA.pose.upperArmRRot) < 2.0,
    'Grounded idle should not wave arms wildly'
  );
});

test('All 4 Showcase Demos evaluate cleanly with clamped level cameras and cinematic directing', () => {
  assert.equal(PRODUCTION_DEMOS.length, 4);
  const cinematicShots = new Set<string>();

  for (const demo of PRODUCTION_DEMOS) {
    const dur = getProductionDurationSec(demo.script);
    assert.ok(dur >= 6, `Demo ${demo.label} should be at least 6s long`);
    const stageW = demo.script.aspectRatio === '9:16' ? 720 : 1280;
    const stageH = demo.script.aspectRatio === '9:16' ? 1280 : 720;
    const totalFrames = Math.max(1, Math.floor(dur * demo.script.fps));

    for (const ratio of [0, 0.25, 0.55, 0.85]) {
      const f = Math.min(totalFrames - 1, Math.floor(totalFrames * ratio));
      const ev = evaluateProductionFrame(demo.script, f);
      assert.equal(ev.camera.tiltDeg, 0, `Demo ${demo.label} frame ${f} must keep level horizon`);
      const maxX = (stageW / 2) * (1 - 1 / ev.camera.zoom);
      const maxY = (stageH / 2) * (1 - 1 / ev.camera.zoom);
      assert.ok(
        Math.abs(ev.camera.panX) <= maxX + 1e-6 && Math.abs(ev.camera.panY) <= maxY + 1e-6,
        `Demo ${demo.label} frame ${f} panned out of bounds`
      );
      if (demo.script.cameraMode === 'cinematic' || ev.scene.cameraMode === 'cinematic') {
        cinematicShots.add(ev.shotMode);
      }
    }
  }

  assert.ok(
    cinematicShots.size >= 2,
    `Expected cinematic mode demos to vary shot framing, saw: ${Array.from(cinematicShots).join(', ')}`
  );
});


