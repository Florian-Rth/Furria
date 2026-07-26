import CardActionArea from '@mui/material/CardActionArea';
import { KkCardBody } from './internal/layout/KkCardBody';
import { KkCardFooter } from './internal/layout/KkCardFooter';
import { KkCardMedia } from './internal/layout/KkCardMedia';
import { KkCardMeta } from './internal/layout/KkCardMeta';
import { KkCardRoot } from './internal/layout/KkCardRoot';
import { KkCardBadge } from './internal/ui/KkCardBadge';
import { KkCardText } from './internal/ui/KkCardText';
import { KkCardTitle } from './internal/ui/KkCardTitle';

export const KkCard = Object.assign(KkCardRoot, {
  Action: CardActionArea,
  Media: KkCardMedia,
  Badge: KkCardBadge,
  Body: KkCardBody,
  Meta: KkCardMeta,
  Title: KkCardTitle,
  Text: KkCardText,
  Footer: KkCardFooter,
});
