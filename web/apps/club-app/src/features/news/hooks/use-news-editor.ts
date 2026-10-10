import { useKkNotice } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { NEWS_PATH, useMeQuery } from '@/features/session';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';
import {
  useNewsPostCreation,
  useNewsPostDeletion,
  useNewsPostFetch,
  useNewsPostQuery,
  useNewsPublication,
  useNewsWithdrawal,
  usePendingChangesDiscard,
  usePendingChangesPublication,
} from '../api';
import { ACTION_FAILED, PUBLISH_FAILED } from '../editor-copy';
import { HUB_ERROR_MESSAGES } from '../hub-copy';
import { MANAGING_LOGIN_NAME, NEW_POST_ID, NEWS_EDITOR_ROUTE } from '../news-copy';
import { revealNewsField } from '../news-fields';
import {
  changedPartsOf,
  EMPTY_FIELDS,
  fieldsOf,
  missingOf,
  pictureOf,
  stageOf,
  versionOf,
  workingWireOf,
} from '../news-lifecycle';
import { latestMomentOf, SaveFailedError } from '../news-saving';
import type { SaveState } from '../press-bar-facts';
import { isPressBusy, pressKindOf } from '../press-run';
import type { NewsPostDetails } from '../schemas';
import type {
  NewsFields,
  NewsPicture,
  NewsPublication,
  NewsRequirement,
  NewsSaver,
  NewsStage,
  NewsVersion,
  NewsVersionPart,
} from '../types';
import { useNewsAutosave } from './use-news-autosave';
import type { PressRun } from './use-press-run';
import { usePressRun } from './use-press-run';

export type EditorDialog = 'withdraw' | 'discard' | 'delete';

export interface EditorDialogState {
  kind: EditorDialog;
  isOpen: boolean;
}

export interface NewsEditor {
  sceneKey: string;
  postId: number | null;
  post: NewsPostDetails | null;
  isLoading: boolean;
  loadError: string | null;
  reload: () => void;
  isGone: boolean;
  version: NewsVersion;
  live: NewsVersion | null;
  isReadOnly: boolean;
  stage: NewsStage;
  authorName: string | null;
  signerName: string;
  changedParts: readonly NewsVersionPart[];
  liveText: string | null;
  missing: readonly NewsRequirement[];
  flaggedMissing: readonly NewsRequirement[];
  saveStatus: SaveState;
  savedAt: string | null;
  foreignSave: NewsSaver | null;
  showsLive: boolean;
  liveKey: number;
  withdrawKey: number;
  dialog: EditorDialogState | null;
  press: PressRun;
  update: (patch: Partial<NewsFields>) => void;
  showUpload: (picture: NewsPicture | null) => void;
  settlePicture: (job: (newsPostId: number) => Promise<void>) => Promise<void>;
  toggleLive: () => void;
  requestPublish: () => void;
  openDialog: (dialog: EditorDialog) => void;
  closeDialog: () => void;
  confirmDialog: () => void;
}

interface PersonName {
  firstName: string;
  lastName: string;
}

interface PendingCreation {
  session: number;
  promise: Promise<number>;
}

const NO_KEY = 0;

const nameOf = (person: PersonName | null): string | null =>
  person === null ? null : `${person.firstName} ${person.lastName}`;

const postIdOf = (routePostId: string): number | null => {
  const parsed = Number(routePostId);
  return routePostId === NEW_POST_ID || !Number.isInteger(parsed) || parsed <= 0 ? null : parsed;
};

const isSettling = (picture: NewsPicture | null): boolean => picture?.state === 'uploading';

