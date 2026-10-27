import { useState, useEffect, useRef, useCallback } from 'react';
import { projectsData } from '../../Data/projectsData';
import ProjectCard from '../../Components/ProjectCard/ProjectCard';
import ProjectModal from '../../Components/ProjectModal/ProjectModal';
import './Projects.scss';

/**
 * Validates that an incoming dataset is an array containing at least one item.
 *
 * @param {unknown} data - Candidate projects collection.
 * @returns {boolean} True if data is a non-empty array.
 */
function isValidProjectList(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Defensive schema validator for an individual project entity.
 * Guarantees that the project object exists and provides an identifiable key.
 *
 * @param {unknown} project - Candidate item.
 * @returns {boolean} True if the entity is an object with an assigned id.
 */
function isUsableProject(project) {
  return (
    project !== null &&
    typeof project === 'object' &&
    project.id !== undefined &&
    project.id !== null &&
    project.id !== ''
  );
}

/**
 * Projects Section Component
 *
 * ARCHITECTURE:
 *  - Displays projects in a compact 2-card carousel (1 on mobile) with true infinite looping.
 *  - Slides 1 card per click using circular index wrapping.
 *  - Supports keyboard navigation (ArrowLeft / ArrowRight), touch swipes, and dots.
 *  - Fully defensive against SSR hydration and memory leaks.
 */
function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // References for touch gesture coordinates and resize debouncing
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const resizeTimerRef = useRef(null);

  // Validate incoming dataset
  const hasData = isValidProjectList(projectsData);
  const usableProjects = hasData
    ? projectsData.filter(isUsableProject)
    : [];

  const totalProjects = usableProjects.length;

  /**
   * Screen size listener to toggle between 2-card desktop and 1-card mobile views.
   */
  useEffect(() => {
    const checkViewport = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkViewport();

    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(() => {
        checkViewport();
      }, 150);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive: true });
    }

    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  /**
   * Infinite Loop Handlers (Circular Modulo Wrapping)
   */
  const handlePrev = useCallback(() => {
    if (totalProjects <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalProjects) % totalProjects);
  }, [totalProjects]);

  const handleNext = useCallback(() => {
    if (totalProjects <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalProjects);
  }, [totalProjects]);

  const handleGoTo = useCallback((index) => {
    if (typeof index === 'number' && index >= 0 && index < totalProjects) {
      setCurrentIndex(index);
    }
  }, [totalProjects]);

  /**
   * Modal Selection Handlers
   */
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

  /**
   * Safe Environment Fallback for Page Reload
   */
  const handleRetry = () => {
    setSelectedProjectId(null);
    if (typeof window !== 'undefined' && typeof window.location.reload === 'function') {
      try {
        window.location.reload();
      } catch {
        // Non-blocking fallback
      }
    }
  };

  /**
   * Keyboard Arrow Navigation
   */
  const handleKeyDown = (event) => {
    if (totalProjects <= 1) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  };

  /**
   * Touch Gesture Navigation (Mobile Swipe Support)
   */
  const handleTouchStart = (event) => {
    if (event.touches && event.touches[0]) {
      touchStartXRef.current = event.touches[0].clientX;
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches && event.touches[0]) {
      touchEndXRef.current = event.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (touchEndXRef.current !== 0) {
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }

    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  /**
   * Active Modal Entity Resolution
   */
  let selectedProject = null;
  if (selectedProjectId !== null) {
    const found = usableProjects.find((project) => project.id === selectedProjectId);
    selectedProject = found || null;
  }

  // Error boundary render state
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

  // Empty data render state
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

  /**
   * Compute Currently Visible Cards for Infinite Loop:
   * Desktop renders 2 cards [currentIndex, (currentIndex + 1) % totalProjects].
   * Mobile renders 1 card [currentIndex].
   */
  const visibleCards = [];
  if (totalProjects > 0) {
    visibleCards.push(usableProjects[currentIndex]);
    if (!isMobile && totalProjects > 1) {
      const nextIndex = (currentIndex + 1) % totalProjects;
      visibleCards.push(usableProjects[nextIndex]);
    }
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

      <div
        className="projects-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Highlighted Projects Carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          className="projects-carousel-btn projects-carousel-btn--prev"
          onClick={handlePrev}
          aria-label="Previous project"
        >
          &#x2190;
        </button>

        <div className="projects-carousel-viewport">
          <div className="projects-carousel-grid">
            {visibleCards.map((project, idx) => (
              <div
                key={`${project.id}-${idx}`}
                className="projects-carousel-slot"
              >
                <ProjectCard
                  project={project}
                  onSelect={handleSelect}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="projects-carousel-btn projects-carousel-btn--next"
          onClick={handleNext}
          aria-label="Next project"
        >
          &#x2192;
        </button>
      </div>

      <div
        className="projects-carousel-dots"
        role="tablist"
        aria-label="Project slides"
      >
        {usableProjects.map((project, index) => (
          <button
            key={`dot-${project.id}`}
            type="button"
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to project ${index + 1}: ${project.title || 'Project'}`}
            className={`projects-carousel-dot ${
              index === currentIndex ? 'projects-carousel-dot--active' : ''
            }`}
            onClick={() => handleGoTo(index)}
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