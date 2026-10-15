import CardActionArea from '@mui/material/CardActionArea';
import type { FC, PropsWithChildren } from 'react';

interface KkGroupCardFaceProps extends PropsWithChildren {
  onSelect: () => void;
}

export const KkGroupCardFace: FC<KkGroupCardFaceProps> = ({ onSelect, children }) => (
  <CardActionArea
    onClick={onSelect}
    aria-haspopup="dialog"
    data-kk-group-card-face
    sx={(theme) => ({
      '&&': { flexDirection: 'row', alignItems: 'stretch' },
      minHeight: theme.spacing(15),
    })}
  >
    {children}
  </CardActionArea>
);
