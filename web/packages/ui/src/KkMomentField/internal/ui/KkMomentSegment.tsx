import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';

const FACE_HEIGHT_SPACING = 7;

export type KkMomentSegmentWidth = 'grow' | 'fit';

interface KkMomentSegmentProps {
  icon: KkIconName;
  label: string;
  text: string | null;
  placeholder: string;
  width: KkMomentSegmentWidth;
  onSelect: () => void;
}

export const KkMomentSegment: FC<KkMomentSegmentProps> = ({
  icon,
  label,
  text,
  placeholder,
  width,
  onSelect,
}) => {
  const shown = text ?? placeholder;
  const ink = text === null ? 'text.secondary' : 'text.primary';
  const flex = width === 'grow' ? '1 1 auto' : '0 0 auto';
  const accessibleName = `${label}: ${shown}`;

  return (
    <Stack
      component="button"
      type="button"
      direction="row"
      aria-label={accessibleName}
      aria-haspopup="dialog"
      onClick={onSelect}
      data-kk-moment-segment={width}
      sx={(theme) => ({
        flex,
        minWidth: 0,
        minHeight: theme.spacing(FACE_HEIGHT_SPACING),
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        border: 0,
        borderRadius: 0,
        backgroundColor: 'transparent',
        color: ink,
        cursor: 'pointer',
        textAlign: 'left',
        '&:first-of-type': { borderTopLeftRadius: 'inherit', borderBottomLeftRadius: 'inherit' },
        '&:last-of-type': { borderTopRightRadius: 'inherit', borderBottomRightRadius: 'inherit' },
        ...focusRing(theme),
      })}
    >
      <KkIcon name={icon} size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Typography
        component="span"
        variant="body1"
        noWrap
        sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
      >
        {shown}
      </Typography>
    </Stack>
  );
};
