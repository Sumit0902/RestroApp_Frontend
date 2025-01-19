import { useEffect, useState } from 'react'; 
import { eachDayOfInterval, eachWeekOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes"  


import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceTable } from '@/components/AttendanceTable.jsx';
import useAuthAxios from '@/lib/authAxios.js';
import { useSelector } from 'react-redux';
import { cn, transformTimesheetData } from '@/lib/utils.js';
import { Card } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { toast, ToastContainer } from 'react-toastify';
 


function TimeSheet() {
  
  const [isLoading, setIsLoading] = useState(true)
  const authAxios = useAuthAxios();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weeks, setWeeks] = useState([]);
  const [allowedPrevMonth] = useState(3);
  const [allowedNextMonth] = useState(1);
  const formattedMonth = format(currentMonth, "MMMM yyyy");
  const [attendanceData, setAttendanceData] = useState({});
   
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
  };

  const handleCheckIn = async () => {
	const checkInToast = toast.loading("Processing your request...", {autoClose: 5000})
    const now = new Date();
	console.log(userData)
    try { 
        const response = await authAxios.post(`/companies/${company_id}/timesheets/check-in`, {
            company_id: company_id,
            employee_id: employee_id,
        });
 
        if (response.status === 201) {  
			toast.update(checkInToast, { render: "Check-in created successfully!", type: "success", isLoading: false, autoClose: 5000 });
			fetchEmployeeTimesheet()
        }
    } catch (error) { 
        if (error.response) { 
            // console.error('Error:', error.response.data.message);
			toast.update(checkInToast, { render: `Error: ${error.response.data.message}`, type: "error", isLoading: false, autoClose: 5000  });
			// toast.error(`Error: ${error.response.data.message}`);  
        } else { 
            console.error('Error:', error.message); 
        }
    }

	 
  }
  

  const handleCheckOut = async () => {
	const checkOutToast = toast.loading("Processing your request...", {autoClose: 5000})
	try { 
        const response = await authAxios.post(`/companies/${company_id}/timesheets/check-out`, {
            company_id: company_id,
            employee_id: employee_id,
        });
 
        if (response.status === 201) {
            // console.log('Check-in successful:', response.data.timesheet); 
			toast.update(checkOutToast, { render: "Check-Out created successfully!", type: "success", isLoading: false, autoClose: 5000  });
			fetchEmployeeTimesheet()
        }
    } catch (error) { 
        if (error.response) { 
            // console.error('Error:', error.response.data.message);
			toast.update(checkOutToast, { render: `Error: ${error.response.data.message}`, type: "error", isLoading: false, autoClose: 5000  });

			// toast.error(`Error: ${error.response.data.message}`);  
        } else { 
            console.error('Error:', error.message); 
        }
    }
  }

  // const handleDelete = (id) => {
  //   setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  // };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const currentPlusAllowed = new Date();
    currentPlusAllowed.setMonth(currentPlusAllowed.getMonth() + allowedNextMonth);

    if (next <= currentPlusAllowed) {
      setCurrentMonth(next);
    }
    console.log(next, currentMonth, next.getMonth(), currentMonth.getMonth());
    
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
    console.log('fetchedagain with new date')
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets/mytimesheet/${employee_id}`, {
        month: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
        // month:  currentMonth
      });

      if(response.data.timesheets) {
        const transformedData = transformTimesheetData(response.data.timesheets);
        setAttendanceData(transformedData)
      }
      console.log(response, 'ajax respo')
    } catch (error) {
      console.error(error)
    }
  }

  const fetchEmployeeTimesheetForManager = async () => { 
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets`, {
        month: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
        // month:  currentMonth
      });

      if(response.data.timesheets) {
        const transformedData = response.data.timesheets;
        setAttendanceData(transformedData)
      }
      console.log(response, 'ajax respo')
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    updateCalendar(currentMonth);
	if(userData.role == 'manager') {
		fetchEmployeeTimesheetForManager()
	}
	else {
		fetchEmployeeTimesheet();
	}
  }, [currentMonth]);

  useEffect(() => {
	updateCalendar(currentMonth);
	if(userData.role == 'manager') {
		fetchEmployeeTimesheetForManager()
	}
	else {
		fetchEmployeeTimesheet();
	}
  }, []);

  	const generateDaysArray = (year, month) => {
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysArray = [];
		for (let i = 1; i <= daysInMonth; i++) {
			daysArray.push(i < 10 ? `0${i}` : `${i}`);
		}
		return daysArray;
	};

	const daysArray = generateDaysArray(currentMonth.getFullYear(), currentMonth.getMonth());	

	return (
		<div className='w-full p-2 relative h-full  max-h-[calc(100vh_-_2rem)]  '>
			<Box className="rounded-md" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-4)' }}>
				{/* Header */}
				<Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
					<Text size="5" weight="bold">TimeSheet</Text>
					<Button variant="ghost" style={{ display: 'none' }}>
						<HamburgerMenuIcon />
					</Button>
				</Flex>

				{/* Scrollable Content Area */}
				<ScrollArea>
					<Box p='4' className='max-h-[calc(100vh_-_5rem)]'>
						<div className="space-y-4">
							<div className="flex items-center justify-between space-x-4">
								<div className="flex items-center space-x-4">
									
								</div>
								<div className='flex gap-4'> 
									<Button onClick={handleCheckIn} >Check In</Button>  
									<Button onClick={handleCheckOut} >Check Out</Button> 
								</div>
							</div>

							<div className="overflow-x-auto">
								<div className="flex justify-center items-center">
								<button onClick={prevMonth}><ChevronLeft title="Previous Month" className='mx-8 w-12 h-12'/></button>
								<h1>{formattedMonth}</h1>
								<button onClick={nextMonth}><ChevronRight title="Next Month" className='mx-8 w-12 h-12'/></button>
								</div>
								<div className="flex flex-col gap-8 ">
									{userData && userData.role === 'manager' ? (
										<Card className="p-4 w-full max-w-[calc(100vw_-_350px)] overflow-x-auto">
										<Table className="w-full">
											<TableHeader>
												<TableRow>
													<TableHead className="w-[100px] bg-muted">
														<div className="font-semibold">Name of Employees</div>
													</TableHead>
													{daysArray.map((day, key) => (
														<TableHead
															key={key}
															className={cn(
																"text-center min-w-[120px]",
																(day ==  today.getDay()) ? 'bg-black text-white' : ''
															)}
														>
															<>
																<div className="font-semibold">{`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}</div>
																{/* <div className="text-sm font-normal">{format(day, "EEEE")}</div> */}
															</>
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{attendanceData.length > 0 ? (
													attendanceData.map((employee, index) => {
														console.log(employee)
														return (
															<TableRow key={index}>
																<TableCell className="font-medium bg-muted">{employee.user.name}</TableCell>
																{daysArray.map((day) => { 
																	// const dateKey = format(day, "yyyy-MM-dd");	
																	const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
																	const attendance = employee.attendance_days[dateKey];
																	return (
																		<TableCell
																			key={day}
																			className={cn(
																				"text-center",
																				isSameDay(day, today) ? 'bg-black text-white' : ''
																			)}
																		>
																			{attendance ? (
																				<>
																					<div className='my-2 bg-green-300'>{format(new Date(attendance.checkin), "hh:mm a")}</div>
																					<div className='my-2 bg-blue-300'> {attendance.checkout ? format(new Date(attendance.checkout), "hh:mm a") : "N/A"}</div>
																				</>
																			) : (
																				"N/A"
																			)}
																		</TableCell>
																	);
																})}
															</TableRow>
														)
													})
												) : (
													<TableRow>
														<TableCell colSpan={daysArray.length + 1} className="font-medium bg-muted">No employee data </TableCell>
														 
														{/* <TableCell className="font-medium bg-muted">No employee data {attendanceData.length }</TableCell>
														{daysArray.map((day, key) => (
															<TableCell
																key={key}
																className={cn(
																	"text-center",
																	isSameDay(day, today) ? 'bg-black text-white' : ''
																)}
															>
																N/A
															</TableCell>
														))} */}
													</TableRow>
												)}
											</TableBody>
										</Table>
									</Card>
									
									) : (
										weeks.map((weekDates, index) => (
											<AttendanceTable
												key={index}
												weekDates={weekDates}
												weekNumber={index + 1}
												attendanceData={attendanceData}
												currentMonth={currentMonth}
											/>
										))
									)}
								</div>
							</div>
						</div>
					</Box>
				</ScrollArea>
			</Box> 
		</div>
	)
}


export default TimeSheet;