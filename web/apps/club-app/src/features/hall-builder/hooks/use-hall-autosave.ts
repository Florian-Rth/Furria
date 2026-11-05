import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSaveHallMutation } from '@/features/hall-plan/api';
import { isPlanVersionConflict } from '@/features/hall-plan/requests';
import type { HallDocument } from '@/features/hall-plan/schemas';

const SAVE_DELAY_MS = 800;

export type HallSaveState = 'saved' | 'saving' | 'pending' | 'failed';

interface HallDraftContent {
  name: string;
  document: HallDocument;
}

interface HallAutosaveOptions {
  hallId: number;
  version: number;
  content: HallDraftContent;
  onConflict: () => void;
}

const isSame = (left: HallDraftContent, right: HallDraftContent): boolean =>
  left.name === right.name && left.document === right.document;

const isSavable = (content: HallDraftContent): boolean =>
  content.name.trim().length > 0 &&
  content.document.elements.every(
    (element) => element.kind !== 'text' || element.text.trim().length > 0,
  );

export const useHallAutosave = (options: HallAutosaveOptions): HallSaveState => {
  const save = useSaveHallMutation(options.hallId);
  const [state, setState] = useState<HallSaveState>('saved');
  const saved = useRef<HallDraftContent>(options.content);
  const version = useRef(options.version);
  const latest = useRef(options);
  const timer = useRef<number | null>(null);
  const busy = useRef(false);

  useLayoutEffect(() => {
    latest.current = options;
  });

  const flush = (): void => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    const content = latest.current.content;
    if (busy.current || isSame(content, saved.current) || !isSavable(content)) {
      return;
    }
    busy.current = true;
    setState('saving');
    save.mutate(
      { name: content.name.trim(), document: content.document, version: version.current },
      {
        onSuccess: (result) => {
          version.current = result.version;
          saved.current = content;
          busy.current = false;
          const settled = isSame(latest.current.content, content);
          setState(settled ? 'saved' : 'pending');
          if (!settled) {
            flush();
          }
        },
        onError: (error) => {
          busy.current = false;
          if (isPlanVersionConflict(error)) {
            latest.current.onConflict();
            return;
          }
          setState('failed');
        },
      },
    );
  };

  const flushing = useRef(flush);

  useLayoutEffect(() => {
    flushing.current = flush;
  });

  const { name, document: plan } = options.content;

  useEffect(() => {
    if (isSame({ name, document: plan }, saved.current)) {
      return;
    }
    setState('pending');
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      flushing.current();
    }, SAVE_DELAY_MS);
  }, [name, plan]);

  useEffect(() => {
    const flushNow = (): void => {
      flushing.current();
    };
    const hide = (): void => {
      if (document.visibilityState === 'hidden') {
        flushNow();
      }
    };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', flushNow);

    return () => {
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('pagehide', flushNow);
      flushNow();
    };
  }, []);

  return state;
};
