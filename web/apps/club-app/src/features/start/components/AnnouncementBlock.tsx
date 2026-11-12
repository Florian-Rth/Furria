import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AnnouncementText } from '@/features/announcements/components/AnnouncementText';
import type { AnnouncementSheetBlock } from '../hooks/use-announcements-sheet';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';

interface AnnouncementBlockProps {
  block: AnnouncementSheetBlock;
}

export const AnnouncementBlock: FC<AnnouncementBlockProps> = ({ block }) => {
  const scrollTarget = useScrollIntoView(block.focused);
  const rule = block.ruled ? <KkRule weight="hair" /> : null;

  return (
    <Stack component="article" ref={scrollTarget} sx={{ gap: 1, minWidth: 0 }}>
      {rule}
      <KkHeading level={4} component="h3">
        {block.announcement.title}
      </KkHeading>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}>
        <KkAvatar initials={block.initials} image={block.portrait} size="small" />
        <KkMeta>{block.byline}</KkMeta>
      </Stack>
      <AnnouncementText body={block.announcement.body} mentions={block.announcement.mentions} />
    </Stack>
  );
};
