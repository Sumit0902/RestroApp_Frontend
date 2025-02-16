import { useState } from 'react'
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea.jsx"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Box, Flex, ScrollArea, Select, Table, Text } from "@radix-ui/themes"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"    
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
// import useAuthAxios from '@/lib/authAxios.js'
import { useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@radix-ui/react-select'
import LeaveList from './LeaveList.jsx'

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


const LeaveManagement = () => {
    // const axiosInstance = useAuthAxios();
    const token = useSelector((state) => state.auth.user.access_token); // assuming 'auth' is the name of your slice
    // const navigate = useNavigate();
    const companyId = useSelector((state) => state.auth.user.company.id); // assuming 'auth' is the name of your slice

    const [loading, setLoading] = useState(true)

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
            <LeaveList/>
            </Box>
        </div>
    )
}

export default LeaveManagement