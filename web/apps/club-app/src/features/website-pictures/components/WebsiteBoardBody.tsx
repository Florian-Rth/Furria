import { KkExposureSweep, KkFilmEdge, KkNote, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WebsiteBoardState } from '../hooks/use-website-board';
import type { WebsiteBoard } from '../website-board';
import { DESK_EMPTY, LIVE_NOTE, summaryLineOf } from '../website-copy';
import { WebsiteDeskHost } from './WebsiteDeskHost';
import { WebsiteOrphanSection } from './WebsiteOrphanSection';
import { WebsitePageSection } from './WebsitePageSection';

const { shell } = kkTokens;
const PANE_TOP = shell.gutter * 2 + shell.barHeight + shell.chromeGap;

interface WebsiteBoardBodyProps {
  board: WebsiteBoard;
  state: WebsiteBoardState;
}

export const WebsiteBoardBody: FC<WebsiteBoardBodyProps> = ({ board, state }) => {
  const { selected } = state;
  const at = selected === null ? null : { slot: selected.slot, position: selected.position };
  const summary = summaryLineOf(board.summary);
  const sections = board.pages.map((page) => (
    <WebsitePageSection key={page.key} page={page} selected={at} onSelect={state.select} />
  ));
  const desk =
    selected === null ? null : (
      <WebsiteDeskHost
        key={`${selected.slot}:${selected.position}`}
        position={selected}
        copySources={state.copySources}
        transferTargets={state.transferTargets}
        isWide={state.isWide}
        announce={state.announce}
        onMoved={state.select}
      />
    );
  const list = (
    <KkExposureSweep scope="viewport">
      <Stack sx={{ rowGap: 3, pb: 4, minWidth: 0 }}>
        <Stack sx={{ rowGap: 0.5 }}>
          <KkFilmEdge lead={summary} size="line" level="p" />
          <KkNote tone="muted">{LIVE_NOTE}</KkNote>
        </Stack>
        {sections}
        <WebsiteOrphanSection orphans={board.orphans} selected={at} onSelect={state.select} />
      </Stack>
    </KkExposureSweep>
  );

  if (!state.isWide) {
    return (
      <>
        {list}
        {desk}
      </>
    );
  }

  const pane = desk ?? <KkNote tone="muted">{DESK_EMPTY}</KkNote>;

  return (
    <Grid container spacing={3}>
      <Grid size={7}>{list}</Grid>
      <Grid size={5}>
        <Box sx={{ position: 'sticky', top: PANE_TOP }}>{pane}</Box>
      </Grid>
    </Grid>
  );
};
