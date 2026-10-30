import useMediaQuery from '@mui/material/useMediaQuery';
import { KK_STUDIO_I_WIDE_MEDIA, KK_STUDIO_I_WIDE_SHORT_MEDIA } from './studio-i-editor-query';

export type KkStudioILayout = 'narrow' | 'wide' | 'wideShort';

export const useKkStudioILayout = (): KkStudioILayout => {
  const wide = useMediaQuery(KK_STUDIO_I_WIDE_MEDIA, { noSsr: true });
  const short = useMediaQuery(KK_STUDIO_I_WIDE_SHORT_MEDIA, { noSsr: true });

  if (!wide) {
    return 'narrow';
  }

  return short ? 'wideShort' : 'wide';
};
