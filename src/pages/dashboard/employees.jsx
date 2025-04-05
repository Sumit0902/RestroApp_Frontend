import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useAuthAxios from "@/lib/authAxios.js";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
    Input,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Select,
    Option,
    Spinner,
    Alert,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { handleAuthError } from "@/lib/utils";

const Employees = () => {
    const userData = useSelector((state) => state.auth.user);
    const axiosInstance = useAuthAxios();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [editEmployeeId, setEditEmployeeId] = useState(null);
    const [employeeForm, setEmployeeForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phone: "",
        role: "employee",
        company_role: "",
        wage: "hourly",
        wage_rate: "",
    });
    const [formError, setFormError] = useState(""); // State to store form errors

    const companyId = userData?.company?.id;

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/companies/${companyId}/employees`);
            setEmployees(response.data.data || []);
        } catch (error) {
            handleAuthError(error, null, navigate);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeForm((prev) => ({ ...prev, [name]: value }));
    };

    // Add Employee
    const handleAddEmployee = async () => {
        try {
            setFormSubmitting(true);
            setFormError(""); // Clear previous errors
            await axiosInstance.post(`/companies/${companyId}/employees/add`, employeeForm);
            toast.success("Employee added successfully!");
            setIsAddOpen(false);
            fetchEmployees();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to add employee.";
            setFormError(errorMessage); // Set error message for the form
            toast.error(errorMessage, { autoClose: 30000});
        } finally {
            setFormSubmitting(false);
        }
    };

    // Edit Employee
    const handleEditEmployee = async () => {
        try {
            setFormSubmitting(true);
            setFormError(""); // Clear previous errors
            await axiosInstance.post(
                `/companies/${companyId}/employees/${editEmployeeId}/update`,
                employeeForm
            );
            toast.success("Employee updated successfully!");
            setIsEditOpen(false);
            fetchEmployees();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update employee.";
            setFormError(errorMessage); // Set error message for the form
            toast.error(errorMessage);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Open Edit Modal and Fetch Employee Data
    const openEditModal = async (employeeId) => {
        try {
            setEditEmployeeId(employeeId);
            setIsEditOpen(true);
            const response = await axiosInstance.get(
                `/companies/${companyId}/employees/${employeeId}`
            );
            setEmployeeForm(response.data.data || {});
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch employee data.";
            toast.error(errorMessage);
        }
    };

    return (
        <Card className="h-full w-full mt-4">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="mb-8 flex items-center justify-between gap-8">
                    <div>
                        <Typography variant="h5" color="blue-gray">
                            Employees
                        </Typography>
                        <Typography color="gray" className="mt-1 font-normal">
                            All employees in your company
                        </Typography>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <Button
                            className="flex items-center gap-3"
                            size="sm"
                            onClick={() => setIsAddOpen(true)}
                        >
                            <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add Employee
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="w-full md:w-72">
                        <Input
                            label="Search"
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardBody className="overflow-scroll px-0">
                <table className="mt-4 w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                First Name
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                Last Name
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                Email
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center p-4">
                                    <Spinner className="h-8 w-8" />
                                </td>
                            </tr>
                        ) : employees.length > 0 ? (
                            employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="p-4">{employee.firstname}</td>
                                    <td className="p-4">{employee.lastname}</td>
                                    <td className="p-4">{employee.email}</td>
                                    <td className="p-4">
                                        <Button
                                            size="sm"
                                            onClick={() => openEditModal(employee.id)}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center p-4">
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardBody>

            {/* Add Employee Dialog */}
            <Dialog open={isAddOpen} handler={setIsAddOpen}>
                <DialogHeader>Add Employee</DialogHeader>
                <DialogBody>
                    {formError && (
                        <Alert color="red" className="mb-4">
                            {formError}
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="First Name"
                            name="firstname"
                            value={employeeForm.firstname}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Last Name"
                            name="lastname"
                            value={employeeForm.lastname}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Email"
                            name="email"
                            value={employeeForm.email}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={employeeForm.password}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={employeeForm.phone}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Company Role"
                            name="company_role"
                            value={employeeForm.company_role}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Wage Rate(€)"
                            name="wage_rate"
                            type="number"
                            step="0.01"
                            value={employeeForm.wage_rate}
                            onChange={handleInputChange}
                        />
                        <Select
                            label="Wage "
                            name="wage"
                            value={employeeForm.wage}
                            onChange={(value) =>
                                setEmployeeForm((prev) => ({ ...prev, wage_rate: value }))
                            }
                        >
                            <Option value="hourly">Hourly</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                        </Select>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        onClick={handleAddEmployee}
                        disabled={formSubmitting}
                        className="mr-2"
                    >
                        {formSubmitting ? <Spinner /> : "Add"}
                    </Button>
                    <Button
                        color="red"
                        onClick={() => setIsAddOpen(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditOpen} handler={setIsEditOpen}>
                <DialogHeader>Edit Employee</DialogHeader>
                <DialogBody>
                    {formError && (
                        <Alert color="red" className="mb-4">
                            {formError}
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="First Name"
                            name="firstname"
                            value={employeeForm.firstname}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Last Name"
                            name="lastname"
                            value={employeeForm.lastname}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Email"
                            name="email"
                            value={employeeForm.email}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={employeeForm.phone}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Company Role"
                            name="company_role"
                            value={employeeForm.company_role}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Wage Rate (€)"
                            name="wage_rate"
                            type="number"
                            step="0.01"
                            value={employeeForm.wage_rate}
                            onChange={handleInputChange}
                        />
                        <Select
                            label="Wage"
                            name="wage"
                            value={employeeForm.wage}
                            onChange={(value) =>
                                setEmployeeForm((prev) => ({ ...prev, wage_rate: value }))
                            }
                        >
                            <Option value="hourly">Hourly</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                        </Select>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        onClick={handleEditEmployee}
                        disabled={formSubmitting}
                        className="mr-2"
                    >
                        {formSubmitting ? <Spinner /> : "Save"}
                    </Button>
                    <Button
                        color="red"
                        onClick={() => setIsEditOpen(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
};

export default Employees;





