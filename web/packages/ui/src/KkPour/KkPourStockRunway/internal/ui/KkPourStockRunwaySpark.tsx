import Box from '@mui/material/Box';
import type { FC } from 'react';
import { usePlotBox } from '../../../KkPourStockChart/internal/logic/use-plot-box';
import type { KkPourStockModel } from '../../../pour-stock-chart';
import { stockCurvePlotOf } from '../../../pour-stock-trend';

interface KkPourStockRunwaySparkProps {
  model: KkPourStockModel;
  svgId: string;
  inset: number;
  dot: number;
  maxGlideDays: number;
}

export const KkPourStockRunwaySpark: FC<KkPourStockRunwaySparkProps> = ({
  model,
  svgId,
  inset,
  dot,
  maxGlideDays,
}) => {
  const box = usePlotBox();
  const plot =
    box.size === null ? null : stockCurvePlotOf(model, { ...box.size, inset }, maxGlideDays);
  const fill = `url(#${svgId})`;
  const viewBox = box.size === null ? '' : `0 0 ${box.size.width} ${box.size.height}`;
  const svg =
    box.size === null || plot === null ? null : (
      <svg
        aria-hidden="true"
        data-runway-svg
        width={box.size.width}
        height={box.size.height}
        viewBox={viewBox}
      >
        <defs>
          <linearGradient id={svgId} data-runway-fade x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" />
            <stop offset="1" />
          </linearGradient>
        </defs>
        <path data-runway-area d={plot.area} fill={fill} />
        <path data-runway-line d={plot.line} />
        <circle data-runway-now cx={plot.now.x} cy={plot.now.y} r={dot} />
      </svg>
    );

  return (
    <Box ref={box.ref} data-runway-spark>
      {svg}
    </Box>
  );
};
