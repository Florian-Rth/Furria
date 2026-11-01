import type { KkSystemNotice } from '@furria/ui/KkNotice';
import {
  DOWNLOAD_DISMISS_ACTION,
  DOWNLOAD_RETRY_ACTION,
  DOWNLOAD_SAVE_ACTION,
  DOWNLOAD_SAVE_AGAIN_ACTION,
  DOWNLOAD_STOP_ACTION,
  downloadFailedLine,
  downloadReadyLine,
  downloadRunningLine,
} from './download-copy';
import { closeDownload, retryDownload, saveDownload } from './download-store';
import { downloadFractionOf } from './media-download';
import { useDownload } from './use-download';

const NOTICE_ID = 'media-download';
const NOTICE_GROUP = 'media-download';

const dismissAction = { id: 'dismiss', label: DOWNLOAD_DISMISS_ACTION, onSelect: closeDownload };

export const useDownloadNotice = (): KkSystemNotice | null => {
  const job = useDownload();
  if (job === null) {
    return null;
  }
  const { kind, title } = job.request;
  const { expectedBytes } = job;
  const base = { id: `${NOTICE_ID}-${job.key}`, group: NOTICE_GROUP };

  switch (job.phase) {
    case 'running':
      return {
        ...base,
        tone: 'info',
        icon: 'download',
        message: downloadRunningLine(kind, title, job.receivedBytes, expectedBytes),
        progress: downloadFractionOf(job.receivedBytes, expectedBytes),
        actions: [{ id: 'stop', label: DOWNLOAD_STOP_ACTION, onSelect: closeDownload }],
      };
    case 'ready':
      return {
        ...base,
        tone: 'success',
        message: downloadReadyLine(kind, title, job.route, job.receivedBytes),
        actions: [
          {
            id: 'save',
            label: job.route === 'share' ? DOWNLOAD_SAVE_ACTION : DOWNLOAD_SAVE_AGAIN_ACTION,
            onSelect: saveDownload,
          },
          dismissAction,
        ],
      };
    case 'failed':
      return {
        ...base,
        tone: 'error',
        message: downloadFailedLine(kind, title, job.failure),
        actions: [
          { id: 'retry', label: DOWNLOAD_RETRY_ACTION, onSelect: retryDownload },
          dismissAction,
        ],
      };
  }
};
