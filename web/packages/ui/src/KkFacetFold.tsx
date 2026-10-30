import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import { focusRing } from './internal/focus-ring';
import { useReducedMotion } from './internal/use-reduced-motion';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const INSTANT = 0;

const togglePaint = (theme: Theme): CSSObject => ({
  width: '100%',
  minHeight: kkTokens.tapTarget,
  justifyContent: 'flex-start',
  gap: 1,
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  ...focusRing(theme),
  '& [data-kk-facet-fold-chevron]': { transition: 'transform 180ms ease-out' },
  '&[aria-expanded="true"] [data-kk-facet-fold-chevron]': { transform: 'rotate(90deg)' },
});

const TITLE: CSSObject = {
  ...kkTokens.eyebrow,
  textTransform: 'uppercase',
  letterSpacing: kkTokens.type.tracking.section,
  color: 'text.primary',
  m: 0,
};

const SUMMARY: CSSObject = {
  flex: 1,
  textTransform: 'none',
  letterSpacing: 'normal',
  minWidth: 0,
  color: 'text.secondary',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

interface KkFacetFoldProps extends PropsWithChildren {
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  sx?: KkSx;
}

export const KkFacetFold: FC<KkFacetFoldProps> = ({
  title,
  summary,
  open,
  onToggle,
  sx,
  children,
}) => {
  const contentId = useId();
  const reducedMotion = useReducedMotion();
  const timeout = reducedMotion ? INSTANT : undefined;
  const summaryLine =
    summary === undefined ? null : (
      <Typography component="span" variant="caption" sx={SUMMARY}>
        {summary}
      </Typography>
    );

  return (
    <Stack
      component="section"
      data-kk-facet-fold
      sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography component="h2" variant="overline" sx={{ m: 0 }}>
        <ButtonBase
          disableRipple
          aria-expanded={open}
          aria-controls={contentId}
          onClick={onToggle}
          sx={togglePaint}
        >
          <Stack component="span" data-kk-facet-fold-chevron>
            <KkIcon name="chevron" size="small" />
          </Stack>
          <Typography component="span" variant="overline" sx={TITLE}>
            {title}
          </Typography>
          {summaryLine}
        </ButtonBase>
      </Typography>
      <Collapse in={open} timeout={timeout}>
        <Stack id={contentId} sx={{ minWidth: 0, pt: 0.5 }}>
          {children}
        </Stack>
      </Collapse>
    </Stack>
  );
};
