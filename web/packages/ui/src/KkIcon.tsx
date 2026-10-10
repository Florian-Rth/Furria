import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CropOutlinedIcon from '@mui/icons-material/CropOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatSizeOutlinedIcon from '@mui/icons-material/FormatSizeOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import Groups2Icon from '@mui/icons-material/Groups2';
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
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
  | 'club'
  | 'clubFilled'
  | 'more'
  | 'moreFilled'
  | 'actions'
  | 'events'
  | 'live'
  | 'members'
  | 'fees'
  | 'gallery'
  | 'wardrobe'
  | 'settings'
  | 'chevron'
  | 'group'
  | 'groupFilled'
  | 'person'
  | 'role'
  | 'board'
  | 'permissions'
  | 'key'
  | 'session'
  | 'search'
  | 'add'
  | 'edit'
  | 'check'
  | 'checkCircle'
  | 'checkCircleFilled'
  | 'manage'
  | 'calendar'
  | 'calendarFilled'
  | 'phone'
  | 'mail'
  | 'send'
  | 'reminder'
  | 'handshake'
  | 'birthday'
  | 'place'
  | 'back'
  | 'bolt'
  | 'info'
  | 'alert'
  | 'offline'
  | 'archive'
  | 'qr'
  | 'fingerprint'
  | 'download'
  | 'upload'
  | 'play'
  | 'delete'
  | 'undo'
  | 'zoom'
  | 'zip'
  | 'select'
  | 'drag'
  | 'news'
  | 'bold'
  | 'link'
  | 'list'
  | 'heading'
  | 'paragraph'
  | 'mention'
  | 'crop'
  | 'image'
  | 'lock'
  | 'external';
type KkIconSize = 'small' | 'medium' | 'large';

interface KkIconProps {
  name: KkIconName;
  size?: KkIconSize;
  sx?: KkSx;
}

const iconExtents: Record<KkIconSize, string> = {
  small: '1.25rem',
  medium: '1.5rem',
  large: '2.1875rem',
};

const icons: Record<KkIconName, typeof HomeIcon> = {
  home: HomeIcon,
  logout: LogoutIcon,
  menu: MenuIcon,
  close: CloseIcon,
  visibility: VisibilityIcon,
  visibilityOff: VisibilityOffIcon,
  overview: HomeOutlinedIcon,
  club: Groups2OutlinedIcon,
  clubFilled: Groups2Icon,
  more: GridViewOutlinedIcon,
  moreFilled: GridViewIcon,
  actions: MoreHorizIcon,
  events: EventOutlinedIcon,
  live: SensorsOutlinedIcon,
  members: GroupsOutlinedIcon,
  fees: EuroOutlinedIcon,
  gallery: PhotoLibraryOutlinedIcon,
  wardrobe: CheckroomOutlinedIcon,
  settings: SettingsOutlinedIcon,
  chevron: ChevronRightIcon,
  group: Diversity3OutlinedIcon,
  groupFilled: Diversity3Icon,
  person: PersonOutlinedIcon,
  role: WorkspacePremiumOutlinedIcon,
  board: GavelOutlinedIcon,
  permissions: PolicyOutlinedIcon,
  key: KeyOutlinedIcon,
  session: AutoAwesomeOutlinedIcon,
  search: SearchOutlinedIcon,
  add: AddOutlinedIcon,
  edit: EditOutlinedIcon,
  check: CheckOutlinedIcon,
  checkCircle: CheckCircleOutlineOutlinedIcon,
  checkCircleFilled: CheckCircleIcon,
  manage: TuneOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  calendarFilled: CalendarMonthIcon,
  phone: PhoneOutlinedIcon,
  mail: MailOutlinedIcon,
  send: SendOutlinedIcon,
  reminder: NotificationsActiveOutlinedIcon,
  handshake: HandshakeOutlinedIcon,
  birthday: CakeOutlinedIcon,
  place: PlaceOutlinedIcon,
  back: ChevronLeftIcon,
  bolt: BoltOutlinedIcon,
  info: InfoOutlinedIcon,
  alert: ErrorOutlineOutlinedIcon,
  offline: CloudOffOutlinedIcon,
  archive: Inventory2OutlinedIcon,
  qr: QrCode2OutlinedIcon,
  fingerprint: FingerprintOutlinedIcon,
  download: FileDownloadOutlinedIcon,
  upload: CloudUploadOutlinedIcon,
  play: PlayArrowRoundedIcon,
  delete: DeleteOutlineOutlinedIcon,
  undo: UndoOutlinedIcon,
  zoom: ZoomInOutlinedIcon,
  zip: FolderZipOutlinedIcon,
  select: ChecklistOutlinedIcon,
  drag: DragIndicatorIcon,
  news: NewspaperOutlinedIcon,
  bold: FormatBoldIcon,
  link: LinkOutlinedIcon,
  list: FormatListBulletedIcon,
  heading: FormatSizeOutlinedIcon,
  paragraph: NotesOutlinedIcon,
  mention: AlternateEmailOutlinedIcon,
  crop: CropOutlinedIcon,
  image: ImageOutlinedIcon,
  lock: LockOutlinedIcon,
  external: OpenInNewOutlinedIcon,
};

export const KkIcon: FC<KkIconProps> = ({ name, size = 'medium', sx }) => {
  const Icon = icons[name];
  const extent = iconExtents[size];

  return (
    <Icon
      fontSize="inherit"
      data-kk-icon
      sx={[{ width: extent, height: extent }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
};
