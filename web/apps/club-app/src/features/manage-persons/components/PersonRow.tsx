import { KkChip, KkPersonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { NO_AFFILIATION_META } from '@/lib/person-rows';
import { toMembershipStateChip, WITHHELD_CHIP } from '@/lib/state-chips';
import { isContactWithheld, toPersonName, toPersonRowAffiliation } from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';

const PERSON_PATH = '/manage/persons/$personId';

interface PersonRowProps {
  person: PersonSummary;
}

export const PersonRow: FC<PersonRowProps> = ({ person }) => {
  const { accent, meta } = toPersonRowAffiliation(person);
  const state = toMembershipStateChip(person.membershipState);
  const params = { personId: String(person.personId) };

  const withheldChip = isContactWithheld(person) ? (
    <KkChip tone={WITHHELD_CHIP.tone} dot={WITHHELD_CHIP.dot} size="small">
      {WITHHELD_CHIP.label}
    </KkChip>
  ) : null;

  const trailing = (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.625, flexShrink: 0 }}>
      {withheldChip}
      <KkChip tone={state.tone} dot={state.dot} size="small">
        {state.label}
      </KkChip>
    </Stack>
  );

  return (
    <KkPersonRow
      initials={toInitials(person.firstName, person.lastName)}
      name={toPersonName(person)}
      accent={accent}
      meta={meta}
      emptyMeta={NO_AFFILIATION_META}
      trailing={trailing}
      component={Link}
      to={PERSON_PATH}
      params={params}
    />
  );
};
