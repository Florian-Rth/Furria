import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ALBUM_WORD, MENTION_CARD_LABELS } from '../rich-text-copy';
import type { MentionedAlbum } from '../schemas';
import { RichTextItemMention } from './RichTextItemMention';

const ALBUM_ROUTE = '/gallery/$albumId';

interface RichTextAlbumMentionProps {
  label: string;
  album: MentionedAlbum;
}

export const RichTextAlbumMention: FC<RichTextAlbumMentionProps> = ({ label, album }) => {
  const params = { albumId: String(album.albumId) };
  const action = (
    <KkInlineLink component={Link} to={ALBUM_ROUTE} params={params}>
      {MENTION_CARD_LABELS.albumCta}
    </KkInlineLink>
  );

  return <RichTextItemMention label={label} name={album.title} line={ALBUM_WORD} action={action} />;
};
