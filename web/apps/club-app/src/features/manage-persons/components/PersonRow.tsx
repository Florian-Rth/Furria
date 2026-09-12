import { KkChip, KkPersonRow } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toMembershipStateChip } from '@/lib/state-chips';
import {
  isContactWithheld,
  NO_AFFILIATION_META,
  toPersonName,
  toPersonRowAffiliation,
  WITHHELD_CHIP_LABEL,
} from '../manage-persons-labels';
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
    <Box component="span" sx={{ display: { xs: 'none', desktop: 'inline-flex' }, flexShrink: 0 }}>
      <KkChip tone="neutral" size="small">
        {WITHHELD_CHIP_LABEL}
      </KkChip>
    </Box>
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
