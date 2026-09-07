import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';

export type KkIconName = 'home' | 'logout' | 'menu' | 'close' | 'visibility' | 'visibilityOff';
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
};

export const KkIcon: FC<KkIconProps> = ({ name, size = 'medium', sx }) => {
  const Icon = icons[name];

  return <Icon fontSize={size} data-kk-icon sx={sx} />;
};
