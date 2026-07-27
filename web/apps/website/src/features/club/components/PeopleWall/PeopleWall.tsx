import { KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { PEOPLE, peopleChapter, resolvePersonTint } from '@/features/club/people-content';
import { PeopleGrid } from './internal/layout/PeopleGrid';
import { PersonPortrait } from './internal/ui/PersonPortrait';

export const PeopleWall: FC = () => {
  const theme = useTheme();

  return (
    <KkSection>
      <KkSection.Header {...peopleChapter} />
      <PeopleGrid>
        {PEOPLE.map((person, index) => (
          <Grid key={person.name} size={{ xs: 6, sm: 4, md: 2 }}>
            <PersonPortrait person={person} tint={resolvePersonTint(theme, index)} />
          </Grid>
        ))}
      </PeopleGrid>
    </KkSection>
  );
};
