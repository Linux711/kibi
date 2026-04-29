"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Project, Entry } from '../../../types';
import { loadProjects, saveProjects } from '../../../lib/storage';
import EntryItem from '../../../components/EntryItem';
import AddEntryForm from '../../../components/AddEntryForm';
import Link from "next/link";

export default function ProjectPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
  setProject(loaded.find((p: Project) => p.id === id) || null);
  }, [id]);

  function handleAdd(hours: number, notes: string) {
    if (!project) return;
    const today = new Date().toISOString().slice(0, 10);
    const newEntry: Entry = { date: today, hoursSpent: hours, notes };
    const updatedProject = {
      ...project,
      entries: [{ ...newEntry }, ...project.entries.filter((e: Entry) => e.date !== today)],
    };
    const updatedProjects = projects.map(p => (p.id === id ? updatedProject : p));
    setProject(updatedProject);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setAdding(false);
  }

  if (!project) {
    return (
      <main className="max-w-xl mx-auto py-10 px-4">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">← Back</Link>
        </div>
        <div className="text-gray-500">Project not found.</div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-xl font-bold">{project.name}</h1>
      </div>
      <div className="mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setAdding(a => !a)}
        >
          {adding ? "Cancel" : "Add Entry for Today"}
        </button>
      </div>
      {adding && (
        <div className="mb-6">
          <AddEntryForm
            onAdd={handleAdd}
            disabled={project.entries.some((e: Entry) => e.date === new Date().toISOString().slice(0, 10))}
          />
        </div>
      )}
      <h2 className="text-lg font-semibold mb-2">Entries</h2>
      <div className="space-y-2">
        {project.entries.length === 0 ? (
          <div className="text-gray-500">No entries yet.</div>
        ) : (
          project.entries.map((e: Entry) => <EntryItem key={e.date} entry={e} />)
        )}
      </div>
    </main>
  );
}
