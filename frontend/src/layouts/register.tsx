import React, { useState } from "react";
import Eye from "../components/icon/eye";
import { z } from "zod"; // validate dữ liệu
import { Controller, useForm } from "react-hook-form"; // quản lí trạng thái và sự kiện của form
import { zodResolver } from "@hookform/resolvers/zod"; //giúp kết nối zod với hookform
import Close from "../components/icon/close";
import EyeFlash from "../components/icon/eyeFlash";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { useAuthStore } from "../stores/auth"


interface RegisterProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const RegisterSchema = z
  .object({
    fullName: z.string().min(1, "Họ và tên không được để trống"),
    phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số"),
    email: z
      .string()
      .min(1, "Email không được để trống")
      .pipe(z.email("Email không hợp lệ")),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 kí tự"),
    confirmPassword: z.string(),
    birthDay: z
      .date()
      .nullable()
      .refine((date) => date !== undefined, {
        message: "Vui lòng chọn ngày sinh",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });
type RegisterFormValues = z.infer<typeof RegisterSchema>;

const Register: React.FC<RegisterProps> = ({ open, setOpen }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {signUp} = useAuthStore()
  // const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema), // để kết nối useForm với zod đã định nghĩa
    defaultValues: {
      birthDay: null,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data: RegisterFormValues) => {
    const { email, password, phone, birthDay, fullName } = data;
    const dateOfBirth = birthDay ? birthDay.toISOString().split("T")[0] : "";
    await signUp(fullName, password, email, phone, dateOfBirth);
    reset();
    setOpen(false);  
  };
  return (
    <div
      className={`fixed inset-0 z-999 grid h-screen w-screen place-items-center bg-black/60 backdrop-blur-sm transition-opacity duration-300
      ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div className="relative max-w-100 min-w-50 rounded-sm px-6 py-10 m-0 bg-white shadow-sm">
        <div className="sm:w-[350px]">
          <div className=" text-center mb-4 ">
            <img
              src="/images/icon-login.svg"
              alt="icon-login"
              className="my-0 mx-auto object-cover duration-500 ease-in-out group-hover:opacity-100 scale-100 blur-0 grayscale-0"
              width="190"
              height="120"
            />
            <h5 className="text-lg font-bold not-italic py-2 capitalize">
              Đăng kí tài khoản
            </h5>
          </div>

          {/* form */}
          <div className="register-form">
            <form action="" onSubmit={handleSubmit(onSubmit)}>
              {/* họ và tên */}
              <label className="text-xs block font-bold not-italic text-[#777777]">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nhập Họ và tên"
                className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded 
  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm">
                  {errors.fullName.message}
                </p>
              )}
              {/* email */}
              <label className="text-xs block font-bold not-italic text-[#777777]">
                Email
              </label>
              <input
                type="text"
                placeholder="Nhập Email"
                className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded 
  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
              {/* phone */}
              <label className="text-xs block font-bold not-italic text-[#777777]">
                Số điện thoại
              </label>
              <input
                type="text"
                placeholder="Nhập Số điện thoại"
                className="w-full mb-1 h-9 px-2 text-sm bg-white border border-gray-200 rounded 
  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-red-400 text-sm">{errors.phone.message}</p>
              )}
              {/* Ngày sinh */}
              <label className="text-xs block font-bold not-italic text-[#777777]">
                Ngày sinh
              </label>
              {/* DatePicker */}
              <span className="w-full mb-1 relative h-auto border  border-gray-200 rounded-sm inline-flex items-center min-w-0 text-sm bg-white transition-all duration-300">
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
              {/*  */}
              {/* password */}
              <label className="text-xs block font-bold not-italic text-[#777777]">
                Mật khẩu
              </label>
              <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập Mật khẩu"
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
                <p className="text-red-400 text-sm">
                  {errors.password.message}
                </p>
              )}

              {/* confirm password */}
              <label className="text-xs block font-bold not-italic text-[#777777]">
                Nhập lại mật khẩu
              </label>
              <span className="w-full mb-1 relative border border-gray-200 rounded-sm flex items-center bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại Mật khẩu"
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
              {errors.confirmPassword  && (
                <p className="text-red-400 text-sm">
                  {errors.confirmPassword .message}
                </p>
              )}
              {/*  */}

              {/* submit */}
              <button
                type="submit"
                className="rounded-md hover:bg-[#e38601] transition-all duration-30 min-w-[135px] w-full focus:outline-none focus:ring-[#e38601] text-sm text-center inline-flex items-center dark:hover:bg-[#e38601] dark:focus:ring-[#e38601] justify-center text-white bg-[#F58020] w-full h-full px-5 py-2.5 uppercase mt-5 false"
                disabled={isSubmitting}
              >
                <span className="block">Đăng ký</span>{" "}
              </button>
              {/*  */}
            </form>
          </div>
        </div>
        {/* button close */}
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
