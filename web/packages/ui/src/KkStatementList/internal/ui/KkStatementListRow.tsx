import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { rowDividerTop } from '../../../internal/row-divider';
import type { KkChipTone } from '../../../KkChip';
import { KkChip } from '../../../KkChip';
import type { KkSx } from '../../../kk-sx';

export interface KkStatementMark {
  label: string;
  tone: KkChipTone;
}

const ROW_PAINT: CSSObject = { gap: 1, py: 1.5, minWidth: 0, ...rowDividerTop };

const HEAD_FRAME: CSSObject = { alignItems: 'flex-start', gap: 1, minWidth: 0 };
const TEXT_PAINT: CSSObject = { flex: 1, minWidth: 0, fontWeight: 700, lineHeight: 1.35 };
const MARK_FRAME: CSSObject = { flexShrink: 0 };

interface KkStatementListRowProps extends PropsWithChildren {
  text: string;
  mark?: KkStatementMark | null;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkStatementListRow: FC<KkStatementListRowProps> = ({
  text,
  mark = null,
  action,
  sx,
  children,
}) => {
  const markChip =
    mark === null ? null : (
      <KkChip tone={mark.tone} size="small" sx={MARK_FRAME}>
        {mark.label}
      </KkChip>
    );

  return (
    <Stack
      component="li"
      data-kk-statement-list-row
      sx={[ROW_PAINT, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={HEAD_FRAME}>
        <Typography component="span" variant="body2" sx={TEXT_PAINT}>
          {text}
        </Typography>
        {markChip}
        {action}
      </Stack>
      {children}
    </Stack>
  );
};
