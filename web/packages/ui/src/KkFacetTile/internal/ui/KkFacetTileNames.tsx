import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';

const HIDDEN_LIST: CSSObject = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  p: 0,
  m: '-1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
  listStyle: 'none',
};

export interface KkFacetTileName {
  key: number;
  name: string;
}

interface KkFacetTileNamesProps {
  label: string;
  people: readonly KkFacetTileName[];
}

export const KkFacetTileNames: FC<KkFacetTileNamesProps> = ({ label, people }) => {
  const items = people.map((person) => (
    <Box component="li" key={person.key}>
      {person.name}
    </Box>
  ));

  return (
    <Box component="ul" aria-label={label} data-kk-facet-names sx={HIDDEN_LIST}>
      {items}
    </Box>
  );
};
