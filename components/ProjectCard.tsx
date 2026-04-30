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
    <div className="p-4 border rounded-lg shadow bg-white hover:bg-gray-50 transition">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <input
            className="flex-1 border rounded px-2 py-1 mr-2 bg-white"
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
                className="text-green-600 hover:text-green-800 p-1"
                onClick={handleSave}
                title="Save"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                className="text-gray-600 hover:text-gray-800 p-1"
                onClick={handleCancel}
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                className="text-blue-600 hover:text-blue-800 p-1"
                onClick={() => setEditing(true)}
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                className="text-red-600 hover:text-red-800 p-1"
                onClick={() => onDelete(project.id)}
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-500">Last updated: {getLastUpdated(project)}</div>
    </div>
  );
}
