import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode, Ref } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneInkPaint } from './internal/group-tone';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelHeaderSize = 'small' | 'medium';

const MARKER_SIZE = 9;
const RULE_BLEED = 26;
const RULE_MIN_WIDTH = RULE_BLEED * 2;
const ACTION_SLOT = { ml: 'auto', flexShrink: 0 } as const;

const titleSizes: Record<KkPanelHeaderSize, string> = {
  small: kkTokens.type.sectionTitle,
  medium: kkTokens.type.blockTitle,
};

const ruleImage = (theme: Theme): string =>
  `linear-gradient(to right, ${(theme.vars ?? theme).palette.primary.main} 0, ${(theme.vars ?? theme).palette.divider} ${RULE_BLEED}px)`;

const toneRuleImage = (theme: Theme): string =>
  `linear-gradient(to right, currentColor 0, ${(theme.vars ?? theme).palette.divider} ${RULE_BLEED}px)`;

const markerPaint = (theme: Theme, groupTone: KkGroupTone | undefined): CSSObject =>
  groupTone === undefined
    ? { backgroundColor: (theme.vars ?? theme).palette.primary.main }
    : { ...groupToneInkPaint(theme, groupTone), backgroundColor: 'currentColor' };

const rulePaint = (theme: Theme, groupTone: KkGroupTone | undefined): CSSObject =>
  groupTone === undefined
    ? { backgroundImage: ruleImage(theme) }
    : { ...groupToneInkPaint(theme, groupTone), backgroundImage: toneRuleImage(theme) };

interface KkPanelHeaderProps {
  title: string;
  action?: ReactNode;
  meta?: ReactNode;
  size?: KkPanelHeaderSize;
  groupTone?: KkGroupTone;
  titleRef?: Ref<HTMLHeadingElement>;
  sx?: KkSx;
}

export const KkPanelHeader: FC<KkPanelHeaderProps> = ({
  title,
  action,
  meta,
  size = 'small',
  groupTone,
  titleRef,
  sx,
}) => {
  const metaContent = typeof meta === 'string' ? <KkEyebrow tone="muted">{meta}</KkEyebrow> : meta;
  const actionSlot = action === undefined ? null : <Box sx={ACTION_SLOT}>{action}</Box>;
  const metaSlot =
    meta === undefined ? null : (
      <Stack
        direction="row"
        data-kk-panel-header-meta
        sx={{ alignItems: 'center', minWidth: 0, flexShrink: 1 }}
      >
        {metaContent}
      </Stack>
    );

  return (
    <Stack
      direction="row"
      data-kk-panel-header
      sx={[
        {
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.25,
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          flexShrink: 0,
          ...markerPaint(theme, groupTone),
        })}
      />
      <Typography
        ref={titleRef}
        component="h2"
        tabIndex={-1}
        data-kk-panel-header-title
        sx={{
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          fontSize: titleSizes[size],
          letterSpacing: kkTokens.type.tracking.section,
          lineHeight: 1,
          color: 'text.primary',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          outline: 'none',
        }}
      >
        {title}
      </Typography>
      {metaSlot}
      <Box
        aria-hidden
        sx={(theme) => ({
          flexGrow: 1,
          flexShrink: 0,
          minWidth: RULE_MIN_WIDTH,
          height: kkTokens.line.hair,
          ...rulePaint(theme, groupTone),
        })}
      />
      {actionSlot}
    </Stack>
  );
};
