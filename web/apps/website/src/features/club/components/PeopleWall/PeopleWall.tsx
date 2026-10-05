import { KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { peopleChapter } from '@/features/club/people-content';
import { PeopleGrid } from './internal/layout/PeopleGrid';
import { useBoardTiles } from './internal/logic/use-board-tiles';
import { PersonPortrait } from './internal/ui/PersonPortrait';

export const PeopleWall: FC = () => {
  const tiles = useBoardTiles();

  if (tiles.length === 0) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header {...peopleChapter} />
      <PeopleGrid>
        {tiles.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, sm: 4, md: 2 }}>
            <PersonPortrait tile={tile} />
          </Grid>
        ))}
      </PeopleGrid>
    </KkSection>
  );
};
