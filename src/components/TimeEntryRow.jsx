import { format } from 'date-fns';

function TimeEntryRow({ entry, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">{entry.employeeName}</td>
      <td className="px-6 py-4 whitespace-nowrap">{format(entry.date, 'MMM dd, yyyy')}</td>
      <td className="px-6 py-4 whitespace-nowrap">{entry.checkIn}</td>
      <td className="px-6 py-4 whitespace-nowrap">{entry.checkOut}</td>
      <td className="px-6 py-4 whitespace-nowrap">{entry.breakTime}</td>
      <td className="px-6 py-4 whitespace-nowrap">{entry.scheduledHours}</td>
      <td className="px-6 py-4 whitespace-nowrap">{entry.actualHours}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default TimeEntryRow;