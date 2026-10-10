import type { NewsRequirement, NewsVersionPart } from './types';

export type PartMark = 'missing' | 'changed' | null;

const REQUIREMENT_PARTS: Record<NewsRequirement, NewsVersionPart> = {
  category: 'category',
  title: 'title',
  teaser: 'teaser',
  text: 'text',
};

export const partMarkOf = (
  part: NewsVersionPart,
  flaggedMissing: readonly NewsRequirement[],
  changedParts: readonly NewsVersionPart[],
): PartMark => {
  if (flaggedMissing.some((requirement) => REQUIREMENT_PARTS[requirement] === part)) {
    return 'missing';
  }
  return changedParts.includes(part) ? 'changed' : null;
};
