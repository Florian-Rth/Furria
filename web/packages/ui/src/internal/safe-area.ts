type KkSafeAreaSide = 'top' | 'right' | 'bottom' | 'left';

export const safeArea = (side: KkSafeAreaSide, extra: number): string =>
  `calc(env(safe-area-inset-${side}, 0px) + ${extra}px)`;
