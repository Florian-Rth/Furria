import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import {
  TWIN_CLOSE,
  TWIN_EYEBROW,
  TWIN_LABEL,
  TWIN_SILENT_TEXT,
  TWIN_SILENT_TITLE,
} from '../twin-copy';

interface TwinSilentProps {
  title: string;
  onClose: () => void;
}

export const TwinSilent: FC<TwinSilentProps> = ({ title, onClose }) => (
  <KkTwin label={TWIN_LABEL}>
    <KkTwin.Head>
      <KkTwin.Close label={TWIN_CLOSE} onPress={onClose} />
      <KkTwin.Title eyebrow={TWIN_EYEBROW} title={title} />
    </KkTwin.Head>
    <KkTwin.Rest>
      <KkTwin.Empty title={TWIN_SILENT_TITLE} text={TWIN_SILENT_TEXT} />
    </KkTwin.Rest>
  </KkTwin>
);
