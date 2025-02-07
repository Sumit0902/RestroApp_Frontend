import { useState } from 'react'
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea.jsx"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Box, Flex, ScrollArea, Select, Text } from "@radix-ui/themes"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"    
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import useAuthAxios from '@/lib/authAxios.js'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@radix-ui/react-select'

// const FileUpload = ({ id, accept, onChange }) => {
//     return (
//         <Input
//             id={id}
//             type="file"
//             accept={accept}
//             onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
//         />
//     )
// }


const AddEmployee = () => {
    const axiosInstance = useAuthAxios();
    const token = useSelector((state) => state.auth.user.access_token); // assuming 'auth' is the name of your slice
    const navigate = useNavigate();
    const companyId = useSelector((state) => state.auth.user.company.id); // assuming 'auth' is the name of your slice


    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [designation, setDesignation] = useState('')
    const [wageRate, setWageRate] = useState(0)
    const [wageDuration, setWageDuration] = useState('weekly')
    const [avatar, setAvatar] = useState(null)
    const [workDays, setWorkDays] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false
    })
    const [showPassword, setShowPassword] = useState(false)

    const handleWorkDayChange = (day) => {
        setWorkDays(prev => ({ ...prev, [day]: !prev[day] }))
    }


    const handleSubmit = (event) => {
            event.preventDefault()
            const employeeData = {
                'firstname': firstName,
                'lastname': lastName,
                email,
                password,
                'company_role': designation,
                'company_id': companyId,
                workDays: Object.keys(workDays).filter(day => workDays[day]),
                avatar,
                'wage': wageRate,
                'wage_rate': wageDuration
            }
            try {
                addEmployee(employeeData)
            } catch (error) {
                console.log('submit error', error)
                toast.error();
            }
    
            console.log('Employee Data:', employeeData)
            // Here you would typically send this data to your backend
    }
 
    const addEmployee = async (data) => {

        const fd = new FormData();
        for (const key in data) {
            fd.append(key, data[key]);
        }

        let addEmpRes = await axios.post(import.meta.env.VITE_API_URL + '/employee/add', fd, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if(addEmpRes && addEmpRes.data.success == true) {
            toast.success('Employee added successfully!');
            setFirstName('')
            setLastName('')
            setEmail('')
            setPassword('')
            setDesignation('')
            setAvatar(null) 
            setWageRate(0)
            setWageDuration('hourly')
            setWorkDays({
                Monday: false,
                Tuesday: false,
                Wednesday: false,
                Thursday: false,
                Friday: false,
                Saturday: false,
                Sunday: false
            })
            setShowPassword(false)

            
        }
        else {
            toast.error('There is an error in your submission!');
            toast.error(addEmpRes.data.error);
        }

        console.log(addEmpRes)
    }

    const handleFileChange = (e) => {
        setAvatar(e.target.files?.[0] || null)
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
                    <Text size="5" weight="bold">Add Employee</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>

                {/* Scrollable Content Area */}
                <ScrollArea >
                    <Box p="4" style={{ paddingBottom: '20px' }} className="h-screen text-left "  >
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Add New Employee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wage">Wage</Label>
                                        <Input
                                            id="wage"
                                            value={wageRate}
                                            onChange={(e) => setWageRate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wageRate">Wage Rate</Label>
                                        <Select >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Wage Rate" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Wage Rate</SelectLabel>
                                                    <SelectItem value='hourly'>Hourly</SelectItem>
                                                    <SelectItem value='weekly'>Weekly</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Days of Work</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.keys(workDays).map((day) => (
                                            <div key={day} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={day}
                                                    checked={workDays[day]}
                                                    onCheckedChange={() => handleWorkDayChange(day)}
                                                />
                                                <Label htmlFor={day}>{day}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Add Employee</Button>
                            </form>
                        </CardContent>
                    </Box>
                </ScrollArea>
            </Box>
        </div>
    )
}

export default AddEmployee