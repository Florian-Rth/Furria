import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, ReactNode, Ref } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWashSurface } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { kkMotion } from '../../../kk-motion';
import { kkTokens } from '../../../tokens';
import type { KkListBracket } from './KkNumberedListBracket';
import { KkNumberedListBracket } from './KkNumberedListBracket';
import type { KkListCheck } from './KkNumberedListCheck';
import { KkNumberedListCheck } from './KkNumberedListCheck';
import { KkNumberedListNumber } from './KkNumberedListNumber';
import { goldWashSurface, liftedSurface, ROW_PADDING_X } from './numbered-list-paint';

export type KkListRowState = 'rest' | 'selected' | 'lifted' | 'proposed';
export type KkListDropEdge = 'before' | 'after';

const ARRIVE = { opacity: 0 };
const SHOWN = { opacity: 1 };
const NO_SHIFT = 0;
const LIFTED_SCALE = 0.97;

const dropLinePaint = (theme: Theme, edge: KkListDropEdge): CSSObject => {
  const red = (theme.vars ?? theme).palette.primary.main;
  const cap = `radial-gradient(circle, ${red} 5px, transparent 5.5px)`;

  return {
    '&::before': {
      content: '""',
      position: 'absolute',
      insetInline: -6,
      [edge === 'before' ? 'top' : 'bottom']: -6,
      height: 12,
      zIndex: 1,
      pointerEvents: 'none',
      background: `${cap} left center / 12px 12px no-repeat, ${cap} right center / 12px 12px no-repeat, linear-gradient(${red}, ${red}) center / calc(100% - 12px) 3px no-repeat`,
    },
  };
};

const homePaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
  pointerEvents: 'none',
  border: '2px dashed',
  borderColor: (theme.vars ?? theme).palette.divider,
  borderRadius: `${kkTokens.radius.base}px`,
  bgcolor: 'background.default',
});

const rowPaint =
  (state: KkListRowState, dropEdge: KkListDropEdge | null) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    ...(dropEdge === null ? {} : dropLinePaint(theme, dropEdge)),
    minWidth: 0,
    bgcolor: 'background.paper',
    ...(state === 'selected' ? inkWashSurface(theme, '6%', '10%') : {}),
    ...(state === 'proposed' ? goldWashSurface(theme, '10%', '14%') : {}),
    ...(state === 'lifted'
      ? {
          ...liftedSurface(theme),
          zIndex: 2,
          borderRadius: `${kkTokens.radius.base}px`,
          cursor: 'grabbing',
        }
      : {}),
  });

const mainPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  justifyContent: 'flex-start',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 1.25,
  py: 0.875,
  pr: 0.5,
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.base}px`,
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover [data-kk-numbered-row-title]': redInk(theme),
  },
});

const checkedMainPaint = (theme: Theme): CSSObject => ({
  ...mainPaint(theme),
  pr: ROW_PADDING_X,
});

interface KkNumberedListRowProps {
  rowKey: string;
  number?: string | null;
  numberFrom?: string | null;
  pinned?: boolean;
  bracket?: KkListBracket | null;
  bracketPreview?: boolean;
  mark: ReactNode;
  title: string;
  fact?: ReactNode;
  chips?: ReactNode;
  trailing?: ReactNode;
  check?: KkListCheck;
  state?: KkListRowState;
  arrive?: boolean;
  shift?: number;
  dropEdge?: KkListDropEdge | null;
  openLabel: string;
  onOpen?: () => void;
  rowRef?: Ref<HTMLLIElement>;
}

export const KkNumberedListRow: FC<KkNumberedListRowProps> = ({
  rowKey,
  number,
  numberFrom,
  pinned = false,
  bracket = null,
  bracketPreview = false,
  mark,
  title,
  fact,
  chips,
  trailing,
  check,
  state = 'rest',
  arrive = true,
  shift = NO_SHIFT,
  dropEdge = null,
  openLabel,
  onOpen,
  rowRef,
}) => {
  const lifted = state === 'lifted';
  const home =
    lifted && shift !== NO_SHIFT ? (
      <Box
        component="span"
        aria-hidden
        data-kk-numbered-row-home
        style={{ translate: `0 ${-shift / LIFTED_SCALE}px`, scale: 1 / LIFTED_SCALE }}
        sx={homePaint}
      />
    ) : null;
  const numberZone =
    number === undefined ? null : (
      <KkNumberedListNumber number={number} from={numberFrom} pinned={pinned} />
    );
  const factLine =
    fact === undefined || fact === null ? null : (
      <Stack
        direction="row"
        component="span"
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 0.75,
          minWidth: 0,
          typography: 'caption',
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'text.secondary',
          '& > span': { flexShrink: 0, whiteSpace: 'nowrap' },
          '& > span:not([data-kk-group-tone-dot]):has(+ span)::after': {
            content: '"·"',
            ml: 0.75,
          },
        }}
      >
        {fact}
      </Stack>
    );
  const chipLine =
    chips === undefined || chips === null ? null : (
      <Stack
        direction="row"
        component="span"
        sx={{ flexWrap: 'wrap', gap: 0.5, pt: 0.375, minWidth: 0 }}
      >
        {chips}
      </Stack>
    );
  const checkSlot = check === undefined ? null : <KkNumberedListCheck check={check} />;
  const pressed = check === undefined ? undefined : check.checked;
  const mainSx = check === undefined ? mainPaint : checkedMainPaint;
  const trailingSlot =
    trailing === undefined || trailing === null ? null : (
      <Stack
        direction="row"
        data-kk-numbered-row-trailing
        sx={{ flexShrink: 0, alignItems: 'center', gap: 0.25, pr: ROW_PADDING_X }}
      >
        {trailing}
      </Stack>
    );

  return (
    <Box
      component={motion.li}
      ref={rowRef}
      layout={lifted ? false : 'position'}
      layoutId={lifted ? undefined : rowKey}
      initial={arrive ? ARRIVE : false}
      animate={SHOWN}
      transition={kkMotion.layoutGlide}
      style={{
        translate: `0 ${lifted ? shift : NO_SHIFT}px`,
        scale: lifted ? LIFTED_SCALE : 1,
      }}
      data-kk-numbered-line
      data-kk-numbered-row={rowKey}
      data-kk-numbered-row-state={state}
      data-kk-numbered-drop={dropEdge ?? undefined}
      sx={rowPaint(state, dropEdge)}
    >
      {home}
      <Stack direction="row" sx={{ alignItems: 'center', minWidth: 0 }}>
        <KkNumberedListBracket bracket={bracket} preview={bracketPreview} />
        <ButtonBase
          onClick={onOpen}
          disabled={onOpen === undefined}
          aria-label={`${openLabel}: ${title}`}
          aria-current={state === 'selected' ? 'true' : undefined}
          aria-pressed={pressed}
          sx={mainSx}
        >
          {numberZone}
          {mark}
          <Stack component="span" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              component="span"
              data-kk-numbered-row-title
              sx={{
                typography: 'subtitle2',
                fontWeight: 800,
                lineHeight: 1.25,
                color: 'text.primary',
                overflowWrap: 'anywhere',
              }}
            >
              {title}
            </Box>
            {factLine}
            {chipLine}
          </Stack>
          {checkSlot}
        </ButtonBase>
        {trailingSlot}
      </Stack>
    </Box>
  );
};
