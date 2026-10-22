import { KkTeleprinter } from '@furria/ui/KkTeleprinter';
import type { FC } from 'react';
import type { LogGroupView } from '../hooks/use-system-log';
import { LOG_EXCEPTION_LABEL } from '../system-copy';

interface SystemLogLineProps {
  line: LogGroupView;
}

export const SystemLogLine: FC<SystemLogLineProps> = ({ line }) => {
  const repeats = line.repeats.map((repeat) => (
    <KkTeleprinter.Line
      key={repeat.key}
      level={repeat.level}
      time={repeat.time}
      source={repeat.source}
      message={repeat.message}
      category={repeat.category}
      exception={repeat.exception}
      exceptionLabel={LOG_EXCEPTION_LABEL}
      highlight={repeat.highlight}
    />
  ));

  return (
    <KkTeleprinter.Line
      level={line.level}
      time={line.time}
      source={line.source}
      message={line.message}
      category={line.category}
      exception={line.exception}
      exceptionLabel={LOG_EXCEPTION_LABEL}
      repeat={line.repeat}
      highlight={line.highlight}
    >
      {repeats}
    </KkTeleprinter.Line>
  );
};
