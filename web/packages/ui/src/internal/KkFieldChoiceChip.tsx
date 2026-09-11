import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { kkTokens } from '../tokens';
import type { KkFieldChoice } from './field-choice';

const CHIP_BORDER = 1.5;
const CHIP_FONT_SIZE = '0.71875rem';
const DISABLED_OPACITY = 0.45;

interface KkFieldChoiceChipProps {
  choice: KkFieldChoice;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
}

export const KkFieldChoiceChip: FC<KkFieldChoiceChipProps> = ({
  choice,
  selected,
  disabled,
  onSelect,
}) => {
  const borderColor = selected ? 'text.primary' : 'divider';
  const backgroundColor = selected ? 'text.primary' : 'transparent';
  const labelColor = selected ? 'background.paper' : 'text.secondary';

  const select = (): void => {
    onSelect(choice.id);
  };

  return (
    <Stack
      component="button"
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={select}
      data-kk-field-choice
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: kkTokens.tapTarget,
        minWidth: 0,
        borderRadius: `${kkTokens.radius.pill}px`,
        border: CHIP_BORDER,
        borderStyle: 'solid',
        borderColor,
        backgroundColor,
        color: labelColor,
        fontFamily: kkTokens.font.body,
        fontSize: CHIP_FONT_SIZE,
        fontWeight: 800,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        px: 1.75,
        '&:disabled': { cursor: 'default', opacity: DISABLED_OPACITY },
      }}
    >
      {choice.label}
    </Stack>
  );
};
