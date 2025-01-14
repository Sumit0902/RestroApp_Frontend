import  { useState } from 'react';
import { format, addDays, getWeek, parse } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { data } from 'autoprefixer';

const employees = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'];

export default function Calendar({ currentWeek }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [appointments, setAppointments] = useState([]);

    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
    const weekNumber = getWeek(currentWeek);

    const handleCellClick = (date) => {
        setSelectedDate(date);
        setIsOpen(true);
    };

    const handleSave = (formData) => {
        const newAppointment = {
            ...formData,
            date: selectedDate,
            id: Date.now()
        };
        setAppointments([...appointments, newAppointment]);
        setIsOpen(false);
    };

    const getAppointmentsForCell = (date, hour) => {
        return appointments.filter(app => {
            if (app.date !== date) return false;

            const startHour = parseInt(app.startTime.split(':')[0]);
            const endHour = parseInt(app.endTime.split(':')[0]);
            return hour >= startHour && hour < endHour;
        });
    };





    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <TimeGrid
                days={days}
                weekNumber={weekNumber}
                onCellClick={handleCellClick}
                getAppointmentsForCell={getAppointmentsForCell}
            />

            <ScheduleModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={handleSave}
                employees={employees}
            />
        </div>
    );
}

function ScheduleModal({ isOpen, onClose, onSave, employees }) {

    const timeOptions = Array.from({ length: 25 }, (_, i) => {
        const hour = Math.floor(i / 2) + 9;
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });


    const [formData, setFormData] = useState({
        employee: employees[0],
        startTime: '09:00',
        endTime: '10:00',
        info: ''
    });

    const isTimeRangeValid = () => {
        const start = parse(formData.startTime, 'HH:mm', new Date());
        const end = parse(formData.endTime, 'HH:mm', new Date());
        return start < end;
    };

    const handleSubmit = () => {
        onSave(formData);
        setFormData({
            employee: employees[0],
            startTime: '09:00',
            endTime: '10:00',
            info: ''
        });
    };

   

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-semibold">
                            Add Schedule
                        </Dialog.Title>
                        <button
                            onClick={onClose}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <select
                                    value={formData.startTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startTime: e.target.value })
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {timeOptions.map((time) => (
                                        <option key={`start-${time}`} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <select
                                    value={formData.endTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endTime: e.target.value })
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {timeOptions.map((time) => (
                                        <option key={`end-${time}`} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!isTimeRangeValid() && (
                            <p className="text-red-500 text-sm">
                                End time must be after start time
                            </p>
                        )}

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
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isTimeRangeValid()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}

function TimeGrid({ days, weekNumber, onCellClick, getAppointmentsForCell }) {
    const timeHeaders = Array.from({ length: 13 }, (_, i) => i + 9);

    const formatTimeHeader = (hour) => {
        if (hour === 12) return '12 PM';
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
    };


    return (
        <div className="grid grid-cols-[auto,1fr] gap-4">
            {/* Corner cell */}
            <div className="bg-gray-50 p-4 text-center font-semibold">
                Week {weekNumber}
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
                {days.map((day) => {
                     console.log(days, 'ssdf')
                    return (
                        <div
                            key={format(day, 'yyyy-MM-dd')}
                            className="bg-gray-50 p-4 text-left h-24 flex flex-col justify-center"
                        >
                            <div className="font-semibold">{format(day, 'EEE')}</div>
                            <div className="text-gray-500">{format(day, 'MMM d')}</div>
                        </div>
                        
                    )
                
                }
                   
                )}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-rows-7 gap-px bg-gray-200">
                {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');

                    return (
                        <div key={dateKey} className="grid grid-cols-[repeat(13,minmax(100px,1fr))] gap-px">
                            {timeHeaders.map((hour) => {
                                const cellAppointments = getAppointmentsForCell(dateKey, hour);

                                return (
                                    <div
                                        key={`${dateKey}-${hour}`}
                                        className="bg-white h-24 p-2 relative group"
                                    >
                                        <div className="h-full overflow-y-auto">
                                            {cellAppointments.map((appointment) => (
                                                <div
                                                    key={appointment.id}
                                                    className="bg-blue-100 p-2 rounded-lg mb-1"
                                                >
                                                    <p className="font-semibold text-sm">{appointment.employee}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {appointment.startTime} - {appointment.endTime}
                                                    </p>
                                                    {appointment.info && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {appointment.info}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => onCellClick(dateKey)}
                                            className="absolute right-2 top-2 p-1 rounded-full bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Plus className="w-4 h-4 text-blue-600" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}