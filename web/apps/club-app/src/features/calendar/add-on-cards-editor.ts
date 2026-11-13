import type { CalendarFieldError } from './calendar-field-error';
import type { PollFieldPath, PollOptionsPath } from './calendar-polls';
import type { SignUpListFieldPath } from './calendar-sign-up-lists';
import type { CalendarPollForm, CalendarSignUpListForm } from './schemas';

export type AddOnFieldPath = PollFieldPath | SignUpListFieldPath;

export interface AddOnCardsEditor {
  addOnErrorAt: (path: AddOnFieldPath) => CalendarFieldError;
  deadlineFallbackTime: () => string;
  updatePoll: (key: string, change: (poll: CalendarPollForm) => CalendarPollForm) => void;
  recheckPollField: (path: PollFieldPath) => void;
  forgetPollErrors: (path: PollOptionsPath) => void;
  updateSignUpList: (
    key: string,
    change: (list: CalendarSignUpListForm) => CalendarSignUpListForm,
  ) => void;
  recheckSignUpListField: (path: SignUpListFieldPath) => void;
}
