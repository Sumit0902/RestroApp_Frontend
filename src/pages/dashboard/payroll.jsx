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
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [generatingPayslip, setgeneratingPayslip] = useState(false);
    const [payslipUrl, setPayslipUrl] = useState('');

    const fetchEmployeePayrolls = async (month = selectedMonth) => {
        if (userData) {
            const company_id = userData.company.id;
            const employeesResponse = await axiosInstance.post(`/companies/${company_id}/payroll?month=${month}`);
            console.log(employeesResponse, employeesResponse.data)
            const employees = employeesResponse.data.data || [];
            setEmployees(employees);
        }
    };

    useEffect(() => {
        fetchEmployeePayrolls();
    }, [selectedMonth]);

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

    const generatePayroll = async (employeeId) => {
        setgeneratingPayslip(true);

        const company_id = userData.company.id;
        try {
            const response = await axiosInstance.post(`/companies/${company_id}/payroll/generate/${employeeId}`);
            if (response.data.success) {
                console.log('payroll', response.data.data);
                fetchEmployeePayrolls();
            }
        } catch (error) {
            console.error('Error generating payroll:', error);
        }
        setgeneratingPayslip(false)
        fetchEmployeePayrolls();
    }

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
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {generateLast12Months().map(month => (
                                <Option key={month} value={month}>
                                    {format(new Date(month), 'MMMM yyyy')}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="overflow-scroll px-0">
                <table className="mt-4 w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            <th className="p-4">Employee</th>
                            <th className="p-4">Hourly Rate</th>
                            <th className="p-4">Hours Worked</th>
                            <th className="p-4">OT Hours</th>
                            <th className="p-4">Holidays/Leaves</th>
                            <th className="p-4">Gross Pay</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.length > 0 ? paginatedEmployees.map((employee, index) => {
                            let wageRate = employee.wage_rate;
                            let hourseWorkd = employee?.hours_worked?.hoursWorked;
                            let oThourseWorkd = employee?.hours_worked?.otHours;
                            let leaves = employee?.hours_worked?.holidays;
                            let payroll_status = employee?.payroll_status;
                            const grossPay = (wageRate || 0) * (hourseWorkd || 0); // Calculate gross pay
                            return (
                                <tr key={employee.id}>
                                    <td className="p-4">
                                        <div className='flex flex-col'>
                                            <div>{employee.firstname} {employee.lastname}</div>
                                            <div className="italic">{employee.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">{`€${wageRate}` || '-'}</td>
                                    <td className="p-4">{hourseWorkd || '-'}</td>
                                    <td className="p-4">{oThourseWorkd || '-'}</td>
                                    <td className="p-4">{leaves || '-'}</td>
                                    <td className="p-4">{`€${grossPay.toFixed(2)}` || '-'}</td>
                                    <td className="p-4">{payroll_status ? <span className='bg-green-200 text-green-900 rounded-md text-xs px-2 py-1'>Generated</span> : <span className='bg-red-200 text-red-900 rounded-md text-xs px-2 py-1'>Not Available</span>}</td>
                                    <td className="p-4">
                                        {payroll_status ?

                                            <>
                                                <Tooltip content="View Salary Slip">
                                                    <IconButton variant="text">
                                                        <EyeIcon className="h-5 w-5" onClick={() => handlePayslipModal(employee.payroll_status)} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip content="Generate Payroll">
                                                    <IconButton variant="text">
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>

                                            :
                                            <Tooltip content="Generate Payroll">
                                                {generatingPayslip ? <Spinner size="sm" className='cursor-not-allowed' /> :
                                                    <IconButton variant="text" onClick={() => generatePayroll(employee.id)}>
                                                        <PlusCircleIcon className="h-5 w-5" />
                                                    </IconButton>
                                                }
                                            </Tooltip>
                                        }
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="p-4 text-center">No Data</td>
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
