import { useEffect, useRef, useState } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useNewsPostFetch, useNewsPostSave } from '../api';
import { contentPayloadOf, isRestorableSave, nextRetryDelayOf } from '../news-saving';
import type { SaveState } from '../press-bar-facts';
import type { ForeignSave } from '../schemas';
import type { NewsFields, NewsSaver } from '../types';

const AUTOSAVE_DELAY_MS = 700;

export interface NewsSaveTarget {
  postId: number;
  fields: NewsFields;
}

interface SaveSnapshot extends NewsSaveTarget {
  sequence: number;
}

interface KnownRevision {
  postId: number;
  revision: number;
}

export interface NewsAutosaveOptions {
  isLive: boolean;
  myPersonId: number | null;
  serverRevision: KnownRevision | null;
}

export interface NewsAutosave {
  status: SaveState;
  savedAt: string | null;
  foreignSave: NewsSaver | null;
  isGone: boolean;
  hasSavedWhileLive: boolean;
  schedule: (target: NewsSaveTarget) => void;
  flush: () => Promise<boolean>;
  drop: () => void;
  forgetSavedWhileLive: () => void;
  reset: () => void;
}

const nameOf = (saver: ForeignSave['savedBy']): string | null =>
  saver === null ? null : `${saver.firstName} ${saver.lastName}`;

export const useNewsAutosave = (options: NewsAutosaveOptions): NewsAutosave => {
  const save = useNewsPostSave();
  const fetchPost = useNewsPostFetch();
  const [status, setStatus] = useState<SaveState>('saved');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [foreignSave, setForeignSave] = useState<NewsSaver | null>(null);
  const [isGone, setIsGone] = useState(false);
  const [hasSavedWhileLive, setHasSavedWhileLive] = useState(false);
  const latest = useRef(options);
  const pending = useRef<SaveSnapshot | null>(null);
  const newestSequence = useRef(0);
  const ownRevision = useRef<KnownRevision | null>(null);
  const inFlight = useRef<Promise<boolean>>(Promise.resolve(true));
  const debounceTimer = useRef<number | null>(null);
  const retryTimer = useRef<number | null>(null);
  const retries = useRef(0);
  const flushLatest = useRef<() => Promise<boolean>>(() => Promise.resolve(true));

  useEffect(() => {
    latest.current = options;
  });

  const clearTimer = (timer: { current: number | null }): void => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const revisionOf = async (postId: number): Promise<number> => {
    const known = [ownRevision.current, latest.current.serverRevision]
      .filter((entry): entry is KnownRevision => entry?.postId === postId)
      .map((entry) => entry.revision);
    if (known.length > 0) {
      return Math.max(...known);
    }
    const fresh = await fetchPost(postId);
    return fresh.revision;
  };

  const adoptForeignSave = (inBetween: ForeignSave | null): void => {
    if (inBetween === null || inBetween.savedBy?.personId === latest.current.myPersonId) {
      return;
    }
    setForeignSave({ name: nameOf(inBetween.savedBy), at: inBetween.savedAt });
  };

  const scheduleRetry = (): void => {
    const delay = nextRetryDelayOf(retries.current);
    clearTimer(retryTimer);
    if (delay === null) {
      return;
    }
    retries.current += 1;
    retryTimer.current = window.setTimeout(() => {
      retryTimer.current = null;
      void flushLatest.current();
    }, delay);
  };

  const saveSnapshot = async (snapshot: SaveSnapshot): Promise<boolean> => {
    setStatus('saving');
    try {
      const saved = await save.mutateAsync({
        newsPostId: snapshot.postId,
        basedOnRevision: await revisionOf(snapshot.postId),
        content: contentPayloadOf(snapshot.fields),
      });
      ownRevision.current = { postId: snapshot.postId, revision: saved.revision };
      retries.current = 0;
      setSavedAt(new Date().toISOString());
      setStatus(pending.current === null ? 'saved' : 'saving');
      setHasSavedWhileLive(latest.current.isLive);
      adoptForeignSave(saved.savedInBetween);
      return true;
    } catch (error) {
      if (error instanceof Error && isNotFoundError(error)) {
        setIsGone(true);
        setStatus('saved');
        return false;
      }
      if (isRestorableSave(snapshot.sequence, newestSequence.current, pending.current !== null)) {
        pending.current = snapshot;
      }
      setStatus('failed');
      scheduleRetry();
      return false;
    }
  };

  const flush = (): Promise<boolean> => {
    clearTimer(debounceTimer);
    const snapshot = pending.current;
    pending.current = null;
    const next = inFlight.current.then((previousSaved) =>
      snapshot === null ? previousSaved && pending.current === null : saveSnapshot(snapshot),
    );
    inFlight.current = next;
    return next;
  };

  useEffect(() => {
    flushLatest.current = flush;
  });

  useEffect(() => {
    const flushOnHide = (): void => {
      void flushLatest.current();
    };
    window.addEventListener('pagehide', flushOnHide);
    return () => {
      window.removeEventListener('pagehide', flushOnHide);
      void flushLatest.current();
    };
  }, []);

  const schedule = (target: NewsSaveTarget): void => {
    if (pending.current !== null && pending.current.postId !== target.postId) {
      void flush();
    }
    newestSequence.current += 1;
    pending.current = { ...target, sequence: newestSequence.current };
    clearTimer(debounceTimer);
    debounceTimer.current = window.setTimeout(() => {
      debounceTimer.current = null;
      void flushLatest.current();
    }, AUTOSAVE_DELAY_MS);
  };

  return {
    status,
    savedAt,
    foreignSave,
    isGone,
    hasSavedWhileLive,
    schedule,
    flush,
    drop: () => {
      clearTimer(debounceTimer);
      clearTimer(retryTimer);
      pending.current = null;
      setStatus('saved');
    },
    forgetSavedWhileLive: () => {
      setHasSavedWhileLive(false);
    },
    reset: () => {
      setStatus('saved');
      setSavedAt(null);
      setForeignSave(null);
      setIsGone(false);
      setHasSavedWhileLive(false);
    },
  };
};
