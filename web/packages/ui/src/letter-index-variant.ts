export type KkLetterIndexVariant = 'grid' | 'strip' | 'rail';

export interface KkLetterIndexBehaviour {
  scrolls: boolean;
  fixed: boolean;
}

export const toLetterIndexBehaviour = (variant: KkLetterIndexVariant): KkLetterIndexBehaviour => ({
  scrolls: variant === 'strip',
  fixed: variant === 'rail',
});
