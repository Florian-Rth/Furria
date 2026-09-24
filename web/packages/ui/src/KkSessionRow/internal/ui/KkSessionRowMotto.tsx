import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

const writtenPaint: CSSObject = { fontWeight: 800, color: 'text.primary' };
const missingPaint: CSSObject = { fontWeight: 500, fontStyle: 'italic', color: 'text.secondary' };

interface KkSessionRowMottoProps extends PropsWithChildren {
  missing?: boolean;
}

export const KkSessionRowMotto: FC<KkSessionRowMottoProps> = ({ missing = false, children }) => {
  const paint = missing ? missingPaint : writtenPaint;

  return (
    <Typography
      variant="body2"
      component="p"
      data-kk-session-row-motto
      sx={{ lineHeight: 1.3, textWrap: 'pretty', minWidth: 0, ...paint }}
    >
      {children}
    </Typography>
  );
};
