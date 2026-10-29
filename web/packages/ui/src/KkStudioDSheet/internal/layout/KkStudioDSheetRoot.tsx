import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { safeAreaInset } from '../../../internal/safe-area';
import { KkStudioDGlyph } from '../../../KkStudioDGlyph/KkStudioDGlyph';
import { kkTokens } from '../../../tokens';

const SHEET_LAYER = 4;
const SLIDE = 'cubic-bezier(.32,.72,0,1)';
const SLIDE_SECONDS = 0.42;

interface KkStudioDSheetRootProps extends PropsWithChildren {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
}

export const KkStudioDSheetRoot: FC<KkStudioDSheetRootProps> = ({
  open,
  title,
  closeLabel,
  onClose,
  children,
}) => (
  <Box
    aria-hidden={!open}
    data-kk-studio-d-sheet={open ? 'open' : 'closed'}
    sx={{
      position: 'absolute',
      inset: 0,
      zIndex: SHEET_LAYER,
      pointerEvents: open ? 'auto' : 'none',
    }}
  >
    <Box
      aria-hidden
      onClick={onClose}
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: kkTokens.gallery.scrim,
        opacity: open ? 1 : 0,
        transition: `opacity ${SLIDE_SECONDS}s ease-out`,
      }}
    />
    <Stack
      role="dialog"
      aria-label={title}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: '78dvh',
        pb: safeAreaInset('bottom'),
        borderTopLeftRadius: `${kkTokens.radius.base * 1.5}px`,
        borderTopRightRadius: `${kkTokens.radius.base * 1.5}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: kkTokens.shadow.sheet,
        transform: open ? 'translateY(0)' : 'translateY(104%)',
        transition: `transform ${SLIDE_SECONDS}s ${SLIDE}`,
        [theme.breakpoints.up('desktop')]: {
          left: 'auto',
          right: theme.spacing(3),
          bottom: theme.spacing(3),
          top: theme.spacing(3),
          width: '26rem',
          maxHeight: 'none',
          borderRadius: `${kkTokens.radius.base * 1.5}px`,
          transform: open ? 'translateX(0)' : `translateX(calc(100% + ${theme.spacing(4)}))`,
        },
      })}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: 2.5,
          pr: 1,
          pt: 1,
          pb: 0.5,
        }}
      >
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
        <ButtonBase
          aria-label={closeLabel}
          onClick={onClose}
          sx={(theme) => ({
            width: kkTokens.tapTarget,
            height: kkTokens.tapTarget,
            borderRadius: '50%',
            color: 'text.secondary',
            ...focusRing(theme),
          })}
        >
          <KkStudioDGlyph name="close" size="1.125rem" />
        </ButtonBase>
      </Stack>
      <Stack sx={{ overflowY: 'auto', overscrollBehavior: 'contain', px: 1, pb: 2, minHeight: 0 }}>
        {children}
      </Stack>
    </Stack>
  </Box>
);
