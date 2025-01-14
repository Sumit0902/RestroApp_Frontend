import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
// import axios from "axios"
import useAuthAxios from "@/lib/authAxios.js"
import { useDispatch } from "react-redux"
import { logout } from "@/store/features/auth/AuthSlice.js"
import { toast } from "react-toastify"

const Companies = () => {
    const [loading, setLoading] = useState(true)
    const [companies, setCompanies] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    const navigate = useNavigate();
    const axiosInstance = useAuthAxios();
    const dispatch = useDispatch();


    const companiesDummy = [
        { id: 1, logo: '/placeholder.svg?height=40&width=40', name: 'Acme Corp', owner: 'John Doe', ownerEmail: 'john@acme.com', employeeCount: 250, registeredOn: new Date('2020-01-15') },
        { id: 2, logo: '/placeholder.svg?height=40&width=40', name: 'Globex', owner: 'Jane Smith', ownerEmail: 'jane@globex.com', employeeCount: 1000, registeredOn: new Date('2018-06-22') },
        { id: 3, logo: '/placeholder.svg?height=40&width=40', name: 'Initech', owner: 'Michael Bolton', ownerEmail: 'michael@initech.com', employeeCount: 150, registeredOn: new Date('2021-03-10') },
        { id: 4, logo: '/placeholder.svg?height=40&width=40', name: 'Umbrella Corp', owner: 'Alice Wesker', ownerEmail: 'alice@umbrella.com', employeeCount: 5000, registeredOn: new Date('2015-11-30') },
        { id: 5, logo: '/placeholder.svg?height=40&width=40', name: 'Stark Industries', owner: 'Tony Stark', ownerEmail: 'tony@stark.com', employeeCount: 3000, registeredOn: new Date('2010-05-04') },
    ]

    useEffect(() => {
        const fetchCompanies = async () => {
          try {
            const response = await axiosInstance.get(`/companies`);
            console.log('company resp', response.data.data)
            setCompanies(response.data.data);
          } catch (error) {
            if(error.response?.status == 403) {
                // token must be expired 
                dispatch(logout);
                toast.error('Your session has expired. please login again');

                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
            console.error('Error fetching companies:', error, error.response.status);
          }
        };
    
        fetchCompanies();
      }, []);

      
    
    const filteredCompanies = companies.filter(company => {
        console.log(company)
        return (
            company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedCompanies = sortedCompanies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const navigageToCompany = (companyId) => {
        navigate(`/dashboard/companies/${companyId}`);
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
                    <Text size="5" weight="bold">Companies</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>

                {/* Scrollable Content Area */}
                <ScrollArea >
                    <Box p="4" className="h-screen "  >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex items-center  space-x-4">
                                    <Input
                                        type="text"
                                        placeholder="Search companies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="max-w-sm"
                                    />
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Company Name</SelectItem>
                                            {/* <SelectItem value="owner">Owner</SelectItem> */}
                                            <SelectItem value="employeeCount">Employee Count</SelectItem>
                                            <SelectItem value="registeredOn">Registration Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                            <SelectItem value="desc">Descending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Link to='/dashboard/companies/add'><Button  >Add Company</Button></Link>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Logo</TableHead>
                                        <TableHead>
                                            <button className="flex items-center" onClick={() => handleSort('name')}>
                                                Company Name
                                                {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </button>
                                        </TableHead>
                                        <TableHead>Manager Email</TableHead>
                                        <TableHead>
                                            <button className="flex items-center" onClick={() => handleSort('employeeCount')}>
                                                Employee Count
                                                {sortBy === 'employeeCount' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button className="flex items-center" onClick={() => handleSort('registeredOn')}>
                                                Registered On
                                                {sortBy === 'registeredOn' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </button>
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* {loading && } */}
                                    {paginatedCompanies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                {
                                                    company.logo ? 
                                                    <img src={`${import.meta.env.VITE_API_UPLOADS_URL}/${company.logo}`} alt={`${company.company_name} logo`} className="w-10 h-10 object-contain" />
                                                    :
                                                    <img src={`https://placehold.co/800?text=${company.company_name}&font=roboto`} alt={`${company.company_name} logo`} className="w-10 h-10 object-contain" />
                                                }
                                            </TableCell>
                                            <TableCell className="text-left">{company.company_name}</TableCell>
                                            {/* <TableCell className="text-left">{company.owner}</TableCell> */}
                                            <TableCell className="text-left">{company.email}</TableCell>
                                            <TableCell className="text-left">{company.employees.length}</TableCell>
                                            <TableCell className="text-left">{company.created_at}</TableCell>
                                            <TableCell className="text-left">
                                                <div className="flex space-x-2">
                                                    {/* <Button variant="outline" size="sm" >View</Button> */}
                                                    <Button variant="outline" size="sm" onClick={() => navigageToCompany(company.id)}>View</Button>
                                                    <Button variant="outline" size="sm">Delete</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between">
                                <div>
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedCompanies.length)} of {sortedCompanies.length} entries
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Box>
                </ScrollArea>
            </Box>
        </div>
    )
}

export default Companies