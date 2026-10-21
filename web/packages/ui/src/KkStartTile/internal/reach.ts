import type { ElementType } from 'react';
import type { KkLinkSearch } from '../../kk-link-search';

export interface KkStartTileReach {
  label: string;
  onClick?: () => void;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export interface TileReachProps {
  component: ElementType;
  'aria-label': string;
  onClick?: () => void;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const tileReachPropsOf = (reach: KkStartTileReach): TileReachProps =>
  reach.component === undefined
    ? { component: 'button', 'aria-label': reach.label, onClick: reach.onClick }
    : {
        component: reach.component,
        'aria-label': reach.label,
        onClick: reach.onClick,
        to: reach.to,
        params: reach.params,
        search: reach.search,
      };
