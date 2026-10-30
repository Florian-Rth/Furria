import { KkHall } from '@furria/ui/KkHall';
import type { FC } from 'react';

interface HeuteCStateBlockProps {
  title: string;
  text: string;
}

export const HeuteCStateBlock: FC<HeuteCStateBlockProps> = ({ title, text }) => (
  <KkHall.Step name={title} meta={null} next={text} />
);
