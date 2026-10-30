import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHeading } from '@furria/ui/KkHeading';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { LiveLine } from '@/features/live/schemas';
import { toBlockEyebrow } from '../heute-b-copy';
import { HeutePeople } from './HeutePeople';

type BlockLevel = 1 | 3;

interface HeuteActBlockProps {
  title: string;
  line: LiveLine;
  number: number;
  total: number;
  level: BlockLevel;
  aside?: ReactNode;
}

export const HeuteActBlock: FC<HeuteActBlockProps> = ({
  title,
  line,
  number,
  total,
  level,
  aside = null,
}) => {
  const eyebrow = toBlockEyebrow(title, number, total);

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <Stack sx={{ minWidth: 0 }}>
        <KkEyebrow tone="muted">{eyebrow}</KkEyebrow>
        <KkHeading level={level} component="h2">
          {line.name}
        </KkHeading>
      </Stack>
      {aside}
      <HeutePeople line={line} />
    </Stack>
  );
};
