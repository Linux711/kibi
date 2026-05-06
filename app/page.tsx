
"use client";
import { useEffect, useState } from "react";
import { Project, Entry, Category } from "../types";
import { loadCategories, saveCategories, exportCategories, importCategories } from "../lib/storage";
import { useRef } from "react";
import ProjectCard from "../components/ProjectCard";
import { format } from "date-fns";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [projectInputs, setProjectInputs] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  function handleExport() {
    const data = exportCategories();
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
      if (importCategories(text)) {
        setCategories(loadCategories());
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
    const cats = loadCategories();
    setCategories(cats);
    if (cats.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(cats[0].id);
    }
  }, []);

  function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCategory: Category = {
      id: Date.now().toString(36),
      name: newCategoryName.trim(),
      projects: [],
    };
    const updated = [newCategory, ...categories];
    setCategories(updated);
    saveCategories(updated);
    setNewCategoryName("");
    if (!selectedCategoryId) setSelectedCategoryId(newCategory.id);
  }

  function addProjectToCategory(categoryId: string, projectName: string) {
    if (!projectName.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(36),
      name: projectName.trim(),
      entries: [],
    };
    const updated = categories.map(cat =>
      cat.id === categoryId ? { ...cat, projects: [newProject, ...cat.projects] } : cat
    );
    setCategories(updated);
    saveCategories(updated);
  }

  function editProject(id: string, newName: string) {
    const updated = categories.map(cat => ({
      ...cat,
      projects: cat.projects.map(p => (p.id === id ? { ...p, name: newName } : p))
    }));
    setCategories(updated);
    saveCategories(updated);
  }

  function deleteProject(id: string) {
    const updated = categories.map(cat => ({
      ...cat,
      projects: cat.projects.filter(p => p.id !== id)
    }));
    setCategories(updated);
    saveCategories(updated);
  }

  const handleDataChange = () => {
    setCategories(loadCategories());
  };

  return (
    <main className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
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
        {/* Add Category Form */}
        <form onSubmit={addCategory} className="flex gap-2 mb-6">
          <input
            className="border rounded px-3 py-2 flex-1 bg-white"
            placeholder="New category name"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            required
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" type="submit">
            Add Category
          </button>
        </form>

        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="text-gray-500">No categories yet.</div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="border rounded-lg p-4 bg-gray-50">
                <h2
                  className={`text-xl font-semibold mb-4 cursor-pointer ${selectedCategoryId === cat.id ? 'text-blue-600' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); addProjectToCategory(cat.id, projectInputs[cat.id] || ''); setProjectInputs(prev => ({...prev, [cat.id]: ''})); }} className="flex gap-2 mb-4 ml-4">
                  <input
                    className="border rounded px-3 py-2 flex-1 bg-white"
                    placeholder="New project name"
                    value={projectInputs[cat.id] || ''}
                    onChange={e => setProjectInputs(prev => ({...prev, [cat.id]: e.target.value}))}
                    required
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
                    Add Project
                  </button>
                </form>
                <div className="space-y-4">
                  {cat.projects.length === 0 ? (
                    <div className="text-gray-500 ml-4">No projects in this category.</div>
                  ) : (
                    cat.projects.map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onEdit={editProject}
                        onDelete={deleteProject}
                        selected={selectedProjectId === p.id}
                        onSelect={() => setSelectedProjectId(p.id)}
                        onEntryChange={(entry: Entry) => {
                          const updated = categories.map(c => ({
                            ...c,
                            projects: c.projects.map(proj => {
                              if (proj.id !== p.id) return proj;
                              const entries = proj.entries.filter(e => e.date !== entry.date);
                              return { ...proj, entries: [...entries, entry] };
                            })
                          }));
                          setCategories(updated);
                          saveCategories(updated);
                        }}
                        onEntryDelete={(entryDate: string) => {
                          const updated = categories.map(c => ({
                            ...c,
                            projects: c.projects.map(proj => {
                              if (proj.id !== p.id) return proj;
                              const entries = proj.entries.filter(e => e.date !== entryDate);
                              return { ...proj, entries };
                            })
                          }));
                          setCategories(updated);
                          saveCategories(updated);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
