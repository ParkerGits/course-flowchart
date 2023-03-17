import { readFile } from 'fs/promises';
const path = 'src/data/majors/' as const;
const files = { 'Applied Math': 'major1.json', 'Computer Science': 'major2.json' } as const;

type MajorName = keyof typeof files;

export type Term = 'fall' | 'winter' | 'spring';

export type JSONCourse = {
  courseCode: string;
  courseName: string;
  credits: number;
  prereqs: string[];
  terms: Term[];
};

export type Courses = {
  [courseCode: string]: JSONCourse;
};

export type MajorCourses = {
  [key in MajorName]: Courses | null;
};

function isValidJson(json: unknown): json is JSONCourse[] {
  if (!Array.isArray(json)) {
    return false;
  }
  return json.every((course) => {
    if (
      !(
        'courseCode' in course &&
        typeof course.courseCode == 'string' &&
        'prereqs' in course &&
        Array.isArray(course.prereqs)
      )
    ) {
      return false;
    }
    // while validating course, remove spaces from course code and prereqs
    course.courseCode = (course.courseCode as string).split(' ').join('');
    course.prereqs = (course.prereqs as string[]).map((prereq) => prereq.split(' ').join(''));
    return (
      'courseName' in course &&
      typeof course.courseName == 'string' &&
      'credits' in course &&
      typeof course.credits == 'number' &&
      'terms' in course &&
      Array.isArray(course.terms) &&
      course.terms.every((term: string) => term == 'fall' || term == 'winter' || term == 'spring')
    );
  });
}

function jsonToCourses(json: JSONCourse[]): Courses {
  // remove spaces in coursecode
  return Object.fromEntries(json.map((course) => [course.courseCode.split(' ').join(''), course]));
}

export async function readMajors(): Promise<MajorCourses> {
  const majors: [MajorName, Courses | null][] = await Promise.all(
    Object.keys(files).map(async (majorName) => {
      const filepath = path + files[majorName as MajorName];
      try {
        const file = await readFile(filepath, { encoding: 'ascii' });
        const json = JSON.parse(file);
        return [majorName as MajorName, isValidJson(json) ? jsonToCourses(json) : null];
      } catch (error) {
        return [majorName as MajorName, null];
      }
    })
  );
  return Object.fromEntries(majors) as MajorCourses;
}
