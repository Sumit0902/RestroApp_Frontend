import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  CalendarIcon,
  ClipboardIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { ForgetPassword, SignIn, SignUp } from "@/pages/auth"; 
import CompanyProfile from "./pages/dashboard/companyProfile";
import Shifts from "./pages/dashboard/shifts";
import Schedules from "./pages/dashboard/schedules";
import TaskList from "./pages/dashboard/taskList";
import Employees from "./pages/dashboard/employees";
import TimeSheet from "./pages/dashboard/timeSheet";
import LeaveManagement from "./pages/dashboard/leaveManagement";
import Payroll from "./pages/dashboard/payroll";
import MyProfile from "./pages/dashboard/employee/myprofile";
import MySchedule from "./pages/dashboard/employee/myschedule";
import MyTasks from "./pages/dashboard/employee/mytasks";
import MyTimesheet from "./pages/dashboard/employee/mytimesheet";
import MyLeaves from "./pages/dashboard/employee/myleaves";
import MyPayroll from "./pages/dashboard/employee/mypayroll";
import SingleEmployee from "./pages/dashboard/singleEmployee";
import ResetPassword from "./pages/auth/reset-password";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const managerNavRoutes = [
  {
    title: "Company Settings",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: '/',
        element: <Home  />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "company profile",
        path: '/company-profile',
        element: <CompanyProfile />,
      },
      {
        icon: <ArrowsRightLeftIcon {...icon} />,
        name: "shifts",
        path: '/shifts',
        element: <Shifts />,
      },
      {
        icon: <CalendarIcon {...icon} />,
        name: "schedules",
        path: '/schedules',
        element: <Schedules />,
      },
      {
        icon: <ClipboardIcon {...icon} />,
        name: "tasks",
        path: '/tasks',
        element: <TaskList />,
      },
    ]
  },
  {
    title: "Employee management",
    layout: "dashboard",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "employees",
        path: "/employees",
        element: <Employees />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "timesheet",
        path: "/timesheet",
        element: <TimeSheet />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "leave management",
        path: "/leave-management",
        element: <LeaveManagement />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "payroll",
        path: "/payroll",
        element: <Payroll />,
      },
    ],
  },
]

export const managerRoutes = [
  {
    title: "Company Settings",
    layout: "dashboard",
    pages: [
      {
        icon: null,
        name: "single-employee",
        path: '/employee/:id',
        element: <SingleEmployee  />,
      },
    ]
  },
]

export const employeeNavRoutes = [
  {
    title: "Company Settings",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: '/',
        element: <Home  />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "my profile",
        path: '/profile',
        element: <MyProfile />,
      },
      {
        icon: <CalendarIcon {...icon} />,
        name: "schedules",
        path: '/my-schedules',
        element: <MySchedule />,
      },
      {
        icon: <ClipboardIcon {...icon} />,
        name: "tasks",
        path: '/my-tasks',
        element: <MyTasks />,
      },
      {
        icon: <ClipboardIcon {...icon} />,
        name: "timesheet",
        path: '/my-timesheet',
        element: <MyTimesheet />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "leave management",
        path: "/my-leaves",
        element: <MyLeaves />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "my payroll",
        path: "/my-payroll",
        element: <MyPayroll />,
      },
    ]
  },
]

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <MyProfile />
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "forget  password",
        path: "/forget-password",
        element: <ForgetPassword />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "reset password",
        path: "/reset-password",
        element: <ResetPassword />,
      },
    ],
  },
];

export default routes;
