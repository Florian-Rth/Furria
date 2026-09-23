import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode, Ref } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneInkPaint } from './internal/group-tone';
import { KkButton } from './KkButton';
import { KkEyebrow } from './KkEyebrow';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import type { KkPanelAction, KkPanelActionEmphasis } from './panel-action';
import { kkTokens } from './tokens';

const MARKER_SIZE = 9;
const RULE_BLEED = 26;
const RULE_MIN_WIDTH = RULE_BLEED * 2;
const ACTION_SLOT = { ml: 'auto', flexShrink: 0 } as const;

const actionVariants: Record<KkPanelActionEmphasis, 'outlined' | 'text'> = {
  strong: 'outlined',
  quiet: 'text',
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
  action?: KkPanelAction;
  meta?: ReactNode;
  groupTone?: KkGroupTone;
  titleRef?: Ref<HTMLHeadingElement>;
  sx?: KkSx;
}

export const KkPanelHeader: FC<KkPanelHeaderProps> = ({
  title,
  action,
  meta,
  groupTone,
  titleRef,
  sx,
}) => {
  const metaContent = typeof meta === 'string' ? <KkEyebrow tone="muted">{meta}</KkEyebrow> : meta;
  const actionSlot =
    action === undefined ? null : (
      <Box sx={ACTION_SLOT}>
        <KkButton
          size="small"
          variant={actionVariants[action.emphasis ?? 'strong']}
          startIcon={
            action.icon === undefined ? undefined : <KkIcon name={action.icon} size="small" />
          }
          component={action.component}
          to={action.to}
          params={action.params}
          onClick={action.onClick}
          disabled={action.disabled}
          ariaLabel={action.ariaLabel}
        >
          {action.label}
        </KkButton>
      </Box>
    );
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
          typography: 'h3',
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
