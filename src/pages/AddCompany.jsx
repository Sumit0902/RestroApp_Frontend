import { useState } from 'react'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import useAuthAxios from '@/lib/authAxios.js'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'


const FileUpload = ({ id, accept, onChange }) => {
    return (
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      />
    )
  }


const AddCompany = () => {
   // const authAxios = useAuthAxios();
    const token = useSelector((state) => state.auth.user.access_token); // assuming 'auth' is the name of your slice
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        logo: null,
        company_name: '',
        company_about: '',
        company_address1: '',
        company_address2: '',
        company_city: '',
        company_state: '',
        company_zip: '',
        phone: '',
        email: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleFileChange = (file) => {
        setFormData(prevData => ({
            ...prevData,
            logo: file
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Here you would typically send the data to your database
        console.log('Form data submitted:', formData)

        try {
            createCompany(formData);
        } catch (error) {
            console.log('submit error', error)
            toast.error();
        }
        // Reset form after submission
        // setFormData({
        //     logo: null,
        //     company_name: '',
        //     company_about: '',
        //     company_address1: '',
        //     company_address2: '',
        //     company_city: '',
        //     company_state: '',
        //     company_zip: '',
        //     phone: '',
        //     email: '',
        // })
    }

    const createCompany = async (data) => {

        const fd = new FormData();
        for (const key in data) {
            fd.append(key, data[key]);
        }


        let addRes = await axios.post(import.meta.env.VITE_API_URL+'/companies/add', fd,   {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if(addRes && addRes.data.success == true) {
            toast.success('Company added successfully!');

             setFormData({
                logo: null,
                company_name: '',
                company_about: '',
                company_address1: '',
                company_address2: '',
                company_city: '',
                company_state: '',
                company_zip: '',
                phone: '',
                email: '',
            })

            setTimeout(() => {
                navigate('/dashboard/companies');
            }, 2000);
        }
        else {
            toast.error('There is an error in your submission!');
            toast.error(addRes.data.error);
        }
        console.log(addRes, addRes.data)
    }

    return (
        <div className="w-full p-2 relative h-full  max-h-[calc(100vh_-_2rem)]">
        <Box
            className="rounded-md "
            style={{
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-4)',
            }}
        >
            {/* Header */}
            <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
                <Text size="5" weight="bold">Add Company</Text>
                <Button variant="ghost" style={{ display: 'none' }}>
                    <HamburgerMenuIcon />
                </Button>
            </Flex>

            {/* Scrollable Content Area */}
            <ScrollArea >
                <Box p="4" style={{ paddingBottom: '20px' }} className="max-h-[calc(100vh_-_5rem)] text-left "  >
                    <CardHeader>
                        <CardTitle>Add Company</CardTitle>
                        <CardDescription>Enter the details of the company you want to add to the database.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="logo">Company Logo</Label>
                                <FileUpload
                                    id="logo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="Acme Ltd."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_about">About the Company</Label>
                                <Textarea
                                    id="company_about"
                                    name="company_about"
                                    value={formData.company_about}
                                    onChange={handleChange}
                                    placeholder="Brief description of the company"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_address1">Address Line 1</Label>
                                <Input
                                    id="company_address1"
                                    name="company_address1"
                                    value={formData.company_address1}
                                    onChange={handleChange}
                                    placeholder="123 O'Connell Street"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_address2">Address Line 2</Label>
                                <Input
                                    id="company_address2"
                                    name="company_address2"
                                    value={formData.company_address2}
                                    onChange={handleChange}
                                    placeholder="Apartment 4B"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_city">City/Town</Label>
                                    <Input
                                        id="company_city"
                                        name="company_city"
                                        value={formData.company_city}
                                        onChange={handleChange}
                                        placeholder="Dublin"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company_state">County</Label>
                                    <Input
                                        id="company_state"
                                        name="company_state"
                                        value={formData.company_state}
                                        onChange={handleChange}
                                        placeholder="Dublin"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_zip">Zipcode</Label>
                                <Input
                                    id="company_zip"
                                    name="company_zip"
                                    value={formData.company_zip}
                                    onChange={handleChange}
                                    placeholder="D01 F5P2"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="01 234 5678"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contact@company.ie"
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">Add Company</Button>
                        </CardFooter>
                    </form>
                </Box>
            </ScrollArea>
        </Box>
    </div>
    )
}

export default AddCompany