import React from 'react';
import { Composition } from 'remotion';
import defaultScript from '../../../examples/productions/bomb_defusal.production.json';
import { getProductionDurationSec } from '../../../src/engine/production/sequencer';
import { ProductionScript } from '../../../src/schemas/production.schema';
import {
  SpriteForgeComposition,
  SpriteForgeCompositionProps,
} from './SpriteForgeComposition';

const initialScript = defaultScript as unknown as ProductionScript;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpriteForgeVideo"
        component={SpriteForgeComposition}
        durationInFrames={Math.max(
          1,
          Math.round(getProductionDurationSec(initialScript) * (initialScript.fps || 30))
        )}
        fps={initialScript.fps || 30}
        width={initialScript.aspectRatio === '9:16' ? 720 : 1280}
        height={initialScript.aspectRatio === '9:16' ? 1280 : 720}
        defaultProps={{ script: initialScript }}
        calculateMetadata={({ props }: { props: SpriteForgeCompositionProps }) => {
          const s = props.script ?? initialScript;
          const fps = Math.max(1, s.fps || 30);
          const totalSec = getProductionDurationSec(s);
          return {
            durationInFrames: Math.max(1, Math.round(totalSec * fps)),
            fps,
            width: s.aspectRatio === '9:16' ? 720 : 1280,
            height: s.aspectRatio === '9:16' ? 1280 : 720,
          };
        }}
      />
    </>
  );
};
