import { KkTabDisc } from '@furria/ui/KkTabDisc';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import { KkTabStage } from '@furria/ui/KkTabStage';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { discLabel, NOTHING_OPEN, OPEN_LABEL, potLine } from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import { memberLabChoices } from '../beer-a-lab';
import { useBeerMemberA } from '../hooks/use-beer-member-a';
import type { BeerAMemberViewer } from '../schemas';
import { BeerADeclaration } from './BeerADeclaration';
import { BeerALabSwitch } from './BeerALabSwitch';
import { BeerBookAFoot } from './BeerBookAFoot';

interface BeerBookAPageProps {
  viewer: BeerAMemberViewer;
  emptyStock: boolean;
  labValue: string;
  onLabChange: (choice: string) => void;
}

export const BeerBookAPage: FC<BeerBookAPageProps> = ({
  viewer,
  emptyStock,
  labValue,
  onLabChange,
}) => {
  const member = useBeerMemberA(viewer, emptyStock);
  const { tab } = member;
  const settled = tab.openCount === 0;
  const declaring = member.bookingState === 'declare';
  const disc = (
    <KkTabDisc
      strokes={member.strokes}
      label={discLabel(tab.openCount, tab.paidCount)}
      size="large"
      drawKey={member.drawKey}
      burstKey={member.drawKey}
    />
  );
  const middle = declaring ? (
    <BeerADeclaration owner={nameOf(member.owner)} size="large" onConfirm={member.join} />
  ) : (
    disc
  );
  const figure =
    tab.crates.length === 0 ? null : (
      <KkTabFigure
        label={OPEN_LABEL}
        value={settled ? NOTHING_OPEN : euroOf(tab.openCents)}
        settled={settled}
        size="small"
        sx={{ alignItems: 'flex-end' }}
      />
    );
  const foot = declaring ? null : <BeerBookAFoot member={member} />;

  return (
    <>
      <KkTabStage>
        <KkTabStage.Top>
          <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
            <KkText variant="caption" tone="secondary">
              {potLine(nameOf(member.owner))}
            </KkText>
            <KkText variant="subtitle2">{nameOf(member.me)}</KkText>
          </Stack>
          {figure}
        </KkTabStage.Top>
        <KkTabStage.Middle>{middle}</KkTabStage.Middle>
        <KkTabStage.Foot>{foot}</KkTabStage.Foot>
      </KkTabStage>
      <Stack sx={{ px: 2, pb: 4 }}>
        <BeerALabSwitch choices={memberLabChoices} value={labValue} onChange={onLabChange} />
      </Stack>
    </>
  );
};
