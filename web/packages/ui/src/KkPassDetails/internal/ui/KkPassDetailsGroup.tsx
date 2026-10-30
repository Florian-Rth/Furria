import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import { kkTokens } from '../../../tokens';

const LABEL_PAINT: CSSObject = {
  ...kkTokens.eyebrow,
  m: 0,
  color: 'text.secondary',
  typography: 'caption',
  fontWeight: 900,
  textTransform: 'uppercase',
};

const EMPTY_PAINT: CSSObject = { m: 0, color: 'text.secondary', fontWeight: 600 };

interface KkPassDetailsGroupProps extends PropsWithChildren {
  label: string;
  empty?: string;
}

export const KkPassDetailsGroup: FC<KkPassDetailsGroupProps> = ({ label, empty, children }) => {
  const labelId = useId();
  const body =
    empty === undefined ? (
      children
    ) : (
      <Typography component="p" variant="body2" sx={EMPTY_PAINT}>
        {empty}
      </Typography>
    );

  return (
    <Stack component="section" aria-labelledby={labelId} sx={{ gap: 0.75, minWidth: 0 }}>
      <Typography id={labelId} component="h3" sx={LABEL_PAINT}>
        {label}
      </Typography>
      {body}
    </Stack>
  );
};
