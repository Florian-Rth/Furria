import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite';
import { runnerImport } from 'vite';

type PrerenderedFilesModule = typeof import('../src/lib/seo/prerendered-files');

const PRERENDERED_FILES_MODULE = fileURLToPath(
  new URL('../src/lib/seo/prerendered-files.ts', import.meta.url),
);

const INDEX_HTML = 'index.html';

export const prerenderedPagesPlugin = (): Plugin => ({
  name: 'furria-prerendered-pages',
  apply: 'build',
  enforce: 'post',
  async generateBundle(_, bundle) {
    const indexHtml = bundle[INDEX_HTML];

    if (indexHtml === undefined || indexHtml.type !== 'asset') {
      throw new Error('The build emitted no index.html to prerender pages from.');
    }

    const { module } = await runnerImport<PrerenderedFilesModule>(PRERENDERED_FILES_MODULE, {
      configFile: false,
    });

    for (const file of module.prerenderedFiles(String(indexHtml.source))) {
      if (file.fileName === INDEX_HTML) {
        indexHtml.source = file.source;
      } else {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source });
      }
    }
  },
});
