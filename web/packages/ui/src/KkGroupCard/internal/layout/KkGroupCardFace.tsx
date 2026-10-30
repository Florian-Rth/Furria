import CardActionArea from '@mui/material/CardActionArea';
import type { ElementType, FC, PropsWithChildren } from 'react';

interface KkGroupCardFaceProps extends PropsWithChildren {
  component: ElementType;
  to: string;
  params: Record<string, string>;
}

export const KkGroupCardFace: FC<KkGroupCardFaceProps> = ({ component, to, params, children }) => (
  <CardActionArea
    component={component}
    to={to}
    params={params}
    data-kk-group-card-face
    sx={(theme) => ({
      '&&': { flexDirection: 'row', alignItems: 'stretch' },
      minHeight: theme.spacing(15),
    })}
  >
    {children}
  </CardActionArea>
);
