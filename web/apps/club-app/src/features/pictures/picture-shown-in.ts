import type { QueryKey } from '@tanstack/react-query';
import { ANNOUNCEMENTS_QUERY_KEY } from '@/features/announcements';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MY_GROUPS_QUERY_KEY } from '@/features/group-hub';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { MANAGED_GROUPS_QUERY_KEY } from '@/features/manage-groups';
import { PERSONS_QUERY_KEY } from '@/features/manage-persons';
import { MEMBERS_QUERY_KEY } from '@/features/members';
import { NEWS_QUERY_KEY } from '@/features/news';
import { ME_QUERY_KEY } from '@/features/session';
import { START_QUERY_KEY } from '@/features/start';
import type { PictureKind } from './picture-target';

export const pictureShownIn = (kind: PictureKind): readonly QueryKey[] =>
  kind === 'portrait'
    ? [
        ME_QUERY_KEY,
        MEMBERS_QUERY_KEY,
        PERSONS_QUERY_KEY,
        GROUPS_QUERY_KEY,
        START_QUERY_KEY,
        CLUB_HUB_QUERY_KEY,
        ANNOUNCEMENTS_QUERY_KEY,
        NEWS_QUERY_KEY,
      ]
    : [
        GROUPS_QUERY_KEY,
        MY_GROUPS_QUERY_KEY,
        MANAGED_GROUPS_QUERY_KEY,
        START_QUERY_KEY,
        CLUB_HUB_QUERY_KEY,
      ];
