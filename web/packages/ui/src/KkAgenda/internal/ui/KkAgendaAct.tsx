import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { agendaRowDelayOf } from '../logic/agenda-motion';

const ROW_RISE = 10;
const ARRIVE = { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] } as const;
const SETTLED = { opacity: 1, y: 0 } as const;
const DIMMED_OPACITY = 0.62;

const actPaint = (dimmed: boolean): CSSObject => ({
  minWidth: 0,
  listStyle: 'none',
  borderTopWidth: kkTokens.line.hair,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  '&:first-of-type': { borderTopWidth: 0 },
  opacity: dimmed ? DIMMED_OPACITY : 1,
});

const headPaint = (theme: Theme): CSSObject => ({
  minHeight: kkTokens.tapTarget,
  alignItems: 'center',
  gap: 1,
  py: 0.75,
  minWidth: 0,
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover [data-kk-agenda-act-name]': redInk(theme) },
});

const HINT_PAINT: CSSObject = {
  flexShrink: 0,
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  color: 'text.primary',
};

interface KkAgendaActProps extends PropsWithChildren {
  name: string;
  meta: string | null;
  hint: string | null;
  icon: KkIconName;
  dimmed: boolean;
  order: number;
  component: ElementType;
  to: string;
  search?: Record<string, string | number>;
}

export const KkAgendaAct: FC<KkAgendaActProps> = ({
  name,
  meta,
  hint,
  icon,
  dimmed,
  order,
  component,
  to,
  search,
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const initial = reducedMotion ? false : { opacity: 0, y: ROW_RISE };
  const metaLine =
    meta === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        {meta}
      </Typography>
    );
  const hintLine =
    hint === null ? null : (
      <Typography component="span" variant="caption" sx={HINT_PAINT}>
        {hint}
      </Typography>
    );
  const searchProps = search === undefined ? {} : { search };
  const rows =
    children === undefined || children === null ? null : (
      <Stack component="ol" sx={{ m: 0, p: 0, pb: 0.5, minWidth: 0 }}>
        {children}
      </Stack>
    );

  return (
    <Stack
      component={motion.li}
      initial={initial}
      animate={SETTLED}
      transition={{ ...ARRIVE, delay: agendaRowDelayOf(order) }}
      data-kk-agenda-act
      sx={actPaint(dimmed)}
    >
      <Stack component={component} to={to} {...searchProps} direction="row" sx={headPaint}>
        <KkIcon name={icon} size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="h3"
            variant="h4"
            data-kk-agenda-act-name
            sx={{ letterSpacing: kkTokens.type.tracking.display, lineHeight: 1.25, minWidth: 0 }}
          >
            {name}
          </Typography>
          {metaLine}
        </Stack>
        {hintLine}
        <KkIcon name="chevron" size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      </Stack>
      {rows}
    </Stack>
  );
};
