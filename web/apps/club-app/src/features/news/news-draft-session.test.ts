import { ApiError } from '@furria/api-client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PictureEditing } from '@/lib/api/schemas';
import type {
  NewsDraftClock,
  NewsDraftRequests,
  NewsDraftSession,
  NewsSaveLedger,
} from './news-draft-session';
import { createNewsDraftSession, createNewsSaveLedger } from './news-draft-session';
import type { NewsContentPayload } from './requests';
import type { ForeignSave, NewsPostDetails, NewsPostState, NewsPostVersion } from './schemas';

const SAVE_DELAY_MS = 700;
const FIRST_RETRY_MS = 3_000;
const POST_ID = 7;
const ME = 1;

interface StoredPost {
  state: NewsPostState;
  content: NewsPostVersion;
  pendingChanges: NewsPostVersion | null;
  revision: number;
}

interface FakeNewsServer {
  requests: NewsDraftRequests;
  stored: () => StoredPost | null;
  holdSaves: () => void;
  releaseSaves: () => Promise<void>;
  failNextSaves: (count: number) => void;
  failNextReads: (count: number) => void;
  showPicture: (picture: PictureEditing) => void;
  reportSaveInBetween: (inBetween: ForeignSave) => void;
  deletePost: () => void;
  createdCount: () => number;
  savedTexts: () => readonly string[];
}

const wireOf = (text: string, title: string): NewsPostVersion => ({
  title,
  teaser: 'Um 11:11 Uhr.',
  text,
  category: 'session',
  event: null,
  album: null,
  picture: null,
  pictureCaption: null,
});

const wireOfContent = (content: NewsContentPayload): NewsPostVersion => ({
  title: content.title,
  teaser: content.teaser,
  text: content.text,
  category: content.category,
  event: null,
  album: null,
  picture: null,
  pictureCaption: content.pictureCaption,
});

const fakeNewsServer = (initial: StoredPost | null): FakeNewsServer => {
  let stored = initial;
  let isHolding = false;
  let failures = 0;
  let readFailures = 0;
  let inBetween: ForeignSave | null = null;
  let created = 0;
  const heldSaves: (() => void)[] = [];
  const saved: string[] = [];

  const existing = (): StoredPost => {
    if (stored === null) {
      throw new ApiError({ kind: 'status', status: 404 });
    }
    return stored;
  };

  const detailsOf = (newsPostId: number, post: StoredPost): NewsPostDetails => ({
    newsPostId,
    state: post.state,
    slug: post.state === 'draft' ? null : 'prinzenpaar',
    publishedAt: post.state === 'draft' ? null : '2026-10-10T09:00:00Z',
    withdrawnAt: post.state === 'withdrawn' ? '2026-10-10T10:00:00Z' : null,
    author: null,
    lastSavedBy: null,
    revision: post.revision,
    updatedAt: '2026-10-10T09:00:00Z',
    content: post.content,
    pendingSavedAt: null,
    pendingChanges: post.pendingChanges,
  });

  const published = (post: StoredPost, content: NewsPostVersion): StoredPost => ({
    state: 'published',
    content,
    pendingChanges: null,
    revision: post.revision + 1,
  });

  return {
    requests: {
      read: async (newsPostId) => {
        if (readFailures > 0) {
          readFailures -= 1;
          throw new ApiError({ kind: 'status', status: 503 });
        }
        return detailsOf(newsPostId, existing());
      },
      create: async (content) => {
        created += 1;
        stored = {
          state: 'draft',
          content: wireOfContent(content),
          pendingChanges: null,
          revision: 1,
        };
        return { newsPostId: POST_ID };
      },
      save: async ({ content }) => {
        if (isHolding) {
          await new Promise<void>((resume) => {
            heldSaves.push(resume);
          });
        }
        if (failures > 0) {
          failures -= 1;
          throw new ApiError({ kind: 'status', status: 503 });
        }
        const post = existing();
        const wire = wireOfContent(content);
        stored =
          post.state === 'published'
            ? { ...post, pendingChanges: wire, revision: post.revision + 1 }
            : { ...post, content: wire, revision: post.revision + 1 };
        saved.push(content.text);
        const savedInBetween = inBetween;
        inBetween = null;
        return { revision: stored.revision, savedInBetween };
      },
      publish: async () => {
        const post = existing();
        stored = published(post, post.content);
        return { slug: 'prinzenpaar', publishedAt: '2026-10-11T09:00:00Z', revision: 2 };
      },
      publishChanges: async () => {
        const post = existing();
        stored = published(post, post.pendingChanges ?? post.content);
        return { slug: 'prinzenpaar', publishedAt: '2026-10-11T09:00:00Z', revision: 2 };
      },
      discardChanges: async () => {
        const post = existing();
        stored = { ...post, pendingChanges: null, revision: post.revision + 1 };
      },
      withdraw: async () => {
        const post = existing();
        stored = { ...post, state: 'withdrawn', revision: post.revision + 1 };
      },
      remove: async () => {
        existing();
        stored = null;
      },
    },
    stored: () => stored,
    holdSaves: () => {
      isHolding = true;
    },
    releaseSaves: async () => {
      isHolding = false;
      for (const resume of heldSaves.splice(0)) {
        resume();
      }
      await vi.advanceTimersByTimeAsync(0);
    },
    failNextSaves: (count) => {
      failures = count;
    },
    failNextReads: (count) => {
      readFailures = count;
    },
    showPicture: (picture) => {
      const post = existing();
      stored = { ...post, content: { ...post.content, picture } };
    },
    reportSaveInBetween: (next) => {
      inBetween = next;
    },
    deletePost: () => {
      stored = null;
    },
    createdCount: () => created,
    savedTexts: () => saved,
  };
};

