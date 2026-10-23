import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkImageSource } from './image-source';
import { focusRing } from './internal/focus-ring';
import { redInk } from './internal/red-ink';
import { KkAvatar } from './KkAvatar/KkAvatar';
import { kkTokens } from './tokens';

export interface KkCastFace {
  id: number;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  absent: boolean;
}

interface KkCastFacesProps {
  label: string;
  people: readonly KkCastFace[];
  absentLabel: string;
  openLabel?: string;
  onOpen?: (id: number) => void;
}

const nameDecorationOf = (absent: boolean, opens: boolean): CSSObject => {
  if (absent) {
    return { textDecoration: 'line-through' };
  }

  return opens
    ? {
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationThickness: kkTokens.line.section,
        textUnderlineOffset: '0.18em',
      }
    : { textDecoration: 'none' };
};

const personPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.5,
  py: 0.5,
  borderRadius: `${kkTokens.radius.base}px`,
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover [data-kk-cast-faces-name]': redInk(theme),
  },
});

export const KkCastFaces: FC<KkCastFacesProps> = ({
  label,
  people,
  absentLabel,
  openLabel,
  onOpen,
}) => {
  const items = people.map((person) => {
    const absentNote = person.absent ? (
      <Box
        component="span"
        sx={{ typography: 'caption', fontWeight: 800, lineHeight: 1.1, color: 'text.secondary' }}
      >
        {absentLabel}
      </Box>
    ) : null;

    const face = (
      <>
        <KkAvatar initials={person.initials} image={person.portrait} />
        <Box
          component="span"
          data-kk-cast-faces-name
          sx={{
            typography: 'caption',
            fontWeight: 700,
            lineHeight: 1.15,
            color: 'text.primary',
            overflowWrap: 'anywhere',
            ...nameDecorationOf(person.absent, onOpen !== undefined),
          }}
        >
          {person.name}
        </Box>
        {absentNote}
      </>
    );
    const open = (): void => {
      onOpen?.(person.id);
    };
    const content =
      onOpen === undefined ? (
        face
      ) : (
        <ButtonBase
          onClick={open}
          aria-label={`${openLabel ?? label}: ${person.name}`}
          sx={personPaint}
        >
          {face}
        </ButtonBase>
      );

    return (
      <Stack
        component="li"
        key={person.id}
        data-kk-cast-faces-absent={person.absent ? true : undefined}
        sx={{
          width: '4.25rem',
          alignItems: 'center',
          gap: 0.5,
          textAlign: 'center',
          opacity: person.absent ? 0.55 : 1,
        }}
      >
        {content}
      </Stack>
    );
  });

  return (
    <Stack
      component="ul"
      direction="row"
      aria-label={label}
      sx={{ listStyle: 'none', m: 0, p: 0, flexWrap: 'wrap', gap: 1, minWidth: 0 }}
    >
      {items}
    </Stack>
  );
};
