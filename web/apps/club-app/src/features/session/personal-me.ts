import type { Me, PersonalMe } from '@/lib/api/schemas';

export const isPersonalMe = (me: Me): me is PersonalMe => me.person !== null;
