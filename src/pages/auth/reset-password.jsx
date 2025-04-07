import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Card,
    Input,
    Button,
    Typography,
    Spinner,
} from "@material-tailwind/react";

export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // Get the token from the URL
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/reset-password`, {
                token,
                email,
                password,
                password_confirmation: confirmPassword,
            });
            if (response.data.success) {
                toast.success("Password reset successfully. Redirecting to sign-in...");
                navigate("/auth/sign-in", { replace: true });
            } else {
                toast.error(response.data.message || "Failed to reset password.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="m-8 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        Reset Password
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Enter your new password below.
                    </Typography>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                    <div className="mb-4">
                        <Input
                            type="email"
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            type="password"
                            label="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            type="password"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="mt-6 flex justify-center gap-4 items-center"
                        fullWidth
                        disabled={submitting}
                    >
                        {submitting && <Spinner />}
                        Reset Password
                    </Button>
                </form>
                <div className="mt-4 text-center">
                    <Typography variant="small" color="gray" className="mb-2">
                        <Link to="/auth/sign-in" className="text-gray-700 hover:underline">
                            Already have an account? Sign in
                        </Link>
                    </Typography>
                    <Typography variant="small" color="gray">
                        <Link to="/auth/forget-password" className="text-gray-700 hover:underline">
                            Request Reset Password
                        </Link>
                    </Typography>
                </div>
            </div>
            <div className="w-2/5 h-full hidden lg:block">
                <img
                    src="/img/pattern.png"
                    className="h-full w-full object-cover rounded-3xl"
                />
            </div>
        </section>
    );
}

export default ResetPassword;
