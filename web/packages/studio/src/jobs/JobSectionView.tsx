import { JobChoicesSection } from '@furria/studio/JobChoicesSection';
import { JobCompassSection } from '@furria/studio/JobCompassSection';
import { JobCopySection } from '@furria/studio/JobCopySection';
import { JobFieldsSection } from '@furria/studio/JobFieldsSection';
import { JobSpotsSection } from '@furria/studio/JobSpotsSection';
import { JobSwitchSection } from '@furria/studio/JobSwitchSection';
import { JobToolsSection } from '@furria/studio/JobToolsSection';
import type { JobSection } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC } from 'react';

interface JobSectionViewProps {
  owner: string;
  section: JobSection;
}

export const JobSectionView: FC<JobSectionViewProps> = ({ owner, section }) => {
  switch (section.kind) {
    case 'tools':
      return (
        <JobToolsSection
          label={section.title ?? owner}
          title={section.title}
          aside={section.aside}
          actions={section.actions}
        />
      );
    case 'fields':
      return <JobFieldsSection title={section.title} fields={section.fields} />;
    case 'choices':
      return (
        <JobChoicesSection title={section.title} aside={section.aside} choices={section.choices} />
      );
    case 'copy':
      return <JobCopySection title={section.title} pick={section.pick} />;
    case 'switch':
      return (
        <JobSwitchSection
          title={section.title}
          label={section.label}
          checked={section.checked}
          onChange={section.change}
        />
      );
    case 'spots':
      return <JobSpotsSection title={section.title} aside={section.aside} rows={section.rows} />;
    case 'compass':
      return (
        <JobCompassSection title={section.title} aside={section.aside} compass={section.compass} />
      );
    case 'note':
      return <KkJobPanel.Note text={section.text} />;
  }
};
