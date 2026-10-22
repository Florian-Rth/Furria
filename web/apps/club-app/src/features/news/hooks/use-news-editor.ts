import { useKkNotice } from '@furria/ui/KkNotice';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useMeQuery } from '@/features/session/api';
import { NEWS_PATH } from '@/features/session/app-sections';
import { MANAGING_LOGIN_NAME } from '@/features/session/hooks/use-signer-name';
import { toQueryErrorMessage } from '@/lib/query-error';
import { ACTION_FAILED, PUBLISH_FAILED } from '../editor-copy';
import type { EditorTarget } from '../editor-target';
import { editorTargetOf } from '../editor-target';
import { HUB_ERROR_MESSAGES } from '../hub-copy';
import { NEWS_EDITOR_ROUTE } from '../news-copy';
import { newsFailureMessageOf } from '../news-failure';
import { revealNewsField } from '../news-fields';
import { missingOf } from '../news-lifecycle';
import type { SaveState } from '../press-bar-facts';
import { pressKindOf } from '../press-kind';
import type { NewsPostDetails } from '../schemas';
import type {
  NewsFields,
  NewsPicture,
  NewsRequirement,
  NewsSaver,
  NewsStage,
  NewsVersion,
  NewsVersionPart,
} from '../types';
import { useNewsDraft } from './use-news-draft';
import type { NewsPress } from './use-news-press';
import { useNewsPress } from './use-news-press';

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
  isMissing: boolean;
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
  press: NewsPress;
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

const NO_KEY = 0;

const nameOf = (person: PersonName | null): string | null =>
  person === null ? null : `${person.firstName} ${person.lastName}`;

const postIdOf = (target: EditorTarget): number | null =>
  target.kind === 'post' ? target.postId : null;

const isSettling = (picture: NewsPicture | null): boolean => picture?.state === 'uploading';

export const useNewsEditor = (routePostId: string): NewsEditor => {
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();
  const me = useMeQuery();

  const raiseFailure = (error: Error, unexpected: string): void => {
    const message = newsFailureMessageOf(error, unexpected);
    if (message !== null) {
      raiseNotice({ tone: 'error', message });
    }
  };

  const raiseActionFailure = (error: Error): void => {
    raiseFailure(error, ACTION_FAILED);
  };

  const target = editorTargetOf(routePostId);
  const { sessionKey, session, view } = useNewsDraft(postIdOf(target), {
    onCreated: (newsPostId) => {
      void navigate({
        to: NEWS_EDITOR_ROUTE,
        params: { postId: String(newsPostId) },
        replace: true,
      });
    },
    onCreationFailed: raiseActionFailure,
  });
  const [flagged, setFlagged] = useState<readonly NewsRequirement[]>([]);
  const [showsLive, setShowsLive] = useState(false);
  const [liveKey, setLiveKey] = useState(NO_KEY);
  const [withdrawKey, setWithdrawKey] = useState(NO_KEY);
  const [dialog, setDialog] = useState<EditorDialogState | null>(null);
  const [trackedSessionKey, setTrackedSessionKey] = useState(sessionKey);
  const { postId, post, version, live, stage, isGone } = view;
  const missing = missingOf(view.fields);

  if (trackedSessionKey !== sessionKey) {
    setTrackedSessionKey(sessionKey);
    setFlagged([]);
    setShowsLive(false);
  }

  const showWorkingCopy = (): void => {
    setFlagged([]);
    setShowsLive(false);
  };

  const signerName = nameOf(me.data?.person ?? null) ?? MANAGING_LOGIN_NAME;

  const press = useNewsPress({
    signer: signerName,
    onPublished: () => {
      session.release();
      setLiveKey((key) => key + 1);
      setWithdrawKey(NO_KEY);
    },
    onFailed: (error) => {
      session.release();
      raiseFailure(error, PUBLISH_FAILED);
    },
  });

  const update = (patch: Partial<NewsFields>): void => {
    session.edit(patch);
    const stillMissing = missingOf(session.view().fields);
    setFlagged((current) => current.filter((requirement) => stillMissing.includes(requirement)));
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
    if (postId === null || isSettling(version.picture) || press.isBusy) {
      return;
    }
    showWorkingCopy();
    press.start(pressKindOf(stage), session.publish);
  };

  const runDialog = async (chosen: EditorDialog): Promise<void> => {
    if (chosen === 'delete') {
      await session.remove();
      await navigate({ to: NEWS_PATH });
      return;
    }
    if (chosen === 'withdraw') {
      await session.withdraw();
      setWithdrawKey((key) => key + 1);
    } else {
      await session.discard();
    }
    showWorkingCopy();
  };

  const confirmDialog = (): void => {
    const chosen = dialog;
    setDialog((current) => (current === null ? null : { ...current, isOpen: false }));
    if (chosen === null || !chosen.isOpen || postId === null) {
      return;
    }
    runDialog(chosen.kind).catch(raiseActionFailure);
  };

  const isPressing = press.isBusy;

  return {
    sceneKey: `news-editor-${sessionKey}`,
    postId,
    post,
    isLoading: view.isLoading,
    loadError:
      post === null && !isGone ? toQueryErrorMessage(view.loadError, HUB_ERROR_MESSAGES) : null,
    reload: () => {
      void session.open();
    },
    isGone,
    isMissing: target.kind === 'invalid' || (isGone && post === null),
    version: showsLive && live !== null ? live : version,
    live,
    isReadOnly: isGone || isPressing || (showsLive && live !== null),
    stage,
    authorName: nameOf(post?.author ?? null),
    signerName,
    changedParts: showsLive ? [] : view.changedParts,
    liveText: live === null || showsLive ? null : live.text,
    missing,
    flaggedMissing: flagged,
    saveStatus: view.status,
    savedAt: view.savedAt,
    foreignSave: view.foreignSave,
    showsLive,
    liveKey,
    withdrawKey,
    dialog,
    press,
    update,
    showUpload: session.showUpload,
    settlePicture: session.runAfterSave,
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
