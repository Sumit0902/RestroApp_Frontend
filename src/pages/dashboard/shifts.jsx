import { Fragment, useEffect, useState } from 'react'

import { X, Plus, Edit } from 'lucide-react'
import useAuthAxios from "@/lib/authAxios";
import { useDispatch, useSelector } from 'react-redux'
import { format, isValid, parse } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/store/features/auth/AuthSlice.js'
import { toast } from 'react-toastify'
import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Spinner, Typography } from '@material-tailwind/react';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/solid'; 
export default function Shifts() {

	const [shifts, setShifts] = useState([]);
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(true)
	const [formSubmiting, setformSubmiting] = useState(false)
	const [currentShift, setCurrentShift] = useState(null)
	
	const [shiftName, setShiftName] = useState('')
	const [startTime, setStartTime] = useState('')
	const [endTime, setEndTime] = useState('')

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [shiftToDelete, setShiftToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const userData = useSelector(state => state.auth.user)
	const navigate = useNavigate();
	const axiosInstance = useAuthAxios();
	const dispatch = useDispatch();
	const fetchCompanyShifts = async () => {
		const companyId = userData.company.id;
		try {
			const response = await axiosInstance.get(`/companies/${companyId}/shifts`);
			console.log('company resp', response.data.data)
			setShifts(response.data.data);
		} catch (error) {
			if (error.response?.status == 403) {
				setLoading(false)  
				dispatch(logout);
				toast.error('Your session has expired. please login again');

				setTimeout(() => {
					navigate('/');
				}, 3000);
			}
			console.error('Error fetching companies:', error, error.response.status);
		}
		setLoading(false)
	};


	useEffect(() => {
		fetchCompanyShifts();
	}, [])


	const handleOpenModal = (shift = null) => {
		if (shift) {
			setShiftName(shift.name);
			setStartTime(shift.start_time);
			setEndTime(shift.end_time);
		} else {
			setShiftName('');
			setStartTime('');
			setEndTime('');
		}
		setCurrentShift(shift);
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		 
		setCurrentShift(null)
		setIsOpen(false)
		setformSubmiting(false);
	}

	const handleOpenDeleteModal = (shift) => {
		setShiftToDelete(shift);
		setIsDeleteModalOpen(true);
	};

	const handleCloseDeleteModal = () => {
		setShiftToDelete(null);
		setIsDeleteModalOpen(false);
		setIsDeleting(false);
	};

	const handleDeleteShift = async () => {
		if (!shiftToDelete) return;
	
		setIsDeleting(true);
	
		try {
			const companyId = userData.company.id;
			await axiosInstance.delete(`/companies/${companyId}/shifts/${shiftToDelete.id}/delete`);
	
			// Remove the deleted shift from the state
			setShifts(shifts.filter((shift) => shift.id !== shiftToDelete.id));
	
			toast.success("Shift deleted successfully!");
			handleCloseDeleteModal();
		} catch (error) {
			console.error("Error deleting shift:", error.response?.data?.error || error.message);
			toast.error("An error occurred while deleting the shift. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSubmit = async (event) => {
		if(formSubmiting) {
			return false;
		}

		setformSubmiting(true);
		event.preventDefault();
		const formData = new FormData();
		formData.append('company_id', userData.company.id);
		formData.append('name', shiftName);
		formData.append('start_time', startTime);
		formData.append('end_time', endTime);
		const shiftData = Object.fromEntries(formData.entries());
	 

		if (shiftData.start_time) {
			if (shiftData.start_time.length === 5) {
				shiftData.start_time += ":00";
			}
			const parsedStartTime = parse(shiftData.start_time, 'HH:mm:ss', new Date());
			if (isValid(parsedStartTime)) {
				// Format the parsed time back to 'HH:mm:ss'
				shiftData.start_time = format(parsedStartTime, 'HH:mm:ss');
				console.log("Formatted start_time:", shiftData.start_time);
			} else {
				console.error("Parsed time is invalid:", shiftData.start_time);
			}
		}

		if (shiftData.end_time) {
			if (shiftData.end_time.length === 5) { 
				shiftData.end_time += ":00";
			}
			const parsedEndTime = parse(shiftData.end_time, 'HH:mm:ss', new Date());
			console.log(shiftData.end_time, parsedEndTime);
			shiftData.end_time = format(parsedEndTime, 'HH:mm:ss');

		}

		console.log('to sumbit shift', shiftData);
		try {
			let companyId = userData.company.id;
			if (currentShift) {
				const response = await axiosInstance.patch(
					`/companies/${companyId}/shifts/${currentShift.id}/update`,
					shiftData
				);
				const updatedShift = response.data.data;
				console.log('after update shift', shiftData);
				setShifts(shifts.map((shift) => (shift.id === currentShift.id ? updatedShift : shift)));

			} else {
				console.log('after add shift', shiftData);
				const response = await axiosInstance.post(
					`/companies/${companyId}/shifts/add`,
					shiftData
				);
				const newShift = response.data.data;
				setShifts([...shifts, newShift]);
			}

			handleCloseModal();
		} catch (error) {
			setLoading(false);
			console.error("Error saving shift:", error.response?.data?.error || error.message);
			alert("An error occurred while saving the shift. Please try again.");
		}
	};

	return (
		<div className="w-full p-2 relative h-full">
			<Card className="rounded-md" >
				{/* Header */}
				<div className='flex justify-between items-center p-4 border-b border-gray-400'>
					<Typography className="text-lg font-bold" >Shifts</Typography>
					<Button className='flex' onClick={() => handleOpenModal()}>
						<Plus className="mr-2 h-4 w-4" /> Add Shift
					</Button>
				</div>

				<div className="space-y-4 w-full">


					<table className='w-full mt-4'>
						<thead>
							<tr>
								<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Shift Name</th>
								<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Start Time</th>
								<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">End Time</th>
								<th className="w-[20%] border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ?
								<tr>
									<td colSpan={4} className=" font-medium col-span-4  py-2 text-center" >
										<div className='flex justify-center gap-4 w-full'><Spinner /> Loading!</div>
									</td>
									{/* <td colSpan={4} className="font-medium col-span-4 py-4 text-center " ><Spinner/> No data to show yloadinget!</td> */}
								</tr>
								:

								(shifts.length > 0 ?
									shifts.map((shift) => (
										<tr key={shift.id}>
											<td className="font-medium text-center p-4">{shift.name}</td>
											<td className="text-center p-4">{format(parse(shift.start_time, 'HH:mm:ss', new Date()), 'hh:mm a')}</td>
											<td className="text-center p-4">{format(parse(shift.end_time, 'HH:mm:ss', new Date()), 'hh:mm a')}</td>
											{/* <TableCell>{shift.description}</TableCell> */}
											<td className='w-[20%] flex text-center p-4 gap-4'>
												<Button   onClick={() => handleOpenModal(shift)}>
													<Edit className="h-4 w-4" />
												</Button>
												<Button color="red" onClick={() => handleOpenDeleteModal(shift)}>
													<TrashIcon className="h-4 w-4" />
												</Button>
											</td>
										</tr>
									))
									:
									<tr  >
										<td colSpan={4} className="font-medium col-span-4 py-4 text-center " > No data to show yet!</td>
									</tr>)
							}
						</tbody>
					</table>


					<Dialog open={isOpen} handler={handleOpenModal}>
						<DialogHeader> {currentShift ? 'Edit Shift' : 'Add New Shift'}</DialogHeader>
						<DialogBody>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<input type="hidden" name="company_id" id="compnay_id" value={userData.company.id} />

									<Input
										id="name"
										name="name"
										label='Shift Name'
										value={shiftName}
										onChange={(e) => setShiftName(e.target.value)}
										required
									/>
								</div>
								<div>
									{/* <input
									className='  h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
										type="time"
										id="start_time"
										name="start_time"
										label="Start Time"
										defaultValue={currentShift?.start_time || ''}
										required
									/> */}
									<Input
										id="start_time"
										type='time'
										name="start_time"
										label='Start Time'
										value={startTime} 
										onChange={(e) => setStartTime(e.target.value)}
										required
									/>
								</div>
								<div>
									<Input
										type="time"
										className='  h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
										id="end_time"
										name="end_time"
										value={endTime} 
										onChange={(e) => setEndTime(e.target.value)}
										label="Ent Time"
										required
									/>
								</div>

							</form>
						</DialogBody>
						<DialogFooter>
							<Button
								variant="text"
								color="red"
								onClick={handleCloseModal}
								className="mr-1" 
							>
								<span>Cancel</span>
							</Button>
							<Button className={`flex justify-center items-center gap-2 ${formSubmiting ? 'opacity-50 cursor-not-allowed' : '' } `} variant="gradient" color="green" type='submit' onClick={handleSubmit} disabled={formSubmiting} >
								{formSubmiting && <span><Spinner/></span> }
								<span>{currentShift ? 'Update' : 'Add'}</span>
							</Button>
						</DialogFooter>
					</Dialog>

					<Dialog open={isDeleteModalOpen} handler={handleOpenDeleteModal}>
						<DialogHeader>Confirm Delete</DialogHeader>
						<DialogBody>
							<Typography>
								Are you sure you want to delete the shift{" "}
								<span className="font-bold">{shiftToDelete?.name}</span>?
							</Typography>
						</DialogBody>
						<DialogFooter>
							<Button
								variant="text"
								color="blue-gray"
								onClick={handleCloseDeleteModal}
								className="mr-1"
							>
								Cancel
							</Button>
							<Button
								variant="gradient"
								color="red"
								onClick={handleDeleteShift}
								className={`flex justify-center items-center gap-2 ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
								disabled={isDeleting}
							>
								{isDeleting && <Spinner />}
								Confirm
							</Button>
						</DialogFooter>
					</Dialog>

				</div>
			</Card>
		</div>

	)
}