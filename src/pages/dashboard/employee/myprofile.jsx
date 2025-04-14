import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Input, Typography, Card, Select, Option, Switch, Dialog, Spinner } from '@material-tailwind/react';
import { toast } from 'react-toastify';
import useAuthAxios from '@/lib/authAxios';
import { updateUserProfile } from '@/store/features/auth/AuthSlice';
import { UserIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const MyProfile = () => {
	const userData = useSelector((state) => state.auth.user);
	const dispatch = useDispatch();
	const authAxios = useAuthAxios();
	const token = useSelector((state) => state.auth?.user?.access_token);
	const [formData, setFormData] = useState({
		firstname: userData?.firstname || '',
		lastname: userData?.lastname || '',
		email: userData?.email || '',
		phone: userData?.phone || '',
		company_role: userData?.company_role || '',
		wage: userData?.wage || 'daily',
		wage_rate: userData?.wage_rate || '',
		password: '', 
		avatar: null,
	});
	const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || '');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [twoFactorEnabled, setTwoFactorEnabled] = useState(userData?.two_factor_enabled || false);
	const [qrCode, setQrCode] = useState('');
	const [twoFactorCode, setTwoFactorCode] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [recoveryCodes, setRecoveryCodes] = useState([]);
	const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
	const [disablePassword, setDisablePassword] = useState('');
	const [disableError, setDisableError] = useState('');
	
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === 'wage_rate' && value && !/^\d*\.?\d{0,2}$/.test(value)) {
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({ ...prev, avatar: file }));
			setAvatarPreview(URL.createObjectURL(file));
		}
	};
	 
	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		console.log('update started')
		const formDataToSend = new FormData();
		Object.keys(formData).forEach((key) => {
			if (key === 'password' && formData[key]) { 
				if (formData[key].length < 8) {
					toast.error('Password must be at least 8 characters long.');
					setIsSubmitting(false);
					return;
				}
			}

			// Only append fields that are not null or empty
			if (formData[key] !== null && formData[key] !== '') {
				formDataToSend.append(key, formData[key]);
			}
		});
		console.log('update came here 1')
		try {
		console.log('update came here 2')

			const response = await axios.post(`${import.meta.env.VITE_API_URL}/companies/${userData.company.id}/employees/${userData.id}/updateMyProfile`, formDataToSend, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data'
				}
			});
			console.log('res', response)
			toast.success('Profile updated successfully!');
			dispatch(updateUserProfile(response.data.data)); // Update user in Redux state
		} catch (error) {
			console.log('update came here 3', error)
			toast.error('Failed to update profile.');
		} finally {
		console.log('update came here 4')

			setIsSubmitting(false);
		}
		console.log('update came here 5')

	};

	const handleEnable2FA = async () => {
		setIsSubmitting(true);
		try {
			const response = await authAxios.post(`/companies/${userData.company.id}/employees/${userData.id}/enable-2fa`);
			setQrCode(response.data.qr_code); // Assuming the API returns a QR code URL
			setIsModalOpen(true);
		} catch (error) {
			toast.error('Failed to enable 2FA.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleConfirm2FA = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const response = await authAxios.post(`/companies/${userData.company.id}/employees/${userData.id}/confirm-2fa`, {
				code: twoFactorCode,
			});

			toast.success('Two-factor authentication enabled successfully!');
			setTwoFactorEnabled(true);
			setQrCode(''); // Hide QR code
			setTwoFactorCode(''); // Clear input field
			setRecoveryCodes(response.data.recovery_codes); // Save recovery codes
			dispatch(updateUserProfile({ ...userData, two_factor: true })); // Update 2FA status in Redux
		} catch (error) {
			toast.error('Failed to confirm 2FA.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDisable2FA = async () => {
		setIsSubmitting(true);
		setDisableError(''); // Clear any previous errors
		try {
			const response = await authAxios.post(`/companies/${userData.company.id}/employees/${userData.id}/disable-2fa`, {
				password: disablePassword,
			});

			toast.success('Two-factor authentication disabled successfully!');
			setTwoFactorEnabled(false);
			dispatch(updateUserProfile({ ...userData, two_factor: false })); 
			setIsDisableModalOpen(false); // Close the modal
			setDisablePassword(''); // Clear the password input
		} catch (error) {
			console.error('Error disabling 2FA:', error);
			setDisableError(error.response?.data?.error || 'Failed to process you request. Please try again later.'); 
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-6">
			<Typography variant="h4" className="mb-6 font-bold">
				Update Profile
			</Typography>
			<Card className="p-6">
				<form onSubmit={handleUpdateProfile}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* First Name */}
						<Input
							label="First Name"
							name="firstname"
							value={formData.firstname}
							onChange={handleInputChange}
							required
						/>
						{/* Last Name */}
						<Input
							label="Last Name"
							name="lastname"
							value={formData.lastname}
							onChange={handleInputChange}
							required
						/>
						{/* Email */}
						<Input
							label="Email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							required
						/>
						{/* Phone */}
						<Input
							label="Phone"
							name="phone"
							type="tel"
							value={formData.phone}
							onChange={handleInputChange}
						/>
						{/* Password */}
						<div className='flex flex-col'>
							<Input
								label="New Password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleInputChange}
							/>
							<span className='text-xs ml-1 italic mt-1'>Leave blank to keep current password</span>
						</div>
						{/* Company Role (Disabled) */}
						<Input
							label="Company Role"
							name="company_role"
							type="text"
							value={formData.company_role ? formData.company_role : 'Not Assigned'}
							readOnly
						/>
						{/* Wage */}
						<div>

							<Select
								label="Select Wage Type"
								value={formData.wage}
								onChange={(value) => setFormData((prev) => ({ ...prev, wage: value }))}
							>
								<Option value="daily">Daily</Option>
								<Option value="hourly">Hourly</Option>
								<Option value="weekly">Weekly</Option>
								<Option value="monthly">Monthly</Option>
							</Select>
						</div>
						{/* Wage Rate */}
						<Input
							label="Wage Rate (in €)"
							name="wage_rate"
							type="text"
							value={formData.wage_rate}
							onChange={handleInputChange}
						/>
					</div>

					{/* Avatar Upload */}
					<div className="mt-6">
						<Typography variant="small" className="mb-2 font-medium">
							Avatar
						</Typography>
						<div className="flex items-center gap-4">
							{userData?.avatar  ?
								<img
									src={`${import.meta.env.VITE_API_UPLOADS_URL}/${avatarPreview}`}
									alt="Avatar Preview"
									className="w-20 h-20 rounded-full object-cover border"
								/>
							:
							(
								avatarPreview ? (
									<img
										src={`${avatarPreview}`}
										alt="Avatar Preview"
										className="w-20 h-20 rounded-full object-cover border"
									/>
								)
									:
									<div className='no-avatar-preview rounded-full w-20 h-20 aspect-square p-2 bg-gray-200'>
										<UserIcon className='aspect-square' />
									</div>
							)
							}
							<input
								type="file"
								accept="image/*"
								onChange={handleAvatarChange}
								className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
							/>
						</div>
					</div>

					{/* Submit Button */}
					<Button type="submit" color="blue" fullWidth className="mt-6" disabled={isSubmitting}>
						{isSubmitting ? 'Updating...' : 'Update Profile'}
					</Button>
				</form>
			</Card>

			{/* Security Section */}
			<Typography variant="h4" className="mt-12 mb-6 font-bold">
				Two-Factor Authentication
			</Typography>
			<Card className="p-6">
				{/* Two-Factor Authentication */}
				<div className="flex items-center justify-between mt-6">
					<Typography variant="h6">Two-Factor Authentication</Typography>
					<div className='flex items-center'>
						{isSubmitting  && <Spinner className='mr-2' /> }
						<Switch
							checked={twoFactorEnabled}
							onChange={(checked) => {
								if (!twoFactorEnabled) {
									handleEnable2FA(); // Enable 2FA
								} else {
									setIsDisableModalOpen(true); // Open the disable 2FA modal
								}
							}}
						/>
					</div>
				</div>
				{twoFactorEnabled && (
					<Typography variant="small" color="gray">
						Two-factor authentication is already enabled.
					</Typography>
				)}
			</Card>

			{/* Modal for QR Code and 2FA Confirmation */}
			<Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<Card className="p-6">
					{!qrCode && recoveryCodes.length === 0 ? (
						<Typography variant="h6" className="text-center">
							Loading QR Code...
						</Typography>
					) : recoveryCodes.length > 0 ? (
						<>
							<Typography variant="h6" className="mb-4 text-center">
								Recovery Codes
							</Typography>
							<Typography variant="paragraph" className="mb-4 text-center">
								Save these recovery codes in a secure location. You can use them to access your account if you lose access to your authenticator app.
							</Typography>
							<div className="bg-gray-100 p-4 rounded-md mb-4">
								{recoveryCodes.map((code, index) => (
									<Typography key={index} variant="small" className="block text-center font-mono">
										{code}
									</Typography>
								))}
							</div>
							<Button
								color="blue"
								fullWidth
								onClick={() => setIsModalOpen(false)}
							>
								Close
							</Button>
						</>
					) : (
						<>
							<Typography variant="h6" className="mb-4 text-center">
								Scan the QR Code
							</Typography>
							<div className="flex justify-center mb-4">
								<div className="qrCode" dangerouslySetInnerHTML={{ __html: qrCode }}></div>
							</div>
							<Typography variant="paragraph" className="mb-4 text-center">
								After scanning the QR code with your authenticator app, enter the 6-digit code below.
							</Typography>
							<form onSubmit={handleConfirm2FA}>
								<Input
									label="Authenticator Code"
									value={twoFactorCode}
									onChange={(e) => setTwoFactorCode(e.target.value)}
									maxLength={6}
									required
								/>
								<Button type="submit" color="blue" fullWidth className="mt-6" disabled={isSubmitting}>
									{isSubmitting ? 'Verifying...' : 'Verify Code'}
								</Button>
							</form>
						</>
					)}
				</Card>
			</Dialog>

			{/* Modal for Disabling 2FA */}
			<Dialog open={isDisableModalOpen} onClose={() => setIsDisableModalOpen(false)}>
				<Card className="p-6">
					<Typography variant="h6" className="mb-4 text-center">
						Confirm Password to Disable 2FA
					</Typography>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleDisable2FA();
						}}
					>
						<Input
							label="Password"
							type="password"
							value={disablePassword}
							onChange={(e) => setDisablePassword(e.target.value)}
							required
						/>
						{disableError && (
							<Typography variant="small" color="red" className="mt-2">
								{disableError}
							</Typography>
						)}
						<div className="flex justify-end gap-4 mt-6">
							<Button
								color="red"
								variant="text"
								onClick={() => {
									setIsDisableModalOpen(false);
									setDisablePassword('');
									setDisableError('');
								}}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								color="blue"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Disabling...' : 'Disable'}
							</Button>
						</div>
					</form>
				</Card>
			</Dialog>
		</div>
	);
};

export default MyProfile;