import { motion } from 'motion/react';
import type { CSSProperties, FC, SyntheticEvent } from 'react';
import type { KkSize } from '../../../image-aspect';
import { kkTokens } from '../../../tokens';
import type { ViewerSlide } from '../logic/viewer-context';
import { useViewer } from '../logic/viewer-context';
import { KkViewerFilm } from './KkViewerFilm';
import { KkViewerLatent } from './KkViewerLatent';

const IMAGE_STYLE = {
  display: 'block',
  pointerEvents: 'none',
  borderRadius: kkTokens.radius.base,
  boxShadow: kkTokens.shadow.raised,
} as const;

const UNSIZED_STYLE = { width: '100%', height: '100%', objectFit: 'contain' } as const;

const sizedStyleOf = (size: KkSize | undefined): CSSProperties => {
  if (size === undefined || size.height <= 0) {
    return UNSIZED_STYLE;
  }
  const ratio = size.width / size.height;

  return { width: `min(100cqw, ${100 * ratio}cqh)`, aspectRatio: `${ratio}` };
};

interface KkViewerSlideProps {
  slide: ViewerSlide;
}

export const KkViewerSlide: FC<KkViewerSlideProps> = ({ slide }) => {
  const viewer = useViewer();
  const { item } = slide;
  const current = slide.offset === 0;
  const slideMotion = current
    ? { opacity: viewer.arrival.opacity, y: viewer.arrival.pullY, scale: viewer.arrival.pullScale }
    : {};
  const imageMotion = current ? viewer.stage.image : {};
  const sizedStyle = sizedStyleOf(item.size);
  const hiddenFromReaders = current ? undefined : true;
  const slideStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    display: 'grid',
    placeItems: 'center',
    containerType: 'size',
    left: `${slide.offset * 100}%`,
    ...slideMotion,
  } as const;

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    viewer.onImageLoad(item.key, event);
  };

  const picture =
    item.image === null ? (
      <KkViewerLatent label={viewer.labels.developing} />
    ) : (
      <motion.img
        src={item.image.src}
        srcSet={item.image.srcSet}
        sizes={item.image.sizes}
        alt={item.alt}
        draggable={false}
        decoding="async"
        onLoad={handleLoad}
        style={{ ...IMAGE_STYLE, ...sizedStyle, ...imageMotion }}
      />
    );
  const film =
    current && item.video !== undefined && item.image !== null ? (
      <KkViewerFilm
        key={item.video.src}
        source={item.video.src}
        poster={item.image.src}
        duration={item.video.duration}
        playLabel={viewer.labels.play}
      />
    ) : null;

  return (
    <motion.div
      aria-hidden={hiddenFromReaders}
      data-kk-viewer-slide={slide.slot}
      style={slideStyle}
    >
      {picture}
      {film}
    </motion.div>
  );
};
