import { toImageSource } from '@furria/ui/image-source';
import { KkChip } from '@furria/ui/KkChip';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toStanding } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { NO_AFFILIATION_META, toPersonRowAffiliation } from '@/lib/person-rows';
import { toMembershipStateChip, WITHHELD_CHIP } from '@/lib/state-chips';
import { isContactWithheld, toPersonName } from '../manage-persons-labels';
import { toAppStateChip } from '../person-app-state';
import type { PersonSummary } from '../schemas';

const PERSON_PATH = '/manage/persons/$personId';

interface PersonRowProps {
  person: PersonSummary;
}

export const PersonRow: FC<PersonRowProps> = ({ person }) => {
  const { accent, meta } = toPersonRowAffiliation(person.groups, person.roles);
  const membership = toMembershipStateChip(person.membershipState);
  const app = toAppStateChip(person.accessState);
  const params = { personId: String(person.personId) };
  const portrait = toImageSource(person.portrait ?? null, 'portrait');
  const standing = toStanding(person);

  const withheldChip = isContactWithheld(person) ? (
    <KkChip tone={WITHHELD_CHIP.tone} dot={WITHHELD_CHIP.dot} size="small">
      {WITHHELD_CHIP.label}
    </KkChip>
  ) : null;

  const appChip =
    app === null ? null : (
      <KkChip tone={app.tone} dot={app.dot} size="small">
        {app.label}
      </KkChip>
    );

  const trailing = (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: 0.625,
        minWidth: 0,
      }}
    >
      {withheldChip}
      <KkChip tone={membership.tone} dot={membership.dot} size="small">
        {membership.label}
      </KkChip>
      {appChip}
    </Stack>
  );

  return (
    <KkPersonRow
      initials={toInitials(person.firstName, person.lastName)}
      portrait={portrait}
      standing={standing}
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
