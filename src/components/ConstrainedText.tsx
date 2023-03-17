import { JSONCourse, Term } from '@/utils/readMajors';
import { nextTerm, termBorderColor } from '@/utils/term';

export default function ConstrainedText({
  courseSchedule,
  startTerm,
}: {
  courseSchedule: JSONCourse[][];
  startTerm: Term;
}) {
  console.log('Constrained Course Schedule:', JSON.stringify(courseSchedule));
  // prime term so that nextTerm returns startTerm
  let term = nextTerm(nextTerm(startTerm));
  let year = term === 'spring' ? 0 : 1;
  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="py-2 text-xl font-semibold">Constrained Course Schedule</h1>
      <div
        className={`w-full grid grid-cols-4`}
        style={{ gridTemplateColumns: `repeat(${courseSchedule.length},minmax(0, 1fr))` }}
      >
        {courseSchedule.map((termSchedule) => {
          term = nextTerm(term);
          if (term === 'fall') {
            year++;
          }
          return (
            <>
              <div
                className={`col-span-1 flex flex-col border-2 ${termBorderColor(term)}`}
                key={termSchedule.toString()}
              >
                <h1 className="border-b-2 font-medium text-center">
                  {term.toUpperCase()} YEAR {year}
                </h1>
                {termSchedule.map((course) => (
                  <>
                    <h1 className="border-b-2 " key={course.courseCode}>
                      {course.courseName}
                    </h1>
                  </>
                ))}
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
