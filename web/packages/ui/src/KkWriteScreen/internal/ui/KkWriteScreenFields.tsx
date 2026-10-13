import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkAlert } from '../../../KkAlert';
import { kkTokens } from '../../../tokens';

const FIELDS_GAP = kkTokens.form.sectionGap;

interface KkWriteScreenFieldsProps extends PropsWithChildren {
  rejection?: string;
}

export const KkWriteScreenFields: FC<KkWriteScreenFieldsProps> = ({ rejection, children }) => {
  const rejectionAlert =
    rejection === undefined ? null : <KkAlert severity="error">{rejection}</KkAlert>;

  return (
    <Stack data-kk-write-screen-fields sx={{ minWidth: 0, gap: FIELDS_GAP }}>
      {rejectionAlert}
      {children}
    </Stack>
  );
};
