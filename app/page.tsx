
"use client";
import { useEffect, useState } from "react";
import { Project } from "../types";
import { loadProjects, saveProjects } from "../lib/storage";
import ProjectCard from "../components/ProjectCard";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(36),
      name: newName.trim(),
      entries: [],
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setNewName("");
  }

  function editProject(id: string, newName: string) {
    const updated = projects.map(p => (p.id === id ? { ...p, name: newName } : p));
    setProjects(updated);
    saveProjects(updated);
  }

  function deleteProject(id: string) {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
  }

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Project Journal</h1>
      <form onSubmit={addProject} className="flex gap-2 mb-6">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="New project name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
          Add
        </button>
      </form>
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-gray-500">No projects yet.</div>
        ) : (
          projects.map(p => <ProjectCard key={p.id} project={p} onEdit={editProject} onDelete={deleteProject} />)
        )}
      </div>
    </main>
  );
}
