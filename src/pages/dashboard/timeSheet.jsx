import { useEffect, useState } from 'react'; 
import { eachDayOfInterval, eachWeekOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceTable } from '@/components/AttendanceTable.jsx';
import useAuthAxios from "@/lib/authAxios";
import { useSelector } from 'react-redux';
import { cn, transformTimesheetData } from '@/lib/utils.js';
import { toast, ToastContainer } from 'react-toastify';
import { Button, Card, Typography } from '@material-tailwind/react';
import { Bars3Icon } from '@heroicons/react/24/solid';

function TimeSheet() {
  const [isLoading, setIsLoading] = useState(true);
  const authAxios = useAuthAxios();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [allowedPrevMonth] = useState(3);
  const [allowedNextMonth] = useState(1);
  const formattedMonth = format(currentMonth, "MMMM yyyy");
  const [attendanceData, setAttendanceData] = useState([]);
  const userData = useSelector(state => state.auth.user);
  let company_id = userData.company.id;
  let employee_id = userData.id;
  const today = new Date();

  const updateCalendar = (month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const weeksInterval = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
    const weeks = weeksInterval.map((weekStart) => {
      const weekRange = {
        start: startOfWeek(weekStart, { weekStartsOn: 1 }),
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      };
      return eachDayOfInterval(weekRange);
    });
    setWeeks(weeks);
    setSelectedWeek(0);
  };

  const handleCheckIn = async () => {
    const checkInToast = toast.loading("Processing your request...", { autoClose: 5000 });
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets/check-in`, {
        company_id: company_id,
        employee_id: employee_id,
      });
      if (response.status === 201) {
        toast.update(checkInToast, { render: "Check-in created successfully!", type: "success", isLoading: false, autoClose: 5000 });
        fetchEmployeeTimesheet();
      }
    } catch (error) {
      if (error.response) {
        toast.update(checkInToast, { render: `Error: ${error.response.data.message}`, type: "error", isLoading: false, autoClose: 5000 });
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  const handleCheckOut = async () => {
    const checkOutToast = toast.loading("Processing your request...", { autoClose: 5000 });
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets/check-out`, {
        company_id: company_id,
        employee_id: employee_id,
      });
      if (response.status === 201) {
        toast.update(checkOutToast, { render: "Check-Out created successfully!", type: "success", isLoading: false, autoClose: 5000 });
        fetchEmployeeTimesheet();
      }
    } catch (error) {
      if (error.response) {
        toast.update(checkOutToast, { render: `Error: ${error.response.data.message}`, type: "error", isLoading: false, autoClose: 5000 });
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const currentPlusAllowed = new Date();
    currentPlusAllowed.setMonth(currentPlusAllowed.getMonth() + allowedNextMonth);
    if (next <= currentPlusAllowed) {
      setCurrentMonth(next);
    }
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMinusAllowed = new Date();
    currentMinusAllowed.setMonth(currentMinusAllowed.getMonth() - allowedPrevMonth);
    if (prev >= currentMinusAllowed) {
      setCurrentMonth(prev);
    }
  };

  const fetchEmployeeTimesheet = async () => {
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets/mytimesheet/${employee_id}`, {
        month: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
      });
      if (response.data.timesheets) {
        const transformedData = transformTimesheetData(response.data.timesheets);
        setAttendanceData(transformedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployeeTimesheetForManager = async () => {
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets`, {
        month: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
      });
      if (response.data.timesheets) {
        const transformedData = response.data.timesheets;
        setAttendanceData(transformedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    updateCalendar(currentMonth);
    if (userData.role === 'manager') {
      fetchEmployeeTimesheetForManager();
    } else {
      fetchEmployeeTimesheet();
    }
  }, [currentMonth]);

  const generateDaysArray = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i < 10 ? `0${i}` : `${i}`);
    }
    return daysArray;
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);


  const daysArray = generateDaysArray(currentMonth.getFullYear(), currentMonth.getMonth());

  const nextWeek = () => {
    if (selectedWeek < weeks.length - 1) {
      setSelectedWeek(selectedWeek + 1);
    } else {
      nextMonth();
      setSelectedWeek(0);
    }
  };

  const prevWeek = () => {
    if (selectedWeek > 0) {
      setSelectedWeek(selectedWeek - 1);
    } else {
      prevMonth();
      setSelectedWeek(weeks.length - 1);
    }
  };

  const calculateHours = (checkIn, checkOut) => { 
    if (!checkIn) return "0H 0m"; // Return "0H 0M" if check-in is missing

    let checkInTime = new Date(`1970-01-01T${checkIn}`);
    let checkOutTime;

    if (!checkOut) { 
        return "8H 0M"; // Assume 8 hours with 0 minutes if check-out is missing
    } else {
        checkOutTime = new Date(`1970-01-01T${checkOut}`);
    }

    if (checkOutTime < checkInTime) {
        checkOutTime.setDate(checkOutTime.getDate() + 1);
    }

    let diffMinutes = Math.round((checkOutTime - checkInTime) / (1000 * 60));
    let hours = Math.floor(diffMinutes / 60);
    let minutes = diffMinutes % 60;

    return `${hours}H ${minutes}m`;
}



  return (
    <div className='w-full p-2 relative h-full max-h-[calc(100vh_-_2rem)]'>
      <Card className="rounded-md" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-4)' }}>
        <div className='flex justify-between items-center p-4' style={{ borderBottom: '1px solid var(--gray-5)' }}>
          <Typography className='text-lg font-bold'>TimeSheet</Typography>
          {/* <Button className="block sm:hidden">
            <Bars3Icon />
          </Button> */}
        </div>
        <div className='relative overflow-y-auto'>
          <Card className='h-full p-4'>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <button onClick={prevMonth}><ChevronLeft title="Previous Month" className='mx-8 w-12 h-12' /></button>
                  <h1>{formattedMonth}</h1>
                  <button onClick={nextMonth}><ChevronRight title="Next Month" className='mx-8 w-12 h-12' /></button>
                </div>
                {userData.role !== 'manager' && 
                <div className='flex gap-4'>
                  <Button onClick={handleCheckIn}>Check In</Button>
                  <Button onClick={handleCheckOut}>Check Out</Button>
                </div>
                }
              </div>
              <div className="flex justify-center items-center">
                <button onClick={prevWeek}><ChevronLeft title="Previous Week" className='mx-8 w-12 h-12' /></button>
                <h1>Week {selectedWeek + 1}</h1>
                <button onClick={nextWeek}><ChevronRight title="Next Week" className='mx-8 w-12 h-12' /></button>
              </div>
              <div className=" ">
                <div className="flex flex-col gap-8 w-full">
                  {userData && userData.role === 'manager' ? (
                    <Card className="p-4 w-full max-w-full sm:max-w-[calc(100vw_-_350px)] overflow-x-auto">
                      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Employee</th>
                            {weeks.length > 0 && weeks[selectedWeek].map((day) => (
                              <th key={day} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {format(day, 'dd')}
                              </th>
                            ))}
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((entry) => {
                              let totalHours = 0;  
                              let totalMinutes = 0;

                              return (
                                <tr key={entry.user.id}> 
                                  <td className='border border-gray-200 p-4 min-w-[200px]'>
                                    {entry.user.firstname} {entry.user.lastname}
                                  </td> 
                                  {weeks[selectedWeek].map((day) => {
                                    const date = format(day, 'yyyy-MM-dd');  
                                    const record = entry.attendance[date] || { check_in: null, check_out: null }; 
                                    const hoursString = calculateHours(record.check_in, record.check_out);  
                                    const [hours, minutes] = hoursString.match(/\d+/g).map(Number); 

                                    // Accumulate total weekly hours & minutes
                                    totalHours += hours;
                                    totalMinutes += minutes;

                                    // Convert excess minutes into hours immediately
                                    totalHours += Math.floor(totalMinutes / 60);
                                    totalMinutes %= 60;

                                    return (
                                      <td
                                        key={day}
                                        style={{
                                          border: '1px solid #ddd',
                                          padding: '8px', 
                                          maxWidth: '80px',
                                        }}
                                        className='border border-gray-300 min-w-[200px] w-full'
                                      >
                                        {record.check_in ? (
                                          <>
                                            <div>Check in: <span className='font-bold'>{format(new Date(`${date}T${record.check_in}`), 'hh:mm a')}</span></div>
                                            <div>Check out: <span className='font-bold'>{record.check_out ? format(new Date(`${date}T${record.check_out}`), 'hh:mm a') : 'N/A'}</span></div>
                                          </>
                                        ) : (
                                          '-'  
                                        )}
                                      </td>
                                    );
                                  })} 
                                  <td className="min-w-[100px] border border-e-gray-100 p-4" >
                                    {totalHours}H {totalMinutes}M
                                  </td> {/* ✅ Display the full accumulated weekly total here */}
                                </tr>
                              );
                          })}
                        </tbody>
                      </table>
                    </Card>
                  ) : (
                    weeks[selectedWeek] && (
                      <AttendanceTable
                        weekDates={weeks[selectedWeek]}
                        weekNumber={selectedWeek + 1}
                        attendanceData={attendanceData}
                        currentMonth={currentMonth}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

export default TimeSheet;