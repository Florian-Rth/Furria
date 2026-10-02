export type TextMeter = (text: string) => number;

const unmeasurable: TextMeter = () => Number.POSITIVE_INFINITY;

export const textMeterOf = (element: Element): TextMeter => {
  const style = window.getComputedStyle(element);
  const context = document.createElement('canvas').getContext('2d');
  const tracking = Number.parseFloat(style.letterSpacing);
  const spacing = Number.isNaN(tracking) ? 0 : tracking;

  if (context === null) {
    return unmeasurable;
  }

  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  return (text) => context.measureText(text).width + spacing * Array.from(text).length;
};
