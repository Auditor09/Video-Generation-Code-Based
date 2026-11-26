/**
 * Unified Asset Registry & Token Color Resolver
 */

import { ColorOverride } from '../schemas/character.schema';
import {
  ACCESSORY_ASSETS,
  EYEWEAR_ASSETS,
  HEADWEAR_ASSETS,
  PIERCING_ASSETS,
  PROP_ASSETS,
  TATTOO_ASSETS,
} from './accessoriesCatalog';
import { FACIAL_HAIR_ASSETS } from './facialHairCatalog';
import { HAIR_ASSETS } from './hairCatalog';
import { AssetCategory, AssetColorTokens, AssetDefinition } from './types';
import { FOOTWEAR_ASSETS, LOWER_BODY_ASSETS, UPPER_BODY_ASSETS } from './wardrobeCatalog';

export const ALL_ASSETS: AssetDefinition[] = [
  ...HAIR_ASSETS,
  ...FACIAL_HAIR_ASSETS,
  ...HEADWEAR_ASSETS,
  ...EYEWEAR_ASSETS,
  ...UPPER_BODY_ASSETS,
  ...LOWER_BODY_ASSETS,
  ...FOOTWEAR_ASSETS,
  ...PIERCING_ASSETS,
  ...TATTOO_ASSETS,
  ...ACCESSORY_ASSETS,
  ...PROP_ASSETS,
];

export const ASSET_MAP: Map<string, AssetDefinition> = new Map(
  ALL_ASSETS.map((a) => [a.id, a])
);

export const KNOWN_ASSET_IDS: Set<string> = new Set(ALL_ASSETS.map((a) => a.id));

export function getAssetById(id: string): AssetDefinition | undefined {
  return ASSET_MAP.get(id);
}

export function getAssetsByCategory(category: AssetCategory): AssetDefinition[] {
  return ALL_ASSETS.filter((a) => a.category === category);
}

export function resolveAssetColors(
  assetId: string,
  slotKey: string,
  overrides: Record<string, ColorOverride> | undefined
): AssetColorTokens {
  const asset = ASSET_MAP.get(assetId);
  const defaults: AssetColorTokens = asset?.defaultColors ?? {
    main: '#334155',
    secondary: '#1E293B',
    highlight: '#94A3B8',
  };
  const ov = overrides?.[slotKey];
  if (!ov) return defaults;
  return {
    main: ov.main || defaults.main,
    secondary: ov.secondary || defaults.secondary,
    highlight: ov.highlight || defaults.highlight,
  };
}
