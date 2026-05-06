import { Project, Category } from '../types';

const STORAGE_KEY = 'project-journal-categories';

export function loadCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Category[];
  } catch {
    return [];
  }
}

export function saveCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function exportCategories(): string {
  const categories = loadCategories();
  return JSON.stringify(categories, null, 2);
}

export function importCategories(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    let categories: Category[];

    // Check if it's old format (Project[]) or new (Category[])
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].entries) {
      // Old format: wrap projects in a default category
      categories = [{
        id: 'default',
        name: 'Default',
        projects: parsed as Project[]
      }];
    } else {
      categories = parsed as Category[];
    }

    // Validate the structure
    if (!Array.isArray(categories)) return false;

    for (const category of categories) {
      if (!category.id || !category.name || !Array.isArray(category.projects)) {
        return false;
      }
      for (const project of category.projects) {
        if (!project.id || !project.name || !Array.isArray(project.entries)) {
          return false;
        }
        for (const entry of project.entries) {
          if (!entry.date || typeof entry.hoursSpent !== 'string' || typeof entry.notes !== 'string') {
            return false;
          }
        }
      }
    }

    saveCategories(categories);
    return true;
  } catch {
    return false;
  }
}

// Backward compatibility
export function loadProjects(): Project[] {
  const categories = loadCategories();
  return categories.flatMap(cat => cat.projects);
}

export function saveProjects(projects: Project[]) {
  // For backward compatibility, save as default category
  const defaultCategory: Category = {
    id: 'default',
    name: 'Default',
    projects
  };
  saveCategories([defaultCategory]);
}

export function exportProjects(): string {
  return exportCategories();
}

export function importProjects(jsonData: string): boolean {
  return importCategories(jsonData);
}
