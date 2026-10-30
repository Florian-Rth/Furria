import InputBase from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent, FC } from 'react';
import { KK_STUDIO_I_SHORT } from '../../../KkStudioIEditor/studio-i-editor-query';
import { inlinePaint } from './kk-studio-i-inline-paint';

interface KkStudioIHeadNoteProps {
  value: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export const KkStudioIHeadNote: FC<KkStudioIHeadNoteProps> = ({
  value,
  label,
  placeholder,
  onChange,
}) => {
  const change = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(event.target.value);
  };

  return (
    <InputBase
      value={value}
      onChange={change}
      placeholder={placeholder}
      multiline
      maxRows={2}
      minRows={2}
      slotProps={{ input: { 'aria-label': label } }}
      data-kk-studio-i-note
      sx={(theme: Theme) => ({
        ...inlinePaint(theme),
        typography: 'body2',
        p: 0,
        color: 'text.secondary',
        [KK_STUDIO_I_SHORT]: { display: 'none' },
      })}
    />
  );
};
