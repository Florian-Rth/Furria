import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { PEOPLE, peopleChapter, resolvePersonTint } from '@/features/club/people-content';
import { ChapterHeader } from '../ChapterHeader/ChapterHeader';
import { PeopleGrid } from './internal/layout/PeopleGrid';
import { PersonPortrait } from './internal/ui/PersonPortrait';

export const PeopleWall: FC = () => {
  const theme = useTheme();

  return (
    <Stack component="section" data-kk-people sx={{ gap: { xs: 4, md: 6 } }}>
      <ChapterHeader
        numeral={peopleChapter.numeral}
        kicker={peopleChapter.kicker}
        title={peopleChapter.title}
      />
      <PeopleGrid>
        {PEOPLE.map((person, index) => (
          <Grid key={person.name} size={{ xs: 6, sm: 4, md: 2 }}>
            <PersonPortrait person={person} tint={resolvePersonTint(theme, index)} />
          </Grid>
        ))}
      </PeopleGrid>
    </Stack>
  );
};
