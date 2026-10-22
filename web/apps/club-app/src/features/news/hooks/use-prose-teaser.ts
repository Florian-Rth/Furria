import { useKkTextMeasure } from '@furria/ui/use-kk-text-measure';
import { useEffect, useEffectEvent, useState } from 'react';
import type { NewsTeaserEditor } from '../news-text-editor';
import { createNewsTeaserEditor } from '../news-text-editor';
import type { TextMeasure } from '../teaser-cuts';

export interface ProseTeaser {
  hostRef: (node: HTMLDivElement | null) => void;
}

interface ProseTeaserOptions {
  teaser: string;
  isReadOnly: boolean;
  onChange: (teaser: string) => void;
}

export const useProseTeaser = ({
  teaser,
  isReadOnly,
  onChange,
}: ProseTeaserOptions): ProseTeaser => {
  const measure = useKkTextMeasure();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<NewsTeaserEditor | null>(null);
  const emitChange = useEffectEvent(onChange);
  const currentMeasure = useEffectEvent((): TextMeasure => measure);
  const openingTeaser = useEffectEvent((): string => teaser);

  useEffect(() => {
    if (host === null) {
      return;
    }
    const created = createNewsTeaserEditor(host, {
      teaser: openingTeaser(),
      measureOf: () => currentMeasure(),
      onChange: (next) => {
        emitChange(next);
      },
    });
    setEditor(created);
    return () => {
      created.destroy();
      setEditor(null);
    };
  }, [host]);

  useEffect(() => {
    editor?.showTeaser(teaser);
  }, [editor, teaser]);

  useEffect(() => {
    editor?.setReadOnly(isReadOnly);
  }, [editor, isReadOnly]);

  return { hostRef: setHost };
};
