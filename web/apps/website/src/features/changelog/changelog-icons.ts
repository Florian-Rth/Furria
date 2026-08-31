import Campaign from '@mui/icons-material/Campaign';
import ConfirmationNumber from '@mui/icons-material/ConfirmationNumber';
import Groups from '@mui/icons-material/Groups';
import Home from '@mui/icons-material/Home';
import HowToReg from '@mui/icons-material/HowToReg';
import Newspaper from '@mui/icons-material/Newspaper';
import Palette from '@mui/icons-material/Palette';
import PhotoLibrary from '@mui/icons-material/PhotoLibrary';
import Smartphone from '@mui/icons-material/Smartphone';
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import type SvgIcon from '@mui/material/SvgIcon';

export const CHANGELOG_ICON_KEYS = [
  'palette',
  'campaign',
  'smartphone',
  'home',
  'groups',
  'newspaper',
  'photos',
  'membership',
  'tickets',
  'exchange',
] as const;

export type ChangelogIconKey = (typeof CHANGELOG_ICON_KEYS)[number];

export const CHANGELOG_ICONS: Record<ChangelogIconKey, typeof SvgIcon> = {
  palette: Palette,
  campaign: Campaign,
  smartphone: Smartphone,
  home: Home,
  groups: Groups,
  newspaper: Newspaper,
  photos: PhotoLibrary,
  membership: HowToReg,
  tickets: ConfirmationNumber,
  exchange: SwapHoriz,
};
