import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren } from 'react';
import { inkFocusRing } from '../../../internal/ink-focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioStepListRowProps extends PropsWithChildren {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const KkStudioStepListRow: FC<KkStudioStepListRowProps> = ({
  label,
  selected,
  onPress,
  children,
}) => (
  <ButtonBase
    aria-label={label}
    aria-expanded={selected}
    onClick={onPress}
    sx={(theme) => ({
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 1,
      minHeight: '3.5rem',
      px: 1,
      py: 0.5,
      textAlign: 'left',
      borderRadius: `${kkTokens.radius.base}px`,
      ...inkFocusRing(theme),
    })}
  >
    {children}
  </ButtonBase>
);
