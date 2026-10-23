import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, MouseEvent } from 'react';
import type { KkImageSource } from './image-source';
import { focusRing } from './internal/focus-ring';
import { redInk } from './internal/red-ink';
import { KkAvatar } from './KkAvatar/KkAvatar';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkCastTileState = 'in' | 'out' | 'guest' | 'person';

export interface KkCastTile {
  id: number;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  state: KkCastTileState;
  badge: string | null;
  stateLabel: string;
}

const TILE_MIN = '4.5rem';
const AVATAR_EXTENT = '2.5rem';
const FLIP = { duration: 0.42, ease: [0.22, 0.61, 0.36, 1] } as const;

const tilePaint = (theme: Theme): CSSObject => ({
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.375,
  py: 0.75,
  px: 0.25,
  borderRadius: `${kkTokens.radius.base}px`,
  ...focusRing(theme),
  '& [data-kk-cast-face]': { transition: 'filter 200ms ease-out, opacity 200ms ease-out' },
  '&[aria-pressed="false"] [data-kk-cast-face]': { filter: 'grayscale(1)', opacity: 0.45 },
  '&[aria-pressed="false"] [data-kk-cast-name]': {
    textDecoration: 'line-through',
    color: 'text.secondary',
  },
  '@media (hover: hover)': {
    '&:hover': { backgroundColor: 'action.hover' },
    '&:hover [data-kk-cast-name]': redInk(theme),
  },
});

const badgePaint: CSSObject = {
  px: 0.625,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'text.primary',
  borderRadius: `${kkTokens.radius.pill}px`,
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1.35,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  color: 'text.primary',
};

const addPaint = (theme: Theme): CSSObject => ({
  ...tilePaint(theme),
  color: 'text.secondary',
  '& [data-kk-cast-add]': {
    width: AVATAR_EXTENT,
    height: AVATAR_EXTENT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    borderWidth: kkTokens.line.section,
    borderStyle: 'dashed',
    borderColor: 'divider',
  },
});

interface KkCastGridProps {
  label: string;
  tiles: readonly KkCastTile[];
  addLabel: string;
  onToggle: (id: number) => void;
  onAdd: () => void;
  sx?: KkSx;
}

export const KkCastGrid: FC<KkCastGridProps> = ({
  label,
  tiles,
  addLabel,
  onToggle,
  onAdd,
  sx,
}) => {
  const toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = Number(event.currentTarget.dataset.kkCastTile);

    if (Number.isInteger(id)) {
      onToggle(id);
    }
  };
  const items = tiles.map((tile) => {
    const out = tile.state === 'out';
    const note =
      tile.badge === null ? null : (
        <Box component="span" aria-hidden sx={badgePaint}>
          {tile.badge}
        </Box>
      );

    return (
      <Stack component="li" key={tile.id} sx={{ minWidth: 0 }}>
        <ButtonBase
          aria-pressed={!out}
          aria-label={`${tile.name}, ${tile.stateLabel}`}
          data-kk-cast-tile={tile.id}
          data-kk-cast-state={tile.state}
          onClick={toggle}
          sx={tilePaint}
        >
          <Box
            component={motion.span}
            initial={false}
            animate={{ rotateY: out ? 360 : 0 }}
            transition={FLIP}
            data-kk-cast-face
            sx={{ display: 'inline-flex' }}
          >
            <KkAvatar initials={tile.initials} image={tile.portrait} component="span" />
          </Box>
          <Box
            component="span"
            data-kk-cast-name
            sx={{
              maxWidth: '100%',
              typography: 'caption',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'text.primary',
              textAlign: 'center',
              overflowWrap: 'anywhere',
            }}
          >
            {tile.name}
          </Box>
          {note}
        </ButtonBase>
      </Stack>
    );
  });

  return (
    <Box
      component="ul"
      aria-label={label}
      data-kk-cast-grid
      sx={[
        {
          listStyle: 'none',
          m: 0,
          p: 0,
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_MIN}, 1fr))`,
          gap: 0.5,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {items}
      <Stack component="li" sx={{ minWidth: 0 }}>
        <ButtonBase onClick={onAdd} data-kk-cast-add-tile sx={addPaint}>
          <Stack component="span" data-kk-cast-add>
            <KkIcon name="add" size="small" />
          </Stack>
          <Box
            component="span"
            sx={{ typography: 'caption', fontWeight: 800, lineHeight: 1.15, textAlign: 'center' }}
          >
            {addLabel}
          </Box>
        </ButtonBase>
      </Stack>
    </Box>
  );
};
