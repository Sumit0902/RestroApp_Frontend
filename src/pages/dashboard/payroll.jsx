import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAuthAxios from "@/lib/authAxios.js";
import { MagnifyingGlassIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
    Card,
    CardHeader,
    Input,
    Typography,
    Button,
    CardBody,
    Chip,
    CardFooter,
    IconButton,
    Tooltip,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Select,
    Option,
    Spinner,
} from "@material-tailwind/react";
import { EyeIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { format, subMonths } from 'date-fns';
import { toast } from 'react-toastify';

const Payroll = () => {
    const userData = useSelector(state => state.auth.user);
    const axiosInstance = useAuthAxios();
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('firstname');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [openPaySlipModal, setopenPaySlipModal] = useState(false);
    const [openPayrollModal, setOpenPayrollModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState({});
    const [bonus, setBonus] = useState(0);
    const [deduction, setDeduction] = useState(0);
    const [hoursWorkedPay, setHoursWorkedPay] = useState(0); // State for hours worked pay
    const [overtimePay, setOvertimePay] = useState(0); // State for overtime pay
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [submittingPayroll, setSubmittingPayroll] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [payslipUrl, setPayslipUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const payRateUnits = {
        'hourly': 'hour',
        'daily': 'day',
        'weekly': 'week',
        'monthly': 'month',
        'yearly': 'year',
    };

    const fetchEmployeePayrolls = async (month = selectedMonth) => {
        setLoading(true);
        if (userData) {
            const company_id = userData.company.id;
            const employeesResponse = await axiosInstance.post(`/companies/${company_id}/payroll?month=${month}`);
            const employees = employeesResponse.data.data || [];
            setEmployees(employees);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployeePayrolls();
    }, [selectedMonth]);

    const fetchEmployeeDetails = async (employeeId) => {
        setLoadingDetails(true);
        try {
            const company_id = userData.company.id;
            const response = await axiosInstance.post(`/companies/${company_id}/employees/${employeeId}/payroll`, {
                month: selectedMonth,
            });
            const details = response.data.data || {};
            setEmployeeDetails(details);

            // Calculate hours worked pay and overtime pay
            calculateHoursWorkedPay(details);
            calculateOvertimePay(details);
        } catch (error) {
            console.error('Error fetching employee details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const openGeneratePayrollModal = (employee) => {
        setSelectedEmployee(employee);
        setBonus(0);
        setDeduction(0);
        fetchEmployeeDetails(employee.id);
        setOpenPayrollModal(true);
    };

    const closeGeneratePayrollModal = () => {
        setSelectedEmployee(null);
        setEmployeeDetails({});
        setBonus(0);
        setDeduction(0);
        setHoursWorkedPay(0);
        setOvertimePay(0);
        setOpenPayrollModal(false);
    };

    const calculateOvertimePay = (details) => {
        const { ot_type, ot_rate } = userData.company;
        const { wage_rate, otHours } = details;

        if (!otHours || !wage_rate) {
            setOvertimePay(0);
            return;
        }

        if (ot_type === 'fixed') {
            let otRate = (parseFloat(ot_rate) * parseFloat(otHours)).toFixed(2);
            setOvertimePay(parseFloat(otRate)); // Fixed rate calculation
        } else if (ot_type === 'percentage') {
            const percentageRate = parseFloat(ot_rate) / 100;
            let otRate = (parseFloat(wage_rate) + (parseFloat(wage_rate) * percentageRate)) * parseFloat(otHours);
            setOvertimePay(parseFloat(otRate.toFixed(2))); // Percentage rate calculation
            
        }
    
    };

    const calculateHoursWorkedPay = (details) => {
        const { wage_rate, hoursWorked } = details;
        if (!hoursWorked || !wage_rate) {
            setHoursWorkedPay(0);
            return;
        }
        setHoursWorkedPay((wage_rate * hoursWorked).toFixed(2)); // Hours worked pay calculation
    };

    const calculateTotalPayment = () => {
        console.log('Calculating total payment...',parseFloat(hoursWorkedPay) , parseFloat(overtimePay),  parseFloat(bonus || 0) , parseFloat(deduction || 0) );
        return (
            parseFloat(hoursWorkedPay) +
            parseFloat(overtimePay) +
            parseFloat(bonus || 0) -
            parseFloat(deduction || 0)
        ).toFixed(2);


    };

    const handleGeneratePayroll = async () => {
        setSubmittingPayroll(true);
        const company_id = userData.company.id;
        try {
            const payload = {
                bonus,
                deduction, 
            };
            const response = await axiosInstance.post(`/companies/${company_id}/payroll/generate/${selectedEmployee.id}`, payload);
            if (response.data.success) {
                closeGeneratePayrollModal();
                fetchEmployeePayrolls();
                toast.success('Payroll generated successfully!');
            }
        } catch (error) {
            console.error('Error generating payroll:', error);
            toast.error('Failed to generate payroll.');
        } finally {
            setSubmittingPayroll(false);
        }
    };

    const generateLast12Months = () => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = subMonths(new Date(), i);
            months.push(format(date, 'yyyy-MM'));
        }
        return months;
    };

    const filteredEmployees = employees.filter(employee =>
        employee?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedEmployees = sortedEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
    const currentDate = format(new Date(), 'dd/MM/yyyy');
    const currentMonth = format(new Date(), 'MMMM yyyy');

    const handlePayslipModal = (url) => {
        setPayslipUrl(url);
        setopenPaySlipModal(!openPaySlipModal);
    };

    return (
        <Card className="h-full w-full mt-4">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="mb-8 flex items-center justify-between gap-8">
                    <Typography variant="h5" color="blue-gray">
                        Payroll
                    </Typography>
                </div>
            </CardHeader>
            <CardBody className="overflow-auto px-0">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="w-full md:w-72">
                        <Input
                            label="Search"
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-72">
                        <Select
                            label="Select Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e)}
                        >
                            {generateLast12Months().map(month => (
                                <Option key={month} value={month}>
                                    {format(new Date(month), 'MMMM yyyy')}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <table className="mt-4 w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            <th className="p-4">Employee</th>
                            <th className="p-4">Hourly Rate</th>
                            <th className="p-4">Hours Worked</th>
                            <th className="p-4">OT Hours</th>
                            <th className="p-4">Gross Pay</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="p-4 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Spinner className="h-6 w-6" />
                                        <Typography variant="small" color="blue-gray">
                                            Loading...
                                        </Typography>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <div>{employee.firstname} {employee.lastname}</div>
                                            <div className="italic">{employee.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">{`€${employee.wage_rate}` || '-'}</td>
                                    <td className="p-4">{employee?.hours_worked?.hoursWorkedFormatted || '-'}</td>
                                    <td className="p-4">{employee?.hours_worked?.otHoursFormatted || '-'}</td>
                                    <td className="p-4">{`€${(employee.wage_rate * employee?.hours_worked?.hoursWorked).toFixed(2)}` || '-'}</td>
                                    <td className="p-4">
                                        {employee.payroll_status ? (
                                            <span className="bg-green-200 text-green-900 rounded-md text-xs px-2 py-1">
                                                Generated
                                            </span>
                                        ) : (
                                            <span className="bg-red-200 text-red-900 rounded-md text-xs px-2 py-1">
                                                Not Available
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {employee.payroll_status ? (
                                            <Tooltip content="View Salary Slip">
                                                <IconButton variant="text">
                                                    <EyeIcon
                                                        className="h-5 w-5"
                                                        onClick={() => handlePayslipModal(employee.payroll_status)}
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip content="Generate Payroll">
                                                <IconButton
                                                    variant="text"
                                                    onClick={() => openGeneratePayrollModal(employee)}
                                                >
                                                    <PlusCircleIcon className="h-5 w-5" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-4 text-center">
                                    No Data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardBody>
            <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                <Typography variant="small" color="blue-gray" className="font-normal">
                    Page {currentPage} of {totalPages}
                </Typography>
                <div className="flex gap-2">
                    <Button variant="outlined" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                        Previous
                    </Button>
                    <Button variant="outlined" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                        Next
                    </Button>
                </div>
            </CardFooter>

            {/* Generate Payroll Modal */}
            <Dialog open={openPayrollModal} handler={closeGeneratePayrollModal}>
                <DialogHeader>Generate Payroll for {selectedEmployee?.firstname} {selectedEmployee?.lastname}</DialogHeader>
                <DialogBody>
                    {loadingDetails ? (
                        <div className="flex items-center justify-center">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Input
                                label="Payrate (€)"
                                value={`${employeeDetails.wage_rate}/${payRateUnits[employeeDetails.wage]}`}
                                className="w-full read-only:bg-gray-200"
                                readOnly
                            />
                            <Input
                                label="Hours Worked (HH:mm)"
                                value={employeeDetails.hoursWorkedFormatted}
                                className="w-full read-only:bg-gray-200"
                                readOnly
                            />
                            <Input
                                label="Overtime Hours (HH:mm)"
                                value={employeeDetails.otHoursFormatted}
                                className="w-full read-only:bg-gray-200"
                                readOnly
                            />
                            <Input
                                label="Pay for Hours Worked (€)"
                                value={hoursWorkedPay} // Using state variable
                                className="w-full read-only:bg-gray-200"
                                readOnly
                            />
                            <Input
                                label="Pay for Overtime Hours (€)"
                                value={overtimePay} // Using state variable
                                className="w-full read-only:bg-gray-200"
                                readOnly
                            />
                            <Input
                                label="Bonus (€)"
                                type="number"
                                value={bonus}
                                onChange={(e) => setBonus(e.target.value)}
                            />
                            <Input
                                label="Deduction (€)"
                                type="number"
                                value={deduction}
                                onChange={(e) => setDeduction(e.target.value)}
                            />
                            <Input
                                label="Total Payment(€)"
                                value={calculateTotalPayment()} // Using calculated total payment
                                className="w-full read-only:bg-gray-200"
                                readOnly
                            />
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={closeGeneratePayrollModal}
                        className="mr-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        color="green"
                        onClick={handleGeneratePayroll}
                        disabled={submittingPayroll}
                    >
                        {submittingPayroll ? <Spinner className="h-5 w-5" /> : 'Generate'}
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={openPaySlipModal} handler={handlePayslipModal}>
                <DialogHeader>Payslip for {currentMonth}.</DialogHeader>
                <DialogBody>
                    <iframe src={payslipUrl} width="100%" height="500px" title="Payslip"></iframe>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handlePayslipModal}
                        className="mr-1"
                    >
                        <span>Cancel</span>
                    </Button>
                    <Button variant="gradient" color="green" onClick={handlePayslipModal}>
                        <span>Confirm</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
};

export default Payroll;
