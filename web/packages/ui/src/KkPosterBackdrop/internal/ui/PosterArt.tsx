import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { artFrame, artLand } from '../art-paint';
import type { PosterArtRequest } from '../logic/use-poster-art';
import { usePosterArt } from '../logic/use-poster-art';
import type { PlateLanding } from '../plate-paint';
import { PosterPlate } from './PosterPlate';

interface PosterArtProps extends PosterArtRequest {
  landing: PlateLanding;
}

export const PosterArt: FC<PosterArtProps> = ({ landing, ...request }) => {
  const art = usePosterArt(request);
  const drift = { y: art.parallax };
  const plates = art.plates.map((inking) => (
    <PosterPlate key={inking.plate} inking={inking} placements={art.placements} landing={landing} />
  ));

  return (
    <Box aria-hidden sx={artFrame}>
      <Box component={motion.div} style={drift} sx={artLand}>
        {plates}
      </Box>
    </Box>
  );
};
