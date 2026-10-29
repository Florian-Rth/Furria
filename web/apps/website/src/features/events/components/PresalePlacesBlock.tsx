import { KkSection } from '@furria/ui/KkSection';
import { kkTokens } from '@furria/ui/tokens';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import { presalePlacesAnchorId } from '@/features/events/event-detail-content';
import {
  derivePresalePlaces,
  presalePlacesHeadingOf,
} from '@/features/events/presale-places-display';
import type { EventDetail } from '@/lib/public-events/schemas';
import { PresalePlaceList } from './PresalePlaceList';

const PRESALE_KICKER = 'VORVERKAUF';

const blockSx = (theme: Theme) => ({
  display: { desktop: 'none' },
  scrollMarginTop: `calc(var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px) + ${theme.spacing(kkTokens.layout.mastheadClearance)})`,
});

interface PresalePlacesBlockProps {
  event: EventDetail;
}

export const PresalePlacesBlock: FC<PresalePlacesBlockProps> = ({ event }) => {
  const presalePlaces = derivePresalePlaces(event);
  if (presalePlaces === null) {
    return null;
  }

  const title = presalePlacesHeadingOf(presalePlaces.opensAt).toUpperCase();

  return (
    <KkSection id={presalePlacesAnchorId} sx={blockSx}>
      <KkSection.Header kicker={PRESALE_KICKER} title={title} />
      <PresalePlaceList places={presalePlaces.places} />
    </KkSection>
  );
};
