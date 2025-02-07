import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { X, Plus, Edit } from 'lucide-react'
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes" 
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import useAuthAxios from '@/lib/authAxios.js'
import { useDispatch, useSelector } from 'react-redux'
import { format, isValid, parse } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/store/features/auth/AuthSlice.js'
import { toast } from 'react-toastify'

export default function Shifts() {
 
  const [shifts, setShifts] = useState([]);
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentShift, setCurrentShift] = useState(null)
  const userData = useSelector(state => state.auth.user)
  const navigate = useNavigate();
  const axiosInstance = useAuthAxios();
  const dispatch = useDispatch();
  const fetchCompanyShifts = async () => {
    const companyId = userData.company.id;
    try {
      const response = await axiosInstance.get(`/companies/${companyId}/shifts`);
      console.log('company resp', response.data.data)
      setShifts(response.data.data);
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
    setLoading(false)
  };


  useEffect(() => {
    fetchCompanyShifts();
  }, [])
  

  const handleOpenModal = (shift = null) => {
    setCurrentShift(shift)
    setIsOpen(true)
  }

  const handleCloseModal = () => {
    setCurrentShift(null)
    setIsOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const shiftData = Object.fromEntries(formData.entries());
    

    if (shiftData.start_time) {
      if (shiftData.start_time.length === 5) { // "HH:mm"
        shiftData.start_time += ":00";
      }
      const parsedStartTime = parse(shiftData.start_time, 'HH:mm:ss', new Date());

    // Check if the parsed time is valid
    if (isValid(parsedStartTime)) {
      // Format the parsed time back to 'HH:mm:ss'
      shiftData.start_time = format(parsedStartTime, 'HH:mm:ss');
      console.log("Formatted start_time:", shiftData.start_time);
    } else {
      console.error("Parsed time is invalid:", shiftData.start_time);
    }
    }

    if (shiftData.end_time) {
      if (shiftData.end_time.length === 5) { // "HH:mm"
        shiftData.end_time += ":00";
      }
      const parsedEndTime = parse(shiftData.end_time, 'HH:mm:ss', new Date());
      console.log(shiftData.end_time, parsedEndTime);
      shiftData.end_time = format(parsedEndTime, 'HH:mm:ss');
      
    }


    try {
      let companyId = userData.company.id;
      if (currentShift) {
        // Update shift
        const response = await axiosInstance.patch(
          `/companies/${companyId}/shifts/${currentShift.id}/update`,
          shiftData
        );
        const updatedShift = response.data.data;
  
        // Update state with edited shift
        setShifts(shifts.map((shift) => (shift.id === currentShift.id ? updatedShift : shift)));
        
      } else {
        // Add new shift
        const response = await axiosInstance.post(
          `/companies/${companyId}/shifts/add`,
          shiftData
        );
        const newShift = response.data.data;
  
        // Add new shift to state
        setShifts([...shifts, newShift]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error("Error saving shift:", error.response?.data?.error || error.message);
      alert("An error occurred while saving the shift. Please try again.");
    }
  };

  return (
    <div className="w-full p-2 relative h-full">
      <Box className="rounded-md" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-4)' }}>
        {/* Header */}
        <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
          <Text size="5" weight="bold">Shifts</Text>
          <Button variant="ghost" style={{ display: 'none' }}>
            <HamburgerMenuIcon />
          </Button>
        </Flex>
 
        <ScrollArea>
          <Box p="4" className="h-screen">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">

                </div>
                <div className='flex gap-4'>
                  <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Shift
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    {/* <TableHead>Description</TableHead> */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ?
                  <TableRow >
                      <TableCell colSpan={5} className="font-medium col-span-4" >Loading!</TableCell>
                  </TableRow>
                  :

                  (shifts.length > 0 ?
                    shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium text-left">{shift.name}</TableCell>
                      <TableCell className="text-left">{shift.start_time}</TableCell>
                      <TableCell className="text-left">{shift.end_time}</TableCell>
                      {/* <TableCell>{shift.description}</TableCell> */}
                      <TableCell>
                        <Button variant="ghost" onClick={() => handleOpenModal(shift)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                  :
                  <TableRow  >
                      <TableCell colSpan={5} className="font-medium col-span-4" >No data to show yet!</TableCell>
                  </TableRow>)
                }
                </TableBody>
              </Table>

              <Transition appear show={isOpen} as={Fragment}>
                  <Dialog as="div" className="relative z-10" onClose={handleCloseModal}>
                      <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                      >
                          <div className="fixed inset-0 bg-black bg-opacity-25" />
                      </Transition.Child>

                      <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        {currentShift ? 'Edit Shift' : 'Add New Shift'}
                      </Dialog.Title>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <input type="hidden" name="company_id" id="compnay_id" value={userData.company.id} />
                          <Label htmlFor="name">Shift Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={currentShift?.name || ''}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="start_time">Start Time</Label>
                          <input
                          className='  h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                            type="time"
                            id="start_time"
                            name="start_time"
                            defaultValue={currentShift?.start_time || ''}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_time">End Time</Label>
                          <input
                            type="time"
                            className='  h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                            id="end_time"
                            name="end_time"
                            defaultValue={currentShift?.end_time || ''}
                            required
                          />
                        </div> 
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {currentShift ? 'Update' : 'Add'}
                          </Button>
                        </div>
                      </form>
                      <button
                        onClick={handleCloseModal}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                        aria-label="Close"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </Dialog.Panel>
                  </div>
                  </Dialog>
              </Transition>
            </div>
          </Box>
        </ScrollArea>
      </Box>
    </div>

  )
}