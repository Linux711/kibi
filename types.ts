export type Entry = {
  date: string; // ISO date string
  hoursSpent: number;
  notes: string;
};

export type Project = {
  id: string;
  name: string;
  entries: Entry[];
};
