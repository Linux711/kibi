"use client";
import { useState } from 'react';
import { Project } from '../types';
import { getLastUpdated } from '../lib/utils';
import Link from 'next/link';

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);

  function handleSave() {
    if (editName.trim()) {
      onEdit(project.id, editName.trim());
      setEditing(false);
    }
  }

  function handleCancel() {
    setEditName(project.name);
    setEditing(false);
  }

  return (
    <div className="p-4 border rounded-lg shadow hover:bg-gray-50 transition">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <input
            className="flex-1 border rounded px-2 py-1 mr-2"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
          />
        ) : (
          <Link href={`/project/${project.id}`} className="flex-1 font-semibold text-lg hover:underline">
            {project.name}
          </Link>
        )}
        <div className="flex gap-1">
          {editing ? (
            <>
              <button
                className="text-green-600 hover:text-green-800"
                onClick={handleSave}
              >
                ✓
              </button>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={handleCancel}
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => setEditing(true)}
              >
                ✏️
              </button>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => onDelete(project.id)}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-500">Last updated: {getLastUpdated(project)}</div>
    </div>
  );
}
