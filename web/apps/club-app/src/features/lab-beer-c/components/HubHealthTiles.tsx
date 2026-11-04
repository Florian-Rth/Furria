import { KkLedgerGauge } from '@furria/ui/KkLedgerGauge';
import { KkLedgerTile } from '@furria/ui/KkLedgerTile';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { HubPane, HubTile } from '../hooks/use-ledger-hub';
import {
  emptyOnText,
  endedText,
  gaugeLabel,
  HEALTH_LABEL,
  NO_FORECAST,
  OVERDUE_NOTE,
  openPeopleText,
  TILE_OPEN,
  TILE_OVERDUE,
  TILE_RUNNING,
  TILE_STOCK,
  tileAria,
} from '../ledger-copy';
import { weekdayDayOf } from '../ledger-format';
import type { HubFilter, HubHealth } from '../ledger-hub';

interface HubHealthTilesProps {
  health: HubHealth;
  filter: HubFilter;
  pane: HubPane | null;
  onChoose: (tile: HubTile) => void;
}

const TILE_SIZE = { xs: 6, md: 3 } as const;

export const HubHealthTiles: FC<HubHealthTilesProps> = ({ health, filter, pane, onChoose }) => {
  const { forecast } = health;
  const stockNote =
    forecast.emptyOn === null ? NO_FORECAST : emptyOnText(weekdayDayOf(forecast.emptyOn));
  const stockTone = forecast.warns ? 'attention' : 'ink';
  const stockFigure = String(health.stock);
  const openFigure = euroOf(health.openCents);
  const overdueFigure = String(health.overdueCount);
  const runningFigure = String(health.runningCount);
  const overdueTone = health.overdueCount > 0 ? 'attention' : 'ink';
  const gaugeText = gaugeLabel(health.fillShare);
  const gauge = <KkLedgerGauge share={health.fillShare} warns={forecast.warns} label={gaugeText} />;
  const openNote = openPeopleText(health.openPeople);
  const runningNote = endedText(health.endedCount);
  const stockAria = tileAria(TILE_STOCK, stockFigure);
  const openAria = tileAria(TILE_OPEN, openFigure);
  const overdueAria = tileAria(TILE_OVERDUE, overdueFigure);
  const runningAria = tileAria(TILE_RUNNING, runningFigure);
  const stockOpen = pane?.kind === 'stock';
  const openChosen = filter === 'open';
  const overdueChosen = filter === 'overdue';
  const runningChosen = filter === 'running';
  const chooseStock = (): void => {
    onChoose('stock');
  };
  const chooseOpen = (): void => {
    onChoose('open');
  };
  const chooseOverdue = (): void => {
    onChoose('overdue');
  };
  const chooseRunning = (): void => {
    onChoose('running');
  };

  return (
    <Grid container spacing={1} component="section" aria-label={HEALTH_LABEL}>
      <Grid size={TILE_SIZE}>
        <KkLedgerTile
          icon="archive"
          label={TILE_STOCK}
          figure={stockFigure}
          figureTone={stockTone}
          note={stockNote}
          noteTone={stockTone}
          visual={gauge}
          ariaLabel={stockAria}
          selected={stockOpen}
          onSelect={chooseStock}
        />
      </Grid>
      <Grid size={TILE_SIZE}>
        <KkLedgerTile
          icon="fees"
          label={TILE_OPEN}
          figure={openFigure}
          note={openNote}
          ariaLabel={openAria}
          selected={openChosen}
          onSelect={chooseOpen}
        />
      </Grid>
      <Grid size={TILE_SIZE}>
        <KkLedgerTile
          icon="clock"
          label={TILE_OVERDUE}
          figure={overdueFigure}
          figureTone={overdueTone}
          note={OVERDUE_NOTE}
          ariaLabel={overdueAria}
          selected={overdueChosen}
          onSelect={chooseOverdue}
        />
      </Grid>
      <Grid size={TILE_SIZE}>
        <KkLedgerTile
          icon="members"
          label={TILE_RUNNING}
          figure={runningFigure}
          note={runningNote}
          ariaLabel={runningAria}
          selected={runningChosen}
          onSelect={chooseRunning}
        />
      </Grid>
    </Grid>
  );
};
