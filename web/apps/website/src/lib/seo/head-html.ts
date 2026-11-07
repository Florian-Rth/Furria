import type { RouteHead } from './route-head';

export const PAGE_HEAD_ATTRIBUTE = 'data-page-head';

type MetaTag = NonNullable<RouteHead['meta'][number]>;
type LinkTag = NonNullable<NonNullable<RouteHead['links']>[number]>;
type ScriptTag = NonNullable<NonNullable<RouteHead['scripts']>[number]>;
type HeadTagAttributes = MetaTag | LinkTag | ScriptTag;

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const SPECIAL_HTML_CHARACTERS = /[&<>"]/g;
const SCRIPT_CLOSE_RISK = /</g;

const escapeHtml = (text: string): string =>
  text.replace(SPECIAL_HTML_CHARACTERS, (character) => HTML_ESCAPES[character] ?? character);

const renderAttributes = (attributes: HeadTagAttributes): string =>
  Object.entries(attributes)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
    .join('');

const renderMeta = (meta: MetaTag): string => {
  const { title, ...attributes } = meta;

  return typeof title === 'string'
    ? `<title ${PAGE_HEAD_ATTRIBUTE}>${escapeHtml(title)}</title>`
    : `<meta ${PAGE_HEAD_ATTRIBUTE}${renderAttributes(attributes)}>`;
};

const renderLink = (link: LinkTag): string =>
  `<link ${PAGE_HEAD_ATTRIBUTE}${renderAttributes(link)}>`;

const renderScript = (script: ScriptTag): string => {
  const { children, ...attributes } = script;
  const body = typeof children === 'string' ? children.replace(SCRIPT_CLOSE_RISK, '\\u003c') : '';

  return `<script ${PAGE_HEAD_ATTRIBUTE}${renderAttributes(attributes)}>${body}</script>`;
};

const presentTags = <TTag>(tags: readonly (TTag | undefined)[] | undefined): TTag[] =>
  (tags ?? []).filter((tag): tag is TTag => tag !== undefined);

export const renderHeadHtml = (head: RouteHead): string =>
  [
    ...presentTags(head.meta).map(renderMeta),
    ...presentTags(head.links).map(renderLink),
    ...presentTags(head.scripts).map(renderScript),
  ].join('\n    ');
