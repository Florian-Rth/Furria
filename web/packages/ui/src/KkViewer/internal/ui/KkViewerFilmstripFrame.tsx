import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkViewerItem } from '../../viewer-types';
import { KkImage } from '../../../KkImage';

const FRAME_SIZE = 52;
const FRAME_SIZES = `${FRAME_SIZE}px`;

const revealCurrent = (node: HTMLButtonElement | null): void => {
  node?.scrollIntoView({ block: 'nearest', inline: 'center' });
};

interface KkViewerFilmstripFrameProps {
  item: KkViewerItem;
  index: number;
  current: boolean;
  onShow: (index: number) => void;
}

export const KkViewerFilmstripFrame: FC<KkViewerFilmstripFrameProps> = ({
  item,
  index,
  current,
  onShow,
}) => {
  const reveal = current ? revealCurrent : undefined;
  const ariaCurrent = current ? true : undefined;

  const handleShow = (): void => {
    onShow(index);
  };

  const thumbnail =
    item.image === null ? null : (
      <KkImage
        src={item.image.src}
        srcSet={item.image.srcSet}
        sizes={FRAME_SIZES}
        alt=""
        loading="lazy"
        draggable={false}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );

  return (
    <ButtonBase
      ref={reveal}
      aria-label={item.alt}
      aria-current={ariaCurrent}
      onClick={handleShow}
      data-kk-viewer-filmstrip-frame
      sx={(theme: Theme) => ({
        flex: `0 0 ${FRAME_SIZE}px`,
        height: FRAME_SIZE,
        bgcolor: kkTokens.gallery.latent,
        opacity: current ? 1 : 0.55,
        outline: current ? `${kkTokens.line.section}px solid` : 'none',
        outlineColor: (theme.vars ?? theme).palette.warning.main,
        outlineOffset: -kkTokens.line.section,
        ...focusRing(theme),
      })}
    >
      {thumbnail}
    </ButtonBase>
  );
};
