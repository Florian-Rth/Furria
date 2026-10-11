export type { NewsMentionTarget } from './news-mention-key';
export {
  NEWS_MENTION_KEY_ATTRIBUTE,
  newsMentionKeyOf,
  newsMentionTargetOf,
} from './news-mention-key';
export { newsPlainTextOf } from './news-plain-text';
export { newsReadingMinutesOf } from './news-reading-time';
export type { NewsBlock, NewsInline, NewsMention, NewsMentionKind } from './news-text-model';
export { isWebAddress } from './news-text-syntax';
export { readNewsInlines, readNewsText } from './read-news-text';
export { writeNewsText } from './write-news-text';
