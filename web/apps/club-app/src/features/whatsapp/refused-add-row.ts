import { toInitials } from '@/lib/initials';
import type { WhatsAppRefusedAdd } from './schemas';
import { toRefusedAddMeta } from './whatsapp-copy';

export interface RefusedAddRow {
  initials: string;
  name: string;
  meta: string;
  params: { personId: string };
}

export const toRefusedAddRow = (add: WhatsAppRefusedAdd): RefusedAddRow => ({
  initials: toInitials(add.firstName, add.lastName),
  name: `${add.firstName} ${add.lastName}`,
  meta: toRefusedAddMeta(add.phone, add.refusedAt),
  params: { personId: String(add.personId) },
});
