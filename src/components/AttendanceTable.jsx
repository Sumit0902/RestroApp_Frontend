import { format, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

export function AttendanceTable({ weekDates, weekNumber, attendanceData, currentMonth }) {
    const today = new Date();

    return (
        <Card className="p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] bg-muted">
                            <div className="font-semibold">Week {weekNumber}</div>
                        </TableHead>
                        {weekDates.map((date) => {
 
                            return (
                            <TableHead
                                key={date.toISOString()}
                                className={cn(
                                    "text-center min-w-[120px]",
                                    isSameDay(date, today) ? 'bg-black text-white' : ''
                                )}
                            >   
                                {
                                    !isSameMonth(date, currentMonth) ?
                                    <></>
                                    :
                                    <>
                                        <div className="font-semibold">{format(date, "MMM dd")}</div>
                                        <div className="text-sm font-normal">{format(date, "EEEE")}</div>
                                    </>
                                }
                            </TableHead>
                        )}
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium bg-muted">Check In</TableCell>
                        {weekDates.map((date) => {
                            const attendance = attendanceData[format(date, "yyyy-MM-dd")];
                            const isPast = date < today;
                            const showAbsent = isPast && attendance && !attendance.checkin && !attendance.checkout;

                            return (
                                <TableCell
                                    key={`checkin-${date.toISOString()}`}
                                    className={cn(
                                        "text-center",
                                         isSameDay(date, today) ? 'bg-black text-white' : ''
                                    )}
                                >
                                    {showAbsent ? "ABSENT" : attendance?.checkin || (isPast ? "-" : "")}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium bg-muted">Check Out</TableCell>
                        {weekDates.map((date) => {
                            const attendance = attendanceData[format(date, "yyyy-MM-dd")];
                            const isPast = date < today;
                            const showAbsent = isPast && attendance && !attendance.checkin && !attendance.checkout;

                            if (showAbsent) {
                                return null;
                            }

                            return (
                                <TableCell
                                    key={`checkout-${date.toISOString()}`}
                                    className={cn(
                                        "text-center",
                                        isSameDay(date, today) ? 'bg-black text-white' : ''
                                    )}
                                >
                                    {attendance?.checkout || (attendance?.checkin ? "NOT ADDED" : (isPast ? "-" : ""))}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
    );
}
