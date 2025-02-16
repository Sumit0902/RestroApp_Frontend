import { useEffect, useState } from 'react'
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"  
import { Box, Button, Dialog, Flex, ScrollArea,  Spinner,  Table, Text, TextArea, TextField } from "@radix-ui/themes"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"     
// import useAuthAxios from '@/lib/authAxios.js'
import { useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify' 
import useAuthAxios from '@/lib/authAxios.js'
import { format, parse } from 'date-fns'  

 

const LeaveList = () => {
    const axiosInstance = useAuthAxios();
    const userData = useSelector((state) => state.auth.user); // assuming 'auth' is the name of your slice
    const token = userData?.access_token 
    // const navigate = useNavigate();
    const companyId = useSelector((state) => state.auth.user.company.id); // assuming 'auth' is the name of your slice

    const [loading, setLoading] = useState(true)
    const [formLoader, setFormLoader] = useState(false)
    const [leaves, setLeaves] = useState([])
  
    const [leaveType, setLeaveType] = useState('')
    const [reason, setReason] = useState('')
    const [remarks, setRemarks] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [startError, setStartError] = useState('');
    const [endError, setEndError] = useState('');

    const fetchLeaves = async () => {
        
        if(userData.role == 'manager' ) {

            try {
                console.log('fetching company leaves' )
                let  leavesReq = await axiosInstance.get(`/companies/${companyId}/leave-management`,  {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setLeaves(leavesReq.data.data)
                console.log('company leaves', leavesReq.data.data)
                
            } catch (error) {
                
                console.log('Error leaves req', error)
            }

        }
        else {
            console.log('fetching user leaves' )

            try {
                let  leavesReq = await axiosInstance.get(`/companies/${companyId}/leave-management/myleaves/${userData.id}`,  {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setLeaves(leavesReq.data.data)
                console.log('User leaves', leavesReq.data)
                
            } catch (error) {
                
                console.log('Error leaves req', error)
            }

        }
        setLoading(false)

    }


    useEffect(() => {
        fetchLeaves()
    }, [])

    const resetForm = () => {
        setStartDate('');
        setStartError('');
        setEndDate('');
        setEndError('');
        setReason('')
        setRemarks('')
        document.querySelector('button#closeBtn').click()

    }
    const handleStartDate = (value) => { 
        const date = new Date(value);
        const today = new Date();
        if (date >= today) {
          if (!endDate || date <= new Date(endDate)) {
            setStartDate(value);
            setStartError('');
          } else {
            setStartError('Start date cannot be greater than end date.');
            setStartDate('');
          }
        } else {
          setStartError('Start date cannot be in the past.');
          setStartDate('');
        }
       console.log('end date ran',date, startDate, endDate, event.target.value)

      };

      const handleEndDate = (value) => {
        const date = new Date(value);
        if (!startDate || date >= new Date(startDate)) {
          setEndDate(value);
          setEndError('');
        } else {
          setEndError('End date cannot be less than start date.');
          setEndDate('');
        }
        console.log('end date ran',date, startDate, endDate, value)
      };
    const approveLeave = async (leaveId) => {
        setFormLoader(true)
        try {
            let  approveReq = await axiosInstance.put(`/companies/${companyId}/leave-management/${leaveId}/approve`, { remarks }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('approveReq', approveReq)
            setFormLoader(false)
            toast.success('Leave approved successfully')
            fetchLeaves()
        } catch (error) {
            setFormLoader(false)
            console.log('Error leaves req', error)
            toast.error('Failed to approve leave')
        }
    }

    const rejectLeave = async (leaveId) => { 
        setFormLoader(true)
        try {
            let  rejectReq = await axiosInstance.put(`/companies/${companyId}/leave-management/${leaveId}/reject`, { remarks }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('rejectReq', rejectReq)
            setFormLoader(false)
            toast.success('Leave rejected successfully')
            fetchLeaves()
        } catch (error) {
            setFormLoader(false)
            console.log('Error leaves req', error)
            toast.error('Failed to reject leave')
        }
    }

    const cancelRequest = async (leaveId) => {
        setFormLoader(true)
        try {
            let  cancelReq = await axiosInstance.put(`/companies/${companyId}/leave-management/${leaveId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('cancelReq', cancelReq)
            setFormLoader(false)
            document.querySelector('button#closeBtn').click()
            toast.success('Leave request cancelled successfully')
            fetchLeaves()

        } catch (error) {
            setFormLoader(false)
            console.log('Error leaves req', error)
            toast.error('Failed to cancel leave request')
        }
    }

    const requestLeave = async () => {
        setFormLoader(true)
        try {
            let  leaveReq = await axiosInstance.post(`/companies/${companyId}/leave-management/myleaves/${userData.id}/request`, { start_date: startDate, end_date: endDate, reason, leaveType }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('leaveReq', leaveReq)
            setFormLoader(false)
            toast.success('Leave requested successfully')
            fetchLeaves()

            resetForm();

        } catch (error) {
            setFormLoader(false)
            console.log('Error leaves req', error)
            toast.error('Failed to request leave')
        }
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
                    <Text size="5" weight="bold">Leave Management</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>

                {/* Scrollable Content Area */}
                <ScrollArea >
                    <Box p="4" style={{ paddingBottom: '20px' }} className="h-screen text-left "  >
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <CardTitle className="text-2xl font-bold">{userData.role == 'manager' ? 'Leave Requests' : 'My Leaves' }</CardTitle>
                                { userData.role != 'manager' &&
                                    <Dialog.Root>
                                        <Dialog.Trigger>
                                            <Button>Request Leave</Button>
                                        </Dialog.Trigger>

                                        <Dialog.Content maxWidth="450px">
                                            <Dialog.Title>Leave Request Application</Dialog.Title>
                                            <Dialog.Description size="2" mb="4">
                                                Submit form below to Apply for Leave Request
                                            </Dialog.Description>
                                            <form onSubmit={(e) => requestLeave()}>
                                                <Flex direction="column" gap="3">
                                                    <label>
                                                        <Text as="div" size="2" mb="1" weight="bold">
                                                            Leave From
                                                        </Text>
                                                        <input type="date" className="w-full border-2 outline-none border-gray-200 p-1 rounded-lg focus:border-indigo-200" value={startDate} onChange={(e) => { handleStartDate(e.target.value) }} />
                                                        {startError && <div className='text-red-400'>{startError}</div>}
                                                    </label>
                                                    <label>
                                                        <Text as="div" size="2" mb="1" weight="bold">
                                                            Leave To
                                                        </Text>
                                                        <input type="date" className="w-full border-2 outline-none border-gray-200 p-1 rounded-lg focus:border-indigo-200" value={endDate} onChange={(e) => { handleEndDate(e.target.value) }} />
                                                        {endError && <div className='text-red-400'>{endError}</div>}
                                                    </label>
                                                    <label>
                                                        <Text as="div" size="2" mb="1" weight="bold">
                                                            Type
                                                        </Text>
                                                        <select className='border-2 w-full outline-none border-gray-200 p-1 rounded-lg focus:border-indigo-200' value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                                                            <option value="casual">Casual</option>
                                                            <option value="emergency">Emergency</option>
                                                            <option value="vacation">Vacation</option>
                                                        </select>
                                                    </label>
                                                    <label>
                                                        <Text as="div" size="2" mb="1" weight="bold">
                                                            Reason
                                                        </Text>
                                                        <TextField.Root
                                                            type='text' 
                                                            placeholder="Enter reason"
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                        />
                                                    </label>
                                                </Flex>
                                            </form>
                                            <Flex gap="3" mt="4" justify="end">
                                                <Button color="indigo" variant="soft" id="approveLeave" onClick={() => requestLeave()} > <Spinner loading={formLoader} size={2} /> Request</Button>
                                                <Dialog.Close>
                                                    <Button variant="solid" color="indigo" id="closeBtn" >
                                                        Cancel
                                                    </Button>
                                                </Dialog.Close>
                                            </Flex>
                                        </Dialog.Content>
                                    </Dialog.Root>
                                }
                            </div>
                        </CardHeader>
                        <CardContent>
                        <Table.Root>
                            <Table.Header>
                                {userData.role == 'manager' ?  
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Employee</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Leave Duration</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Remarks</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                                    </Table.Row>
                                :
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Remarks</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                                    </Table.Row>
                                }
                            </Table.Header>

                            <Table.Body>
                                {
                                    loading ?
                                    <Table.Row>
                                        <Table.RowHeaderCell colSpan={userData.role == 'manager' ? 7 : 6} className='text-center'>Loading...</Table.RowHeaderCell>
                                    </Table.Row>
                                    :
                                    
                                    leaves.length > 0 ? 
                                    leaves.map((leave, index) => {
                                        const startDateRaw = parse(leave.start_date, 'yyyy-MM-dd', new Date());
                                        const endDateRaw = parse(leave.end_date, 'yyyy-MM-dd', new Date());

                                        console.log(leave, index)
                                        return (
                                            <>
                                                {userData.role == 'manager' ? 
                                                    <Table.Row key={index}>
                                                        <Table.RowHeaderCell>
                                                            <div className="flex flex-col">
                                                                <div className='font-bold'>
                                                                    {leave.user?.firstname} {leave.user?.lastname}
                                                                </div>
                                                                <div className='italic'>
                                                                    {leave.user?.email}
                                                                </div>
                                                            </div>
                                                        </Table.RowHeaderCell>
                                                        <Table.Cell>
                                                            <div className="flex flex-col">
                                                                <div className=""><span className='font-bold'>From:</span> {format(startDateRaw, 'MMM dd, yyyy')}</div>  
                                                                <div className=""><span className='font-bold'>To:</span> {format(endDateRaw, 'MMM dd, yyyy')}</div>  
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='capitalize'>{leave.type}</Table.Cell>
                                                        <Table.Cell>{leave.reason}</Table.Cell>
                                                        <Table.Cell><span className={`text-white rounded-md px-4 py-1 capitalize ${leave.status == 'approved' ? 'bg-green-400' : (leave.status == 'rejected' ? 'bg-red-400' : 'bg-deep-orange-500')} `}>{leave.status}</span></Table.Cell>
                                                        <Table.Cell>{leave.remarks ?? '-'}</Table.Cell>
                                                        <Table.Cell>
                                                            { leave.status == 'pending' &&
                                                                <div className='flex gap-2'>
                                                                    <Dialog.Root id="leaveApproveDialog">
                                                                        <Dialog.Trigger>
                                                                            <Button>Approve</Button>
                                                                        </Dialog.Trigger>
    
                                                                        <Dialog.Content maxWidth="450px">
                                                                            <Dialog.Title>Approve Leave</Dialog.Title>
    
                                                                            <Flex direction="column" gap="3">
                                                                                <label>
                                                                                    <Text as="div" size="2" mb="1" weight="bold">
                                                                                        Remarks
                                                                                    </Text>
                                                                                    <TextArea placeholder="Remarks to Employee..."  className="w-full" onChange={(e) => { setRemarks(e.target.value) }}>
                                                                                        {remarks}
                                                                                    </TextArea>
                                                                                </label>
                                                                            </Flex>
    
                                                                            <Flex gap="3" mt="4" justify="end">
                                                                                <Button color="indigo" variant="soft" id="approveLeave" onClick={() => approveLeave(leave.id)} > <Spinner loading={formLoader} size={2} /> Approve</Button>
    
                                                                                <Dialog.Close>
                                                                                    <Button variant="soft" color="crimson">
                                                                                        Cancel
                                                                                    </Button>
                                                                                </Dialog.Close>
                                                                            </Flex>
                                                                        </Dialog.Content>
                                                                    </Dialog.Root>
                                                                    <Dialog.Root id="leaveRejectDialog">
                                                                        <Dialog.Trigger>
                                                                            <Button>Reject</Button>
                                                                        </Dialog.Trigger>
    
                                                                        <Dialog.Content maxWidth="450px">
                                                                            <Dialog.Title>Reject Leave</Dialog.Title>
    
                                                                            <Flex direction="column" gap="3">
                                                                                <label>
                                                                                    <Text as="div" size="2" mb="1" weight="bold">
                                                                                        Remarks
                                                                                    </Text>
                                                                                    <TextArea placeholder="Remarks to Employee..."  className="w-full" onChange={(e) => { setRemarks(e.target.value) }}>
                                                                                        {remarks}
                                                                                    </TextArea>
                                                                                </label>
                                                                            </Flex>
    
                                                                            <Flex gap="3" mt="4" justify="end">
                                                                                <Button color="indigo" variant="soft" id="approveLeave" onClick={() => rejectLeave(leave.id)} > <Spinner loading={formLoader} size={2} /> Reject</Button>
    
                                                                                <Dialog.Close>
                                                                                    <Button variant="soft" color="crimson">
                                                                                        Cancel
                                                                                    </Button>
                                                                                </Dialog.Close>
                                                                            </Flex>
                                                                        </Dialog.Content>
                                                                    </Dialog.Root>
                                                                </div>
                                                            }
                                                        </Table.Cell>
                                                    </Table.Row>
                                                :
                                                  
                                                <Table.Row key={index}>
                                                    <Table.Cell>
                                                        <div className="flex flex-col">
                                                            <div className=""><span className='font-bold'>From:</span> {format(startDateRaw, 'MMM dd, yyyy')}</div>  
                                                            <div className=""><span className='font-bold'>To:</span> {format(endDateRaw, 'MMM dd, yyyy')}</div>  
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className='capitalize'>{leave.type}</Table.Cell>
                                                    <Table.Cell>{leave.reason}</Table.Cell>
                                                    <Table.Cell><span className={`text-white rounded-md px-4 py-1 capitalize ${leave.status == 'approved' ? 'bg-green-400' : (leave.status == 'rejected' ? 'bg-red-400' : 'bg-deep-orange-500')} `}>{leave.status}</span></Table.Cell>
                                                    <Table.Cell>{leave.remarks ?? '-'}</Table.Cell>
                                                    <Table.Cell>
                                                        { leave.status == 'pending' &&
                                                            <Dialog.Root>
                                                                <Dialog.Trigger>
                                                                    <Button>Cancel Request</Button>
                                                                </Dialog.Trigger>

                                                                <Dialog.Content maxWidth="450px">
                                                                    <Dialog.Title>Cancel Leave Request</Dialog.Title>
                                                                    <Dialog.Description size="2" mb="4">
                                                                        Are you sure you want to cancel Leave request?
                                                                    </Dialog.Description>
                                                                    <Flex gap="3" mt="4" justify="end">
                                                                        <Button color="green" variant="soft" id="approveLeave" onClick={() => cancelRequest(leave.id)} > <Spinner loading={formLoader} size={2} /> Yes</Button>
                                                                        <Dialog.Close>
                                                                            <Button variant="soft" color="crimson">
                                                                                Cancel
                                                                            </Button>
                                                                        </Dialog.Close>
                                                                    </Flex>
                                                                </Dialog.Content>
                                                            </Dialog.Root>
                                                        }
                                                    </Table.Cell>
                                                </Table.Row>
                                                }
                                            </>
                                        )
                                    }) :
                                    (<Table.Row>
                                        <Table.RowHeaderCell colSpan={5} className='text-center'>No data found.</Table.RowHeaderCell>
                                    </Table.Row>)
                                }
                            </Table.Body>
                        </Table.Root>
                        </CardContent>
                    </Box>
                </ScrollArea>
            </Box>
        </div>
    )
}

export default LeaveList