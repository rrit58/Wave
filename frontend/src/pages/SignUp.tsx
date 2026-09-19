import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { useState } from "react"
import { EyeOff, Eye } from "lucide-react"
import Background from "@/components/Background"
import { useAuth } from "@/contexts/AuthContext"

const Register = () => {
  const navigate = useNavigate()
  const { register, verifyEmail } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // OTP Verification flow
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState("")

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.confirmPassword
    )

    if (res.success) {
      setSuccessMessage(res.message || "OTP has been sent to your email.")
      setShowOTP(true)
      setLoading(false)
    } else {
      setError(res.message || "Registration failed.")
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await verifyEmail(formData.email, otp)
    if (res.success) {
      navigate("/chat")
    } else {
      setError(res.message || "OTP verification failed.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden p-4 sm:p-8">
      <Background />
      <Navbar />

      {/*  Register Card */}
      <section className="relative z-10 w-full max-w-fit rounded-3xl overflow-hidden border border-border bg-card text-card-foreground shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Error / Success Messages */}
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-xl animate-in fade-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {showOTP ? (
          <div>
            {/* Heading */}
            <div className="flex flex-col space-y-2 text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">Verify your Email</h2>
              <p className="text-sm text-muted-foreground font-medium">We've sent a 6-digit verification code to {formData.email}</p>
            </div>

            <form className="space-y-4" onSubmit={handleVerifyOTP}>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground transition-colors" htmlFor="otp">One-Time Password (OTP)</label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="h-11 px-4 text-base text-center tracking-widest font-mono bg-background border-border text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 text-[15px] font-semibold mt-2 shadow-lg transition-all active:scale-[0.98]">
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button type="button" variant="link" onClick={() => setShowOTP(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                Back to Register
              </Button>
            </form>
          </div>
        ) : (
          <div>
            {/* Heading */}
            <div className="flex flex-col space-y-2 text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">Create an account</h2>
              <p className="text-sm text-muted-foreground font-medium">Enter your details to register for Wave</p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-x-8">
                {/* Full Name */}
                <div className="flex-1">
                  <label className="text-sm font-medium leading-none text-foreground transition-colors" htmlFor="name">Full Name</label>
                  <Input
                    id="name"
                    name="fullName"
                    value={formData.fullName}
                    type="text"
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="h-11 px-4 text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                  />
                </div>

                {/* Email */}
                <div className="flex-1">
                  <label className="text-sm font-medium leading-none text-foreground transition-colors" htmlFor="email">Email</label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-11 px-4 text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-x-8">
                {/* Password */}
                <div className="flex-1">
                  <label className="text-sm font-medium leading-none text-foreground transition-colors" htmlFor="password">Password</label>
                  <div className="relative flex ">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
                      name="password"
                      value={formData.password}
                      placeholder="••••••••"
                      required
                      className="h-11 px-4 text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                    />
                    {showPassword ? (
                      <EyeOff className="absolute w-5 h-5 right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />
                    ) : (
                      <Eye className="absolute w-5 h-5 right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex-1">
                  <label className="text-sm font-medium leading-none text-foreground transition-colors" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative flex ">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={handleChange}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      placeholder="••••••••"
                      required
                      className="h-11 px-4 text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                    />
                    {showConfirmPassword ? (
                      <EyeOff className="absolute w-5 h-5 right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    ) : (
                      <Eye className="absolute w-5 h-5 right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full h-11 text-[15px] font-semibold mt-2 shadow-lg transition-all active:scale-[0.98]">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Or continue with */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google */}
            <Button type="button" variant="outline" className="h-12 w-full shadow-sm bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <svg className="w-5 h-5 mr-2 text-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-foreground hover:underline underline-offset-4 transition-colors cursor-pointer">
                Sign in
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Register
