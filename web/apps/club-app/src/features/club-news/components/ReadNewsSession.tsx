import { KkNewsRowList } from '@furria/ui/KkNewsRowList';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import type { ReadNewsSessionView } from '../read-news';
import { ReadNewsRow } from './ReadNewsRow';

interface ReadNewsSessionProps {
  session: ReadNewsSessionView;
}

export const ReadNewsSession: FC<ReadNewsSessionProps> = ({ session }) => {
  const rows = session.posts.map((post) => <ReadNewsRow key={post.slug} post={post} />);

  return (
    <KkPanelSection title={session.title}>
      <KkNewsRowList fit="column">{rows}</KkNewsRowList>
    </KkPanelSection>
  );
};
