import type { SlideProps } from '@mui/material/Slide';
import Slide from '@mui/material/Slide';
import type { FC } from 'react';

export const KkSheetRise: FC<SlideProps> = (props) => <Slide {...props} direction="up" />;
