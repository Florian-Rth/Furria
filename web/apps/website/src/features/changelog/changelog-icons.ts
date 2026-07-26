import Campaign from '@mui/icons-material/Campaign';
import Groups from '@mui/icons-material/Groups';
import Home from '@mui/icons-material/Home';
import Newspaper from '@mui/icons-material/Newspaper';
import Palette from '@mui/icons-material/Palette';
import Smartphone from '@mui/icons-material/Smartphone';
import type SvgIcon from '@mui/material/SvgIcon';

export const CHANGELOG_ICON_KEYS = [
  'palette',
  'campaign',
  'smartphone',
  'home',
  'groups',
  'newspaper',
] as const;

export type ChangelogIconKey = (typeof CHANGELOG_ICON_KEYS)[number];

export const CHANGELOG_ICONS: Record<ChangelogIconKey, typeof SvgIcon> = {
  palette: Palette,
  campaign: Campaign,
  smartphone: Smartphone,
  home: Home,
  groups: Groups,
  newspaper: Newspaper,
};
