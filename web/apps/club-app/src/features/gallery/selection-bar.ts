import type { KkScreenActionBar } from '@furria/ui';
import { countLabel } from './gallery-view';
import type { PublicationState } from './selection-draft';

const SAVE_LABEL = 'Auswahl speichern';
const PUBLISH_LABEL = 'Veröffentlichen';
const WITHDRAW_LABEL = 'Zurückziehen';

interface SelectionBarInput {
  publication: PublicationState;
  count: number;
  isSaving: boolean;
  isPublishing: boolean;
  save: () => void;
  publish: () => void;
  withdraw: () => void;
}

const photosLabel = (count: number): string =>
  `${countLabel(count)} ${count === 1 ? 'Foto' : 'Fotos'}`;

export const selectionBarOf = ({
  publication,
  count,
  isSaving,
  isPublishing,
  save,
  publish,
  withdraw,
}: SelectionBarInput): KkScreenActionBar => {
  switch (publication.kind) {
    case 'unsaved':
      return {
        context: `${photosLabel(count)} · nicht gespeichert`,
        primary: { label: SAVE_LABEL, icon: 'check', onSelect: save, loading: isSaving },
      };
    case 'published':
      return {
        context: `${photosLabel(count)} · auf der Website`,
        primary: {
          label: WITHDRAW_LABEL,
          icon: 'visibilityOff',
          onSelect: withdraw,
          loading: isPublishing,
        },
      };
    case 'ready':
      return {
        context: `${photosLabel(count)} · nicht veröffentlicht`,
        primary: { label: PUBLISH_LABEL, icon: 'send', onSelect: publish, loading: isPublishing },
      };
    case 'noSession':
      return {
        context: {
          text: 'Ohne Session nicht veröffentlichbar — leg sie im Album fest.',
          tone: 'consequence',
        },
        primary: { label: PUBLISH_LABEL, icon: 'send', onSelect: publish, disabled: true },
      };
    case 'empty':
      return {
        context: { text: 'Wähle mindestens ein Foto für die Website.', tone: 'consequence' },
        primary: { label: PUBLISH_LABEL, icon: 'send', onSelect: publish, disabled: true },
      };
  }
};
