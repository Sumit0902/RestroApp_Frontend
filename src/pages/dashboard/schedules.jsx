import { useEffect, useState } from 'react';
import { addWeeks, format, getISOWeek, getYear, setISOWeek, startOfWeek } from 'date-fns';
import { Link, useNavigate } from "react-router-dom"
import {  addDays, getWeek } from 'date-fns';

 
import { useDispatch, useSelector } from 'react-redux';
import useAuthAxios from '@/lib/authAxios';
import { Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader, Option, Popover, PopoverContent, PopoverHandler, Select, Spinner, Typography } from '@material-tailwind/react';
import { toast } from 'react-toastify';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
 


export default function Schedules() {
    const userData = useSelector(state => state.auth.user); 
    const axiosInstance = useAuthAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch(); 
    const [loading, setLoading] = useState(true);  
    const [schedules, setSchedules] = useState({}); 
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [isManager, setIsManager] = useState(false);
    const [selEmployee, setSelEmployee] = useState("");
    const [selShift, setSelShift] = useState("");
    const [selInfo, setSelInfo] = useState('');
    const [selDays, setSelDays] = useState([]);
    
    const [opDats, setOpDays] = useState([]);
 
    const [weekOffset, setWeekOffset] = useState(0);

    const [currentWeekNumber, setCurrentWeekNumber] = useState(getISOWeek(new Date())); // Keep track of the displayed week number
    const [currentYear, setCurrentYear] = useState(getYear(new Date())); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
  
    const handleOpenAddModal = (employeeId, dayIndex) => {
		console.log('hdn', employeeId , dayIndex)
		if(!openAddModal) {
			setSelEmployee(employeeId);
			// setSelDays([dayIndex]); 
		}
		else {
			setSelEmployee("");
			setSelDays([]); 
		}
		setOpenAddModal(!openAddModal);
	}
    const handleOpenEditModal = () => setOpenEditModal(!openEditModal);

    const convertDaysToArray = (daysString) => {
        return daysString.split(',').map(Number);
    }

    const fetchCompanyEmployees = async () => {
        console.log('fetching employees 1')
        if (userData) {
            console.log('fetching employees 2')
            let company_id = userData.company.id;

            let employeesResponse = await axiosInstance.get(`/companies/${company_id}/employees`);
            let shiftsResponse = await axiosInstance.get(`/companies/${company_id}/shifts`);
            let filteredEmployees = employeesResponse.data?.data || [];
            let filteredShifts = shiftsResponse.data?.data || [];

            console.log('empres', employeesResponse, shiftsResponse)
            setEmployees(filteredEmployees);
            setShifts(filteredShifts);
            setIsManager(userData.role === 'manager');
            setLoading(false)
        }
            console.log('fetching employees 3')

    };

    const selectedDate = addWeeks(new Date(), weekOffset);
    const weekNumber = getISOWeek(selectedDate);

    const getWeekDays = (weekNumber) => { 
        const startDate = startOfWeek(
            setISOWeek(new Date(getYear(new Date()), 0, 1), weekNumber), 
            { weekStartsOn: 1 }
        ); 
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
            if (error.response?.status == 403) {
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

        let compDays = userData?.company.workingDays || []; 
        setOpDays(convertDaysToArray(compDays))
        console.log('week nu', weekNumber)
    }, [weekOffset]);

 
    const toUTCDate = (date) => {
        const localDate = new Date(date);
        return new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate()
        ));
    };


    const getConsistentDayNumber = (date) => {
        const utcDate = toUTCDate(date);
        let dayNumber = utcDate.getUTCDay();   
        return dayNumber;  

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
        return opDats.includes(dayNumber);
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
    if (!isWorkingDay(date)) {
        console.log('Not a working day');
        return; // Prevent changes for non-working days
    }

    const isoDate = toUTCDate(date).toISOString().split('T')[0]; // Convert to ISO string format
    console.log('Working day:', isoDate);

    setSelDays((prev) => {
        const isSelected = prev.includes(isoDate);
        const updatedDays = isSelected
            ? prev.filter((d) => d !== isoDate) // Remove the day if already selected
            : [...prev, isoDate]; // Add the day if not selected
        console.log('Updated days:', updatedDays);
        return updatedDays;
    });
};

    const addSchedule = async () => {
        if (!selEmployee || !selShift || selDays.length === 0) {
            toast.error('Please fill out all fields and select at least one day.');
            return;
        }

        try {
            const company_id = userData.company.id;

            // Convert selected days to UTC ISO date strings
            const utcSelectedDays = selDays.map((day) =>
                toUTCDate(day).toISOString().split('T')[0]
            );

            // Get the year from the first selected day
            const firstSelectedDate = toUTCDate(selDays[0]);
            const year = firstSelectedDate.getUTCFullYear();

            const payload = {
                employee: selEmployee, // Employee ID
                shift: selShift, // Shift ID
                notes: selInfo, // Additional information
                week_number: weekNumber, // Current week number
                company_id: company_id, // Company ID
                year: year, // Current year
                selectedDays: utcSelectedDays, // Selected days in ISO format
            };

            console.log("Payload being sent:", payload);

            const response = await axiosInstance.post(`/companies/${company_id}/schedules/add`, payload);
            console.log('Schedule added successfully:', response.data);

            // Reset form fields after successful submission
            setSelEmployee("");
            setSelShift("");
            setSelDays([]);
            setSelInfo('');
            setOpenAddModal(false);

            // Refresh schedules
            fetchSchedules();

            toast.success('Schedule added successfully');
        } catch (error) {
            console.error('Error adding schedule:',error,  error.response?.status);
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
    const updateSchedule = async (scheduleData) => {
        if (!selEmployee || !selShift || selDays.length === 0) {
            toast.error('Please fill out all fields and select at least one day.');
            return;
        }
        try {
            const company_id = userData.company.id;
     
            const firstSelectedDate = toUTCDate(scheduleData.selectedDays[0]);
      
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
            setSelEmployee("");
            setSelShift("");
            setSelDays([]);
            setSelInfo('');
            setOpenAddModal(false);
            fetchSchedules();
            toast.success('Schedule added successfully');
        } catch (error) {
            console.error('Error adding schedule:',error, error.response?.status);
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

    const ShiftCell = ({ shift, notes }) => {
        if (!shift) return null;

        return (
            <div className="text-sm flex items-center gap-2 ">
				{notes && 
					<div className='w-8 h-8'>
						<Popover>
							<PopoverHandler>
								<InformationCircleIcon className='cursor-pointer' title='Click to view info about a schedule'/>
							</PopoverHandler>
							<PopoverContent>
								<div>
								<p className='font-bold'>Notes:</p>
									{notes}	

								</div>
							</PopoverContent>
						</Popover>
						
					</div>
				}
				<div>
					<div className="font-medium text-gray-900">{shift.name}</div>
					<div className="text-gray-500">
						{formatTime(shift.start_time)} - {formatTime(shift.end_time)}
					</div>
                </div>
            </div>
        );
    }
 

    const TableHeader = () => {
        const weekDays = getWeekDays(weekNumber);

        return (
            <thead>
                <tr>
                    <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                        User
                    </th>
                    {weekDays.map((date) => (
						<th
							key={date}
							className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							{format(date, "EEE, dd MMM")}
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
        <Card className="w-full h-full mt-4">
            <CardHeader  floated={false} shadow={false} className="rounded-none" >
                <div className=" flex items-center justify-between gap-8">
                    <Typography variant="h5" color="blue-gray">
                        Schedules
                    </Typography>
                </div>
                <div className="flex flex-col mt-4">
                    { loading ?
                        <div className='flex flex-col sm:flex-row w-full justify-between gap-4 mt-4'>
                            <div className='gap-4 animate-pulse block w-32 h-10 rounded-md bg-gray-300'></div>

                            <div className="flex justify-end gap-4">
                                <div className='gap-4 animate-pulse block w-32 h-10 rounded-md bg-gray-300'></div>
                                <div className='gap-4 animate-pulse block w-32 h-10 rounded-md bg-gray-300'></div>
                            </div>
                        </div>

                    :
                    (isManager && (
                        <>
                            <div className='flex flex-col sm:flex-row w-full justify-between gap-4'>
                                <Button
                                    onClick={() => { 
                                        setOpenAddModal(true);
                                    }}
                                >
                                    Add Schedule
                                </Button>
                                <div className="flex justify-end gap-4">
                                    <Button onClick={() => setWeekOffset(prev => prev - 1)}>Previous Week</Button>
                                    <Button onClick={() => setWeekOffset(prev => prev + 1)}>Next Week</Button>
                                </div>
                            </div>
                           
                        </>
                    ))
                    }
                </div>
            </CardHeader>
            <CardBody>
                <div className=" ">
                    <table className="min-w-full divide-y divide-gray-200">
                        <TableHeader />
                        <tbody className="bg-white divide-y divide-gray-200">
                            {
                                loading ? 
                                <tr>
                                    <td className="px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-center" colSpan={8}>
                                        <div className='flex justify-center gap-4 w-full'><Spinner /> Loading!</div>
                                    </td> 
                                </tr>
                                :
                                (
                                    employees.length > 0 ? (
                                        employees.map((employee) => (
                                            <tr key={employee.id}>
                                                {/* Employee Name */}
                                                <td className="px-2 py-4 font-medium text-gray-900 border-b">
                                                    {employee.firstname} {employee.lastname}
                                                </td>
                                                {/* Days of the Week */}
                                                {weekDays.map((day, index) => {
                                                    const shiftData = schedules[employee.id];
                                                    const formattedDay = format(day, "yyyy-MM-dd"); // Format the day to match the schedule format

                                                    // Check if there is a shift for the current day
                                                    const dayShift = shiftData?.shifts?.find((shift) => shift.date === formattedDay);
													console.log(dayShift, shiftData?.shifts)
                                                    return (
                                                        <td key={index} className="group px-2 py-4 border-b w-[9rem]">
                                                            {dayShift ? (
                                                                <ShiftCell shift={dayShift} notes={shiftData?.notes} />
                                                            ) : (
                                                                <button
                                                                    className="group-hover:opacity-100 opacity-0 text-blue-600 hover:text-blue-800 transition"
                                                                    onClick={() => handleOpenAddModal(employee.id, formattedDay)}
                                                                >
                                                                    ➕
                                                                </button>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                className="px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-center"
                                                colSpan={8}
                                            >
                                                No Employee added yet
                                            </td>
                                        </tr>
                                    )
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </CardBody>
            <Dialog open={openAddModal} handler={handleOpenAddModal}>
                <DialogHeader>Add Schedule</DialogHeader>
                <DialogBody>
                    <div className="mt-4 space-y-4">
                        <label htmlFor="Select Employee">Select Employee</label>
                        <select 
                            className='!mt-0 !mb-4 w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            onChange={(e) => {
                                console.log("Selected Employee ID:", e.target.value); // Debugging
                                setSelEmployee(e.target.value);
                              }} 
                            selected={selEmployee} 
                        >
                            <option value="">Select Employee</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={`${emp.id}`}>
                                    {`${emp.firstname} ${emp.lastname}`}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="Select Shift">Select Shift</label>
                        <select 
                            className='!mt-0 !mb-4 w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={selShift}
                            onChange={(e) => setSelShift(e.target.value) }
                        >
                            <option value="">Select Shift</option>
                            {shifts.map((shift, k) => (
                                <option key={`${shift.name}_${k}`} value={`${shift.id}`} data-id={`${shift.id}`} >
                                    {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                                </option>
                            ))}
                        </select>

                        <textarea
                            className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-2  "
                            placeholder="Additional Information"
                            value={selInfo}
                            onChange={(e) => setSelInfo(e.target.value)}
                            rows={3}
                        />

                        <div className="space-y-2">
                            <p className="font-medium text-gray-700">Select Days:</p>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                {Object.entries(weekDays).map(([day, date]) => {
                                        // console.log('wdd', {'wd' : weekDays, 'day' : day, 'date' : date})
                                        return (
                                        <label key={day} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selDays.includes(toUTCDate(date).toISOString().split('T')[0])} 
                                                onChange={() => handleCheckboxChange(date)}
                                                disabled={!isWorkingDay(date)}
                                            />
                                            <span className="text-gray-700">{formatDateWithDay(date)}</span>
                                        </label>
                                    )
                                }
                                )}
                            </div>
                        </div>

                     
                    </div>
                </DialogBody>
                <DialogFooter>
                <Button
                    variant="text"
                    color="red"
                    onClick={handleOpenAddModal}
                    className="mr-1"
                >
                    <span>Cancel</span>
                </Button>
                <Button variant="gradient" color="green" onClick={addSchedule}>
                    <span>Save Schedule</span>
                </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={openEditModal} handler={handleOpenEditModal}>
                <DialogHeader>Its a simple dialog.</DialogHeader>
                <DialogBody> 
                </DialogBody>
                <DialogFooter>
                <Button
                    variant="text"
                    color="red"
                    onClick={handleOpenEditModal}
                    className="mr-1"
                >
                    <span>Cancel</span>
                </Button>
                <Button variant="gradient" color="green" onClick={handleOpenEditModal}>
                    <span>Confirm</span>
                </Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
}
