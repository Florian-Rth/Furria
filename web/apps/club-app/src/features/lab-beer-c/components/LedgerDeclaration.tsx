import { KkButton } from '@furria/ui/KkButton';
import { KkCheckboxRow } from '@furria/ui/KkCheckboxRow';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import {
  DECLARATION_CHECK,
  DECLARATION_CONFIRM,
  DECLARATION_TITLE,
  declarationText,
} from '../ledger-copy';

interface LedgerDeclarationProps {
  owner: string;
  onJoin: () => void;
}

export const LedgerDeclaration: FC<LedgerDeclarationProps> = ({ owner, onJoin }) => {
  const [agreed, setAgreed] = useState(false);
  const text = declarationText(owner);

  return (
    <Stack component="section" aria-label={DECLARATION_TITLE} sx={{ gap: 1.5, minWidth: 0 }}>
      <KkEyebrow>{DECLARATION_TITLE}</KkEyebrow>
      <KkText variant="body2">{text}</KkText>
      <KkCheckboxRow label={DECLARATION_CHECK} checked={agreed} onChange={setAgreed} />
      <KkButton variant="contained" fullWidth disabled={!agreed} onClick={onJoin}>
        {DECLARATION_CONFIRM}
      </KkButton>
    </Stack>
  );
};
