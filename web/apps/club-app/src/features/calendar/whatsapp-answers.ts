import type { NamedPerson, NameEntry, NamesTab } from './calendar-names';
import { toPersonEntry } from './calendar-names';
import type { WhatsAppSender } from './schemas';

const UNASSIGNED_TAB_ID = 'unassigned';

export interface UnassignedCopy {
  label: string;
  unknownSender: string;
}

interface LabelledOption {
  optionId: number;
  label: string;
}

export const toSenderName = (sender: WhatsAppSender, unknownSender: string): string =>
  sender.whatsAppName ?? sender.phone ?? unknownSender;

export const toUnassignedTab = <TSender extends WhatsAppSender>(
  unassigned: readonly TSender[] | null,
  toNote: (sender: TSender) => string,
  copy: UnassignedCopy,
): NamesTab | null =>
  unassigned === null || unassigned.length === 0
    ? null
    : {
        id: UNASSIGNED_TAB_ID,
        label: copy.label,
        count: unassigned.length,
        tone: 'open',
        entries: unassigned.map(
          (sender, index): NameEntry => ({
            key: `${UNASSIGNED_TAB_ID}-${index}`,
            name: toSenderName(sender, copy.unknownSender),
            isOwn: false,
            note: toNote(sender),
          }),
        ),
      };

export const toChosenLabels = (
  optionIds: readonly number[],
  options: readonly LabelledOption[],
): string[] =>
  options.filter((option) => optionIds.includes(option.optionId)).map((option) => option.label);

export const toVoterEntry = (
  voter: NamedPerson & { isGivenThroughWhatsApp: boolean },
  ownPersonId: number | null,
  throughWhatsApp: string,
): NameEntry =>
  toPersonEntry(voter, ownPersonId, voter.isGivenThroughWhatsApp ? throughWhatsApp : undefined);

export const withTabs = (
  tabs: readonly NamesTab[],
  ...extra: readonly (NamesTab | null)[]
): NamesTab[] => [...tabs, ...extra.filter((tab): tab is NamesTab => tab !== null)];
