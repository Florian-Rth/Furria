import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { AlbumSessionGroup } from '@/features/gallery/gallery-content';
import { buildOlderSessionSummary } from '@/features/gallery/gallery-content';
import { OlderSessionMarker } from './OlderSessionMarker';

interface OlderSessionToggleProps {
  group: AlbumSessionGroup;
  expanded: boolean;
  id: string;
  panelId: string;
  onToggle: () => void;
}

export const OlderSessionToggle: FC<OlderSessionToggleProps> = ({
  group,
  expanded,
  id,
  panelId,
  onToggle,
}) => {
  const summary = buildOlderSessionSummary(group);

  return (
    <ButtonBase
      data-kk-older-session-toggle
      id={id}
      aria-expanded={expanded}
      aria-controls={panelId}
      onClick={onToggle}
      sx={(theme) => ({
        justifyContent: 'flex-start',
        textAlign: 'left',
        width: '100%',
        py: { xs: 1.75, desktop: 2 },
        px: 0.5,
        borderRadius: 1,
        '&:hover [data-kk-older-session-label]': { color: 'primary.main' },
        '&.Mui-focusVisible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 2,
        },
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, width: '100%', minWidth: 0 }}>
        <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.25, alignItems: 'flex-start' }}>
          <Typography
            variant="h3"
            component="span"
            data-kk-older-session-label
            sx={(theme) => ({
              color: 'text.primary',
              overflowWrap: 'anywhere',
              transition: theme.transitions.create(['color'], {
                duration: theme.transitions.duration.shortest,
              }),
            })}
          >
            {group.session.yearsLabel}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}
          >
            {summary}
          </Typography>
        </Stack>
        <OlderSessionMarker expanded={expanded} />
      </Stack>
    </ButtonBase>
  );
};
