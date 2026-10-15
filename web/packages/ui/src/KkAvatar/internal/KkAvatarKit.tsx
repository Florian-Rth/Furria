import { KkHonourSpot } from '../../internal/honours/layout/KkHonourSpot';
import { KkHonourCoin } from '../../internal/honours/ui/KkHonourCoin';
import { KkHonourForgeChip } from '../../internal/honours/ui/KkHonourForgeChip';
import { KkHonourMetal } from '../../internal/honours/ui/KkHonourMetal';
import { KkHonourMetalDefs } from '../../internal/honours/ui/KkHonourMetalDefs';
import { KkHonourSash } from '../../internal/honours/ui/KkHonourSash';
import { KkHonourSashButton } from '../../internal/honours/ui/KkHonourSashButton';
import { KkAvatarCanvas } from './layout/KkAvatarCanvas';
import { KkAvatarFrame } from './layout/KkAvatarFrame';
import { KkAvatarFace } from './ui/KkAvatarFace';
import { KkAvatarStanding } from './ui/KkAvatarStanding';
import { KkAvatarStandingDot } from './ui/KkAvatarStandingDot';

export const KkAvatarKit = Object.assign(KkAvatarFrame, {
  Face: KkAvatarFace,
  Canvas: KkAvatarCanvas,
  MetalDefs: KkHonourMetalDefs,
  Standing: KkAvatarStanding,
  StandingDot: KkAvatarStandingDot,
  Sash: KkHonourSash,
  Metal: KkHonourMetal,
  ForgeChip: KkHonourForgeChip,
  Spot: KkHonourSpot,
  Coin: KkHonourCoin,
  SashButton: KkHonourSashButton,
});
