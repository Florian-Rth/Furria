import { KkStartTileCounters } from './internal/layout/KkStartTileCounters';
import { KkStartTileGroup } from './internal/layout/KkStartTileGroup';
import { KkStartTileRoot } from './internal/layout/KkStartTileRoot';
import { KkStartTileRows } from './internal/layout/KkStartTileRows';
import { KkStartTileAnswerToggle } from './internal/ui/KkStartTileAnswerToggle';
import { KkStartTileAuthor } from './internal/ui/KkStartTileAuthor';
import { KkStartTileCoin } from './internal/ui/KkStartTileCoin';
import { KkStartTileCounter } from './internal/ui/KkStartTileCounter';
import { KkStartTileCovers } from './internal/ui/KkStartTileCovers';
import { KkStartTileHead } from './internal/ui/KkStartTileHead';
import { KkStartTileJubilee } from './internal/ui/KkStartTileJubilee';
import { KkStartTileLead } from './internal/ui/KkStartTileLead';
import { KkStartTileLine } from './internal/ui/KkStartTileLine';
import { KkStartTileMark } from './internal/ui/KkStartTileMark';
import { KkStartTileRing } from './internal/ui/KkStartTileRing';
import { KkStartTileRow } from './internal/ui/KkStartTileRow';

export const KkStartTile = Object.assign(KkStartTileRoot, {
  Head: KkStartTileHead,
  Ring: KkStartTileRing,
  Lead: KkStartTileLead,
  Rows: KkStartTileRows,
  Row: KkStartTileRow,
  Mark: KkStartTileMark,
  AnswerToggle: KkStartTileAnswerToggle,
  Line: KkStartTileLine,
  Coin: KkStartTileCoin,
  Counters: KkStartTileCounters,
  Counter: KkStartTileCounter,
  Group: KkStartTileGroup,
  Author: KkStartTileAuthor,
  Jubilee: KkStartTileJubilee,
  Covers: KkStartTileCovers,
});
