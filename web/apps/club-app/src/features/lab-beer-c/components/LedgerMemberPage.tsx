import { KkScreen } from '@furria/ui/KkScreen';
import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_BEER_VIEWERS } from '@/features/lab-beer/beer-lab-fixture';
import { useLedgerMember } from '../hooks/use-ledger-member';
import { emptyLabStock } from '../lab-stock';
import { LAB_ORIGIN, LEDGER_TITLE, VIEW_GIVERS, VIEW_LABEL, VIEW_STATEMENT } from '../ledger-copy';
import type { LedgerViewer } from '../schemas';
import { LabViewerSwitch } from './LabViewerSwitch';
import { LedgerBookFoot } from './LedgerBookFoot';
import { LedgerDeclaration } from './LedgerDeclaration';
import { LedgerFormerLine } from './LedgerFormerLine';
import { LedgerGivers } from './LedgerGivers';
import { LedgerHeadBlock } from './LedgerHeadBlock';
import { LedgerPayInfo } from './LedgerPayInfo';
import { LedgerStatement } from './LedgerStatement';

const MEMBER_PATH = '/lab/beer-list-c';
const SUMMARY_SIZE = { xs: 12, lg: 5 } as const;
const STATEMENT_SIZE = { xs: 12, lg: 7 } as const;

const VIEWS: readonly KkSegmentSwitchItem[] = [
  { id: 'statement', label: VIEW_STATEMENT, icon: 'list', count: null, countLabel: '' },
  { id: 'givers', label: VIEW_GIVERS, icon: 'members', count: null, countLabel: '' },
];

interface LedgerMemberPageProps {
  viewer: LedgerViewer;
}

export const LedgerMemberPage: FC<LedgerMemberPageProps> = ({ viewer }) => {
  const member = useLedgerMember(viewer);
  const { booking, beer } = member;
  const enrolled = booking.stance === 'book' || booking.stance === 'empty';
  const ownerName =
    member.owner === null ? '' : `${member.owner.firstName} ${member.owner.lastName}`;
  const emptyStock = (): void => {
    emptyLabStock(beer, LAB_BEER_VIEWERS.owner);
  };
  const switcher = enrolled ? (
    <KkSegmentSwitch
      label={VIEW_LABEL}
      items={VIEWS}
      value={member.view}
      onChange={member.chooseView}
    />
  ) : null;
  const body =
    enrolled && member.view === 'givers' ? (
      <LedgerGivers givers={member.givers} />
    ) : (
      <LedgerStatement months={member.months} freshIds={booking.freshIds} />
    );
  const showsTab = booking.stance !== 'declare' || booking.tab.crates.length > 0;
  const declaration =
    booking.stance === 'declare' || member.declaring ? (
      <LedgerDeclaration owner={ownerName} onJoin={member.join} />
    ) : null;
  const former =
    booking.stance === 'former' && !member.declaring && member.enrollment !== null ? (
      <LedgerFormerLine enrollment={member.enrollment} onRejoin={member.openDeclaration} />
    ) : null;
  const tab = showsTab ? (
    <Grid container columnSpacing={3} rowSpacing={2} sx={{ alignItems: 'flex-start' }}>
      <Grid size={SUMMARY_SIZE}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <LedgerHeadBlock
            head={member.head}
            open={booking.open}
            price={booking.price}
            spin={booking.spin}
            stamp={booking.stamp}
            fireKey={member.fireKey}
          />
          {former}
          <LedgerPayInfo pot={beer.world.pot} owner={member.owner} copy={member.copy} />
        </Stack>
      </Grid>
      <Grid size={STATEMENT_SIZE}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          {switcher}
          {body}
        </Stack>
      </Grid>
    </Grid>
  ) : null;
  const foot = enrolled ? <LedgerBookFoot booking={booking} onBook={member.book} /> : undefined;

  return (
    <KkScreen kind="working" title={LEDGER_TITLE} origin={LAB_ORIGIN} foot={foot}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        {declaration}
        {tab}
        <LabViewerSwitch path={MEMBER_PATH} viewer={viewer} onEmptyStock={emptyStock} />
      </Stack>
    </KkScreen>
  );
};
