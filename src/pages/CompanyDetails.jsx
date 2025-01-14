
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useParams } from 'react-router-dom';
import Employees from "./Employees.jsx"
import { useEffect, useState } from "react"
import { Label } from "@radix-ui/react-label"
import { Textarea } from "@/components/ui/textarea.jsx"
import EmployeesListing from "@/components/EmployeesListing.jsx"
import AddEmployeeForm from "@/components/AddEmployeeForm.jsx"
import useAuthAxios from "@/lib/authAxios.js"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { logout } from "@/store/features/auth/AuthSlice.js"
import UpdateEmployeeForm from "@/components/UpdateEmployeeForm.jsx"

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAuthAxios();
  const dispatch = useDispatch();
  // fetching company details
  const fetchCompanyDetails = async () => {
    try {
      const response = await axiosInstance.get(`/companies/${companyId}`);
      console.log('company resp', response.data.data)
      setCompanyData(response.data.data);
      setEmployees(response.data.data.employees)
    } catch (error) {
      if(error.response?.status == 403) {
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

    fetchCompanyDetails();
  }, []);
  const [showAddEmpForm, setShowAddEmpForm] = useState(false);
  const [showEmpDetailsForm, setShowEmpDetailsForm] = useState(false);
  const [employees, setEmployees] = useState([]);
   
    const [companyData, setCompanyData] = useState({})
    const handleInputChange = (e) => {
      const { name, value } = e.target
      setCompanyData(prevData => ({
        ...prevData,
        [name]: value
      }))
    }
  
    const handleSubmit = (e) => {
      e.preventDefault()
      console.log('Form submitted:', companyData)
    }
  return (
    <div className="w-full p-2 relative h-full  max-h-[calc(100vh_-_2rem)]  ">
      <Box
        className="rounded-md "
        style={{
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-4)',
        }}
      >
        {/* Header */}
        <Flex justify="start" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
          {
            companyData.logo ?
            <img src={`${import.meta.env.VITE_API_UPLOADS_URL}/${companyData.logo}`} className="w-[50px] h-[50px] object-fit border border-gray-200 rounded-md mr-2" />
            :
            <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center rounded-md mr-2">
              <span className="text-gray-500">Logo</span>
            </div>
          }
          <Text size="5" weight="bold">{companyData.company_name} </Text>
        </Flex>

        {/* Scrollable Content Area */}
        <ScrollArea >
          <Box p="4" className="max-h-[calc(100vh_-_5rem)]"  >
            <div className="container mx-auto p-4">
              <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="company">Company Information</TabsTrigger>
                  <TabsTrigger value="employees">Employees</TabsTrigger>
                </TabsList>
                <TabsContent value="company">
                  <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                    <div className="flex items-center space-x-4">
                      {
                        companyData.logo ?
                        <img src={`${import.meta.env.VITE_API_UPLOADS_URL}/${companyData.logo}`} className="w-[200px] h-[200px] object-fit border border-gray-200 rounded-md" />
                        :
                        <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Company Logo</span>
                        </div>
                      }
                      <div>
                        <Label className="block text-left" htmlFor="logo">Update Company Logo</Label>
                        <Input id="logo" type="file" accept="image/*" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-left" htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          name="company_name"
                          value={companyData.company_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label className="block text-left" htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={companyData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label className="block text-left" htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={companyData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label className="block text-left" htmlFor="company_zip">ZIP Code</Label>
                        <Input
                          id="company_zip"
                          name="company_zip"
                          value={companyData.company_zip}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="block text-left" htmlFor="company_about">About</Label>
                      <Textarea
                        id="company_about"
                        name="company_about"
                        value={companyData.company_about}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label className="block text-left" htmlFor="company_address1">Address 1</Label>
                      <Input
                        id="company_address1"
                        name="company_address1"
                        value={companyData.company_address1}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label className="block text-left" htmlFor="company_address2">Address 2</Label>
                      <Input
                        id="company_address2"
                        name="company_address2"
                        value={companyData.company_address2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-left" htmlFor="company_city">City</Label>
                        <Input
                          id="company_city"
                          name="company_city"
                          value={companyData.company_city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label className="block text-left" htmlFor="company_state">State</Label>
                        <Input
                          id="company_state"
                          name="company_state"
                          value={companyData.company_state}
                          onChange={handleInputChange}
                        />
                      </div>

                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </TabsContent>
                <TabsContent value="employees">
                  <Flex direction='column' >
                    {
                      showAddEmpForm ? 
                        <AddEmployeeForm showFormHandler={() => setShowAddEmpForm(false)} companyId={companyId} refreshList={() => fetchCompanyDetails() }/>
                      :
                        <EmployeesListing employees={employees} showFormHandler={() => setShowAddEmpForm(true)}/>
                    }
                  </Flex>
                </TabsContent>
              </Tabs>
            </div>
          </Box>
        </ScrollArea>
      </Box>
    </div>
  )
}

export default CompanyDetails