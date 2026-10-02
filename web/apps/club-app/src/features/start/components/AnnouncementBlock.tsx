import { KkAvatar, KkHeading, KkMeta, KkRule, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AnnouncementSheetBlock } from '../hooks/use-announcements-sheet';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';

const PRE_LINE = { whiteSpace: 'pre-line' } as const;

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
        <KkAvatar initials={block.initials} source={block.portrait} size="small" />
        <KkMeta>{block.byline}</KkMeta>
      </Stack>
      <KkText variant="body2" measure="lead" sx={PRE_LINE}>
        {block.announcement.body}
      </KkText>
    </Stack>
  );
};
