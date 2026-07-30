
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
  const [expandByDefault, setExpandByDefault] = useState(true);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set());
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

  function updateProject(updatedProject: Project) {
    const updated = categories.map(cat => ({
      ...cat,
      projects: cat.projects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    }));
    setCategories(updated);
    saveCategories(updated);
  }

  function deleteCategory(categoryId: string) {
    const updated = categories.filter(cat => cat.id !== categoryId);
    setCategories(updated);
    saveCategories(updated);
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(updated.length > 0 ? updated[0].id : null);
    }
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
            style={{ backgroundColor: "#8783d1ff" }}
            className="text-white px-4 py-2 rounded hover:opacity-90"
            onClick={handleExport}
            type="button"
          >
            Export
          </button>
          <label
            style={{ backgroundColor: "#44677eff" }}
            className="text-white px-4 py-2 rounded hover:opacity-90 cursor-pointer"
          >
            Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
          </label>
          <button
            style={{ backgroundColor: expandByDefault ? "#38A3A5" : "#b0b0b0" }}
            className="text-white px-4 py-2 rounded hover:opacity-90 ml-auto"
            onClick={() => setExpandByDefault(!expandByDefault)}
            type="button"
          >
            {expandByDefault ? "Expand All" : "Collapse All"}
          </button>
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
          <button
            style={{ backgroundColor: "#38A3A5" }}
            className="text-white px-4 py-2 rounded hover:opacity-90"
            type="submit"
          >
            Add Category
          </button>
        </form>

        <div className="space-y-6">
          {hiddenCategories.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm font-medium mb-2">Hidden Categories ({hiddenCategories.size}):</div>
              <div className="flex flex-wrap gap-2">
                {categories.filter(cat => hiddenCategories.has(cat.id)).map(cat => (
                  <button
                    key={cat.id}
                    className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-3 py-1 rounded text-sm"
                    onClick={() => setHiddenCategories(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(cat.id);
                      return newSet;
                    })}
                  >
                    {cat.name} (show)
                  </button>
                ))}
              </div>
            </div>
          )}
          {hiddenProjects.size > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="text-sm font-medium mb-2">Hidden Projects ({hiddenProjects.size}):</div>
              <div className="flex flex-wrap gap-2">
                {categories.flatMap(cat => cat.projects.filter(p => hiddenProjects.has(p.id))).map(p => (
                  <button
                    key={p.id}
                    className="bg-green-200 hover:bg-green-300 text-green-900 px-3 py-1 rounded text-sm"
                    onClick={() => setHiddenProjects(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(p.id);
                      return newSet;
                    })}
                  >
                    {p.name} (show)
                  </button>
                ))}
              </div>
            </div>
          )}
          {categories.length === 0 ? (
            <div className="text-gray-500">No categories yet.</div>
          ) : (
            categories.map(cat => (
              !hiddenCategories.has(cat.id) && (
              <div key={cat.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-semibold cursor-pointer ${(expandByDefault || selectedCategoryId === cat.id) ? 'text-[#44677eff]' : 'text-gray-700'}`}
                    onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                  >
                    {cat.name}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      className="text-gray-600 hover:text-gray-800 p-1"
                      onClick={() => setHiddenCategories(prev => new Set([...prev, cat.id]))}
                      title="Hide Category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 p-1"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${cat.name}" and all its projects?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      title="Delete Category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {(expandByDefault || selectedCategoryId === cat.id) && (
                  <>
                    <form onSubmit={(e) => { e.preventDefault(); addProjectToCategory(cat.id, projectInputs[cat.id] || ''); setProjectInputs(prev => ({...prev, [cat.id]: ''})); }} className="flex gap-2 mb-4 ml-4">
                      <input
                        className="border rounded px-3 py-2 flex-1 bg-white"
                        placeholder="New project name"
                        value={projectInputs[cat.id] || ''}
                        onChange={e => setProjectInputs(prev => ({...prev, [cat.id]: e.target.value}))}
                        required
                      />
                      <button
                        style={{ backgroundColor: "#8783d1ff" }}
                        className="text-white px-4 py-2 rounded hover:opacity-90"
                        type="submit"
                      >
                        Add Project
                      </button>
                    </form>
                <div className="space-y-4">
                      {cat.projects.length === 0 ? (
                        <div className="text-gray-500 ml-4">No projects in this category.</div>
                      ) : (
                        cat.projects.filter(p => !hiddenProjects.has(p.id)).map(p => (
                          <div key={p.id} className="relative">
                            <button
                              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10 p-1"
                              onClick={() => setHiddenProjects(prev => new Set([...prev, p.id]))}
                              title="Hide Project"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            <ProjectCard
                            key={p.id}
                            project={p}
                            onEdit={editProject}
                            onDelete={deleteProject}
                            onUpdateProject={updateProject}
                            selected={expandByDefault || selectedProjectId === p.id}
                            onSelect={() => setSelectedProjectId(selectedProjectId === p.id ? null : p.id)}
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
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
              )
            ))
          )}
        </div>
      </div>
    </main>
  );
}
