import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function SignUp() {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    company_name: "",
    company_about: "",
    company_address1: "",
    company_address2: "",
    company_city: "",
    company_state: "",
    company_zip: "",
    phone: "",
    email: "",
    firstname: "",
    lastname: "",
    manager_email: "",
    password: "",
    manager_phone: "",
    role: "manager",
  });

  // State for errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const validateForm = () => {
    const newErrors = {};
 
    if (!formData.company_name.trim()) newErrors.company_name = "Company name is required.";
    if (!formData.company_address1.trim()) newErrors.company_address1 = "Address Line 1 is required.";
    if (!formData.company_city.trim()) newErrors.company_city = "City is required.";
    if (!formData.company_state.trim()) newErrors.company_state = "State is required.";
    if (!formData.company_zip.trim()) newErrors.company_zip = "ZIP Code is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required."; 
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required.";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required.";
    if (!formData.manager_email.trim()) newErrors.manager_email = "Manager email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({}); 

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register-company`, formData,  
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        navigate("/auth/sign-in");  
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);  
      } else {
        console.error("Signup error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Register Your Company
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your company and manager details to register.
          </Typography>
        </div>
        <form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
          onSubmit={handleSubmit}
        >
          <div className="mb-6">
            <Typography variant="h5" className="mb-4">
              Company Details
            </Typography>
            <div className="mb-4">
              <Input
                size="lg"
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                error={!!errors.company_name}
              />
              {errors.company_name && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.company_name}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="About Company"
                name="company_about"
                value={formData.company_about}
                onChange={handleInputChange}
                error={!!errors.company_about}
              />
              {errors.company_about && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.company_about}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Address Line 1"
                name="company_address1"
                value={formData.company_address1}
                onChange={handleInputChange}
                error={!!errors.company_address1}
              />
              {errors.company_address1 && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.company_address1}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Address Line 2"
                name="company_address2"
                value={formData.company_address2}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="City"
                name="company_city"
                value={formData.company_city}
                onChange={handleInputChange}
                error={!!errors.company_city}
              />
              {errors.company_city && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.company_city}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="State"
                name="company_state"
                value={formData.company_state}
                onChange={handleInputChange}
                error={!!errors.company_state}
              />
              {errors.company_state && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.company_state}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="ZIP Code"
                name="company_zip"
                value={formData.company_zip}
                onChange={handleInputChange}
                error={!!errors.company_zip}
              />
              {errors.company_zip && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.company_zip}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!errors.phone}
              />
              {errors.phone && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.phone}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
              />
              {errors.email && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.email}
                </Typography>
              )}
            </div>
          </div>

          <div className="mb-6">
            <Typography variant="h5" className="mb-4">
              Manager Details
            </Typography>
            <div className="mb-4">
              <Input
                size="lg"
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                error={!!errors.firstname}
              />
              {errors.firstname && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.firstname}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                error={!!errors.lastname}
              />
              {errors.lastname && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.lastname}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Email"
                name="manager_email"
                value={formData.manager_email}
                onChange={handleInputChange}
                error={!!errors.manager_email}
              />
              {errors.manager_email && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.manager_email}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
              />
              {errors.password && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.password}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                size="lg"
                label="Phone"
                name="manager_phone"
                value={formData.manager_phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree to the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          /> */}
          <Button className="mt-6 flex justify-center gap-4 items-center" fullWidth type="submit" disabled={!!isSubmitting}>
            {isSubmitting && <Spinner/> } Register Now 
          </Button>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
