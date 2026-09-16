import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { kkTokens } from '../tokens';
import type { KkFieldChoice } from './field-choice';
import { focusRing } from './focus-ring';

const DISABLED_OPACITY = 0.45;

interface KkFieldChoiceChipProps {
  choice: KkFieldChoice;
  selected: boolean;
  disabled: boolean;
  invalid: boolean;
  onSelect: (id: string) => void;
}

export const KkFieldChoiceChip: FC<KkFieldChoiceChipProps> = ({
  choice,
  selected,
  disabled,
  invalid,
  onSelect,
}) => {
  const restingBorder = invalid ? 'error.main' : 'divider';
  const borderColor = selected ? 'text.primary' : restingBorder;
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
      sx={(theme) => ({
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        borderRadius: `${kkTokens.radius.pill}px`,
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor,
        backgroundColor,
        color: labelColor,
        fontFamily: kkTokens.font.body,
        fontSize: kkTokens.type.rowMeta,
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.tight,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        px: 1.375,
        py: 0.625,
        ...focusRing(theme),
        '&:disabled': { cursor: 'default', opacity: DISABLED_OPACITY },
      })}
    >
      {choice.label}
    </Stack>
  );
};
