import LibraryMusicOutlinedIcon from '@mui/icons-material/LibraryMusicOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KK_STUDIO_I_WIDE } from '../../../KkStudioIEditor/studio-i-editor-query';
import { useShownWhenCurrent } from '../logic/use-shown-when-current';
import { tilePaint } from './kk-studio-i-tile-paint';

interface KkStudioIRailLeadProps {
  name: string;
  meta: string;
  current: boolean;
  onPress: () => void;
}

export const KkStudioIRailLead: FC<KkStudioIRailLeadProps> = ({ name, meta, current, onPress }) => {
  const ref = useShownWhenCurrent(current);

  return (
    <ButtonBase
      ref={ref}
      aria-current={current ? 'page' : undefined}
      data-kk-studio-i-lead
      data-current={current}
      onClick={onPress}
      sx={[
        tilePaint(current),
        { alignSelf: 'flex-end', [KK_STUDIO_I_WIDE]: { alignSelf: 'stretch' } },
      ]}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          width: '3rem',
          aspectRatio: '10 / 7',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.25rem',
          color: (theme.vars ?? theme).palette.text.secondary,
          backgroundColor: (theme.vars ?? theme).palette.action.hover,
        })}
      >
        <LibraryMusicOutlinedIcon fontSize="small" />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="span"
          variant="subtitle2"
          sx={{
            fontWeight: current ? 900 : 700,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </Typography>
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
