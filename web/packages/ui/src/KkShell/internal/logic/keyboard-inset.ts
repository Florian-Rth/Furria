import { kkTokens } from '../../../tokens';

export interface KkViewportMetrics {
  innerHeight: number;
  viewportHeight: number;
  offsetTop: number;
}

const { keyboardMinInset } = kkTokens.shell;

export const keyboardInsetOf = ({
  innerHeight,
  viewportHeight,
  offsetTop,
}: KkViewportMetrics): number => {
  const occluded = innerHeight - viewportHeight - offsetTop;

  return occluded >= keyboardMinInset ? occluded : 0;
};
