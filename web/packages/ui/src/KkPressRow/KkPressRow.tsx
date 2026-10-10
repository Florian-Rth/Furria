import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { highlightMark, highlightPaint } from '../internal/highlight-paint';
import { redInk } from '../internal/red-ink';
import { rowDividerTop } from '../internal/row-divider';
import { KkIcon } from '../KkIcon';
import type { KkRegisterMarkState } from '../KkRegisterMark';
import { KkRegisterMark } from '../KkRegisterMark';
import { kkMotion } from '../kk-motion';
import { KkPressRowDot } from './KkPressRowDot';
import { KkPressRowThumb } from './KkPressRowThumb';
import type { KkPressFactTone, KkPressTone } from './press-tone';
import { pressFactInk } from './press-tone';

const ROW_STAGGER_SECONDS = 0.03;
const RISE = 8;
const SEPARATOR = '·';

export interface KkPressRowCategory {
  label: string;
  tone: KkPressTone;
}

export interface KkPressRowFact {
  text: string;
  tone: KkPressFactTone;
}

interface KkPressRowProps {
  rowId: string;
  label: string;
  state: KkRegisterMarkState;
  title: string;
  picture: string | null;
  category: KkPressRowCategory | null;
  date: string;
  fact: KkPressRowFact | null;
  highlighted: boolean;
  order: number;
  onSelect: () => void;
}

export const KkPressRow: FC<KkPressRowProps> = ({
  rowId,
  label,
  state,
  title,
  picture,
  category,
  date,
  fact,
  highlighted,
  order,
  onSelect,
}) => {
  const struck = state === 'struck';
  const dot = category === null ? null : <KkPressRowDot tone={category.tone} />;
  const placement = category === null ? date : `${category.label} ${SEPARATOR} ${date}`;
  const line = fact?.text ?? placement;
  const lineTone: KkPressFactTone = fact?.tone ?? 'muted';
  const lineWeight = fact === null ? 600 : 700;

  return (
    <Box
      component={motion.div}
      {...highlightMark(highlighted)}
      initial={{ opacity: 0, y: RISE }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...kkMotion.arrive, delay: order * ROW_STAGGER_SECONDS }}
      sx={(theme: Theme) => ({
        minWidth: 0,
        ...rowDividerTop,
        ...(highlighted ? highlightPaint(theme) : {}),
      })}
    >
      <ButtonBase
        data-kk-press-row={rowId}
        aria-label={label}
        onClick={onSelect}
        sx={(theme: Theme) => ({
          width: '100%',
          justifyContent: 'flex-start',
          textAlign: 'left',
          py: { xs: 1, desktop: 1.25 },
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover': {
              '& [data-kk-press-row-title]': redInk(theme),
              '& [data-kk-press-row-chevron]': { color: 'text.primary' },
            },
          },
        })}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', columnGap: 1.25, width: '100%', minWidth: 0 }}
        >
          <KkRegisterMark state={state} />
          <KkPressRowThumb picture={picture} struck={struck} />
          <Stack sx={{ flex: 1, minWidth: 0, rowGap: 0.25 }}>
            <Typography
              variant="h4"
              component="span"
              noWrap
              lang="de"
              data-kk-press-row-title
              sx={{
                minWidth: 0,
                color: struck ? 'text.secondary' : 'text.primary',
                textDecoration: struck ? 'line-through' : 'none',
              }}
            >
              {title}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center', columnGap: 0.625, minWidth: 0 }}>
              {dot}
              <Typography
                variant="caption"
                noWrap
                sx={(theme: Theme) => ({
                  ...pressFactInk(theme, lineTone),
                  minWidth: 0,
                  fontWeight: lineWeight,
                  fontVariantNumeric: 'tabular-nums',
                })}
              >
                {line}
              </Typography>
            </Stack>
          </Stack>
          <Box
            aria-hidden
            component="span"
            data-kk-press-row-chevron
            sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}
          >
            <KkIcon name="chevron" size="small" />
          </Box>
        </Stack>
      </ButtonBase>
    </Box>
  );
};
