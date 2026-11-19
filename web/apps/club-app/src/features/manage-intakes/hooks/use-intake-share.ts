import { useKkNotice } from '@furria/ui/KkNotice';
import { COPIED_NOTICE, COPY_FAILED_NOTICE, INTAKE_EYEBROW, SHARE_TEXT } from '../intake-labels';
import { intakeUrlOf } from '../intake-link';

export interface IntakeShare {
  url: string;
  canShare: boolean;
  share: () => void;
}

const isShareable = (): boolean => typeof navigator.share === 'function';

const isCancelled = (error: Error): boolean => error.name === 'AbortError';

export const useIntakeShare = (token: string): IntakeShare => {
  const raiseNotice = useKkNotice();
  const url = intakeUrlOf(window.location.origin, token);

  const failCopy = (): void => {
    raiseNotice({ tone: 'error', message: COPY_FAILED_NOTICE });
  };

  const copy = (): void => {
    if (navigator.clipboard === undefined) {
      failCopy();
      return;
    }
    void navigator.clipboard
      .writeText(url)
      .then(() => raiseNotice({ tone: 'success', message: COPIED_NOTICE }), failCopy);
  };

  const share = (): void => {
    if (!isShareable()) {
      copy();
      return;
    }
    void navigator.share({ title: INTAKE_EYEBROW, text: SHARE_TEXT, url }).catch((error: Error) => {
      if (!isCancelled(error)) {
        copy();
      }
    });
  };

  return { url, canShare: isShareable(), share };
};
