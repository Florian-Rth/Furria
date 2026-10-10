import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';

interface KkTieOfferProps {
  id: string;
  icon: KkIconName;
  label: string;
  onChoose: () => void;
}

export const KkTieOffer: FC<KkTieOfferProps> = ({ id, icon, label, onChoose }) => (
  <ButtonBase
    id={id}
    onClick={onChoose}
    data-kk-tie-slot="empty"
    sx={(theme) => ({
      gap: 0.75,
      px: 1.5,
      minHeight: theme.spacing(4.5),
      border: 1,
      borderStyle: 'dashed',
      borderColor: 'text.disabled',
      borderRadius: 5,
      color: 'text.secondary',
      '@media (hover: hover)': {
        '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
      },
      ...focusRing(theme),
    })}
  >
    <KkIcon name={icon} size="small" />
    <Typography variant="caption" sx={{ fontWeight: 800 }}>
      {label}
    </Typography>
  </ButtonBase>
);
