import { useState } from 'react';
import { projectsData } from '../../Data/projectsData';
import ProjectCard from '../../Components/ProjectCard/ProjectCard';
import ProjectModal from '../../Components/ProjectModal/ProjectModal';
import './Projects.scss';

function isValidProjectList(data) {
  return Array.isArray(data) && data.length > 0;
}

function isUsableProject(project) {
  return (
    project !== null &&
    typeof project === 'object' &&
    project.id !== undefined &&
    project.id !== null &&
    project.id !== ''
  );
}

function Projects() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const hasData = isValidProjectList(projectsData);
  const usableProjects = hasData
    ? projectsData.filter(isUsableProject)
    : [];

  const handleSelect = (id) => {
    if (id === undefined || id === null || id === '') {
      return;
    }

    const exists = usableProjects.some((project) => project.id === id);
    if (exists) {
      setSelectedProjectId(id);
    } else {
      setSelectedProjectId(null);
    }
  };

  const handleClose = () => {
    setSelectedProjectId(null);
  };

  const handleRetry = () => {
    setSelectedProjectId(null);
    if (typeof window !== 'undefined' && typeof window.location.reload === 'function') {
      window.location.reload();
    }
  };

  let selectedProject = null;
  if (selectedProjectId !== null) {
    const found = usableProjects.find((project) => project.id === selectedProjectId);
    selectedProject = found || null;
  }

  if (!hasData) {
    return (
      <div className="projects-section">
        <div className="projects-error" role="alert">
          <h2 className="projects-error-title">Projects Unavailable</h2>
          <p className="projects-error-message">
            We could not load the project data. The collection is missing or
            malformed. Please try again in a moment.
          </p>
          <button
            type="button"
            className="projects-error-retry"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (usableProjects.length === 0) {
    return (
      <div className="projects-section">
        <div className="projects-empty">
          <h2 className="projects-empty-title">No Projects Yet</h2>
          <p className="projects-empty-message">
            There are no projects to display right now. Check back soon, or
            refresh to retry.
          </p>
          <button
            type="button"
            className="projects-empty-retry"
            onClick={handleRetry}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-section">
      <div className="projects-header">
        <h2 className="projects-title">Selected Projects</h2>
        <p className="projects-subtitle">
          A curated collection of end-to-end builds, from pixel-perfect
          responsive layouts to full-stack applications.
        </p>
      </div>

      <div className="projects-grid">
        {usableProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={handleClose} />
      )}
    </div>
  );
}

export default Projects;
