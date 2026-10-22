import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import type { FC } from 'react';
import { useSystemStatus } from '../hooks/use-system-status';
import { HEADER_EYEBROW, SECTION_TITLES } from '../system-copy';
import { areaHeaderOf } from '../system-view';
import type { SystemArea } from '../types';

interface SystemAreaHeaderProps {
  area: SystemArea;
}

export const SystemAreaHeader: FC<SystemAreaHeaderProps> = ({ area }) => {
  const read = useSystemStatus();

  if (read.kind === 'loading') {
    return <KkScreenHeaderSkeleton />;
  }

  const title = (
    <KkScreenHeader.Title transform="none">{SECTION_TITLES[area]}</KkScreenHeader.Title>
  );

  if (read.kind !== 'shown') {
    return (
      <KkScreenHeader>
        <KkScreenHeader.Text>
          <KkEyebrow tone="accent">{HEADER_EYEBROW}</KkEyebrow>
          {title}
        </KkScreenHeader.Text>
      </KkScreenHeader>
    );
  }

  const header = areaHeaderOf(read.status, read.moment, area);

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{HEADER_EYEBROW}</KkEyebrow>
        {title}
        <KkScreenHeader.Meta>
          <KkChip tone={header.tone} dot>
            {header.word}
          </KkChip>
          <KkMeta>{header.line}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
