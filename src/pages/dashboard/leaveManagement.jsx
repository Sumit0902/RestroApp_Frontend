import useAuthAxios from '@/lib/authAxios';
import { Bars2Icon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Spinner, Textarea, Typography } from '@material-tailwind/react';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const LeaveManagement = () => {
	const axiosInstance = useAuthAxios();
	const userData = useSelector((state) => state.auth.user); // assuming 'auth' is the name of your slice
	const token = userData?.access_token
	// const navigate = useNavigate();
	const companyId = useSelector((state) => state.auth.user.company.id); // assuming 'auth' is the name of your slice

	const [loading, setLoading] = useState(true)
	const [formLoader, setFormLoader] = useState(false)
	const [leaves, setLeaves] = useState([])
 
	const [formSubmitingAc, setformSubmitingAc] = useState(false)
	const [formSubmitingRj, setformSubmitingRj] = useState(false)
	const [formSubmitingRq, setformSubmitingRq] = useState(false)
	const [formSubmitingRqc, setformSubmitingRqc] = useState(false)

	const [leaveType, setLeaveType] = useState('')
	const [reason, setReason] = useState('')
	const [remarks, setRemarks] = useState('')
	const [startbodyate, setStartbodyate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [startError, setStartError] = useState('');
	const [endError, setEndError] = useState('');
	const [selectedLeave, setSelectedLeave] = useState('');

	const [isOpenAccept, setIsOpenAccept] = useState(false)
	const [isOpenReject, setIsOpenReject] = useState(false)
	const [isOpenRequest, setIsOpenRequest] = useState(false)
	const [isOpenRequestCancel, setIsOpenRequestCancel] = useState(false)

	const fetchLeaves = async () => {

		if (userData.role == 'manager') {

			try {
				console.log('fetching company leaves')
				let leavesReq = await axiosInstance.get(`/companies/${companyId}/leave-management`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'multipart/form-data'
					}
				});
				setLeaves(leavesReq.data.data)
				console.log('company leaves', leavesReq.data.data)

			} catch (error) {

				console.log('Error leaves req', error)
			}

		}
		else {
			console.log('fetching user leaves')

			try {
				let leavesReq = await axiosInstance.get(`/companies/${companyId}/leave-management/myleaves/${userData.id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'multipart/form-data'
					}
				});
				setLeaves(leavesReq.data.data)
				console.log('User leaves', leavesReq.data)

			} catch (error) {

				console.log('Error leaves req', error)
			}

		}
		setLoading(false)

	}


	useEffect(() => {
		fetchLeaves()
	}, [])

	const resetForm = () => {
		setStartbodyate('');
		setStartError('');
		setEndDate('');
		setEndError('');
		setReason('')
		setRemarks('')
		document.querySelector('button#closeBtn').click()

	}
	const handleStartDate = (value) => {
		const date = new Date(value);
		const today = new Date();
		if (date >= today) {
			if (!endDate || date <= new Date(endDate)) {
				setStartbodyate(value);
				setStartError('');
			} else {
				setStartError('Start date cannot be greater than end date.');
				setStartbodyate('');
			}
		} else {
			setStartError('Start date cannot be in the past.');
			setStartbodyate('');
		}
		console.log('end date ran', date, startbodyate, endDate, event.target.value)

	};

	const handleEndDate = (value) => {
		const date = new Date(value);
		if (!startbodyate || date >= new Date(startbodyate)) {
			setEndDate(value);
			setEndError('');
		} else {
			setEndError('End date cannot be less than start date.');
			setEndDate('');
		}
		console.log('end date ran', date, startbodyate, endDate, value)
	};

	const handleModalAc = (leave) => {
		setIsOpenAccept(!isOpenAccept);
		setSelectedLeave(leave);
	};

	 

	const handleModalRj = (leave) => {
		setIsOpenReject(!isOpenReject);
		setSelectedLeave(leave);
	};
 
	const handleModalRq = () => {
		setIsOpenRequest(!isOpenRequest);
	};
 
	const handleModalRqc = () => {
		setIsOpenRequestCancel(isOpenRequestCancel);
	};

	 
	const approveLeave = async (leaveId) => {
		setformSubmitingAc(true) 
		if(null == remarks || remarks == ''){ 
			toast.error('Remarks is required')
			setformSubmitingAc(false)
		}

		if(null == leaveId || leaveId == ''){
			toast.error('Leave ID is required')
			setformSubmitingAc(false)

		}

		try {
			let approveReq = await axiosInstance.put(`/companies/${companyId}/leave-management/${leaveId}/approve`, { remarks }, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			console.log('approveReq', approveReq)
			setformSubmitingAc(false)
			setIsOpenAccept(!isOpenAccept);
			setSelectedLeave("");
			setRemarks("");
			toast.success('Leave approved successfully')
			fetchLeaves()
		} catch (error) {
			setformSubmitingAc(false)
			console.log('Error leaves req', error)
			toast.error('Failed to approve leave')
		}
	}

	const rejectLeave = async (leaveId) => {
		setformSubmitingRj(true)

		if(null == remarks || remarks == ''){ 
			toast.error('Remarks is required')
			setformSubmitingRj(false)
		}

		if(null == leaveId || leaveId == ''){
			toast.error('Leave ID is required')
			setformSubmitingRj(false)

		}
		try {
			let rejectReq = await axiosInstance.put(`/companies/${companyId}/leave-management/${leaveId}/reject`, { remarks });
			console.log('rejectReq', rejectReq)
			setformSubmitingAc(false)
			setIsOpenReject(!isOpenReject);
			setSelectedLeave("");
			setRemarks("");
			toast.success('Leave rejected successfully')
			fetchLeaves()
		} catch (error) {
			setformSubmitingAc(false)
			console.log('Error leaves req', error)
			toast.error('Failed to reject leave')
		}
	}

	const cancelRequest = async (leaveId) => {
		setformSubmitingRqc(true)
		try {
			let cancelReq = await axiosInstance.put(`/companies/${companyId}/leave-management/${leaveId}/cancel`);
			console.log('cancelReq', cancelReq)
			setformSubmitingRqc(false)
			document.querySelector('button#closeBtn').click()
			toast.success('Leave request cancelled successfully')
			fetchLeaves()

		} catch (error) {
			setformSubmitingRqc(false)
			console.log('Error leaves req', error)
			toast.error('Failed to cancel leave request')
		}
	}

	const requestLeave = async () => {
		setformSubmitingRq(true)
		try {
			let leaveReq = await axiosInstance.post(`/companies/${companyId}/leave-management/myleaves/${userData.id}/request`, { start_date: startbodyate, end_date: endDate, reason, leaveType });
			console.log('leaveReq', leaveReq)
			setformSubmitingRq(false)
			toast.success('Leave requested successfully')
			fetchLeaves()

			resetForm();

		} catch (error) {
			setformSubmitingRq(false)
			console.log('Error leaves req', error)
			toast.error('Failed to request leave')
		}
	}

	return (
		<Card className="h-full w-full mt-4">
			{/* Header */}
			<CardHeader floated={false} shadow={false} className="rounded-none">
				<div className="mb-8 flex items-center justify-between gap-8">
					<Typography variant="h5" color="blue-gray">
						Leave Management
					</Typography>
					{userData.role != 'manager' &&
					<Button className='flex' onClick={() => handleModalRq()}>
						Request Leave
					</Button>
					}
				</div>
				{userData.role != 'manager' &&
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<Dialog open={isOpenRequest} handler={handleModalRq}>
							<DialogHeader>Leave Request Application</DialogHeader>
							<DialogBody maxWidth="450px">
								<Typography size="2" mb="4">
									Submit form below to Apply for Leave Request
								</Typography>
								<form onSubmit={(e) => requestLeave()}>
									<div className='flex flex-col gap-3' >
										<div>
											<label htmlFor="Leave From">Leave From</label>
											<input type="date" className="w-full border-2 outline-none border-gray-200 p-1 rounded-lg focus:border-indigo-200" value={startbodyate} onChange={(e) => { handleStartDate(e.target.value) }} />
											{startError && <div className='text-red-400'>{startError}</div>}
										</div> 
										<div>
											<label htmlFor="Leave To">Leave To</label>
											<input type="date" className="w-full border-2 outline-none border-gray-200 p-1 rounded-lg focus:border-indigo-200" value={endDate} onChange={(e) => { handleEndDate(e.target.value) }} />
											{endError && <div className='text-red-400'>{endError}</div>}
										</div> 
										<div>
											<label htmlFor="Type">Type</label>
											<select className='border-2 w-full outline-none border-gray-200 p-1 rounded-lg focus:border-indigo-200' value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
												<option value="casual">Casual</option>
												<option value="emergency">Emergency</option>
												<option value="vacation">Vacation</option>
											</select>
										</div> 
										<div>
											<Input
													id="reason"
													name="reason"
													label='Leave Reason'
													value={reason}
													onChange={(e) => setReason(e.target.value)}
													required
												/>
										</div> 
									</div>
								</form>
								<div className='flex gap-4 mt-4 justify-end'>
									<Button color="gray" variant="gradient" id="approveLeave" onClick={() => requestLeave()} className='flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed' disabled={!!formLoader}> {formLoader && <Spinner/> }   Request</Button>

									<Button variant="outlined" color="red" id="closeBtn" onClick={() => handleModalRq()} >
										Cancel
									</Button>
								</div>
							</DialogBody>
						</Dialog>
					</div>
				}
			</CardHeader>
			<CardBody className='overflow-scroll '>
				<table className="w-full table-auto">
					<thead>
						{userData.role == 'manager' ?
							<tr>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Employee</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Leave Duration</Typography> </th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Type</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Reason</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Status</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Remarks</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Action</Typography></th>
							</tr>
							:
							<tr>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Duration</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Type</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Reason</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Status</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Remarks</Typography></th>
								<th className=" border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors"><Typography
									variant="small"
									color="blue-gray"
									className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
								>Action</Typography></th>
							</tr>
						}
					</thead>

					<tbody>
						{
							loading ?
								<tr>
									<td colSpan={userData.role == 'manager' ? 7 : 6} className='text-center'>Loading...</td>
								</tr>
								:

								leaves.length > 0 ?
									leaves.map((leave, index) => {
										const startbodyateRaw = parse(leave.start_date, 'yyyy-MM-dd', new Date());
										const endDateRaw = parse(leave.end_date, 'yyyy-MM-dd', new Date());
										const isLast = index === leave.length - 1;
										console.log(leave, index)
										const classes = isLast
										? "p-4"
										: "p-4 border-b border-blue-gray-50";
										return ( 
												<tr key={index}>
												{userData.role == 'manager' ?
														<>
															<td className={`max-w-[150px] break-words ${classes}`}>
																<div className="flex flex-col">
																	<div className='font-bold'>
																		{leave.user?.firstname} {leave.user?.lastname}
																	</div>
																	<div className='italic'>
																		{leave.user?.email}
																	</div>
																</div>
															</td>
															<td className={`max-w-[150px] break-words ${classes}`}>
																<div className="flex flex-col">
																	<div className=""><span className='font-bold'>From:</span> {format(startbodyateRaw, 'MMM dd, yyyy')}</div>
																	<div className=""><span className='font-bold'>To:</span> {format(endDateRaw, 'MMM dd, yyyy')}</div>
																</div>
															</td>
															<td className='capitalize'>{leave.type}</td>
															<td className={`max-w-[200px] ${classes}`}>{leave.reason}</td>
															<td className={`${classes}`}><span className={`text-white rounded-md px-4 py-1 capitalize ${leave.status == 'approved' ? 'bg-green-400' : (leave.status == 'rejected' ? 'bg-red-400' : 'bg-deep-orange-500')} `}>{leave.status}</span></td>
															<td className={`max-w-[200px] ${classes}`}>{leave.remarks ?? '-'}</td>
															<td className={`max-w-[200px] ${classes}`}>
																{leave.status == 'pending' &&
																	<div className='flex flex-col gap-2'>
																		<>
																			<Button onClick={() => handleModalAc(leave.id)} >Approve</Button>
																			<Button onClick={() => handleModalRj(leave.id)}>Reject</Button>
	
																			
																		</>
																	</div>
																}
															</td>
														</>
													:
														<>
															<td className={`max-w-[150px] break-words ${classes}`}>
																<div className="flex flex-col">
																	<div className=""><span className='font-bold'>From:</span> {format(startbodyateRaw, 'MMM dd, yyyy')}</div>
																	<div className=""><span className='font-bold'>To:</span> {format(endDateRaw, 'MMM dd, yyyy')}</div>
																</div>
															</td>
															<td className={`capitalize  ${classes}`}>{leave.type}</td>
															<td className={`  ${classes}`}>{leave.reason}</td>
															<td className={`  ${classes}`}><span className={`text-white rounded-md px-4 py-1 capitalize ${leave.status == 'approved' ? 'bg-green-400' : (leave.status == 'rejected' ? 'bg-red-400' : 'bg-deep-orange-500')} `}>{leave.status}</span></td>
															<td className={`  ${classes}`}>{leave.remarks ?? '-'}</td>
															<td className={`  ${classes}`}>
																{leave.status == 'pending' &&
																	<>
																		<Button>Cancel Request</Button>
																		<Dialog>
																			<DialogHeader>Cancel Leave Request</DialogHeader>
	
																			<DialogBody>
																				<div className='flex justify-end gap-3 mt-4'>
																					<Button color="gray" variant="gradient" id="approveLeave" onClick={() => cancelRequest(leave.id)} > <Spinner loading={formLoader} size={2} /> Yes</Button>
																				</div>
																			</DialogBody>
																			<DialogFooter>
																				<Button variant="outlined" color="red">
																					Cancel
																				</Button>
																			</DialogFooter>
																		</Dialog>
																	</>
																}
															</td>
														</>
													}
												</tr>
										)
									}) :
									(<tr>
										<td colSpan={5} className='text-center'>No data found.</td>
									</tr>)
						}
					</tbody>
				</table>
			</CardBody>
			<Dialog open={isOpenAccept} handler={() => setIsOpenAccept(!isOpenAccept)}  id="leaveApproveDialog">
				<DialogHeader>Approve Leave</DialogHeader>
				<DialogBody>
					<div className='flex flex-col gap-3'>
						<label>
							<Typography as="div" size="2" mb="1" weight="bold">
								Remarks
							</Typography>
							<Textarea placeholder="Remarks to Employee..." className="w-full" onChange={(e) => { setRemarks(e.target.value) }} value={remarks} />
						</label>
					</div>
				</DialogBody>
				<DialogFooter>
					<div className='flex gap-3 mt-4 justify-end'>
						
						<Button onClick={() => approveLeave(selectedLeave)} className={`flex justify-center items-center gap-2 ${formSubmitingAc ? 'opacity-50 cursor-not-allowed' : '' } `} variant="gradient" color="gray" type='submit' disabled={formSubmitingAc} >
							{formSubmitingAc && <span><Spinner/></span> }
							<span>Approve</span>
						</Button>

						<Button variant="outlined" color="red" id="leaveApprClosebtn" onClick={() => handleModalAc()} >
							Cancel
						</Button>
					</div>
				</DialogFooter>
			</Dialog>
			<Dialog open={isOpenReject} handler={() => setIsOpenReject(!isOpenReject)}  id="leaveRejectbodyialog">
				<DialogHeader>Reject Leave</DialogHeader>

				<DialogBody>
					<div className='flex flex-col gap-3'>
						<label>
							<Typography as="div" size="2" mb="1" weight="bold">
								Remarks
							</Typography>
							<Textarea placeholder="Remarks to Employee..." className="w-full" onChange={(e) => { setRemarks(e.target.value) }} value={remarks}>
							</Textarea>
						</label>
					</div>

				
				</DialogBody>
				
				<DialogFooter>
					<div className='flex gap-3 mt-4 justify-end'>
						
						<Button className={`flex justify-center items-center gap-2 ${formSubmitingRj ? 'opacity-50 cursor-not-allowed' : '' } `} variant="gradient" color="gray" type='submit' onClick={() => rejectLeave(selectedLeave)}  disabled={formSubmitingRj} >
							{formSubmitingRj && <span><Spinner/></span> }
							<span>Reject</span>
						</Button>

						<Button variant="outlined" color="red" id="leaveApprClosebtn" onClick={() => handleModalRj()} >
							Cancel
						</Button>
					</div>
				</DialogFooter>
			</Dialog>
		</Card>
	)
}

export default LeaveManagement