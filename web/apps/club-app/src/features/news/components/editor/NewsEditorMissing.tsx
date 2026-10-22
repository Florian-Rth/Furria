import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NEWS_ORIGIN, NEWS_PATH, NEWS_TITLE } from '@/features/session/app-sections';
import { MISSING_BACK, MISSING_TEXT, MISSING_TITLE } from '../../editor-copy';

export const NewsEditorMissing: FC = () => {
  const back = (
    <KkButton variant="outlined" component={Link} to={NEWS_PATH}>
      {MISSING_BACK}
    </KkButton>
  );

  return (
    <KkScreen kind="fullscreen" title={NEWS_TITLE} origin={NEWS_ORIGIN}>
      <KkEmptyState title={MISSING_TITLE} description={MISSING_TEXT} action={back} />
    </KkScreen>
  );
};
