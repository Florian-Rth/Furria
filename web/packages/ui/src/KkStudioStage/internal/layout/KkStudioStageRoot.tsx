import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';

const FRONT_ROOM = '1.125rem';
const VEIL = '30%';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioStageRootProps extends PropsWithChildren {
  label: string;
  frontLabel: string;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  onClear: () => void;
}

export const KkStudioStageRoot: FC<KkStudioStageRootProps> = ({
  label,
  frontLabel,
  widthMetres,
  depthMetres,
  artworkSvg,
  onClear,
  children,
}) => {
  const source = stretchedSvgSourceOf(artworkSvg);
  const artwork =
    source === null ? null : (
      <KkPhoto
        alt=""
        image={{ src: source }}
        fit="fill"
        fill
        priority
        sx={{ position: 'absolute', inset: 0, transform: 'rotate(180deg)', pointerEvents: 'none' }}
      />
    );
  const grid = {
    backgroundSize: `calc(100% / ${widthMetres}) calc(100% / ${depthMetres})`,
  };

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        containerType: 'size',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        role="group"
        aria-label={label}
        data-kk-studio-stage
        sx={(theme) => ({
          position: 'relative',
          width: `min(100cqw, calc((100cqh - ${FRONT_ROOM}) * ${widthMetres} / ${depthMetres}))`,
          aspectRatio: `${widthMetres} / ${depthMetres}`,
          mt: FRONT_ROOM,
          borderRadius: `${kkTokens.radius.base}px`,
          backgroundColor: palette(theme).background.paper,
          boxShadow: kkTokens.shadow.raised,
        })}
      >
        <Box
          aria-hidden
          sx={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'clip' }}
        >
          {artwork}
          <Box
            style={grid}
            sx={(theme) => ({
              position: 'absolute',
              inset: 0,
              backgroundColor: `color-mix(in srgb, ${palette(theme).background.default} ${VEIL}, transparent)`,
              backgroundImage: `linear-gradient(to right, ${palette(theme).divider} 1px, transparent 1px), linear-gradient(to bottom, ${palette(theme).divider} 1px, transparent 1px)`,
            })}
          />
          <Box
            sx={(theme) => ({
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              borderLeft: `${kkTokens.line.hair}px dashed ${palette(theme).text.secondary}`,
            })}
          />
          <Box
            sx={(theme) => ({
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: kkTokens.line.page,
              backgroundColor: palette(theme).text.primary,
            })}
          />
        </Box>
        <Typography
          aria-hidden
          variant="overline"
          sx={(theme) => ({
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translate(-50%, -100%)',
            pb: 0.25,
            fontWeight: kkTokens.eyebrow.fontWeight,
            letterSpacing: kkTokens.eyebrow.letterSpacing,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: palette(theme).text.secondary,
          })}
        >
          {frontLabel}
        </Typography>
        <Box
          data-kk-studio-track
          onPointerDown={onClear}
          sx={{ position: 'absolute', inset: 0, containerType: 'size', touchAction: 'none' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
