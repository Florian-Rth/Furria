import { KkButton } from '@furria/ui/KkButton';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import type { KkNumberStepLabels } from '@furria/ui/KkNumberField';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import {
  FEWEST_QUESTIONS_PER_PERSON_PER_DAY,
  LARGEST_MONTHLY_BUDGET_EUROS,
  MOST_QUESTIONS_PER_PERSON_PER_DAY,
  SMALLEST_MONTHLY_BUDGET_EUROS,
} from '../assistant-limits';
import { useClubAssistantPanel } from '../hooks/use-club-assistant-panel';
import type { ClubAssistant } from '../schemas';
import {
  CLUB_ASSISTANT_BUDGET_LABEL,
  CLUB_ASSISTANT_LABEL,
  CLUB_ASSISTANT_QUESTIONS_LABEL,
  CLUB_ASSISTANT_SAVE_LABEL,
  CLUB_ASSISTANT_TITLE,
  CLUB_ASSISTANT_USED_LABEL,
} from '../whatsapp-copy';
import { WHATSAPP_HELP_SPOTS } from '../whatsapp-help-copy';

const BUDGET_STEP_LABELS: KkNumberStepLabels = { less: 'Ein Euro weniger', more: 'Ein Euro mehr' };
const QUESTIONS_STEP_LABELS: KkNumberStepLabels = {
  less: 'Eine Frage weniger',
  more: 'Eine Frage mehr',
};

interface WhatsAppAssistantPanelProps {
  assistant: ClubAssistant;
}

export const WhatsAppAssistantPanel: FC<WhatsAppAssistantPanelProps> = ({ assistant }) => {
  const panel = useClubAssistantPanel(assistant);

  return (
    <KkPanelSection title={CLUB_ASSISTANT_TITLE} landing={WHATSAPP_HELP_SPOTS.assistant}>
      <KkPanel variant="block" sx={{ gap: 1.75 }}>
        <KkSwitchRow
          label={CLUB_ASSISTANT_LABEL}
          description={panel.description}
          checked={panel.isEnabled}
          onChange={panel.switchAssistant}
          stateLabel={SWITCH_STATE_LABELS}
          disabled={!panel.canSwitch}
          busy={panel.isSwitching}
        />
        <KkFieldRow label={CLUB_ASSISTANT_USED_LABEL} value={panel.usage} />
        <KkNumberField
          name="monthlyBudgetEuros"
          label={CLUB_ASSISTANT_BUDGET_LABEL}
          value={panel.budget}
          onChange={panel.setBudget}
          stepLabels={BUDGET_STEP_LABELS}
          min={SMALLEST_MONTHLY_BUDGET_EUROS}
          max={LARGEST_MONTHLY_BUDGET_EUROS}
          error={panel.hasBudgetError}
          helperText={panel.budgetError}
        />
        <KkNumberField
          name="questionsPerPersonPerDay"
          label={CLUB_ASSISTANT_QUESTIONS_LABEL}
          value={panel.questions}
          onChange={panel.setQuestions}
          stepLabels={QUESTIONS_STEP_LABELS}
          min={FEWEST_QUESTIONS_PER_PERSON_PER_DAY}
          max={MOST_QUESTIONS_PER_PERSON_PER_DAY}
          error={panel.hasQuestionsError}
          helperText={panel.questionsError}
        />
        <KkButton onClick={panel.save} disabled={!panel.canSave} loading={panel.isSaving}>
          {CLUB_ASSISTANT_SAVE_LABEL}
        </KkButton>
      </KkPanel>
    </KkPanelSection>
  );
};
