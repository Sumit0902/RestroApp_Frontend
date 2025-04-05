import useAuthAxios from '@/lib/authAxios';
import { Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader, Spinner, Textarea, Typography } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function TaskList() {
    const axiosInstance = useAuthAxios();
    const userData = useSelector((state) => state.auth.user);
    const companyId = userData?.company?.id;
    const token = userData?.access_token;

    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('');
    const [status, setStatus] = useState('pending');

    const fetchTasks = async () => {
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(response.data.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/employees`);
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleAddTask = async () => {
        setFormSubmitting(true);
        try {
            await axiosInstance.post(
                `/companies/${companyId}/tasks/add`,
                { name: title, description, user_id: assignee, status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Task added successfully');
            fetchTasks();
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Failed to add task');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axiosInstance.delete(`/companies/${companyId}/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchTasks();
    }, []);

    return (
        <Card className="h-full w-full mt-4">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="flex justify-between gap-8 items-center mb-8">
                    <Typography variant="h5" color="blue-gray">
                        Task List
                    </Typography>
                    <Button onClick={() => setIsOpen(true)}>Add Task</Button>
                </div>
            </CardHeader>
            <CardBody>
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="p-4 text-left">Title</th>
                                <th className="p-4 text-left">Description</th>
                                <th className="p-4 text-left">Assignee</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td className="p-4">{task.name}</td>
                                        <td className="p-4">{task.description}</td>
                                        <td className="p-4">{task.user ? `${task.user?.firstname} ${task.user?.lastname}` : 'Unassigned'}</td>
                                        <td className="p-4 capitalize">{task.status}</td>
                                        <td className="p-4">
                                            <Button
                                                color="red"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center">
                                        No tasks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </CardBody>

            <Dialog open={isOpen} handler={() => setIsOpen(!isOpen)}>
                <DialogHeader>Add New Task</DialogHeader>
                <DialogBody>
                    <div className="flex flex-col gap-4">
                        <label>
                            <Typography>Title</Typography>
                            <input
                                type="text"
                                className="border p-2 rounded w-full"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </label>
                        <label>
                            <Typography>Description</Typography>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </label>
                        <label>
                            <Typography>Assignee</Typography>
                            <select
                                className="border p-2 rounded w-full"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            >
                                <option value="">Select Assignee</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.firstname} {employee.lastname} {employee.id == userData.id ? '(You)' : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <Typography>Status</Typography>
                            <select
                                className="border p-2 rounded w-full"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </label>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        onClick={handleAddTask}
                        disabled={formSubmitting}
                        className="mr-2"
                    >
                        {formSubmitting ? <Spinner /> : 'Add'}
                    </Button>
                    <Button color="red" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
}
