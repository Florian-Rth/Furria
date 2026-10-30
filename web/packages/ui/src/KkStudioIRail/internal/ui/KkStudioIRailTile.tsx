import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { redInk } from '../../../internal/red-ink';
import { useShownWhenCurrent } from '../logic/use-shown-when-current';
import { tilePaint } from './kk-studio-i-tile-paint';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIRailTileProps extends PropsWithChildren {
  number: number;
  name: string;
  meta: string;
  current: boolean;
  label: string;
  onPress: () => void;
}

export const KkStudioIRailTile: FC<KkStudioIRailTileProps> = ({
  number,
  name,
  meta,
  current,
  label,
  onPress,
  children,
}) => {
  const ref = useShownWhenCurrent(current);

  return (
    <ButtonBase
      ref={ref}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      data-kk-studio-i-tile
      data-current={current}
      onClick={onPress}
      sx={tilePaint(current)}
    >
      {children}
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.5, minWidth: 0 }}>
          <Typography
            component="span"
            variant="subtitle2"
            sx={(theme) => ({
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: palette(theme).text.secondary,
              ...(current ? redInk(theme) : {}),
            })}
          >
            {number}
          </Typography>
          <Typography
            component="span"
            variant="subtitle2"
            sx={{
              fontWeight: current ? 900 : 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Typography>
        </Stack>
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}
        >
          {meta}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};
