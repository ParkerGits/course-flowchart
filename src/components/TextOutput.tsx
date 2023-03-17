import { Graph } from '@/models/graph';
import { Term } from '@/utils/readMajors';
import UnconstrainedText from './UnconstrainedText';
import ConstrainedText from './ConstrainedText';

type TextOutputProps = {
  isConstrained: boolean;
  startTerm: Term;
  maxCredits: number;
  graph: Graph | null;
};

export default function TextOutput({ isConstrained, startTerm, maxCredits, graph }: TextOutputProps) {
  if (!graph) return null;
  if (isConstrained) {
    const ordering = graph.constrainedOrdering(startTerm, maxCredits);
    return <ConstrainedText startTerm={startTerm} courseSchedule={ordering.courseSchedule} />;
  }
  const ordering = graph.unconstrainedOrdering();
  return <UnconstrainedText order={ordering.order} />;
}
