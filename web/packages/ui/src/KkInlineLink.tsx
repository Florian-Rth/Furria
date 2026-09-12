import Link from '@mui/material/Link';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const UNDERLINE_OFFSET = '0.18em';

interface KkInlineLinkProps extends PropsWithChildren {
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  sx?: KkSx;
}

export const KkInlineLink: FC<KkInlineLinkProps> = ({ component, to, params, sx, children }) => {
  const routeProps = component === undefined ? {} : { component, to, params };

  return (
    <Link
      {...routeProps}
      underline="always"
      data-kk-inline-link
      sx={[
        (theme) => ({
          color: 'inherit',
          fontWeight: 'inherit',
          textDecorationThickness: kkTokens.line.hair,
          textUnderlineOffset: UNDERLINE_OFFSET,
          borderRadius: kkTokens.radius.bar,
          '@media (hover: hover)': {
            '&:hover': { color: (theme.vars ?? theme).palette.primary.main },
          },
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Link>
  );
};
