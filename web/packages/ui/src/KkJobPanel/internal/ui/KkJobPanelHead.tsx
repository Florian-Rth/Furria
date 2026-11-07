import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkPillButton } from '../../../KkPillButton';

interface KkJobPanelHeadProps {
  title: string;
  closeText: string;
  onClose: () => void;
}

export const KkJobPanelHead: FC<KkJobPanelHeadProps> = ({ title, closeText, onClose }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
    <Typography variant="h4" component="h2" sx={{ flex: 1, minWidth: 0 }} noWrap>
      {title}
    </Typography>
    <KkPillButton text={closeText} glyph="close" onPress={onClose} />
  </Stack>
);
