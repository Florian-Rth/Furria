import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkProofMarkKind } from '../layout/KkProofSheetPart';

interface KkProofSheetMarkWordProps {
  mark: KkProofMarkKind | null;
  label: string;
}

const MARK_FIELDS: Record<KkProofMarkKind, string> = {
  missing: 'error.main',
  changed: 'primary.main',
};

export const KkProofSheetMarkWord: FC<KkProofSheetMarkWordProps> = ({ mark, label }) => {
  if (mark === null) {
    return null;
  }

  return (
    <Typography
      component="span"
      variant="caption"
      data-kk-proof-mark={mark}
      sx={(theme: Theme) => ({
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
        transform: `translateY(calc(-100% - ${theme.spacing(0.25)}))`,
        px: 0.75,
        borderRadius: 1,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'primary.contrastText',
        bgcolor: MARK_FIELDS[mark],
        pointerEvents: 'none',
      })}
    >
      {label}
    </Typography>
  );
};
