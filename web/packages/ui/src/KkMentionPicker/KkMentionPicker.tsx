import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkMentionChoice } from './KkMentionOption';
import { KkMentionOption } from './KkMentionOption';

export interface KkMentionSection {
  title: string;
  choices: readonly KkMentionChoice[];
}

export interface KkMentionAnchor {
  getBoundingClientRect: () => DOMRect;
}

interface KkMentionPickerProps {
  listId: string;
  label: string;
  emptyLabel: string;
  anchor: KkMentionAnchor | null;
  sections: readonly KkMentionSection[];
  activeId: string | null;
  onChoose: (id: string) => void;
}

const LIST_WIDTH = 40;
const LIST_GUTTERS = 4;
const VIEWPORT_GUTTER = 16;
const PICKER_MODIFIERS = [
  { name: 'preventOverflow', options: { padding: VIEWPORT_GUTTER } },
  { name: 'flip', options: { padding: VIEWPORT_GUTTER } },
];

export const kkMentionOptionId = (listId: string, choiceId: string): string =>
  `${listId}-${choiceId}`;

export const KkMentionPicker: FC<KkMentionPickerProps> = ({
  listId,
  label,
  emptyLabel,
  anchor,
  sections,
  activeId,
  onChoose,
}) => {
  const filled = sections.filter((section) => section.choices.length > 0);
  const groups = filled.map((section) => {
    const options = section.choices.map((choice) => (
      <KkMentionOption
        key={choice.id}
        optionId={kkMentionOptionId(listId, choice.id)}
        choice={choice}
        isActive={choice.id === activeId}
        onChoose={onChoose}
      />
    ));
    return (
      <Stack key={section.title} role="group" aria-label={section.title} sx={{ gap: 0.25 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.25,
            pt: 0.75,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {section.title}
        </Typography>
        {options}
      </Stack>
    );
  });
  const empty =
    filled.length === 0 ? (
      <Typography variant="body2" sx={{ px: 1.25, py: 1, color: 'text.secondary' }}>
        {emptyLabel}
      </Typography>
    ) : null;

  return (
    <Popper
      open={anchor !== null}
      anchorEl={anchor}
      placement="bottom-start"
      modifiers={PICKER_MODIFIERS}
      sx={(theme) => ({ zIndex: theme.zIndex.modal })}
    >
      <Paper
        id={listId}
        role="listbox"
        aria-label={label}
        data-kk-mention-picker
        sx={(theme) => ({
          width: theme.spacing(LIST_WIDTH),
          maxWidth: `calc(100vw - ${theme.spacing(LIST_GUTTERS)})`,
          maxHeight: '50vh',
          overflowY: 'auto',
          mt: 0.75,
          p: 0.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: theme.shadows[6],
        })}
      >
        {groups}
        {empty}
      </Paper>
    </Popper>
  );
};
