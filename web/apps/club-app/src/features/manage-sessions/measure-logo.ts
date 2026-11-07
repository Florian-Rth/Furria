export const measureLogoAspect = (source: string): Promise<number | null> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image.naturalHeight > 0 ? image.naturalWidth / image.naturalHeight : null);
    };
    image.onerror = () => {
      resolve(null);
    };
    image.src = source;
  });
