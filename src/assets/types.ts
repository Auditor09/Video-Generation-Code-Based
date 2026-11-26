/**
 * SpriteForge Modular SVG Asset System Types
 */

export type AssetCategory =
  | 'hair'
  | 'facialHair'
  | 'headwear'
  | 'eyewear'
  | 'upperBody'
  | 'lowerBody'
  | 'footwear'
  | 'piercing'
  | 'tattoo'
  | 'accessory'
  | 'prop';

export type AttachmentPoint =
  | 'head'
  | 'neck'
  | 'torso'
  | 'pelvis'
  | 'upperArmL'
  | 'forearmL'
  | 'handL'
  | 'upperArmR'
  | 'forearmR'
  | 'handR'
  | 'thighL'
  | 'shinL'
  | 'footL'
  | 'thighR'
  | 'shinR'
  | 'footR';

export type LayerSlot =
  | 'behind_body'
  | 'hair_back'
  | 'headwear_back'
  | 'clothing_lower'
  | 'clothing_upper'
  | 'footwear'
  | 'tattoo'
  | 'facial_hair'
  | 'hair_front'
  | 'eyewear'
  | 'headwear_front'
  | 'piercing'
  | 'accessory'
  | 'prop';

export interface AssetColorTokens {
  main: string;
  secondary: string;
  highlight: string;
}

export interface AssetPhysicsSpec {
  enabled: boolean;
  stiffness: number;
  damping: number;
  maxSwingDeg?: number;
}

export interface AssetDefinition {
  id: string;
  name: string;
  category: AssetCategory;
  attachment: AttachmentPoint;
  layer: LayerSlot;
  defaultColors: AssetColorTokens;
  physics?: AssetPhysicsSpec;
  hasBackLayer?: boolean;
  compatibilityNotes?: string;
}

export interface ResolvedColors extends AssetColorTokens {
  outline: string;
  outlineWidth: number;
  skin: string;
  skinShadow: string;
}
