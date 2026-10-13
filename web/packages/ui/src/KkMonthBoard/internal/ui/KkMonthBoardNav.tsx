import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import { KkFlapCount } from '../../../KkFlapCount';
import { KkIconButton } from '../../../KkIconButton';
import type { KkSx } from '../../../kk-sx';

interface KkMonthBoardNavProps {
  title: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  todayLabel: string;
  onToday?: () => void;
  sx?: KkSx;
}

export const KkMonthBoardNav: FC<KkMonthBoardNavProps> = ({
  title,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  todayLabel,
  onToday,
  sx,
}) => {
  const flapTitle = title.toUpperCase();
  const today =
    onToday === undefined ? null : (
      <KkButton variant="text" size="small" onClick={onToday}>
        {todayLabel}
      </KkButton>
    );

  return (
    <Stack
      direction="row"
      data-kk-month-board-nav
      sx={[
        { alignItems: 'center', gap: 0.5, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkFlapCount value={flapTitle} variant="h3" sx={{ flexGrow: 1, minWidth: 0 }} />
      {today}
      <KkIconButton label={previousLabel} icon="back" size="small" onClick={onPrevious} />
      <KkIconButton label={nextLabel} icon="chevron" size="small" onClick={onNext} />
    </Stack>
  );
};
