import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useActEditor } from '../hooks/use-act-editor';
import { ActCastSection } from './ActCastSection';
import { ActGroupChoice } from './ActGroupChoice';
import { ActPaneFoot } from './ActPaneFoot';
import { ActPaneHead } from './ActPaneHead';
import { ActSharedSection } from './ActSharedSection';
import { ActWishesSection } from './ActWishesSection';

interface ActPaneProps {
  act: CatalogueAct | null;
  acts: readonly CatalogueAct[];
  fixedGroupId: number | null;
  framed: boolean;
  spotlightId: number | null;
  onToggleSpotlight: (personId: number) => void;
  onCreated: (actId: number) => void;
  onClose: () => void;
}

export const ActPane: FC<ActPaneProps> = ({
  act,
  acts,
  fixedGroupId,
  framed,
  spotlightId,
  onToggleSpotlight,
  onCreated,
  onClose,
}) => {
  const editor = useActEditor({ act, acts, fixedGroupId, onCreated });
  const groupSection = editor.canChooseGroup ? <ActGroupChoice editor={editor} /> : null;
  const closeAction = framed ? onClose : undefined;

  return (
    <KkStepPane label={editor.headerAct.name} framed={framed}>
      <ActPaneHead editor={editor} onClose={closeAction} />
      <KkStepPane.Body>
        {groupSection}
        <ActCastSection editor={editor} />
        <ActWishesSection editor={editor} />
        <ActSharedSection
          shared={editor.shared}
          spotlightId={spotlightId}
          onToggleSpotlight={onToggleSpotlight}
        />
      </KkStepPane.Body>
      <ActPaneFoot editor={editor} />
    </KkStepPane>
  );
};