const fakeClock: NewsDraftClock = {
  now: () => new Date().toISOString(),
  after: (delayMs, run) => {
    const timer = setTimeout(run, delayMs);
    return () => {
      clearTimeout(timer);
    };
  },
};

const sessionOn = (
  server: FakeNewsServer,
  ledger: NewsSaveLedger,
  postId: number | null,
): NewsDraftSession =>
  createNewsDraftSession({
    postId,
    requests: server.requests,
    clock: fakeClock,
    ledger,
    events: { created: () => undefined, creationFailed: () => undefined },
    myPersonId: () => ME,
  });

const openedSession = async (
  server: FakeNewsServer,
  ledger: NewsSaveLedger = createNewsSaveLedger(),
): Promise<NewsDraftSession> => {
  const session = sessionOn(server, ledger, POST_ID);
  await session.open();
  return session;
};

const typingPause = async (): Promise<void> => {
  await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS);
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('saving', () => {
  it('keeps the newest text when an edit arrives during a failed save', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);
    server.holdSaves();
    server.failNextSaves(1);

    session.edit({ text: 'Erster Entwurf' });
    await typingPause();
    session.edit({ text: 'Zweiter Entwurf' });
    await server.releaseSaves();
    await typingPause();
    await vi.advanceTimersByTimeAsync(FIRST_RETRY_MS);

    expect(server.stored()?.content.text).toBe('Zweiter Entwurf');
    expect(server.savedTexts()).toEqual(['Zweiter Entwurf']);
    expect(session.view().status).toBe('saved');
  });

  it('retries a failed save without newer edits', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);
    server.failNextSaves(1);

    session.edit({ text: 'Neu' });
    await typingPause();
    const afterFailure = session.view().status;
    await vi.advanceTimersByTimeAsync(FIRST_RETRY_MS);

    expect(afterFailure).toBe('failed');
    expect(server.stored()?.content.text).toBe('Neu');
    expect(session.view().status).toBe('saved');
  });

  it('creates the post on the first keystroke and saves edits made meanwhile', async () => {
    const server = fakeNewsServer(null);
    const session = sessionOn(server, createNewsSaveLedger(), null);

    session.edit({ title: 'Prinzenpaar' });
    session.edit({ text: 'Proklamiert.' });
    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS);

    expect(server.createdCount()).toBe(1);
    expect(session.view().postId).toBe(POST_ID);
    expect(server.stored()?.content).toMatchObject({ title: 'Prinzenpaar', text: 'Proklamiert.' });
  });

  it('marks the post gone when a save finds it deleted', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);
    server.deletePost();

    session.edit({ text: 'Neu' });
    await typingPause();

    expect(session.view()).toMatchObject({ isGone: true, status: 'saved' });
  });

  it('marks the post gone when opening finds it deleted', async () => {
    const session = await openedSession(fakeNewsServer(null));

    expect(session.view().isGone).toBe(true);
  });

  it.each([
    { savedBy: { personId: 2, firstName: 'Anna', lastName: 'Narr' }, expected: 'Anna Narr' },
    { savedBy: { personId: ME, firstName: 'Ich', lastName: 'Selbst' }, expected: null },
  ])(
    'reports a save in between by $savedBy.firstName as $expected',
    async ({ savedBy, expected }) => {
      const server = fakeNewsServer({
        state: 'draft',
        content: wireOf('Alt', 'Titel'),
        pendingChanges: null,
        revision: 1,
      });
      const session = await openedSession(server);
      server.reportSaveInBetween({ savedBy, savedAt: '2026-10-11T08:00:00Z' });

      session.edit({ text: 'Neu' });
      await typingPause();

      expect(session.view().foreignSave?.name ?? null).toBe(expected);
    },
  );
});

