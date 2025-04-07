import React, { useState, useEffect } from "react";
import { addWeeks, subWeeks, startOfWeek, addDays, getISOWeek, getYear, format } from "date-fns";
import { Card, CardBody, CardHeader, Button, Typography, Spinner, Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";
 
import { useSelector } from "react-redux";
import useAuthAxios from "@/lib/authAxios";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

const MySchedule = () => {
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const axiosInstance = useAuthAxios();

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [isManager, setIsManager] = useState(false);

  const userData = useSelector((state) => state.auth.user); 

  const myid = userData.id;

  const selectedDate = addWeeks(new Date(), weekOffset);
  const weekNumber = getISOWeek(selectedDate);
  const year = getYear(selectedDate);

  // Fetch schedules from the backend
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/companies/${userData.company.id}/schedules`, {
        week_number: weekNumber,
        year: year,
        company_id: userData.company.id,
      });
      if (response?.data.success) {
        setSchedules(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

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
  useEffect(() => {
    fetchCompanyEmployees();

    fetchSchedules();
  }, [weekOffset]);

  // Get the dates for the current week
  const getWeekDays = (weekNumber) => {
    const startDate = startOfWeek(
      new Date(year, 0, 1 + (weekNumber - 1) * 7),
      { weekStartsOn: 1 }
    );
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  };

  const weekDays = getWeekDays(weekNumber);

  const TableHeader = () => {
    return (
      <thead>
        <tr>
          <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Employee
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
  };

  // const getShiftForDay = (userData, dayIndex) => {
  //     const schedule = JSON.parse(userData.schedule);
  //     return schedule[dayIndex] ? userData.shift : null;
  // };

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

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <Card className="w-full h-full mt-4">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-8">
          <Typography variant="h5" color="blue-gray">
            My Schedule
          </Typography>
        </div>
        <div className="flex flex-col mt-4">
          <div className="flex flex-col sm:flex-row w-full justify-between gap-4">
            <div className="flex justify-end gap-4">
              <Button onClick={() => setWeekOffset((prev) => prev - 1)}>Previous Week</Button>
              {/* <Button onClick={() => setWeekOffset(0)}>This Week</Button> */}
              <Button onClick={() => setWeekOffset((prev) => prev + 1)}>Next Week</Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                                <tr>
                                    <td className="px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-center" colSpan={8}>
                                        <div className='flex justify-center gap-4 w-full'><Spinner /> Loading!</div>
                                    </td> 
                                </tr>
              ) : (
                employees.length > 0 ? (
                    employees.map((employee) => (
                        <tr key={employee.id}> 
                            <td className="px-2 py-4 font-medium text-gray-900 border-b">
                                {employee.firstname} {employee.lastname} { myid == employee.id && <span className="font-medium italic">(You)</span>}
                            </td> 
                            {weekDays.map((day, index) => {
                                const shiftData = schedules[employee.id];
                                const formattedDay = format(day, "yyyy-MM-dd");  
 
                                const dayShift = shiftData?.shifts?.find((shift) => shift.date === formattedDay);
                                return (
                                    <td key={index} className="group px-2 py-4 border-b w-[9rem]">
                                        {dayShift ? (
                                            <ShiftCell shift={dayShift} notes={shiftData?.notes} />
                                        )
                                        :
                                        <span className="text-gray-500">No Shift</span>
                                        }
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
                            No Schedule added yet
                        </td>
                    </tr>
                )
            )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default MySchedule;