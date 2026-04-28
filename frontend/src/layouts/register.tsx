import React, { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
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

const registerSchema = z
    .object({
        fullName: z.string().min(1, "Họ và tên không được để trống"),
        phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số"),
        email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 kí tự"),
        confirmPassword: z.string(),
        birthDay: z.date().nullable(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu không khớp",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC<RegisterProps> = ({ open, setOpen }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const { signUp, signInWithGoogle } = useAuthStore();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            birthDay: null,
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        const { email, password, phone, birthDay, fullName } = data;
        const dateOfBirth = birthDay ? birthDay.toISOString().split("T")[0] : "";

        try {
            await signUp(fullName, password, email, phone, dateOfBirth);
            toast.success("Đăng ký thành công");
            reset();
            setOpen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đăng ký thất bại";
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
            toast.success(response.message || "Đăng ký/nhập bằng Google thành công");
            reset();
            setOpen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đăng ký Google thất bại";
            toast.error(message);
        } finally {
            setIsGoogleSubmitting(false);
        }
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
                            Đăng ký tài khoản
                        </h5>
                    </div>

                    <div className="register-form">
                        <form action="" onSubmit={handleSubmit(onSubmit)}>
                            <label className="text-xs block font-bold not-italic text-[#777777]">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                placeholder="Nhap Họ và tên"
                                className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                {...register("fullName")}
                            />
                            {errors.fullName && (
                                <p className="text-red-400 text-sm">{errors.fullName.message}</p>
                            )}

                            <label className="text-xs block font-bold not-italic text-[#777777]">
                                Email
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập Email"
                                className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm">{errors.email.message}</p>
                            )}

                            <label className="text-xs block font-bold not-italic text-[#777777]">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                placeholder="Nhap Số điện thoại"
                                className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                {...register("phone")}
                            />
                            {errors.phone && (
                                <p className="text-red-400 text-sm">{errors.phone.message}</p>
                            )}

                            <label className="text-xs block font-bold not-italic text-[#777777]">
                                Ngày sinh
                            </label>
                            <span className="w-full mb-1 relative h-auto border border-gray-200 rounded-sm inline-flex items-center min-w-0 text-sm bg-white transition-all duration-300">
                                <Controller
                                    name="birthDay"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            onChange={field.onChange}
                                            value={field.value}
                                            format="dd/MM/yyyy"
                                            className="bg-transparent w-full h-9 px-2 focus:outline-none border-none"
                                        />
                                    )}
                                />
                            </span>
                            {errors.birthDay && (
                                <p className="text-red-400 text-sm">{errors.birthDay.message}</p>
                            )}

                            <label className="text-xs block font-bold not-italic text-[#777777]">
                                Mật khẩu
                            </label>
                            <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhap Mật khẩu"
                                    className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="pr-2 cursor-pointer"
                                >
                                    {showPassword ? <Eye /> : <EyeFlash />}
                                </button>
                            </span>
                            {errors.password && (
                                <p className="text-red-400 text-sm">{errors.password.message}</p>
                            )}

                            <label className="text-xs block font-bold not-italic text-[#777777]">
                                Nhập lại mật khẩu
                            </label>
                            <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Nhap lai Mật khẩu"
                                    className="w-full h-9 px-2 text-sm bg-transparent outline-none border-none"
                                    {...register("confirmPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="pr-2 cursor-pointer"
                                >
                                    {showConfirmPassword ? <Eye /> : <EyeFlash />}
                                </button>
                            </span>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
                            )}

                            <button
                                type="submit"
                                className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] h-full px-5 py-2.5 uppercase mt-5"
                                disabled={isSubmitting || isGoogleSubmitting}
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
                    </div>
                </div>

                <button
                    className="closeButton"
                    onClick={() => {
                        setOpen(!open);
                        reset();
                    }}
                >
                    <span className="inline-flex bg-grey-100 rounded-full w-[24px] h-[24px] items-center justify-center hover:bg-gray-300">
                        <Close />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Register;

