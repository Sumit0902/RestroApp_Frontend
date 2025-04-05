import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div
        className={`relative`}
      >
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            <div className="flex justify-center items-center"><svg fill="#ffffff" className="mr-2" height="32px" width="32px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M255.977,75.249C156.31,75.249,75.226,156.333,75.226,256s81.084,180.751,180.751,180.751S436.728,355.667,436.728,256 S355.644,75.249,255.977,75.249z M255.977,415.855c-88.144,0-159.855-71.711-159.855-159.855S167.833,96.145,255.977,96.145 S415.832,167.856,415.832,256S344.121,415.855,255.977,415.855z"></path> </g> </g> <g> <g> <path d="M490.226,219.735c12.006,0,21.774-9.764,21.774-21.776l-0.064-69.599c-0.005-5.767-4.682-10.439-10.448-10.439 c-0.003,0-0.006,0-0.009,0c-5.771,0.005-10.444,4.687-10.439,10.457l0.064,69.589c0,0.48-0.394,0.87-0.878,0.87H484.1V128.37 c0-5.77-4.679-10.448-10.448-10.448s-10.448,4.678-10.448,10.448v70.469h-6.197c-0.484,0-0.878-0.391-0.878-0.879l-0.063-69.599 c-0.005-5.767-4.682-10.439-10.448-10.439c-0.003,0-0.006,0-0.009,0c-5.77,0.005-10.444,4.687-10.439,10.457l0.063,69.589 c0,12.002,9.768,21.766,21.774,21.766h6.197v47.016h-6.4c-5.769,0-10.448,4.678-10.448,10.448v110.408 c0,14.89,12.186,27.004,27.165,27.004s27.165-12.115,27.165-27.004V277.199c0-5.771-4.679-10.448-10.448-10.448H484.1v-47.016 H490.226z M479.789,387.607c0,3.311-2.871,6.108-6.269,6.108s-6.269-2.797-6.269-6.108v-99.96h12.538V387.607z"></path> </g> </g> <g> <g> <path d="M12.832,97.665c-3.107-0.726-6.375,0.003-8.875,1.985C1.459,101.631,0,104.648,0,107.837v279.769 c0,14.89,12.186,27.004,27.165,27.004s27.165-12.115,27.165-27.004V148.585C54.33,116,27.186,101.028,12.832,97.665z M33.434,387.607c0,3.311-2.871,6.108-6.269,6.108s-6.269-2.797-6.269-6.108v-99.96h12.538V387.607z M33.434,266.751H20.896 V124.229c0.208,0.149,0.416,0.303,0.624,0.459c8.017,6.031,11.914,13.847,11.914,23.897V266.751z"></path> </g> </g> <g> <g> <path d="M346.02,224.405c-13.392-38.164-49.578-63.805-90.043-63.805c-5.769,0-10.448,4.678-10.448,10.448 s4.679,10.448,10.448,10.448c31.605,0,59.867,20.025,70.325,49.828c1.508,4.3,5.546,6.992,9.859,6.992 c1.148,0,2.315-0.191,3.459-0.592C345.065,235.812,347.93,229.851,346.02,224.405z"></path> </g> </g> <g> <g> <path d="M340.93,245.474c-5.769,0-10.448,4.678-10.448,10.448V256c0,5.77,4.679,10.408,10.448,10.408 c5.769,0,10.448-4.716,10.448-10.487C351.378,250.151,346.699,245.474,340.93,245.474z"></path> </g> </g> <g> <g> <path d="M255.976,122.265c-73.713,0-133.683,59.971-133.683,133.685c0,29.337,9.325,57.182,26.967,80.528 c17.061,22.577,41.312,39.462,68.282,47.546c5.526,1.657,11.351-1.48,13.008-7.009c1.657-5.527-1.482-11.351-7.009-13.008 c-47.311-14.179-80.353-58.614-80.353-108.057c0-62.192,50.597-112.789,112.787-112.789c62.192,0,112.789,50.597,112.789,112.789 c0,49.444-33.043,93.88-80.355,108.058c-5.528,1.656-8.666,7.48-7.01,13.008c1.357,4.527,5.508,7.451,10.004,7.451 c0.993,0,2.003-0.143,3.003-0.442c26.973-8.083,51.224-24.968,68.285-47.545c17.643-23.346,26.969-51.192,26.969-80.529 C389.661,182.236,329.69,122.265,255.976,122.265z"></path> </g> </g> <g> <g> <path d="M255.973,368.726c-5.769,0-10.448,4.678-10.448,10.448v0.113c0,5.77,4.679,10.448,10.448,10.448 s10.448-4.678,10.448-10.448v-0.113C266.421,373.404,261.743,368.726,255.973,368.726z"></path> </g> </g> </g></svg> Restro Manage</div>
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4 overflow-y-auto h-[calc(100vh-150px)]">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                      }
                      className="flex items-center gap-4 px-4 capitalize"
                      fullWidth
                    >
                      {icon}
                      <Typography
                        color="inherit"
                        className="font-medium capitalize"
                      >
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Restro Manage",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
