import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkPracticeStepsRowProps extends PropsWithChildren {
  number: number;
  name: string;
  meta: string;
  filmed: boolean;
  filmedLabel: string;
  current: boolean;
  looped: boolean;
  label: string;
  loopLabel: string;
  onPress: () => void;
  onLoop: () => void;
}

export const KkPracticeStepsRow: FC<KkPracticeStepsRowProps> = ({
  number,
  name,
  meta,
  filmed,
  filmedLabel,
  current,
  looped,
  label,
  loopLabel,
  onPress,
  onLoop,
  children,
}) => {
  const film = filmed ? (
    <VideocamRoundedIcon
      titleAccess={filmedLabel}
      fontSize="small"
      sx={{ color: 'text.secondary', flexShrink: 0 }}
    />
  ) : null;

  return (
    <Stack
      direction="row"
      data-kk-practice-steps-row
      data-current={current}
      sx={(theme) => ({
        position: 'relative',
        alignItems: 'center',
        gap: 0.5,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: current ? palette(theme).action.selected : 'transparent',
        transition: 'background-color 200ms ease-out',
      })}
    >
      <ButtonBase
        aria-label={label}
        aria-current={current ? 'step' : undefined}
        onClick={onPress}
        sx={(theme) => ({
          flex: 1,
          minWidth: 0,
          justifyContent: 'flex-start',
          gap: 1.25,
          py: 0.75,
          pl: 1,
          borderRadius: 'inherit',
          textAlign: 'left',
          ...focusRing(theme),
        })}
      >
        {children}
        <Typography
          component="span"
          variant="subtitle2"
          sx={(theme) => ({
            width: '1.25rem',
            flexShrink: 0,
            textAlign: 'right',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: palette(theme).text.secondary,
            ...(current ? redInk(theme) : {}),
          })}
        >
          {number}
        </Typography>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="span"
            variant="subtitle2"
            sx={{
              fontWeight: 800,
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
            }}
          >
            {meta}
          </Typography>
        </Stack>
        {film}
      </ButtonBase>
      <ButtonBase
        aria-label={loopLabel}
        aria-pressed={looped}
        onClick={onLoop}
        data-kk-practice-steps-loop
        sx={(theme) => ({
          width: kkTokens.tapTarget,
          height: kkTokens.tapTarget,
          flexShrink: 0,
          borderRadius: `${kkTokens.radius.pill}px`,
          color: palette(theme).text.disabled,
          ...(looped ? { ...accentWash(theme), ...redInk(theme) } : {}),
          ...focusRing(theme),
        })}
      >
        <RepeatOneRoundedIcon fontSize="small" />
      </ButtonBase>
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: '0.75rem',
          bottom: '0.75rem',
          width: kkTokens.line.page,
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: palette(theme).primary.main,
          opacity: current ? 1 : 0,
        })}
      />
    </Stack>
  );
};