describe('developing picture', () => {
  const DEVELOPING_POLL_MS = 3_000;
  const STALLED_POLL_MS = 30_000;
  const developing: PictureEditing = {
    state: 'processing',
    isStalled: false,
    picture: null,
    uncroppedUrl: null,
    crop: null,
  };
  const failed: PictureEditing = { ...developing, state: 'failed' };
  const developingServer = (): FakeNewsServer =>
    fakeNewsServer({
      state: 'draft',
      content: { ...wireOf('Text', 'Titel'), picture: developing },
      pendingChanges: null,
      revision: 1,
    });

  it('keeps following the picture after a read fails', async () => {
    const server = developingServer();
    const session = await openedSession(server);
    server.failNextReads(1);

    await vi.advanceTimersByTimeAsync(DEVELOPING_POLL_MS);
    server.showPicture(failed);
    await vi.advanceTimersByTimeAsync(DEVELOPING_POLL_MS);

    expect(session.view().version.picture?.state).toBe('failed');
  });

  it('reports a picture stuck developing and then asks less often', async () => {
    const server = developingServer();
    const session = await openedSession(server);
    server.showPicture({ ...developing, isStalled: true });

    await vi.advanceTimersByTimeAsync(DEVELOPING_POLL_MS);
    const stuck = session.view().version.picture?.state;
    server.showPicture(failed);
    await vi.advanceTimersByTimeAsync(DEVELOPING_POLL_MS);
    const soonAfter = session.view().version.picture?.state;
    await vi.advanceTimersByTimeAsync(STALLED_POLL_MS);

    expect([stuck, soonAfter, session.view().version.picture?.state]).toEqual([
      'stalled',
      'stalled',
      'failed',
    ]);
  });
});

describe('leaving', () => {
  it('shows the newest text when the post is opened again', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const ledger = createNewsSaveLedger();
    const leaving = await openedSession(server, ledger);
    server.holdSaves();

    leaving.edit({ text: 'Zuletzt getippt' });
    leaving.leave();
    const returning = sessionOn(server, ledger, POST_ID);
    const opening = returning.open();
    await server.releaseSaves();
    await opening;

    expect(returning.view().fields.text).toBe('Zuletzt getippt');
  });
});

