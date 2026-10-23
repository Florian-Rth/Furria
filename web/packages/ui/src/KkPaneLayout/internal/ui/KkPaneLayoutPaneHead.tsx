import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';

interface KkPaneLayoutPaneHeadProps {
  title: string;
  meta?: ReactNode;
  tools?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
}

export const KkPaneLayoutPaneHead: FC<KkPaneLayoutPaneHeadProps> = ({
  title,
  meta,
  tools,
  closeLabel,
  onClose,
}) => {
  const close =
    onClose === undefined || closeLabel === undefined ? null : (
      <KkIconButton label={closeLabel} icon="close" size="small" onClick={onClose} />
    );
  const metaLine =
    meta === undefined || meta === null ? null : (
      <Box
        component="span"
        sx={{ typography: 'caption', fontWeight: 700, color: 'text.secondary' }}
      >
        {meta}
      </Box>
    );

  return (
    <Stack
      direction="row"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        bgcolor: 'background.paper',
        borderBottomWidth: kkTokens.line.hair,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
      }}
    >
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Box component="h2" sx={{ m: 0, typography: 'h4', color: 'text.primary' }}>
          {title}
        </Box>
        {metaLine}
      </Stack>
      {tools}
      {close}
    </Stack>
  );
};
