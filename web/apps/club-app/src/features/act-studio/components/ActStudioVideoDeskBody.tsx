import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { VideoDesk } from '../hooks/use-video-desk';
import {
  STUDIO_VIDEO_ALIGN,
  STUDIO_VIDEO_ALIGNING,
  STUDIO_VIDEO_DESK,
  STUDIO_VIDEO_MAIN_FOR,
  STUDIO_VIDEO_NAME,
  STUDIO_VIDEO_NAME_HINT,
  STUDIO_VIDEO_NAME_LENGTH,
  STUDIO_VIDEO_PLACE,
  STUDIO_VIDEO_REMOVE,
  STUDIO_VIDEO_REMOVE_SURE,
  STUDIO_VIDEO_START_HERE,
} from '../studio-copy';

interface ActStudioVideoDeskBodyProps {
  desk: VideoDesk;
}

export const ActStudioVideoDeskBody: FC<ActStudioVideoDeskBodyProps> = ({ desk }) => {
  const rename = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    desk.rename(event.target.value);
  };
  const alignText = desk.aligning ? STUDIO_VIDEO_ALIGNING : STUDIO_VIDEO_ALIGN;
  const removeText = desk.removing ? STUDIO_VIDEO_REMOVE_SURE : STUDIO_VIDEO_REMOVE;
  const parts = desk.parts.map((part) => (
    <KkButton key={part.key} variant={part.variant} size="small" onClick={part.press}>
      {part.text}
    </KkButton>
  ));
  const mainLine =
    desk.parts.length === 0 ? null : (
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_VIDEO_MAIN_FOR} />
        <KkStudioDesk.Controls>{parts}</KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    );

  return (
    <KkStudioDesk label={STUDIO_VIDEO_DESK}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_VIDEO_NAME} />
        <KkTextField
          name="videoName"
          label={STUDIO_VIDEO_NAME}
          placeholder={STUDIO_VIDEO_NAME_HINT}
          value={desk.name}
          maxLength={STUDIO_VIDEO_NAME_LENGTH}
          onChange={rename}
          onBlur={desk.commitName}
        />
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_VIDEO_PLACE} />
        <KkStudioDesk.Controls>
          <KkButton
            variant="outlined"
            size="small"
            disabled={desk.alignLocked}
            onClick={desk.align}
          >
            {alignText}
          </KkButton>
          <KkButton
            variant="outlined"
            size="small"
            disabled={desk.startLocked}
            onClick={desk.startHere}
          >
            {STUDIO_VIDEO_START_HERE}
          </KkButton>
          <KkButton variant="outlined" tone="danger" size="small" onClick={desk.remove}>
            {removeText}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      {mainLine}
    </KkStudioDesk>
  );
};
