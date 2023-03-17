import { TermColor, termNodeColor } from './../utils/term';
import { DEFAULT_GRAPH_HEIGHT, DEFAULT_NODE_SIZE } from '@/graphConfig';
import { Courses, JSONCourse, Term } from '@/utils/readMajors';
import { nextTerm } from '@/utils/term';

export type Node = { id: string };
export type Link = { source: string; target: string };
type Position = { fx: number; fy: number };
type PositionedNode = Node & Position;
type ColoredPositionedNode = Node & Position & { color: TermColor };

export class Graph {
  // edges.get(course code of node U) === set of neighbors of U
  private edges: Map<string, Set<string>>;
  private topOrder: string[];
  private courseData: Courses;
  private orderingFrames?: PositionedNode[][];
  private courseOrder?: JSONCourse[];

  // Cache constrained frames and course schedule for 15 credits
  private constrainedFrames: { [startTerm in Term]?: ColoredPositionedNode[][] };
  private courseSchedule: { [startTerm in Term]?: JSONCourse[][] };

  constructor(courses: Courses) {
    const edges = new Map<string, Set<string>>();
    for (const courseCode in courses) {
      // remove spaces from course code
      if (!edges.has(courseCode)) {
        edges.set(courseCode, new Set());
      }
      const course = courses[courseCode];

      // for each prereq, add an edge from prereq to current course
      for (const prereq of course.prereqs) {
        if (!edges.has(prereq)) {
          edges.set(prereq, new Set([courseCode]));
        } else {
          edges.get(prereq)!.add(courseCode);
        }
      }
    }

    this.edges = edges;
    this.topOrder = this.topologicalOrdering();
    this.courseData = courses;
    this.courseSchedule = {};
    this.constrainedFrames = {};
  }

  // Generates course schedule and frames for animation
  // Each subsequent frame represents the course schedule with the next term's courses added.
  // the last frame represents the final schedule
  constrainedOrdering(
    startTerm: Term,
    maxCredits: number
  ): { courseSchedule: JSONCourse[][]; frames: ColoredPositionedNode[][] } {
    // restore frames and schedule from cache if already generated
    // cache only stores for 15 credits (default)
    if (this.constrainedFrames[startTerm] && this.courseSchedule[startTerm] && maxCredits == 15) {
      return { courseSchedule: this.courseSchedule[startTerm]!, frames: this.constrainedFrames[startTerm]! };
    }

    // Get data for each course in topological ordering.
    if (!this.courseOrder) {
      this.courseOrder = this.topOrder.map((courseCode) => this.courseData[courseCode]);
    }
    const orderedCourseData = this.courseOrder;

    // Get the # of prereqs remaining for each course
    const prereqsRemaining = Object.fromEntries(
      orderedCourseData.map((data) => [data.courseCode, data.prereqs.length])
    ) as { [courseCode: string]: number };

    // Group courses by term
    const coursesByTerm: { [key in Term]: JSONCourse[] } = { fall: [], winter: [], spring: [] };
    for (const course of orderedCourseData) {
      for (const term of course.terms) {
        coursesByTerm[term].push(course);
      }
    }

    let term: Term = startTerm;
    const courseSchedule: JSONCourse[][] = [];
    const frames: JSONCourse[][][] = [];
    // Every time we add a course to the schedule, we delete the course from the prereqsRemaining map
    // Continue until all courses added to schedule
    while (Object.keys(prereqsRemaining).length > 0) {
      const termCourses: JSONCourse[] = [];
      let creditSum = 0;
      // Greedily add course to courseSchedule if:
      // 1) enough credits remain to take course
      // 2) course has not already been added to schedule
      // 3) course has no more prereqs remaining
      for (const course of coursesByTerm[term]) {
        if (
          creditSum + course.credits <= maxCredits &&
          course.courseCode in prereqsRemaining &&
          prereqsRemaining[course.courseCode] == 0
        ) {
          termCourses.push(course);
          delete prereqsRemaining[course.courseCode];
          creditSum += course.credits;
        }
      }

      // For each successor course of added courses, decrement prereqsRemaining
      for (const course of termCourses) {
        const successors = this.edges.get(course.courseCode)!;
        successors.forEach((successor) => {
          prereqsRemaining[successor]--;
        });
      }

      // Add term's courses to schedule
      courseSchedule.push(termCourses);
      // Add animation frame to frames
      // use spread for a shallow copy of elements
      frames.push([...courseSchedule]);
      // Increment term
      term = nextTerm(term);
    }

    // Turn course schedule frames into frames of formatted nodes
    const formattedFrames = this.formatFrames(frames, startTerm);

    // default max credits is 15, cache results for this value
    if (maxCredits === 15) {
      this.courseSchedule[startTerm] = courseSchedule;
      this.constrainedFrames[startTerm] = formattedFrames;
    }
    return { courseSchedule, frames: formattedFrames };
  }

