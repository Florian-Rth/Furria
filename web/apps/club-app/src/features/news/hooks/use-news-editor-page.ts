import { useIsWideScreen, useKkNotice } from '@furria/ui';
import { newsPlainTextOf } from '@furria/ui/news-text';
import type { NewsProofsProps } from '../components/proofs/proofs-props';
import { ACTION_FAILED, NEW_POST_TITLE } from '../editor-copy';
import type { NewsMentionable } from '../types';
import type { NewsEditor } from './use-news-editor';
import { useNewsEditor } from './use-news-editor';
import { useNewsMentionables } from './use-news-mentionables';
import type { NewsPictureDesk } from './use-news-picture';
import { useNewsPicture } from './use-news-picture';
import type { NewsTies } from './use-news-ties';
import { useNewsTies } from './use-news-ties';
import type { ProseTeaser } from './use-prose-teaser';
import { useProseTeaser } from './use-prose-teaser';
import type { ProseText } from './use-prose-text';
import { useProseText } from './use-prose-text';

export const NEWS_PICKER_LIST_ID = 'news-mention-list';

export interface NewsEditorPageState {
  editor: NewsEditor;
  mentionables: readonly NewsMentionable[];
  text: ProseText;
  teaser: ProseTeaser;
  picture: NewsPictureDesk;
  ties: NewsTies;
  title: string;
  isWide: boolean;
  proofProps: NewsProofsProps;
  copyText: () => void;
}

export const useNewsEditorPage = (routePostId: string): NewsEditorPageState => {
  const editor = useNewsEditor(routePostId);
  const raiseNotice = useKkNotice();
  const isWide = useIsWideScreen();
  const mentionables = useNewsMentionables();
  const { version } = editor;
  const text = useProseText({
    text: version.text,
    isReadOnly: editor.isReadOnly,
    liveText: editor.liveText,
    mentionables,
    pickerListId: NEWS_PICKER_LIST_ID,
    onChange: (next) => {
      editor.update({ text: next });
    },
  });
  const teaser = useProseTeaser({
    teaser: version.teaser,
    isReadOnly: editor.isReadOnly,
    onChange: (next) => {
      editor.update({ teaser: next });
    },
  });
  const picture = useNewsPicture(editor);
  const ties = useNewsTies(version, editor.update);

  return {
    editor,
    mentionables,
    text,
    teaser,
    picture,
    ties,
    title: version.title.trim().length === 0 ? NEW_POST_TITLE : version.title,
    isWide,
    proofProps: {
      version,
      publishedAt: editor.post?.publishedAt ?? null,
      changedParts: editor.changedParts,
      liveKey: editor.liveKey,
    },
    copyText: () => {
      navigator.clipboard
        .writeText([version.title, version.teaser, newsPlainTextOf(version.text)].join('\n\n'))
        .catch(() => {
          raiseNotice({ tone: 'error', message: ACTION_FAILED });
        });
    },
  };
};
