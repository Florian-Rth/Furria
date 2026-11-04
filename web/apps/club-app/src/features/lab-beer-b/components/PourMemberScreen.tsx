import { KkPourStrip } from '@furria/ui/KkPourStrip';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { isReminderDue } from '@/features/lab-beer/beer-lab-ledger';
import { usePourMemberList } from '../hooks/use-pour-member-list';
import { fullNameOf, POUR_TITLE } from '../pour-copy';
import { PAY_LABEL, stripAmountOf, stripFactsOf } from '../pour-member-copy';
import type { PourViewer } from '../schemas';
import { POUR_VIEWERS } from '../schemas';
import { PourMemberBody } from './PourMemberBody';
import { PourMemberFoot } from './PourMemberFoot';
import { PourPayDrawer } from './PourPayDrawer';
import { PourViewerSwitch } from './PourViewerSwitch';

interface PourMemberScreenProps {
  viewer: PourViewer;
  onViewer: (id: string) => void;
}

export const PourMemberScreen: FC<PourMemberScreenProps> = ({ viewer, onViewer }) => {
  const list = usePourMemberList(viewer);
  const owner = fullNameOf(labBeerPersonOf(list.world.pot.ownerId));
  const ownerFirst = labBeerPersonOf(list.world.pot.ownerId)?.firstName ?? owner;
  const amount = stripAmountOf(list.member);
  const facts = stripFactsOf(list.member);
  const attention = isReminderDue(list.member.tab.oldestOpenAt, list.world.now);
  const action = amount === null ? null : { label: PAY_LABEL, onSelect: list.openPay };
  const tools = <KkPourStrip amount={amount} facts={facts} attention={attention} action={action} />;
  const foot =
    list.member.standing === 'enrolled' ? (
      <PourMemberFoot list={list} owner={ownerFirst} />
    ) : undefined;

  return (
    <KkScreen kind="working" title={POUR_TITLE} origin={LAB_ORIGIN} tools={tools} foot={foot}>
      <KkVisuallyHidden component="h1">{POUR_TITLE}</KkVisuallyHidden>
      <Stack sx={{ gap: 6, minWidth: 0 }}>
        <PourMemberBody list={list} owner={ownerFirst} />
        <PourViewerSwitch viewers={POUR_VIEWERS} value={viewer} onChange={onViewer} />
      </Stack>
      <PourPayDrawer
        open={list.payOpen}
        member={list.member}
        pot={list.world.pot}
        owner={owner}
        now={list.world.now}
        onClose={list.closePay}
      />
    </KkScreen>
  );
};
