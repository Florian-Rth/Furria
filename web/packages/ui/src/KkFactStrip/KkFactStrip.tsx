import { KkFactStripRoot } from './internal/layout/KkFactStripRoot';
import { KkFactStripFact } from './internal/ui/KkFactStripFact';

export const KkFactStrip = Object.assign(KkFactStripRoot, {
  Fact: KkFactStripFact,
});
