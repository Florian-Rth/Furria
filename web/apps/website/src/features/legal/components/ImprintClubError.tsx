import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const CLUB_ERROR_TITLE = 'VEREINSANGABEN FEHLEN GERADE.';
const CLUB_ERROR_TEXT =
  'Die Angaben zum Verein konnten nicht geladen werden. Versuch es gleich noch einmal.';
const CLUB_ERROR_RETRY = 'Erneut laden';

interface ImprintClubErrorProps {
  onRetry: () => void;
}

export const ImprintClubError: FC<ImprintClubErrorProps> = ({ onRetry }) => (
  <KkErrorState
    title={CLUB_ERROR_TITLE}
    description={CLUB_ERROR_TEXT}
    action={<KkButton onClick={onRetry}>{CLUB_ERROR_RETRY}</KkButton>}
  />
);
