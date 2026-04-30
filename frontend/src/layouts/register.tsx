import React, { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Close from "../components/icon/close";
import Eye from "../components/icon/eye";
import EyeFlash from "../components/icon/eyeFlash";
import { useAuthStore } from "../stores/slices/authSlice";

interface RegisterProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type RegisterStep = "register" | "verifyEmail";

const registerSchema = z
    .object({
        email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
        password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
        confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

const verifyEmailSchema = z.object({
    email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
    otp: z
        .string()
        .min(1, "Mã OTP không được để trống")
        .regex(/^\d{6}$/, "Mã OTP phải gồm đúng 6 chữ số"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

const Register: React.FC<RegisterProps> = ({ open, setOpen }) => {
    const [step, setStep] = useState<RegisterStep>("register");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const { signUp, verifyEmailOtp, resendVerifyEmailOtp, signInWithGoogle } = useAuthStore();

    const {
        register: registerRegister,
        handleSubmit: handleSubmitRegister,
        reset: resetRegisterForm,
        formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const {
        register: registerVerify,
        handleSubmit: handleSubmitVerify,
        reset: resetVerifyForm,
        getValues: getVerifyValues,
        formState: { errors: verifyErrors, isSubmitting: isVerifySubmitting },
    } = useForm<VerifyEmailFormValues>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            email: "",
            otp: "",
        },
    });

    const closeModal = () => {
        setOpen(false);
        setStep("register");
        setShowPassword(false);
        setShowConfirmPassword(false);
        resetRegisterForm();
        resetVerifyForm({
            email: "",
            otp: "",
        });
    };

    const onSubmitRegister = async (data: RegisterFormValues) => {
        const normalizedEmail = data.email.trim().toLowerCase();

        try {
            await signUp(normalizedEmail, data.password);
            toast.success("Đăng ký thành công. Vui lòng nhập mã OTP đã gửi về email.");
            resetVerifyForm({
                email: normalizedEmail,
                otp: "",
            });
            setStep("verifyEmail");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đăng ký thất bại";
            toast.error(message);
        }
    };

    const onSubmitVerifyEmail = async (data: VerifyEmailFormValues) => {
        const normalizedEmail = data.email.trim().toLowerCase();

        try {
            await verifyEmailOtp(normalizedEmail, data.otp.trim());
            toast.success("Xác thực email thành công. Bạn có thể đăng nhập ngay.");
            closeModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Xác thực email thất bại";
            toast.error(message);
        }
    };

    const onResendOtp = async () => {
        const normalizedEmail = getVerifyValues("email").trim().toLowerCase();
        if (!normalizedEmail) {
            toast.error("Vui lòng nhập email trước khi gửi lại OTP.");
            return;
        }

        try {
            setIsResendingOtp(true);
            await resendVerifyEmailOtp(normalizedEmail);
            toast.success("Mã OTP mới đã được gửi về email của bạn.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gửi lại OTP thất bại";
            toast.error(message);
        } finally {
            setIsResendingOtp(false);
        }
    };

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error("Không lấy được Google ID token");
            return;
        }

        try {
            setIsGoogleSubmitting(true);
            const response = await signInWithGoogle(credentialResponse.credential);
            toast.success(response.message || "Đăng ký/đăng nhập bằng Google thành công");
            closeModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đăng ký Google thất bại";
            toast.error(message);
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    const titleMap: Record<RegisterStep, string> = {
        register: "Đăng ký tài khoản",
        verifyEmail: "Xác thực email",
    };

    return (
        <div
            className={`fixed inset-0 z-999 grid h-screen w-screen place-items-center bg-black/60 backdrop-blur-sm transition-opacity duration-300
      ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
            <div className="relative max-w-100 min-w-50 rounded-sm px-6 py-10 m-0 bg-white shadow-sm">
                <div className="sm:w-[350px]">
                    <div className="text-center mb-4">
                        <img
                            src="/images/icon-login.svg"
                            alt="icon-login"
                            className="my-0 mx-auto object-cover duration-500 ease-in-out group-hover:opacity-100 scale-100 blur-0 grayscale-0"
                            width="190"
                            height="120"
                        />
                        <h5 className="text-lg font-bold not-italic py-2 capitalize">
                            {titleMap[step]}
                        </h5>
                    </div>

                    <div className="register-form">
                        {step === "register" && (
                            <form action="" onSubmit={handleSubmitRegister(onSubmitRegister)}>
                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập email"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerRegister("email")}
                                />
                                {registerErrors.email && (
                                    <p className="text-red-400 text-sm">{registerErrors.email.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Mật khẩu
                                </label>
                                <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu"
                                        className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                        {...registerRegister("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="pr-2 cursor-pointer"
                                    >
                                        {showPassword ? <Eye /> : <EyeFlash />}
                                    </button>
                                </span>
                                {registerErrors.password && (
                                    <p className="text-red-400 text-sm">{registerErrors.password.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Nhập lại mật khẩu
                                </label>
                                <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                        {...registerRegister("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="pr-2 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <Eye /> : <EyeFlash />}
                                    </button>
                                </span>
                                {registerErrors.confirmPassword && (
                                    <p className="text-red-400 text-sm">
                                        {registerErrors.confirmPassword.message}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] h-full px-5 py-2.5 uppercase mt-5"
                                    disabled={isRegisterSubmitting || isGoogleSubmitting}
                                >
                                    <span className="block">Đăng ký</span>
                                </button>

                                <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
                                    <span className="h-px flex-1 bg-gray-200" />
                                    <span>Hoặc</span>
                                    <span className="h-px flex-1 bg-gray-200" />
                                </div>

                                <div
                                    className={
                                        isGoogleSubmitting ? "pointer-events-none opacity-70" : ""
                                    }
                                >
                                    <GoogleLogin
                                        onSuccess={onGoogleSuccess}
                                        onError={() => {
                                            toast.error("Đăng ký Google thất bại");
                                        }}
                                        text="signup_with"
                                        width="350"
                                    />
                                </div>
                            </form>
                        )}

                        {step === "verifyEmail" && (
                            <form action="" onSubmit={handleSubmitVerify(onSubmitVerifyEmail)}>
                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập email đã đăng ký"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerVerify("email")}
                                />
                                {verifyErrors.email && (
                                    <p className="text-red-400 text-sm">{verifyErrors.email.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Mã OTP
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Nhập mã OTP gồm 6 chữ số"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerVerify("otp")}
                                />
                                {verifyErrors.otp && (
                                    <p className="text-red-400 text-sm">{verifyErrors.otp.message}</p>
                                )}

                                <button
                                    type="submit"
                                    className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] h-full px-5 py-2.5 uppercase mt-5"
                                    disabled={isVerifySubmitting || isResendingOtp}
                                >
                                    <span className="block">Xác thực email</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onResendOtp}
                                    className="w-full mt-3 text-sm text-[#212529] font-light hover:text-[#f26b38] transition-all duration-300"
                                    disabled={isVerifySubmitting || isResendingOtp}
                                >
                                    {isResendingOtp ? "Đang gửi lại OTP..." : "Gửi lại mã OTP"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("register")}
                                    className="w-full mt-2 text-sm text-[#212529] font-light hover:text-[#f26b38] transition-all duration-300"
                                    disabled={isVerifySubmitting || isResendingOtp}
                                >
                                    Quay lại đăng ký
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <button className="closeButton" onClick={closeModal}>
                    <span className="inline-flex bg-grey-100 rounded-full w-[24px] h-[24px] items-center justify-center hover:bg-gray-300">
                        <Close />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Register;
