import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { ScrollArea } from "@radix-ui/themes";
import useAuthAxios from "@/lib/authAxios.js";

export default function NotificationMenu({ companyId = 1, employeeId = 1 }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotif, setunreadNotif] = useState(false);
    const fetching = useRef(false);
    const axiosInstance = useAuthAxios();

    const userData = useSelector((state) => state.auth.user);
    // let company_id = userData.company.id;
    // let employeeId = userData.id;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!fetching.current) {
                fetching.current = true;

                let userType = userData.role == "manager" ? "mgr_notificataions" : "emp_notificataions";
                try {
                    let response = await axiosInstance.get(`/companies/${companyId}/${userType}/${employeeId}`);
                    if (!response.error) {
                        setNotifications(response.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching notifications:", error);
                } finally {
                    fetching.current = false;
                }
            }
        };

        fetchNotifications();
        const interval = setInterval(() => {
            if (!fetching.current) {
                fetchNotifications();
            }
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (notifId) => {
        try {
            await axiosInstance.post(`/companies/notification/${notifId}/mark_read`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) =>
                    notif.id === notifId ? { ...notif, is_read: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    useEffect(() => {
      if(notifications.length > 0) {
        notifications.map((notification) => {
            if(notification.is_read) {
                setunreadNotif(true)
            }
        })
      }
    }, [notifications])
    

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="primary" className="bg-accent relative h-auto w-full justify-start px-2 py-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="notif-icon relative flex items-center justify-start">
                        <div className="bell-icon w-8 h-8 flex justify-center items-center">
                            <svg fill="#000000" width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fillRule="evenodd"
                                    d="M10.1353075,2.27592318 C10.2402118,2.0052531 10.405725,1.75363521 10.6305147,1.54243008 C11.4002733,0.819189975 12.5997267,0.819189975 13.3694853,1.54243008 C13.5947695,1.75409979 13.7605161,2.00636024 13.8653839,2.27770959 C16.7616088,3.1234978 19,5.9408248 19,10 C19,12.6246407 19.5316915,14.1023939 20.5153799,15.1769385 C20.7591805,15.4432571 21.6159553,16.2145106 21.7120353,16.3119441 L22,16.6039656 L22,20.0140878 L15.8743256,20.0140878 C15.6241439,20.9988638 15.0074832,21.861375 14.0878016,22.4226016 C12.8058555,23.2048965 11.1941445,23.2048965 9.91219841,22.4226016 C8.87009269,21.7866669 8.29383594,21.076125 8.08797645,20.0140878 L2,20.0140878 L2,16.6039656 L2.2879647,16.3119441 C2.39205094,16.2070827 3.24384208,15.442761 3.48595854,15.1793313 C4.46898326,14.1097716 5,12.6338939 5,10 C5,5.92919283 7.23535296,3.11802713 10.1353075,2.27592318 Z M10.1786171,20.0140878 C10.3199018,20.276911 10.5607105,20.4753661 10.9540156,20.7153766 C11.596268,21.1073049 12.403732,21.1073049 13.0459844,20.7153766 C13.3433933,20.5338858 13.5757865,20.2937382 13.7367218,20.0140878 L10.1786171,20.0140878 Z M20,17.4519264 C19.701613,17.1774463 19.2506046,16.7572744 19.0401756,16.5274096 C17.7059972,15.0700027 17,13.1077943 17,10 C17,6.23128941 14.6597092,4.01238167 12,4.01238167 C9.33276935,4.01238167 7,6.21989471 7,10 C7,13.1178011 6.29422173,15.0794011 4.95848591,16.5327208 C4.74843403,16.7612633 4.29607181,17.181102 4,17.45237 L4,18.0140878 L20,18.0140878 L20,17.4519264 Z"
                                />
                            </svg>
                        </div>
                        <div id="notif_dot" className={notifications.length > 0 ? "" : "hidden"}>
                            <div className="new-notif w-2 h-2 bg-red-600 rounded-full absolute right-2 top-1"></div>
                            <div className="new-notif w-2 h-2 bg-red-600 rounded-full absolute animate-ping right-2 top-1"></div>
                        </div>
                    </div>
                    <div className="text-sm font-medium">Notifications</div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-64 overflow-y-auto" align="end" alignOffset={11} sideOffset={-5} forceMount>
                <ScrollArea className="p-2">
                    {notifications.length === 0 ? (
                        <DropdownMenuItem className="text-center">No notifications</DropdownMenuItem>
                    ) : (
                        notifications.map((notification, index) => (
                            <DropdownMenuItem key={index} className="flex items-center justify-between" onClick={() => markAsRead(notification.id)} >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{notification.message}</span>
                                </div>
                                {!notification.is_read && <span className="dot bg-red-500 h-2 w-2 rounded-full"></span>}
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
