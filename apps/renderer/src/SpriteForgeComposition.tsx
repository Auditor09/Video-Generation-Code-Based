import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ProductionStage } from '../../../src/engine/production/ProductionStage';
import { ProductionScript } from '../../../src/schemas/production.schema';

export interface SpriteForgeCompositionProps {
  script: ProductionScript;
}

export const SpriteForgeComposition: React.FC<SpriteForgeCompositionProps> = ({
  script,
}) => {
  const frame = useCurrentFrame();
  const fps = Math.max(1, script.fps || 30);

  let sceneStartFrame = 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ProductionStage script={script} frame={frame} />

      {/* Synchronized Dialogue Audio Tracks */}
      {script.scenes.map((scene) => {
        const startF = sceneStartFrame;
        const durF = Math.max(1, Math.round(scene.durationSec * fps));
        sceneStartFrame += durF;

        return scene.dialogue
          .filter((d) => Boolean(d.audioFile))
          .map((line) => {
            const lineFrom = startF + Math.round(line.startSec * fps);
            const lineDur = Math.max(1, Math.round((line.endSec - line.startSec) * fps));
            const src = line.audioFile!.startsWith('http')
              ? line.audioFile!
              : staticFile(line.audioFile!.replace(/^\//, ''));
            return (
              <Sequence key={line.id} from={lineFrom} durationInFrames={lineDur}>
                <Audio src={src} />
              </Sequence>
            );
          });
      })}

      {/* Background Music Track */}
      {script.musicTrack?.file && (
        <Audio
          src={
            script.musicTrack.file.startsWith('http')
              ? script.musicTrack.file
              : staticFile(script.musicTrack.file.replace(/^\//, ''))
          }
          volume={script.musicTrack.volume}
        />
      )}
    </div>
  );
};
