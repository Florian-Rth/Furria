export interface AnsweringFacts {
  asksForResponse: boolean;
  mayAnswer: boolean;
}

export const canAnswer = (entry: AnsweringFacts): boolean =>
  entry.asksForResponse && entry.mayAnswer;
