import { MajorCourses, Term, readMajors } from '@/utils/readMajors'
import { useMemo, useState } from 'react'
import Options from '@/components/Options'
import MajorGraph from '@/components/MajorGraph'
import Heading from '@/components/Heading'
import GraphInfo from '@/components/GraphInfo'
import { Graph } from '@/models/graph'
import TextOutput from '@/components/TextOutput'

export const DEFAULT_MAX_CREDITS = 15

type MajorGraphs = {
	[key in keyof MajorCourses]: Graph | null
}

function constructMajorGraphs(majorCourses: MajorCourses): MajorGraphs {
	return Object.fromEntries(
		Object.entries(majorCourses).map((major) => {
			const majorName = major[0]
			const courses = major[1]
			if (!courses) return [majorName, null]
			try {
				// constructor throws if not a DAG
				return [majorName, new Graph(courses)]
			} catch (error) {
				return [majorName, null]
			}
		}),
	) as MajorGraphs
}

export default function Home({ majorCourses }: { majorCourses: MajorCourses }) {
	const majors = Object.keys(majorCourses) as (keyof MajorCourses)[]
	const [selectedMajor, setSelectedMajor] = useState<keyof MajorCourses>(
		majors[1],
	)
	const [isConstrained, setIsConstrained] = useState<boolean>(false)
	const [maxCredits, setMaxCredits] = useState<number>(DEFAULT_MAX_CREDITS)
	const [startTerm, setStartTerm] = useState<Term>('fall')
	const [graphWidth, setGraphWidth] = useState<number>(800)
	const [isAnimating, setIsAnimating] = useState<boolean>(false)
	const graphs: MajorGraphs = useMemo(
		() => constructMajorGraphs(majorCourses),
		[majorCourses],
	)
	const graph = graphs[selectedMajor]
	return (
		<div className="w-screen min-w-fit">
			<Heading />
			<GraphInfo setGraphWidth={setGraphWidth} />
			{!isAnimating && (
				<Options
					selectedMajor={selectedMajor}
					setSelectedMajor={setSelectedMajor}
					majorCourses={majorCourses}
					isConstrained={isConstrained}
					setIsConstrained={setIsConstrained}
					maxCredits={maxCredits}
					setMaxCredits={setMaxCredits}
					startTerm={startTerm}
					setStartTerm={setStartTerm}
				/>
			)}
			<MajorGraph
				selectedMajor={selectedMajor}
				graph={graph}
				isConstrained={isConstrained}
				maxCredits={maxCredits}
				startTerm={startTerm}
				graphWidth={graphWidth}
				isAnimating={isAnimating}
				setIsAnimating={setIsAnimating}
			/>

			<TextOutput
				graph={graph}
				isConstrained={isConstrained}
				startTerm={startTerm}
				maxCredits={maxCredits}
			/>
		</div>
	)
}

export async function getStaticProps() {
	const majorCourses = await readMajors()
	return {
		props: {
			majorCourses,
		},
	}
}
