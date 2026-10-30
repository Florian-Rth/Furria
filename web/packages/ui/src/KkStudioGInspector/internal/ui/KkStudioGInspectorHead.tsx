import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';
import { kkTokens } from '../../../tokens';
import type { KkStudioGInspectorKind } from './kk-studio-g-kind-glyphs';
import { KIND_GLYPHS } from './kk-studio-g-kind-glyphs';

interface KkStudioGInspectorHeadProps {
  kind: KkStudioGInspectorKind;
  eyebrow: string;
  title: string;
  closeLabel?: string;
  onClose?: () => void;
}

export const KkStudioGInspectorHead: FC<KkStudioGInspectorHeadProps> = ({
  kind,
  eyebrow,
  title,
  closeLabel,
  onClose,
}) => {
  const close =
    onClose === undefined ? null : (
      <ButtonBase
        aria-label={closeLabel}
        onClick={onClose}
        data-kk-studio-g-inspector-close
        sx={(theme) => ({
          width: kkTokens.tapTarget,
          height: kkTokens.tapTarget,
          flexShrink: 0,
          borderRadius: `${kkTokens.radius.pill}px`,
          color: (theme.vars ?? theme).palette.text.secondary,
          ...focusRing(theme),
        })}
      >
        <CloseRoundedIcon />
      </ButtonBase>
    );

  return (
    <Stack
      direction="row"
      data-kk-studio-g-inspector-head
      sx={{
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        pl: 1.5,
        pr: 0.5,
        pt: 0.75,
        pb: 0.5,
        [STUDIO_G_WIDE]: { pl: 2, pr: 1, pt: 1.5, pb: 1 },
      }}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          display: 'grid',
          placeItems: 'center',
          width: '2rem',
          height: '2rem',
          flexShrink: 0,
          borderRadius: `${kkTokens.radius.bar * 2}px`,
          backgroundColor: (theme.vars ?? theme).palette.text.primary,
          color: (theme.vars ?? theme).palette.background.paper,
          '& svg': { width: '1.125rem', height: '1.125rem' },
        })}
      >
        {KIND_GLYPHS[kind]}
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="overline"
          noWrap
          sx={{
            fontWeight: kkTokens.eyebrow.fontWeight,
            letterSpacing: kkTokens.type.tracking.label,
            lineHeight: 1.2,
            color: 'text.secondary',
          }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h4" component="h2" noWrap sx={{ m: 0 }}>
          {title}
        </Typography>
      </Stack>
      {close}
    </Stack>
  );
};
