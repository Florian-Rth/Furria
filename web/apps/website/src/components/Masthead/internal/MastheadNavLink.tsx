import type { FC } from 'react';
import { SiteTextLink } from '@/components/SiteTextLink';
import type { NavItem } from '../nav-items';

export const MastheadNavLink: FC<{ item: NavItem }> = ({ item }) => (
  <SiteTextLink to={item.to} burstOnClick>
    {item.label}
  </SiteTextLink>
);
