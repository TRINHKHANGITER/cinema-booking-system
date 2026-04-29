import React, { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import Close from "../components/icon/close";
import Eye from "../components/icon/eye";
import EyeFlash from "../components/icon/eyeFlash";
import { useAuthStore } from "../stores/slices/authSlice";

interface SigninProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type AuthStep = "signin" | "forgotPassword" | "resetPassword";

const signInSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z
    .object({
        email: z.string().email("Email không hợp lệ"),
        otp: z
            .string()
            .min(1, "Mã OTP không được để trống")
            .regex(/^\d{6}$/, "Mã OTP phải gồm đúng 6 chữ số"),
        newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
        confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

type SignInFormValues = z.infer<typeof signInSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const Signin: React.FC<SigninProps> = ({ open, setOpen }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<AuthStep>("signin");
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

    const { signIn, signInWithGoogle, requestPasswordResetOtp, resetPasswordByOtp } = useAuthStore();

    const {
        register: registerSignIn,
        handleSubmit: handleSubmitSignIn,
        reset: resetSignInForm,
        getValues: getSignInValues,
        formState: { errors: signInErrors, isSubmitting: isSignInSubmitting },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
    });

    const {
        register: registerForgot,
        handleSubmit: handleSubmitForgot,
        reset: resetForgotForm,
        setValue: setForgotValue,
        formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const {
        register: registerReset,
        handleSubmit: handleSubmitReset,
        reset: resetResetForm,
        formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const resetLocalState = () => {
        setStep("signin");
        setShowPassword(false);
        setShowResetPassword(false);
        setShowResetConfirmPassword(false);
    };

    const closeModal = () => {
        setOpen(false);
        resetSignInForm();
        resetForgotForm();
        resetResetForm();
        resetLocalState();
    };

    const onSubmitSignIn = async (data: SignInFormValues) => {
        const { email, password } = data;

        try {
            const response = await signIn(email, password);
            toast.success(response.message || "Đăng nhập thành công");
            resetSignInForm();
            closeModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
            toast.error(message);
        }
    };

    const onSubmitForgotPassword = async (data: ForgotPasswordFormValues) => {
        const normalizedEmail = data.email.trim().toLowerCase();

        try {
            await requestPasswordResetOtp(normalizedEmail);
            toast.success("Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.");
            resetResetForm({
                email: normalizedEmail,
                otp: "",
                newPassword: "",
                confirmPassword: "",
            });
            setStep("resetPassword");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gửi mã OTP thất bại";
            toast.error(message);
        }
    };

    const onSubmitResetPassword = async (data: ResetPasswordFormValues) => {
        const normalizedEmail = data.email.trim().toLowerCase();

        try {
            await resetPasswordByOtp(normalizedEmail, data.otp.trim(), data.newPassword);
            toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
            resetSignInForm({ email: normalizedEmail, password: "" });
            resetForgotForm({ email: normalizedEmail });
            resetResetForm({
                email: normalizedEmail,
                otp: "",
                newPassword: "",
                confirmPassword: "",
            });
            setStep("signin");
            setShowResetPassword(false);
            setShowResetConfirmPassword(false);
            navigate("/login");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại";
            toast.error(message);
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
            toast.success(response.message || "Đăng nhập Google thành công");
            resetSignInForm();
            closeModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đăng nhập Google thất bại";
            toast.error(message);
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    const goToForgotPasswordStep = () => {
        const currentEmail = getSignInValues("email")?.trim();
        if (currentEmail) {
            setForgotValue("email", currentEmail);
        }
        setStep("forgotPassword");
    };

    const titleMap: Record<AuthStep, string> = {
        signin: "Đăng nhập tài khoản",
        forgotPassword: "Quên mật khẩu",
        resetPassword: "Đặt lại mật khẩu",
    };

    return (
        <div
            className={`fixed inset-0 z-999 grid h-screen w-screen place-items-center bg-black/30 transition-opacity duration-300
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
                        <h5 className="text-lg font-bold not-italic py-2 capitalize">{titleMap[step]}</h5>
                    </div>

                    <div className="login-form">
                        {step === "signin" && (
                            <form action="" onSubmit={handleSubmitSignIn(onSubmitSignIn)}>
                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Email
                                </label>

                                <input
                                    type="text"
                                    placeholder="Nhập email"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerSignIn("email")}
                                />

                                {signInErrors.email && (
                                    <p className="text-red-400 text-sm">{signInErrors.email.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Mật khẩu
                                </label>

                                <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu"
                                        className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                        {...registerSignIn("password")}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="pr-2 cursor-pointer"
                                    >
                                        {showPassword ? <Eye /> : <EyeFlash />}
                                    </button>
                                </span>

                                {signInErrors.password && (
                                    <p className="text-red-400 text-sm">{signInErrors.password.message}</p>
                                )}

                                <button
                                    type="submit"
                                    className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] h-full px-5 py-2.5 uppercase mt-5"
                                    disabled={isSignInSubmitting || isGoogleSubmitting}
                                >
                                    <span className="block">Đăng nhập</span>
                                </button>

                                <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
                                    <span className="h-px flex-1 bg-gray-200" />
                                    <span>Hoặc</span>
                                    <span className="h-px flex-1 bg-gray-200" />
                                </div>

                                <div
                                    className={isGoogleSubmitting ? "pointer-events-none opacity-70" : ""}
                                >
                                    <GoogleLogin
                                        onSuccess={onGoogleSuccess}
                                        onError={() => {
                                            toast.error("Đăng nhập Google thất bại");
                                        }}
                                        text="signin_with"
                                        width="350"
                                    />
                                </div>

                                <div className="text-start mt-[14px] mb-4">
                                    <button
                                        type="button"
                                        onClick={goToForgotPasswordStep}
                                        className="inline cursor-pointer text-[14px] text-[#212529] font-light hover:text-[#f26b38] transition-all duration-300"
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === "forgotPassword" && (
                            <form action="" onSubmit={handleSubmitForgot(onSubmitForgotPassword)}>
                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập email đã đăng ký"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerForgot("email")}
                                />

                                {forgotErrors.email && (
                                    <p className="text-red-400 text-sm">{forgotErrors.email.message}</p>
                                )}

                                <button
                                    type="submit"
                                    className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] h-full px-5 py-2.5 uppercase mt-5"
                                    disabled={isForgotSubmitting}
                                >
                                    <span className="block">Gửi mã OTP</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("signin")}
                                    className="w-full mt-3 text-sm text-[#212529] font-light hover:text-[#f26b38] transition-all duration-300"
                                >
                                    Quay lại đăng nhập
                                </button>
                            </form>
                        )}

                        {step === "resetPassword" && (
                            <form action="" onSubmit={handleSubmitReset(onSubmitResetPassword)}>
                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập email"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerReset("email")}
                                />
                                {resetErrors.email && (
                                    <p className="text-red-400 text-sm">{resetErrors.email.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Mã OTP
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Nhập mã OTP gồm 6 chữ số"
                                    className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    {...registerReset("otp")}
                                />
                                {resetErrors.otp && (
                                    <p className="text-red-400 text-sm">{resetErrors.otp.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Mật khẩu mới
                                </label>
                                <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                    <input
                                        type={showResetPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                        {...registerReset("newPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                        className="pr-2 cursor-pointer"
                                    >
                                        {showResetPassword ? <Eye /> : <EyeFlash />}
                                    </button>
                                </span>
                                {resetErrors.newPassword && (
                                    <p className="text-red-400 text-sm">{resetErrors.newPassword.message}</p>
                                )}

                                <label className="text-xs block font-bold not-italic text-[#777777]">
                                    Nhập lại mật khẩu mới
                                </label>
                                <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                    <input
                                        type={showResetConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                        {...registerReset("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowResetConfirmPassword(!showResetConfirmPassword)
                                        }
                                        className="pr-2 cursor-pointer"
                                    >
                                        {showResetConfirmPassword ? <Eye /> : <EyeFlash />}
                                    </button>
                                </span>
                                {resetErrors.confirmPassword && (
                                    <p className="text-red-400 text-sm">{resetErrors.confirmPassword.message}</p>
                                )}

                                <button
                                    type="submit"
                                    className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] h-full px-5 py-2.5 uppercase mt-5"
                                    disabled={isResetSubmitting}
                                >
                                    <span className="block">Đặt lại mật khẩu</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("signin")}
                                    className="w-full mt-3 text-sm text-[#212529] font-light hover:text-[#f26b38] transition-all duration-300"
                                >
                                    Quay lại đăng nhập
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="log__footer text-[14px] pt-6 border-t-gray-300 border-t-3 text-center mt-3">
                        <span>Bạn chưa có tài khoản?</span>
                        <button
                            type="button"
                            className="cursor-pointer rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center border border-orange-20 text-[#f58020] hover:text-white w-auto px-6 py-[6px] font-light"
                        >
                            <span className="block">Đăng ký</span>
                        </button>
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

export default Signin;
