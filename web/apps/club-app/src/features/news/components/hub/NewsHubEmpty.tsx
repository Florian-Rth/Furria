import { KkButton, KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { HUB_EMPTY_DESCRIPTION, HUB_EMPTY_TITLE } from '../../hub-copy';
import { NEW_POST_LABEL } from '../../news-copy';

interface NewsHubEmptyProps {
  onCreate: () => void;
}

export const NewsHubEmpty: FC<NewsHubEmptyProps> = ({ onCreate }) => {
  const action = <KkButton onClick={onCreate}>{NEW_POST_LABEL}</KkButton>;

  return (
    <KkEmptyState title={HUB_EMPTY_TITLE} description={HUB_EMPTY_DESCRIPTION} action={action} />
  );
};
