
"use client";
import { useEffect, useState } from "react";
import { Project, Entry } from "../types";
import { loadProjects, saveProjects, exportProjects, importProjects } from "../lib/storage";
import { useRef } from "react";
import ProjectCard from "../components/ProjectCard";
import { format } from "date-fns";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  function handleExport() {
    const data = exportProjects();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-journal-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (importProjects(text)) {
        setProjects(loadProjects());
        alert("Import successful!");
      } else {
        alert("Import failed: Invalid file.");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = "";
  }

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

  const handleDataChange = () => {
    setProjects(loadProjects());
  };

  return (
    <main className="py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Project Journal</h1>
        {/* Export/Import Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleExport}
            type="button"
          >
            Export
          </button>
          <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
            Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
          </label>
        </div>
        <form onSubmit={addProject} className="flex gap-2 mb-6">
          <input
            className="border rounded px-3 py-2 flex-1 bg-white"
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
            projects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={editProject}
                onDelete={deleteProject}
                selected={selectedProjectId === p.id}
                onSelect={() => setSelectedProjectId(p.id)}
                onEntryChange={(entry: Entry) => {
                  const updated = projects.map(proj => {
                    if (proj.id !== p.id) return proj;
                    const entries = proj.entries.filter(e => e.date !== entry.date);
                    return { ...proj, entries: [...entries, entry] };
                  });
                  setProjects(updated);
                  saveProjects(updated);
                }}
                onEntryDelete={(entryDate: string) => {
                  const updated = projects.map(proj => {
                    if (proj.id !== p.id) return proj;
                    const entries = proj.entries.filter(e => e.date !== entryDate);
                    return { ...proj, entries };
                  });
                  setProjects(updated);
                  saveProjects(updated);
                }}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
