import type { MentionKind, RichTextBlock, RichTextInline, TextMention } from '@furria/ui/rich-text';
import {
  isMentionKind,
  isWebAddress,
  MENTION_KEY_ATTRIBUTE,
  MENTION_KINDS,
  mentionKeyOf,
  mentionTargetOf,
  readRichText,
  writeRichText,
} from '@furria/ui/rich-text';
import type { Mark, MarkType, Node as ProseNode } from 'prosemirror-model';
import { Fragment, Schema } from 'prosemirror-model';

const mentionAttrsOf = (dom: HTMLElement): TextMention | false => {
  const target = mentionTargetOf(dom.getAttribute(MENTION_KEY_ATTRIBUTE) ?? '', MENTION_KINDS);
  const label = dom.textContent?.trim() ?? '';
  return target === null || label.length === 0 ? false : { ...target, label };
};

const mentionKindOf = (value: string): MentionKind | null => (isMentionKind(value) ? value : null);

export const mentionLabelOf = (node: ProseNode): string => String(node.attrs.label);

export const mentionOf = (node: ProseNode): TextMention | null => {
  const kind = mentionKindOf(String(node.attrs.kind));
  return kind === null ? null : { kind, id: Number(node.attrs.id), label: mentionLabelOf(node) };
};

const mentionDomOf = (node: ProseNode): Record<string, string> => {
  const mention = mentionOf(node);
  return mention === null ? {} : { [MENTION_KEY_ATTRIBUTE]: mentionKeyOf(mention) };
};

const linkAttrsOf = (dom: HTMLElement): { href: string } | false => {
  const href = dom.getAttribute('href') ?? '';
  return isWebAddress(href) ? { href } : false;
};

export const richTextSchema = new Schema({
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
      parseDOM: [{ tag: `span[${MENTION_KEY_ATTRIBUTE}]`, getAttrs: mentionAttrsOf }],
      toDOM: (node) => ['span', mentionDomOf(node), mentionLabelOf(node)],
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

export const { nodes, marks } = richTextSchema;

export const isMentionNode = (node: ProseNode | null): boolean =>
  node !== null && node.type === nodes.mention;

const proseInlineOf = (inline: RichTextInline): ProseNode => {
  const strong = inline.bold ? [marks.strong.create()] : [];
  if (inline.kind === 'mention') {
    return nodes.mention.create(inline.mention, null, strong);
  }
  const link: Mark[] = inline.href === null ? [] : [marks.link.create({ href: inline.href })];
  return richTextSchema.text(inline.text, [...strong, ...link]);
};

const paragraphOf = (inlines: readonly RichTextInline[]): ProseNode =>
  nodes.paragraph.create(null, inlines.map(proseInlineOf));

const plainOf = (inlines: readonly RichTextInline[]): string =>
  inlines
    .map((inline) => (inline.kind === 'mention' ? inline.mention.label : inline.text))
    .join('');

const proseBlockOf = (block: RichTextBlock): ProseNode => {
  if (block.kind === 'heading') {
    const heading = plainOf(block.inlines);
    return nodes.heading.create(null, heading.length === 0 ? [] : [richTextSchema.text(heading)]);
  }
  if (block.kind === 'list') {
    return nodes.bullet_list.create(
      null,
      block.items.map((item) => nodes.list_item.create(null, paragraphOf(item))),
    );
  }
  return paragraphOf(block.inlines);
};

export const richTextDocOf = (text: string, kinds: readonly MentionKind[]): ProseNode => {
  const blocks = readRichText(text, kinds).map(proseBlockOf);
  return nodes.doc.create(null, blocks.length === 0 ? [nodes.paragraph.create()] : blocks);
};

const markOf = (node: ProseNode, type: MarkType): Mark | undefined =>
  node.marks.find((mark) => mark.type === type);

const richTextInlineOf = (node: ProseNode): RichTextInline => {
  const bold = markOf(node, marks.strong) !== undefined;
  const mention = isMentionNode(node) ? mentionOf(node) : null;
  if (mention !== null) {
    return { kind: 'mention', mention, bold };
  }
  if (isMentionNode(node)) {
    return { kind: 'text', text: mentionLabelOf(node), bold, href: null };
  }
  const link = markOf(node, marks.link);
  return {
    kind: 'text',
    text: node.text ?? '',
    bold,
    href: link === undefined ? null : String(link.attrs.href),
  };
};

const childrenOf = (node: ProseNode | null): ProseNode[] => {
  const children: ProseNode[] = [];
  node?.forEach((child) => {
    children.push(child);
  });
  return children;
};

const inlinesOf = (node: ProseNode | null): RichTextInline[] =>
  childrenOf(node).map(richTextInlineOf);

const richTextBlockOf = (node: ProseNode): RichTextBlock => {
  if (node.type === nodes.heading) {
    return { kind: 'heading', inlines: inlinesOf(node) };
  }
  if (node.type === nodes.bullet_list) {
    return { kind: 'list', items: childrenOf(node).map((item) => inlinesOf(item.firstChild)) };
  }
  return { kind: 'paragraph', inlines: inlinesOf(node) };
};

export const richTextOfDoc = (doc: ProseNode): string =>
  writeRichText(childrenOf(doc).map(richTextBlockOf));

export const richTextBlockTextOf = (block: ProseNode): string =>
  writeRichText([richTextBlockOf(block)]);

const isHostedMention = (node: ProseNode, kinds: readonly MentionKind[]): boolean => {
  const mention = mentionOf(node);
  return mention !== null && kinds.includes(mention.kind);
};

const literalOf = (node: ProseNode): ProseNode[] => {
  const label = mentionLabelOf(node);
  return label.length === 0 ? [] : [richTextSchema.text(label, node.marks)];
};

export const hostedFragmentOf = (fragment: Fragment, kinds: readonly MentionKind[]): Fragment => {
  const children: ProseNode[] = [];
  fragment.forEach((child) => {
    if (isMentionNode(child) && !isHostedMention(child, kinds)) {
      children.push(...literalOf(child));
    } else {
      children.push(child.isText ? child : child.copy(hostedFragmentOf(child.content, kinds)));
    }
  });
  return Fragment.from(children);
};
