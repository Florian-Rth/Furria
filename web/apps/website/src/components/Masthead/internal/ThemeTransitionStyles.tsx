import GlobalStyles from '@mui/material/GlobalStyles';
import type { FC } from 'react';

export const ThemeTransitionStyles: FC = () => (
  <GlobalStyles
    styles={{
      '::view-transition-old(root), ::view-transition-new(root)': {
        animation: 'none',
        mixBlendMode: 'normal',
      },
      '::view-transition-old(root)': {
        zIndex: 0,
      },
      '::view-transition-new(root)': {
        zIndex: 1,
        animation: 'kk-mode-reveal 500ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      '@keyframes kk-mode-reveal': {
        from: {
          clipPath: 'circle(0 at var(--mode-reveal-x) var(--mode-reveal-y))',
        },
        to: {
          clipPath: 'circle(140% at var(--mode-reveal-x) var(--mode-reveal-y))',
        },
      },
    }}
  />
);
