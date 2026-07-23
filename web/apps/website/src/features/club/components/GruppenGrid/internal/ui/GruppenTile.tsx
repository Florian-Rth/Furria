import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Group } from '@/features/club/groups-content';

interface GruppenTileProps {
  group: Group;
  tint: string;
  badge: string;
  onOpen: () => void;
}

export const GruppenTile: FC<GruppenTileProps> = ({ group, tint, badge, onOpen }) => (
  <Card
    data-kk-gruppen-tile
    sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
  >
    <CardActionArea
      onClick={onOpen}
      aria-label={`${group.title} — mehr erfahren`}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
    >
      <Box sx={{ position: 'relative' }}>
        <KkPhotoPlaceholder
          label="gruppen-foto"
          tint={tint}
          aspectRatio={kkTokens.aspectRatio.banner}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bgcolor: 'background.paper',
            color: tint,
            fontFamily: kkTokens.font.display,
            fontSize: '1.125rem',
            lineHeight: 1,
            px: 1.25,
            py: 0.75,
            borderRight: 1,
            borderBottom: 1,
            borderColor: 'divider',
            borderBottomRightRadius: `${kkTokens.radius.base}px`,
          }}
        >
          {badge}
        </Box>
      </Box>
      <Stack
        sx={{ width: '100%', gap: 1, p: { xs: 2, md: 2.5 }, flexGrow: 1, alignItems: 'flex-start' }}
      >
        <Typography variant="h5" component="h3">
          {group.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {group.blurb}
        </Typography>
        <Stack
          direction="row"
          sx={{
            width: '100%',
            mt: 'auto',
            pt: 1,
            gap: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            {group.memberMeta}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.04em', color: tint }}
          >
            Mehr →
          </Typography>
        </Stack>
      </Stack>
    </CardActionArea>
  </Card>
);
