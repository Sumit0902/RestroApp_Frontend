import { useNavigate } from 'react-router-dom';

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '@/store/features/auth/AuthSlice.js';
import axios from 'axios';
import useAuthAxios from '@/lib/authAxios';
import { Button, Card, Input, Textarea, Typography } from '@material-tailwind/react';
import { handleAuthError } from '@/lib/utils';

const CompanyProfile = () => {
	const navigate = useNavigate();
	const axiosInstance = useAuthAxios();
	const token = useSelector((state) => state.auth?.user?.access_token); // assuming 'auth' is the name of your slice
	const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	const dispatch = useDispatch();
	const userData = useSelector((state) => state.auth.user);
	let companyId = null;
	const [companyData, setCompanyData] = useState({
		company_name: '',
		company_about: '',
		company_address1: '',
		company_address2: '',
		company_city: '',
		company_state: '',
		company_zip: '',
		phone: '',
		email: '',
		logo: null, // The actual file for upload
		logoPreview: null, // Temporary preview of the uploaded image
		originalLogo: '', // Original logo URL from the database
		workingDays: []
	});
	const params = useParams();
	companyId = params.companyId;

	if (userData) {
		companyId = userData.company.id;
	}

	// fetching company details
	const fetchCompanyProfile = async () => {
		try {
			const response = await axiosInstance.get(`/companies/${companyId}`);
			console.log('company resp', response.data.data);
			let cData = response?.data?.data;
			setCompanyData({
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
				workingDays: cData.workingDays?.length > 0 ? (cData.workingDays).split(',').map(Number) : [],
			});

			console.log('companyData', companyData)
		} catch (error) {
			if (error.response?.status == 403) {
				// token must be expired
				handleAuthError(error, dispatch, navigate);
			}
			console.error('Error fetching companies:', error, error.response?.status);
		}
	};
	useEffect(() => {
		fetchCompanyProfile();
	}, []);


	const handleInputChange = (e) => {
		const { name, value, files } = e.target;

		if (name === 'logo' && files && files[0]) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = () => {
				setCompanyData((prevData) => ({
					...prevData,
					logo: file, // Store the uploaded file
					logoPreview: reader.result, // Update the preview
				}));
			};

			reader.readAsDataURL(file);
		} else {
			setCompanyData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}
	};

	const handleCheckboxChange = (index) => {
		console.log('companyData', companyData)

		setCompanyData((prev) => {
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
		setCompanyData((prevData) => ({
			...prevData,
			logo: null, // Clear the uploaded file
			logoPreview: null, // Remove the preview
		}));

		const fileInput = document.getElementById('logo');
		if (fileInput) {
			fileInput.value = ''; // Clear the file input value
		}
	};

	const handleSubmit = async (e) => {
		const updateToast = toast.loading("Processing your request...", { autoClose: 7000 })
		e.preventDefault();

		const cData = {
			company_name: companyData.company_name,
			company_about: companyData.company_about,
			company_address1: companyData.company_address1,
			company_address2: companyData.company_address2,
			company_city: companyData.company_city,
			company_state: companyData.company_state,
			company_zip: companyData.company_zip,
			phone: companyData.phone,
			email: companyData.email,
			logo: companyData.logo,
			workingDays: companyData.workingDays,
		}

		try {
			const fd = new FormData();
			for (const key in cData) {
				fd.append(key, cData[key]);
			}

			let updateCompanyRes = await axios.post(`${import.meta.env.VITE_API_URL}/companies/${companyId}/update`, fd, {
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
		console.log('Form submitted:', companyData);

	};



	return (
		<div className='w-full p-2   h-full   '>
			<Card
				color="white" shadow={true}
				className='rounded-md ' 
			>  
				<div className='w-full mx-auto p-4'>
					<form
						onSubmit={handleSubmit}
						className='space-y-4 flex flex-col'
					>
						<div className="flex items-center space-x-4">
							
							{companyData.logoPreview ? (
								<img
									src={companyData.logoPreview}
									className="w-[200px] h-[200px] object-cover border border-gray-200 rounded-md"
									alt="Company Logo Preview"
								/>
							) : companyData.originalLogo ? (
								<img
									src={`${import.meta.env.VITE_API_UPLOADS_URL}/${companyData.originalLogo}`}
									className="w-[200px] h-[200px] object-cover border border-gray-200 rounded-md"
									alt="Company Logo"
								/>
							) : (
								<div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center">
									<span className="text-gray-500">Company Logo</span>
								</div>
							)}

							<div>
								<Typography className="block text-left" htmlFor="logo">
									Update Company Logo
								</Typography>
								<Input id="logo" type="file" name="logo" accept="image/*" onChange={handleInputChange} placeholder="Upload max 8mb image. PNG, JPEG/JPG, WEBP only"/>
								{companyData.logo && (
									<Button  color='red'
										onClick={handleRevertLogo}
									>
										Revert to Original
									</Button>
								)}
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								
								<Input
									id='company_name'
									name='company_name'
									value={companyData.company_name}
									onChange={handleInputChange}
									label='Company Name'
								/>
							</div>
							<div>
								<Input
									id='email'
									name='email'
									type='email'
									value={companyData.email}
									onChange={handleInputChange}
									label='Email'
								/>
							</div>
							<div>
								 
								<Input
									id='phone'
									name='phone'
									type='tel'
									value={companyData.phone}
									onChange={handleInputChange}
									label='Phone'
								/>
							</div>
							<div>
							 
								<Input
									id='company_zip'
									name='company_zip'
									value={companyData.company_zip}
									onChange={handleInputChange}
								/>
							</div>
						</div>
						<div>
							 
							<Textarea
								label="About Company" 
								rows={8}
								id='company_about'
								name='company_about'
								value={companyData.company_about}
								onChange={handleInputChange}
							/>
						</div>
						<div>
						 
							<Input
								id='company_address1'
								name='company_address1'
								value={companyData.company_address1}
								label="Address Line 1" 
								onChange={handleInputChange}
							/>
						</div>
						<div>
							<Input
								id='company_address2'
								name='company_address2'
								value={companyData.company_address2}
								label="Address Line 2" 
								onChange={handleInputChange}
							/>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Input
									id='company_city'
									name='company_city'
									value={companyData.company_city}
									label="City" 
									onChange={handleInputChange}
								/>
							</div>
							<div> 
								<Input
									id='company_state'
									name='company_state'
									value={companyData.company_state}
									label="State" 
									onChange={handleInputChange}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Typography
									className='block text-left'
									htmlFor='company_days'
								>
									Operational Days
								</Typography>
								<div>
									{weekdays.map((day, index) => (
										<label key={index} className="flex items-center space-x-2">
											<input
												type="checkbox"
												value={index}
												checked={companyData.workingDays?.includes(index)}
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
			</Card>
		</div>
	);
};

export default CompanyProfile;
