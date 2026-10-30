import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import { kkTokens } from '../../../tokens';

const headPaint = (lead: boolean): CSSObject => ({
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.section,
  textTransform: 'uppercase',
  color: lead ? 'text.primary' : 'text.secondary',
});

interface KkAgendaWeekProps extends PropsWithChildren {
  title: string;
  meta?: string;
  lead?: boolean;
}

export const KkAgendaWeek: FC<KkAgendaWeekProps> = ({ title, meta, lead = false, children }) => {
  const headId = useId();
  const metaLine =
    meta === undefined ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{ color: 'text.disabled', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
      >
        {meta}
      </Typography>
    );

  return (
    <Stack component="section" aria-labelledby={headId} data-kk-agenda-week sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1, pb: 0.25, minWidth: 0 }}
      >
        <Typography id={headId} component="h2" variant="caption" sx={headPaint(lead)}>
          {title}
        </Typography>
        {metaLine}
      </Stack>
      <Stack component="ol" sx={{ m: 0, p: 0, minWidth: 0 }}>
        {children}
      </Stack>
    </Stack>
  );
};
