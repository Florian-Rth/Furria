import { KkWriteScreenRoot } from './internal/layout/KkWriteScreenRoot';
import { KkWriteScreenChain } from './internal/ui/KkWriteScreenChain';
import { KkWriteScreenDanger } from './internal/ui/KkWriteScreenDanger';
import { KkWriteScreenFields } from './internal/ui/KkWriteScreenFields';
import { KkWriteScreenQuiet } from './internal/ui/KkWriteScreenQuiet';

export const KkWriteScreen = Object.assign(KkWriteScreenRoot, {
  Chain: KkWriteScreenChain,
  Fields: KkWriteScreenFields,
  Danger: KkWriteScreenDanger,
  Quiet: KkWriteScreenQuiet,
});
