const ANSWERED_KEY = 'furria.push-ask-answered';
const ANSWERED = 'yes';

export const readPushAskAnswered = (): boolean => {
  try {
    return window.localStorage.getItem(ANSWERED_KEY) === ANSWERED;
  } catch {
    return false;
  }
};

export const rememberPushAskAnswered = (): void => {
  try {
    window.localStorage.setItem(ANSWERED_KEY, ANSWERED);
  } catch {}
};
