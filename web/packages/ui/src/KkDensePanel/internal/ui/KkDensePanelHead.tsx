import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';
import { DENSE_GAP, DENSE_HEAD_LINE_BOX, DENSE_INSET } from '../dense-panel-paint';

const HEAD_FRAME: CSSObject = {
  minWidth: 0,
  minHeight: DENSE_HEAD_LINE_BOX,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: DENSE_GAP,
  px: DENSE_INSET,
};

const LABEL_PAINT: CSSObject = {
  ...kkTokens.eyebrow,
  m: 0,
  minWidth: 0,
  color: 'text.secondary',
};

const receiptPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  flexShrink: 0,
  alignItems: 'center',
  ...applyScheme(theme, schemeInk(kkTokens.color.light.greenInk, kkTokens.color.dark.greenInk)),
});

interface KkDensePanelHeadProps {
  id: string;
  label: string;
  receipt?: string;
}

export const KkDensePanelHead: FC<KkDensePanelHeadProps> = ({ id, label, receipt }) => {
  const receiptMark =
    receipt === undefined ? null : (
      <Stack component="span" direction="row" data-kk-dense-receipt sx={receiptPaint}>
        <KkIcon name="check" size="small" />
        <KkVisuallyHidden>{receipt}</KkVisuallyHidden>
      </Stack>
    );

  return (
    <Stack direction="row" data-kk-dense-head sx={HEAD_FRAME}>
      <Typography
        id={id}
        component="h2"
        variant="overline"
        noWrap
        tabIndex={-1}
        data-kk-dense-heading
        sx={LABEL_PAINT}
      >
        {label}
      </Typography>
      {receiptMark}
    </Stack>
  );
};
