import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import type { KkDensePanelMaterial } from '../dense-panel-paint';
import { densePanelFrame, densePanelMaterials } from '../dense-panel-paint';

interface KkDensePanelRootProps extends PropsWithChildren {
  material: KkDensePanelMaterial;
  labelledBy: string;
  sx?: KkSx;
}

export const KkDensePanelRoot: FC<KkDensePanelRootProps> = ({
  material,
  labelledBy,
  sx,
  children,
}) => (
  <Stack
    component="section"
    aria-labelledby={labelledBy}
    data-kk-dense-panel={material}
    sx={[densePanelFrame, densePanelMaterials[material], ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
