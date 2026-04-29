import { Project } from '../types';

export function getLastUpdated(project: Project): string {
  if (!project.entries.length) return 'Never';
  const last = project.entries.reduce((a, b) => (a.date > b.date ? a : b));
  return new Date(last.date).toLocaleDateString();
}
