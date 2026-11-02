import type { Patch } from 'immer';
import { applyPatches, enablePatches } from 'immer';
import type { StudioDocument } from './studio-document';

enablePatches();

const childOf = (parent: object, key: string | number): object | null => {
  if (!Object.hasOwn(parent, key)) {
    return null;
  }

  const child: object | null = Reflect.get(parent, key);

  return typeof child === 'object' ? child : null;
};

const parentOf = (document: StudioDocument, path: Patch['path']): object | null =>
  path
    .slice(0, -1)
    .reduce<object | null>((node, key) => (node === null ? null : childOf(node, key)), document);

const patchFits = (document: StudioDocument, patch: Patch): boolean => {
  const parent = parentOf(document, patch.path);
  const key = patch.path.at(-1);

  if (parent === null || key === undefined) {
    return false;
  }

  return patch.op === 'add' || Object.hasOwn(parent, key);
};

export interface PatchedDocument {
  document: StudioDocument;
  skipped: number;
}

export const patchedWhereFitting = (
  document: StudioDocument,
  patches: readonly Patch[],
): PatchedDocument => {
  let patched = document;
  let skipped = 0;

  for (const patch of patches) {
    if (patchFits(patched, patch)) {
      patched = applyPatches(patched, [patch]);
    } else {
      skipped += 1;
    }
  }

  return { document: patched, skipped };
};

export const patchedIfAllFit = (
  document: StudioDocument,
  patches: readonly Patch[],
): StudioDocument | null => {
  const patched = patchedWhereFitting(document, patches);

  return patched.skipped === 0 ? patched.document : null;
};
