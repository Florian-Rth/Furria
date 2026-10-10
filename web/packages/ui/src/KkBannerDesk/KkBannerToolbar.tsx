import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { FC } from 'react';
import { KkIcon } from '../KkIcon';
import type { KkBannerDeskActions, KkBannerDeskLabels } from './banner-desk-types';
import { KkBannerPanel } from './KkBannerPanel';
import { KkBannerTool } from './KkBannerTool';
import { useBannerToolbar } from './use-banner-toolbar';

const REPLACE_MENU_ID = 'kk-banner-replace-menu';

interface KkBannerToolbarProps {
  labels: KkBannerDeskLabels;
  actions: KkBannerDeskActions;
}

export const KkBannerToolbar: FC<KkBannerToolbarProps> = ({ labels, actions }) => {
  const toolbar = useBannerToolbar();

  const chooseUpload = (): void => {
    toolbar.closeReplace();
    actions.onUpload();
  };
  const chooseGallery = (): void => {
    toolbar.closeReplace();
    actions.onGallery();
  };
  const confirmRemoval = (): void => {
    toolbar.disarmRemoval();
    actions.onRemove();
  };

  const removal = toolbar.isRemovalArmed ? (
    <KkBannerTool
      icon="delete"
      label={labels.removeConfirm}
      tone="danger"
      onClick={confirmRemoval}
    />
  ) : (
    <KkBannerTool
      icon="delete"
      label={labels.remove}
      isLabelShown={false}
      onClick={toolbar.armRemoval}
    />
  );

  return (
    <KkBannerPanel>
      <KkBannerTool icon="crop" label={labels.crop} onClick={actions.onCrop} />
      <Box component="span" ref={toolbar.replaceRef} sx={{ display: 'inline-flex' }}>
        <KkBannerTool icon="image" label={labels.replace} onClick={toolbar.openReplace} />
      </Box>
      {removal}
      <Menu
        id={REPLACE_MENU_ID}
        anchorEl={toolbar.replaceAnchor}
        open={toolbar.isReplaceOpen}
        onClose={toolbar.closeReplace}
      >
        <MenuItem onClick={chooseUpload} sx={{ gap: 1.5 }}>
          <KkIcon name="upload" size="small" />
          {labels.upload}
        </MenuItem>
        <MenuItem onClick={chooseGallery} sx={{ gap: 1.5 }}>
          <KkIcon name="gallery" size="small" />
          {labels.gallery}
        </MenuItem>
      </Menu>
    </KkBannerPanel>
  );
};
