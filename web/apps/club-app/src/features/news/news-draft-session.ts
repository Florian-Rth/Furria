import { isNotFoundError } from '@/lib/query-error';
import {
  changedPartsOf,
  EMPTY_FIELDS,
  fieldsOf,
  pictureOf,
  stageOf,
  versionOf,
  workingWireOf,
} from './news-lifecycle';
import type { SaveState } from './press-bar-facts';
import type { NewsContentPayload, NewsSavePayload } from './requests';
import type {
  CreatedNewsPost,
  ForeignSave,
  NewsPostDetails,
  PublishedNewsPost,
  SavedNewsPost,
} from './schemas';
import type {
  NewsFields,
  NewsPicture,
  NewsPublication,
  NewsSaver,
  NewsStage,
  NewsVersion,
  NewsVersionPart,
} from './types';

const SAVE_DELAY_MS = 700;
const RETRY_DELAYS_MS = [3_000, 6_000, 12_000, 24_000, 48_000] as const;
const DEVELOPING_POLL_MS = 3_000;

export class SaveFailedError extends Error {}

export interface NewsDraftRequests {
  read: (newsPostId: number) => Promise<NewsPostDetails>;
  create: (content: NewsContentPayload) => Promise<CreatedNewsPost>;
  save: (payload: NewsSavePayload) => Promise<SavedNewsPost>;
  publish: (newsPostId: number) => Promise<PublishedNewsPost>;
  publishChanges: (newsPostId: number) => Promise<PublishedNewsPost>;
  discardChanges: (newsPostId: number) => Promise<void>;
  withdraw: (newsPostId: number) => Promise<void>;
  remove: (newsPostId: number) => Promise<void>;
}

export interface NewsDraftClock {
  now: () => string;
  after: (delayMs: number, run: () => void) => () => void;
}

export interface NewsDraftEvents {
  created: (newsPostId: number) => void;
  creationFailed: () => void;
}

export interface NewsDraftView {
  postId: number | null;
  post: NewsPostDetails | null;
  isLoading: boolean;
  loadError: Error | null;
  isGone: boolean;
  fields: NewsFields;
  version: NewsVersion;
  live: NewsVersion | null;
  stage: NewsStage;
  changedParts: readonly NewsVersionPart[];
  status: SaveState;
  savedAt: string | null;
  foreignSave: NewsSaver | null;
}

export interface NewsDraftSession {
  subscribe: (listener: () => void) => () => void;
  view: () => NewsDraftView;
  open: () => Promise<void>;
  leave: () => void;
  edit: (patch: Partial<NewsFields>) => void;
  showUpload: (picture: NewsPicture | null) => void;
  flush: () => void;
  whenSaved: () => Promise<void>;
  runAfterSave: <T>(job: (newsPostId: number) => Promise<T>) => Promise<T>;
  publish: () => Promise<NewsPublication>;
  release: () => void;
  withdraw: () => Promise<void>;
  discard: () => Promise<void>;
  remove: () => Promise<void>;
}

export interface NewsSaveLedger {
  track: (newsPostId: number, work: Promise<void>) => void;
  settled: (newsPostId: number) => Promise<void>;
}

export interface NewsDraftSessionOptions {
  postId: number | null;
  requests: NewsDraftRequests;
  clock: NewsDraftClock;
  ledger: NewsSaveLedger;
  events: NewsDraftEvents;
  myPersonId: () => number | null;
}

interface PendingSave {
  fields: NewsFields;
  sequence: number;
  epoch: number;
}

type Cancel = () => void;

const NOTHING_TO_CANCEL: Cancel = () => undefined;

export const createNewsSaveLedger = (): NewsSaveLedger => {
  const inFlight = new Map<number, Promise<void>>();
  return {
    track: (newsPostId, work) => {
      const settled = (inFlight.get(newsPostId) ?? Promise.resolve()).then(() => work);
      inFlight.set(newsPostId, settled);
      void settled.then(() => {
        if (inFlight.get(newsPostId) === settled) {
          inFlight.delete(newsPostId);
        }
      });
    },
    settled: (newsPostId) => inFlight.get(newsPostId) ?? Promise.resolve(),
  };
};

const contentPayloadOf = (fields: NewsFields): NewsContentPayload => ({
  ...fields,
  pictureCaption: fields.pictureCaption.trim().length === 0 ? null : fields.pictureCaption,
});

const latestMomentOf = (left: string | null, right: string | null): string | null => {
  if (left === null || right === null) {
    return left ?? right;
  }
  return Date.parse(left) >= Date.parse(right) ? left : right;
};

const saverNameOf = (saver: ForeignSave['savedBy']): string | null =>
  saver === null ? null : `${saver.firstName} ${saver.lastName}`;

