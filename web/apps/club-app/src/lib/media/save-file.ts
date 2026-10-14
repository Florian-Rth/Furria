export const saveFile = (url: string): void => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '';
  anchor.rel = 'noopener';
  anchor.click();
};
