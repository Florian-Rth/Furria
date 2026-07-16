const STORAGE_KEY = 'furria.preview.granted';
const STORAGE_VALUE = 'granted';

type SessionReader = Pick<Storage, 'getItem'>;
type SessionWriter = Pick<Storage, 'setItem'>;

export const readGrantedFromSession = (storage: SessionReader): boolean =>
  storage.getItem(STORAGE_KEY) === STORAGE_VALUE;

export const writeGrantedToSession = (storage: SessionWriter): void => {
  storage.setItem(STORAGE_KEY, STORAGE_VALUE);
};
