import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneCardsTitleProps {
  eyebrow: string;
  lead: string;
  name: string;
  label: string;
  editable: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
}

export const KkLaneCardsTitle: FC<KkLaneCardsTitleProps> = ({
  eyebrow,
  lead,
  name,
  label,
  editable,
  onChange,
  onCommit,
}) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };
  const press = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };
  const title = editable ? (
    <InputBase
      value={name}
      onChange={change}
      onBlur={onCommit}
      onKeyDown={press}
      inputProps={{ 'aria-label': label, maxLength: 80 }}
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        minHeight: kkTokens.tapTarget,
        typography: 'h3',
        borderBottom: `${kkTokens.line.hair}px dashed ${palette(theme).divider}`,
        '&.Mui-focused': { borderBottomColor: palette(theme).text.primary },
      })}
    />
  ) : (
    <Typography variant="h3" component="p" noWrap sx={{ flex: 1, minWidth: 0, lineHeight: 2 }}>
      {name}
    </Typography>
  );

  return (
    <Stack sx={{ flexShrink: 0, minWidth: 0 }}>
      <Typography
        variant="overline"
        noWrap
        sx={{
          lineHeight: 1.2,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.section,
          color: 'text.secondary',
        }}
      >
        {eyebrow}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Typography
          component="span"
          variant="h2"
          sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}
        >
          {lead}
        </Typography>
        {title}
      </Stack>
    </Stack>
  );
};
