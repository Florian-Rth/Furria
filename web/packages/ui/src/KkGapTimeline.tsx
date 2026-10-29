import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import { inkWashSurface } from './internal/ink-wash';
import { redInk } from './internal/red-ink';
import {
  figures,
  goldWashSurface,
  NUMBER_WIDTH,
  redWashSurface,
} from './KkNumberedList/internal/ui/numbered-list-paint';
import { KkSeverityGlyph } from './KkSeverityGlyph';
import { kkTokens } from './tokens';

export type KkGapState = 'conflict' | 'hint' | 'fine';

export type KkGapTimelineItem =
  | {
      type: 'stop';
      id: string;
      number: string;
      title: string;
      mark?: ReactNode;
      selected?: boolean;
    }
  | { type: 'gap'; id: string; state: KkGapState; text: string };

interface KkGapTimelineProps {
  label: string;
  items: readonly KkGapTimelineItem[];
  openLabel: string;
  onOpen: (id: string) => void;
}

const COLUMN_GAP = 1.25;

const gapWash = (theme: Theme, state: KkGapState): CSSObject => {
  switch (state) {
    case 'conflict':
      return { ...redWashSurface(theme, '8%', '16%'), ...redInk(theme) };
    case 'hint':
      return { ...goldWashSurface(theme, '9%', '13%'), ...goldInkOf(theme) };
    case 'fine':
      return { color: 'text.secondary' };
  }
};

const stopPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: COLUMN_GAP,
    py: 0.75,
    pr: 1,
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.base}px`,
    ...(selected ? inkWashSurface(theme, '6%', '10%') : {}),
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover [data-kk-gap-timeline-title]': redInk(theme),
    },
  });

const connector: CSSObject = {
  width: kkTokens.line.section,
  height: '1.125rem',
  bgcolor: 'divider',
  mr: '0.4rem',
};

export const KkGapTimeline: FC<KkGapTimelineProps> = ({ label, items, openLabel, onOpen }) => {
  const rows = items.map((item) => {
    if (item.type === 'gap') {
      const glyph =
        item.state === 'fine' ? (
          <Box component="span" aria-hidden sx={connector} />
        ) : (
          <KkSeverityGlyph state={item.state} size="medium" />
        );

      return (
        <Stack
          key={item.id}
          component="li"
          direction="row"
          data-kk-gap-timeline-gap={item.state}
          sx={(theme) => ({
            alignItems: 'center',
            gap: COLUMN_GAP,
            minWidth: 0,
            py: item.state === 'fine' ? 0 : 0.375,
            pr: 1,
            typography: 'caption',
            fontWeight: item.state === 'fine' ? 600 : 800,
            lineHeight: 1.3,
            ...figures,
            ...gapWash(theme, item.state),
          })}
        >
          <Stack
            component="span"
            sx={{
              width: NUMBER_WIDTH,
              flexShrink: 0,
              alignItems: 'flex-end',
              alignSelf: 'stretch',
            }}
          >
            {glyph}
          </Stack>
          <Box component="span" sx={{ minWidth: 0 }}>
            {item.text}
          </Box>
        </Stack>
      );
    }

    const open = (): void => {
      onOpen(item.id);
    };

    return (
      <Box key={item.id} component="li" data-kk-gap-timeline-stop sx={{ minWidth: 0 }}>
        <ButtonBase
          onClick={open}
          aria-label={`${openLabel}: ${item.title}`}
          aria-current={item.selected === true ? 'true' : undefined}
          sx={stopPaint(item.selected === true)}
        >
          <Box
            component="span"
            sx={{
              ...figures,
              width: NUMBER_WIDTH,
              flexShrink: 0,
              textAlign: 'right',
              typography: 'h3',
              lineHeight: 1,
              color: 'text.primary',
            }}
          >
            {item.number}
          </Box>
          {item.mark}
          <Box
            component="span"
            data-kk-gap-timeline-title
            sx={{
              flex: 1,
              minWidth: 0,
              typography: 'subtitle2',
              fontWeight: 800,
              lineHeight: 1.25,
              color: 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            {item.title}
          </Box>
        </ButtonBase>
      </Box>
    );
  });

  return (
    <Stack
      component="ol"
      aria-label={label}
      data-kk-gap-timeline
      sx={{ listStyle: 'none', m: 0, p: 0, minWidth: 0 }}
    >
      {rows}
    </Stack>
  );
};
