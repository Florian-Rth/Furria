import { KkWelcomeStageBill } from './internal/layout/KkWelcomeStageBill';
import { KkWelcomeStageFoot } from './internal/layout/KkWelcomeStageFoot';
import { KkWelcomeStageRoot } from './internal/layout/KkWelcomeStageRoot';
import { KkWelcomeStageTop } from './internal/layout/KkWelcomeStageTop';
import { KkWelcomeStageAction } from './internal/ui/KkWelcomeStageAction';
import { KkWelcomeStageCall } from './internal/ui/KkWelcomeStageCall';
import { KkWelcomeStageDateline } from './internal/ui/KkWelcomeStageDateline';
import { KkWelcomeStageLine } from './internal/ui/KkWelcomeStageLine';
import { KkWelcomeStageName } from './internal/ui/KkWelcomeStageName';
import { KkWelcomeStageSweep } from './internal/ui/KkWelcomeStageSweep';
import { KkWelcomeStageYear } from './internal/ui/KkWelcomeStageYear';

export const KkWelcomeStage = Object.assign(KkWelcomeStageRoot, {
  Top: KkWelcomeStageTop,
  Bill: KkWelcomeStageBill,
  Foot: KkWelcomeStageFoot,
  Dateline: KkWelcomeStageDateline,
  Year: KkWelcomeStageYear,
  Name: KkWelcomeStageName,
  Line: KkWelcomeStageLine,
  Sweep: KkWelcomeStageSweep,
  Call: KkWelcomeStageCall,
  Action: KkWelcomeStageAction,
});
