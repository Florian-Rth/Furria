import { KkScreen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NEWS_ORIGIN } from '@/features/session';
import { NEWS_PICKER_LIST_ID, useNewsEditorPage } from '../../hooks/use-news-editor-page';
import { NewsPressStage } from '../press/NewsPressStage';
import { NewsImposition } from '../proofs/NewsImposition';
import { NewsProofPeek } from '../proofs/NewsProofPeek';
import { NewsProofSheet } from '../proofs/NewsProofSheet';
import { NewsArticle } from './NewsArticle';
import { NewsEditorFailure } from './NewsEditorFailure';
import { NewsEditorLayout } from './NewsEditorLayout';
import { NewsEditorSkeleton } from './NewsEditorSkeleton';
import { NewsGallerySheet } from './NewsGallerySheet';
import { NewsGoneNotice } from './NewsGoneNotice';
import { NewsLifecycleDialog } from './NewsLifecycleDialog';
import { NewsLinkSheet } from './NewsLinkSheet';
import { NewsMentionLayer } from './NewsMentionLayer';
import { NewsPressFoot } from './NewsPressFoot';
import { NewsTieSheets } from './NewsTieSheets';

interface NewsEditorPageProps {
  postId: string;
}

export const NewsEditorPage: FC<NewsEditorPageProps> = ({ postId }) => {
  const page = useNewsEditorPage(postId);
  const { editor, text, picture } = page;

  if (editor.isLoading) {
    return <NewsEditorSkeleton />;
  }
  if (editor.loadError !== null) {
    return <NewsEditorFailure message={editor.loadError} onRetry={editor.reload} />;
  }

  const gone = editor.isGone ? <NewsGoneNotice onCopy={page.copyText} /> : null;
  const peek = page.isWide ? null : <NewsProofPeek {...page.proofProps} />;
  const aside = page.isWide ? <NewsImposition {...page.proofProps} /> : null;

  const main = (
    <Stack sx={{ gap: 2 }}>
      {gone}
      <NewsPressStage run={editor.press} signer={editor.signerName}>
        <NewsArticle
          editor={editor}
          text={text}
          teaser={page.teaser}
          picture={picture}
          ties={page.ties}
          mentionables={page.mentionables}
        />
      </NewsPressStage>
      {peek}
    </Stack>
  );

  return (
    <KkScreen
      kind="working"
      title={page.title}
      sceneKey={editor.sceneKey}
      origin={NEWS_ORIGIN}
      foot={<NewsPressFoot editor={editor} text={text} />}
    >
      <NewsEditorLayout main={main} aside={aside} />
      <NewsMentionLayer text={text} mentionables={page.mentionables} listId={NEWS_PICKER_LIST_ID} />
      <NewsLinkSheet text={text} />
      <NewsGallerySheet onPick={picture.pickPhoto} />
      <NewsTieSheets ties={page.ties} />
      <NewsProofSheet {...page.proofProps} />
      <NewsLifecycleDialog
        dialog={editor.dialog}
        stage={editor.stage}
        onClose={editor.closeDialog}
        onConfirm={editor.confirmDialog}
      />
    </KkScreen>
  );
};
