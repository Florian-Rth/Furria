import { KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { sessionYearsLabelOf } from '@/lib/club';
import { DRAFTS_TITLE } from '../../hub-copy';
import type { HubSection } from '../../hub-view';
import { sectionMetaOf } from './hub-lines';
import { NewsHubRow } from './NewsHubRow';

const ROWS_PER_SECTION_STAGGER = 4;

interface NewsHubSectionProps {
  section: HubSection;
  order: number;
  highlightedId: string | null;
  onOpen: (postId: string) => void;
}

export const NewsHubSection: FC<NewsHubSectionProps> = ({
  section,
  order,
  highlightedId,
  onOpen,
}) => {
  const title = section.startYear === null ? DRAFTS_TITLE : sessionYearsLabelOf(section.startYear);
  const meta = sectionMetaOf(section);
  const rows = section.rows.map((row, index) => (
    <NewsHubRow
      key={row.id}
      row={row}
      order={order * ROWS_PER_SECTION_STAGGER + index}
      highlighted={String(row.id) === highlightedId}
      onOpen={onOpen}
    />
  ));

  return (
    <KkPanelSection title={title} meta={meta}>
      <KkPanel variant="list">{rows}</KkPanel>
    </KkPanelSection>
  );
};
