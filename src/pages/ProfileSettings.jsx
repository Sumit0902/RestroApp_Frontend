import { Box, Flex, ScrollArea, Text } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '@/components/ui/textarea.jsx';
import useAuthAxios from '@/lib/authAxios.js';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '@/store/features/auth/AuthSlice.js';
import axios from 'axios';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
 
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"       
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon } from 'lucide-react'

const ProfileSettings = () => {
	const navigate = useNavigate();
	const axiosInstance = useAuthAxios();
	const token = useSelector((state) => state.auth.user.access_token); // assuming 'auth' is the name of your slice
	const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	const dispatch = useDispatch();
	const storedData = useSelector((state) => state.auth.user);
	let employeeId = null;
	const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [designation, setDesignation] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [workDays, setWorkDays] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false
    })
	const params = useParams();
	employeeId = params.employeeId;

	if (storedData) {
		employeeId = storedData.company.id;
	}

	// fetching company details
	const fetchProfileSettings = async () => {
		try {
			const response = await axiosInstance.get(`/employee/${employeeId}`);
			console.log('company resp', response.data.data);
			let cData = response?.data?.data;
			setUserData({
				company_name: cData.company_name ?? '',
				company_about: cData.company_about ?? '',
				company_address1: cData.company_address1 ?? '',
				company_address2: cData.company_address2 ?? '',
				company_city: cData.company_city ?? '',
				company_state: cData.company_state ?? '',
				company_zip: cData.company_zip ?? '',
				phone: cData.phone ?? '',
				email: cData.email ?? '',
				logo: null, // The actual file for upload
				logoPreview: null, // Temporary preview of the uploaded image
				originalLogo: cData.logo,
				workingDays: Array.isArray(cData.workingDays) ? cData.workingDays : [],
			});

		} catch (error) {
			if (error.response?.status == 403) {
				// token must be expired
				toast.error('Your session has expired. please login again');
				dispatch(logout);

				setTimeout(() => {
					navigate('/');
				}, 3000);
			}
			console.error('Error fetching companies:', error, error.response?.status);
		}
	};
	useEffect(() => {
		fetchProfileSettings();
	}, []);

	  const [showPassword, setShowPassword] = useState(false)

    const handleWorkDayChange = (day) => {
        setWorkDays(prev => ({ ...prev, [day]: !prev[day] }))
    }

   
	const handleInputChange = (e) => {
		const { name, value, files } = e.target;

		if (name === 'logo' && files && files[0]) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = () => {
				setUserData((prevData) => ({
					...prevData,
					logo: file, // Store the uploaded file
					logoPreview: reader.result, // Update the preview
				}));
			};

			reader.readAsDataURL(file);
		} else {
			setUserData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}
	};

	const handleCheckboxChange = (index) => {
		setUserData((prev) => {
			const updatedWorkingDays = prev.workingDays?.includes(index)
				? prev.workingDays.filter((day) => day !== index) // Remove index if already selected
				: [...prev?.workingDays, index]; // Add index if not selected

			return {
				...prev,
				workingDays: updatedWorkingDays,
			};
		});
	};

	const handleRevertLogo = () => {
		setUserData((prevData) => ({
			...prevData,
			logo: null, // Clear the uploaded file
			logoPreview: null, // Remove the preview
		}));
	};

	const handleSubmit = async (e) => {
		const updateToast = toast.loading("Processing your request...", { autoClose: 7000 })
		e.preventDefault();

		const cData = {
			company_name: userData.company_name,
			company_about: userData.company_about,
			company_address1: userData.company_address1,
			company_address2: userData.company_address2,
			company_city: userData.company_city,
			company_state: userData.company_state,
			company_zip: userData.company_zip,
			phone: userData.phone,
			email: userData.email,
			logo: userData.logo,
			workingDays: userData.workingDays,
		}

		try {
			const fd = new FormData();
			for (const key in cData) {
				fd.append(key, cData[key]);
			}

			let updateCompanyRes = await axios.post(`${import.meta.env.VITE_API_URL}/companies/${employeeId}/update`, fd, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data'
				}
			});
			console.log('company resp', updateCompanyRes.data.data, updateCompanyRes.data);
			toast.update(updateToast, { render: "Company Updated successfully", type: "success", isLoading: false });

		} catch (error) {
			if (error.response?.status == 403) {
				toast.error('Your session has expired. please login again');
				dispatch(logout);

				setTimeout(() => {
					navigate('/');
				}, 3000);
			}
			console.error('Error fetching companies:', error, error.response?.status);
			toast.update(updateToast, { render: "THere is an error in your submission", type: "error", isLoading: false, autoClose: 7000 });

		}
		console.log('Form submitted:', userData);

	};

	const handleFileChange = (e) => {
        setAvatar(e.target.files?.[0] || null)
    }


	return (
        <div className="w-full p-2 relative h-full  ">
            <Box
                className="rounded-md "
                style={{
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-4)',
                }}
            >
                {/* Header */}
                <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
                    <Text size="5" weight="bold">Add Employee</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>

                {/* Scrollable Content Area */}
                <ScrollArea >
                    <Box p="4" style={{ paddingBottom: '20px' }} className="h-screen text-left "  >
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Add New Employee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Days of Work</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.keys(workDays).map((day) => (
                                            <div key={day} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={day}
                                                    checked={workDays[day]}
                                                    onCheckedChange={() => handleWorkDayChange(day)}
                                                />
                                                <Label htmlFor={day}>{day}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Add Employee</Button>
                            </form>
                        </CardContent>
                    </Box>
                </ScrollArea>
            </Box>
        </div>
    )
};

export default ProfileSettings;
