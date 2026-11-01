import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { NEWS_EDITOR_ROUTE } from '@/features/news/news-copy';
import { NEWS_PATH } from '@/features/session/app-sections';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useWriterNewsHubQuery } from '../api';
import { editablePostIdOf } from '../read-news';
import { EDIT_POST_LABEL, WRITE_NEWS_LABEL } from '../read-news-copy';

export const useWriteNewsActions = (): KkScreenActions | undefined => {
  const navigate = useNavigate();
  const writes = usePermissions().has(PERMISSION_KEYS.newsManage);

  if (!writes) {
    return undefined;
  }

  const openWorkbench = (): void => {
    void navigate({ to: NEWS_PATH });
  };

  return [
    {
      id: 'write-news',
      label: WRITE_NEWS_LABEL,
      icon: 'edit',
      link: { to: NEWS_PATH },
      onSelect: openWorkbench,
    },
  ];
};

export const useEditArticleActions = (slug: string): KkScreenActions | undefined => {
  const navigate = useNavigate();
  const writes = usePermissions().has(PERMISSION_KEYS.newsManage);
  const hub = useWriterNewsHubQuery(writes);
  const postId = writes ? editablePostIdOf(hub.data, slug) : null;

  if (postId === null) {
    return undefined;
  }

  const openEditor = (): void => {
    void navigate({ to: NEWS_EDITOR_ROUTE, params: { postId } });
  };

  return [
    {
      id: 'edit-news-post',
      label: EDIT_POST_LABEL,
      icon: 'edit',
      link: { to: NEWS_EDITOR_ROUTE, params: { postId } },
      onSelect: openEditor,
    },
  ];
};
