import { MajorCourses, Term } from '@/utils/readMajors';
import { Dispatch, SetStateAction } from 'react';

type OptionsProps = {
  selectedMajor: keyof MajorCourses;
  setSelectedMajor: Dispatch<SetStateAction<keyof MajorCourses>>;
  majorCourses: MajorCourses;
  isConstrained: boolean;
  setIsConstrained: Dispatch<SetStateAction<boolean>>;
  maxCredits: number;
  setMaxCredits: Dispatch<SetStateAction<number>>;
  startTerm: Term;
  setStartTerm: Dispatch<SetStateAction<Term>>;
};

export default function Options({
  selectedMajor,
  setSelectedMajor,
  majorCourses,
  isConstrained,
  setIsConstrained,
  maxCredits,
  setMaxCredits,
  startTerm,
  setStartTerm,
}: OptionsProps) {
  return (
    <div className="w-full flex flex-col align-middle justify-center pb-3 gap-2">
      <div className="w-full flex align-middle justify-center gap-12">
        <label>
          Select a major:
          <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value as keyof MajorCourses)}>
            {Object.keys(majorCourses).map((major) => (
              <option value={major} key={major}>
                {major}
              </option>
            ))}
          </select>
        </label>
        <label>
          Add Contraints?
          <input type="checkbox" checked={isConstrained} onChange={() => setIsConstrained(!isConstrained)} />
        </label>
      </div>
      <div className="w-full flex align-middle justify-center gap-12">
        {isConstrained && (
          <>
            <label>
              Max Quarterly Credits
              <input
                type="number"
                min={10}
                max={25}
                value={maxCredits}
                onChange={(e) => setMaxCredits(parseInt(e.target.value))}
              />
            </label>
            <label>
              Starting Quarter
              <select value={startTerm} onChange={(e) => setStartTerm(e.target.value as Term)}>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
              </select>
            </label>
          </>
        )}
      </div>
      {isConstrained && (
        <div className="w-full flex justify-center gap-3">
          <p className="bg-orange-400 px-1">fall</p>
          <p className="bg-blue-200 px-1">winter</p>
          <p className="bg-green-300 px-1">spring</p>
        </div>
      )}
    </div>
  );
}
