import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';

export type KkIconName =
  | 'home'
  | 'logout'
  | 'menu'
  | 'close'
  | 'visibility'
  | 'visibilityOff'
  | 'overview'
  | 'events'
  | 'live'
  | 'members'
  | 'fees'
  | 'gallery'
  | 'wardrobe'
  | 'settings'
  | 'chevron';
type KkIconSize = 'small' | 'medium' | 'large';

interface KkIconProps {
  name: KkIconName;
  size?: KkIconSize;
  sx?: KkSx;
}

const icons: Record<KkIconName, typeof HomeIcon> = {
  home: HomeIcon,
  logout: LogoutIcon,
  menu: MenuIcon,
  close: CloseIcon,
  visibility: VisibilityIcon,
  visibilityOff: VisibilityOffIcon,
  overview: HomeOutlinedIcon,
  events: EventOutlinedIcon,
  live: SensorsOutlinedIcon,
  members: GroupsOutlinedIcon,
  fees: EuroOutlinedIcon,
  gallery: PhotoLibraryOutlinedIcon,
  wardrobe: CheckroomOutlinedIcon,
  settings: SettingsOutlinedIcon,
  chevron: ChevronRightIcon,
};

export const KkIcon: FC<KkIconProps> = ({ name, size = 'medium', sx }) => {
  const Icon = icons[name];

  return <Icon fontSize={size} data-kk-icon sx={sx} />;
};
