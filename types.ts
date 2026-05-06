export type Entry = {
  date: string; // ISO date string
  hoursSpent: string; // e.g. "2:30" for 2 hours 30 minutes
  notes: string;
};

export type Project = {
  id: string;
  name: string;
  entries: Entry[];
};

export type Category = {
  id: string;
  name: string;
  projects: Project[];
};
