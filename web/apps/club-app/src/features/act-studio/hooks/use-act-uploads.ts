import type { UploadFailure } from '@furria/api-client/upload-failure';
import { songNameOf } from '@furria/studio/studio-copy';
import type { StudioFileInput } from '@furria/studio/studio-uploads';
import { useRef, useState } from 'react';
import { startUpload } from '@/lib/media/start-upload';

export interface ActUpload {
  key: string;
  name: string;
  share: number;
  failure: UploadFailure | null;
}

export interface ActUploads extends StudioFileInput {
  rows: readonly ActUpload[];
  choose: () => void;
  dismiss: (key: string) => void;
}

export const useActUploads = <TAdded>(
  actId: number,
  add: (mediaItemId: number) => Promise<TAdded>,
): ActUploads => {
  const [rows, setRows] = useState<readonly ActUpload[]>([]);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const counter = useRef(0);

  const change = (key: string, patch: Partial<ActUpload>): void => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };
  const drop = (key: string): void => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const send = (file: File): void => {
    counter.current += 1;
    const key = `${Date.now()}-${counter.current}`;
    const handle = startUpload({ file, owner: { kind: 'act', id: actId } });

    setRows((current) => [
      ...current,
      { key, name: songNameOf(file.name), share: 0, failure: null },
    ]);
    handle.progress((progress) => {
      change(key, { share: progress.share });
    });
    void handle.done.then((outcome) => {
      if (outcome.kind === 'failed') {
        change(key, { failure: outcome.failure });
        return;
      }
      if (outcome.kind === 'stopped' || outcome.mediaItemId === null) {
        drop(key);
        return;
      }
      void add(outcome.mediaItemId)
        .catch(() => undefined)
        .finally(() => {
          drop(key);
        });
    });
  };

  return {
    rows,
    fileInput: setInput,
    choose: () => {
      input?.click();
    },
    onChosen: (event) => {
      const files = [...(event.target.files ?? [])];
      event.target.value = '';
      for (const file of files) {
        send(file);
      }
    },
    dismiss: drop,
  };
};
