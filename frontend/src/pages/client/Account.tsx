import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import { routePath } from "../../route/route";
import { useAuthStore } from "../../stores/slices/authSlice";
import type { GioiTinh } from "../../types/user";

const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sexToLabel = (sex: GioiTinh | null | undefined) => {
    if (sex === "male") return "Nam";
    if (sex === "female") return "Nữ";
    if (sex === "other") return "Khác";
    return "Chưa cập nhật";
};

const AccountPage = () => {
    const navigate = useNavigate();
    const { user, accessToken, signOut, setUser, replaceSession } = useAuthStore();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [isRequestingEmailOtp, setIsRequestingEmailOtp] = useState(false);
    const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);

    const [passwordOtpSent, setPasswordOtpSent] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);

    const addressStorageKey = useMemo(() => {
        if (!user?.userId) return null;
        return `CINEMA_ACCOUNT_ADDRESS_${user.userId}`;
    }, [user?.userId]);

    const [profileForm, setProfileForm] = useState({
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        sex: "" as GioiTinh | "",
        address: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [emailForm, setEmailForm] = useState({
        newEmail: "",
        otp: "",
    });

    const resetEmailChangeForm = () => {
        setEmailForm({
            newEmail: "",
            otp: "",
        });
        setEmailOtpSent(false);
    };

    useEffect(() => {
        if (!user) return;
        const storedAddress = addressStorageKey ? localStorage.getItem(addressStorageKey) ?? "" : "";

        setProfileForm({
            fullName: user.fullName ?? "",
            phoneNumber: user.phoneNumber ?? "",
            dateOfBirth: user.dateOfBirth ?? "",
            sex: user.sex ?? "",
            address: storedAddress,
        });
    }, [user, addressStorageKey]);

    if (!accessToken || !user) {
        return (
            <div className="bg-[#f7f8fb] py-10">
                <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-800">Thông tin tài khoản</h1>
                    <p className="mt-3 text-slate-600">
                        Vui lòng đăng nhập để xem và cập nhật thông tin tài khoản của bạn.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(routePath.login)}
                        className="mt-6 rounded-lg bg-[#f58020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e17010]"
                    >
                        Đi đến trang đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    const submitProfile = async () => {
        const fullName = profileForm.fullName.trim();
        const phoneNumber = profileForm.phoneNumber.trim();

        if (!fullName) {
            toast.error("Họ và tên không được để trống.");
            return;
        }

        if (phoneNumber && !PHONE_PATTERN.test(phoneNumber)) {
            toast.error("Số điện thoại phải từ 10 đến 15 chữ số.");
            return;
        }

        setIsSavingProfile(true);
        try {
            const response = await userService.updateUserById(user.userId, {
                fullName,
                phoneNumber,
                dateOfBirth: profileForm.dateOfBirth || null,
                sex: profileForm.sex || null,
            });

            if (response.code !== "SUCCESS" || !response.result) {
                throw new Error(response.message || "Cập nhật thông tin thất bại.");
            }

            if (addressStorageKey) {
                localStorage.setItem(addressStorageKey, profileForm.address.trim());
            }

            await setUser(response.result);
            setIsEditingProfile(false);
            toast.success(response.message || "Cập nhật thông tin thành công.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Cập nhật thông tin thất bại.";
            toast.error(message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const sendPasswordOtp = async () => {
        setIsSendingPasswordOtp(true);
        try {
            const response = await authService.forgotPassword({ email: user.email });
            if (response.code !== "SUCCESS") {
                throw new Error(response.message || "Không thể gửi OTP.");
            }
            setPasswordOtpSent(true);
            toast.success(response.message || "Mã OTP đã được gửi tới email của bạn.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể gửi OTP.";
            toast.error(message);
        } finally {
            setIsSendingPasswordOtp(false);
        }
    };

    const submitPassword = async () => {
        const otp = passwordForm.otp.trim();
        const newPassword = passwordForm.newPassword;
        const confirmPassword = passwordForm.confirmPassword;

        if (!/^\d{6}$/.test(otp)) {
            toast.error("Mã OTP phải gồm đúng 6 chữ số.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsSubmittingPassword(true);
        try {
            const response = await authService.resetPassword({
                email: user.email,
                otp,
                newPassword,
            });

            if (response.code !== "SUCCESS") {
                throw new Error(response.message || "Đổi mật khẩu thất bại.");
            }

            setPasswordForm({
                otp: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordOtpSent(false);
            setIsChangingPassword(false);
            toast.success(response.message || "Đổi mật khẩu thành công.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Đổi mật khẩu thất bại.";
            toast.error(message);
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const requestEmailOtp = async () => {
        const newEmail = emailForm.newEmail.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(newEmail)) {
            toast.error("Email mới không hợp lệ.");
            return;
        }

        if (newEmail === user.email.toLowerCase()) {
            toast.error("Email mới phải khác email hiện tại.");
            return;
        }

        setIsRequestingEmailOtp(true);
        try {
            const response = await userService.requestChangeOwnEmail({ newEmail });
            if (response.code !== "SUCCESS") {
                throw new Error(response.message || "Không thể gửi OTP đổi email.");
            }

            setEmailForm((prev) => ({
                ...prev,
                newEmail,
                otp: "",
            }));
            setEmailOtpSent(true);
            toast.success(response.message || "Mã OTP đã được gửi đến email mới.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể gửi OTP đổi email.";
            toast.error(message);
        } finally {
            setIsRequestingEmailOtp(false);
        }
    };

    const confirmEmailChange = async () => {
        const newEmail = emailForm.newEmail.trim().toLowerCase();
        const otp = emailForm.otp.trim();

        if (!EMAIL_PATTERN.test(newEmail)) {
            toast.error("Email mới không hợp lệ.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            toast.error("Mã OTP phải gồm đúng 6 chữ số.");
            return;
        }

        setIsConfirmingEmail(true);
        try {
            const response = await userService.confirmChangeOwnEmail({
                newEmail,
                otp,
            });

            if (response.code !== "SUCCESS" || !response.result) {
                throw new Error(response.message || "Xác thực đổi email thất bại.");
            }

            await replaceSession(response.result);
            resetEmailChangeForm();
            setIsChangingEmail(false);
            toast.success(response.message || "Đổi email thành công.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Xác thực đổi email thất bại.";
            toast.error(message);
        } finally {
            setIsConfirmingEmail(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        toast.success("Đã đăng xuất.");
        navigate(routePath.home);
    };

    return (
        <div className="bg-[#f7f8fb] py-8">
            <div className="mx-auto w-full max-w-5xl px-4">
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#034ea2] to-[#0f6dd3] p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold md:text-3xl">Thông tin tài khoản</h1>
                    <p className="mt-2 text-sm text-blue-100 md:text-base">
                        Quản lý hồ sơ, đổi mật khẩu và đổi email của bạn.
                    </p>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Các thông tin hiển thị cho tài khoản khách hàng.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEditingProfile((prev) => !prev)}
                            className="rounded-lg border border-[#034ea2] px-4 py-2 text-sm font-semibold text-[#034ea2] transition hover:bg-[#034ea2] hover:text-white"
                        >
                            {isEditingProfile ? "Ẩn form chỉnh sửa" : "Chỉnh sửa thông tin"}
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-2">
                        <p>
                            <span className="font-semibold text-slate-500">Họ và tên:</span>{" "}
                            {user.fullName || "Chưa cập nhật"}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-500">Email:</span>{" "}
                            {user.email || "Chưa cập nhật"}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-500">Số điện thoại:</span>{" "}
                            {user.phoneNumber || "Chưa cập nhật"}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-500">Ngày sinh:</span>{" "}
                            {user.dateOfBirth || "Chưa cập nhật"}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-500">Giới tính:</span>{" "}
                            {sexToLabel(user.sex)}
                        </p>
                        <p>
                            <span className="font-semibold text-slate-500">Địa chỉ:</span>{" "}
                            {profileForm.address || "Chưa cập nhật"}
                        </p>
                    </div>

                    {isEditingProfile && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h3 className="mb-4 text-base font-semibold text-slate-800">
                                Cập nhật thông tin tài khoản
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Họ và tên
                                    </span>
                                    <input
                                        type="text"
                                        value={profileForm.fullName}
                                        onChange={(event) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                fullName: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Số điện thoại
                                    </span>
                                    <input
                                        type="text"
                                        value={profileForm.phoneNumber}
                                        onChange={(event) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                phoneNumber: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Ngày sinh
                                    </span>
                                    <input
                                        type="date"
                                        value={profileForm.dateOfBirth}
                                        onChange={(event) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                dateOfBirth: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Giới tính
                                    </span>
                                    <select
                                        value={profileForm.sex}
                                        onChange={(event) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                sex: event.target.value as GioiTinh | "",
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    >
                                        <option value="">Chưa chọn</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </label>
                                <label className="block text-sm md:col-span-2">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Địa chỉ
                                    </span>
                                    <input
                                        type="text"
                                        value={profileForm.address}
                                        onChange={(event) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                address: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={submitProfile}
                                disabled={isSavingProfile}
                                className="mt-4 rounded-lg bg-[#f58020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#de6f13] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSavingProfile ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                        </div>
                    )}
                </section>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Đổi mật khẩu</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Không cần nhập mật khẩu cũ, dùng OTP gửi về email hiện tại.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsChangingPassword((prev) => !prev)}
                            className="rounded-lg border border-[#034ea2] px-4 py-2 text-sm font-semibold text-[#034ea2] transition hover:bg-[#034ea2] hover:text-white"
                        >
                            {isChangingPassword ? "Ẩn form đổi mật khẩu" : "Mở form đổi mật khẩu"}
                        </button>
                    </div>

                    {isChangingPassword && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <button
                                type="button"
                                onClick={sendPasswordOtp}
                                disabled={isSendingPasswordOtp}
                                className="rounded-lg border border-[#f58020] px-4 py-2 text-sm font-semibold text-[#f58020] transition hover:bg-[#fff3e8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSendingPasswordOtp ? "Đang gửi OTP..." : "Gửi OTP đổi mật khẩu"}
                            </button>

                            {passwordOtpSent && (
                                <p className="mt-3 text-sm text-emerald-700">
                                    OTP đã được gửi, vui lòng kiểm tra email và nhập vào form bên dưới.
                                </p>
                            )}

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">Mã OTP</span>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={passwordForm.otp}
                                        onChange={(event) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                otp: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Mật khẩu mới
                                    </span>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(event) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                newPassword: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Xác nhận mật khẩu mới
                                    </span>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(event) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                confirmPassword: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={submitPassword}
                                disabled={isSubmittingPassword}
                                className="mt-4 rounded-lg bg-[#f58020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#de6f13] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmittingPassword ? "Đang đổi mật khẩu..." : "Xác nhận đổi mật khẩu"}
                            </button>
                        </div>
                    )}
                </section>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Đổi email</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Hệ thống sẽ gửi OTP về email mới để xác thực trước khi cập nhật.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setIsChangingEmail((prev) => {
                                    const next = !prev;
                                    if (!next) {
                                        resetEmailChangeForm();
                                    }
                                    return next;
                                })
                            }
                            className="rounded-lg border border-[#034ea2] px-4 py-2 text-sm font-semibold text-[#034ea2] transition hover:bg-[#034ea2] hover:text-white"
                        >
                            {isChangingEmail ? "Ẩn form đổi email" : "Mở form đổi email"}
                        </button>
                    </div>

                    {isChangingEmail && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            {emailOtpSent && (
                                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                    Mã OTP đã được gửi. Vui lòng nhập OTP để xác nhận đổi email.
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-slate-600">
                                        Email mới
                                    </span>
                                    <input
                                        type="email"
                                        value={emailForm.newEmail}
                                        readOnly={emailOtpSent}
                                        onChange={(event) =>
                                            setEmailForm((prev) => ({
                                                ...prev,
                                                newEmail: event.target.value,
                                            }))
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                    />
                                </label>
                                {emailOtpSent && (
                                    <label className="block text-sm">
                                        <span className="mb-1 block font-medium text-slate-600">Mã OTP</span>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={emailForm.otp}
                                            onChange={(event) =>
                                                setEmailForm((prev) => ({
                                                    ...prev,
                                                    otp: event.target.value,
                                                }))
                                            }
                                            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                {emailOtpSent && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmailOtpSent(false);
                                            setEmailForm((prev) => ({
                                                ...prev,
                                                otp: "",
                                            }));
                                        }}
                                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        Nhập email khác
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={requestEmailOtp}
                                    disabled={isRequestingEmailOtp}
                                    className="rounded-lg border border-[#f58020] px-4 py-2 text-sm font-semibold text-[#f58020] transition hover:bg-[#fff3e8] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isRequestingEmailOtp
                                        ? emailOtpSent
                                            ? "Đang gửi lại OTP..."
                                            : "Đang gửi OTP..."
                                        : emailOtpSent
                                          ? "Gửi lại OTP"
                                          : "Gửi OTP đến email mới"}
                                </button>
                                {emailOtpSent && (
                                    <button
                                        type="button"
                                        onClick={confirmEmailChange}
                                        disabled={isConfirmingEmail}
                                        className="rounded-lg bg-[#f58020] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#de6f13] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isConfirmingEmail ? "Đang xác thực..." : "Xác nhận đổi email"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
