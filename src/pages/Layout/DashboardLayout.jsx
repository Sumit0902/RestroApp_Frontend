import { Outlet } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import { Flex } from "@radix-ui/themes"

const DashboardLayout = () => {
  return (
    <div className="restro-main w-full h-screen overflow-hidden bg-[#fafafa] ">
        <Flex className="w-full h-full">
          <Sidebar />
          <Outlet/>
        </Flex>
    </div>
  )
}

export default DashboardLayout