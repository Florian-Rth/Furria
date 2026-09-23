import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC, Ref } from 'react';
import { createPortal } from 'react-dom';
import type { TuschStaging } from './measure-tusch';
import { TuschHeadlineText } from './TuschHeadlineText';
import type { TuschValues } from './use-tusch-values';

const SHADOW_STYLE: CSSProperties = { position: 'absolute', inset: 0, zIndex: -1 };

interface TuschStampCopyProps {
  copyRef: Ref<HTMLDivElement>;
  staging: TuschStaging | null;
  titleText: string;
  values: TuschValues;
}

export const TuschStampCopy: FC<TuschStampCopyProps> = ({
  copyRef,
  staging,
  titleText,
  values,
}) => {
  const text = staging?.headlineText ?? titleText;
  const width = staging?.headlineWidth ?? null;
  const copyStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: width ?? 'auto',
    x: values.copyX,
    y: values.copyY,
    scale: values.copyScale,
    opacity: values.copyOpacity,
    originX: 0,
    originY: 0,
    willChange: 'transform',
  };
  const shadowStyle = {
    ...SHADOW_STYLE,
    x: values.copyShadowX,
    y: values.copyShadowY,
    opacity: values.copyShadowOpacity,
  };

  return createPortal(
    <Box
      aria-hidden
      data-tusch-copy
      sx={(theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: theme.zIndex.appBar + 1,
        pointerEvents: 'none',
      })}
    >
      <motion.div ref={copyRef} style={copyStyle}>
        <motion.span style={shadowStyle}>
          <TuschHeadlineText tone="shadow" nowrap={width === null}>
            {text}
          </TuschHeadlineText>
        </motion.span>
        <TuschHeadlineText tone="print" nowrap={width === null}>
          {text}
        </TuschHeadlineText>
      </motion.div>
    </Box>,
    document.body,
  );
};
