import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BOOK_AGAIN, DONE_TITLE } from '../beer-book-copy';
import type { BeerPayee } from '../beer-tab';
import { BeerPayRow } from './BeerPayRow';

interface BeerBookDoneNoteProps {
  line: string;
  payees: readonly BeerPayee[];
  onAgain: () => void;
}

export const BeerBookDoneNote: FC<BeerBookDoneNoteProps> = ({ line, payees, onAgain }) => {
  const payRows = payees.map((payee) => <BeerPayRow key={payee.potId} payee={payee} />);

  return (
    <Stack sx={{ gap: 1.5, alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
      <KkHeading level={1} component="p">
        {DONE_TITLE}
      </KkHeading>
      <KkText tone="secondary">{line}</KkText>
      <Stack sx={{ alignSelf: 'stretch', gap: 1, minWidth: 0, textAlign: 'start' }}>
        {payRows}
      </Stack>
      <KkButton variant="outlined" size="large" fullWidth onClick={onAgain}>
        {BOOK_AGAIN}
      </KkButton>
    </Stack>
  );
};
