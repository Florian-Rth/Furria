import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { startUpload } from '@/lib/media/start-upload';
import type { UploadFailure } from '@/lib/media/upload-failure';
import type { SongMutations } from '../api';
import { songNameOf } from '../studio-copy';

export interface SongUpload {
  key: string;
  name: string;
  share: number;
  failure: UploadFailure | null;
}

export interface SongUploads {
  rows: readonly SongUpload[];
  fileInput: (node: HTMLInputElement | null) => void;
  choose: () => void;
  onChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  dismiss: (key: string) => void;
}

export const useSongUploads = (actId: number, music: SongMutations): SongUploads => {
  const [rows, setRows] = useState<readonly SongUpload[]>([]);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const counter = useRef(0);

  const change = (key: string, patch: Partial<SongUpload>): void => {
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
      void music.add
        .mutateAsync(outcome.mediaItemId)
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
