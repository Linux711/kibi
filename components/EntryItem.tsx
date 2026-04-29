import { Entry } from '../types';

export default function EntryItem({ entry }: { entry: Entry }) {
  return (
    <div className="border rounded p-3 mb-2 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
        <span className="text-sm text-gray-600">{entry.hoursSpent}h</span>
      </div>
      <div className="text-gray-700 whitespace-pre-line">{entry.notes}</div>
    </div>
  );
}
