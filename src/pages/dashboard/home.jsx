import React, { useEffect, useState } from "react";
import {
	Typography,
	Card,
	CardHeader,
	CardBody,
	IconButton,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Avatar,
	Tooltip,
	Progress,
	Spinner,
	Button,
} from "@material-tailwind/react";
import {
	EllipsisVerticalIcon,
	ArrowUpIcon,
	CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useAuthAxios from "@/lib/authAxios";
import { format, getISOWeek, getYear, startOfWeek, endOfWeek } from "date-fns"; 
import { ListBulletIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/solid";

export function Home() {
	const userData = useSelector((state) => state.auth.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const axiosInstance = useAuthAxios();
	const [schedules, setSchedules] = useState({});
	const [weekOffset, setWeekOffset] = useState(0);
	const [tasks, setTasks] = useState([]); 
	const [totalEmployees, setTotalEmployees] = useState(0); 

	if (!userData || null === userData) {
		dispatch(logout);
		setTimeout(() => {
			navigate('/');
		}, 3000);
	}

	const fetchEmployeeSchedule = async () => {
		setLoading(true);

		const currentDate = new Date();
		const year = getYear(currentDate); 
		const weekNumber = getISOWeek(currentDate); 

		try {
			const response = await axiosInstance.post(`/companies/${userData.company.id}/schedules/${userData.id}`, {
				week_number: weekNumber,
				year: year,
				company_id: userData.company.id,
			});
			console.log('user week s', response.data)
			if (response?.data.success) {
				setSchedules(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching schedules:", error);
		} finally {
			setLoading(false);
		}
	}

	const fetchWeeklyTasks = async () => {
		setLoading(true);
 
		const currentDate = new Date();
		const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
		const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

		try {
			const response = await axiosInstance.post(
				`/companies/${userData.company.id}/tasks/${userData.id}/weekly`,
				{
					company_id: userData.company.id,
					employee_id: userData.id,
					week_start: weekStart,
					week_end: weekEnd,
				}
			);

			if (response?.data.success) {
				setTasks(response.data.data);  
			}
		} catch (error) {
			console.error("Error fetching weekly tasks:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCompanyWeeklyTasks = async () => {
		setLoading(true);
 
		const currentDate = new Date();
		const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
		const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

		try {
			const response = await axiosInstance.post(
				`/companies/${userData.company.id}/tasks/weekly`,
				{
					company_id: userData.company.id,
					week_start: weekStart,
					week_end: weekEnd,
				}
			);

			if (response?.data.success) {
				setTasks(response.data.data); 
			}
		} catch (error) {
			console.error("Error fetching company weekly tasks:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchTotalEmployees = async () => {
		try {
			const response = await axiosInstance.post(
				`/companies/${userData.company.id}/employees`,
			);

			if (response?.data.success) {
				setTotalEmployees(response.data.data.length);
				// toast.success("Task marked as complete!");
				// fetchWeeklyTasks(); // Refresh tasks after marking complete

			}
		} catch (error) {
			console.error("Error marking task as complete:", error);
			toast.error("Failed to mark task as complete.");
		}
	}

	const fetchLastMonthPayout = async () => { 

	}

	const markTaskComplete = async (taskId) => {
		try {
			const response = await axiosInstance.post(
				`/companies/${userData.company.id}/tasks/${taskId}/complete`,
				{
					company_id: userData.company.id,
					employee_id: userData.id,
				}
			);

			if (response?.data.success) {
				toast.success("Task marked as complete!");
				fetchWeeklyTasks(); // Refresh tasks after marking complete
			}
		} catch (error) {
			console.error("Error marking task as complete:", error);
			toast.error("Failed to mark task as complete.");
		}
	};

	console.log(userData)

	useEffect(() => {
		fetchEmployeeSchedule();
		if(userData.role == 'manager') {
			fetchCompanyWeeklyTasks();
			fetchTotalEmployees();
		}
		else {
			fetchWeeklyTasks(); 
		}
	}, [])
	
	return (
		userData.role == 'manager' ? (
			<div className="mt-12 max-w-[64rem] mx-auto">
				<div className="greeter my-12">
					<h2 className="mb-2 text-4xl">Welcome ,</h2>
					<h2 className="font-bold text-6xl">{userData ? `${userData.firstname} ${userData.lastname}` : ''}</h2>
					<h3 className="text-gray-600 text-3xl">@ {userData ? `${userData.company.company_name}` : ''}</h3>
				</div>
				<div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-1 xl:grid-cols-3">
					<StatisticsCard
						key="This week Tasks" 
						color="gray"
						title="This week Tasks"
						icon={<ListBulletIcon className="w-6 h-6"/>}
						value={loading ? 
							<div className="flex justify-end mt-1"><Spinner className="block"/></div>
							: (tasks ? tasks.length : 0)}
					/>
					<StatisticsCard
						key="Total Users" 
						color="gray"
						title="Total Users"
						icon={<UserGroupIcon className="w-6 h-6"/>}
						value={loading ? 
							<div className="flex justify-end mt-1"><Spinner className="block"/></div>
							: (tasks ? tasks.length : 0)}
					/>
					<StatisticsCard
						key="Payout Last Month" 
						color="gray"
						title="Payout Last Month"
						icon={<UserGroupIcon className="w-6 h-6"/>}
						value={loading ? 
							<div className="flex justify-end mt-1"><Spinner className="block"/></div>
							: (tasks ? tasks.length : 0)}
					/>
					 
				</div>
				 
				<div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
					<Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
						<CardHeader
							floated={false}
							shadow={false}
							color="transparent"
							className="m-0 flex items-center justify-between p-6"
						>
							<div>
								<Typography variant="h6" color="blue-gray" className="mb-1">
									Weekly Tasks
								</Typography>
								<Typography
									variant="small"
									className="flex items-center gap-1 font-normal text-blue-gray-600"
								>
									{tasks.length > 0
										? `There are ${tasks.length} tasks added for employees this week`
										: "No tasks scheduled for this week"}
								</Typography>
							</div>
						</CardHeader>
						<CardBody className="overflow-x-auto px-0 pt-0 pb-2">
							<table id="weekly-tasks-company" className="w-full min-w-[640px] table-auto">
								<thead>
									<tr>
										{["Task Name", "Description", "Assigned User", "Status"].map((el) => (
											<th
												key={el}
												className="border-b border-blue-gray-50 py-3 px-6 text-left"
											>
												<Typography
													variant="small"
													className="text-[11px] font-medium uppercase text-blue-gray-400"
												>
													{el}
												</Typography>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={5} className="font-medium col-span-5 py-2 text-center">
												<div className="flex justify-center gap-4 w-full">
													<Spinner /> Loading!
												</div>
											</td>
										</tr>
									) : tasks.length > 0 ? (
										tasks.map((task, index) => (
											<tr key={index}>
												<td className="py-4 px-5 border-b border-blue-gray-50">
													<Typography
														variant="small"
														className="text-xs font-medium text-blue-gray-600"
													>
														{task.name}
													</Typography>
												</td>
												<td className="py-4 px-5 border-b border-blue-gray-50">
													<Typography
														variant="small"
														className="text-xs font-medium text-blue-gray-600"
													>
														{task.description}
													</Typography>
												</td>
												<td className="py-4 px-5 border-b border-blue-gray-50">
													<div className="flex items-center gap-4">
														{task.user.avatar ? 
															<div className="  flex justify-center items-center gap-2">
																<Avatar
																	src={`${import.meta.env.VITE_API_UPLOADS_URL}/${task.user.avatar}`}
																	alt={task.user.name}
																	size="sm"
																/>
																<span className="text-xs">{task.user.firstname} {task.user.lastname}</span>
															</div>
														:
															<div className="  flex justify-center items-center gap-2">
																<div className='cursor-pointer no-avatar-preview rounded-full w-8 h-8 aspect-square p-2 bg-gray-200 text-gray-700'>
																	<UserIcon className='aspect-square'/>
																</div>
																<span className="text-xs">{task.user.firstname} {task.user.lastname}</span>
															</div>
															
														}
														
													</div>
												</td>
												<td className="py-4 px-5 border-b border-blue-gray-50">
													<Typography
														variant="small"
														className={`text-xs font-medium capitalize rounded-full px-2 py-1 text-center max-w-[100px] capitalize ${
															task.status === "completed"
																? "text-green-700 bg-green-200"
																: "text-orange-700 bg-orange-200"
														}`}
													>
														{task.status}
													</Typography>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={5}
												className="py-4 px-5 text-center text-blue-gray-600"
											>
												No tasks scheduled for this week.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</CardBody>
					</Card>
				</div>
			</div>
		) : (
			<div className="mt-12 max-w-[64rem] mx-auto">
				<div className="greeter my-12">
					<h2 className="mb-2 text-4xl">Welcome ,</h2>
					<h2 className="font-bold text-6xl">{userData ? `${userData.firstname} ${userData.lastname}` : ''}</h2>
					<h3 className="text-gray-600 text-3xl">@ {userData ? `${userData.company.company_name}` : ''}</h3>
				</div>
			 
				<div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
					<Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
						<CardHeader
							floated={false}
							shadow={false}
							color="transparent"
							className="m-0 flex items-center justify-between p-6"
						>
							<div>
								<Typography variant="h6" color="blue-gray" className="mb-1">
									Schedule This Week
								</Typography>
								<Typography
									variant="small"
									className="flex items-center gap-1 font-normal text-blue-gray-600"
								>
									{schedules[userData.id]?.shifts?.length > 0
										? `You have ${schedules[userData.id].shifts.length} shifts this week`
										: "No shifts scheduled for this week"}
								</Typography>
							</div>
						</CardHeader>
						<CardBody className="overflow-x-auto px-0 pt-0 pb-2">
							<table id="weekly-schedule-table" className="w-full min-w-[640px] table-auto">
								<thead>
									<tr>
										{["Day", "Shift Name", "Start Time", "End Time", "Notes"].map((el) => (
											<th
												key={el}
												className="border-b border-blue-gray-50 py-3 px-6 text-left"
											>
												<Typography
													variant="small"
													className="text-[11px] font-medium uppercase text-blue-gray-400"
												>
													{el}
												</Typography>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{schedules[userData.id]?.shifts?.length > 0 ? ( 
										schedules[userData.id].shifts
											.sort((a, b) => new Date(a.date) - new Date(b.date))
											.map((shift, index) => {
												const day = new Date(shift.date).toLocaleDateString("en-US", {
													weekday: "long",
												});

												// Convert start_time and end_time to AM/PM format
												const startTime = format(new Date(`1970-01-01T${shift.start_time}`), "hh:mm a");
												const endTime = format(new Date(`1970-01-01T${shift.end_time}`), "hh:mm a");

												return (
													<tr key={index}>
														<td className="py-4 px-5 border-b border-blue-gray-50">
															<Typography
																variant="small"
																className="text-xs font-medium text-blue-gray-600"
															>
																{day}
															</Typography>
														</td>
														<td className="py-4 px-5 border-b border-blue-gray-50">
															<Typography
																variant="small"
																className="text-xs font-medium text-blue-gray-600"
															>
																{shift.name}
															</Typography>
														</td>
														<td className="py-4 px-5 border-b border-blue-gray-50">
															<Typography
																variant="small"
																className="text-xs font-medium text-blue-gray-600"
															>
																{startTime}
															</Typography>
														</td>
														<td className="py-4 px-5 border-b border-blue-gray-50">
															<Typography
																variant="small"
																className="text-xs font-medium text-blue-gray-600"
															>
																{endTime}
															</Typography>
														</td>
														<td className="py-4 px-5 border-b border-blue-gray-50">
															<Typography
																variant="small"
																className="text-xs font-medium text-blue-gray-600"
															>
																{schedules[userData.id]?.notes || "No notes available"}
															</Typography>
														</td>
													</tr>
												);
											})
									) : (
										<tr>
											<td
												colSpan={5}
												className="py-4 px-5 text-center text-blue-gray-600"
											>
												No shifts scheduled for this week.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</CardBody>
					</Card>
				</div>
				<div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
					<Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
						<CardHeader
							floated={false}
							shadow={false}
							color="transparent"
							className="m-0 flex items-center justify-between p-6"
						>
							<div>
								<Typography variant="h6" color="blue-gray" className="mb-1">
									Weekly Tasks
								</Typography>
								<Typography
									variant="small"
									className="flex items-center gap-1 font-normal text-blue-gray-600"
								>
									{tasks.length > 0
										? `You have ${tasks.length} tasks this week`
										: "No tasks scheduled for this week"}
								</Typography>
							</div>
						</CardHeader>
						<CardBody className="overflow-x-auto px-0 pt-0 pb-2">
							<table id="weekly-tasks-table" className="w-full min-w-[640px] table-auto">
								<thead>
									<tr>
										{["Task Name", "Description", "Status", "Actions"].map((el) => (
											<th
												key={el}
												className="border-b border-blue-gray-50 py-3 px-6 text-left"
											>
												<Typography
													variant="small"
													className="text-[11px] font-medium uppercase text-blue-gray-400"
												>
													{el}
												</Typography>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={4} className="font-medium col-span-4 py-2 text-center">
												<div className="flex justify-center gap-4 w-full">
													<Spinner /> Loading!
												</div>
											</td>
										</tr>
									) : tasks.length > 0 ? (
										tasks.map((task, index) => (
											<tr key={index}>
												<td className="w-[10%] py-4 px-5 border-b border-blue-gray-50">
													<Typography
														variant="small"
														className="text-xs font-medium text-blue-gray-600"
													>
														{task.name}
													</Typography>
												</td>
												<td className="w-[30%] py-4 px-5 border-b border-blue-gray-50">
													<Typography
														variant="small"
														className="text-xs font-medium text-blue-gray-600"
													>
														{task.description}
													</Typography>
												</td>
												<td className="w-[20%] py-4 px-5 border-b border-blue-gray-50">
													<Typography
														variant="small"
														className={`text-xs font-medium   rounded-full px-2 py-1 text-center max-w-[100px] capitalize ${
															task.status === "completed"
																? "text-green-600 bg-green-200"
																: "text-orange-600 bg-orange-200"
														} `}
													>
														{task.status}
													</Typography>
												</td>
												<td className="w-[10%] py-4 px-5 border-b border-blue-gray-50">
													{task.status === "completed" ? (
														<CheckBadgeIcon className="h-6 w-6 text-green-600" />
													) : (
														<Button
															variant="gradient"
															color="gray"
															onClick={() => markTaskComplete(task.id)}
															className="text-xs"
														>
															Mark Complete
														</Button>
													)}
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={4}
												className="py-4 px-5 text-center text-blue-gray-600"
											>
												No tasks scheduled for this week.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</CardBody>
					</Card>
				</div>
			</div>
		)
	);
}

export default Home;
