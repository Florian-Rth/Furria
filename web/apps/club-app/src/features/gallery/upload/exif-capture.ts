const JPEG_START = 0xffd8;
const APP1 = 0xffe1;
const START_OF_SCAN = 0xffda;
const MARKER_PREFIX = 0xff;
const EXIF_HEADER = 'Exif\0\0';
const EXIF_HEADER_LENGTH = 6;
const LITTLE_ENDIAN = 0x4949;
const TIFF_MAGIC = 42;
const ENTRY_SIZE = 12;
const ASCII = 2;
const STAMP_LENGTH = 19;

const TAG_DATE_TIME = 0x0132;
const TAG_EXIF_POINTER = 0x8769;
const TAG_DATE_TIME_ORIGINAL = 0x9003;
const TAG_DATE_TIME_DIGITIZED = 0x9004;

const STAMP_PATTERN = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

interface Tiff {
  view: DataView;
  start: number;
  little: boolean;
}

const inside = (view: DataView, offset: number, length: number): boolean =>
  offset >= 0 && offset + length <= view.byteLength;

const textAt = (view: DataView, offset: number, length: number): string =>
  Array.from({ length }, (_, index) => String.fromCharCode(view.getUint8(offset + index))).join('');

const tagsOf = (tiff: Tiff, ifdOffset: number): Map<number, number> => {
  const tags = new Map<number, number>();
  const at = tiff.start + ifdOffset;
  if (!inside(tiff.view, at, 2)) {
    return tags;
  }
  const count = tiff.view.getUint16(at, tiff.little);
  for (let index = 0; index < count; index += 1) {
    const entry = at + 2 + index * ENTRY_SIZE;
    if (!inside(tiff.view, entry, ENTRY_SIZE)) {
      break;
    }
    tags.set(tiff.view.getUint16(entry, tiff.little), entry);
  }
  return tags;
};

const stampOf = (tiff: Tiff, entry: number | undefined): string | null => {
  if (entry === undefined || tiff.view.getUint16(entry + 2, tiff.little) !== ASCII) {
    return null;
  }
  const valueOffset = tiff.start + tiff.view.getUint32(entry + 8, tiff.little);
  if (!inside(tiff.view, valueOffset, STAMP_LENGTH)) {
    return null;
  }
  const match = STAMP_PATTERN.exec(textAt(tiff.view, valueOffset, STAMP_LENGTH));
  if (match === null) {
    return null;
  }
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

const captureOfTiff = (tiff: Tiff): string | null => {
  if (!inside(tiff.view, tiff.start, 8)) {
    return null;
  }
  if (tiff.view.getUint16(tiff.start + 2, tiff.little) !== TIFF_MAGIC) {
    return null;
  }
  const primary = tagsOf(tiff, tiff.view.getUint32(tiff.start + 4, tiff.little));
  const pointer = primary.get(TAG_EXIF_POINTER);
  const exif =
    pointer === undefined
      ? new Map<number, number>()
      : tagsOf(tiff, tiff.view.getUint32(pointer + 8, tiff.little));
  return (
    stampOf(tiff, exif.get(TAG_DATE_TIME_ORIGINAL)) ??
    stampOf(tiff, exif.get(TAG_DATE_TIME_DIGITIZED)) ??
    stampOf(tiff, primary.get(TAG_DATE_TIME))
  );
};

const exifSegmentOf = (view: DataView): number | null => {
  let offset = 2;
  while (inside(view, offset, 4)) {
    const marker = view.getUint16(offset);
    if (marker >> 8 !== MARKER_PREFIX || marker === START_OF_SCAN) {
      return null;
    }
    const length = view.getUint16(offset + 2);
    const payload = offset + 4;
    if (
      marker === APP1 &&
      inside(view, payload, EXIF_HEADER_LENGTH) &&
      textAt(view, payload, EXIF_HEADER_LENGTH) === EXIF_HEADER
    ) {
      return payload + EXIF_HEADER_LENGTH;
    }
    offset += 2 + length;
  }
  return null;
};

export const captureTimeOf = (buffer: ArrayBuffer): string | null => {
  const view = new DataView(buffer);
  if (!inside(view, 0, 2) || view.getUint16(0) !== JPEG_START) {
    return null;
  }
  const start = exifSegmentOf(view);
  if (start === null || !inside(view, start, 2)) {
    return null;
  }
  return captureOfTiff({ view, start, little: view.getUint16(start) === LITTLE_ENDIAN });
};

const pad = (value: number): string => String(value).padStart(2, '0');

export const localStampOf = (milliseconds: number): string => {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
