import { KkButton, KkIcon, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { useGroupInfoForm } from '../hooks/use-group-info-form';
import { HubCarePanel } from './HubCarePanel';
import { HubInfoPanel } from './HubInfoPanel';

const EDIT_LABEL = 'Pflegen';

interface HubGroupSectionProps {
  groupId: number;
  name: string;
  description: string;
  isRecruiting: boolean;
  canManage: boolean;
}

export const HubGroupSection: FC<HubGroupSectionProps> = ({
  groupId,
  name,
  description,
  isRecruiting,
  canManage,
}) => {
  const form = useGroupInfoForm({ groupId, description, isRecruiting });
  const isEditable = canManage && !form.isEditing;

  const action = isEditable ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      onClick={form.start}
    >
      {EDIT_LABEL}
    </KkButton>
  ) : null;

  const panel = form.isEditing ? (
    <HubCarePanel form={form} />
  ) : (
    <HubInfoPanel groupName={name} description={description} />
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.about} action={action}>
      {panel}
    </KkPanelSection>
  );
};
