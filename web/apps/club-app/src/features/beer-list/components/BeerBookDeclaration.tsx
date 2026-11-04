import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DECLARE_CONFIRM, DECLARE_TITLE, declareText } from '../beer-book-copy';
import type { BeerBookJoin } from '../hooks/use-beer-book-page';

interface BeerBookDeclarationProps {
  joining: BeerBookJoin;
}

export const BeerBookDeclaration: FC<BeerBookDeclarationProps> = ({ joining }) => {
  const text = declareText(joining.owner);
  const failure =
    joining.failure === null ? null : <KkAlert severity="warning">{joining.failure}</KkAlert>;

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkHeading level={3} component="h1">
          {DECLARE_TITLE}
        </KkHeading>
        <KkText variant="body2">{text}</KkText>
        {failure}
        <KkButton size="large" fullWidth loading={joining.isJoining} onClick={joining.join}>
          {DECLARE_CONFIRM}
        </KkButton>
      </Stack>
    </KkPanel>
  );
};
