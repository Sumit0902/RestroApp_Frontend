import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAuthAxios from "@/lib/authAxios";
import { format, subMonths } from "date-fns";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Spinner,
} from "@material-tailwind/react";

const MyPayroll = () => {
  const userData = useSelector((state) => state.auth.user);
  const axiosInstance = useAuthAxios();
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate the last 12 months
  const generateLast12Months = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      months.push(format(date, "yyyy-MM"));
    }
    return months;
  };

  const last12Months = generateLast12Months();

  // Fetch payroll data for the last 12 months
  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/companies/${userData.company.id}/payroll/${userData.id}`
      );
      console.log("API Response:", response.data);
      setPayrollData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  return (
    <Card className="h-full w-full mt-4">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <Typography variant="h5" color="blue-gray">
          My Payroll
        </Typography>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        {loading ? (
          <div className="flex justify-center items-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4">
                  Month
                </th>
                <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4">
                  Wage Rate
                </th>
                <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4">
                  Total Amount
                </th>
                <th className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {last12Months.map((month) => {
                const payroll = payrollData.find((entry) =>
                  entry.created_at.startsWith(month)
                );

                return (
                  <tr key={month}>
                    {/* Month */}
                    <td className="p-4 text-gray-900 border-b">
                      {format(new Date(month), "MMMM yyyy")}
                    </td>

                    {/* Wage Rate */}
                    <td className="p-4 text-gray-900 border-b">
                      {payroll
                        ? `$${parseFloat(payroll.basic_salary).toFixed(2)}`
                        : "-"}
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 text-gray-900 border-b">
                      {payroll
                        ? `$${parseFloat(payroll.total_salary).toFixed(2)}`
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-gray-900 border-b">
                      {payroll ? (
                        <a
                          href={`${payroll.payslip_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-red-600">Not Available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
};

export default MyPayroll;