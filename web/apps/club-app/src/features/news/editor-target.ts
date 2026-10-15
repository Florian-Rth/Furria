import { NEW_POST_ID } from './news-copy';

export type EditorTarget = { kind: 'new' } | { kind: 'post'; postId: number } | { kind: 'invalid' };

export const editorTargetOf = (routePostId: string): EditorTarget => {
  if (routePostId === NEW_POST_ID) {
    return { kind: 'new' };
  }
  const parsed = Number(routePostId);
  return /^\d+$/.test(routePostId) && Number.isSafeInteger(parsed) && parsed > 0
    ? { kind: 'post', postId: parsed }
    : { kind: 'invalid' };
};
