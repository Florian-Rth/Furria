import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkStateGlyph } from '../../../KkStatePill/KkStateGlyph';
import { stepFigures, stepLabel, stepStateInk } from '../../../KkStatePill/state-paint';
import type { KkStepState } from '../../../KkStatePill/step-state';

const ICON_EXTENT = '1.125rem';

interface KkFactStripFactProps {
  label: string;
  value: string;
  icon?: KkIconName;
  state?: KkStepState;
}

export const KkFactStripFact: FC<KkFactStripFactProps> = ({ label, value, icon, state }) => {
  const glyph = state === undefined || state === 'done' ? null : <KkStateGlyph state={state} />;
  const lead =
    icon === undefined ? null : (
      <KkIcon
        name={icon}
        sx={{ width: ICON_EXTENT, height: ICON_EXTENT, flexShrink: 0, color: 'text.secondary' }}
      />
    );

  return (
    <Stack
      direction="row"
      data-kk-fact-strip-fact
      sx={{
        alignItems: 'flex-start',
        minWidth: 0,
        gap: 1,
        px: { xs: 1.25, sm: 1.5 },
        py: { xs: 1, sm: 1.25 },
      }}
    >
      {lead}
      <Stack sx={{ minWidth: 0, gap: 0.25 }}>
        <Box component="dt" sx={stepLabel}>
          {label}
        </Box>
        <Stack
          component="dd"
          direction="row"
          sx={[
            (theme) => ({
              ...stepFigures,
              m: 0,
              alignItems: 'center',
              gap: 0.625,
              minWidth: 0,
              typography: 'body2',
              fontWeight: 800,
              lineHeight: 1.25,
              overflowWrap: 'anywhere',
              ...(state === 'overdue' || state === 'current'
                ? stepStateInk(theme, state)
                : { color: state === 'open' ? 'text.secondary' : 'text.primary' }),
            }),
          ]}
        >
          {glyph}
          <Box component="span" sx={{ minWidth: 0 }}>
            {value}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};
