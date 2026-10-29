import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { inkWashSurface } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';
import type { KkStudioCSpan, KkStudioCSpanTone } from '../../studio-c-types';
import { stickyLabelOf } from '../sticky-label';

const tonePaint = (theme: Theme, tone: KkStudioCSpanTone): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  switch (tone) {
    case 'video':
      return {
        top: 3,
        bottom: 3,
        ...inkWashSurface(theme, '13%', '20%'),
        color: palette.text.primary,
        borderLeftWidth: kkTokens.line.section,
        borderLeftStyle: 'solid',
        borderLeftColor: palette.text.primary,
      };
    case 'moving':
      return {
        top: '30%',
        bottom: '30%',
        backgroundColor: palette.primary.main,
        borderRadius: `${kkTokens.radius.pill}px`,
      };
    case 'still':
      return {
        top: '50%',
        height: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'dashed',
        borderTopColor: palette.text.disabled,
      };
  }
};

const spanPaint =
  (tone: KkStudioCSpanTone) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    px: 0.75,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1,
    borderRadius: `${kkTokens.radius.bar}px`,
    ...tonePaint(theme, tone),
  });

interface KkStudioCTimelineSpansProps {
  spans: readonly KkStudioCSpan[];
}

export const KkStudioCTimelineSpans: FC<KkStudioCTimelineSpansProps> = ({ spans }) => {
  const boxes = spans.map((span) => {
    const place = { left: span.left, width: span.width };
    const sticky = stickyLabelOf(span.left, span.width);
    const content =
      span.label === null ? null : (
        <Box
          component="span"
          style={sticky}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <VideocamRoundedIcon fontSize="inherit" />
          {span.label}
        </Box>
      );

    return (
      <Box
        key={span.key}
        aria-hidden
        data-kk-studio-c-span={span.tone}
        style={place}
        sx={spanPaint(span.tone)}
      >
        {content}
      </Box>
    );
  });

  return <>{boxes}</>;
};
