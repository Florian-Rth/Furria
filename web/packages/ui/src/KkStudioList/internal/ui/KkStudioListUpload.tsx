import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioListUploadProps {
  title: string;
  meta: string;
  share: number;
  failed: boolean;
  label: string;
  onPress: () => void;
}

export const KkStudioListUpload: FC<KkStudioListUploadProps> = ({
  title,
  meta,
  share,
  failed,
  label,
  onPress,
}) => (
  <ButtonBase
    role="listitem"
    aria-label={label}
    disabled={!failed}
    onClick={onPress}
    data-kk-studio-upload
    data-failed={failed}
    sx={(theme) => ({
      flexShrink: 0,
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.5,
      minHeight: '3rem',
      px: 1.25,
      py: 0.75,
      textAlign: 'left',
      borderRadius: `${kkTokens.radius.base - 4}px`,
      '&.Mui-disabled': { color: palette(theme).text.primary },
      ...focusRing(theme),
    })}
  >
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
      <Typography
        component="span"
        variant="subtitle2"
        sx={{
          flex: 1,
          minWidth: 0,
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={(theme) => ({
          flexShrink: 0,
          fontWeight: 700,
          color: failed ? palette(theme).error.main : palette(theme).text.secondary,
          fontVariantNumeric: 'tabular-nums',
        })}
      >
        {meta}
      </Typography>
    </Stack>
    <Box
      aria-hidden
      sx={(theme) => ({
        height: kkTokens.line.page,
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: palette(theme).divider,
        backgroundImage: `linear-gradient(${failed ? palette(theme).error.main : palette(theme).primary.main}, ${failed ? palette(theme).error.main : palette(theme).primary.main})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${Math.round(share * 1000) / 10}% 100%`,
        transition: 'background-size 200ms linear',
      })}
    />
  </ButtonBase>
);
