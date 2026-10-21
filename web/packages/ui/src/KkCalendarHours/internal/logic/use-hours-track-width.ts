import { useState } from 'react';

export interface HoursTrackWidth {
  width: number;
  measure: (node: HTMLElement | null) => (() => void) | undefined;
}

export const useHoursTrackWidth = (): HoursTrackWidth => {
  const [width, setWidth] = useState(0);

  const measure = (node: HTMLElement | null): (() => void) | undefined => {
    if (node === null) {
      return undefined;
    }

    const observer = new ResizeObserver((records) => {
      const record = records[0];

      if (record !== undefined) {
        setWidth(record.contentRect.width);
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  };

  return { width, measure };
};
