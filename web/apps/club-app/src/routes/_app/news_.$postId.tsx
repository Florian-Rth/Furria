import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { NewsEditorPage } from '@/features/news/components/editor/NewsEditorPage';
import { MORE_SECTION, NEWS_KEYS, NEWS_TITLE } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

const NewsEditorRoute: FC = () => {
  const { postId } = Route.useParams();

  return (
    <RequireAnyScreenPermission
      permissionKeys={NEWS_KEYS}
      title={NEWS_TITLE}
      section={MORE_SECTION}
    >
      <NewsEditorPage postId={postId} />
    </RequireAnyScreenPermission>
  );
};

export const Route = createFileRoute('/_app/news_/$postId')({ component: NewsEditorRoute });
