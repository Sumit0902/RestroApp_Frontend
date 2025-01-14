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

const ProfileSettings = () => {
	const navigate = useNavigate();
	const axiosInstance = useAuthAxios();
	const token = useSelector((state) => state.auth.user.access_token); // assuming 'auth' is the name of your slice
	const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	const dispatch = useDispatch();
	const storedData = useSelector((state) => state.auth.user);
	let employeeId = null;
	const [userData, setUserData] = useState({
		username: '',
		firstname: '',
		lastname: '',
		email: '',
		company: {},
		avatar: '',
		schedule: []
	});
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



	return (
		<div className='w-full p-2 relative h-full  max-h-[calc(100vh_-_2rem)]  '>
			<Box
				className='rounded-md '
				style={{
					backgroundColor: 'var(--color-background)',
					borderRadius: 'var(--radius-4)',
				}}
			> 
				<Flex
					justify='start'
					align='center'
					p='4'
					style={{ borderBottom: '1px solid var(--gray-5)' }}
				>
					{userData.originalLogo ? (
						<img
							src={`${import.meta.env.VITE_API_UPLOADS_URL}/${userData.originalLogo
								}`}
							className='w-[50px] h-[50px] object-fit border border-gray-200 rounded-md mr-2'
						/>
					) : (
						<div className='w-[50px] h-[50px] bg-gray-200 flex items-center justify-center rounded-md mr-2'>
							<span className='text-gray-500'>Logo</span>
						</div>
					)}
					<Text size='5' weight='bold'>
						{userData.company_name}{' '}
					</Text>
				</Flex>

				{/* Scrollable Content Area */}
				<ScrollArea>
					<Box p='4' className='max-h-[calc(100vh_-_5rem)]'>
						<div className='container mx-auto p-4'>
							<form
								onSubmit={handleSubmit}
								className='space-y-4 flex flex-col'
							>
								<div className="flex items-center space-x-4">
									{/* Image Preview */}
									{userData.logoPreview ? (
										<img
											src={userData.logoPreview}
											className="w-[200px] h-[200px] object-cover border border-gray-200 rounded-md"
											alt="Company Logo Preview"
										/>
									) : userData.originalLogo ? (
										<img
											src={`${import.meta.env.VITE_API_UPLOADS_URL}/${userData.originalLogo}`}
											className="w-[200px] h-[200px] object-cover border border-gray-200 rounded-md"
											alt="Company Logo"
										/>
									) : (
										<div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center">
											<span className="text-gray-500">Company Logo</span>
										</div>
									)}

									<div>
										<Label className="block text-left" htmlFor="logo">
											Update Company Logo
										</Label>
										<Input id="logo" type="file" name="logo" accept="image/*" onChange={handleInputChange} />
										{userData.logo && (
											<button
												type="button"
												className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md"
												onClick={handleRevertLogo}
											>
												Revert to Original
											</button>
										)}
									</div>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Label
											className='block text-left'
											htmlFor='company_name'
										>
											Company Name
										</Label>
										<Input
											id='company_name'
											name='company_name'
											value={userData.company_name}
											onChange={handleInputChange}
										/>
									</div>
									<div>
										<Label
											className='block text-left'
											htmlFor='email'
										>
											Email
										</Label>
										<Input
											id='email'
											name='email'
											type='email'
											value={userData.email}
											onChange={handleInputChange}
										/>
									</div>
									<div>
										<Label
											className='block text-left'
											htmlFor='phone'
										>
											Phone
										</Label>
										<Input
											id='phone'
											name='phone'
											type='tel'
											value={userData.phone}
											onChange={handleInputChange}
										/>
									</div>
									<div>
										<Label
											className='block text-left'
											htmlFor='company_zip'
										>
											ZIP Code
										</Label>
										<Input
											id='company_zip'
											name='company_zip'
											value={userData.company_zip}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div>
									<Label
										className='block text-left'
										htmlFor='company_about'
									>
										About
									</Label>
									<Textarea
										id='company_about'
										name='company_about'
										value={userData.company_about}
										onChange={handleInputChange}
									/>
								</div>
								<div>
									<Label
										className='block text-left'
										htmlFor='company_address1'
									>
										Address 1
									</Label>
									<Input
										id='company_address1'
										name='company_address1'
										value={userData.company_address1}
										onChange={handleInputChange}
									/>
								</div>
								<div>
									<Label
										className='block text-left'
										htmlFor='company_address2'
									>
										Address 2
									</Label>
									<Input
										id='company_address2'
										name='company_address2'
										value={userData.company_address2}
										onChange={handleInputChange}
									/>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Label
											className='block text-left'
											htmlFor='company_city'
										>
											City
										</Label>
										<Input
											id='company_city'
											name='company_city'
											value={userData.company_city}
											onChange={handleInputChange}
										/>
									</div>
									<div>
										<Label
											className='block text-left'
											htmlFor='company_state'
										>
											State
										</Label>
										<Input
											id='company_state'
											name='company_state'
											value={userData.company_state}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Label
											className='block text-left'
											htmlFor='company_days'
										>
											Operational Days
										</Label>
										<div>
											{weekdays.map((day, index) => (
												<label key={index} className="flex items-center space-x-2">
													<input
														type="checkbox"
														value={index}
														checked={userData.workingDays?.includes(index)}
														onChange={() => handleCheckboxChange(index)}
													/>
													<span>{day}</span>
												</label>
											))}
										</div>
									</div> 
								</div>
								<Button type='submit'>Save Changes</Button>
							</form>
						</div>
					</Box>
				</ScrollArea>
			</Box>
		</div>
	);
};

export default ProfileSettings;
