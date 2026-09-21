import {
  KkButton,
  KkFieldRow,
  KkIcon,
  KkNote,
  KkPanel,
  KkPanelSection,
  KkSelectField,
  KkSwitchRow,
  KkTextArea,
  KkTextField,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, Ref } from 'react';
import type { RunningGroupKind } from '@/features/group-kinds';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  NO_GROUP_KIND_LABEL,
  toGroupKindOptions,
  useGroupKindsQuery,
} from '@/features/group-kinds';
import type { GroupTone } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { toToneLabel } from '../group-hub-labels';
import type { GroupInfoFormControl } from '../hooks/use-group-info-form';
import { DESCRIPTION_MAX_LENGTH } from '../schemas';
import { HubTonePicker } from './HubTonePicker';

const DESCRIPTION_LABEL = 'Über die Gruppe';
const DESCRIPTION_PLACEHOLDER = 'Was macht die Gruppe, wann trefft ihr euch?';
const DESCRIPTION_HINT = 'Ein paar Sätze über die Gruppe. Der Text steht so im Verzeichnis.';
const DESCRIPTION_ROWS = 5;

const FOUNDED_LABEL = 'Gründungsjahr';
const FOUNDED_HINT =
  'Nur das Jahr, zwischen 1800 und 2100. Alle fünf Jahre feiert die App das Jubiläum mit.';

const OPENNESS_LABEL = 'Sucht Verstärkung';
const OPENNESS_DESCRIPTION = 'Zeigt im Verzeichnis, dass ihr gerade Leute aufnehmt.';

const NAME_NOTE = 'Den Namen der Gruppe ändert die Gruppenverwaltung.';
const CANCEL_LABEL = 'Abbrechen';
const SAVE_LABEL = 'Speichern';
const EDIT_LABEL = 'Pflegen';
const EDIT_ACTION_LABEL = 'Angaben zur Gruppe pflegen';
const NO_FOUNDED_YEAR = 'noch offen';
const RECRUITING_YES = 'ja';
const RECRUITING_NO = 'nein';
const NO_TONE_LABEL = 'noch keine';
const TONE_FIELD_LABEL = 'Gruppenfarbe';

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface HubCarePanelProps {
  tone: GroupTone;
  form: GroupInfoFormControl;
  heldKind: RunningGroupKind | null;
  takenTones: ReadonlySet<GroupTone>;
  titleRef: Ref<HTMLHeadingElement>;
}

export const HubCarePanel: FC<HubCarePanelProps> = ({
  tone,
  form,
  heldKind,
  takenTones,
  titleRef,
}) => {
  const kinds = useGroupKindsQuery();
  const kindOptions = toGroupKindOptions(kinds.data?.kinds ?? [], heldKind);
  const kindLine = heldKind === null ? NO_GROUP_KIND_LABEL : heldKind.name;
  const foundedLine = form.foundedYear === '' ? NO_FOUNDED_YEAR : form.foundedYear;
  const toneLine = form.tone === '' ? NO_TONE_LABEL : toToneLabel(form.tone);
  const recruitingLine = form.isRecruiting ? RECRUITING_YES : RECRUITING_NO;

  const changeFoundedYear = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    form.setFoundedYear(event.target.value);
  };

  const action = form.isEditing ? null : (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      ariaLabel={EDIT_ACTION_LABEL}
      onClick={form.start}
    >
      {EDIT_LABEL}
    </KkButton>
  );

  const resting = (
    <KkPanel>
      <KkFieldRow label={GROUP_KIND_FIELD_LABEL} value={kindLine} />
      <KkFieldRow label={FOUNDED_LABEL} value={foundedLine} />
      <KkFieldRow label={TONE_FIELD_LABEL} value={toneLine} />
      <KkFieldRow label={OPENNESS_LABEL} value={recruitingLine} />
    </KkPanel>
  );

  const editing = (
    <KkPanel variant="block" tone="editing">
      <Stack sx={{ gap: 2.25, minWidth: 0 }}>
        <KkTextArea
          name="description"
          label={DESCRIPTION_LABEL}
          value={form.description}
          onChange={form.setDescription}
          rows={DESCRIPTION_ROWS}
          maxLength={DESCRIPTION_MAX_LENGTH}
          showCount
          countLabel={toCountLabel}
          placeholder={DESCRIPTION_PLACEHOLDER}
          hint={DESCRIPTION_HINT}
        />
        <KkSelectField
          name="groupKindId"
          label={GROUP_KIND_FIELD_LABEL}
          value={form.groupKindId}
          options={kindOptions}
          onChange={form.setGroupKindId}
          presentation="select"
          hint={GROUP_KIND_FIELD_HINT}
        />
        <KkTextField
          name="foundedYear"
          label={FOUNDED_LABEL}
          inputMode="numeric"
          value={form.foundedYear}
          onChange={changeFoundedYear}
          error={form.foundedYearError !== null}
          helperText={form.foundedYearError ?? FOUNDED_HINT}
        />
        <HubTonePicker value={form.tone} takenTones={takenTones} onChange={form.setTone} />
        <KkSwitchRow
          label={OPENNESS_LABEL}
          checked={form.isRecruiting}
          onChange={form.setRecruiting}
          description={OPENNESS_DESCRIPTION}
        />
        <KkNote>{NAME_NOTE}</KkNote>
        <Stack
          direction="row"
          sx={{ gap: 1.25, minWidth: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}
        >
          <KkButton variant="outlined" onClick={form.cancel} disabled={form.isSaving}>
            {CANCEL_LABEL}
          </KkButton>
          <KkButton
            onClick={form.save}
            loading={form.isSaving}
            disabled={!form.isDirty || form.foundedYearError !== null}
          >
            {SAVE_LABEL}
          </KkButton>
        </Stack>
      </Stack>
    </KkPanel>
  );

  const panel = form.isEditing ? editing : resting;

  return (
    <KkPanelSection
      title={GROUP_SECTION_TITLES.care}
      groupTone={tone}
      titleRef={titleRef}
      action={action}
    >
      {panel}
    </KkPanelSection>
  );
};
