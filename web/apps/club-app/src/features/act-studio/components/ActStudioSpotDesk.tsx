import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC } from 'react';
import type { SpotDesk } from '../hooks/use-act-studio-spot-desk';
import {
  STUDIO_SPOT_FREE,
  STUDIO_SPOT_PERSON,
  STUDIO_SPOT_REMOVE,
  STUDIO_SPOT_REMOVE_SURE,
} from '../studio-copy';

interface ActStudioSpotDeskProps {
  desk: SpotDesk;
}

export const ActStudioSpotDesk: FC<ActStudioSpotDeskProps> = ({ desk }) => {
  const choices = desk.choices.map((choice) => (
    <KkButton
      key={choice.key}
      variant={choice.current ? 'contained' : 'outlined'}
      size="small"
      onClick={choice.press}
    >
      {choice.text}
    </KkButton>
  ));
  const freeVariant = desk.open ? 'contained' : 'outlined';
  const removeText = desk.removing ? STUDIO_SPOT_REMOVE_SURE : STUDIO_SPOT_REMOVE;

  return (
    <KkStudioDesk label={desk.title}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_SPOT_PERSON} />
        <KkStudioDesk.Controls>
          {choices}
          <KkButton variant={freeVariant} size="small" onClick={desk.free}>
            {STUDIO_SPOT_FREE}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={desk.title} />
        <KkStudioDesk.Controls>
          <KkButton variant="outlined" tone="danger" size="small" onClick={desk.remove}>
            {removeText}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    </KkStudioDesk>
  );
};
