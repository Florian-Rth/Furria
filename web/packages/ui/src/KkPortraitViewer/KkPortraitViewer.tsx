import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkImageSource } from '../image-source';
import { KkViewer } from '../KkViewer/KkViewer';
import type { KkViewerItem, KkViewerLabels } from '../KkViewer/viewer-types';

const PORTRAIT_SIZE = { width: 4, height: 5 } as const;
const PORTRAIT_INDEX = 0;
const PORTRAIT_KEY = 'portrait';

const keepIndex = (): void => {};

interface KkPortraitViewerProps {
  name: string;
  image: KkImageSource;
  open: boolean;
  labels: KkViewerLabels;
  onClose: () => void;
}

export const KkPortraitViewer: FC<KkPortraitViewerProps> = ({
  name,
  image,
  open,
  labels,
  onClose,
}) => {
  const items: readonly KkViewerItem[] = [
    { key: PORTRAIT_KEY, alt: name, image, size: PORTRAIT_SIZE },
  ];
  const index = open ? PORTRAIT_INDEX : null;

  return (
    <KkViewer
      items={items}
      index={index}
      labels={labels}
      title={name}
      entrance="iris"
      onIndexChange={keepIndex}
      onClose={onClose}
    >
      <KkViewer.Bar>
        <KkViewer.Close />
        <Typography variant="h4" component="h2" noWrap sx={{ minWidth: 0, flex: 1 }}>
          {name}
        </Typography>
      </KkViewer.Bar>
      <KkViewer.Stage />
    </KkViewer>
  );
};
