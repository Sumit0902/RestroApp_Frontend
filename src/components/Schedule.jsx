import { useEffect, useState } from 'react';
import { format, addDays, startOfWeek, getISOWeek, getYear, addWeeks, setISOWeek } from 'date-fns';
import ScheduleDialog from './ScheduleDialog.jsx';
import EditScheduleDialog from './EditScheduleDialog.jsx';
import { useDispatch, useSelector } from 'react-redux';
import useAuthAxios from "@/lib/authAxios";;
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/features/auth/AuthSlice.js';
import { Pencil } from 'lucide-react';

export default function Schedule() {
    const userData = useSelector(state => state.auth.user);

    console.log(userData);
    
    const axiosInstance = useAuthAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);  
    const [loading, setLoading] = useState(true);  
    const [schedules, setSchedules] = useState({}); 
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [isManager, setIsManager] = useState(false);
    
    const [weekOffset, setWeekOffset] = useState(0);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(getISOWeek(new Date())); // Keep track of the displayed week number
    const [currentYear, setCurrentYear] = useState(getYear(new Date())); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

  

    const fetchCompanyEmployees = async () => {
        if (userData) {
            let company_id = userData.company.id;

            let employeesResponse = await axiosInstance.get(`/companies/${company_id}/employees`);
            let shiftsResponse = await axiosInstance.get(`/companies/${company_id}/shifts`);
            let filteredEmployees = employeesResponse.data?.data?.employees || [];
            let filteredShifts = shiftsResponse.data?.data || [];

            setEmployees(filteredEmployees);
            setShifts(filteredShifts);
            setIsManager(userData.role === 'manager');
            setLoading(false)
        }
    };

    const selectedDate = addWeeks(new Date(), weekOffset);
    const weekNumber = getISOWeek(selectedDate);

    const getWeekDays = (weekNumber) => {
        // Get the start date of the desired week in the current year
        const startDate = startOfWeek(
            setISOWeek(new Date(getYear(new Date()), 0, 1), weekNumber), 
            { weekStartsOn: 1 }
        );
    
        // Generate the week days
        const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));
        return weekDays;
    };

    const weekDays = getWeekDays(weekNumber)
    const fetchSchedules = async () => {
        let company_id = userData.company.id;
         
        const year = getYear(selectedDate);
         

        setCurrentWeekNumber(weekNumber);
        setCurrentYear(year);

        try {
            const response = await axiosInstance.post(`/companies/${company_id}/schedules`, {
                week_number: weekNumber, year, company_id
            });
            setSchedules(response.data.data);
        } catch (error) {
            let errorStatus = error.response?.status;
            if (errorStatus && (errorStatus == 403 || errorStatus == 401) ) {
                toast.error('Your session has expired. please login again');
                dispatch(logout);
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
            console.error('Error fetching schedules:', error, error.response?.status);
        }
    };
 
    useEffect(() => {
        fetchCompanyEmployees();
        fetchSchedules();

        console.log('week nu', weekNumber)
    }, [weekOffset]);


    const workingDays = [1, 2, 3, 4, 5]; 

    // const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    // const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

 
    const getShiftForDay = (userData, dayIndex) => {
        const schedule = JSON.parse(userData.schedule);
        return schedule[dayIndex] ? userData.shift : null;
    };


    function formatTime(time) {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    const ShiftCell = ({ shift }) => {
        if (!shift) return null;

        return (
            <div className="text-sm">
                <div className="font-medium text-gray-900">{shift.name}</div>
                <div className="text-gray-500">
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                </div>
            </div>
        );
    }


    const TableHeader = () => {
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return (
            <thead>
                <tr>
                    <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                    </th>
                    {weekDays.map((day) => (
                        <th
                            key={day}
                            className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {day}
                        </th>
                    ))}
                </tr>
            </thead>
        );
    }
 
    const handleEditClick = (scheduleId, userId, companyId, weekNumber) => {
        setSelectedSchedule({ scheduleId, userId, companyId, weekNumber });
        setIsEditModalOpen(true);
      };


    return (
        <div className="p-4">
            <div className="mb-4 flex justify-between">
                <div className="flex">
                    { loading ?
                        <p>Loading</p>

                    :
                    (isManager && (
                        <Button
                            onClick={() => { 
                                setIsOpen(true);
                            }}
                        >
                            Add Schedule
                        </Button>
                    ))
                    }
                </div>
                {isManager && (
                <div className="flex justify-end gap-4">
                    <Button onClick={() => setWeekOffset(prev => prev - 1)}>Previous Week</Button>
                    <Button onClick={() => setWeekOffset(prev => prev + 1)}>Next Week</Button>
                </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader />
                    <tbody className="bg-white divide-y divide-gray-200">
                        {
                            loading ? 
                            <tr>
                                <td className="px-2 py-4 whitespace-nowrap border-b border-gray-200" colSpan={8}>
                                    Loading...
                                </td> 
                            </tr>
                            :
                            (
                                Object.entries(schedules).length > 0 ?
                                Object.entries( schedules).map(([userId, scheduleData]) => {
                                    return (
                                    <tr key={userId}>
                                        <td className="px-2 py-4 whitespace-nowrap border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {scheduleData.user}
                                                </span>
                                                {
                                                    userData.role != 'employee' &&
                                                    <button
                                                        type="button"
                                                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                                                        onClick={() => handleEditClick(
                                                            scheduleData.scheduleId, // Replace with actual schedule ID
                                                            userId,
                                                            userData.company.id, // Replace with actual company ID
                                                            getISOWeek(new Date()) // Replace with actual week number
                                                        )}
                                                        data-schedule-id={scheduleData.scheduleId}
                                                        data-user-id={userId}
                                                        data-company-id={ userData.company.id}
                                                        data-week-number={getISOWeek(new Date())}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
    
                                                }
                                            </div>
                                        </td>
                                        {weekDays.map((_, index) => (
                                            <td key={index} className="px-2 py-4 whitespace-nowrap border-b border-gray-200 w-[9rem] ">
                                                <ShiftCell shift={getShiftForDay(scheduleData, index)} />
                                            </td>
                                        ))}
                                    </tr>
                                    )
                                })
                                : 
                                <tr>
                                    <td className="px-2 py-4 whitespace-nowrap border-b border-gray-200" colSpan={8}>
                                        No schedule for this week
                                    </td> 
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>

            <ScheduleDialog
                weekDays={weekDays}
                weekNumber={weekNumber}
                shifts={shifts}
                employees={employees}
                isOpen={isOpen}
                closeModal={() => setIsOpen(false)}
                workingDays={workingDays}
                selectedDate={selectedDate}
                updateSchedule={fetchSchedules}
            />

              {isEditModalOpen && selectedSchedule && (
                    <EditScheduleDialog
                    isOpen={isEditModalOpen}
                    closeModal={() => setIsEditModalOpen(false)}
                    weekDays={weekDays}
                    employees={employees} // Pass your employees array here
                    shifts={shifts} // Pass your shifts array here
                    workingDays={workingDays} // Pass your working days array here
                    weekNumber={weekNumber}
                    scheduleId={selectedSchedule.scheduleId}
                    userId={selectedSchedule.userId} 
                    companyId={selectedSchedule.companyId}
                    />
                )}
        </div>
    );
}


