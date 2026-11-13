import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkFormatRailItem } from './KkFormatRail';
import { KkFormatRail } from './KkFormatRail';
import type { KkProseMentionTone } from './KkProseField';
import { KkProseField } from './KkProseField';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const HELPER_INSET = 1.75;

interface KkRichTextAreaProps {
  label: string;
  formatLabel: string;
  formatItems: readonly KkFormatRailItem[];
  hostRef: (node: HTMLDivElement | null) => void;
  placeholder: string;
  isEmpty: boolean;
  mentionTones?: readonly KkProseMentionTone[];
  required?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

const frameStyle =
  (hasError: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;
    const rest = hasError ? palette.error.main : palette.divider;
    const focus = hasError ? palette.error.main : palette.primary.main;
    return {
      minWidth: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      border: `${kkTokens.line.hair} solid ${rest}`,
      '&:focus-within': { borderColor: focus, boxShadow: `0 0 0 1px ${focus}` },
    };
  };

export const KkRichTextArea: FC<KkRichTextAreaProps> = ({
  label,
  formatLabel,
  formatItems,
  hostRef,
  placeholder,
  isEmpty,
  mentionTones,
  required = false,
  error = false,
  helperText,
  sx,
}) => {
  const labelId = useId();
  const shownLabel = required ? `${label} *` : label;
  const helper =
    helperText === undefined ? null : (
      <Typography
        variant="caption"
        sx={{ px: HELPER_INSET, color: error ? 'error.main' : 'text.secondary' }}
      >
        {helperText}
      </Typography>
    );

  return (
    <Stack
      data-kk-rich-text-area
      role="group"
      aria-labelledby={labelId}
      sx={[{ minWidth: 0, gap: 0.5 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography
        id={labelId}
        variant="caption"
        sx={{ px: HELPER_INSET, color: error ? 'error.main' : 'text.secondary', fontWeight: 700 }}
      >
        {shownLabel}
      </Typography>
      <Stack sx={frameStyle(error)}>
        <KkFormatRail label={formatLabel} items={formatItems} orientation="horizontal" />
        <Stack sx={{ px: HELPER_INSET, py: 1.5, minWidth: 0 }}>
          <KkProseField
            hostRef={hostRef}
            variant="body"
            placeholder={placeholder}
            isEmpty={isEmpty}
            mentionTones={mentionTones}
          />
        </Stack>
      </Stack>
      {helper}
    </Stack>
  );
};
