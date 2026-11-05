import { KkIconButton } from '@furria/ui/KkIconButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { INSPECTOR_CLOSE_LABEL } from '../hall-builder-copy';
import { HallInspectorBody } from './HallInspectorBody';

export const HallInspectorSheet: FC = () => {
  const builder = useHallBuilderContext();

  return (
    <Stack sx={{ gap: 1, pb: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <KkIconButton label={INSPECTOR_CLOSE_LABEL} icon="close" onClick={builder.closeInspector} />
      </Stack>
      <HallInspectorBody />
    </Stack>
  );
};
