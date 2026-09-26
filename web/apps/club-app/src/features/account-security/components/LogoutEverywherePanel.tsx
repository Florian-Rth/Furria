import { KkButton, KkConfirmDialog, KkIcon, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { useLogoutEverywhere } from '../hooks/use-logout-everywhere';

const TITLE = 'Geräte';
const DESCRIPTION =
  'Du hast ein Gerät verloren oder dich woanders nicht abgemeldet? Dann beende hier jede Sitzung auf einmal.';
const LOGOUT_EVERYWHERE_LABEL = 'Überall abmelden';
const EYEBROW = 'Anmeldung';
const QUESTION = 'Auf allen Geräten abmelden?';
const EXPLANATION =
  'Überall, wo du in der Vereins-App angemeldet bist, endet deine Sitzung – auch auf diesem Gerät. Danach meldest du dich neu an.';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const NO_FACTS = [] as const;

export const LogoutEverywherePanel: FC = () => {
  const control = useLogoutEverywhere();
  const logoutIcon = <KkIcon name="logout" size="small" />;

  return (
    <KkPanelSection title={TITLE} description={DESCRIPTION}>
      <KkButton variant="outlined" fullWidth startIcon={logoutIcon} onClick={control.open}>
        {LOGOUT_EVERYWHERE_LABEL}
      </KkButton>
      <KkConfirmDialog
        open={control.isOpen}
        onClose={control.close}
        onConfirm={control.confirm}
        eyebrow={EYEBROW}
        question={QUESTION}
        explanation={EXPLANATION}
        facts={NO_FACTS}
        error={control.rejection ?? undefined}
        confirmLabel={LOGOUT_EVERYWHERE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={control.isBusy}
      />
    </KkPanelSection>
  );
};
