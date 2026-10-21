import type { FC } from 'react';
import { useStartHead } from '../hooks/use-start-head';
import { StartHead } from './StartHead';

interface MemberHeadProps {
  onPress: () => void;
}

export const MemberHead: FC<MemberHeadProps> = ({ onPress }) => {
  const view = useStartHead();

  return <StartHead view={view} onPress={onPress} />;
};
