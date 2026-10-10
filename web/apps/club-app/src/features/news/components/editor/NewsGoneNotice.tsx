import { KkAlert, KkButton, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GONE_COPY, GONE_TEXT, GONE_TITLE } from '../../editor-copy';

interface NewsGoneNoticeProps {
  onCopy: () => void;
}

export const NewsGoneNotice: FC<NewsGoneNoticeProps> = ({ onCopy }) => (
  <KkAlert severity="error">
    <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
      <KkText variant="subtitle2">{GONE_TITLE}</KkText>
      <KkText variant="body2">{GONE_TEXT}</KkText>
      <KkButton variant="outlined" size="small" onClick={onCopy}>
        {GONE_COPY}
      </KkButton>
    </Stack>
  </KkAlert>
);
