import useAuthAxios from '@/lib/authAxios';
import { Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader, Spinner, Textarea, Typography } from '@material-tailwind/react';
import { format } from 'date-fns';
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

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
            );
            toast.success('Task added successfully');
            fetchTasks();
            setIsOpen(false);

            setIsOpen(false);
          

        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Failed to add task');
        } finally {
            setFormSubmitting(false);
            setTitle("");
            setDescription("");
            setAssignee("");
            setStatus('pending');
        }
    };

    const handleDeleteTask = async () => {
        try {
            await axiosInstance.delete(`/companies/${companyId}/tasks/${taskToDelete.id}/delete`);
            toast.success('Task deleted successfully');
            fetchTasks();
            handleCloseDeleteDialog();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    const handleOpenEditDialog = (task) => {
        setCurrentTask(task);
        setTitle(task.name);
        setDescription(task.description);
        setAssignee(task.user_id || '');
        setStatus(task.status);
        setIsEditOpen(true);
    };

    const handleCloseEditDialog = () => {
        setCurrentTask(null);
        setTitle('');
        setDescription('');
        setAssignee('');
        setStatus('pending');
        setIsEditOpen(false);
    };

    const handleEditTask = async () => {
        setFormSubmitting(true);
        try {
            await axiosInstance.put(
                `/companies/${companyId}/tasks/${currentTask.id}/update`,
                { name: title, description, user_id: assignee, status }
            );
            toast.success('Task updated successfully');
            fetchTasks();
            handleCloseEditDialog();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (task) => {
        setTaskToDelete(task);
        setIsDeleteOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setTaskToDelete(null);
        setIsDeleteOpen(false);
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
                                <th className="w-[20%] p-4 text-left">Title</th>
                                <th className="w-[30%] p-4 text-left">Description</th>
                                <th className="w-[10%] p-4 text-left">Assignee</th>
                                <th className="w-[10%] p-4 text-left">Status</th>
                                <th className="w-[10%] p-4 text-left">Assigned Date</th>
                                <th className="w-[20%] p-4 text-left">Action</th>
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
                                        <td className="p-4 capitalize">{format(task.created_at, 'dd-MM-yyy')}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    color="gray"
                                                    onClick={() => handleOpenEditDialog(task)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="red"
                                                    onClick={() => handleOpenDeleteDialog(task)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center">
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
                        {/* <label>
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
                        </label> */}
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

            <Dialog open={isEditOpen} handler={() => setIsEditOpen(!isEditOpen)}>
                <DialogHeader>Edit Task</DialogHeader>
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
                        {/* <label>
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
                        </label> */}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        onClick={handleEditTask}
                        disabled={formSubmitting}
                        className="mr-2"
                    >
                        {formSubmitting ? <Spinner /> : 'Save'}
                    </Button>
                    <Button color="red" onClick={handleCloseEditDialog}>
                        Cancel
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} handler={handleCloseDeleteDialog}>
                <DialogHeader>Confirm Delete</DialogHeader>
                <DialogBody>
                    <Typography>
                        Are you sure you want to delete the task{' '}
                        <span className="font-bold">{taskToDelete?.name}</span>?
                    </Typography>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="outlined"
                        color="red"
                        onClick={handleCloseDeleteDialog}
                        className="mr-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        color="gray"
                        onClick={handleDeleteTask}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
}
