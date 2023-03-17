import { GraphConfiguration } from 'react-d3-graph';
import { Link, Node } from './models/graph';

export const DEFAULT_GRAPH_HEIGHT = 500;
export const DEFAULT_NODE_SIZE = 1200;

export const getGraphConfig = (width: number): Partial<GraphConfiguration<Node, Link>> | undefined => ({
  directed: true,
  d3: {
    disableLinkForce: true,
  },
  node: {
    fontSize: 16,
    highlightFontSize: 16,
    size: DEFAULT_NODE_SIZE,
    labelPosition: 'center',
  },
  link: {
    type: 'CURVE_SMOOTH',
    strokeWidth: 3,
  },
  width,
  height: DEFAULT_GRAPH_HEIGHT,
  staticGraph: true,
  nodeHighlightBehavior: true,
  highlightOpacity: 0.3,
});
