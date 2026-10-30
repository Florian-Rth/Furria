import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { StepDeskPart } from '../hooks/use-step-desk';
import {
  STUDIO_MAIN_VIDEO,
  STUDIO_PART,
  STUDIO_PART_EARLIER,
  STUDIO_PART_LATER,
  STUDIO_PART_NAME,
  STUDIO_PART_NAME_LENGTH,
  STUDIO_PART_REMOVE,
  STUDIO_PART_REMOVE_SURE,
} from '../studio-copy';

interface ActStudioPartDeskProps {
  part: StepDeskPart;
}

export const ActStudioPartDesk: FC<ActStudioPartDeskProps> = ({ part }) => {
  const rename = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    part.rename(event.target.value);
  };
  const earlier = (): void => {
    part.shift('earlier');
  };
  const later = (): void => {
    part.shift('later');
  };
  const removeText = part.removing ? STUDIO_PART_REMOVE_SURE : STUDIO_PART_REMOVE;
  const border = part.leads ? (
    <>
      <KkButton
        variant="outlined"
        size="small"
        disabled={part.shiftLocked.earlier}
        onClick={earlier}
      >
        {STUDIO_PART_EARLIER}
      </KkButton>
      <KkButton variant="outlined" size="small" disabled={part.shiftLocked.later} onClick={later}>
        {STUDIO_PART_LATER}
      </KkButton>
    </>
  ) : null;
  const videos = part.videos.map((video) => (
    <KkButton key={video.key} variant={video.variant} size="small" onClick={video.press}>
      {video.text}
    </KkButton>
  ));

  return (
    <>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_PART} />
        <KkTextField
          name="partName"
          label={STUDIO_PART_NAME}
          value={part.name}
          maxLength={STUDIO_PART_NAME_LENGTH}
          onChange={rename}
          onBlur={part.commitName}
        />
        <KkStudioDesk.Controls>
          {border}
          <KkButton variant="outlined" tone="danger" size="small" onClick={part.remove}>
            {removeText}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_MAIN_VIDEO} />
        <KkStudioDesk.Controls>{videos}</KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    </>
  );
};
