import { KkPollBallotChoices } from './internal/layout/KkPollBallotChoices';
import { KkPollBallotRoot } from './internal/layout/KkPollBallotRoot';
import { KkPollBallotChoice } from './internal/ui/KkPollBallotChoice';
import { KkPollBallotHead } from './internal/ui/KkPollBallotHead';
import { KkPollBallotOutcome } from './internal/ui/KkPollBallotOutcome';

export type { KkPollBallotMode } from './internal/poll-ballot-mode';
export type { KkPollBallotHeading } from './internal/ui/KkPollBallotHead';

export const KkPollBallot = Object.assign(KkPollBallotRoot, {
  Head: KkPollBallotHead,
  Outcome: KkPollBallotOutcome,
  Choices: KkPollBallotChoices,
  Choice: KkPollBallotChoice,
});
