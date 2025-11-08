import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff, Mail, Lock, User, IdCard, Shield, CheckCircle, XCircle } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    studentId: "",
    fullName: "",
    phone: ""
  });
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setOtp(value);
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    
    try {
      const response = await api.post("/auth/send-email-otp", {
        email: formData.email
      });

      if (response.data.success) {
        setShowOtpField(true);
        startCountdown(60);
        toast.success("OTP sent to your email");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    try {
      const response = await api.post("/auth/verify-email-otp", {
        email: formData.email,
        email_otp: otp
      });

      if (response.data.success) {
        setEmailVerified(true);
        setShowOtpField(false);
        toast.success("Email verified successfully!");
        
        // Clear OTP field after successful verification
        setOtp("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Email verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await api.post("/auth/send-email-otp", {
        email: formData.email
      });

      if (response.data.success) {
        startCountdown(60);
        toast.success("OTP resent to your email");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if email is verified
    if (!emailVerified) {
      toast.error("Please verify your email before registering");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        fullName: formData.fullName,
        phone: formData.phone
      });

      if (response.data.success) {
        toast.success("Registration successful! Redirecting to setup...");
        if (response.data.access_token) {
          localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        
        // Redirect to setup page after successful registration
        setTimeout(() => { 
          window.location.href = "/setup"; 
        }, 1500);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const VerificationBadge = ({ verified }) => (
    <div className={`flex items-center gap-2 text-sm ${
      verified ? 'text-green-600' : 'text-gray-500'
    }`}>
      {verified ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <span>{verified ? 'Verified' : 'Not Verified'}</span>
    </div>
  );

  const OTPInputSection = () => (
    <div className="space-y-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Label htmlFor="otp">Email OTP</Label>
      <div className="flex gap-2">
        <Input 
          id="otp" 
          type="text" 
          placeholder="Enter 6-digit OTP" 
          value={otp} 
          onChange={handleOtpChange}
          onKeyDown={(e) => {
            // Allow: backspace, delete, tab, escape, enter, numbers
            if (
              [46, 8, 9, 27, 13, 110].includes(e.keyCode) || 
              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
              (e.keyCode === 65 && e.ctrlKey === true) || 
              (e.keyCode === 67 && e.ctrlKey === true) || 
              (e.keyCode === 86 && e.ctrlKey === true) || 
              (e.keyCode === 88 && e.ctrlKey === true) ||
              // Allow: numbers on keypad and keyboard
              (e.keyCode >= 48 && e.keyCode <= 57) ||
              (e.keyCode >= 96 && e.keyCode <= 105)
            ) {
              return;
            }
            // Prevent default for other keys
            e.preventDefault();
          }}
          onPaste={(e) => {
            // Handle paste event
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const numbersOnly = pastedData.replace(/\D/g, '').slice(0, 6);
            setOtp(numbersOnly);
          }}
          maxLength={6}
          className="flex-1 text-center text-lg font-mono tracking-widest"
          autoComplete="one-time-code"
          inputMode="numeric"
          autoFocus={true}
        />
        <Button 
          type="button"
          onClick={handleVerifyOtp}
          disabled={!otp || otp.length !== 6 || verifying}
          size="sm"
          className="whitespace-nowrap min-w-20"
        >
          {verifying ? "Verifying..." : "Verify"}
        </Button>
      </div>
      <div className="text-center">
        <Button 
          type="button" 
          variant="link" 
          onClick={handleResendOtp}
          disabled={countdown > 0 || otpLoading}
          className="text-xs h-6"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
        </Button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student ID Field */}
      <div className="space-y-2">
        <Label htmlFor="studentId">Student ID</Label>
        <div className="relative">
          <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="studentId" 
            type="text" 
            placeholder="Enter your student ID" 
            value={formData.studentId} 
            onChange={handleChange} 
            className="pl-10" 
            required 
          />
        </div>
      </div>

      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="fullName" 
            type="text" 
            placeholder="Enter your full name" 
            value={formData.fullName} 
            onChange={handleChange} 
            className="pl-10" 
            required 
          />
        </div>
      </div>

      {/* Email Field with OTP Verification */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="email">College Email</Label>
          <VerificationBadge verified={emailVerified} />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              placeholder="22cp059@bvmengineering.ac.in" 
              value={formData.email} 
              onChange={handleChange} 
              className="pl-10" 
              required 
              disabled={emailVerified}
            />
          </div>
          {!emailVerified && (
            <Button 
              type="button"
              onClick={handleSendOtp}
              disabled={!formData.email || otpLoading || countdown > 0}
              size="sm"
              className="whitespace-nowrap"
            >
              {otpLoading ? (
                "Sending..."
              ) : countdown > 0 ? (
                `${countdown}s`
              ) : (
                "Send OTP"
              )}
            </Button>
          )}
        </div>

        {/* Email OTP Input Section */}
        {showOtpField && !emailVerified && (
          <OTPInputSection />
        )}
      </div>

      {/* Phone Number Field */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Input 
            id="phone" 
            type="tel" 
            placeholder="Enter your phone number" 
            value={formData.phone} 
            onChange={handleChange} 
            className="pl-3" 
            required 
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            value={formData.password} 
            onChange={handleChange} 
            className="pl-10 pr-10" 
            required 
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
            onClick={() => setShowPassword(!showPassword)} 
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Password must be at least 6 characters long
        </p>
      </div>

      {/* Verification Status Summary */}
      {emailVerified && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Verification Status</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Email:</span>
              <span className="text-green-600">✓ Verified</span>
            </div>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !emailVerified}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}