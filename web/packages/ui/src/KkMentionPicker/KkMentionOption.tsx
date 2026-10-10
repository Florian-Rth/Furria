import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, MouseEvent } from 'react';
import type { KkGroupTone } from '../internal/group-tone';
import { KkAvatar } from '../KkAvatar';

export interface KkMentionChoice {
  id: string;
  kind: 'group' | 'person';
  name: string;
  line: string;
  initials: string;
  tone: KkGroupTone | null;
  pictureSource: string | null;
}

const GROUP_FACE = { borderRadius: 0.5 } as const;

interface KkMentionOptionProps {
  optionId: string;
  choice: KkMentionChoice;
  isActive: boolean;
  onChoose: (id: string) => void;
}

const keepCaret = (event: MouseEvent): void => {
  event.preventDefault();
};

export const KkMentionOption: FC<KkMentionOptionProps> = ({
  optionId,
  choice,
  isActive,
  onChoose,
}) => {
  const handleChoose = (): void => {
    onChoose(choice.id);
  };
  const source = choice.pictureSource ?? undefined;
  const tone = choice.tone ?? undefined;
  const badge =
    choice.kind === 'person' ? (
      <KkAvatar initials={choice.initials} source={source} />
    ) : (
      <KkAvatar initials={choice.initials} source={source} tone={tone} sx={GROUP_FACE} />
    );

  return (
    <ButtonBase
      id={optionId}
      role="option"
      aria-selected={isActive}
      tabIndex={-1}
      onMouseDown={keepCaret}
      onClick={handleChoose}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        px: 1,
        py: 0.5,
        borderRadius: 0.75,
        bgcolor: isActive ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', minWidth: 0, width: '100%' }}>
        {badge}
        <Stack sx={{ minWidth: 0, alignItems: 'flex-start' }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>
            {choice.name}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
            {choice.line}
          </Typography>
        </Stack>
      </Stack>
    </ButtonBase>
  );
};
