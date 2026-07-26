import { ReadEntryIdsSchema } from './schemas';

const STORAGE_KEY = 'furria.changelog.read';

type ReadEntryIdsReader = Pick<Storage, 'getItem'>;
type ReadEntryIdsWriter = Pick<Storage, 'setItem'>;

export const readReadEntryIds = (storage: ReadEntryIdsReader): string[] => {
  try {
    const stored = storage.getItem(STORAGE_KEY);

    if (stored === null) {
      return [];
    }

    const entryIds = ReadEntryIdsSchema.safeParse(JSON.parse(stored));

    return entryIds.success ? entryIds.data : [];
  } catch {
    return [];
  }
};

export const writeReadEntryIds = (storage: ReadEntryIdsWriter, entryIds: string[]): void => {
  storage.setItem(STORAGE_KEY, JSON.stringify(entryIds));
};
