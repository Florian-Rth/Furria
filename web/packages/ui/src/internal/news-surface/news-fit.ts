export type KkNewsFit = 'page' | 'column';

export type KkNewsFitted<T> = {
  xs: T;
  md?: T;
  desktop?: T;
};

export const fitted = <T>(fit: KkNewsFit, values: KkNewsFitted<T>): T | KkNewsFitted<T> =>
  fit === 'page' ? values : values.xs;
