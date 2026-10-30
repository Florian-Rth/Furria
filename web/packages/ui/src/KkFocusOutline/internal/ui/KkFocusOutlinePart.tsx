import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkFocusOutlineRename } from './KkFocusOutlineField';
import { KkFocusOutlineField } from './KkFocusOutlineField';

interface KkFocusOutlinePartProps {
  name: string;
  meta: string;
  rename: KkFocusOutlineRename | null;
}

export const KkFocusOutlinePart: FC<KkFocusOutlinePartProps> = ({ name, meta, rename }) => {
  const title =
    rename === null ? (
      <Typography
        component="span"
        variant="overline"
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.section,
          lineHeight: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
    ) : (
      <KkFocusOutlineField rename={rename} strong />
    );

  return (
    <Stack
      direction="row"
      role="heading"
      aria-level={3}
      sx={{ alignItems: 'center', gap: 1, minHeight: '2.25rem', px: 1.5, pt: 1 }}
    >
      {title}
      <Typography
        component="span"
        variant="caption"
        sx={{ flex: 'none', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
      >
        {meta}
      </Typography>
    </Stack>
  );
};
