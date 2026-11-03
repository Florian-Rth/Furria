import { songNameOf } from '@furria/studio/studio-copy';
import type { StudioUpload, StudioUploadPort, StudioUploads } from '@furria/studio/studio-uploads';
import { useRef, useState } from 'react';

export const useStudioUploads = (port: StudioUploadPort): StudioUploads => {
  const [rows, setRows] = useState<readonly StudioUpload[]>([]);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const counter = useRef(0);

  const change = (key: string, patch: Partial<StudioUpload>): void => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };
  const drop = (key: string): void => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const send = (file: File): void => {
    counter.current += 1;
    const key = `${Date.now()}-${counter.current}`;
    const handle = port.start(file);

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
      void port
        .add(outcome.mediaItemId)
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
