import ProjectNode from './ProjectNode'
import { projectData } from '../../data/projectData'

export default function ProjectNodes() {
  return (
    <group>
      {projectData.map((project) => (
        <ProjectNode key={project.id} project={project} />
      ))}
    </group>
  )
}
