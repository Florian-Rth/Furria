import type { MouseEvent } from 'react';
import { useState } from 'react';
import type { NewsCategory } from '../types';

export interface CategoryMenu {
  anchor: HTMLElement | null;
  open: (event: MouseEvent<HTMLElement>) => void;
  close: () => void;
  choose: (category: NewsCategory) => void;
}

export const useCategoryMenu = (onChoose: (category: NewsCategory) => void): CategoryMenu => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return {
    anchor,
    open: (event) => {
      setAnchor(event.currentTarget);
    },
    close: () => {
      setAnchor(null);
    },
    choose: (category) => {
      setAnchor(null);
      onChoose(category);
    },
  };
};
