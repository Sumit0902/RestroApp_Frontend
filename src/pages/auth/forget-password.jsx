import React, { useState } from "react";
import { Card, Input, Button, Typography, Spinner } from "@material-tailwind/react";
import { toast } from "react-toastify";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate(); // Use navigate for redirection

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/reset-password-request`, {
                email,
            });

            if (response.data.success) {
                // Redirect to login and show toast after redirection
                navigate("/auth/sign-in", { replace: true });
                toast.success("Please check your email for the reset password link.");
            } else {
                toast.error(response.data.message || "Failed to send reset password link.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="m-8 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        Forgot Password
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Enter your email address to receive a reset password link.
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
                    <Button
                        type="submit"
                        className="mt-6 flex justify-center gap-4 items-center"
                        fullWidth
                        disabled={submitting}
                    >
                        {submitting && <Spinner />}
                        Send Reset Link
                    </Button>
                </form> 
                 <div className="mt-4 text-center">
                    <Typography variant="small" color="gray" className="mb-2">
                        <Link to="/auth/sign-in" className="text-gray-700 hover:underline">
                            Already have an account? Sign in
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

export default ForgetPassword;