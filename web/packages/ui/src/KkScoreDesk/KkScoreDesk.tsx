import { KkScoreDeskEvenings } from './internal/layout/KkScoreDeskEvenings';
import { KkScoreDeskHead } from './internal/layout/KkScoreDeskHead';
import { KkScoreDeskIntro } from './internal/layout/KkScoreDeskIntro';
import { KkScoreDeskList } from './internal/layout/KkScoreDeskList';
import { KkScoreDeskPane } from './internal/layout/KkScoreDeskPane';
import { KkScoreDeskRoot } from './internal/layout/KkScoreDeskRoot';
import { KkScoreDeskScore } from './internal/layout/KkScoreDeskScore';

export { useKkScoreWide } from './internal/logic/use-kk-score-wide';

export const KkScoreDesk = Object.assign(KkScoreDeskRoot, {
  Intro: KkScoreDeskIntro,
  Head: KkScoreDeskHead,
  Score: KkScoreDeskScore,
  List: KkScoreDeskList,
  Pane: KkScoreDeskPane,
  Evenings: KkScoreDeskEvenings,
});
