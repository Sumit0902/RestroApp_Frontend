import React, { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, addDays, subWeeks, addWeeks, parseISO } from "date-fns";
import { toZonedTime, format as formatWithTZ } from "date-fns-tz"; // Import timezone utilities
import useAuthAxios from "@/lib/authAxios";
import { useSelector } from "react-redux";
import { Card, Typography, Spinner, Button } from "@material-tailwind/react";
import { toast } from "react-toastify";

const MyTimesheet = () => {
  const authAxios = useAuthAxios();
  const userData = useSelector((state) => state.auth.user);
  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const company_id = userData.company.id;
  const employee_id = userData.id;

  const timeZone = import.meta.env.VITE_TIMEZONE || "UTC"; // Read timezone from .env

  // const weekStart = toZonedTime(startOfWeek(currentWeek, { weekStartsOn: 1 }), timeZone); // Monday
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = toZonedTime(addDays(weekStart, 6), timeZone); // Sunday

  const weekDates = Array.from({ length: 7 }, (_, i) =>
      formatWithTZ(addDays(weekStart, i), "yyyy-MM-dd", { timeZone })
  );
  // Fetch timesheet data for the current week
  const fetchTimesheetData = async () => {
    setLoading(true);
    try {
      const response = await authAxios.post(
        `/companies/${company_id}/timesheets/mytimesheet`,
        {
          month: formatWithTZ(currentWeek, "yyyy-MM", { timeZone }),
        }
      );
      setTimesheetData(response.data.timesheets || []);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheetData();
    console.log('dfdsfdsfdsf', timeZone);
    
  }, [currentWeek]);

  // Update the current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total hours worked for a day
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = parseISO(checkIn);
    const checkOutDate = parseISO(checkOut);
    const hours = (checkOutDate - checkInDate) / (1000 * 60 * 60); // Convert milliseconds to hours
    return hours.toFixed(1);
  };

  // Extract time in the specified timezone
  const extractTime = (dateString) => {
    const zonedDate = toZonedTime(parseISO(dateString), timeZone);
    return formatWithTZ(zonedDate, "hh:mm a", { timeZone });
  };

  // Handlers for navigating weeks
  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  // Check if the user has already checked in today
  const today = formatWithTZ(new Date(), "yyyy-MM-dd", { timeZone });
  const todayRecord = timesheetData.find((entry) => entry.check_in.startsWith(today));
  const isCheckedIn = !!todayRecord;

  // Handlers for Check In and Check Out
  const handleCheckIn = async () => {
    const checkInToast = toast.loading("Processing your request...", { autoClose: 5000 });
    try {
      const response = await authAxios.post(`/companies/${company_id}/timesheets/check-in`, {
        company_id: company_id,
        employee_id: employee_id,
      });

      if (response.status === 201) {
        toast.update(checkInToast, {
          render: "Check-in created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        fetchTimesheetData(); // Refresh timesheet data
      }
    } catch (error) {
      if (error.response) {
        toast.update(checkInToast, {
          render: `Error: ${error.response.data.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        console.error("Error:", error.message);
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
        toast.update(checkOutToast, {
          render: "Check-Out created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        fetchTimesheetData(); // Refresh timesheet data
      }
    } catch (error) {
      if (error.response) {
        toast.update(checkOutToast, {
          render: `Error: ${error.response.data.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <Card className="h-full w-full mt-4">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <Typography variant="h5" color="blue-gray">
            My Timesheet
          </Typography>
          <Typography variant="small" color="gray" className="mt-1">
            Week: {formatWithTZ(weekStart, "dd MMM yyyy", { timeZone })} -{" "}
            {formatWithTZ(weekEnd, "dd MMM yyyy", { timeZone })}
          </Typography>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="solid"
            color="black"
            onClick={handlePreviousWeek}
          >
            Previous Week
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="black"
            onClick={handleNextWeek}
          >
            Next Week
          </Button>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center bg-gray-100 rounded-md mb-4">
        <div>
          <Typography variant="h6" color="blue-gray">
             Current Time
          </Typography>
          <Typography variant="h1" color="blue-gray">
             {formatWithTZ(currentTime, "hh:mm:ss a", { timeZone })}
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            variant="solid"
            color="black"
            onClick={handleCheckIn}
            disabled={isCheckedIn}
          >
            Check In
          </Button>
          <Button
            size="lg"
            variant="solid"
            color="black"
            onClick={handleCheckOut}
            disabled={!isCheckedIn}
          >
            Check Out
          </Button>
        </div>
      </div>
      <div className="overflow-scroll px-4">
        {loading ? (
          <div className="flex justify-center items-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <table className="mt-4 w-full min-w-max table-auto text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Check Out</th>
                <th className="px-4 py-2 border">Total Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {weekDates.map((date) => {
                console.log(weekDates, date, 'sdfsdfsdf')
                const record = timesheetData.find((entry) =>
                  entry.check_in.startsWith(date)
                );
                const checkIn = record?.check_in ? extractTime(record.check_in) : "-";
                const checkOut = record?.check_out ? extractTime(record.check_out) : "-";
                const totalHours = calculateHours(record?.check_in, record?.check_out);

                return (
                  <tr key={date}>
                    <td className="px-4 py-2 border">{formatWithTZ(new Date(date), "EEEE, dd MMM yyyy", { timeZone })}</td>
                    <td className="px-4 py-2 border">{checkIn}</td>
                    <td className="px-4 py-2 border">{checkOut}</td>
                    <td className="px-4 py-2 border">{totalHours > 0 ? `${totalHours}h` : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

export default MyTimesheet;