const isDeveloping = (post: NewsPostDetails): boolean =>
  [post.content.picture, post.pendingChanges?.picture].some(
    (picture) => picture?.state === 'processing',
  );

const ignore = (): void => undefined;

export const createNewsDraftSession = (options: NewsDraftSessionOptions): NewsDraftSession => {
  const { requests, clock, ledger, events } = options;
  const listeners = new Set<() => void>();
  let postId = options.postId;
  let post: NewsPostDetails | null = null;
  let heldPost: NewsPostDetails | null = null;
  let isSeeded = postId === null;
  let fields = EMPTY_FIELDS;
  let upload: NewsPicture | null = null;
  let revision: number | null = null;
  let status: SaveState = 'saved';
  let ownSavedAt: string | null = null;
  let seededSavedAt: string | null = null;
  let foreignSave: NewsSaver | null = null;
  let loadError: Error | null = null;
  let isGone = false;
  let isRemoved = false;
  let hasSavedWhileLive = false;
  let pending: PendingSave | null = null;
  let sequence = 0;
  let epoch = 0;
  let retries = 0;
  let chain: Promise<void> = Promise.resolve();
  let creation: Promise<number> | null = null;
  let isActive = true;
  let cancelDebounce = NOTHING_TO_CANCEL;
  let cancelRetry = NOTHING_TO_CANCEL;
  let cancelPoll = NOTHING_TO_CANCEL;

  const viewOf = (): NewsDraftView => {
    const shownPost = heldPost ?? post;
    const working = shownPost === null ? null : workingWireOf(shownPost);
    const version: NewsVersion = {
      ...fields,
      picture: upload ?? (working === null ? null : pictureOf(working.picture)),
      event: working?.event ?? null,
      album: working?.album ?? null,
    };
    const live = shownPost?.state === 'published' ? versionOf(shownPost.content) : null;
    const changedParts = live === null ? [] : changedPartsOf(live, version);
    const hasPendingCopy = hasSavedWhileLive || shownPost?.pendingChanges != null;
    return {
      postId,
      post: shownPost,
      isLoading: postId !== null && !isSeeded && loadError === null,
      loadError,
      isGone: isGone || isNotFoundError(loadError),
      fields,
      version,
      live,
      stage: stageOf(shownPost?.state ?? 'draft', changedParts.length > 0 || hasPendingCopy),
      changedParts,
      status,
      savedAt: latestMomentOf(ownSavedAt, seededSavedAt),
      foreignSave,
    };
  };

  let snapshot = viewOf();

  const emit = (): void => {
    snapshot = viewOf();
    for (const listener of listeners) {
      listener();
    }
  };

  const adoptRevision = (next: number): void => {
    revision = revision === null ? next : Math.max(revision, next);
  };

  const refresh = async (newsPostId: number): Promise<NewsPostDetails> => {
    await ledger.settled(newsPostId);
    const details = await requests.read(newsPostId);
    adoptRevision(details.revision);
    post = details;
    loadError = null;
    cancelPoll();
    if (isActive && isDeveloping(details)) {
      cancelPoll = clock.after(DEVELOPING_POLL_MS, () => {
        refresh(newsPostId).catch(ignore);
      });
    }
    emit();
    return details;
  };

  const seed = (details: NewsPostDetails, untouched: NewsFields): void => {
    if (fields === untouched) {
      fields = fieldsOf(workingWireOf(details));
    }
    isSeeded = true;
    seededSavedAt = details.pendingSavedAt ?? details.updatedAt;
    hasSavedWhileLive = false;
    emit();
  };

  const reopen = async (newsPostId: number): Promise<void> => {
    const untouched = fields;
    seed(await refresh(newsPostId), untouched);
  };

  const enqueue = (newsPostId: number, work: () => Promise<void>): Promise<void> => {
    const done = chain.then(work);
    chain = done.catch(ignore);
    ledger.track(newsPostId, chain);
    return done;
  };

  const scheduleRetry = (): void => {
    const delay = RETRY_DELAYS_MS[retries];
    cancelRetry();
    if (delay === undefined) {
      return;
    }
    retries += 1;
    cancelRetry = clock.after(delay, () => {
      cancelRetry = NOTHING_TO_CANCEL;
      void flushed();
    });
  };

  const adoptForeignSave = (inBetween: ForeignSave | null): void => {
    if (inBetween === null || inBetween.savedBy?.personId === options.myPersonId()) {
      return;
    }
    foreignSave = { name: saverNameOf(inBetween.savedBy), at: inBetween.savedAt };
  };

  const saveSnapshot = async (newsPostId: number, save: PendingSave): Promise<void> => {
    if (save.epoch !== epoch || isGone) {
      return;
    }
    status = 'saving';
    emit();
    try {
      const basedOnRevision = revision ?? (await requests.read(newsPostId)).revision;
      const saved = await requests.save({
        newsPostId,
        basedOnRevision,
        content: contentPayloadOf(save.fields),
      });
      adoptRevision(saved.revision);
      retries = 0;
      ownSavedAt = clock.now();
      status = pending === null ? 'saved' : 'saving';
      hasSavedWhileLive = post?.state === 'published';
      adoptForeignSave(saved.savedInBetween);
    } catch (error) {
      if (error instanceof Error && isNotFoundError(error)) {
        isGone = true;
        status = 'saved';
      } else {
        if (pending === null && save.sequence === sequence && save.epoch === epoch) {
          pending = save;
        }
        status = 'failed';
        scheduleRetry();
      }
    }
    emit();
  };

  const flushed = (): Promise<void> => {
    cancelDebounce();
    cancelDebounce = NOTHING_TO_CANCEL;
    const save = pending;
    pending = null;
    if (save !== null && postId !== null) {
      const newsPostId = postId;
      void enqueue(newsPostId, () => saveSnapshot(newsPostId, save));
    }
    return chain;
  };

  const schedule = (): void => {
    if (isGone || isRemoved) {
      return;
    }
    sequence += 1;
    pending = { fields, sequence, epoch };
    cancelDebounce();
    cancelDebounce = clock.after(SAVE_DELAY_MS, () => {
      cancelDebounce = NOTHING_TO_CANCEL;
      void flushed();
    });
  };

  const create = async (): Promise<number> => {
    const createdFrom = fields;
    try {
      const { newsPostId } = await requests.create(contentPayloadOf(createdFrom));
      postId = newsPostId;
      ownSavedAt = clock.now();
      emit();
      events.created(newsPostId);
      if (fields !== createdFrom) {
        schedule();
      }
      refresh(newsPostId).catch(ignore);
      return newsPostId;
    } catch (error) {
      creation = null;
      status = 'failed';
      emit();
      events.creationFailed();
      throw error;
    }
  };

  const ensurePost = (): Promise<number> => {
    if (postId !== null) {
      return Promise.resolve(postId);
    }
    creation ??= create();
    return creation;
  };

  const whenSaved = async (): Promise<void> => {
    await flushed();
    if (isGone || status === 'failed') {
      throw new SaveFailedError();
    }
  };

  const dropPending = (): void => {
    epoch += 1;
    pending = null;
    retries = 0;
    cancelDebounce();
    cancelRetry();
    cancelDebounce = NOTHING_TO_CANCEL;
    cancelRetry = NOTHING_TO_CANCEL;
    status = 'saved';
    emit();
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    view: () => snapshot,
    open: async () => {
      isActive = true;
      if (postId === null) {
        return;
      }
      const untouched = fields;
      try {
        const details = await refresh(postId);
        if (!isSeeded) {
          seed(details, untouched);
        }
      } catch (error) {
        if (error instanceof Error) {
          loadError = error;
          emit();
        }
      }
    },
    leave: () => {
      isActive = false;
      cancelPoll();
      void flushed();
    },
    edit: (patch) => {
      fields = { ...fields, ...patch };
      emit();
      if (postId !== null) {
        schedule();
        return;
      }
      ensurePost().catch(ignore);
    },
    showUpload: (picture) => {
      upload = picture;
      emit();
    },
    flush: () => {
      void flushed();
    },
    whenSaved,
    runAfterSave: async (job) => {
      const newsPostId = await ensurePost();
      await whenSaved();
      const result = await job(newsPostId);
      await refresh(newsPostId);
      return result;
    },
    publish: async () => {
      const newsPostId = postId;
      if (newsPostId === null) {
        throw new SaveFailedError();
      }
      const publishesChanges = snapshot.stage === 'pending';
      heldPost = post;
      await whenSaved();
      const published = publishesChanges
        ? await requests.publishChanges(newsPostId)
        : await requests.publish(newsPostId);
      adoptRevision(published.revision);
      await reopen(newsPostId).catch(ignore);
      return { slug: published.slug, publishedAt: published.publishedAt };
    },
    release: () => {
      heldPost = null;
      emit();
    },
    withdraw: async () => {
      if (postId === null) {
        return;
      }
      const newsPostId = postId;
      await whenSaved();
      await requests.withdraw(newsPostId);
      await reopen(newsPostId);
    },
    discard: async () => {
      if (postId === null) {
        return;
      }
      const newsPostId = postId;
      dropPending();
      await enqueue(newsPostId, () => requests.discardChanges(newsPostId));
      await reopen(newsPostId);
    },
    remove: async () => {
      if (postId === null) {
        return;
      }
      const newsPostId = postId;
      isRemoved = true;
      dropPending();
      try {
        await enqueue(newsPostId, () => requests.remove(newsPostId));
      } catch (error) {
        isRemoved = false;
        throw error;
      }
    },
  };
};
