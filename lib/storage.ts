import { Project } from '../types';

const STORAGE_KEY = 'project-journal-projects';

export function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Project[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function exportProjects(): string {
  const projects = loadProjects();
  return JSON.stringify(projects, null, 2);
}

export function importProjects(jsonData: string): boolean {
  try {
    const projects = JSON.parse(jsonData) as Project[];
    // Validate the structure
    if (!Array.isArray(projects)) return false;

    for (const project of projects) {
      if (!project.id || !project.name || !Array.isArray(project.entries)) {
        return false;
      }
      for (const entry of project.entries) {
        if (!entry.date || typeof entry.hoursSpent !== 'number' || !entry.notes) {
          return false;
        }
      }
    }

    saveProjects(projects);
    return true;
  } catch {
    return false;
  }
}
