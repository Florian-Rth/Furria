export const headContent = (selector: string, attribute: string): string | null =>
  document.querySelector(selector)?.getAttribute(attribute) ?? null;
