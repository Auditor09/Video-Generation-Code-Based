/**
 * SpriteForge Character, Emotion, Animation & Scene Schema (v1.0.0)
 * Pure data structures for deterministic character reconstruction & validation.
 */

export const CURRENT_SCHEMA_VERSION = '1.0.0' as const;

export type HeadShape = 'oval' | 'round' | 'square' | 'pear' | 'chiseled';
export type EyeStyle = 'large_round' | 'almond' | 'sharp_narrow' | 'heavy_lidded' | 'wide_anime' | 'tired_droop';
export type BrowStyle = 'natural' | 'thick_bold' | 'arched' | 'thin_sharp' | 'bushy';
export type NoseStyle = 'rounded' | 'pointed' | 'button' | 'aquiline' | 'broad';
export type EarStyle = 'round' | 'pointed' | 'lobed' | 'gauged';

export type ScarLocation = 'left_cheek' | 'right_cheek' | 'forehead' | 'left_brow' | 'right_brow' | 'chin' | 'nose_bridge';

export interface ScarConfig {
  id: string;
  location: ScarLocation;
  angle: number; // degrees -60..60
  size: number;  // 0.5..1.8
  color: string;
}

export type TattooSurface =
  | 'forehead'
  | 'cheek_l'
  | 'cheek_r'
  | 'neck'
  | 'chest'
  | 'upper_arm_l'
  | 'forearm_l'
  | 'upper_arm_r'
  | 'forearm_r'
  | 'thigh_l'
  | 'shin_r';

export interface TattooAttachment {
  assetId: string;
  surface: TattooSurface;
  color: string;
  scale?: number;
}

export interface ColorOverride {
  main?: string;
  secondary?: string;
  highlight?: string;
}

export interface BodyConfig {
  height: number;         // 0.75 - 1.30
  headSize: number;       // 0.75 - 1.35
  shoulderWidth: number;  // 0.75 - 1.35
  torsoLength: number;    // 0.75 - 1.30
  armLength: number;      // 0.75 - 1.30
  legLength: number;      // 0.75 - 1.35
  handSize: number;       // 0.75 - 1.40
  footSize: number;       // 0.75 - 1.40
  bodyThickness: number;  // 0.65 - 1.50
  neckThickness: number;  // 0.70 - 1.40
  limbThickness: number;  // 0.65 - 1.45
  headShape: HeadShape;
  skinColor: string;
  outlineColor: string;
  outlineWidth: number;   // 1.5 - 4.0
}

export interface FaceConfig {
  eyeStyle: EyeStyle;
  eyeColor: string;
  browStyle: BrowStyle;
  noseStyle: NoseStyle;
  earStyle: EarStyle;
  mouthStyle: 'procedural';
  freckles: boolean;
  mole: 'none' | 'left_cheek' | 'right_cheek' | 'lip';
  blush: number; // 0 - 1
  darkCircles: boolean;
  eyeBags: boolean;
  wrinkles: boolean;
  splitEyebrow: 'none' | 'left' | 'right';
  missingTooth: boolean;
  crookedTeeth: boolean;
  dimples: boolean;
  facePaint: 'none' | 'eye_black' | 'war_stripes' | 'clown_star';
  scars: ScarConfig[];
}

export interface EquipmentConfig {
  hair: string;
  facialHair: string;
  headwear: string;
  eyewear: string;
  upperBody: string;
  lowerBody: string;
  footwear: string;
  piercings: string[];
  tattoos: TattooAttachment[];
  accessories: string[];
  propLeft: string;
  propRight: string;
  colorOverrides: Record<string, ColorOverride>;
}

export type CharacterType = 'cartoon' | 'stickman';

export interface CharacterDefinition {
  schemaVersion: string;
  id: string;
  name: string;
  description?: string;
  characterType?: CharacterType;
  voice?: string;
  body: BodyConfig;
  face: FaceConfig;
  equipment: EquipmentConfig;
}

export type EmotionKey =
  | 'scared'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'disgusted'
  | 'confident'
  | 'determined'
  | 'confused'
  | 'suspicious'
  | 'excited'
  | 'nervous'
  | 'embarrassed'
  | 'bored'
  | 'curious'
  | 'frustrated'
  | 'smug';

