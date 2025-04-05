import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes, { managerNavRoutes, employeeNavRoutes } from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { Profile } from "@/pages/dashboard";
import SingleEmployee from "@/pages/dashboard/singleEmployee";
import { useSelector } from "react-redux";
import NotFound from "@/pages/404";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  const userData = useSelector((state) => state.auth.user);

  const routes = userData?.role === 'manager' ? managerNavRoutes : employeeNavRoutes;
  console.log('dash user data', userData)
  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80 min-h-screen relative">
        <DashboardNavbar />
        {/* <Configurator /> */}
        {/* <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton> */}
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
            )}
          {/* extra routes not present in manager or employee route list */}
          {userData?.role === 'manager' && 
              <>
              <Route exact path='/profile' element={<Profile/>} />
              <Route exact path='/employee/:id' element={<SingleEmployee/>} />
              </>
          } 
           <Route path="*" element={<NotFound />} />
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
