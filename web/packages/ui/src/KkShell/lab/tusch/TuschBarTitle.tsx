import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { TuschTitleText } from './TuschTitleText';
import type { TuschValues } from './use-tusch-values';

const LAYER_STYLE: CSSProperties = { gridArea: '1 / 1', minWidth: 0 };

interface TuschBarTitleProps {
  text: string;
  values: TuschValues;
}

export const TuschBarTitle: FC<TuschBarTitleProps> = ({ text, values }) => {
  const inkStyle = {
    ...LAYER_STYLE,
    x: values.inkOffset,
    y: values.inkOffset,
    opacity: values.inkOpacity,
  };
  const flashStyle = { ...LAYER_STYLE, opacity: values.flashOpacity };

  return (
    <Box sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <motion.span style={inkStyle}>
        <TuschTitleText tone="ink">{text}</TuschTitleText>
      </motion.span>
      <span style={LAYER_STYLE}>
        <TuschTitleText tone="print">{text}</TuschTitleText>
      </span>
      <motion.span style={flashStyle}>
        <TuschTitleText tone="flash">{text}</TuschTitleText>
      </motion.span>
    </Box>
  );
};