export type EmotionWeights = Partial<Record<EmotionKey, number>>;

export type BrowOverride = 'auto' | 'neutral' | 'worried' | 'angry' | 'raised' | 'skeptical' | 'sad';
export type EyeOverride = 'auto' | 'neutral' | 'wide' | 'suspicious' | 'squint' | 'closed' | 'wink_l' | 'wink_r' | 'rolled';
export type MouthOverride = 'auto' | 'neutral' | 'smile' | 'grin' | 'frown' | 'nervous_smile' | 'open_gasp' | 'grit_teeth' | 'smirk' | 'pout';

export interface FaceRegionOverrides {
  brows?: BrowOverride;
  eyes?: EyeOverride;
  mouth?: MouthOverride;
}

export type PhonemeCode = 'X' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface ExpressionInput {
  emotion: EmotionWeights;
  faceOverrides?: FaceRegionOverrides;
  phoneme?: PhonemeCode;
  gazeX?: number; // -1..1
  gazeY?: number; // -1..1
  blinkOverride?: number; // 0..1 optional manual blink
}

export type BasePoseType = 'stand' | 'crouch' | 'sit';

export type ActionType =
  | 'idle'
  | 'walk'
  | 'run'
  | 'sprint'
  | 'jump'
  | 'point'
  | 'wave'
  | 'shrug'
  | 'clap'
  | 'punch'
  | 'kick'
  | 'dodge'
  | 'laugh'
  | 'cry'
  | 'panic'
  | 'tremble'
  | 'celebrate'
  | 'facepalm'
  | 'look_around'
  | 'gasp'
  | 'hold_prop'
  | 'lean_in'
  | 'think_chin'
  | 'nod_agree'
  | 'desk_slam';

export interface AnimationConfig {
  basePose: BasePoseType;
  action: ActionType;
  actionIntensity: number; // 0..1.5
  speed: number;           // 0.25..2.5
  enableBreathing: boolean;
  enableAutoBlink: boolean;
  enablePhysics: boolean;
  handPoseLeft?: 'auto' | 'relaxed' | 'fist' | 'point' | 'open' | 'grip' | 'peace';
  handPoseRight?: 'auto' | 'relaxed' | 'fist' | 'point' | 'open' | 'grip' | 'peace';
}

export interface SceneActorSpec {
  id: string;
  characterId: string;
  character?: CharacterDefinition;
  position: { x: number; y: number }; // normalized 0..1
  scale?: number;
  facing?: 1 | -1;
  basePose: BasePoseType;
  actions: Array<{ type: ActionType; intensity?: number }>;
  emotion: EmotionWeights;
  faceOverrides?: FaceRegionOverrides;
  dialogue?: string;
}

export interface ScenePropSpec {
  id: string;
  type: 'bomb_device' | 'lab_console' | 'street_lamp' | 'wooden_crate';
  position: { x: number; y: number }; // normalized 0..1
  scale?: number;
  state?: {
    countdownSeconds?: number;
    armed?: boolean;
    wiresCut?: number[];
  };
}

export type RenderStyle = '2d_storybook' | '2.5d_parallax' | 'studio_clean';

export type BackgroundSceneId =
  | 'podcast_studio'
  | 'tv_studio'
  | 'neighborhood_street'
  | 'forest_trail'
  | 'city_street'
  | 'rooftop_night'
  | 'cozy_living_room'
  | 'cafe_diner'
  | 'office_desk'
  | 'classroom'
  | 'laboratory'
  | 'police_precinct'
  | 'studio_backdrop';

export interface SceneDefinition {
  schemaVersion: string;
  scene: string;
  background: BackgroundSceneId;
  renderStyle?: RenderStyle;
  aspectRatio: '16:9' | '9:16';
  camera: {
    zoom: number;
    panX: number;
    panY: number;
    shake: number;
  };
  actors: SceneActorSpec[];
  props: ScenePropSpec[];
}

