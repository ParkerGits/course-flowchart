import { Term } from './readMajors';

export type TermColor = 'orange' | 'lightblue' | 'lightgreen';

export function nextTerm(term: Term): Term {
  if (term === 'fall') return 'winter';
  if (term === 'winter') return 'spring';
  return 'fall';
}

export function termNodeColor(term: Term): TermColor {
  if (term === 'fall') return 'orange';
  if (term === 'winter') return 'lightblue';
  return 'lightgreen';
}

export function termBorderColor(term: Term): 'border-orange-400' | 'border-blue-200' | 'border-green-300' {
  if (term === 'fall') return 'border-orange-400';
  if (term === 'winter') return 'border-blue-200';
  return 'border-green-300';
}
