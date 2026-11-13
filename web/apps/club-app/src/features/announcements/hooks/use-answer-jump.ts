import { toAnswerAnchorId } from '../announcement-bulletin';

export const useAnswerJump = (announcementId: number): ((key: string) => void) => {
  return (key: string): void => {
    document
      .getElementById(toAnswerAnchorId(announcementId, key))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
};
