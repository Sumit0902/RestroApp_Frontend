import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom' 
import Dashboard from '@/pages/Dashboard.jsx'
import Auth from './pages/Auth'
import DashboardLayout from '@/pages/Layout/DashboardLayout.jsx'
import Companies from '@/pages/Companies.jsx'
import AddCompany from '@/pages/AddCompany.jsx'
import AddEmployee from '@/pages/AddEmployee.jsx'
import Employees from '@/pages/Employees.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css';
import CompanyDetails from '@/pages/CompanyDetails.jsx'
import EditCompany from '@/pages/EditCompany.jsx'
import TimeSheet from './pages/TimeSheet.jsx'
import Schedules from './pages/Schedules.jsx'
import TaskList from './pages/TaskList.jsx'
import Shifts from './pages/Shifts.jsx'
import CompanyProfile from './pages/CompanyProfile.jsx'
import ProfileSettings from './pages/ProfileSettings.jsx'
import LeaveManagement from './pages/LeaveManagement.jsx'
import Notifications from './pages/Notifications.jsx'

function App() {
   
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Auth />}/>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />}/>
              <Route path="companies" element={<Companies />}/>
              <Route path="companies/add" element={<AddCompany />}/>
              <Route path="companies/:companyId" element={<CompanyDetails />} />
              <Route path="companies/:companyId/edit" element={<EditCompany />} /> 
              <Route path="company-profile" element={<CompanyProfile />}/>
              <Route path="employees" element={<Employees />}/>
              <Route path="timesheet" element={<TimeSheet />}/>
              <Route path="shifts" element={<Shifts />}/>
              <Route path="schedules" element={<Schedules />}/>
              <Route path="task-list" element={<TaskList />}/>
              <Route path="add-employee" element={<AddEmployee />}/>
              <Route path="notifications" element={<Notifications />}/>
              <Route path="leave-management" element={<LeaveManagement />}/>
              <Route path="profile-settings" element={<ProfileSettings />}/>
            </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer autoClose={5000}/>
    </>
  )
}

export default App
