import { KkNote } from '@furria/ui/KkNote';
import { KkScreen } from '@furria/ui/KkScreen';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { BEER_TITLE, FORMER_NOTE } from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import { memberLabChoices } from '../beer-a-lab';
import { useBeerMemberA } from '../hooks/use-beer-member-a';
import type { BeerAMemberViewer } from '../schemas';
import { BeerABookRow } from './BeerABookRow';
import { BeerADeclaration } from './BeerADeclaration';
import { BeerAGivers } from './BeerAGivers';
import { BeerAHistory } from './BeerAHistory';
import { BeerALabSwitch } from './BeerALabSwitch';
import { BeerAPayRow } from './BeerAPayRow';
import { BeerATabHead } from './BeerATabHead';

interface BeerListAPageProps {
  viewer: BeerAMemberViewer;
  emptyStock: boolean;
  labValue: string;
  onLabChange: (choice: string) => void;
}

export const BeerListAPage: FC<BeerListAPageProps> = ({
  viewer,
  emptyStock,
  labValue,
  onLabChange,
}) => {
  const member = useBeerMemberA(viewer, emptyStock);
  const enrolled = member.standing === 'enrolled';
  const outsider = member.standing === 'outsider';
  const freshIds = member.undo.entry?.crateIds ?? [];
  const head = outsider ? null : <BeerATabHead member={member} discSize="medium" />;
  const pay =
    member.tab.openCount === 0 ? null : <BeerAPayRow pot={member.pot} owner={member.owner} />;
  const action = enrolled ? (
    <BeerABookRow member={member} />
  ) : outsider ? (
    <BeerADeclaration owner={nameOf(member.owner)} onConfirm={member.join} />
  ) : (
    <KkNote icon="info">{FORMER_NOTE}</KkNote>
  );
  const history =
    member.tab.crates.length === 0 ? null : (
      <BeerAHistory tab={member.tab} now={member.now} freshIds={freshIds} />
    );
  const givers = enrolled ? <BeerAGivers givers={member.givers} /> : null;

  return (
    <KkScreen kind="detail" title={BEER_TITLE} origin={LAB_ORIGIN}>
      <Grid container columnSpacing={4} rowSpacing={3} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 2, minWidth: 0 }}>
            {head}
            {pay}
            {action}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 3, minWidth: 0 }}>
            {history}
            {givers}
          </Stack>
        </Grid>
      </Grid>
      <BeerALabSwitch choices={memberLabChoices} value={labValue} onChange={onLabChange} />
    </KkScreen>
  );
};
