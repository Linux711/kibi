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
