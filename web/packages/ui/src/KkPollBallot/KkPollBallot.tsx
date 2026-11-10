import { KkPollBallotChoices } from './internal/layout/KkPollBallotChoices';
import { KkPollBallotRoot } from './internal/layout/KkPollBallotRoot';
import { KkPollBallotChoice } from './internal/ui/KkPollBallotChoice';
import { KkPollBallotHead } from './internal/ui/KkPollBallotHead';

export type { KkPollBallotMode } from './internal/poll-ballot-mode';
export type { KkPollBallotHeading } from './internal/ui/KkPollBallotHead';

export const KkPollBallot = Object.assign(KkPollBallotRoot, {
  Head: KkPollBallotHead,
  Choices: KkPollBallotChoices,
  Choice: KkPollBallotChoice,
});
