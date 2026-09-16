type KkSafeAreaSide = 'top' | 'right' | 'bottom' | 'left';

export const safeAreaInset = (side: KkSafeAreaSide): string =>
  `var(--safe-area-inset-${side}, env(safe-area-inset-${side}, 0px))`;

export const safeArea = (side: KkSafeAreaSide, extra: number): string =>
  `calc(${safeAreaInset(side)} + ${extra}px)`;
