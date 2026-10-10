import { newsPlainTextOf } from './news-plain-text';

const WORDS_PER_MINUTE = 180;

const READING_TIME_MINIMUM_MINUTES = 3;

export const newsReadingMinutesOf = (text: string): number | null => {
  const wordCount = newsPlainTextOf(text)
    .split(/\s+/)
    .filter((word) => word !== '').length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return minutes < READING_TIME_MINIMUM_MINUTES ? null : minutes;
};
