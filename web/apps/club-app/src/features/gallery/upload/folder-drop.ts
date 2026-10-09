import { isHidden } from './upload-queue';

const isDirectory = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry =>
  entry.isDirectory;

const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry => entry.isFile;

const fileOf = (entry: FileSystemFileEntry): Promise<File> =>
  new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });

const batchOf = (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> =>
  new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });

const childrenOf = async (directory: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> => {
  const reader = directory.createReader();
  const children: FileSystemEntry[] = [];
  let batch = await batchOf(reader);
  while (batch.length > 0) {
    children.push(...batch);
    batch = await batchOf(reader);
  }
  return children;
};

const filesUnder = async (entry: FileSystemEntry): Promise<File[]> => {
  if (isHidden(entry.name)) {
    return [];
  }
  if (isFileEntry(entry)) {
    return [await fileOf(entry)];
  }
  if (isDirectory(entry)) {
    const nested = await Promise.all((await childrenOf(entry)).map(filesUnder));
    return nested.flat();
  }
  return [];
};

export const filesOfDrop = async (transfer: DataTransfer): Promise<File[]> => {
  const entries = Array.from(transfer.items).flatMap((item) => {
    const entry = item.kind === 'file' ? item.webkitGetAsEntry() : null;
    return entry === null ? [] : [entry];
  });
  if (entries.length === 0) {
    return Array.from(transfer.files);
  }
  const nested = await Promise.all(entries.map(filesUnder));
  return nested.flat();
};

export const filesOfPick = (list: FileList | null): File[] =>
  list === null ? [] : Array.from(list).filter((file) => !isHidden(file.name));
