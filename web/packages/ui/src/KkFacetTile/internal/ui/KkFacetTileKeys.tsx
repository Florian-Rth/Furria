import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeFill, schemeInk } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { FACET_INNER_RADIUS } from '../facet-paint';

const { light, dark } = kkTokens.color;

export type KkFacetKey = 'yes' | 'no';

export type KkFacetKeysFit = 'fill' | 'content';

const ROWS: Record<KkFacetKeysFit, CSSObject> = {
  fill: { gap: 0.5, minWidth: 0, width: '100%' },
  content: {
    gap: 0.5,
    flexShrink: 0,
    '& > [data-kk-facet-key]': { flex: '0 0 auto', px: 1.25 },
  },
};

const keyPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  px: 0.25,
  gap: 0.25,
  borderRadius: FACET_INNER_RADIUS,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1.15,
  textAlign: 'center',
  color: 'text.primary',
  transition: 'background-color 160ms ease-out, color 160ms ease-out, transform 120ms ease-out',
  '&:active': { transform: 'scale(0.96)' },
  '&[aria-pressed="true"]': { borderColor: 'transparent' },
  '&[aria-pressed="true"][data-kk-facet-key="yes"]': applyScheme(
    theme,
    schemeFill(light.greenInk, dark.greenInk),
    schemeInk(light.onRed, dark.bg),
  ),
  '&[aria-pressed="true"][data-kk-facet-key="no"]': applyScheme(
    theme,
    schemeFill(light.ink, dark.ink),
    schemeInk(light.panel2, dark.bg),
  ),
  '[data-kk-facet-answered="true"] > &[aria-pressed="false"]': { color: 'text.secondary' },
  '[aria-busy="true"] > &': { opacity: kkTokens.opacity.dimmed },
});

interface KkFacetTileKeysProps {
  label: string;
  value: KkFacetKey | null;
  yesLabel: string;
  noLabel: string;
  busy?: boolean;
  fit?: KkFacetKeysFit;
  onAnswer: (answer: KkFacetKey) => void;
}

export const KkFacetTileKeys: FC<KkFacetTileKeysProps> = ({
  label,
  value,
  yesLabel,
  noLabel,
  busy = false,
  fit = 'fill',
  onAnswer,
}) => {
  const answerYes = (): void => {
    onAnswer('yes');
  };
  const answerNo = (): void => {
    onAnswer('no');
  };
  const yesMark = value === 'yes' ? <KkIcon name="check" size="small" /> : null;

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      aria-busy={busy}
      data-kk-facet-control
      data-kk-facet-answered={value !== null}
      sx={ROWS[fit]}
    >
      <ButtonBase
        data-kk-facet-key="yes"
        aria-pressed={value === 'yes'}
        onClick={answerYes}
        sx={keyPaint}
      >
        {yesMark}
        {yesLabel}
      </ButtonBase>
      <ButtonBase
        data-kk-facet-key="no"
        aria-pressed={value === 'no'}
        onClick={answerNo}
        sx={keyPaint}
      >
        {noLabel}
      </ButtonBase>
    </Stack>
  );
};
