import type { KkNewsProofFacts } from '@furria/ui';
import { CATEGORY_LABELS, CATEGORY_TONES, WEBSITE_HOST } from '../../news-copy';
import {
  clockLabelOf,
  isProofChanged,
  longDateLabelOf,
  proofDayOf,
  proofPictureSourceOf,
  shortDateLabelOf,
} from '../../proof-view';
import type { NewsProofsProps } from './proofs-props';

const filledOrNull = (value: string): string | null => (value.trim().length === 0 ? null : value);

export const useProofFacts = ({
  version,
  publishedAt,
  changedParts,
}: Pick<NewsProofsProps, 'version' | 'publishedAt' | 'changedParts'>): KkNewsProofFacts => {
  const now = new Date();
  const day = proofDayOf(publishedAt, now);
  const { category } = version;

  return {
    title: filledOrNull(version.title),
    teaser: filledOrNull(version.teaser),
    categoryLabel: category === null ? null : CATEGORY_LABELS[category],
    categoryTone: category === null ? null : CATEGORY_TONES[category],
    pictureSource: proofPictureSourceOf(version),
    longDate: longDateLabelOf(day),
    shortDate: shortDateLabelOf(day),
    clock: clockLabelOf(now),
    host: WEBSITE_HOST,
    changed: isProofChanged(changedParts),
  };
};
