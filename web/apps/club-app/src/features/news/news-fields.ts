import { scrollElementIntoView } from '@/lib/scroll-to';

const FOCUSABLE = 'input, textarea, button, [contenteditable="true"]';

export const newsFieldIdOf = (part: string): string => `news-field-${part}`;

const focusTargetOf = (field: HTMLElement): HTMLElement | null =>
  field.matches(FOCUSABLE) ? field : field.querySelector<HTMLElement>(FOCUSABLE);

export const revealNewsField = (part: string): void => {
  const field = document.getElementById(newsFieldIdOf(part));
  if (field === null) {
    return;
  }
  scrollElementIntoView(field, 'center');
  focusTargetOf(field)?.focus({ preventScroll: true });
};
