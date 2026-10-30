import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC } from 'react';
import type { ActStudioMovement } from '../hooks/use-act-studio-movement';
import { useMoveDesk } from '../hooks/use-move-desk';
import {
  STUDIO_MOVE_CURVE,
  STUDIO_MOVE_DESK,
  STUDIO_MOVE_EASING,
  STUDIO_MOVE_FACING,
  STUDIO_MOVE_KEY,
  STUDIO_MOVE_STRAIGHTEN,
  STUDIO_MOVE_TURN_LEFT,
  STUDIO_MOVE_TURN_RIGHT,
  STUDIO_MOVE_UNFACE,
  STUDIO_MOVE_UNKEY,
  STUDIO_NUDGE_BACK,
  STUDIO_NUDGE_ON,
} from '../studio-copy';

interface ActStudioMoveDeskProps {
  movement: ActStudioMovement;
}

export const ActStudioMoveDesk: FC<ActStudioMoveDeskProps> = ({ movement }) => {
  const desk = useMoveDesk(movement);
  const locked = !desk.moving;
  const easings = desk.easings.map((easing) => (
    <KkButton
      key={easing.key}
      variant={easing.current ? 'contained' : 'outlined'}
      size="small"
      disabled={locked}
      onClick={easing.press}
    >
      {easing.text}
    </KkButton>
  ));
  const straightLocked = !desk.bent;
  const unfaceVariant = desk.faced ? 'outlined' : 'contained';
  const unkeyLocked = !desk.keyed;

  return (
    <KkStudioDesk label={STUDIO_MOVE_DESK}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={desk.title} />
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_MOVE_EASING} />
        <KkStudioDesk.Controls>{easings}</KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_MOVE_CURVE} />
        <KkStudioDesk.Controls>
          <KkStudioDesk.Value text={desk.curveText} />
          <KkButton
            variant="outlined"
            size="small"
            disabled={straightLocked}
            onClick={desk.straighten}
          >
            {STUDIO_MOVE_STRAIGHTEN}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_MOVE_FACING} />
        <KkStudioDesk.Controls>
          <KkStudioDesk.Nudge
            text={STUDIO_NUDGE_BACK}
            label={STUDIO_MOVE_TURN_LEFT}
            disabled={locked}
            onPress={desk.turnLeft}
          />
          <KkStudioDesk.Value text={desk.facingText} />
          <KkStudioDesk.Nudge
            text={STUDIO_NUDGE_ON}
            label={STUDIO_MOVE_TURN_RIGHT}
            disabled={locked}
            onPress={desk.turnRight}
          />
          <KkButton variant={unfaceVariant} size="small" disabled={locked} onClick={desk.unface}>
            {STUDIO_MOVE_UNFACE}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_MOVE_KEY} />
        <KkStudioDesk.Controls>
          <KkButton
            variant="outlined"
            tone="danger"
            size="small"
            disabled={unkeyLocked}
            onClick={desk.unkey}
          >
            {STUDIO_MOVE_UNKEY}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    </KkStudioDesk>
  );
};
