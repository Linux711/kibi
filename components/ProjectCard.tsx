"use client";
import { useState, useRef, useEffect } from "react";
import { Project } from '../types';
import { getLastUpdated } from '../lib/utils';
import { format } from "date-fns";

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  selected,
  onSelect,
  onEntryChange,
  onEntryDelete,
}: {
  project: Project;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  selected?: boolean;
  onSelect?: () => void;
  onEntryChange?: (entry: { date: string; hoursSpent: number; notes: string }) => void;
  onEntryDelete?: (date: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [showDetails, setShowDetails] = useState(false);


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

  // For today's entry
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = project.entries.find(e => e.date === today) || { date: today, hoursSpent: 0, notes: "" };
  const entryInputRef = useRef<HTMLInputElement>(null);

  // Handle click: first selects, second expands
  function handleCardClick() {
    if (!selected) {
      setShowDetails(false);
      onSelect?.();
    } else {
      setShowDetails((prev) => !prev);
    }
  }

  useEffect(() => {
    if (selected && entryInputRef.current) {
      entryInputRef.current.focus();
    }
    if (!selected) {
      setShowDetails(false);
    }
  }, [selected]);

  // Entries before today, sorted descending
  const previousEntries = project.entries
    .filter(e => e.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div
      className={`p-4 border rounded-lg shadow bg-white hover:bg-gray-50 transition ${selected ? "ring-2 ring-blue-400" : ""}`}
      onClick={handleCardClick}
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
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
          <span className="flex-1 font-semibold text-lg">
            {project.name}
          </span>
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

      {/* Today's entry input */}
      {selected && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Today's Entry</label>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              className="border rounded px-2 py-1 w-20"
              value={todayEntry.hoursSpent}
              placeholder="Hours"
              onChange={e => {
                const hours = parseFloat(e.target.value) || 0;
                onEntryChange?.({ ...todayEntry, hoursSpent: hours });
              }}
              onClick={e => e.stopPropagation()}
            />
            <input
              ref={entryInputRef}
              className="border rounded px-2 py-1 flex-1"
              value={todayEntry.notes}
              placeholder="Notes for today..."
              onChange={e => {
                onEntryChange?.({ ...todayEntry, notes: e.target.value });
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Show details (all entries except today) on second click */}
      {selected && showDetails && (
        <div className="mt-6">
          <div className="font-semibold mb-2">Previous Entries</div>
          {previousEntries.length === 0 ? (
            <div className="text-gray-400 text-sm">No previous entries.</div>
          ) : (
            <ul className="space-y-2">
              {previousEntries.map(entry => (
                <li key={entry.date} className="border rounded px-3 py-2 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">{entry.date}</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20 text-sm"
                      value={entry.hoursSpent}
                      placeholder="Hours"
                      onChange={e => {
                        const hours = parseFloat(e.target.value) || 0;
                        onEntryChange?.({ ...entry, hoursSpent: hours });
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <input
                      className="border rounded px-2 py-1 flex-1 text-sm"
                      value={entry.notes}
                      placeholder="Notes"
                      onChange={e => {
                        onEntryChange?.({ ...entry, notes: e.target.value });
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <button
                      className="text-red-600 hover:text-red-800 p-1"
                      onClick={e => {
                        e.stopPropagation();
                        onEntryDelete?.(entry.date);
                      }}
                      title="Delete Entry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
