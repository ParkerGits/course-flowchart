import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

type GraphInfoProps = {
  setGraphWidth: Dispatch<SetStateAction<number>>;
};

const widths = {
  sm: 600,
  md: 800,
  lg: 1280,
  full: 1860,
} as const;

export default function GraphInfo({ setGraphWidth }: GraphInfoProps) {
  const [width, setWidth] = useState<keyof typeof widths>('md');
  const onWidthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newWidth = e.target.value as keyof typeof widths;
    setWidth(newWidth);
    setGraphWidth(widths[newWidth]);
  };
  return (
    <div className="w-full flex flex-col align-center pt-1 pb-3">
      <h2 className="text-center text-lg">
        Pan through the flowchart with your mouse! Hover nodes to view successors in course sequence.
      </h2>
      <div className="w-full flex justify-center">
        <label>
          Graph Size:
          <select value={width} onChange={onWidthChange}>
            <option value={'sm'}>Small</option>
            <option value={'md'}>Medium</option>
            <option value={'lg'}>Large</option>
            <option value={'full'}>Full</option>
          </select>
        </label>
      </div>
    </div>
  );
}