describe('discarding', () => {
  it('waits for a save in flight so it cannot bring the changes back', async () => {
    const server = fakeNewsServer({
      state: 'published',
      content: wireOf('Live', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);
    server.holdSaves();

    session.edit({ text: 'Verworfen' });
    await typingPause();
    const discarding = session.discard();
    await server.releaseSaves();
    await discarding;

    expect(server.stored()?.pendingChanges).toBeNull();
    expect(session.view()).toMatchObject({ stage: 'live', fields: { text: 'Live' } });
  });

  it('never saves edits still waiting for the typing pause', async () => {
    const server = fakeNewsServer({
      state: 'published',
      content: wireOf('Live', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);

    session.edit({ text: 'Verworfen' });
    await session.discard();
    await typingPause();

    expect(server.savedTexts()).toEqual([]);
  });

  it('removes the post only after the save in flight', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);
    server.holdSaves();

    session.edit({ text: 'Neu' });
    await typingPause();
    const removing = session.remove();
    await server.releaseSaves();
    await removing;
    session.edit({ text: 'Danach' });
    await typingPause();

    expect(server.stored()).toBeNull();
    expect(server.savedTexts()).toEqual(['Neu']);
  });
});

describe('publishing', () => {
  it('publishes the pending edit', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);

    session.edit({ text: 'Frisch getippt' });
    await session.publish();

    expect(server.stored()).toMatchObject({
      state: 'published',
      content: { text: 'Frisch getippt' },
    });
  });

  it('publishes pending changes of a live post as its new content', async () => {
    const server = fakeNewsServer({
      state: 'published',
      content: wireOf('Live', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);

    session.edit({ text: 'Korrigiert' });
    await session.publish();
    session.release();

    expect(server.stored()).toMatchObject({
      content: { text: 'Korrigiert' },
      pendingChanges: null,
    });
    expect(session.view().stage).toBe('live');
  });

  it('holds the shown post until released', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);

    await session.publish();
    const held = session.view().stage;
    session.release();

    expect([held, session.view().stage]).toEqual(['draft', 'live']);
  });

  it('refuses to publish when the pending save fails', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);
    server.failNextSaves(1);

    session.edit({ text: 'Neu' });
    const publishing = session.publish();

    await expect(publishing).rejects.toThrow();
    expect(server.stored()?.state).toBe('draft');
  });
});

describe('running after the save', () => {
  it('runs the job once the pending edit is saved', async () => {
    const server = fakeNewsServer({
      state: 'draft',
      content: wireOf('Alt', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);

    session.edit({ text: 'Vor dem Bild' });
    const textAtJob = await session.runAfterSave(async () => server.stored()?.content.text);

    expect(textAtJob).toBe('Vor dem Bild');
  });

  it('creates the post before running the job on a new post', async () => {
    const server = fakeNewsServer(null);
    const session = sessionOn(server, createNewsSaveLedger(), null);

    const jobPostId = await session.runAfterSave(async (newsPostId) => newsPostId);

    expect(jobPostId).toBe(POST_ID);
  });
});

describe('stage', () => {
  it.each([
    { state: 'draft', edit: {}, stage: 'draft', changed: [] },
    { state: 'published', edit: {}, stage: 'live', changed: [] },
    { state: 'published', edit: { title: 'Neu' }, stage: 'pending', changed: ['title'] },
    { state: 'withdrawn', edit: { title: 'Neu' }, stage: 'withdrawn', changed: [] },
  ] as const)('$state edited with $edit is $stage', async ({ state, edit, stage, changed }) => {
    const session = await openedSession(
      fakeNewsServer({
        state,
        content: wireOf('Text', 'Titel'),
        pendingChanges: null,
        revision: 1,
      }),
    );

    session.edit(edit);

    expect(session.view()).toMatchObject({ stage, changedParts: changed });
  });

  it('stays pending after saving a change back to the live text', async () => {
    const server = fakeNewsServer({
      state: 'published',
      content: wireOf('Live', 'Titel'),
      pendingChanges: null,
      revision: 1,
    });
    const session = await openedSession(server);

    session.edit({ text: 'Live' });
    await typingPause();

    expect(session.view().stage).toBe('pending');
  });
});
