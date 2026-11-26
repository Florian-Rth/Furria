import type { FC, PropsWithChildren } from 'react';
import { KkText } from '../../../KkText';
import { HELP_TEXT_INSET } from '../logic/help-counter';

export const KkHelpText: FC<PropsWithChildren> = ({ children }) => (
  <KkText variant="body2" tone="secondary" sx={{ pl: HELP_TEXT_INSET }}>
    {children}
  </KkText>
);
