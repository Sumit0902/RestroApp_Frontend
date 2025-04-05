import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"


import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import useAuthAxios from "@/lib/authAxios.js"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { EyeIcon, PencilIcon, PencilSquareIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import {
	Card,
	CardHeader,
	Input,
	Typography,
	Button,
	CardBody,
	Chip,
	CardFooter,
	Tabs,
	TabsHeader,
	Tab,
	Avatar,
	IconButton,
	Tooltip,
} from "@material-tailwind/react";
import { handleAuthError } from '@/lib/utils'


const Employees = () => {

	
	const TABS = [
		{
			label: "All",
			value: "all",
		},
		{
			label: "Managers",
			value: "managers",
		},
		{
			label: "Staff",
			value: "staff",
		},
	];

	  
	const userData = useSelector(state => state.auth.user);

    const axiosInstance = useAuthAxios();
    const [companyInfo, setCompanyInfo] = useState({});
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('firstname')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

	const navigate = useNavigate();

    const filteredEmployees = employees.filter(employee =>
        employee?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.company?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedEmployees = sortedEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

    const fetchCompanyEmployees = async () => {
        if (userData) {
            let company_id = userData.company.id;
			try {
				let employeesResponse = await axiosInstance.get(`/companies/${company_id}/employees`);
				// let shiftsResponse = await axiosInstance.get(`/companies/${company_id}/shifts`);
				const employees = employeesResponse.data.data;
				let filteredEmployees = employees || [];
				// let filteredShifts = shiftsResponse.data?.data || [];
				// setCompanyInfo(companyData);
				setEmployees(filteredEmployees); 
	
				console.log('cd', filteredEmployees)
				
			} catch (error) {
				handleAuthError(error, dispatch, navigate);
			}
        }
    };
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    useEffect(() => {
            fetchCompanyEmployees(); 
		
    }, []);

	const handleEditUser = (userId) => {
		console.log('eidt user click')
		navigate(`/dashboard/employee/${userId}`)
	}
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
						<Button className="flex items-center gap-3" size="sm">
						<UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add member
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
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<button className="flex items-center" onClick={() => handleSort('firstname')}>
								First Name
								{sortBy === 'firstname' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
							</button>
						</th>
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<button className="flex items-center" onClick={() => handleSort('lastname')}>
								Last Name
								{sortBy === 'lastname' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
							</button>
						</th>
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<Typography>
								Email
							</Typography>
						</th>
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<Typography>
								Designation
							</Typography>
						</th>
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<Typography>
								Status
							</Typography>
						</th>
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<Typography>
								Joining Date
							</Typography>
						</th>
						<th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4" >
							<Typography>
								Actions
							</Typography>
						</th> 
					</tr>
				</thead>
				<tbody>
					{ paginatedEmployees && Object.keys(paginatedEmployees).length > 0 ?
						paginatedEmployees.map(
						({ id, avatar, firstname, lastname, email, company_role, created_at }, index) => {
							const isLast = index === Object.keys(paginatedEmployees).length - 1;
							const classes = isLast
							? "p-4"
							: "p-4 border-b border-blue-gray-50";

							let uAvatar = avatar ? `${import.meta.env.VITE_API_UPLOADS_URL}/${avatar}` : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
							let online = true;
							console.log(Object.keys(paginatedEmployees).length)
							return (
							<tr key={firstname}>
								<td className={classes}>
									<div className="flex items-center gap-3">
										
										<div className="flex flex-col">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-normal"
										>
											{firstname}  
										</Typography>
										</div>
									</div>
								</td>
								<td className={classes}>
									<div className="flex items-center gap-3"> 
										<div className="flex flex-col">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-normal"
										>  {lastname}
										</Typography>
										</div>
									</div>
								</td>
								<td className={classes}>
									<div className="flex items-center gap-3"> 
										<div className="flex flex-col">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-normal opacity-70"
										>
											{email}
										</Typography>
										</div>
									</div>
								</td>
								<td className={classes}>
								<div className="flex flex-col">
									<Typography
									variant="small"
									color="blue-gray"
									className="font-normal"
									>
									{company_role ?? '-'}
									</Typography>
									
								</div>
								</td>
								<td className={classes}>
								<div className="w-max">
									<Chip
									variant="ghost"
									size="sm"
									value={online ? "online" : "offline"}
									color={online ? "green" : "blue-gray"}
									/>
								</div>
								</td>
								<td className={classes}>
								<Typography
									variant="small"
									color="blue-gray"
									className="font-normal"
								>
									{created_at}
								</Typography>
								</td>
								<td className={classes}>
								<Tooltip content="Edit User">
									<IconButton variant="text" onClick={() => handleEditUser(id)}>
										<PencilIcon className="h-4 w-4" />
									</IconButton>
								</Tooltip>
								</td>
							</tr>
							);
						},
						)
					 :
						<tr>
							<td colSpan={7}>No Data</td>
						</tr>
					}
				</tbody>
				</table>
			</CardBody>
			<CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
				<Typography variant="small" color="blue-gray" className="font-normal">
				Page 1 of 10
				</Typography>
				<div className="flex gap-2">
				<Button variant="outlined" size="sm">
					Previous
				</Button>
				<Button variant="outlined" size="sm">
					Next
				</Button>
				</div>
			</CardFooter>
		</Card>
       
	)
}

export default Employees;





 