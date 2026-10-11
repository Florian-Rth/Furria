import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useMeQuery } from '@/features/session';
import { newsDraftRequestsOf } from '../api';
import type { NewsDraftClock, NewsDraftSession, NewsDraftView } from '../news-draft-session';
import { createNewsDraftSession, createNewsSaveLedger } from '../news-draft-session';

export interface NewsDraftHandlers {
  onCreated: (newsPostId: number) => void;
  onCreationFailed: () => void;
}

export interface NewsDraft {
  sessionKey: number;
  session: NewsDraftSession;
  view: NewsDraftView;
}

interface KeyedSession {
  key: number;
  session: NewsDraftSession;
}

interface Latest {
  handlers: NewsDraftHandlers;
  myPersonId: number | null;
}

const newsSaveLedger = createNewsSaveLedger();

const systemClock: NewsDraftClock = {
  now: () => new Date().toISOString(),
  after: (delayMs, run) => {
    const timer = window.setTimeout(run, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  },
};

export const useNewsDraft = (postId: number | null, handlers: NewsDraftHandlers): NewsDraft => {
  const queryClient = useQueryClient();
  const me = useMeQuery();
  const latest = useRef<Latest>({ handlers, myPersonId: null });

  useEffect(() => {
    latest.current = { handlers, myPersonId: me.data?.person?.id ?? null };
  });

  const sessionFor = (key: number, newsPostId: number | null): KeyedSession => ({
    key,
    session: createNewsDraftSession({
      postId: newsPostId,
      requests: newsDraftRequestsOf(queryClient),
      clock: systemClock,
      ledger: newsSaveLedger,
      events: {
        created: (createdId) => {
          latest.current.handlers.onCreated(createdId);
        },
        creationFailed: () => {
          latest.current.handlers.onCreationFailed();
        },
      },
      myPersonId: () => latest.current.myPersonId,
    }),
  });

  const [current, setCurrent] = useState(() => sessionFor(0, postId));
  const [trackedPostId, setTrackedPostId] = useState(postId);
  const { session } = current;
  const view = useSyncExternalStore(session.subscribe, session.view, session.view);

  if (trackedPostId !== postId) {
    setTrackedPostId(postId);
    if (postId !== view.postId) {
      setCurrent(sessionFor(current.key + 1, postId));
    }
  }

  useEffect(() => {
    void session.open();
    const flushOnHide = (): void => {
      session.flush();
    };
    window.addEventListener('pagehide', flushOnHide);
    return () => {
      window.removeEventListener('pagehide', flushOnHide);
      session.leave();
    };
  }, [session]);

  return { sessionKey: current.key, session, view };
};
