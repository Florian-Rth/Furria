import { KkWriteScreenRoot } from './internal/layout/KkWriteScreenRoot';
import { KkWriteScreenChain } from './internal/ui/KkWriteScreenChain';
import { KkWriteScreenDanger } from './internal/ui/KkWriteScreenDanger';
import { KkWriteScreenFields } from './internal/ui/KkWriteScreenFields';

export const KkWriteScreen = Object.assign(KkWriteScreenRoot, {
  Chain: KkWriteScreenChain,
  Fields: KkWriteScreenFields,
  Danger: KkWriteScreenDanger,
});
