import { KkCard, KkPhotoPlaceholder } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { GroupProfile } from '@/features/club/groups-content';

interface GruppenTileProps {
  group: GroupProfile;
  tint: string;
  badge: string;
  onOpen: () => void;
}

export const GruppenTile: FC<GruppenTileProps> = ({ group, tint, badge, onOpen }) => (
  <KkCard>
    <KkCard.Action onClick={onOpen} aria-label={`${group.title} — mehr erfahren`}>
      <KkCard.Media>
        <KkPhotoPlaceholder label="gruppen-foto" tint={tint} fill />
        <KkCard.Badge>{badge}</KkCard.Badge>
      </KkCard.Media>
      <KkCard.Body>
        <KkCard.Title>{group.title}</KkCard.Title>
        <KkCard.Text>{group.blurb}</KkCard.Text>
        <KkCard.Footer>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            {group.memberMeta}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.04em', color: 'primary.main' }}
          >
            Mehr →
          </Typography>
        </KkCard.Footer>
      </KkCard.Body>
    </KkCard.Action>
  </KkCard>
);