export const useNewsEditor = (routePostId: string): NewsEditor => {
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();
  const me = useMeQuery();
  const fetchPost = useNewsPostFetch();
  const creation = useNewsPostCreation();
  const publication = useNewsPublication();
  const changesPublication = usePendingChangesPublication();
  const discard = usePendingChangesDiscard();
  const withdrawal = useNewsWithdrawal();
  const deletion = useNewsPostDeletion();
  const [createdId, setCreatedId] = useState<number | null>(null);
  const postId = postIdOf(routePostId) ?? createdId;
  const query = useNewsPostQuery(postId);
  const [heldPost, setHeldPost] = useState<NewsPostDetails | null>(null);
  const post = heldPost ?? query.data ?? null;
  const [seededId, setSeededId] = useState<number | null>(null);
  const [seededSavedAt, setSeededSavedAt] = useState<string | null>(null);
  const [fields, setFields] = useState<NewsFields>(EMPTY_FIELDS);
  const [upload, setUpload] = useState<NewsPicture | null>(null);
  const [flagged, setFlagged] = useState<readonly NewsRequirement[]>([]);
  const [showsLive, setShowsLive] = useState(false);
  const [liveKey, setLiveKey] = useState(NO_KEY);
  const [withdrawKey, setWithdrawKey] = useState(NO_KEY);
  const [dialog, setDialog] = useState<EditorDialogState | null>(null);
  const [trackedRoute, setTrackedRoute] = useState(routePostId);
  const fieldsRef = useRef(fields);
  const creatingRef = useRef<PendingCreation | null>(null);
  const [editSession, setEditSession] = useState(0);
  const myPersonId = me.data?.person?.id ?? null;
  const autosave = useNewsAutosave({
    isLive: post?.state === 'published',
    myPersonId,
    serverRevision:
      query.data === undefined
        ? null
        : { postId: query.data.newsPostId, revision: query.data.revision },
  });

  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  const seed = (details: NewsPostDetails): void => {
    setFields(fieldsOf(workingWireOf(details)));
    setSeededId(details.newsPostId);
    setSeededSavedAt(details.pendingSavedAt ?? details.updatedAt);
    setFlagged([]);
    setShowsLive(false);
  };

  if (trackedRoute !== routePostId) {
    setTrackedRoute(routePostId);
    if (postIdOf(routePostId) !== createdId) {
      setEditSession((session) => session + 1);
      setCreatedId(null);
      setSeededId(null);
      setSeededSavedAt(null);
      setFields(EMPTY_FIELDS);
      setUpload(null);
      setFlagged([]);
      setShowsLive(false);
      autosave.reset();
    }
  }

  if (post !== null && seededId !== post.newsPostId) {
    seed(post);
  }

  const signerName = nameOf(me.data?.person ?? null) ?? MANAGING_LOGIN_NAME;
  const isGone = autosave.isGone || isNotFoundError(query.error);
  const working = post === null ? null : workingWireOf(post);
  const serverPicture = working === null ? null : pictureOf(working.picture);
  const version: NewsVersion = {
    ...fields,
    picture: upload ?? serverPicture,
    event: working?.event ?? null,
    album: working?.album ?? null,
  };
  const live = post?.state === 'published' ? versionOf(post.content) : null;
  const changedParts = live === null ? [] : changedPartsOf(live, version);
  const hasPendingCopy = autosave.hasSavedWhileLive || post?.pendingChanges != null;
  const stage = stageOf(post?.state ?? 'draft', changedParts.length > 0 || hasPendingCopy);
  const missing = missingOf(fields);

  const raiseActionFailure = (): void => {
    raiseNotice({ tone: 'error', message: ACTION_FAILED });
  };

  const create = (): Promise<number> => {
    if (creatingRef.current?.session === editSession) {
      return creatingRef.current.promise;
    }
    const created = creation
      .mutateAsync({ ...fieldsRef.current, pictureCaption: null })
      .then(({ newsPostId }) => {
        flushSync(() => {
          setCreatedId(newsPostId);
          setSeededId(newsPostId);
          setSeededSavedAt(new Date().toISOString());
        });
        void navigate({
          to: NEWS_EDITOR_ROUTE,
          params: { postId: String(newsPostId) },
          replace: true,
        });
        return newsPostId;
      });
    creatingRef.current = { session: editSession, promise: created };
    created.catch(() => {
      creatingRef.current = null;
      raiseActionFailure();
    });
    return created;
  };

  const ensurePost = (): Promise<number> => (postId === null ? create() : Promise.resolve(postId));

  const saveFirst = async (): Promise<void> => {
    if (!(await autosave.flush())) {
      throw new SaveFailedError();
    }
  };

  const update = (patch: Partial<NewsFields>): void => {
    const next = { ...fieldsRef.current, ...patch };
    fieldsRef.current = next;
    setFields(next);
    setFlagged((current) => current.filter((requirement) => missingOf(next).includes(requirement)));
    if (postId !== null) {
      autosave.schedule({ postId, fields: next });
      return;
    }
    create().then(
      (id) => {
        autosave.schedule({ postId: id, fields: fieldsRef.current });
      },
      () => undefined,
    );
  };

  const settlePicture = async (job: (newsPostId: number) => Promise<void>): Promise<void> => {
    const id = await ensurePost();
    await saveFirst();
    await job(id);
    await fetchPost(id);
  };

  const reseedFrom = async (id: number): Promise<void> => {
    seed(await fetchPost(id));
    autosave.forgetSavedWhileLive();
  };

  const press = usePressRun({
    onPublished: () => {
      setHeldPost(null);
      if (postId !== null) {
        reseedFrom(postId).catch(raiseActionFailure);
      }
      setLiveKey((key) => key + 1);
      setWithdrawKey(NO_KEY);
    },
    onFailed: () => {
      setHeldPost(null);
      raiseNotice({ tone: 'error', message: PUBLISH_FAILED });
    },
  });

  const publish = async (id: number, publishesChanges: boolean): Promise<NewsPublication> => {
    await saveFirst();
    const published = publishesChanges
      ? await changesPublication.mutateAsync(id)
      : await publication.mutateAsync(id);
    return { slug: published.slug, publishedAt: published.publishedAt };
  };

  const requestPublish = (): void => {
    if (missing.length > 0) {
      setFlagged(missing);
      const [first] = missing;
      if (first !== undefined) {
        revealNewsField(first);
      }
      return;
    }
    if (postId === null || isSettling(version.picture) || isPressBusy(press.phase)) {
      return;
    }
    setFlagged([]);
    setShowsLive(false);
    setHeldPost(post);
    press.start(pressKindOf(stage), () => publish(postId, stage === 'pending'));
  };

  const runDialog = async (chosen: EditorDialog, id: number): Promise<void> => {
    if (chosen === 'delete') {
      autosave.drop();
      await deletion.mutateAsync(id);
      await navigate({ to: NEWS_PATH });
      return;
    }
    if (chosen === 'withdraw') {
      await saveFirst();
      await withdrawal.mutateAsync(id);
      await reseedFrom(id);
      setWithdrawKey((key) => key + 1);
      return;
    }
    autosave.drop();
    await discard.mutateAsync(id);
    await reseedFrom(id);
  };

  const confirmDialog = (): void => {
    const chosen = dialog;
    setDialog((current) => (current === null ? null : { ...current, isOpen: false }));
    if (chosen === null || !chosen.isOpen || postId === null) {
      return;
    }
    runDialog(chosen.kind, postId).catch(raiseActionFailure);
  };

  const shown = showsLive && live !== null ? live : version;
  const isPressing = isPressBusy(press.phase);

  return {
    sceneKey: `news-editor-${editSession}`,
    postId,
    post,
    isLoading: postId !== null && post === null && seededId !== postId && query.error === null,
    loadError:
      post === null && !isGone ? toQueryErrorMessage(query.error, HUB_ERROR_MESSAGES) : null,
    reload: () => {
      void query.refetch();
    },
    isGone,
    version: shown,
    live,
    isReadOnly: isGone || isPressing || (showsLive && live !== null),
    stage,
    authorName: nameOf(post?.author ?? null),
    signerName,
    changedParts: showsLive ? [] : changedParts,
    liveText: live === null || showsLive ? null : live.text,
    missing,
    flaggedMissing: flagged,
    saveStatus: autosave.status,
    savedAt: latestMomentOf(autosave.savedAt, seededSavedAt),
    foreignSave: autosave.foreignSave,
    showsLive,
    liveKey,
    withdrawKey,
    dialog,
    press,
    update,
    showUpload: setUpload,
    settlePicture,
    toggleLive: () => {
      setShowsLive((current) => !current);
    },
    requestPublish,
    openDialog: (kind) => {
      setDialog({ kind, isOpen: true });
    },
    closeDialog: () => {
      setDialog((current) => (current === null ? null : { ...current, isOpen: false }));
    },
    confirmDialog,
  };
};
