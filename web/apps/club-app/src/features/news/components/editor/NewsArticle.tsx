import { KkDateline, KkFormatRail, KkHeadlineField, KkProofSheet, KkProseField } from '@furria/ui';
import type { FC } from 'react';
import { NEWS_TITLE } from '@/features/session';
import {
  RAIL_LABEL,
  TEASER_PLACEHOLDER,
  TEXT_PLACEHOLDER,
  TITLE_FIELD_LABEL,
  TITLE_PLACEHOLDER,
} from '../../editor-copy';
import { useArticleFacts } from '../../hooks/use-article-facts';
import { useFormatItems } from '../../hooks/use-format-items';
import type { NewsEditor } from '../../hooks/use-news-editor';
import type { NewsPictureDesk as PictureDesk } from '../../hooks/use-news-picture';
import type { NewsTies } from '../../hooks/use-news-ties';
import type { ProseTeaser } from '../../hooks/use-prose-teaser';
import type { ProseText } from '../../hooks/use-prose-text';
import { CHANGED_MARK } from '../../news-copy';
import type { NewsCategory, NewsMentionable } from '../../types';
import { NewsWithdrawStamp } from '../press/NewsWithdrawStamp';
import { NewsCategoryKicker } from './NewsCategoryKicker';
import { NewsPictureDesk } from './NewsPictureDesk';
import { NewsTieSlots } from './NewsTieSlots';

interface NewsArticleProps {
  editor: NewsEditor;
  text: ProseText;
  teaser: ProseTeaser;
  picture: PictureDesk;
  ties: NewsTies;
  mentionables: readonly NewsMentionable[];
}

export const NewsArticle: FC<NewsArticleProps> = ({
  editor,
  text,
  teaser,
  picture,
  ties,
  mentionables,
}) => {
  const facts = useArticleFacts(editor, mentionables, picture.isCropping);
  const formatItems = useFormatItems(text, editor.isReadOnly);
  const { version, isReadOnly } = editor;

  const chooseCategory = (category: NewsCategory): void => {
    editor.update({ category });
  };
  const changeTitle = (title: string): void => {
    editor.update({ title });
  };
  const changeCaption = (pictureCaption: string): void => {
    editor.update({ pictureCaption });
  };
  const kicker = (
    <NewsCategoryKicker
      category={version.category}
      isReadOnly={isReadOnly}
      onChoose={chooseCategory}
    />
  );

  return (
    <KkProofSheet label={NEWS_TITLE}>
      <KkProofSheet.Rail>
        <KkFormatRail label={RAIL_LABEL} items={formatItems} />
      </KkProofSheet.Rail>
      <NewsWithdrawStamp fireKey={editor.withdrawKey} />
      <KkProofSheet.Part mark={facts.category.mark}>
        <KkProofSheet.MarkWord mark={facts.category.mark} label={facts.category.label} />
        <KkDateline
          kicker={kicker}
          line={facts.dateline}
          address={facts.address}
          isAddressFixed={facts.isAddressFixed}
          addressLabel={facts.addressLabel}
        />
      </KkProofSheet.Part>
      <KkProofSheet.Part mark={facts.title.mark}>
        <KkProofSheet.MarkWord mark={facts.title.mark} label={facts.title.label} />
        <KkHeadlineField
          id="news-field-title"
          label={TITLE_FIELD_LABEL}
          placeholder={TITLE_PLACEHOLDER}
          value={version.title}
          readOnly={isReadOnly}
          onChange={changeTitle}
        />
      </KkProofSheet.Part>
      <KkProofSheet.Part mark={facts.teaser.mark}>
        <KkProofSheet.MarkWord mark={facts.teaser.mark} label={facts.teaser.label} />
        <KkProseField
          hostRef={teaser.hostRef}
          variant="lead"
          placeholder={TEASER_PLACEHOLDER}
          isEmpty={facts.isTeaserEmpty}
        />
      </KkProofSheet.Part>
      <NewsPictureDesk
        desk={picture}
        state={facts.bannerState}
        category={version.category}
        caption={version.pictureCaption}
        pictureMark={facts.pictureMark}
        captionMark={facts.captionMark}
        markLabel={CHANGED_MARK}
        isReadOnly={isReadOnly}
        onCaptionChange={changeCaption}
      />
      <KkProofSheet.Part mark={facts.text.mark}>
        <KkProofSheet.MarkWord mark={facts.text.mark} label={facts.text.label} />
        <KkProseField
          hostRef={text.hostRef}
          variant="body"
          placeholder={TEXT_PLACEHOLDER}
          isEmpty={facts.isTextEmpty}
          mentionTones={facts.mentionTones}
        />
      </KkProofSheet.Part>
      <KkProofSheet.Part mark={facts.ties.mark}>
        <KkProofSheet.MarkWord mark={facts.ties.mark} label={facts.ties.label} />
        <NewsTieSlots ties={ties} isReadOnly={isReadOnly} />
      </KkProofSheet.Part>
    </KkProofSheet>
  );
};
