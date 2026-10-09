export interface KkCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface KkCropImage {
  width: number;
  height: number;
}

export interface KkCropView {
  zoom: number;
  centerX: number;
  centerY: number;
}

export const KK_CROP_MIN_ZOOM = 1;
export const KK_CROP_MAX_ZOOM = 4;

const CENTRED_VIEW: KkCropView = { zoom: KK_CROP_MIN_ZOOM, centerX: 0.5, centerY: 0.5 };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const wholeCut = (image: KkCropImage, aspect: number): { width: number; height: number } =>
  image.width / image.height > aspect
    ? { width: (image.height * aspect) / image.width, height: 1 }
    : { width: 1, height: image.width / aspect / image.height };

export const resolveCrop = (view: KkCropView, image: KkCropImage, aspect: number): KkCrop => {
  const whole = wholeCut(image, aspect);
  const zoom = clamp(view.zoom, KK_CROP_MIN_ZOOM, KK_CROP_MAX_ZOOM);
  const width = whole.width / zoom;
  const height = whole.height / zoom;
  const centerX = clamp(view.centerX, width / 2, 1 - width / 2);
  const centerY = clamp(view.centerY, height / 2, 1 - height / 2);

  return { left: centerX - width / 2, top: centerY - height / 2, width, height };
};

const viewOfCrop = (crop: KkCrop, image: KkCropImage, aspect: number): KkCropView => ({
  zoom: clamp(wholeCut(image, aspect).width / crop.width, KK_CROP_MIN_ZOOM, KK_CROP_MAX_ZOOM),
  centerX: crop.left + crop.width / 2,
  centerY: crop.top + crop.height / 2,
});

const settled = (view: KkCropView, image: KkCropImage, aspect: number): KkCropView =>
  viewOfCrop(resolveCrop(view, image, aspect), image, aspect);

export const resolveView = (crop: KkCrop | null, image: KkCropImage, aspect: number): KkCropView =>
  crop === null ? CENTRED_VIEW : settled(viewOfCrop(crop, image, aspect), image, aspect);

export const panView = (
  view: KkCropView,
  image: KkCropImage,
  aspect: number,
  shift: { x: number; y: number; frameWidth: number },
): KkCropView => {
  const crop = resolveCrop(view, image, aspect);
  const frameHeight = shift.frameWidth / aspect;

  return settled(
    {
      zoom: view.zoom,
      centerX: view.centerX - (shift.x / shift.frameWidth) * crop.width,
      centerY: view.centerY - (shift.y / frameHeight) * crop.height,
    },
    image,
    aspect,
  );
};

export const zoomView = (
  view: KkCropView,
  image: KkCropImage,
  aspect: number,
  zoom: number,
): KkCropView => settled({ ...view, zoom }, image, aspect);

export const placeCropImage = (
  crop: KkCrop,
): { left: string; top: string; width: string; height: string } => ({
  left: `${(-crop.left / crop.width) * 100}%`,
  top: `${(-crop.top / crop.height) * 100}%`,
  width: `${100 / crop.width}%`,
  height: `${100 / crop.height}%`,
});
