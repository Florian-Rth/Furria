import { useController } from 'react-hook-form';
import { toggleGroupInterest } from '../group-interests';
import type { MembershipApplicationForm } from '../schemas';

export interface GroupInterestsField {
  selected: string[];
  toggle: (groupId: string) => void;
}

export const useGroupInterestsField = (): GroupInterestsField => {
  const { field } = useController<MembershipApplicationForm, 'groupInterests'>({
    name: 'groupInterests',
  });
  const selected = field.value;

  return {
    selected,
    toggle: (groupId) => {
      field.onChange(toggleGroupInterest(selected, groupId));
    },
  };
};
