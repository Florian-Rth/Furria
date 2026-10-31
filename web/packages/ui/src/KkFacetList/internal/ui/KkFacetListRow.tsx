import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { lineClamp } from '../../../internal/line-clamp';
import { redInk } from '../../../internal/red-ink';
import { rowDividerTop } from '../../../internal/row-divider';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

export type KkFacetLeadTone = 'ink' | 'accent' | 'muted' | 'attention';

const { light, dark } = kkTokens.color;
const LEAD_WIDTH = '3.25rem';

const ROW: CSSObject = {
  ...rowDividerTop,
  minHeight: kkTokens.tapTarget,
  py: 0.75,
  gap: 1.25,
  alignItems: 'center',
  minWidth: 0,
};

const LEAD_TONES: Record<KkFacetLeadTone, (theme: Theme) => CSSObject> = {
  ink: () => ({ color: 'text.primary' }),
  accent: redInk,
  muted: () => ({ color: 'text.disabled' }),
  attention: (theme) => applyScheme(theme, schemeInk(light.goldInk, dark.goldInk)),
};

const leadPaint =
  (tone: KkFacetLeadTone) =>
  (theme: Theme): CSSObject => ({
    ...LEAD_TONES[tone](theme),
    minWidth: LEAD_WIDTH,
    flexShrink: 0,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  });

const TEXT: CSSObject = { flex: 1, minWidth: 0, gap: 0.125 };
const TITLE: CSSObject = { ...lineClamp(2), fontWeight: 700, lineHeight: 1.3 };
const META: CSSObject = {
  color: 'text.secondary',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
};

const pressPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  gap: 1.25,
  justifyContent: 'flex-start',
  textAlign: 'left',
  minHeight: kkTokens.tapTarget,
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover [data-kk-facet-row-title]': redInk(theme) },
});

interface RowLinkProps {
  component: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number | boolean>;
}

const linkPropsOf = (
  component: ElementType | undefined,
  to: string | undefined,
  params: Record<string, string> | undefined,
  search: Record<string, string | number | boolean> | undefined,
): RowLinkProps =>
  component === undefined ? { component: 'a' } : { component, to, params, search };

interface KkFacetListRowProps {
  title: string;
  meta?: string;
  lead?: string;
  leadTone?: KkFacetLeadTone;
  face?: ReactNode;
  trailing?: ReactNode;
  current?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number | boolean>;
}

export const KkFacetListRow: FC<KkFacetListRowProps> = ({
  title,
  meta,
  lead,
  leadTone = 'ink',
  face,
  trailing,
  current = false,
  component,
  to,
  params,
  search,
}) => {
  const leadMark =
    lead === undefined ? null : (
      <Typography component="span" variant="h3" sx={leadPaint(leadTone)}>
        {lead}
      </Typography>
    );
  const metaLine =
    meta === undefined ? null : (
      <Typography component="span" variant="caption" sx={META}>
        {meta}
      </Typography>
    );
  const body = (
    <>
      {leadMark}
      {face}
      <Stack component="span" sx={TEXT}>
        <Typography component="span" variant="body2" data-kk-facet-row-title sx={TITLE}>
          {title}
        </Typography>
        {metaLine}
      </Stack>
    </>
  );
  const chevron =
    to === undefined ? null : (
      <Stack component="span" aria-hidden sx={{ color: 'text.secondary' }}>
        <KkIcon name="chevron" size="small" />
      </Stack>
    );
  const content =
    to === undefined ? (
      body
    ) : (
      <ButtonBase disableRipple {...linkPropsOf(component, to, params, search)} sx={pressPaint}>
        {body}
        {chevron}
      </ButtonBase>
    );

  return (
    <Stack
      component="li"
      direction="row"
      aria-current={current ? 'true' : undefined}
      data-kk-facet-row
      sx={ROW}
    >
      {content}
      {trailing}
    </Stack>
  );
};
