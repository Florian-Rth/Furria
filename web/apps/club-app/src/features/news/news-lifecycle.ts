import type { PictureEditing } from '@/lib/api/schemas';
import type { NewsPostDetails, NewsPostState, NewsPostVersion } from './schemas';
import type {
  NewsFields,
  NewsPicture,
  NewsRequirement,
  NewsStage,
  NewsVersion,
  NewsVersionPart,
} from './types';

const NO_PICTURE_KEY = '';

export const EMPTY_FIELDS: NewsFields = {
  category: null,
  title: '',
  teaser: '',
  text: '',
  pictureCaption: '',
  eventId: null,
  albumId: null,
};

export const stageOf = (state: NewsPostState, hasPendingChanges: boolean): NewsStage => {
  if (state === 'draft') {
    return 'draft';
  }
  if (state === 'withdrawn') {
    return 'withdrawn';
  }
  return hasPendingChanges ? 'pending' : 'live';
};

export const workingWireOf = (post: NewsPostDetails): NewsPostVersion =>
  post.pendingChanges ?? post.content;

const addressOf = (url: string): string => {
  const [path = url, query = ''] = url.split('?');
  const version = new URLSearchParams(query).get('v');
  return version === null ? path : `${path}?v=${version}`;
};

export const pictureKeyOf = (editing: PictureEditing): string => {
  const url = editing.uncroppedUrl ?? editing.picture?.smallUrl ?? null;
  const crop = editing.crop === null ? '' : JSON.stringify(editing.crop);
  return url === null ? editing.state : `${addressOf(url)}|${crop}`;
};

export const pictureOf = (editing: PictureEditing | null): NewsPicture | null => {
  if (editing === null) {
    return null;
  }
  const ready = editing.state === 'ready' && editing.picture !== null;
  return {
    key: pictureKeyOf(editing),
    state: editing.state === 'failed' ? 'failed' : ready ? 'ready' : 'developing',
    progress: 1,
    uncroppedSource: editing.uncroppedUrl,
    source: editing.picture?.largeUrl ?? null,
    crop: editing.crop,
  };
};

export const fieldsOf = (wire: NewsPostVersion): NewsFields => ({
  category: wire.category,
  title: wire.title,
  teaser: wire.teaser,
  text: wire.text,
  pictureCaption: wire.pictureCaption ?? '',
  eventId: wire.event?.eventId ?? null,
  albumId: wire.album?.albumId ?? null,
});

export const versionOf = (wire: NewsPostVersion): NewsVersion => ({
  ...fieldsOf(wire),
  picture: pictureOf(wire.picture),
  event: wire.event,
  album: wire.album,
});

const isBlank = (value: string): boolean => value.trim().length === 0;

export const missingOf = (fields: NewsFields): NewsRequirement[] => {
  const checks: [NewsRequirement, boolean][] = [
    ['category', fields.category === null],
    ['title', isBlank(fields.title)],
    ['teaser', isBlank(fields.teaser)],
    ['text', isBlank(fields.text)],
  ];
  return checks.filter(([, missing]) => missing).map(([requirement]) => requirement);
};

export const textBlocksOf = (text: string): string[] =>
  text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

export const isChangedBlock = (blockText: string, liveBlocks: ReadonlySet<string>): boolean => {
  const block = blockText.trim();
  return block.length > 0 && !liveBlocks.has(block);
};

const pictureKeyIn = (version: NewsVersion): string => version.picture?.key ?? NO_PICTURE_KEY;

export const changedPartsOf = (live: NewsVersion, working: NewsVersion): NewsVersionPart[] => {
  const comparisons: [NewsVersionPart, boolean][] = [
    ['category', live.category !== working.category],
    ['title', live.title !== working.title],
    ['teaser', live.teaser !== working.teaser],
    ['picture', pictureKeyIn(live) !== pictureKeyIn(working)],
    ['caption', live.pictureCaption !== working.pictureCaption],
    ['text', live.text !== working.text],
    ['event', live.eventId !== working.eventId],
    ['album', live.albumId !== working.albumId],
  ];
  return comparisons.filter(([, changed]) => changed).map(([part]) => part);
};
