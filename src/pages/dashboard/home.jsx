import React, { useState } from "react";
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
} from "@material-tailwind/react";
import {
	EllipsisVerticalIcon,
	ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
	statisticsCardsData,
	statisticsChartsData,
	projectsTableData,
	ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useAuthAxios from "@/lib/authAxios";

export function Home() {
	const userData = useSelector((state) => state.auth.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const axiosInstance = useAuthAxios();
	const [schedules, setSchedules] = useState({});
	const [weekOffset, setWeekOffset] = useState(0);
	if (!userData || null === userData) {
		dispatch(logout);
		setTimeout(() => {
			navigate('/');
		}, 3000);
	}

	const fetchEmployeeSchedule = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.post(`/companies/${userData.company.id}/schedules`, {
				week_number: weekNumber,
				year: year,
				company_id: userData.company.id,
			});
			if (response?.data.success) {
				setSchedules(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching schedules:", error);
		} finally {
			setLoading(false);
		}
	}
	console.log(userData)
	return (
		userData.role == 'manager' ? (
			<div className="mt-12 max-w-[64rem] mx-auto">
				<div className="greeter my-12">
					<h2 className="mb-2 text-4xl">Welcome ,</h2>
					<h2 className="font-bold text-6xl">{userData ? `${userData.firstname} ${userData.lastname}` : ''}</h2>
					<h3 className="text-gray-600 text-3xl">@ {userData ? `${userData.company.company_name}` : ''}</h3>
				</div>
				<div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
					{statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
						<StatisticsCard
							key={title}
							{...rest}
							title={title}
							icon={React.createElement(icon, {
								className: "w-6 h-6 text-white",
							})}
							footer={
								<Typography className="font-normal text-blue-gray-600">
									<strong className={footer.color}>{footer.value}</strong>
									&nbsp;{footer.label}
								</Typography>
							}
						/>
					))}
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
									Tasks
								</Typography>
								<Typography
									variant="small"
									className="flex items-center gap-1 font-normal text-blue-gray-600"
								>
									<CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
									<strong>30 done</strong> this month
								</Typography>
							</div>
						</CardHeader>
						<CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
							<table className="w-full min-w-[640px] table-auto">
								<thead>
									<tr>
										{["companies", "members", "budget", "completion"].map(
											(el) => (
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
											)
										)}
									</tr>
								</thead>
								<tbody>
									{projectsTableData.map(
										({ img, name, members, budget, completion }, key) => {
											const className = `py-3 px-5 ${key === projectsTableData.length - 1
												? ""
												: "border-b border-blue-gray-50"
												}`;

											return (
												<tr key={name}>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<div className="flex items-center gap-4">
															<Avatar src={img} alt={name} size="sm" />
															<Typography
																variant="small"
																color="blue-gray"
																className="font-bold"
															>
																{name}
															</Typography>
														</div>
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														{members.map(({ img, name }, key) => (
															<Tooltip key={name} content={name}>
																<Avatar
																	src={img}
																	alt={name}
																	size="xs"
																	variant="circular"
																	className={`cursor-pointer border-2 border-white ${key === 0 ? "" : "-ml-2.5"
																		}`}
																/>
															</Tooltip>
														))}
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<Typography
															variant="small"
															className="text-xs font-medium text-blue-gray-600"
														>
															{budget}
														</Typography>
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<div className="w-10/12">
															<Typography
																variant="small"
																className="mb-1 block text-xs font-medium text-blue-gray-600"
															>
																{completion}%
															</Typography>
															<Progress
																value={completion}
																variant="gradient"
																color={completion === 100 ? "green" : "blue"}
																className="h-1"
															/>
														</div>
													</td>
												</tr>
											);
										}
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
				{/* <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
					<StatisticsCard
						key={title}
						{...rest}
						title={title}
						icon={React.createElement(icon, {
							className: "w-6 h-6 text-white",
						})}
						footer={
							<Typography className="font-normal text-blue-gray-600">
								<strong className={footer.color}>{footer.value}</strong>
								&nbsp;{footer.label}
							</Typography>
						}
					/>
				</div> */}
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
								</Typography>
							</div>
						</CardHeader>
						<CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
							<table className="w-full min-w-[640px] table-auto">
								<thead>
									<tr>
										{["day", "shift", "start time", "end time"].map(
											(el) => (
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
											)
										)}
									</tr>
								</thead>
								<tbody>
									{projectsTableData.map(
										({ img, name, members, budget, completion }, key) => {
											const className = `py-3 px-5 ${key === projectsTableData.length - 1
												? ""
												: "border-b border-blue-gray-50"
												}`;

											return (
												<tr key={name}>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<div className="flex items-center gap-4">
															<Avatar src={img} alt={name} size="sm" />
															<Typography
																variant="small"
																color="blue-gray"
																className="font-bold"
															>
																{name}
															</Typography>
														</div>
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														{members.map(({ img, name }, key) => (
															<Tooltip key={name} content={name}>
																<Avatar
																	src={img}
																	alt={name}
																	size="xs"
																	variant="circular"
																	className={`cursor-pointer border-2 border-white ${key === 0 ? "" : "-ml-2.5"
																		}`}
																/>
															</Tooltip>
														))}
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<Typography
															variant="small"
															className="text-xs font-medium text-blue-gray-600"
														>
															{budget}
														</Typography>
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<div className="w-10/12">
															<Typography
																variant="small"
																className="mb-1 block text-xs font-medium text-blue-gray-600"
															>
																{completion}%
															</Typography>
															<Progress
																value={completion}
																variant="gradient"
																color={completion === 100 ? "green" : "blue"}
																className="h-1"
															/>
														</div>
													</td>
												</tr>
											);
										}
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
									Tasks
								</Typography>
								<Typography
									variant="small"
									className="flex items-center gap-1 font-normal text-blue-gray-600"
								>
									<CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
									<strong>30 done</strong> this month
								</Typography>
							</div>
						</CardHeader>
						<CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
							<table className="w-full min-w-[640px] table-auto">
								<thead>
									<tr>
										{["companies", "members", "budget", "completion"].map(
											(el) => (
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
											)
										)}
									</tr>
								</thead>
								<tbody>
									{projectsTableData.map(
										({ img, name, members, budget, completion }, key) => {
											const className = `py-3 px-5 ${key === projectsTableData.length - 1
												? ""
												: "border-b border-blue-gray-50"
												}`;

											return (
												<tr key={name}>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<div className="flex items-center gap-4">
															<Avatar src={img} alt={name} size="sm" />
															<Typography
																variant="small"
																color="blue-gray"
																className="font-bold"
															>
																{name}
															</Typography>
														</div>
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														{members.map(({ img, name }, key) => (
															<Tooltip key={name} content={name}>
																<Avatar
																	src={img}
																	alt={name}
																	size="xs"
																	variant="circular"
																	className={`cursor-pointer border-2 border-white ${key === 0 ? "" : "-ml-2.5"
																		}`}
																/>
															</Tooltip>
														))}
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<Typography
															variant="small"
															className="text-xs font-medium text-blue-gray-600"
														>
															{budget}
														</Typography>
													</td>
													<td className="py-4 px-5 border-b border-blue-gray-50">
														<div className="w-10/12">
															<Typography
																variant="small"
																className="mb-1 block text-xs font-medium text-blue-gray-600"
															>
																{completion}%
															</Typography>
															<Progress
																value={completion}
																variant="gradient"
																color={completion === 100 ? "green" : "blue"}
																className="h-1"
															/>
														</div>
													</td>
												</tr>
											);
										}
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
