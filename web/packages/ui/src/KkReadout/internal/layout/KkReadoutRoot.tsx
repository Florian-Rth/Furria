import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const FRAME: CSSObject = {
  minWidth: 0,
  rowGap: 1.5,
  px: 2,
  pt: 1.5,
  pb: 2,
  backgroundColor: 'background.paper',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  borderRadius: `${kkTokens.radius.base}px`,
  scrollMarginTop: kkTokens.layout.stickyTop * 4,
};

const HEAD: CSSObject = {
  alignItems: 'baseline',
  justifyContent: 'space-between',
  columnGap: 1.5,
  minWidth: 0,
  pb: 0.75,
  borderBottomWidth: kkTokens.line.section,
  borderBottomStyle: 'solid',
  borderBottomColor: 'text.primary',
};

interface KkReadoutRootProps extends PropsWithChildren {
  id?: string;
  title?: string;
  label?: string;
  aside?: string;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkReadoutRoot: FC<KkReadoutRootProps> = ({
  id,
  title,
  label,
  aside,
  dimmed = false,
  sx,
  children,
}) => {
  const headingId = useId();
  const opacity = dimmed ? kkTokens.opacity.dimmed : 1;
  const asideLine =
    aside === undefined ? null : (
      <Typography
        component="span"
        sx={{
          typography: 'caption',
          fontWeight: 700,
          color: 'text.disabled',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {aside}
      </Typography>
    );

  const heading =
    title === undefined ? null : (
      <Typography
        id={headingId}
        component="h2"
        variant="h3"
        sx={{ textTransform: 'uppercase', letterSpacing: kkTokens.type.tracking.display }}
      >
        {title}
      </Typography>
    );
  const head =
    heading === null && asideLine === null ? null : (
      <Stack direction="row" sx={HEAD}>
        {heading}
        {asideLine}
      </Stack>
    );
  const labelledBy = title === undefined ? undefined : headingId;

  return (
    <Stack
      component="section"
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      data-kk-readout
      sx={[FRAME, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {head}
      <Stack sx={{ rowGap: 1.5, minWidth: 0, opacity, transition: 'opacity 240ms ease-out' }}>
        {children}
      </Stack>
    </Stack>
  );
};
