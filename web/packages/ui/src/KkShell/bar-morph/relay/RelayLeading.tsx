import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useRef } from 'react';
import type { KkBarMorphLeadingProps } from '../../bar-morph';
import { KkShellBarLeading } from '../../internal/ui/KkShellBarLeading';
import { useRelay } from './use-relay';

export const RelayLeading: FC<KkBarMorphLeadingProps> = ({ scene }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { kind, lead, title, origin } = scene.current;
  const settledOrigin = origin ?? undefined;

  useRelay(scene, wrapperRef);

  return (
    <Stack ref={wrapperRef} direction="row" data-kk-relay-leading sx={{ minWidth: 0 }}>
      <KkShellBarLeading kind={kind} lead={lead} title={title} origin={settledOrigin} />
    </Stack>
  );
};
