import type { ElementType } from 'react';

export interface BoardLink {
  component: ElementType;
  props: { href: string } | { to: string };
}

export const boardLinkOf = (component: ElementType | undefined, to: string): BoardLink =>
  component === undefined ? { component: 'a', props: { href: to } } : { component, props: { to } };