  private formatFrames(frames: JSONCourse[][][], startTerm: Term): ColoredPositionedNode[][] {
    let term = startTerm;
    const coloredPositionedNodes: ColoredPositionedNode[] = [];
    const nodeFrames: ColoredPositionedNode[][] = [];
    // For each schedule in the scheduleFrames:
    let i = 0;
    for (const scheduleFrame of frames) {
      // For each term in schedule:
      while (i < scheduleFrame.length) {
        const termSchedule = scheduleFrame[i];
        // For each course, create a formatted node:
        for (let j = 0; j < termSchedule.length; j++) {
          const course = termSchedule[j];
          coloredPositionedNodes.push({
            id: course.courseCode,
            fx: 150 * i + DEFAULT_NODE_SIZE / 30,
            fy: (DEFAULT_GRAPH_HEIGHT * 5) / 6 - (DEFAULT_NODE_SIZE / 20) * j,
            color: termNodeColor(term),
          });
        }
        term = nextTerm(term);
        i++;
      }
      // push the nodes for this frame
      // use spread for a shallow copy of elements
      nodeFrames.push([...coloredPositionedNodes]);
    }
    return nodeFrames;
  }

  toString(): string {
    let retStr = '';
    this.edges.forEach((neighbors, node) => {
      retStr += node;
      retStr += ': ';
      neighbors.forEach((neighbor) => {
        retStr += neighbor;
        retStr += ',';
      });
      retStr = retStr.slice(0, retStr.length - 1);
      retStr += '\n';
    });
    return retStr;
  }

  // Generate unpositioned nodes for testing graph
  nodes(): Node[] {
    return Array.from(this.edges.keys()).map((key) => ({ id: key }));
  }

  // Generates topological ordering and frames for animation
  // Each subsequent frame represents the ordering with the next courses added.
  // Can get the static graph from the last frame in returned list
  unconstrainedOrdering(): { order: JSONCourse[]; frames: PositionedNode[][] } {
    if (this.orderingFrames && this.courseOrder) {
      return { order: this.courseOrder, frames: this.orderingFrames };
    }
    const frames: PositionedNode[][] = [];
    const frame: PositionedNode[] = [];
    for (let i = 0; i < this.topOrder.length; i++) {
      const courseNode = {
        id: this.topOrder[i],
        fy: (DEFAULT_GRAPH_HEIGHT * 5) / 6,
        fx: i * 100 + DEFAULT_NODE_SIZE / 30,
      };
      // Add course to frame
      frame.push(courseNode);
      // Add frame to frames
      // use spread for a shallow copy of elements
      frames.push([...frame]);
    }
    if (!this.courseOrder) {
      this.courseOrder = this.topOrder.map((courseCode) => this.courseData[courseCode]);
    }
    return { frames, order: this.courseOrder };
  }

  links(): Link[] {
    const nodes = Array.from(this.edges.entries());
    const ret = [] as Link[];
    for (const node of nodes) {
      const nodeName = node[0];
      const neighbors = node[1];
      neighbors.forEach((neighborName) => {
        ret.push({ source: nodeName, target: neighborName });
      });
    }
    return ret;
  }

  linksFromFrame(frame: Node[]) {
    const nodeSet = new Set(frame.map((frame) => frame.id));
    const ret = [] as Link[];
    for (const node of frame) {
      const nodeName = node.id;
      const neighbors = this.edges.get(nodeName)!;
      neighbors.forEach((neighborName) => {
        if (nodeSet.has(neighborName)) {
          ret.push({ source: nodeName, target: neighborName });
        }
      });
    }
    return ret;
  }

  /**
   * O(m+n) Topological Ordering Algorithm (From DAG chapter in book)
   * Returns Topological Ordering of edges if the graph is a DAG, returns nodes in the cycle otherwise
   * */
  private topologicalOrdering(): string[] {
    if (this.topOrder) return this.topOrder;
    const ordering: string[] = [];
    // incomingActiveEdges[u] gives # of edges incoming from active nodes for node u
    const incomingActiveEdges = new Map<string, number>();
    // set of nodes with no incoming edges
    const noIncomingEdges = new Set<string>();

    // initialize incomingActiveEdges for each node
    this.edges.forEach((neighbors) => {
      neighbors.forEach((neighbor) => {
        if (!incomingActiveEdges.has(neighbor)) incomingActiveEdges.set(neighbor, 1);
        else incomingActiveEdges.set(neighbor, incomingActiveEdges.get(neighbor)! + 1);
      });
    });

    this.edges.forEach((_, node) => {
      // incomingActiveEdges does not contain node as key iff node has no incoming edges
      if (!incomingActiveEdges.has(node)) {
        incomingActiveEdges.set(node, 0);
        noIncomingEdges.add(node);
      }
    });

    while (noIncomingEdges.size > 0) {
      noIncomingEdges.forEach((node) => {
        const neighbors = this.edges.get(node)!;
        neighbors.forEach((neighbor) => {
          incomingActiveEdges.set(neighbor, incomingActiveEdges.get(neighbor)! - 1);
          // add neighbor to noIncomingEdges if neighbor no longer has incoming edges
          if (incomingActiveEdges.get(neighbor)! === 0) {
            noIncomingEdges.add(neighbor);
          }
        });
        noIncomingEdges.delete(node);
        ordering.push(node);
      });
    }

    // all nodes that still have incoming edges are part of a cycle
    const cycle: string[] = [];
    incomingActiveEdges.forEach((incomingEdges, node) => {
      if (incomingEdges > 0) {
        cycle.push(node);
      }
    });

    // if any nodes part of a cycle, not a dag
    if (cycle.length > 0) {
      throw new Error('Input graph is not a DAG');
    }

    return ordering;
  }
}
