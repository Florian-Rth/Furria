import { useKkNotice } from '@furria/ui/KkNotice';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { COPIED_NOTICE, COPY_FAILED_NOTICE, shareTextOf } from '../upload-link-copy';
import { shareOriginOf, shareUrlOf } from '../upload-link-view';

export interface SharedLink {
  title: string;
  token: string;
}

export interface LinkShare {
  canShare: boolean;
  share: (link: SharedLink) => void;
  copy: (link: SharedLink) => void;
}

const urlOf = (link: SharedLink): string =>
  shareUrlOf(shareOriginOf(readApiBaseUrl(), window.location.origin), link.token);

const isShareable = (): boolean => typeof navigator.share === 'function';

export const useLinkShare = (): LinkShare => {
  const raiseNotice = useKkNotice();

  const copy = (link: SharedLink): void => {
    void navigator.clipboard.writeText(urlOf(link)).then(
      () => raiseNotice({ tone: 'success', message: COPIED_NOTICE }),
      () => raiseNotice({ tone: 'error', message: COPY_FAILED_NOTICE }),
    );
  };

  const share = (link: SharedLink): void => {
    if (!isShareable()) {
      copy(link);
      return;
    }
    void navigator
      .share({ title: link.title, text: shareTextOf(link.title), url: urlOf(link) })
      .catch(() => undefined);
  };

  return { canShare: isShareable(), share, copy };
};
