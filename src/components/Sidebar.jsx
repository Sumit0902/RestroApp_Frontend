import { Flex, ScrollArea } from "@radix-ui/themes"
import SidebarLink from "@/components/SidebarLink.jsx"
import { BackpackIcon, GearIcon, HomeIcon, PersonIcon } from "@radix-ui/react-icons"
import UserMenu from "./UserMenu.jsx"
import { CalendarClock, ClipboardList, Clock, Clock10, Clock2, CogIcon, GaugeCircleIcon, Repeat, SquareCheckIcon, Timer, User2Icon, Users } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const Sidebar = () => {

    const user = useSelector(state => state.auth.user)
    const navigate = useNavigate(); 
    console.log('user sidebar', user)
    useEffect(() => {
        if (!user || user === null) {
            navigate('/')
        }
    }, [user])



    return (
        <ScrollArea className="max-w-[250px] h-full   ">
            <Flex
                direction="column"
                justify="between"
                className="h-full  "
                width="250px"
                p="4"
            >
                <Flex direction="column" gap="3">
                    <div className="pb-4 flex justify-start   relative overflow-hidden h-24">
                        {user && user.role !== 'superadmin'  ?
                            <div className="logo_container h-12 w-48 overflow-hidden relative  ">
                                <div className="absolute animate-ticker inset-0">
                                    <div className="logo1 w-[200px] h-[50px] flex items-center justify-start   inset-0  ">
                                        <svg fill="#8a8a8a" className="mr-2" height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M255.977,75.249C156.31,75.249,75.226,156.333,75.226,256s81.084,180.751,180.751,180.751S436.728,355.667,436.728,256 S355.644,75.249,255.977,75.249z M255.977,415.855c-88.144,0-159.855-71.711-159.855-159.855S167.833,96.145,255.977,96.145 S415.832,167.856,415.832,256S344.121,415.855,255.977,415.855z"></path> </g> </g> <g> <g> <path d="M490.226,219.735c12.006,0,21.774-9.764,21.774-21.776l-0.064-69.599c-0.005-5.767-4.682-10.439-10.448-10.439 c-0.003,0-0.006,0-0.009,0c-5.771,0.005-10.444,4.687-10.439,10.457l0.064,69.589c0,0.48-0.394,0.87-0.878,0.87H484.1V128.37 c0-5.77-4.679-10.448-10.448-10.448s-10.448,4.678-10.448,10.448v70.469h-6.197c-0.484,0-0.878-0.391-0.878-0.879l-0.063-69.599 c-0.005-5.767-4.682-10.439-10.448-10.439c-0.003,0-0.006,0-0.009,0c-5.77,0.005-10.444,4.687-10.439,10.457l0.063,69.589 c0,12.002,9.768,21.766,21.774,21.766h6.197v47.016h-6.4c-5.769,0-10.448,4.678-10.448,10.448v110.408 c0,14.89,12.186,27.004,27.165,27.004s27.165-12.115,27.165-27.004V277.199c0-5.771-4.679-10.448-10.448-10.448H484.1v-47.016 H490.226z M479.789,387.607c0,3.311-2.871,6.108-6.269,6.108s-6.269-2.797-6.269-6.108v-99.96h12.538V387.607z"></path> </g> </g> <g> <g> <path d="M12.832,97.665c-3.107-0.726-6.375,0.003-8.875,1.985C1.459,101.631,0,104.648,0,107.837v279.769 c0,14.89,12.186,27.004,27.165,27.004s27.165-12.115,27.165-27.004V148.585C54.33,116,27.186,101.028,12.832,97.665z M33.434,387.607c0,3.311-2.871,6.108-6.269,6.108s-6.269-2.797-6.269-6.108v-99.96h12.538V387.607z M33.434,266.751H20.896 V124.229c0.208,0.149,0.416,0.303,0.624,0.459c8.017,6.031,11.914,13.847,11.914,23.897V266.751z"></path> </g> </g> <g> <g> <path d="M346.02,224.405c-13.392-38.164-49.578-63.805-90.043-63.805c-5.769,0-10.448,4.678-10.448,10.448 s4.679,10.448,10.448,10.448c31.605,0,59.867,20.025,70.325,49.828c1.508,4.3,5.546,6.992,9.859,6.992 c1.148,0,2.315-0.191,3.459-0.592C345.065,235.812,347.93,229.851,346.02,224.405z"></path> </g> </g> <g> <g> <path d="M340.93,245.474c-5.769,0-10.448,4.678-10.448,10.448V256c0,5.77,4.679,10.408,10.448,10.408 c5.769,0,10.448-4.716,10.448-10.487C351.378,250.151,346.699,245.474,340.93,245.474z"></path> </g> </g> <g> <g> <path d="M255.976,122.265c-73.713,0-133.683,59.971-133.683,133.685c0,29.337,9.325,57.182,26.967,80.528 c17.061,22.577,41.312,39.462,68.282,47.546c5.526,1.657,11.351-1.48,13.008-7.009c1.657-5.527-1.482-11.351-7.009-13.008 c-47.311-14.179-80.353-58.614-80.353-108.057c0-62.192,50.597-112.789,112.787-112.789c62.192,0,112.789,50.597,112.789,112.789 c0,49.444-33.043,93.88-80.355,108.058c-5.528,1.656-8.666,7.48-7.01,13.008c1.357,4.527,5.508,7.451,10.004,7.451 c0.993,0,2.003-0.143,3.003-0.442c26.973-8.083,51.224-24.968,68.285-47.545c17.643-23.346,26.969-51.192,26.969-80.529 C389.661,182.236,329.69,122.265,255.976,122.265z"></path> </g> </g> <g> <g> <path d="M255.973,368.726c-5.769,0-10.448,4.678-10.448,10.448v0.113c0,5.77,4.679,10.448,10.448,10.448 s10.448-4.678,10.448-10.448v-0.113C266.421,373.404,261.743,368.726,255.973,368.726z"></path> </g> </g> </g></svg>
                                        Restro Manage
                                    </div>
                                    <div className="logo2 w-[200px] h-[50px] flex items-center justify-start   inset-0  ">
                                        <img src={`${import.meta.env.VITE_API_UPLOADS_URL}/${user?.company?.logo }`} className='w-[40px] h-[40px] object-fit border border-gray-200 rounded-md mr-2'/>
                                        <span>{user?.company?.company_name}</span>
                                    </div>
                                </div>
                          </div>
                          
                            :
                            <div className="logo flex justify-start items-center">
                                <svg fill="#8a8a8a" className="mr-2" height="32px" width="32px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M255.977,75.249C156.31,75.249,75.226,156.333,75.226,256s81.084,180.751,180.751,180.751S436.728,355.667,436.728,256 S355.644,75.249,255.977,75.249z M255.977,415.855c-88.144,0-159.855-71.711-159.855-159.855S167.833,96.145,255.977,96.145 S415.832,167.856,415.832,256S344.121,415.855,255.977,415.855z"></path> </g> </g> <g> <g> <path d="M490.226,219.735c12.006,0,21.774-9.764,21.774-21.776l-0.064-69.599c-0.005-5.767-4.682-10.439-10.448-10.439 c-0.003,0-0.006,0-0.009,0c-5.771,0.005-10.444,4.687-10.439,10.457l0.064,69.589c0,0.48-0.394,0.87-0.878,0.87H484.1V128.37 c0-5.77-4.679-10.448-10.448-10.448s-10.448,4.678-10.448,10.448v70.469h-6.197c-0.484,0-0.878-0.391-0.878-0.879l-0.063-69.599 c-0.005-5.767-4.682-10.439-10.448-10.439c-0.003,0-0.006,0-0.009,0c-5.77,0.005-10.444,4.687-10.439,10.457l0.063,69.589 c0,12.002,9.768,21.766,21.774,21.766h6.197v47.016h-6.4c-5.769,0-10.448,4.678-10.448,10.448v110.408 c0,14.89,12.186,27.004,27.165,27.004s27.165-12.115,27.165-27.004V277.199c0-5.771-4.679-10.448-10.448-10.448H484.1v-47.016 H490.226z M479.789,387.607c0,3.311-2.871,6.108-6.269,6.108s-6.269-2.797-6.269-6.108v-99.96h12.538V387.607z"></path> </g> </g> <g> <g> <path d="M12.832,97.665c-3.107-0.726-6.375,0.003-8.875,1.985C1.459,101.631,0,104.648,0,107.837v279.769 c0,14.89,12.186,27.004,27.165,27.004s27.165-12.115,27.165-27.004V148.585C54.33,116,27.186,101.028,12.832,97.665z M33.434,387.607c0,3.311-2.871,6.108-6.269,6.108s-6.269-2.797-6.269-6.108v-99.96h12.538V387.607z M33.434,266.751H20.896 V124.229c0.208,0.149,0.416,0.303,0.624,0.459c8.017,6.031,11.914,13.847,11.914,23.897V266.751z"></path> </g> </g> <g> <g> <path d="M346.02,224.405c-13.392-38.164-49.578-63.805-90.043-63.805c-5.769,0-10.448,4.678-10.448,10.448 s4.679,10.448,10.448,10.448c31.605,0,59.867,20.025,70.325,49.828c1.508,4.3,5.546,6.992,9.859,6.992 c1.148,0,2.315-0.191,3.459-0.592C345.065,235.812,347.93,229.851,346.02,224.405z"></path> </g> </g> <g> <g> <path d="M340.93,245.474c-5.769,0-10.448,4.678-10.448,10.448V256c0,5.77,4.679,10.408,10.448,10.408 c5.769,0,10.448-4.716,10.448-10.487C351.378,250.151,346.699,245.474,340.93,245.474z"></path> </g> </g> <g> <g> <path d="M255.976,122.265c-73.713,0-133.683,59.971-133.683,133.685c0,29.337,9.325,57.182,26.967,80.528 c17.061,22.577,41.312,39.462,68.282,47.546c5.526,1.657,11.351-1.48,13.008-7.009c1.657-5.527-1.482-11.351-7.009-13.008 c-47.311-14.179-80.353-58.614-80.353-108.057c0-62.192,50.597-112.789,112.787-112.789c62.192,0,112.789,50.597,112.789,112.789 c0,49.444-33.043,93.88-80.355,108.058c-5.528,1.656-8.666,7.48-7.01,13.008c1.357,4.527,5.508,7.451,10.004,7.451 c0.993,0,2.003-0.143,3.003-0.442c26.973-8.083,51.224-24.968,68.285-47.545c17.643-23.346,26.969-51.192,26.969-80.529 C389.661,182.236,329.69,122.265,255.976,122.265z"></path> </g> </g> <g> <g> <path d="M255.973,368.726c-5.769,0-10.448,4.678-10.448,10.448v0.113c0,5.77,4.679,10.448,10.448,10.448 s10.448-4.678,10.448-10.448v-0.113C266.421,373.404,261.743,368.726,255.973,368.726z"></path> </g> </g> </g></svg>
                                Restro Manage
                            </div>
                        } 
                    </div>
                    {user?.role == 'superadmin' &&

                        <div className="admin-sidebar">
                            <label className="block mb-1 text-xs text-left uppercase">Administration</label>
                            <SidebarLink href="/dashboard" icon={<HomeIcon />} text="Dashboard" />
                            <SidebarLink href="/dashboard/companies" icon={<PersonIcon />} text="Companies" />
                            <SidebarLink href="/dashboard/reports" icon={<PersonIcon />} text="Reports" />
                            <SidebarLink href="/settings" icon={<GearIcon />} text="Settings" />
                        </div>
                    }

                    {user?.role == 'manager' &&

                        <>
                            <div className="manager-sidebar">
                                <label className="block mb-1 text-xs text-left uppercase">Company Settings</label>
                                <SidebarLink href="/dashboard/company-profile" icon={<Timer />} text="Company Profile" />
                                <SidebarLink href="/dashboard/shifts" icon={<Repeat />} text="Shifts" />
                                <SidebarLink href="/dashboard/schedules" icon={<CalendarClock />} text="Schedules" />
                                <SidebarLink href="/dashboard/task-list" icon={<ClipboardList />} text="Tasks" /> 
                            </div>
                            <div className="manager-sidebar">
                                <label className="block mb-1 text-xs text-left uppercase">Employee Management</label>
                                <SidebarLink href="/dashboard/employees" icon={<Users />} text="Employees" />
                                <SidebarLink href="/dashboard/timesheet" icon={<Timer />} text="Timesheet" />
                                {/* <SidebarLink href="/dashboard/schedule" icon={<CalendarClock />} text="Payroll" />  */}
                            </div>
                        </>
                    }


                    {user?.role == 'employee' &&

                        <div className="employee-sidebar">
                            <label className="block mb-1 text-xs text-left uppercase">Dashboard</label>
                            <SidebarLink href="/dashboard/timesheet" icon={<Timer />} text="Timesheet" />
                            <SidebarLink href="/dashboard/schedules" icon={<CalendarClock />} text="Schedule" />
                            <SidebarLink href="/dashboard/task-list" icon={<SquareCheckIcon />} text="Tasks" />
                            <SidebarLink href="/dashboard/profile-settings" icon={<User2Icon />} text="Profile Settings" />
                        </div>
                    }
                </Flex>
                <Flex className="footer-menu" direction="column" gap="3" justify="between">
                    <UserMenu userName={`${user?.firstname} ${user?.lastname}`} userEmail={user?.email} userAvatar={user?.avatar} />
                </Flex>
            </Flex>
        </ScrollArea>
    )
}

export default Sidebar