import { KkEightsSetup } from '@furria/ui/KkEightsSetup';
import { KkStudioList } from '@furria/ui/KkStudioList';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { STUDIO_SONG_ACCEPT, uploadLabelOf, uploadMetaOf } from '@/features/act-studio/studio-copy';
import { EIGHTS_SETUP, SETUP_LIST_LABEL, SETUP_RAIL_LABEL } from '../eights-copy';
import type { EightsMusicTab } from '../hooks/use-eights-routes';
import { useEightsSetup } from '../hooks/use-eights-setup';
import type { EightsStudio } from '../hooks/use-eights-studio';

interface EightsSetupViewProps {
  eights: EightsStudio;
  openMusic: (tab: EightsMusicTab) => void;
  close: () => void;
}

export const EightsSetupView: FC<EightsSetupViewProps> = ({ eights, openMusic, close }) => {
  const setup = useEightsSetup(eights, openMusic, close);
  const next =
    setup.next === null ? null : (
      <KkEightsSetup.Next
        eyebrow={setup.next.eyebrow}
        title={setup.next.title}
        text={setup.next.text}
        glyph={setup.next.glyph}
        action={setup.next.action}
        onAction={setup.next.run}
      />
    );
  const uploading = setup.uploads.rows.map((upload) => {
    const dismiss = (): void => {
      setup.uploads.dismiss(upload.key);
    };

    return (
      <KkStudioList.Upload
        key={upload.key}
        title={upload.name}
        meta={uploadMetaOf(upload.share, upload.failure, 'song')}
        share={upload.share}
        failed={upload.failure !== null}
        label={uploadLabelOf(upload.name, upload.failure, 'song')}
        onPress={dismiss}
      />
    );
  });
  const rows = setup.rows.map((row) => (
    <KkEightsSetup.Row
      key={row.key}
      number={row.number}
      text={row.text}
      meta={row.meta}
      state={row.state}
      stateText={row.stateText}
      action={row.action}
      onAction={row.run}
    />
  ));

  return (
    <KkEightsSetup label={EIGHTS_SETUP}>
      <KkEightsSetup.Rail label={SETUP_RAIL_LABEL} segments={setup.segments} />
      {next}
      {uploading}
      <KkEightsSetup.List label={SETUP_LIST_LABEL}>{rows}</KkEightsSetup.List>
      <Box
        component="input"
        type="file"
        accept={STUDIO_SONG_ACCEPT}
        multiple
        ref={setup.uploads.fileInput}
        onChange={setup.uploads.onChosen}
        hidden
      />
    </KkEightsSetup>
  );
};
