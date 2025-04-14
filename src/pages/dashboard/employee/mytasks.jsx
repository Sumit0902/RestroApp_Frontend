import useAuthAxios from '@/lib/authAxios';
import { Card, CardBody, CardHeader, Spinner, Typography, Select, Option } from '@material-tailwind/react';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function MyTasks() {
    const axiosInstance = useAuthAxios();
    const userData = useSelector((state) => state.auth.user);
    const companyId = userData?.company?.id;
    const employeeId = userData?.id; // Use employee ID for fetching tasks
    const token = userData?.access_token;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState(null); // Track the task being updated

    // Fetch tasks assigned to the employee
    const fetchTasks = async () => {
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/tasks/${employeeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(response.data.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    // Update task status
    const updateTaskStatus = async (taskId, newStatus) => {
        setUpdatingTaskId(taskId); // Set the task being updated
        try {
            await axiosInstance.put(`/companies/${companyId}/tasks/${taskId}/update`, {
                status: newStatus,
            });
            toast.success('Task status updated successfully');
            // Update the task status locally
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            );
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
        } finally {
            setUpdatingTaskId(null); // Clear the updating task ID
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <Card className="h-full w-full mt-4">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="flex justify-between gap-8 items-center mb-8">
                    <Typography variant="h5" color="blue-gray">
                        My Tasks
                    </Typography>
                </div>
            </CardHeader>
            <CardBody>
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="w-[20%] px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-left">Title</th>
                                <th className="w-[30%] px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-left">Description</th>
                                <th className="w-[20%] px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-center">Status</th>
                                <th className="w-[10%] px-2 py-4 whitespace-nowrap border-b border-gray-200 col-span-8 text-right">Assigned Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="text-center">
                                    <td className="p-4 col-span-4" colSpan={4}>
                                        <div className='flex items-center justify-center gap-2'><Spinner className="h-8 w-8" /> Loading</div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td className="p-4 w-[20%]">{task.name}</td>
                                            <td className="p-4  w-[60%]">{task.description}</td>
                                            <td className="p-4 w-[5%]">
                                                {updatingTaskId === task.id ? (
                                                    <Spinner className="h-6 w-6" />
                                                ) : (
                                                    <Select
                                                        value={task.status}
                                                        onChange={(value) => updateTaskStatus(task.id, value)}
                                                    >
                                                        <Option value="pending">Pending</Option>
                                                        <Option value="in-progress">In Progress</Option>
                                                        <Option value="completed">Completed</Option>
                                                    </Select>
                                                )}
                                            </td>
                                            <td className="p-4 capitalize text-right  w-[15%]">
                                                {format(new Date(task.created_at), 'dd-MM-yyyy')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No tasks found.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
            </CardBody>
        </Card>
    );
}