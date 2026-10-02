import type { RefCallback } from 'react';

const NO_REF: RefCallback<HTMLElement> = () => undefined;

const scrollToTop: RefCallback<HTMLElement> = (element) => {
  element?.scrollIntoView({ block: 'start' });
};

export const useScrollIntoView = (focused: boolean): RefCallback<HTMLElement> =>
  focused ? scrollToTop : NO_REF;
