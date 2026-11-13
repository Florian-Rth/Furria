import { KkHeading } from '@furria/ui/KkHeading';
import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ANNOUNCEMENT_ROUTE } from '../announcement-routes';

interface AnnouncementTitleLinkProps {
  announcementId: number;
  title: string;
}

export const AnnouncementTitleLink: FC<AnnouncementTitleLinkProps> = ({
  announcementId,
  title,
}) => {
  const params = { announcementId: String(announcementId) };

  return (
    <KkHeading level={4} component="h3">
      <KkInlineLink component={Link} to={ANNOUNCEMENT_ROUTE} params={params}>
        {title}
      </KkInlineLink>
    </KkHeading>
  );
};
