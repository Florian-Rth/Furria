import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CastleOutlinedIcon from '@mui/icons-material/CastleOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SportsBarOutlinedIcon from '@mui/icons-material/SportsBarOutlined';
import SportsOutlinedIcon from '@mui/icons-material/SportsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import TheaterComedyOutlinedIcon from '@mui/icons-material/TheaterComedyOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import type { ComponentType, FC } from 'react';
import type { KkClubIcon } from './internal/club-icon';
import {
  ChainGlyph,
  ChildCrownGlyph,
  CrownGlyph,
  DrumGlyph,
  JesterCapGlyph,
  JingleBellGlyph,
  LaurelGlyph,
  QuillGlyph,
  ScepterGlyph,
  ViceCrownGlyph,
} from './internal/club-icon-drawn';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';

interface GlyphProps {
  sx?: KkSx;
}

const glyphs: Record<KkClubIcon, ComponentType<GlyphProps>> = {
  crown: CrownGlyph,
  scepter: ScepterGlyph,
  jesterCap: JesterCapGlyph,
  chain: ChainGlyph,
  viceCrown: ViceCrownGlyph,
  childCrown: ChildCrownGlyph,
  laurel: LaurelGlyph,
  quill: QuillGlyph,
  jingleBell: JingleBellGlyph,
  medal: WorkspacePremiumOutlinedIcon,
  gavel: GavelOutlinedIcon,
  briefcase: WorkOutlineOutlinedIcon,
  ledger: MenuBookOutlinedIcon,
  castle: CastleOutlinedIcon,
  diamond: DiamondOutlinedIcon,
  handshake: HandshakeOutlinedIcon,
  child: ChildCareOutlinedIcon,
  confetti: CelebrationOutlinedIcon,
  rocket: RocketLaunchOutlinedIcon,
  euro: EuroOutlinedIcon,
  bolt: BoltOutlinedIcon,
  shield: ShieldOutlinedIcon,
  camera: PhotoCameraOutlinedIcon,
  sparkle: AutoAwesomeOutlinedIcon,
  mic: MicOutlinedIcon,
  musicNote: MusicNoteOutlinedIcon,
  drum: DrumGlyph,
  mask: TheaterComedyOutlinedIcon,
  megaphone: CampaignOutlinedIcon,
  star: StarBorderOutlinedIcon,
  trophy: EmojiEventsOutlinedIcon,
  flag: FlagOutlinedIcon,
  key: KeyOutlinedIcon,
  shirt: CheckroomOutlinedIcon,
  pen: EditOutlinedIcon,
  wrench: BuildOutlinedIcon,
  palette: PaletteOutlinedIcon,
  heart: FavoriteBorderOutlinedIcon,
  mug: SportsBarOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  whistle: SportsOutlinedIcon,
  broom: KkBroomMark,
};

const FILL = { display: 'block', width: '100%', height: '100%', flexShrink: 0 } as const;

interface KkClubIconGlyphProps {
  icon: KkClubIcon;
  sx?: KkSx;
}

export const KkClubIconGlyph: FC<KkClubIconGlyphProps> = ({ icon, sx }) => {
  const Glyph = glyphs[icon];

  return <Glyph sx={[FILL, ...(Array.isArray(sx) ? sx : [sx])]} />;
};
