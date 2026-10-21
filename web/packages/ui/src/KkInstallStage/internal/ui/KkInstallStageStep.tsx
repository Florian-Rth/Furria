import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { KK_INSTALL_FUSE_STEP_SECONDS, kkInstallFuseIgniteAt } from '../../install-fuse';

const ignite = keyframes`
  0% { transform: scale(1); }
  35% { transform: scale(1.28); box-shadow: 0 0 0 6px var(--kk-fuse-flash); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
`;

const light = keyframes`
  from { background-color: transparent; color: var(--kk-fuse-cold); }
  to { background-color: var(--kk-fuse-hot); color: var(--kk-fuse-on-hot); }
`;

const burn = keyframes`
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
`;

const travel = keyframes`
  0% { top: 0; opacity: 1; }
  92% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;

const NUMERAL = '2.25rem';
const GLYPH = '2.5rem';
const SPARK = '0.5rem';
const STEP_GAP = 2;

interface KkInstallStageStepProps {
  index: number;
  icon: KkIconName;
  action: string;
  label: string;
  hint?: string;
  isLast?: boolean;
}

export const KkInstallStageStep: FC<KkInstallStageStepProps> = ({
  index,
  icon,
  action,
  label,
  hint,
  isLast = false,
}) => {
  const igniteAt = kkInstallFuseIgniteAt(index);
  const burnSeconds = KK_INSTALL_FUSE_STEP_SECONDS;
  const fuse = isLast ? null : (
    <Box aria-hidden sx={{ position: 'relative', flex: 1, width: kkTokens.line.page, my: 0.5 }}>
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: 1, bgcolor: 'divider' }} />
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          borderRadius: 1,
          transformOrigin: 'top',
          backgroundImage: `linear-gradient(to bottom, ${(theme.vars ?? theme).palette.primary.main}, ${(theme.vars ?? theme).palette.warning.main})`,
          animation: `${burn} ${burnSeconds}s linear ${igniteAt}s both`,
        })}
      />
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: '50%',
          width: SPARK,
          height: SPARK,
          ml: `calc(${SPARK} / -2)`,
          mt: `calc(${SPARK} / -2)`,
          borderRadius: '50%',
          bgcolor: 'warning.main',
          boxShadow: `0 0 10px 3px ${(theme.vars ?? theme).palette.warning.main}`,
          opacity: 0,
          animation: `${travel} ${burnSeconds}s linear ${igniteAt}s both`,
        })}
      />
    </Box>
  );
  const hintLine =
    hint === undefined ? null : (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {hint}
      </Typography>
    );

  return (
    <Stack component="li" direction="row" sx={{ columnGap: 1.5, alignItems: 'stretch' }}>
      <Stack sx={{ alignItems: 'center', width: NUMERAL, flexShrink: 0 }}>
        <Box
          aria-hidden
          sx={(theme) => ({
            '--kk-fuse-flash': (theme.vars ?? theme).palette.warning.main,
            '--kk-fuse-hot': (theme.vars ?? theme).palette.primary.main,
            '--kk-fuse-on-hot': (theme.vars ?? theme).palette.common.white,
            '--kk-fuse-cold': (theme.vars ?? theme).palette.text.secondary,
            width: NUMERAL,
            height: NUMERAL,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            border: `${kkTokens.line.section}px solid`,
            borderColor: 'text.primary',
            typography: 'h4',
            lineHeight: 1,
            animation: `${light} 0.2s linear ${igniteAt}s both, ${ignite} 0.5s ease-out ${igniteAt}s both`,
          })}
        >
          {index + 1}
        </Box>
        {fuse}
      </Stack>
      <Stack
        direction="row"
        sx={{
          flex: 1,
          minWidth: 0,
          columnGap: 1.25,
          alignItems: 'flex-start',
          pb: isLast ? 0 : STEP_GAP,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: GLYPH,
            height: GLYPH,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: `${kkTokens.radius.base}px`,
            bgcolor: 'background.paper',
            border: `${kkTokens.line.hair}px solid`,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <KkIcon name={icon} size="small" />
        </Box>
        <Stack sx={{ minWidth: 0, pt: 0.25 }}>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {action}{' '}
            <Box component="strong" sx={{ fontWeight: 800 }}>
              {label}
            </Box>
          </Typography>
          {hintLine}
        </Stack>
      </Stack>
    </Stack>
  );
};
