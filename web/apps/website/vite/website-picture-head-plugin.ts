import { fileURLToPath, URL } from 'node:url';
import type { HtmlTagDescriptor, Plugin } from 'vite';
import { runnerImport } from 'vite';

type HeadModule = typeof import('../src/lib/website-pictures/website-picture-head');

const HEAD_MODULE = fileURLToPath(
  new URL('../src/lib/website-pictures/website-picture-head.ts', import.meta.url),
);

const loadHeadTags = async (): Promise<HtmlTagDescriptor[]> => {
  const { module } = await runnerImport<HeadModule>(HEAD_MODULE, { configFile: false });

  return module.websitePictureHeadTags();
};

export const websitePictureHeadPlugin = (): Plugin => ({
  name: 'furria-website-picture-head',
  transformIndexHtml: loadHeadTags,
});
