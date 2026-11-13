import { useKkNotice } from '@furria/ui/KkNotice';
import { NEWS_MENTION_KINDS } from '@furria/ui/news-mention-kinds';
import { plainTextOf } from '@furria/ui/rich-text';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { RichTextField } from '@/features/rich-text/hooks/use-rich-text';
import { useRichText } from '@/features/rich-text/hooks/use-rich-text';
import type { MentionablesSource } from '@/features/rich-text/types';
import type { NewsProofsProps } from '../components/proofs/proofs-props';
import { ACTION_FAILED, NEW_POST_TITLE, TEXT_FIELD_LABEL } from '../editor-copy';
import { CHANGED_MARK } from '../news-copy';
import { newsFieldIdOf } from '../news-fields';
import type { NewsEditor } from './use-news-editor';
import { useNewsEditor } from './use-news-editor';
import { useNewsMentionables } from './use-news-mentionables';
import type { NewsPictureDesk } from './use-news-picture';
import { useNewsPicture } from './use-news-picture';
import type { NewsTies } from './use-news-ties';
import { useNewsTies } from './use-news-ties';
import type { ProseTeaser } from './use-prose-teaser';
import { useProseTeaser } from './use-prose-teaser';

const NEWS_PICKER_LIST_ID = 'news-mention-list';

export interface NewsEditorPageState {
  editor: NewsEditor;
  mentionables: MentionablesSource;
  text: RichTextField;
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
  const text = useRichText({
    text: version.text,
    isReadOnly: editor.isReadOnly,
    liveText: editor.liveText,
    changedMark: CHANGED_MARK,
    mentionKinds: NEWS_MENTION_KINDS,
    mentionables: mentionables.list,
    fieldId: newsFieldIdOf('text'),
    label: TEXT_FIELD_LABEL,
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
        .writeText(
          [version.title, version.teaser, plainTextOf(version.text, NEWS_MENTION_KINDS)].join(
            '\n\n',
          ),
        )
        .catch(() => {
          raiseNotice({ tone: 'error', message: ACTION_FAILED });
        });
    },
  };
};
