import { KkStateGlyph } from '@furria/ui/KkStateGlyph';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { OPEN_ROW_LABEL, SHARE_LABEL } from '../upload-link-copy';

const keep = (): void => {};

const SAMPLE_MARK = <KkStateGlyph state="current" />;
const SAMPLE_ACTION = <KkWorkQueue.Action icon="share" label={SHARE_LABEL} onSelect={keep} />;

export const UploadLinksHelpRowPreview: FC = () => (
  <KkWorkQueue label="Beispiel">
    <KkWorkQueue.Row
      mark={SAMPLE_MARK}
      title="Rosenmontagszug 2027"
      fact="38 Dateien hochgeladen · 38 im Eingang"
      day="Mo., 8.2."
      relative="noch 5 Tage"
      action={SAMPLE_ACTION}
      openLabel={OPEN_ROW_LABEL}
      onOpen={keep}
    />
  </KkWorkQueue>
);
