import { KkHelpHint } from './internal/layout/KkHelpHint';
import { KkHelpRoot } from './internal/layout/KkHelpRoot';
import { KkHelpPreview } from './internal/ui/KkHelpPreview';
import { KkHelpShow } from './internal/ui/KkHelpShow';
import { KkHelpText } from './internal/ui/KkHelpText';
import { KkHelpTitle } from './internal/ui/KkHelpTitle';

export const KkHelp = Object.assign(KkHelpRoot, {
  Hint: KkHelpHint,
  Preview: KkHelpPreview,
  Title: KkHelpTitle,
  Text: KkHelpText,
  Show: KkHelpShow,
});
