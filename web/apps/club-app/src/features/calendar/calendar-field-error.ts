export interface CalendarFieldError {
  hasError: boolean;
  text: string | undefined;
}

export const toFieldError = (message: string | undefined): CalendarFieldError => ({
  hasError: message !== undefined,
  text: message,
});
