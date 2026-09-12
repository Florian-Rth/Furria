import { scrollElementIntoView } from '@/lib/scroll-to';

export const scrollNewRowIntoView = (node: HTMLElement | null): void => {
  scrollElementIntoView(node, 'center');
};
