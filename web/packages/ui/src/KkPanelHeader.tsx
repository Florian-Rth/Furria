import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode, Ref } from 'react';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelHeaderSize = 'small' | 'medium';

const MARKER_SIZE = 9;
const RULE_BLEED = 26;
const RULE_MIN_WIDTH = RULE_BLEED * 2;

const titleSizes: Record<KkPanelHeaderSize, string> = {
  small: kkTokens.type.sectionTitle,
  medium: kkTokens.type.blockTitle,
};

const ruleImage = (theme: Theme): string =>
  `linear-gradient(to right, ${(theme.vars ?? theme).palette.primary.main} 0, ${(theme.vars ?? theme).palette.divider} ${RULE_BLEED}px)`;

interface KkPanelHeaderProps {
  title: string;
  action?: ReactNode;
  meta?: ReactNode;
  size?: KkPanelHeaderSize;
  titleRef?: Ref<HTMLHeadingElement>;
  sx?: KkSx;
}

export const KkPanelHeader: FC<KkPanelHeaderProps> = ({
  title,
  action,
  meta,
  size = 'small',
  titleRef,
  sx,
}) => {
  const metaContent = typeof meta === 'string' ? <KkEyebrow tone="muted">{meta}</KkEyebrow> : meta;
  const metaSlot =
    meta === undefined ? null : (
      <Stack
        direction="row"
        data-kk-panel-header-meta
        sx={{ alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}
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
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 1.25,
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        sx={{ width: MARKER_SIZE, height: MARKER_SIZE, bgcolor: 'primary.main', flexShrink: 0 }}
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
          backgroundImage: ruleImage(theme),
        })}
      />
      {action}
    </Stack>
  );
};
