import React from "react";
import RMInput from "@/components/RMInput";
import { login, verifyTwoFactor } from "@/store/features/auth/AuthSlice";
import {
	Card,
	Input,
	Checkbox,
	Button,
	Typography,
	Spinner,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function SignIn() {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(false);
	const [loggingIn, setLoggingIn] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPaswword] = useState('');
	const [twoFactorCode, setTwoFactorCode] = useState(Array(6).fill(''));
	const [requires2FA, setRequires2FA] = useState(false);
	const userData = useSelector(state => state.auth);

	const dispatch = useDispatch();
	useEffect(() => {
		if (userData.user) {
			setIsLogin(true);
			navigate('/dashboard');
		}
	}, [userData, navigate]);


	useEffect(() => { 
		if (twoFactorCode.every((digit) => digit)) {
			document.getElementById('2fa-form').requestSubmit();
		}
	}, [twoFactorCode]);

	const handleLoginForm = async (e) => {
		e.preventDefault();
		setLoggingIn(true);
		try {
			const resultAction = await dispatch(login({ email, password }));
			if (resultAction.meta.requestStatus === 'fulfilled') {
				const { requires2FA, message } = resultAction.payload;
				if (requires2FA) {
                    toast.info(message || 'Two-factor authentication required');
                    setRequires2FA(true); 
					setLoggingIn(false)
                } else {
                    toast.success('Logged in successfully');
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                }
			} else {
				toast.error(resultAction.payload || 'Login failed');
				setLoggingIn(false);
			}
		} catch (error) {
			toast.error('Login failed');
			console.log(error);
			setLoggingIn(false);
		}
	};

	const handle2Fa = async (e) => {
		e.preventDefault();
		setLoggingIn(true);
		try {
			const code = twoFactorCode.join('');
			const resultAction = await dispatch(verifyTwoFactor({ email, code }));
			if (resultAction.meta.requestStatus === 'fulfilled') {
				toast.success('Logged in successfully');
				setTimeout(() => {
					navigate('/dashboard');
				}, 3000);
			} else {
				toast.error(resultAction.payload || 'Login failed');
				setLoggingIn(false);
			}
		} catch (error) {
			toast.error('Login failed');
			console.log(error);
			setLoggingIn(false);
		}
	};

	const handleInputChange = (index, value) => {
		if (!/^\d*$/.test(value)) return; // Only allow numbers
	
		const updatedCode = [...twoFactorCode];
		updatedCode[index] = value;
	 
		setTwoFactorCode(updatedCode);
	
		if (value && index < 5) { 
			document.getElementById(`input-${index + 1}`).focus();
		}
	};

	return (
		<section className="m-8 flex gap-4">
			<div className="w-full lg:w-3/5 mt-24">
				{!requires2FA ? (
					<>
						<div className="text-center">
							<Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
							<Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to Sign In.</Typography>
						</div>
						<form onSubmit={handleLoginForm} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
							<div className="mb-1 flex flex-col gap-6">
								<RMInput val={email} setVal={setEmail} label="Email Address" type="email"
								/>
								<RMInput val={password} setVal={setPaswword} label="Password" type="password"
								/>
							</div>

							<Button type="submit" className="mt-6 flex justify-center gap-4 items-center" fullWidth  disabled={!!loggingIn}>
								{loggingIn &&  <Spinner/> }
								Sign In
							</Button>

							<div className="flex items-center justify-between gap-2 mt-6">
								<Typography variant="small" className="font-medium text-gray-900">
									<Link to="/auth/forget-password" className="text-gray-900 ml-1">
										Forgot Password
									</Link>
								</Typography>
							</div>
							
							<Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
								Not registered?
								<Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
							</Typography>
						</form>
					</>
				) : (
					<>
						<div className="text-center">
							<Typography variant="h2" className="font-bold mb-4">Two-Factor Authentication</Typography>
							<Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter 6-digit code from your authenticator application</Typography>
						</div>
						<form id="2fa-form" onSubmit={handle2Fa} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
							<div className="mb-1 flex justify-between gap-2">
								{twoFactorCode.map((digit, index) => (
									<input
										key={index}
										id={`input-${index}`}
										type="text"
										maxLength="1"
										value={digit}
										onChange={(e) => handleInputChange(index, e.target.value)}
										className="w-16 h-24 text-center text-6xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
										disabled={loggingIn}
									/>
								))}
							</div>
							<Button type="submit" className="mt-6 flex justify-center gap-4 items-center" fullWidth  disabled={!!loggingIn}>
								{loggingIn && <Spinner/> }
								Submit
							</Button>
						</form>
					</>
				)}
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

export default SignIn;
