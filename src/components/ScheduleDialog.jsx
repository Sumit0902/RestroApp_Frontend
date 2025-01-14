import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format, parse, startOfWeek, addDays } from 'date-fns'; 
import useAuthAxios from '@/lib/authAxios.js';
import { toast } from 'react-toastify';

export default function ScheduleDialog({ isOpen, weekNumber, closeModal, weekDays, employees, shifts, workingDays, updateSchedule }) {
    const initialState = {
        employee: undefined,
        shift: undefined,
        info: '',
        selectedDays: [],
    };

    const [formData, setFormData] = useState(initialState);
    const userData = useSelector((state) => state.auth.user);
    const axiosInstance = useAuthAxios();
    const navigate = useNavigate();

    // Helper function to convert local date to UTC
    const toUTCDate = (date) => {
        const localDate = new Date(date);
        return new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate()
        ));
    };

    // Helper function to get consistent day number (1-7, Monday-Sunday)
    const getConsistentDayNumber = (date) => {
        const utcDate = toUTCDate(date);
        let dayNumber = utcDate.getUTCDay();  
        return dayNumber === 0 ? 7 : dayNumber;  
    };

    function formatTime(timeString) {
        try {
            const parsedTime = parse(timeString, 'HH:mm:ss', new Date());
            return format(parsedTime, 'hh:mm a');
        } catch (error) {
            console.error("Invalid time format:", timeString);
            return timeString;
        }
    }

    function isWorkingDay(dateString) {
        const dayNumber = getConsistentDayNumber(dateString);
        return workingDays.includes(dayNumber);
    }

    function formatDateWithDay(dateString) {
        try {
            const utcDate = toUTCDate(dateString);
            const dayName = format(utcDate, 'EEEE');
            const formattedDate = format(utcDate, 'd MMMM yyyy');
            return `${dayName} (${formattedDate})`;
        } catch (error) {
            console.error("Invalid date format:", dateString);
            return dateString;
        }
    }

    const handleCheckboxChange = (date) => {
        if (!isWorkingDay(date)) return;

        setFormData((prev) => {
            const isSelected = prev.selectedDays.includes(date);
            const updatedDays = isSelected
                ? prev.selectedDays.filter((d) => d !== date)
                : [...prev.selectedDays, date];
            return { ...prev, selectedDays: updatedDays };
        });
    };

    const addSchedule = async (scheduleData) => {
        try {
            const company_id = userData.company.id;
     
            const firstSelectedDate = toUTCDate(scheduleData.selectedDays[0]);
     
            // const startOfWeekDate = startOfWeek(firstSelectedDate, { weekStartsOn: 1 });
     
            // const weekNumber = parseInt(format(startOfWeekDate, 'w'), 10);
            const year = firstSelectedDate.getUTCFullYear();
     
            const utcSelectedDays = scheduleData.selectedDays.map((day) =>
                toUTCDate(day).toISOString().split('T')[0]
            );
    
            // Extract numeric day numbers for local usage (if needed)
            const dayNumbers = scheduleData.selectedDays.map((day) =>
                getConsistentDayNumber(day)
            );
    
            const payload = {
                employee: scheduleData.employee,
                shift: scheduleData.shift,
                notes: scheduleData.info,
                week_number: weekNumber,
                company_id: company_id,
                year: year,
                selectedDays: utcSelectedDays, // Only ISO date strings sent to backend
            };
    
            console.log("Payload being sent:", payload);
            console.log("Day numbers (for local reference):", dayNumbers);
    
            const response = await axiosInstance.post(`/companies/${company_id}/schedules/add`, payload);
            console.log('Schedule added successfully:', response.data);
            setFormData(initialState);
            closeModal();
            updateSchedule();
            toast.success('Schedule added successfully');
        } catch (error) {
            console.error('Error adding schedule:', error.response?.status);
            if (error.response?.status === 403) {
                toast.error('Your session has expired. Please log in again.');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                toast.error('Failed to add schedule. Please try again.');
            }
        }
    };


    const handleSubmit = () => {
        if (!formData.employee || !formData.shift || formData.selectedDays.length === 0) {
            toast.error('Please fill out all fields and select at least one day.');
            return;
        }
        addSchedule(formData);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                Add Schedule
                            </Dialog.Title>

                            <div className="mt-4 space-y-4">
                                <select
                                    className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.employee}
                                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {`${emp.firstname} ${emp.lastname}`}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.shift}
                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                >
                                    <option value="">Select Shift</option>
                                    {shifts.map((shift, k) => (
                                        <option key={`${shift.name}_${k}`} value={shift.id}>
                                            {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                                        </option>
                                    ))}
                                </select>

                                <textarea
                                    className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Additional Information"
                                    value={formData.info}
                                    onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                                    rows={3}
                                />

                                <div className="space-y-2">
                                    <p className="font-medium text-gray-700">Select Days:</p>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                        {Object.entries(weekDays).map(([day, date]) => (
                                            <label key={day} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={formData.selectedDays.includes(date)}
                                                    onChange={() => handleCheckboxChange(date)}
                                                    disabled={!isWorkingDay(date)}
                                                />
                                                <span className="text-gray-700">{formatDateWithDay(date)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={handleSubmit}
                                    >
                                        Save Schedule
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}