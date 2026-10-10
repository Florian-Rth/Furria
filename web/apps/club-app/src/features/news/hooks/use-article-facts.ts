import type { KkBannerState, KkProseMentionTone } from '@furria/ui';
import {
  ADDRESS_FIXED,
  ADDRESS_PENDING,
  ADDRESS_PLACEHOLDER,
  BYLINE_AUTHOR,
  BYLINE_DRAFT,
} from '../editor-copy';
import { mentionTonesOf } from '../mentionables';
import { CHANGED_MARK, MISSING_MARK, PUBLIC_NEWS_PATH, WEBSITE_HOST } from '../news-copy';
import { longDateOf } from '../news-dates';
import type { PartMark } from '../part-marks';
import { partMarkOf } from '../part-marks';
import type { NewsMentionable, NewsPicture, NewsVersionPart } from '../types';
import type { NewsEditor } from './use-news-editor';

export interface PartMarkView {
  mark: PartMark;
  label: string;
}

export interface ArticleFacts {
  dateline: string;
  address: string;
  isAddressFixed: boolean;
  addressLabel: string;
  category: PartMarkView;
  title: PartMarkView;
  teaser: PartMarkView;
  text: PartMarkView;
  ties: PartMarkView;
  pictureMark: PartMark;
  captionMark: PartMark;
  bannerState: KkBannerState;
  isTeaserEmpty: boolean;
  isTextEmpty: boolean;
  mentionTones: readonly KkProseMentionTone[];
}

const viewOf = (mark: PartMark): PartMarkView => ({
  mark,
  label: mark === 'missing' ? MISSING_MARK : CHANGED_MARK,
});

const bannerStateOf = (picture: NewsPicture | null, isCropping: boolean): KkBannerState => {
  if (picture === null) {
    return 'empty';
  }
  if (isCropping && picture.state === 'ready') {
    return 'cropping';
  }
  return picture.state;
};

export const useArticleFacts = (
  editor: NewsEditor,
  mentionables: readonly NewsMentionable[],
  isCropping: boolean,
): ArticleFacts => {
  const markOf = (part: NewsVersionPart): PartMark =>
    partMarkOf(part, editor.flaggedMissing, editor.changedParts);
  const textMark = markOf('text');
  const { post } = editor;
  const author = editor.authorName;
  const authorLine = author === null ? '' : ` · ${BYLINE_AUTHOR} ${author}`;
  const slug = post?.slug ?? null;
  const publishedAt = post?.publishedAt ?? null;
  const isFixed = slug !== null && publishedAt !== null;
  const dateline = publishedAt === null ? BYLINE_DRAFT : longDateOf(publishedAt);

  return {
    dateline: `${dateline}${authorLine}`,
    address: `${WEBSITE_HOST}${PUBLIC_NEWS_PATH}${slug ?? ADDRESS_PLACEHOLDER}`,
    isAddressFixed: isFixed,
    addressLabel: isFixed ? ADDRESS_FIXED : ADDRESS_PENDING,
    category: viewOf(markOf('category')),
    title: viewOf(markOf('title')),
    teaser: viewOf(markOf('teaser')),
    text: viewOf(textMark === 'missing' ? 'missing' : null),
    ties: viewOf(markOf('event') ?? markOf('album')),
    pictureMark: markOf('picture'),
    captionMark: markOf('caption'),
    bannerState: bannerStateOf(editor.version.picture, isCropping),
    isTeaserEmpty: editor.version.teaser.length === 0,
    isTextEmpty: editor.version.text.length === 0,
    mentionTones: mentionTonesOf(mentionables, editor.version.text),
  };
};
