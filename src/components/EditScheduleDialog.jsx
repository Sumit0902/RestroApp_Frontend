import  { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format, getISOWeek, parse, startOfWeek } from 'date-fns';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import useAuthAxios from '@/lib/authAxios.js';
import { toast } from 'react-toastify';
import { Trash2Icon } from 'lucide-react';

export default function EditScheduleDialog({ 
  isOpen, 
  closeModal, 
  weekDays, 
  employees, 
  shifts, 
  workingDays, 
  updateSchedule,
  scheduleId,
  userId,
  weekNumber,
  companyId
}) {
    const initialState = {
        employee: undefined,
        shift: undefined,
        info: '',
        selectedDays: [],
    };

    const [formData, setFormData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        if (isOpen && scheduleId) {
            fetchScheduleData();
        }
    }, [isOpen, scheduleId]);

    const fetchScheduleData = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                `/companies/${companyId}/schedules/${scheduleId}`
            );
            const scheduleData = response.data;
    
            // Verify weekDays and scheduleData formats
            if (!scheduleData.selectedDays || !Array.isArray(scheduleData.selectedDays)) {
                throw new Error("Invalid selectedDays format");
            }
    
            if (!weekDays || typeof weekDays !== "object") {
                throw new Error("Invalid weekDays format");
            }
    
            // Convert selectedDays to match weekDays keys
            // const selectedDaysArray = scheduleData.selectedDays
            //     .map((day) => {
            //         // Match the day with weekDays
            //         const matchedDay = Object.entries(weekDays).find(([_, date]) => {
            //             console.log(date, typeof date)
            //             const formattedDate = date.toISOString().split('T')[0]; // Extract "yyyy-MM-dd"
            //             return formattedDate === day;
            //         });
            //         return matchedDay ? matchedDay[0] : null; // Return the key (e.g., "0", "1")
            //     })
            //     .filter(Boolean); // Remove null values
    
            setFormData({
                employee: scheduleData.employee,
                shift: scheduleData.shift,
                info: scheduleData.notes || '',
                selectedDays: scheduleData.selectedDays,
            });
        } catch (error) {
            console.error('Error fetching schedule:', error);
            toast.error('Failed to load schedule data');
        } finally {
            setIsLoading(false);
        }
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

    const updateScheduleData = async () => {
        try {
            // Get the first selected day and derive the week number and year
            const firstSelectedDate = new Date(formData.selectedDays[0]);
            const startOfWeekDate = startOfWeek(firstSelectedDate, { weekStartsOn: 1 });
            const weekNumber = getISOWeek(startOfWeekDate); // Use a library or custom function to get the ISO week number
            const year = firstSelectedDate.getUTCFullYear();
    
            // Map selected days to their indices (0 = Monday, 1 = Tuesday, etc.)
            const selectedDaysIndices = formData.selectedDays.map((day) => {
                const dayDate = new Date(day);
                return dayDate.getUTCDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
            });
    
            // Prepare the payload
            const payload = {
                employee: formData.employee.id, // Save employee ID
                shift: formData.shift.id, // Save shift ID
                notes: formData.info, // Additional notes
                week_number: weekNumber, // ISO week number
                year: year, // Year of the schedule
                selectedDays: selectedDaysIndices, // Day indices
            };
    
            // Send the updated data to the API
            await axiosInstance.patch(
                `/companies/${companyId}/schedules/${scheduleId}/update`,
                payload
            );
    
            // Success notification and post-update actions
            toast.success('Schedule updated successfully');
            closeModal();
            updateSchedule();
        } catch (error) {
            console.error('Error updating schedule:', error);
    
            // Handle errors
            if (error.response?.status === 403) {
                toast.error('Your session has expired. Please log in again.');
                setTimeout(() => navigate('/'), 3000);
            } else {
                toast.error('Failed to update schedule');
            }
        }
    };

    const deleteSchedule = async () => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            await axiosInstance.delete(
                `/companies/${companyId}/schedules/${scheduleId}`
            );
            
            toast.success('Schedule deleted successfully');
            closeModal();
            updateSchedule();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            if (error.response?.status === 403) {
                toast.error('Your session has expired. Please log in again.');
                setTimeout(() => navigate('/'), 3000);
            } else {
                toast.error('Failed to delete schedule');
            }
        }
    };

    const handleSubmit = () => {
        if (!formData.employee || !formData.shift || formData.selectedDays.length === 0) {
            toast.error('Please fill out all fields and select at least one day.');
            return;
        }
        updateScheduleData();
    };

    if (isLoading) {
        return (
            <Dialog as="div" className="relative z-10" open={isOpen} onClose={closeModal}>
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">
                        Loading schedule data...
                    </div>
                </div>
            </Dialog>
        );
    }

    ;
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
                                Edit Schedule
                            </Dialog.Title>

                            <div className="mt-4 space-y-4">
                                <select
                                    className="w-full rounded-lg border border-gray-300 p-2.5 bg-gray-100 cursor-not-allowed"
                                    value={formData?.employee?.id || ''}
                                    disabled
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id} selected={emp.id == formData?.employee?.id}>
                                            {`${emp.firstname} ${emp.lastname} `}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData?.shift?.id || undefined}
                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                >
                                    <option value="">Select Shift</option>
                                    {shifts.map((shift, k) =>{ 
                                        console.log(JSON.stringify(shift), 'shiftk', formData)
                                        return (
                                        <option key={`${shift.name}_${k}`} value={shift.id}  selected={shift.id == formData?.shift?.id} >
                                            {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                                        </option>
                                    )}
                                    )}
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
                                        {Object.entries(weekDays).map(([day, date]) => {
                                            return (
                                            <label key={day} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={formData.selectedDays.includes(parseInt(day))}
                                                    onChange={() => handleCheckboxChange(parseInt(day))}
                                                    disabled={!isWorkingDay(day)}
                                                />
                                                <span className="text-gray-700">{formatDateWithDay(date)}</span>
                                            </label>
                                        )}
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        onClick={deleteSchedule}
                                    >
                                        <Trash2Icon/>
                                    </button>
                                    <div className="flex gap-3">
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
                                            Update Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}