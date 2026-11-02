import { KkScreen } from '@furria/ui/KkScreen';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { useStudioLabPage } from '../hooks/use-studio-lab-page';
import type { StudioLabSearch } from '../schemas';
import type { StudioLabEntry } from '../studio-lab';
import { studioLabToolsOf } from '../studio-lab-tools';
import { StudioLabBody } from './StudioLabBody';
import { StudioLabTools } from './StudioLabTools';

interface StudioLabPageProps {
  entry: StudioLabEntry;
  search: StudioLabSearch;
}

export const StudioLabPage: FC<StudioLabPageProps> = ({ entry, search }) => {
  const page = useStudioLabPage(search);
  const tools = (
    <StudioLabTools tools={studioLabToolsOf(entry.playground, page.variants, page.choose)} />
  );

  return (
    <KkScreen kind="working" title={entry.title} origin={LAB_ORIGIN}>
      <Stack sx={{ gap: 2 }}>
        {tools}
        <StudioLabBody playground={entry.playground} load={page.load} variants={page.variants} />
      </Stack>
    </KkScreen>
  );
};
