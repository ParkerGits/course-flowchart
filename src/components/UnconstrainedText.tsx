import { JSONCourse } from '@/utils/readMajors';

export default function UnconstrainedText({ order }: { order: JSONCourse[] }) {
  console.log('Unconstrained Course Order:', JSON.stringify(order));
  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="py-2 text-xl font-semibold">Unconstrained Course Ordering</h1>
      <ol className="list-decimal">
        {order.map((course) => (
          <li key={course.courseCode}>{course.courseName}</li>
        ))}
      </ol>
    </div>
  );
}
