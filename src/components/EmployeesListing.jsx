import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from "react-router-dom"
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
import { useState } from "react"

const EmployeesListing = ({employees, showFormHandler}) => {

    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('firstname')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const filteredEmployees = employees.filter(employee =>
        employee.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    return (
        <div className="w-full p-2 relative h-full">
            <Box className="rounded-md" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-4)' }}>

                {/* Scrollable Content Area */}
                <ScrollArea>
                    <Box p="4" className="h-screen">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex items-center space-x-4">
                                    <Input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="max-w-sm"
                                    />
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="firstname">First Name</SelectItem>
                                            <SelectItem value="lastname">Last Name</SelectItem>
                                            <SelectItem value="company">Company</SelectItem>
                                            <SelectItem value="designation">Designation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={sortOrder} onValueChange={setSortOrder}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                            <SelectItem value="desc">Descending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* <Link to='/dashboard/add-employee'> */}
                                    <Button onClick={showFormHandler}>Add Employee</Button>
                                {/* </Link> */}
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <button className="flex items-center" onClick={() => handleSort('firstname')}>
                                                First Name
                                                {sortBy === 'firstname' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button className="flex items-center" onClick={() => handleSort('lastname')}>
                                                Last Name
                                                {sortBy === 'lastname' && (sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </button>
                                        </TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="text-left">{employee.firstname}</TableCell>
                                            <TableCell className="text-left">{employee.lastname}</TableCell>
                                            <TableCell className="text-left">{employee.email}</TableCell>
                                            <TableCell className="text-left">{employee.company}</TableCell>
                                            <TableCell className="text-left">{employee.designation}</TableCell>
                                            <TableCell className="text-left">
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                    <Button variant="outline" size="sm">View</Button>
                                                    <Button variant="outline" size="sm">Delete</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between">
                                <div>
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedEmployees.length)} of {sortedEmployees.length} entries
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

export default EmployeesListing;
