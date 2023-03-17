import { getGraphConfig } from '@/graphConfig';
import { Graph, Node } from '@/models/graph';
import { MajorCourses, Term } from '@/utils/readMajors';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Graph as GraphComponent } from 'react-d3-graph';

type MajorGraphProps = {
  graph: Graph | null;
  selectedMajor: keyof MajorCourses;
  isConstrained: boolean;
  maxCredits: number;
  startTerm: Term;
  graphWidth: number;
  isAnimating: boolean;
  setIsAnimating: Dispatch<SetStateAction<boolean>>;
};

export default function MajorGraph({
  graph,
  selectedMajor,
  isConstrained,
  maxCredits,
  startTerm,
  graphWidth,
  isAnimating,
  setIsAnimating,
}: MajorGraphProps) {
  if (!graph) return null;
  const ordering = isConstrained ? graph.constrainedOrdering(startTerm, maxCredits) : graph.unconstrainedOrdering();
  return (
    <div className="flex flex-col w-full items-center">
      <AnimatedGraph
        graph={graph}
        nodeFrames={ordering.frames}
        selectedMajor={selectedMajor}
        isConstrained={isConstrained}
        graphWidth={graphWidth}
        key={ordering.frames.toString()}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
      />
    </div>
  );
}

function AnimatedGraph({
  graph,
  nodeFrames,
  selectedMajor,
  isConstrained,
  graphWidth,
  isAnimating,
  setIsAnimating,
}: { graph: Graph; nodeFrames: Node[][] } & Pick<
  MajorGraphProps,
  'graphWidth' | 'isConstrained' | 'selectedMajor' | 'isAnimating' | 'setIsAnimating'
>) {
  const numFrames = nodeFrames.length;
  // Handle animation frame state
  const [animationFrame, setAnimationFrame] = useState<number>(nodeFrames.length - 1);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleAnimateClick = () => {
    if (isAnimating && timeoutId) {
      // We are already animating. Stop the animation.
      setAnimationFrame(numFrames - 1);
      clearTimeout(timeoutId);
      setTimeoutId(null);
      setIsAnimating(false);
      return;
    }
    setAnimationFrame(0);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (isAnimating && animationFrame < numFrames - 1) {
      // While animating and not on last frame, schedule an increment to the animation
      const timeout = setTimeout(() => {
        setAnimationFrame(animationFrame + 1);
      }, 400);
      setTimeoutId(timeout);
    } else if (isAnimating && animationFrame == numFrames - 1) {
      // Stop animating on the last frame
      setIsAnimating(false);
    }
  }, [animationFrame, numFrames, isAnimating]);

  // Prevents an error rerender if nodeFrames change from larger graph to smaller graph
  if (animationFrame > nodeFrames.length) return null;

  const nodeFrame = nodeFrames[animationFrame];
  const data = {
    nodes: nodeFrame,
    links: graph.linksFromFrame(nodeFrame),
  };
  return (
    <div className="flex flex-col justify-center gap-2">
      <div className="flex justify-center border-2 cursor-grab">
        <GraphComponent
          id={`graph-${selectedMajor}${isConstrained ? '-constrained' : ''}`}
          data={data}
          config={getGraphConfig(graphWidth)}
        />
      </div>
      <div className="w-full flex flex-col items-center gap-1">
        <button onClick={handleAnimateClick} className="border-2 w-[30%]">
          {isAnimating ? 'Stop Animating' : 'Animate'}
        </button>
      </div>
    </div>
  );
}
