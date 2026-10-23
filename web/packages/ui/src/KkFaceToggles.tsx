import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, MouseEvent } from 'react';
import type { KkImageSource } from './image-source';
import { focusRing } from './internal/focus-ring';
import { redInk } from './internal/red-ink';
import { KkAvatar } from './KkAvatar/KkAvatar';
import { KkChipScroller } from './KkChipScroller';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkFaceToggle {
  id: number;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  count?: number | null;
}

export type KkFaceTogglesLayout = 'scroll' | 'wrap';

const FACE_WIDTH = '3.5rem';
const RING = 2;
const BADGE_SIZE = '1.125rem';

const facePaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  width: FACE_WIDTH,
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.375,
  py: 0.5,
  borderRadius: `${kkTokens.radius.base}px`,
  transition: 'opacity 200ms ease-out',
  ...focusRing(theme),
  '& [data-kk-face-ring]': {
    borderRadius: '50%',
    outlineWidth: RING,
    outlineStyle: 'solid',
    outlineColor: 'transparent',
    outlineOffset: RING,
    transition: 'outline-color 200ms ease-out',
  },
  '&[aria-pressed="true"] [data-kk-face-ring]': {
    outlineColor: (theme.vars ?? theme).palette.primary.main,
  },
  '&[aria-pressed="true"] [data-kk-face-name]': redInk(theme),
  '[data-kk-face-toggles][data-kk-face-chosen="true"] &[aria-pressed="false"]': { opacity: 0.5 },
  '@media (hover: hover)': { '&:hover [data-kk-face-name]': redInk(theme) },
});

const badgePaint = (theme: Theme): CSSObject => ({
  ...stepFigures,
  position: 'absolute',
  top: 0,
  right: 2,
  minWidth: BADGE_SIZE,
  height: BADGE_SIZE,
  px: 0.375,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: `${kkTokens.radius.pill}px`,
  fontFamily: kkTokens.font.display,
  typography: 'caption',
  lineHeight: 1,
  color: (theme.vars ?? theme).palette.background.paper,
  backgroundColor: (theme.vars ?? theme).palette.text.primary,
  boxShadow: `0 0 0 ${RING}px ${(theme.vars ?? theme).palette.background.paper}`,
});

interface KkFaceTogglesProps {
  label: string;
  faces: readonly KkFaceToggle[];
  selectedId: number | null;
  pressLabel: string;
  layout?: KkFaceTogglesLayout;
  onToggle: (id: number) => void;
  sx?: KkSx;
}

export const KkFaceToggles: FC<KkFaceTogglesProps> = ({
  label,
  faces,
  selectedId,
  pressLabel,
  layout = 'wrap',
  onToggle,
  sx,
}) => {
  const toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = Number(event.currentTarget.dataset.kkFace);

    if (Number.isInteger(id)) {
      onToggle(id);
    }
  };
  const items = faces.map((face) => {
    const count =
      face.count === undefined || face.count === null ? null : (
        <Box component="span" aria-hidden sx={badgePaint}>
          {face.count}
        </Box>
      );

    return (
      <Stack component="li" key={face.id} sx={{ flexShrink: 0 }}>
        <ButtonBase
          aria-pressed={face.id === selectedId}
          aria-label={`${pressLabel}: ${face.name}`}
          data-kk-face={face.id}
          onClick={toggle}
          sx={facePaint}
        >
          <Box component="span" data-kk-face-ring sx={{ display: 'inline-flex' }}>
            <KkAvatar initials={face.initials} image={face.portrait} component="span" />
          </Box>
          {count}
          <Box
            component="span"
            data-kk-face-name
            sx={{
              maxWidth: '100%',
              typography: 'caption',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'text.primary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {face.name}
          </Box>
        </ButtonBase>
      </Stack>
    );
  });
  const list = (
    <Stack
      component="ul"
      direction="row"
      aria-label={label}
      data-kk-face-toggles
      data-kk-face-chosen={selectedId !== null}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        gap: 0.5,
        minWidth: 0,
        flexWrap: layout === 'wrap' ? 'wrap' : 'nowrap',
      }}
    >
      {items}
    </Stack>
  );

  if (layout === 'wrap') {
    return <Box sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>{list}</Box>;
  }

  return <KkChipScroller sx={sx}>{list}</KkChipScroller>;
};
