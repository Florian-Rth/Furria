import { useEffect, useState } from 'react';

const READING_BAND = '-18% 0px -72% 0px';

export interface SceneInView {
  current: number;
  setCurrent: (index: number) => void;
}

export const useSceneInView = (anchors: readonly string[]): SceneInView => {
  const [current, setCurrent] = useState(0);
  const anchorKey = anchors.join('|');

  useEffect(() => {
    const ids = anchorKey === '' ? [] : anchorKey.split('|');
    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        const index = entered === undefined ? -1 : ids.indexOf(entered.target.id);
        if (index >= 0) {
          setCurrent(index);
        }
      },
      { rootMargin: READING_BAND },
    );
    for (const id of ids) {
      const anchor = document.getElementById(id);
      if (anchor !== null) {
        observer.observe(anchor);
      }
    }
    return () => observer.disconnect();
  }, [anchorKey]);

  return { current, setCurrent };
};
