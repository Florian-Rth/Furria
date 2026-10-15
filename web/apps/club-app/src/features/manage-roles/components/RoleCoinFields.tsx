import { GROUP_TONES, KkClubIconPicker, KkEyebrow, KkGroupToneSwatch } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ClubIcon } from '@/lib/club-icon';
import { CLUB_ICON_FIELD_LABEL, toClubIconLabel } from '@/lib/club-icon';
import type { GroupTone } from '@/lib/group-tone';
import { toToneLabel } from '@/lib/group-tone';

const TONE_FIELD_LABEL = 'Farbe';

interface RoleCoinFieldsProps {
  icon: ClubIcon | null;
  onIconChange: (icon: ClubIcon | null) => void;
  tone: GroupTone | null;
  onToneChange: (tone: GroupTone) => void;
}

export const RoleCoinFields: FC<RoleCoinFieldsProps> = ({
  icon,
  onIconChange,
  tone,
  onToneChange,
}) => {
  const toneSwatches = GROUP_TONES.map((entry) => {
    const pick = (): void => {
      onToneChange(entry);
    };

    return (
      <KkGroupToneSwatch
        key={entry}
        tone={entry}
        label={toToneLabel(entry)}
        selected={tone === entry}
        onSelect={pick}
      />
    );
  });

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkEyebrow tone="muted">{TONE_FIELD_LABEL}</KkEyebrow>
        <Stack
          direction="row"
          role="group"
          aria-label={TONE_FIELD_LABEL}
          sx={{ gap: 1, flexWrap: 'wrap', minWidth: 0 }}
        >
          {toneSwatches}
        </Stack>
      </Stack>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkEyebrow tone="muted">{CLUB_ICON_FIELD_LABEL}</KkEyebrow>
        <KkClubIconPicker
          value={icon}
          onChange={onIconChange}
          label={CLUB_ICON_FIELD_LABEL}
          iconLabel={toClubIconLabel}
        />
      </Stack>
    </Stack>
  );
};
