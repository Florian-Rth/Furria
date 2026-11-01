export interface DownloadSink {
  write: (chunk: Uint8Array<ArrayBuffer>) => Promise<void>;
  finish: (fileName: string, type: string) => Promise<File>;
  discard: () => Promise<void>;
}

const SPOOL_DIRECTORY = 'downloads';

const spoolDirectory = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (navigator.storage?.getDirectory === undefined) {
    return null;
  }
  try {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(SPOOL_DIRECTORY, { create: true });
  } catch {
    return null;
  }
};

const removeQuietly = async (
  directory: FileSystemDirectoryHandle,
  entryName: string,
): Promise<void> => {
  try {
    await directory.removeEntry(entryName);
  } catch {
    return;
  }
};

const sweepSpool = async (directory: FileSystemDirectoryHandle): Promise<void> => {
  const names: string[] = [];
  for await (const name of directory.keys()) {
    names.push(name);
  }
  await Promise.all(names.map((name) => removeQuietly(directory, name)));
};

const memorySink = (): DownloadSink => {
  let chunks: Uint8Array<ArrayBuffer>[] = [];
  return {
    write: (chunk) => {
      chunks.push(chunk);
      return Promise.resolve();
    },
    finish: (fileName, type) => {
      const file = new File(chunks, fileName, { type });
      chunks = [];
      return Promise.resolve(file);
    },
    discard: () => {
      chunks = [];
      return Promise.resolve();
    },
  };
};

const diskSink = (
  directory: FileSystemDirectoryHandle,
  entryName: string,
  handle: FileSystemFileHandle,
  writable: FileSystemWritableFileStream,
): DownloadSink => {
  let open = true;
  return {
    write: (chunk) => writable.write(chunk),
    finish: async (fileName, type) => {
      await writable.close();
      open = false;
      const stored = await handle.getFile();
      return new File([stored], fileName, { type });
    },
    discard: async () => {
      if (open) {
        open = false;
        await writable.abort().catch(() => undefined);
      }
      await removeQuietly(directory, entryName);
    },
  };
};

const canWriteToDisk = (handle: FileSystemFileHandle): boolean =>
  typeof handle.createWritable === 'function';

export const openDownloadSink = async (key: number): Promise<DownloadSink> => {
  const directory = await spoolDirectory();
  if (directory === null) {
    return memorySink();
  }
  try {
    await sweepSpool(directory);
    const entryName = `${key}-${Date.now()}`;
    const handle = await directory.getFileHandle(entryName, { create: true });
    if (!canWriteToDisk(handle)) {
      await removeQuietly(directory, entryName);
      return memorySink();
    }
    const writable = await handle.createWritable();
    return diskSink(directory, entryName, handle, writable);
  } catch {
    return memorySink();
  }
};
