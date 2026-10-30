import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { EYEBROW, FACET_RADIUS } from '../facet-paint';

const HEADING_PAINT: CSSObject = {
  ...EYEBROW,
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  width: '100%',
  minHeight: '1.5rem',
  textTransform: 'uppercase',
};

const LABEL_PAINT: CSSObject = {
  ...EYEBROW,
  textTransform: 'uppercase',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const doorPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  justifyContent: 'flex-start',
  gap: 0.75,
  color: 'inherit',
  textAlign: 'left',
  position: 'static',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: FACET_RADIUS,
  },
  '& [data-kk-facet-chevron]': { marginLeft: 'auto', transition: 'transform 160ms ease-out' },
  '@media (hover: hover)': {
    '&:hover [data-kk-facet-chevron]': { transform: 'translateX(2px)', ...redInk(theme) },
  },
});

interface KkFacetTileDoorProps {
  icon: KkIconName;
  label: string;
  hint?: string;
  onOpen?: () => void;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number | boolean>;
}

export const KkFacetTileDoor: FC<KkFacetTileDoorProps> = ({
  icon,
  label,
  hint,
  onOpen,
  component,
  to,
  params,
  search,
}) => {
  const opens = onOpen !== undefined || to !== undefined;
  const hidden = hint === undefined ? null : <KkVisuallyHidden>{hint}</KkVisuallyHidden>;
  const glyph = <KkIcon name={icon} size="small" />;
  const text = (
    <Typography component="span" variant="overline" sx={LABEL_PAINT}>
      {label}
    </Typography>
  );

  if (!opens) {
    return (
      <Typography component="h2" variant="overline" data-kk-facet-head sx={HEADING_PAINT}>
        {glyph}
        {text}
      </Typography>
    );
  }

  const linkProps =
    component === undefined ? { component: 'button' } : { component, to, params, search };

  return (
    <Typography component="h2" variant="overline" data-kk-facet-head sx={HEADING_PAINT}>
      <ButtonBase disableRipple data-kk-facet-door onClick={onOpen} {...linkProps} sx={doorPaint}>
        {glyph}
        {text}
        {hidden}
        <Stack component="span" data-kk-facet-chevron aria-hidden>
          <KkIcon name="chevron" size="small" />
        </Stack>
      </ButtonBase>
    </Typography>
  );
};
