import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { FanfareTitleText } from './FanfareTitleText';
import type { FanfareValues } from './use-fanfare-values';

const LAYER_STYLE: CSSProperties = { gridArea: '1 / 1', minWidth: 0 };

interface FanfareBarTitleProps {
  text: string;
  values: FanfareValues;
}

export const FanfareBarTitle: FC<FanfareBarTitleProps> = ({ text, values }) => {
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
        <FanfareTitleText tone="ink">{text}</FanfareTitleText>
      </motion.span>
      <span style={LAYER_STYLE}>
        <FanfareTitleText tone="print">{text}</FanfareTitleText>
      </span>
      <motion.span style={flashStyle}>
        <FanfareTitleText tone="flash">{text}</FanfareTitleText>
      </motion.span>
    </Box>
  );
};