export interface ValidationIssue {
  level: 'error' | 'warning';
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export const DEFAULT_BODY_CONFIG: BodyConfig = {
  height: 1.0,
  headSize: 1.0,
  shoulderWidth: 1.0,
  torsoLength: 1.0,
  armLength: 1.0,
  legLength: 1.0,
  handSize: 1.0,
  footSize: 1.0,
  bodyThickness: 1.0,
  neckThickness: 1.0,
  limbThickness: 1.0,
  headShape: 'oval',
  skinColor: '#F3D2B8',
  outlineColor: '#18181B',
  outlineWidth: 1.35,
};

export const DEFAULT_FACE_CONFIG: FaceConfig = {
  eyeStyle: 'large_round',
  eyeColor: '#4B3621',
  browStyle: 'natural',
  noseStyle: 'rounded',
  earStyle: 'round',
  mouthStyle: 'procedural',
  freckles: false,
  mole: 'none',
  blush: 0,
  darkCircles: false,
  eyeBags: false,
  wrinkles: false,
  splitEyebrow: 'none',
  missingTooth: false,
  crookedTeeth: false,
  dimples: false,
  facePaint: 'none',
  scars: [],
};

export const CHARACTER_PRESETS: CharacterDefinition[] = [
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_police_officer',
    name: 'Officer Miller',
    description: 'Seasoned patrol officer with steady nerves and sharp situational focus.',
    voice: 'am_adam',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 1.04,
      headSize: 1.02,
      shoulderWidth: 1.12,
      bodyThickness: 1.08,
      limbThickness: 1.05,
      headShape: 'square',
      skinColor: '#EFC8AA',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'almond',
      eyeColor: '#2B4C7E',
      browStyle: 'thick_bold',
      noseStyle: 'broad',
      earStyle: 'round',
      eyeBags: true,
    },
    equipment: {
      hair: 'hair_messy_001',
      facialHair: 'mustache_chevron_001',
      headwear: 'police_cap_001',
      eyewear: 'none',
      upperBody: 'police_uniform_001',
      lowerBody: 'police_trousers_001',
      footwear: 'black_boots_001',
      piercings: [],
      tattoos: [],
      accessories: ['watch_001', 'radio_001', 'belt_utility'],
      propLeft: 'none',
      propRight: 'flashlight',
      colorOverrides: {
        hair: { main: '#382B24', secondary: '#4F3E35', highlight: '#6B5549' },
        facialHair: { main: '#382B24', secondary: '#4F3E35' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_lab_scientist',
    name: 'Dr. Elena Vance',
    description: 'Lead quantum researcher running late-night laboratory tests.',
    voice: 'af_bella',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 0.96,
      headSize: 1.04,
      shoulderWidth: 0.88,
      bodyThickness: 0.88,
      limbThickness: 0.88,
      neckThickness: 0.88,
      headShape: 'oval',
      skinColor: '#F7D9C4',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'wide_anime',
      eyeColor: '#1E6B5B',
      browStyle: 'arched',
      noseStyle: 'pointed',
      earStyle: 'lobed',
      freckles: true,
      blush: 0.22,
    },
    equipment: {
      hair: 'hair_bun',
      facialHair: 'none',
      headwear: 'none',
      eyewear: 'round_glasses',
      upperBody: 'lab_coat',
      lowerBody: 'formal_trousers',
      footwear: 'formal_shoes',
      piercings: ['ear_stud'],
      tattoos: [],
      accessories: ['necktie'],
      propLeft: 'none',
      propRight: 'clipboard',
      colorOverrides: {
        hair: { main: '#8A3B23', secondary: '#A84B2F', highlight: '#D97757' },
        lowerBody: { main: '#27303F', secondary: '#1B222E' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_street_skater',
    name: 'Kai "Spark" Vega',
    description: 'Energetic urban courier with sharp street style and custom ink.',
    voice: 'am_fenrir',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 0.98,
      headSize: 1.06,
      shoulderWidth: 0.96,
      bodyThickness: 0.94,
      limbThickness: 0.96,
      headShape: 'chiseled',
      skinColor: '#C68C63',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'sharp_narrow',
      eyeColor: '#3A2618',
      browStyle: 'thin_sharp',
      noseStyle: 'button',
      earStyle: 'gauged',
      splitEyebrow: 'left',
      scars: [{ id: 'scar_1', location: 'right_cheek', angle: -24, size: 0.9, color: '#A36646' }],
    },
    equipment: {
      hair: 'hair_spiky',
      facialHair: 'goatee',
      headwear: 'beanie',
      eyewear: 'none',
      upperBody: 'hoodie',
      lowerBody: 'cargo_pants',
      footwear: 'sneakers',
      piercings: ['eyebrow_ring', 'ear_hoop'],
      tattoos: [
        { assetId: 'tattoo_tribal_band', surface: 'forearm_l', color: '#1F3A3D', scale: 1 },
        { assetId: 'tattoo_lightning', surface: 'neck', color: '#1F3A3D', scale: 0.9 },
      ],
      accessories: ['gold_chain', 'backpack'],
      propLeft: 'none',
      propRight: 'smartphone',
      colorOverrides: {
        hair: { main: '#1C1D24', secondary: '#2E3240', highlight: '#38BDF8' },
        headwear: { main: '#D97706', secondary: '#B45309' },
        upperBody: { main: '#1E293B', secondary: '#0F172A', highlight: '#38BDF8' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_detective_noir',
    name: 'Inspector Harlan',
    description: 'Cynical veteran investigator who reads every room like a case file.',
    voice: 'bm_george',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 1.08,
      headSize: 0.98,
      shoulderWidth: 1.15,
      torsoLength: 1.05,
      bodyThickness: 1.12,
      limbThickness: 1.08,
      headShape: 'square',
      skinColor: '#E5BA9C',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'heavy_lidded',
      eyeColor: '#475569',
      browStyle: 'bushy',
      noseStyle: 'aquiline',
      earStyle: 'round',
      darkCircles: true,
      wrinkles: true,
      scars: [{ id: 'scar_2', location: 'left_brow', angle: 18, size: 1.1, color: '#B07B5F' }],
    },
    equipment: {
      hair: 'hair_slick_back',
      facialHair: 'stubble',
      headwear: 'fedora',
      eyewear: 'none',
      upperBody: 'raincoat',
      lowerBody: 'formal_trousers',
      footwear: 'formal_shoes',
      piercings: [],
      tattoos: [],
      accessories: ['necktie', 'watch_001'],
      propLeft: 'none',
      propRight: 'coffee_cup',
      colorOverrides: {
        hair: { main: '#4B5563', secondary: '#6B7280', highlight: '#9CA3AF' },
        upperBody: { main: '#786B59', secondary: '#574C3F', highlight: '#9C8C75' },
        headwear: { main: '#44403C', secondary: '#1C1917' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_host_marcus',
    name: 'Marcus Cole',
    description: 'Charismatic late-night podcast host with razor timing and bold opinions.',
    voice: 'am_michael',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 1.02,
      headSize: 1.04,
      shoulderWidth: 1.08,
      bodyThickness: 1.02,
      limbThickness: 1.0,
      headShape: 'chiseled',
      skinColor: '#9A633E',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'almond',
      eyeColor: '#3A2618',
      browStyle: 'thick_bold',
      noseStyle: 'broad',
      earStyle: 'round',
      dimples: true,
    },
    equipment: {
      hair: 'undercut',
      facialHair: 'short_beard',
      headwear: 'headphones_head',
      eyewear: 'none',
      upperBody: 'blazer_suit',
      lowerBody: 'formal_trousers',
      footwear: 'formal_shoes',
      piercings: ['ear_stud'],
      tattoos: [],
      accessories: ['watch_001'],
      propLeft: 'none',
      propRight: 'coffee_cup',
      colorOverrides: {
        hair: { main: '#18181B', secondary: '#27272A', highlight: '#52525B' },
        facialHair: { main: '#18181B', secondary: '#27272A' },
        upperBody: { main: '#1E293B', secondary: '#0F172A', highlight: '#F59E0B' },
        headwear: { main: '#1E293B', secondary: '#F59E0B', highlight: '#FDE68A' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_producer_chloe',
    name: 'Chloe Park',
    description: 'Quick-witted creative producer who always brings the receipts.',
    voice: 'af_heart',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 0.95,
      headSize: 1.06,
      shoulderWidth: 0.9,
      bodyThickness: 0.88,
      limbThickness: 0.9,
      neckThickness: 0.88,
      headShape: 'oval',
      skinColor: '#FDE2CE',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'wide_anime',
      eyeColor: '#2563EB',
      browStyle: 'arched',
      noseStyle: 'button',
      earStyle: 'lobed',
      blush: 0.25,
      dimples: true,
    },
    equipment: {
      hair: 'ponytail',
      facialHair: 'none',
      headwear: 'none',
      eyewear: 'square_glasses',
      upperBody: 'denim_jacket',
      lowerBody: 'jeans',
      footwear: 'sneakers',
      piercings: ['ear_hoop'],
      tattoos: [],
      accessories: ['watch_001'],
      propLeft: 'none',
      propRight: 'smartphone',
      colorOverrides: {
        hair: { main: '#1C1917', secondary: '#292524', highlight: '#38BDF8' },
        upperBody: { main: '#0369A1', secondary: '#0C4A6E', highlight: '#7DD3FC' },
        footwear: { main: '#F8FAFC', secondary: '#E2E8F0', highlight: '#0EA5E9' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_cafe_barista',
    name: 'Maya Brooks',
    description: 'Espresso-fueled neighborhood barista who hears every wild story first.',
    voice: 'af_nicole',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 0.97,
      headSize: 1.05,
      shoulderWidth: 0.92,
      bodyThickness: 0.92,
      limbThickness: 0.92,
      headShape: 'round',
      skinColor: '#C68C63',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'large_round',
      eyeColor: '#4B3621',
      browStyle: 'natural',
      noseStyle: 'button',
      earStyle: 'lobed',
      freckles: true,
      blush: 0.28,
    },
    equipment: {
      hair: 'curly',
      facialHair: 'none',
      headwear: 'beanie',
      eyewear: 'round_glasses',
      upperBody: 'polo',
      lowerBody: 'cargo_pants',
      footwear: 'running_shoes',
      piercings: ['nose_stud'],
      tattoos: [{ assetId: 'tattoo_star_cluster', surface: 'forearm_r', color: '#1F3A3D', scale: 0.95 }],
      accessories: ['watch_001'],
      propLeft: 'none',
      propRight: 'coffee_cup',
      colorOverrides: {
        hair: { main: '#3F271E', secondary: '#5A382C', highlight: '#8F6448' },
        headwear: { main: '#B45309', secondary: '#78350F', highlight: '#FCD34D' },
        upperBody: { main: '#0F766E', secondary: '#115E59', highlight: '#5EEAD4' },
      },
    },
  },
  {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: 'char_professor_sterling',
    name: 'Prof. Evelyn Sterling',
    description: 'Razor-sharp academic strategist who dismantles sloppy arguments effortlessly.',
    voice: 'bf_emma',
    body: {
      ...DEFAULT_BODY_CONFIG,
      height: 1.0,
      headSize: 1.02,
      shoulderWidth: 0.94,
      bodyThickness: 0.94,
      limbThickness: 0.94,
      headShape: 'pear',
      skinColor: '#F3D2B8',
      outlineWidth: 1.35,
    },
    face: {
      ...DEFAULT_FACE_CONFIG,
      eyeStyle: 'almond',
      eyeColor: '#2E6F5E',
      browStyle: 'thin_sharp',
      noseStyle: 'aquiline',
      earStyle: 'lobed',
      wrinkles: true,
      mole: 'right_cheek',
    },
    equipment: {
      hair: 'wavy',
      facialHair: 'none',
      headwear: 'none',
      eyewear: 'monocle',
      upperBody: 'blazer_suit',
      lowerBody: 'formal_trousers',
      footwear: 'formal_shoes',
      piercings: ['ear_stud'],
      tattoos: [],
      accessories: ['scarf', 'watch_001'],
      propLeft: 'none',
      propRight: 'clipboard',
      colorOverrides: {
        hair: { main: '#6B7280', secondary: '#9CA3AF', highlight: '#E5E7EB' },
        upperBody: { main: '#4C1D95', secondary: '#2E1065', highlight: '#C4B5FD' },
        accessories: { main: '#0369A1', secondary: '#0C4A6E', highlight: '#7DD3FC' },
      },
    },
  },
];

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function validateCharacterDefinition(
  char: CharacterDefinition,
  knownAssetIds?: Set<string>
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!char.schemaVersion) {
    issues.push({ level: 'error', field: 'schemaVersion', message: 'Schema version is required.' });
  }
  if (!char.id || !char.id.trim()) {
    issues.push({ level: 'error', field: 'id', message: 'Character ID is required.' });
  }
  if (!char.name || !char.name.trim()) {
    issues.push({ level: 'error', field: 'name', message: 'Character name is required.' });
  }

  const checkRange = (val: number, min: number, max: number, field: string) => {
    if (typeof val !== 'number' || Number.isNaN(val) || val < min || val > max) {
      issues.push({
        level: 'error',
        field,
        message: `${field} must be between ${min} and ${max} (got ${val}).`,
      });
    }
  };

  checkRange(char.body.height, 0.7, 1.35, 'body.height');
  checkRange(char.body.headSize, 0.7, 1.4, 'body.headSize');
  checkRange(char.body.shoulderWidth, 0.7, 1.4, 'body.shoulderWidth');
  checkRange(char.body.torsoLength, 0.7, 1.35, 'body.torsoLength');
  checkRange(char.body.armLength, 0.7, 1.35, 'body.armLength');
  checkRange(char.body.legLength, 0.7, 1.4, 'body.legLength');
  checkRange(char.body.bodyThickness, 0.6, 1.55, 'body.bodyThickness');
  checkRange(char.body.limbThickness, 0.6, 1.5, 'body.limbThickness');

  if (!HEX_COLOR_RE.test(char.body.skinColor)) {
    issues.push({ level: 'error', field: 'body.skinColor', message: 'Invalid hex skin color.' });
  }
  if (!HEX_COLOR_RE.test(char.body.outlineColor)) {
    issues.push({ level: 'error', field: 'body.outlineColor', message: 'Invalid hex outline color.' });
  }
  if (!HEX_COLOR_RE.test(char.face.eyeColor)) {
    issues.push({ level: 'error', field: 'face.eyeColor', message: 'Invalid hex eye color.' });
  }

  if (knownAssetIds) {
    const slots: Array<[string, string]> = [
      ['equipment.hair', char.equipment.hair],
      ['equipment.facialHair', char.equipment.facialHair],
      ['equipment.headwear', char.equipment.headwear],
      ['equipment.eyewear', char.equipment.eyewear],
      ['equipment.upperBody', char.equipment.upperBody],
      ['equipment.lowerBody', char.equipment.lowerBody],
      ['equipment.footwear', char.equipment.footwear],
      ['equipment.propLeft', char.equipment.propLeft],
      ['equipment.propRight', char.equipment.propRight],
    ];
    for (const [field, id] of slots) {
      if (id && id !== 'none' && !knownAssetIds.has(id)) {
        issues.push({ level: 'warning', field, message: `Unknown asset "${id}" — falling back safely.` });
      }
    }
  }

  // Compatibility checks
  if (char.equipment.headwear === 'gas_mask' && char.equipment.eyewear !== 'none') {
    issues.push({
      level: 'warning',
      field: 'equipment.eyewear',
      message: 'Gas mask covers the face; eyewear will be occluded.',
    });
  }
  if (char.equipment.headwear === 'top_hat' && char.equipment.hair === 'hair_afro') {
    issues.push({
      level: 'warning',
      field: 'equipment.headwear',
      message: 'Large Afro volume may clip under Top Hat brim.',
    });
  }

  return {
    valid: !issues.some((i) => i.level === 'error'),
    issues,
  };
}
