import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneInkScheme } from './internal/group-tone';
import { newsTextPaint } from './internal/news-text-paint';
import { proofMarginRuleOf } from './internal/proof-margin-rule';
import { applyScheme } from './internal/scheme-paint';

export type KkProseVariant = 'lead' | 'body';

export interface KkProseMentionTone {
  id: string;
  tone: KkGroupTone | null;
  isPublic: boolean;
}

interface KkProseFieldProps {
  hostRef: (node: HTMLDivElement | null) => void;
  variant: KkProseVariant;
  placeholder: string;
  isEmpty: boolean;
  mentionTones?: readonly KkProseMentionTone[];
}

const CUT_TICK_WIDTH = 2;

const cutStyles = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  const shownLabel = { opacity: 1 };
  return {
    '& [data-kk-cut]': {
      position: 'relative',
      display: 'inline-block',
      width: 0,
      height: '1em',
      verticalAlign: '-0.12em',
      userSelect: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -CUT_TICK_WIDTH / 2,
        width: CUT_TICK_WIDTH,
        borderRadius: 1,
        backgroundColor: palette.primary.main,
      },
      '&::after': {
        content: '"✂ " attr(data-kk-cut)',
        ...theme.typography.caption,
        position: 'absolute',
        zIndex: 2,
        left: -CUT_TICK_WIDTH / 2,
        bottom: '100%',
        paddingInline: theme.spacing(0.5),
        borderRadius: theme.spacing(0.5, 0.5, 0.5, 0),
        fontWeight: 800,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        color: palette.primary.contrastText,
        backgroundColor: palette.primary.main,
        opacity: 0,
        transition: theme.transitions.create('opacity', {
          duration: theme.transitions.duration.shortest,
        }),
        pointerEvents: 'none',
      },
    },
    '&:hover [data-kk-cut]::after': shownLabel,
    '&:focus-within [data-kk-cut]::after': shownLabel,
    '& [data-kk-cut-rest]': { color: palette.text.disabled },
  };
};

const MENTION_TINT = 'color-mix(in srgb, currentColor 12%, transparent)';

const mentionStyles = (theme: Theme, tones: readonly KkProseMentionTone[]): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  const perMention = Object.fromEntries(
    tones.map((mention) => [
      `& [data-kk-mention-id="${mention.id}"]`,
      mention.isPublic
        ? mention.tone === null
          ? {}
          : applyScheme(theme, groupToneInkScheme(mention.tone))
        : {
            color: palette.text.disabled,
            backgroundColor: 'transparent',
            textDecoration: 'line-through',
          },
    ]),
  );
  return {
    '& [data-kk-mention-id]': {
      fontWeight: 700,
      paddingInline: '0.2em',
      borderRadius: theme.spacing(0.5),
      backgroundColor: MENTION_TINT,
      boxDecorationBreak: 'clone',
      cursor: 'pointer',
    },
    '& .ProseMirror-selectednode[data-kk-mention-id]': {
      outline: `2px solid ${palette.primary.main}`,
      outlineOffset: 1,
    },
    ...perMention,
  };
};

const bodyStyles = (theme: Theme, tones: readonly KkProseMentionTone[]): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  return {
    ...newsTextPaint(theme),
    '& [data-kk-changed]': {
      position: 'relative',
      '&::before': proofMarginRuleOf(theme, palette.primary.main),
    },
    ...mentionStyles(theme, tones),
  };
};

const leadStyles = (theme: Theme): CSSObject => ({
  ...theme.typography.h3,
  [theme.breakpoints.up('md')]: theme.typography.h2,
  lineHeight: 1.26,
  letterSpacing: '0.01em',
  color: (theme.vars ?? theme).palette.text.secondary,
  '& p': { margin: 0, textWrap: 'pretty' },
  ...cutStyles(theme),
});

export const KkProseField: FC<KkProseFieldProps> = ({
  hostRef,
  variant,
  placeholder,
  isEmpty,
  mentionTones = [],
}) => {
  const hint = isEmpty ? (
    <Typography
      aria-hidden
      component="span"
      variant="inherit"
      sx={{ color: 'text.disabled', pointerEvents: 'none' }}
    >
      {placeholder}
    </Typography>
  ) : null;

  return (
    <Box
      data-kk-prose-field={variant}
      sx={(theme: Theme) => ({
        position: 'relative',
        display: 'grid',
        minWidth: 0,
        '& > *': { gridArea: '1 / 1', minWidth: 0 },
        ...(variant === 'lead' ? leadStyles(theme) : bodyStyles(theme, mentionTones)),
        '& .ProseMirror': {
          position: 'relative',
          zIndex: 1,
          outline: 'none',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          minHeight: '1.3em',
        },
      })}
    >
      {hint}
      <Box ref={hostRef} />
    </Box>
  );
};
