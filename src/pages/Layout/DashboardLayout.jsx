import { Outlet } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import { Flex } from "@radix-ui/themes"
import { toast, ToastContainer } from "react-toastify"
import { useEffect } from "react"
// import echo from "@/lib/echo.js"
import { useSelector } from "react-redux" 

const DashboardLayout = () => {
  
  return (
    <div className="restro-main w-full h-screen overflow-hidden bg-[#fafafa] ">
        <Flex className="w-full h-full">
          <Sidebar />
          <Outlet/>
        </Flex>
        <ToastContainer autoClose={5000}/>
    </div>
  )
}

export default DashboardLayout