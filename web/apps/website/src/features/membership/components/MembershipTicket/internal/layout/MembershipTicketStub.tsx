import { kkTokens } from '@furria/ui';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren } from 'react';
import { membershipTicketStubWidth } from '@/features/membership/ticket-shape';

interface MembershipTicketStubProps extends PropsWithChildren {
  href: string;
  label: string;
}

export const MembershipTicketStub: FC<MembershipTicketStubProps> = ({ href, label, children }) => (
  <ButtonBase
    component="a"
    href={href}
    aria-label={label}
    data-kk-membership-ticket-stub
    sx={(theme) => ({
      flexShrink: 0,
      alignSelf: 'stretch',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      width: {
        xs: theme.spacing(membershipTicketStubWidth.xs),
        desktop: theme.spacing(membershipTicketStubWidth.desktop),
      },
      py: { xs: 2, desktop: 3 },
      bgcolor: 'warning.dark',
      color: 'warning.contrastText',
      borderTopRightRadius: `${kkTokens.radius.base}px`,
      borderBottomRightRadius: `${kkTokens.radius.base}px`,
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        transform: `translateY(${theme.spacing(-0.5)})`,
        boxShadow: kkTokens.shadow.raised,
      },
      '&.Mui-focusVisible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: (theme.vars ?? theme).palette.primary.main,
        outlineOffset: 2,
      },
    })}
  >
    {children}
  </ButtonBase>
);
