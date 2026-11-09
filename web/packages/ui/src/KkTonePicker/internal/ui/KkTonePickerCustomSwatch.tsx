import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const SPECTRUM =
  'conic-gradient(from 180deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)';
const SPECTRUM_INK = '#FFFFFF';
const SELECTED_RING = `0 0 0 ${kkTokens.line.page}px`;

const facePaint = (theme: Theme, tone: KkGroupTone | null): CSSObject =>
  tone === null ? { background: SPECTRUM, color: SPECTRUM_INK } : groupToneFieldPaint(theme, tone);

interface KkTonePickerCustomSwatchProps {
  tone: KkGroupTone | null;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const KkTonePickerCustomSwatch: FC<KkTonePickerCustomSwatchProps> = ({
  tone,
  label,
  isExpanded,
  onToggle,
}) => {
  const isSelected = tone !== null;
  const mark = isSelected ? (
    <KkIcon name="check" size="small" />
  ) : (
    <KkIcon name="add" size="small" />
  );

  return (
    <Stack
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      aria-expanded={isExpanded}
      onClick={onToggle}
      sx={(theme) => ({
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        appearance: 'none',
        cursor: 'pointer',
        padding: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        boxShadow: isSelected
          ? `${SELECTED_RING} ${(theme.vars ?? theme).palette.text.primary}`
          : 'none',
        ...facePaint(theme, tone),
        ...focusRing(theme),
      })}
    >
      {mark}
    </Stack>
  );
};
