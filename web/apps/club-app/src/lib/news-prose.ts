import type { NewsBlock, NewsInline, NewsMention, NewsMentionKind } from '@furria/ui/news-text';
import { isWebAddress, readNewsText, writeNewsText } from '@furria/ui/news-text';
import type { Mark, MarkType, Node as ProseNode } from 'prosemirror-model';
import { Schema } from 'prosemirror-model';

const TEASER_WHITESPACE = /\s+/g;

export const newsMentionKeyOf = (kind: NewsMentionKind, id: number): string => `${kind}:${id}`;

const MENTION_KEY_PATTERN = /^(group|person):(\d+)$/;

const mentionAttrsOf = (dom: HTMLElement): NewsMention | false => {
  const match = MENTION_KEY_PATTERN.exec(dom.dataset.kkMentionId ?? '');
  const label = dom.textContent?.trim() ?? '';
  if (match === null || label.length === 0) {
    return false;
  }
  return { kind: match[1] === 'person' ? 'person' : 'group', id: Number(match[2]), label };
};

const linkAttrsOf = (dom: HTMLElement): { href: string } | false => {
  const href = dom.getAttribute('href') ?? '';
  return isWebAddress(href) ? { href } : false;
};

export const newsTextSchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    heading: {
      group: 'block',
      content: 'text*',
      marks: '',
      defining: true,
      parseDOM: [{ tag: 'h2' }, { tag: 'h3' }],
      toDOM: () => ['h2', 0],
    },
    bullet_list: {
      group: 'block',
      content: 'list_item+',
      parseDOM: [{ tag: 'ul' }],
      toDOM: () => ['ul', 0],
    },
    list_item: {
      content: 'paragraph',
      defining: true,
      parseDOM: [{ tag: 'li' }],
      toDOM: () => ['li', 0],
    },
    mention: {
      group: 'inline',
      inline: true,
      atom: true,
      selectable: true,
      attrs: { kind: { default: 'group' }, id: { default: 0 }, label: { default: '' } },
      parseDOM: [{ tag: 'span[data-kk-mention-id]', getAttrs: mentionAttrsOf }],
      toDOM: (node) => [
        'span',
        {
          'data-kk-mention': node.attrs.kind,
          'data-kk-mention-id': newsMentionKeyOf(node.attrs.kind, node.attrs.id),
        },
        node.attrs.label,
      ],
    },
    text: { group: 'inline' },
  },
  marks: {
    strong: {
      parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
      toDOM: () => ['strong', 0],
    },
    link: {
      attrs: { href: {} },
      inclusive: false,
      parseDOM: [{ tag: 'a[href]', getAttrs: linkAttrsOf }],
      toDOM: (mark) => [
        'a',
        {
          href: mark.attrs.href,
          'data-kk-link': '',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        0,
      ],
    },
  },
});

export const newsTeaserSchema = new Schema({
  nodes: {
    doc: { content: 'paragraph' },
    paragraph: { content: 'text*', toDOM: () => ['p', 0] },
    text: {},
  },
});

const { nodes, marks } = newsTextSchema;

const proseInlineOf = (inline: NewsInline): ProseNode => {
  const strong = inline.bold ? [marks.strong.create()] : [];
  if (inline.kind === 'mention') {
    return nodes.mention.create(inline.mention, null, strong);
  }
  const link: Mark[] = inline.href === null ? [] : [marks.link.create({ href: inline.href })];
  return newsTextSchema.text(inline.text, [...strong, ...link]);
};

const paragraphOf = (inlines: readonly NewsInline[]): ProseNode =>
  nodes.paragraph.create(null, inlines.map(proseInlineOf));

const plainOf = (inlines: readonly NewsInline[]): string =>
  inlines
    .map((inline) => (inline.kind === 'mention' ? inline.mention.label : inline.text))
    .join('');

const proseBlockOf = (block: NewsBlock): ProseNode => {
  if (block.kind === 'heading') {
    const heading = plainOf(block.inlines);
    return nodes.heading.create(null, heading.length === 0 ? [] : [newsTextSchema.text(heading)]);
  }
  if (block.kind === 'list') {
    return nodes.bullet_list.create(
      null,
      block.items.map((item) => nodes.list_item.create(null, paragraphOf(item))),
    );
  }
  return paragraphOf(block.inlines);
};

export const newsDocOf = (text: string): ProseNode => {
  const blocks = readNewsText(text).map(proseBlockOf);
  return nodes.doc.create(null, blocks.length === 0 ? [nodes.paragraph.create()] : blocks);
};

const mentionOf = (node: ProseNode): NewsMention => ({
  kind: node.attrs.kind === 'person' ? 'person' : 'group',
  id: Number(node.attrs.id),
  label: String(node.attrs.label),
});

const markOf = (node: ProseNode, type: MarkType): Mark | undefined =>
  node.marks.find((mark) => mark.type === type);

const newsInlineOf = (node: ProseNode): NewsInline => {
  const bold = markOf(node, marks.strong) !== undefined;
  if (node.type === nodes.mention) {
    return { kind: 'mention', mention: mentionOf(node), bold };
  }
  const link = markOf(node, marks.link);
  return {
    kind: 'text',
    text: node.text ?? '',
    bold,
    href: link === undefined ? null : String(link.attrs.href),
  };
};

const inlinesOf = (node: ProseNode | null): NewsInline[] => {
  const inlines: NewsInline[] = [];
  node?.forEach((child) => {
    inlines.push(newsInlineOf(child));
  });
  return inlines;
};

const childrenOf = (node: ProseNode): ProseNode[] => {
  const children: ProseNode[] = [];
  node.forEach((child) => {
    children.push(child);
  });
  return children;
};

const newsBlockOf = (node: ProseNode): NewsBlock => {
  if (node.type === nodes.heading) {
    return { kind: 'heading', inlines: inlinesOf(node) };
  }
  if (node.type === nodes.bullet_list) {
    return { kind: 'list', items: childrenOf(node).map((item) => inlinesOf(item.firstChild)) };
  }
  return { kind: 'paragraph', inlines: inlinesOf(node) };
};

export const newsTextOf = (doc: ProseNode): string =>
  writeNewsText(childrenOf(doc).map(newsBlockOf));

export const newsBlockTextOf = (block: ProseNode): string => writeNewsText([newsBlockOf(block)]);

export const teaserDocOf = (teaser: string): ProseNode =>
  newsTeaserSchema.nodes.doc.create(
    null,
    newsTeaserSchema.nodes.paragraph.create(
      null,
      teaser.length === 0 ? [] : [newsTeaserSchema.text(teaser)],
    ),
  );

export const teaserOf = (doc: ProseNode): string => doc.textContent.replace(TEASER_WHITESPACE, ' ');
