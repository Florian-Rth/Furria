export interface LetterClearance {
  dividerTop: number;
  dividerHeight: number;
  barClearance: number;
}

export const hasPassedTheToolbar = ({
  dividerTop,
  dividerHeight,
  barClearance,
}: LetterClearance): boolean => dividerTop <= barClearance + dividerHeight;
