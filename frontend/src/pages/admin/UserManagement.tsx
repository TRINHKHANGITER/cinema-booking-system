import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { userService } from "../../services/user.service";
import type {
    AdminUserCreationRequest,
    AdminUserUpdateRequest,
    Role,
    UserResponse,
    UserStatus,
} from "../../types/user";

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const defaultRoles: Role[] = ["USER", "STAFF", "ADMIN"];
const defaultStatuses: UserStatus[] = ["ACTIVE", "LOCKED", "SUSPENDED", "DELETED"];

const createUserSchema = z.object({
    fullName: z.string().trim().min(1, "Họ và tên là bắt buộc"),
    email: z.email("Email không hợp lệ"),
    phoneNumber: z
        .string()
        .trim()
        .regex(PHONE_REGEX, "Số điện thoại phải từ 10 đến 15 chữ số"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    role: z.string().trim().min(1, "Vai trò là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
    dateOfBirth: z.string().optional(),
    sex: z.string().optional(),
});

const updateUserSchema = z.object({
    fullName: z.string().trim().min(1, "Họ và tên là bắt buộc"),
    email: z.email("Email không hợp lệ"),
    phoneNumber: z
        .string()
        .trim()
        .regex(PHONE_REGEX, "Số điện thoại phải từ 10 đến 15 chữ số"),
    password: z.union([z.string().length(0), z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")]),
    role: z.string().trim().min(1, "Vai trò là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
    dateOfBirth: z.string().optional(),
    sex: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

type ModalShellProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
};

const emptyCreateValues: CreateUserFormValues = {
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "USER",
    status: "ACTIVE",
    dateOfBirth: "",
    sex: "",
};

const parseApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { message?: string } | undefined;
        return payload?.message || fallback;
    }
    return fallback;
};

const normalizeOptionalField = (value?: string) => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
};

const ModalShell = ({ open, title, onClose, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div className="relative w-full max-w-[560px] rounded-md bg-white px-6 py-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-slate-100"
                    >
                        <Close />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [roles, setRoles] = useState<Role[]>(defaultRoles);
    const [statuses, setStatuses] = useState<UserStatus[]>(defaultStatuses);

    const [nameInput, setNameInput] = useState("");
    const [roleInput, setRoleInput] = useState<Role | "">("");
    const [statusInput, setStatusInput] = useState<UserStatus | "">("");

    const [filters, setFilters] = useState({
        name: "",
        role: "" as Role | "",
        status: "" as UserStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

    const createForm = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: emptyCreateValues,
    });

    const editForm = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            ...emptyCreateValues,
            password: "",
        },
    });

    const fetchMeta = useCallback(async () => {
        try {
            const [roleResponse, statusResponse] = await Promise.all([
                userService.getAllRoles(),
                userService.getAllUserStatuses(),
            ]);

            const nextRoles = roleResponse.result?.items ?? defaultRoles;
            const nextStatuses = statusResponse.result?.items ?? defaultStatuses;

            setRoles(nextRoles.length > 0 ? nextRoles : defaultRoles);
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setRoles(defaultRoles);
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await userService.filterUsers({
                name: filters.name,
                role: filters.role,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setUsers([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setUsers(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Không thể tải danh sách người dùng"));
            setUsers([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchMeta();
    }, [fetchMeta]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const visiblePages = useMemo(() => {
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, filters.page - 2);
        const end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        const pages: number[] = [];
        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }
        return pages;
    }, [filters.page, totalPages]);

    const applyFilters = () => {
        setFilters((prev) => ({
            ...prev,
            name: nameInput.trim(),
            role: roleInput,
            status: statusInput,
            page: 1,
        }));
    };

    const openCreateModal = () => {
        createForm.reset(emptyCreateValues);
        setOpenCreate(true);
    };

    const openEditModal = (user: UserResponse) => {
        setEditingUser(user);
        editForm.reset({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: "",
            role: user.role,
            status: user.status,
            dateOfBirth: user.dateOfBirth ?? "",
            sex: user.sex ?? "",
        });
        setOpenEdit(true);
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload: AdminUserCreationRequest = {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phoneNumber: values.phoneNumber.trim(),
            password: values.password,
            role: values.role as Role,
            status: values.status as UserStatus,
            dateOfBirth: normalizeOptionalField(values.dateOfBirth),
            sex: normalizeOptionalField(values.sex) as "male" | "female" | "other" | null,
        };

        try {
            const response = await userService.createUserByAdmin(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Tạo người dùng thất bại");
                return;
            }

            toast.success("Tạo người dùng thành công");
            setOpenCreate(false);
            void fetchUsers();
        } catch (error) {
            toast.error(parseApiError(error, "Tạo người dùng thất bại"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingUser) return;

        const payload: AdminUserUpdateRequest = {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phoneNumber: values.phoneNumber.trim(),
            role: values.role as Role,
            status: values.status as UserStatus,
            dateOfBirth: normalizeOptionalField(values.dateOfBirth),
            sex: normalizeOptionalField(values.sex) as "male" | "female" | "other" | null,
        };

        const normalizedPassword = normalizeOptionalField(values.password);
        if (normalizedPassword) {
            payload.password = normalizedPassword;
        }

        try {
            const response = await userService.updateUserByAdmin(editingUser.userId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Cập nhật người dùng thất bại");
                return;
            }

            toast.success("Cập nhật người dùng thành công");
            setOpenEdit(false);
            setEditingUser(null);
            void fetchUsers();
        } catch (error) {
            toast.error(parseApiError(error, "Cập nhật người dùng thất bại"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const response = await userService.deleteUserByAdmin(deleteTarget.userId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Xóa người dùng thất bại");
                return;
            }

            toast.success("Xóa người dùng thành công");
            setDeleteTarget(null);
            void fetchUsers();
        } catch (error) {
            toast.error(parseApiError(error, "Xóa người dùng thất bại"));
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Quản trị người dùng
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Manage user accounts by role, status and contact information.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Thêm người dùng
                    </button>
                </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
    <input
        value={nameInput}
        onChange={(event) => setNameInput(event.target.value)}
        onKeyDown={(event) => {
            if (event.key === "Enter") {
                applyFilters();
            }
                        }}
                        type="text"
                        placeholder="Tìm theo tên / email / số điện thoại..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

    <select
        value={roleInput}
        onChange={(event) => setRoleInput(event.target.value as Role | "")}
        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
    >
        <option value="">Tất cả vai trò</option>
        {roles.map((role) => (
            <option key={role} value={role}>
                {role}
            </option>
        ))}
    </select>

    <select
        value={statusInput}
        onChange={(event) =>
            setStatusInput(event.target.value as UserStatus | "")
        }
        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
    >
        <option value="">Tất cả trạng thái</option>
        {statuses.map((status) => (
            <option key={status} value={status}>
                {status}
            </option>
        ))}
    </select>

    <button
        type="button"
        onClick={applyFilters}
        className="h-11 rounded-xl border border-[var(--glx-blue)] bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-blue-strong)]"
    >
        Áp dụng
    </button>
</div>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Danh sách người dùng</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>Tổng: {totalItems}</span>
                        <label className="flex items-center gap-2">
                            <span>Kích thước</span>
                            <select
                                value={filters.size}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        size: Number(event.target.value),
                                        page: 1,
                                    }))
                                }
                                className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm text-slate-700 outline-none focus:border-[var(--glx-blue)]"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600">Họ và tên</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Thư điện tử</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Số điện thoại</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Vai trò</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Cập nhật lúc</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Đang tải người dùng...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không tìm thấy người dùng
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.userId} className="bg-white hover:bg-slate-50/80">
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {user.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    user.status === "ACTIVE"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : user.status === "LOCKED"
                                                          ? "bg-amber-100 text-amber-700"
                                                          : user.status === "SUSPENDED"
                                                            ? "bg-rose-100 text-rose-700"
                                                            : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(user.updatedAt).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(user)}
                                                    className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                >Sửa</button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(user)}
                                                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                >Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-[var(--glx-border)] px-5 py-4">
                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                        }
                        disabled={filters.page === 1 || isLoading}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Trước
                    </button>

                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, page }))}
                            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                                filters.page === page
                                    ? "border-[var(--glx-blue)] bg-[var(--glx-blue)] text-white"
                                    : "border-[var(--glx-border)] text-slate-600 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                page: Math.min(totalPages, prev.page + 1),
                            }))
                        }
                        disabled={filters.page >= totalPages || isLoading}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Tiếp
                    </button>
                </div>
            </section>

            <ModalShell open={openCreate} onClose={() => setOpenCreate(false)} title="Thêm người dùng mới">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                {...createForm.register("fullName")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.fullName && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.fullName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Email *
                            </label>
                            <input
                                type="email"
                                {...createForm.register("email")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.email && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Số điện thoại *
                            </label>
                            <input
                                type="text"
                                {...createForm.register("phoneNumber")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.phoneNumber && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.phoneNumber.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Password *
                            </label>
                            <input
                                type="password"
                                {...createForm.register("password")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.password && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Vai trò *
                            </label>
                            <select
                                {...createForm.register("role")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {roles.map((role) => (
                                    <option key={`create-${role}`} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.role && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.role.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Trạng thái *
                            </label>
                            <select
                                {...createForm.register("status")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {statuses.map((status) => (
                                    <option key={`create-${status}`} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.status && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.status.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                {...createForm.register("dateOfBirth")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Giới tính</label>
                            <select
                                {...createForm.register("sex")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value="">Chưa thiết lập</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setOpenCreate(false)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >Hủy</button>
                        <button
                            type="submit"
                            disabled={createForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Tạo người dùng
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={openEdit} onClose={() => setOpenEdit(false)} title="Sửa người dùng">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                {...editForm.register("fullName")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.fullName && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.fullName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Email *
                            </label>
                            <input
                                type="email"
                                {...editForm.register("email")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.email && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Số điện thoại *
                            </label>
                            <input
                                type="text"
                                {...editForm.register("phoneNumber")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.phoneNumber && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.phoneNumber.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                New Password
                            </label>
                            <input
                                type="password"
                                {...editForm.register("password")}
                                placeholder="Leave empty if unchanged"
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.password && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Vai trò *
                            </label>
                            <select
                                {...editForm.register("role")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {roles.map((role) => (
                                    <option key={`edit-${role}`} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.role && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.role.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Trạng thái *
                            </label>
                            <select
                                {...editForm.register("status")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {statuses.map((status) => (
                                    <option key={`edit-${status}`} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.status && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.status.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                {...editForm.register("dateOfBirth")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Giới tính</label>
                            <select
                                {...editForm.register("sex")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value="">Chưa thiết lập</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setOpenEdit(false)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >Hủy</button>
                        <button
                            type="submit"
                            disabled={editForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Xóa người dùng"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa người dùng{" "}
                        <strong>{deleteTarget?.fullName ?? "this account"}</strong>?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >Hủy</button>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >Xóa</button>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
};

export default UserManagement;



