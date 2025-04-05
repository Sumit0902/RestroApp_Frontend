import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Input,
    Button,
    Typography,
    Popover,
    PopoverHandler,
    PopoverContent,
    Checkbox,
} from "@material-tailwind/react";
import { useParams } from "react-router-dom";
import useAuthAxios from "@/lib/authAxios.js";
import { DayPicker, Option, Select } from "react-day-picker";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const SingleEmployee = () => {
    const { id } = useParams(); // Get employee ID from URL params
    const axiosInstance = useAuthAxios();
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [designation, setDesignation] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [wage, setWage] = useState(null)
    const [wage_rate, setWageRate] = useState(null)
    const [workDays, setWorkDays] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false
    })
    const [error, setError] = useState(null);
    const [date, setDate] = useState(null);

    const userData = useSelector(state => state.auth.user);
    const companyId = userData.company.id;
    // Fetch employee data on page load
    const fetchEmployeeData = async () => {
        console.log('fethcing employees')
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/employees/${id}`);
            console.log('info', response.data.data)
            let user = response.data.data;
            setFirstName(user.firstname)
            setLastName(user.lastname)
            setEmail(user.email)
            setDesignation(user.designation)
            setWorkDays(user.workDays )

        
        } catch (err) {
            console.log('fethcing employees eror', err)
            setError("Failed to fetch employee data");
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(`/employees/${id}`, employee);
            alert("Employee updated successfully");
            console.log(response.data);
        } catch (err) {
            setError("Failed to update employee");
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const handleWorkDayChange = (day) => {
        setWorkDays(prev => ({ ...prev, [day]: !prev[day] }))
    }

    return (
        <Card className="px-8 py-20  my-10  mx-auto">
            <Typography variant="h5" color="blue-gray">
                Profile Information
            </Typography>
            <Typography
                variant="small"
                className="text-gray-600 font-normal mt-1"
            >
                Update your profile information below.
            </Typography>
            <div className="flex flex-col mt-8">
                <div className="mb-6 flex flex-col items-end gap-4 md:flex-row">
                    <div className="w-full">
                        
                        <Input
                            size="lg"
                            label="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                    <div className="w-full">
                         
                        <Input
                            size="lg"
                            placeholder="Roberts"
                            label="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                </div>
                <div className="mb-6 flex flex-col gap-4 md:flex-row">
                     
                    <div className="w-full">
                       
                        <Popover placement="bottom">
                            <PopoverHandler>
                                <Input
                                    size="lg"
                                    onChange={() => null}
                                    placeholder="Select a Date"
                                    value={date ? format(date, "PPP") : ""} 
                                    label="Birth Date"
                                    className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                                />
                            </PopoverHandler>
                            <PopoverContent>
                                <DayPicker
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate }
                                    showOutsideDays 
                                    classNames={{
                                        caption:
                                            "flex justify-center py-2 mb-4 relative items-center",
                                        caption_label: "text-sm !font-medium text-gray-900",
                                        nav: "flex items-center",
                                        nav_button:
                                            "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
                                        nav_button_previous: "absolute left-1.5",
                                        nav_button_next: "absolute right-1.5",
                                        table: "w-full border-collapse",
                                        head_row: "flex !font-medium text-gray-900",
                                        head_cell: "m-0.5 w-9 !font-normal text-sm",
                                        row: "flex w-full mt-2",
                                        cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-gray-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        day: "h-9 w-9 p-0 !font-normal",
                                        day_range_end: "day-range-end",
                                        day_selected:
                                            "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
                                        day_today: "rounded-md bg-gray-200 text-gray-900",
                                        day_outside:
                                            "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-500 aria-selected:text-gray-900 aria-selected:bg-opacity-10",
                                        day_disabled: "text-gray-500 opacity-50",
                                        day_hidden: "invisible",
                                    }}
                                    components={{
                                        IconLeft: ({ ...props }) => (
                                            <ChevronLeftIcon
                                                {...props}
                                                className="h-4 w-4 stroke-2"
                                            />
                                        ),
                                        IconRight: ({ ...props }) => (
                                            <ChevronRightIcon
                                                {...props}
                                                className="h-4 w-4 stroke-2"
                                            />
                                        ),
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="w-full">
                         
                        <Input
                            size="lg"
                            label="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                </div>
                <div className="mb-6 flex flex-col items-end gap-4 md:flex-row">
                    
                    <div className="w-full">
                        <Input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}  
                            label="Designation" 
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                </div>
                <div className="mb-6 flex flex-col items-end gap-4 md:flex-row">
                    <div className="w-full">
                        <label>Days of Work</label>
                        <div className="grid grid-cols-4 gap-2">
                            {workDays && Object.keys(workDays).map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={day}
                                        checked={workDays[day]}
                                        onCheckedChange={() => handleWorkDayChange(day)}
                                    />
                                    <label htmlFor={day}>{day}</label>
                                </div>
                            ))}
                        </div>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="mb-2 font-medium"
                        >
                            Location
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="Florida, USA"
                            labelProps={{
                                className: "hidden",
                            }}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                    <div className="w-full">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="mb-2 font-medium"
                        >
                            Phone Number
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="+123 0123 456 789"
                            labelProps={{
                                className: "hidden",
                            }}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 md:flex-row">
                    <div className="w-full">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="mb-2 font-medium"
                        >
                            Language
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="Language"
                            labelProps={{
                                className: "hidden",
                            }}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                    <div className="w-full">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="mb-2 font-medium"
                        >
                            Skills
                        </Typography>
                        <Input
                            size="lg"
                            placeholder="Skills"
                            labelProps={{
                                className: "hidden",
                            }}
                            className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SingleEmployee;
