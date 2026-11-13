export const textBlocksOf = (text: string): string[] =>
  text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

export const isChangedBlock = (blockText: string, liveBlocks: ReadonlySet<string>): boolean => {
  const block = blockText.trim();
  return block.length > 0 && !liveBlocks.has(block);
};
