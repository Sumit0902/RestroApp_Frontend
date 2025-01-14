import { useState } from 'react';
import { format, addDays, getWeek } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { Plus, X } from 'lucide-react';

const employees = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'];
const timeSlots = Array.from({ length: 13 }, (_, i) => i + 9)
    .map(hour => [
        `${hour.toString().padStart(2, '0')}:00`,
        `${hour.toString().padStart(2, '0')}:30`
    ]).flat();

export default function Calendar({currentDate, weekNum}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [formData, setFormData] = useState({
        employee: employees[0],
        time: '09:00',
        info: ''
    });

   
 
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
   
    

    // Format time for display
    const formatTimeHeader = (hour) => {
        if (hour === 12) return '12 PM';
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
    };

    const timeHeaders = Array.from({ length: 13 }, (_, i) => i + 9);

    const handleCellClick = (cellId) => {
        setSelectedCell(cellId);
        setIsOpen(true);
    };

    const handleSave = () => {
        setAppointments([...appointments, { ...formData, cellId: selectedCell }]);
        setIsOpen(false);
        setFormData({ employee: employees[0], time: '09:00', info: '' });
    };

    const getAppointmentForCell = (cellId) => {
        return appointments.find(app => app.cellId === cellId);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-[auto,1fr] gap-4">
                    {/* Corner cell */}
                    <div className="bg-gray-50 p-4 text-center font-semibold">
                        Week {weekNum}
                    </div>

                    {/* Time headers */}
                    <div className="grid grid-cols-[repeat(13,minmax(100px,1fr))] gap-px bg-gray-200">
                        {timeHeaders.map((hour) => (
                            <div key={hour} className="bg-gray-50 p-4 text-center">
                                <div className="font-semibold">{formatTimeHeader(hour)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Days column */}
                    <div className="space-y-px">
                        {days.map((day, i) => (
                            <div key={i} className="bg-gray-50 p-4 text-left h-24 flex flex-col justify-center">
                                <div className="font-semibold">{format(day, 'EEE')}</div>
                                <div className="text-gray-500">{format(day, 'MMM d')}</div>
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-rows-7 gap-px bg-gray-200">
                        {days.map((day, dayIndex) => (
                            <div key={dayIndex} className="grid grid-cols-[repeat(13,minmax(100px,1fr))] gap-px">
                                {timeHeaders.map((hour, hourIndex) => {
                                    const cellId = `${dayIndex}-${hourIndex}`;
                                    const appointment = getAppointmentForCell(cellId);

                                    return (
                                        <div
                                            key={`${dayIndex}-${hourIndex}`}
                                            className="bg-white h-24 p-2 relative group"
                                        >
                                            {appointment ? (
                                                <div className="bg-blue-100 p-2 rounded-lg h-full">
                                                    <p className="font-semibold">{appointment.employee}</p>
                                                    <p className="text-sm text-gray-600">{appointment.time}</p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {appointment.info}
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleCellClick(cellId)}
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50/90"
                                                >
                                                    <Plus className="w-6 h-6 text-blue-600" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <Dialog.Title className="text-lg font-semibold">
                                Add Appointment
                            </Dialog.Title>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee
                                </label>
                                <select
                                    value={formData.employee}
                                    onChange={(e) =>
                                        setFormData({ ...formData, employee: e.target.value })
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {employees.map((emp) => (
                                        <option key={emp} value={emp}>
                                            {emp}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time
                                </label>
                                <select
                                    value={formData.time}
                                    onChange={(e) =>
                                        setFormData({ ...formData, time: e.target.value })
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {timeSlots.map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Information
                                </label>
                                <textarea
                                    value={formData.info}
                                    onChange={(e) =>
                                        setFormData({ ...formData, info: e.target.value })
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
            
        </div>
    );
}