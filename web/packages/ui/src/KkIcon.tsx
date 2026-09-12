import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
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
  | 'chevron'
  | 'group'
  | 'person'
  | 'role'
  | 'permissions'
  | 'search'
  | 'add'
  | 'edit'
  | 'check'
  | 'manage'
  | 'calendar'
  | 'phone'
  | 'mail'
  | 'place'
  | 'back'
  | 'bolt'
  | 'info'
  | 'alert'
  | 'archive';
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
  group: Diversity3OutlinedIcon,
  person: PersonOutlinedIcon,
  role: WorkspacePremiumOutlinedIcon,
  permissions: KeyOutlinedIcon,
  search: SearchOutlinedIcon,
  add: AddOutlinedIcon,
  edit: EditOutlinedIcon,
  check: CheckOutlinedIcon,
  manage: TuneOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  phone: PhoneOutlinedIcon,
  mail: MailOutlinedIcon,
  place: PlaceOutlinedIcon,
  back: ChevronLeftIcon,
  bolt: BoltOutlinedIcon,
  info: InfoOutlinedIcon,
  alert: ErrorOutlineOutlinedIcon,
  archive: Inventory2OutlinedIcon,
};

export const KkIcon: FC<KkIconProps> = ({ name, size = 'medium', sx }) => {
  const Icon = icons[name];

  return <Icon fontSize={size} data-kk-icon sx={sx} />;
};
