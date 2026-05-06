import { useState } from 'react';

export default function AddEntryForm({
  onAdd,
  disabled,
}: {
  onAdd: (hours: string, notes: string) => void;
  disabled?: boolean;
}) {
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    onAdd(hours, notes);
    setHours('');
    setNotes('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-gray-50 p-4 rounded shadow">
      <div>
        <label className="block text-sm font-medium">Time Spent (h:mm)</label>
        <input
          type="text"
          placeholder="e.g. 2:30"
          className="mt-1 block w-full border rounded px-2 py-1"
          value={hours}
          onChange={e => setHours(e.target.value)}
          required
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          className="mt-1 block w-full border rounded px-2 py-1"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          required
          disabled={disabled}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={disabled}
      >
        Add Entry
      </button>
    </form>
  );
}
