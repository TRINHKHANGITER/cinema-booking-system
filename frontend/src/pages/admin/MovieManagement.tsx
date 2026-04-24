import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { movieService } from "../../services/movie.service";
import { movieTypeService } from "../../services/movieType.service";
import type {
    MovieCreationRequest,
    MovieResponse,
    MovieStatus,
    MovieUpdateRequest,
} from "../../types/movie";
import type { MovieTypeResponse } from "../../types/movie-type";
import {
    resolveMovieLandscapeImage,
    resolveMoviePortraitImage,
    resolveMovieText,
} from "../../utils/utils";

const defaultStatuses: MovieStatus[] = ["ACTIVE", "COMING_SOON", "STOPPED", "INACTIVE"];

const optionalNumberSchema = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }
        const numericValue = Number(value);
        return Number.isNaN(numericValue) ? value : numericValue;
    },
    z.number().min(0, "Value must be >= 0").optional()
);

const optionalIntegerSchema = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }
        const numericValue = Number(value);
        return Number.isNaN(numericValue) ? value : numericValue;
    },
    z.number().int("Value must be integer").min(0, "Value must be >= 0").optional()
);

const movieFormSchema = z
    .object({
        movieName: z.string().trim().min(1, "Movie name is required"),
        description: z.string().trim().min(1, "Description is required"),
        durationMinutes: z.coerce.number().int().min(1, "Duration must be greater than 0"),
        movieTypeId: z.coerce.number().int().min(1, "Movie type is required"),
        releaseDate: z.string().trim().min(1, "Release date is required"),
        endDate: z.string().trim().min(1, "End date is required"),
        status: z.string().trim().min(1, "Status is required"),
        trailerUrl: z.string().optional(),
        ratingAverage: optionalNumberSchema,
        totalVotes: optionalIntegerSchema,
        minimumAge: optionalIntegerSchema,
        country: z.string().optional(),
        producer: z.string().optional(),
        director: z.string().optional(),
        actors: z.string().optional(),
    })
    .superRefine((values, context) => {
        const releaseDate = new Date(values.releaseDate);
        const endDate = new Date(values.endDate);

        if (Number.isNaN(releaseDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return;
        }

        if (endDate.getTime() < releaseDate.getTime()) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date must be greater than or equal to release date",
                path: ["endDate"],
            });
        }
    });

type MovieFormValues = z.infer<typeof movieFormSchema>;
type MovieFormInput = z.input<typeof movieFormSchema>;

type ModalShellProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
};

type MovieFormFieldsProps = {
    form: UseFormReturn<MovieFormInput, unknown, MovieFormValues>;
    statuses: MovieStatus[];
    movieTypes: MovieTypeResponse[];
    portraitPreview: string | null;
    landscapePreview: string | null;
    onPortraitFileChange: (file: File | null) => void;
    onLandscapeFileChange: (file: File | null) => void;
};

const parseApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { message?: string } | undefined;
        return payload?.message || fallback;
    }
    return fallback;
};

const normalizeOptionalText = (value: string | undefined) => {
    if (value === undefined) {
        return undefined;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
};

const revokeIfBlob = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

const statusClassByMovieStatus: Record<MovieStatus, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    COMING_SOON: "bg-sky-100 text-sky-700",
    STOPPED: "bg-amber-100 text-amber-700",
    INACTIVE: "bg-slate-200 text-slate-700",
};

const ModalShell = ({ open, title, onClose, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div className="relative max-h-[90vh] w-full max-w-[900px] overflow-y-auto rounded-md bg-white px-6 py-6 shadow-2xl">
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

const MovieFormFields = ({
    form,
    statuses,
    movieTypes,
    portraitPreview,
    landscapePreview,
    onPortraitFileChange,
    onLandscapeFileChange,
}: MovieFormFieldsProps) => {
    return (
        <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Movie Name *
                    </label>
                    <input
                        type="text"
                        {...form.register("movieName")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.movieName && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.movieName.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Status *</label>
                    <select
                        {...form.register("status")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    >
                        {statuses.map((status) => (
                            <option key={`movie-form-status-${status}`} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.status && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.status.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Description *</label>
                <textarea
                    rows={4}
                    {...form.register("description")}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                />
                {form.formState.errors.description && (
                    <p className="mt-1 text-xs text-rose-500">
                        {form.formState.errors.description.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Duration (min) *
                    </label>
                    <input
                        type="number"
                        min={1}
                        {...form.register("durationMinutes")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.durationMinutes && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.durationMinutes.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Movie Type *
                    </label>
                    <select
                        {...form.register("movieTypeId")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    >
                        <option value={0}>Select movie type</option>
                        {movieTypes.map((movieType) => (
                            <option
                                key={`movie-form-type-${movieType.movieTypeId}`}
                                value={movieType.movieTypeId}
                            >
                                {movieType.movieTypeName}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.movieTypeId && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.movieTypeId.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Release Date *
                    </label>
                    <input
                        type="date"
                        {...form.register("releaseDate")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.releaseDate && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.releaseDate.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">End Date *</label>
                    <input
                        type="date"
                        {...form.register("endDate")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.endDate && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.endDate.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Minimum Age
                    </label>
                    <input
                        type="number"
                        min={0}
                        {...form.register("minimumAge")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.minimumAge && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.minimumAge.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Rating Average
                    </label>
                    <input
                        type="number"
                        min={0}
                        step="0.1"
                        {...form.register("ratingAverage")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.ratingAverage && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.ratingAverage.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Total Votes</label>
                    <input
                        type="number"
                        min={0}
                        {...form.register("totalVotes")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                    {form.formState.errors.totalVotes && (
                        <p className="mt-1 text-xs text-rose-500">
                            {form.formState.errors.totalVotes.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Country</label>
                    <input
                        type="text"
                        {...form.register("country")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Producer</label>
                    <input
                        type="text"
                        {...form.register("producer")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Director</label>
                    <input
                        type="text"
                        {...form.register("director")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Actors (comma separated)
                    </label>
                    <input
                        type="text"
                        {...form.register("actors")}
                        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Trailer URL</label>
                <input
                    type="url"
                    {...form.register("trailerUrl")}
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Portrait Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            onPortraitFileChange(file);
                        }}
                        className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                    />
                    {portraitPreview && (
                        <img
                            src={portraitPreview}
                            alt="Movie portrait preview"
                            className="mt-2 h-28 w-20 rounded-md border border-slate-200 object-cover"
                        />
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                        Landscape Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            onLandscapeFileChange(file);
                        }}
                        className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                    />
                    {landscapePreview && (
                        <img
                            src={landscapePreview}
                            alt="Movie landscape preview"
                            className="mt-2 h-24 w-44 rounded-md border border-slate-200 object-cover"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

const resolveMovieTypeId = (movie: MovieResponse) => {
    return movie.movieTypeId ?? movie.movieType?.movieTypeId ?? 0;
};

const MovieManagement = () => {
    const [movies, setMovies] = useState<MovieResponse[]>([]);
    const [statuses, setStatuses] = useState<MovieStatus[]>(defaultStatuses);
    const [movieTypes, setMovieTypes] = useState<MovieTypeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [nameInput, setNameInput] = useState("");
    const [movieTypeInput, setMovieTypeInput] = useState<number | "">("");
    const [statusInput, setStatusInput] = useState<MovieStatus | "">("");

    const [filters, setFilters] = useState({
        name: "",
        movieTypeId: undefined as number | undefined,
        status: "" as MovieStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingMovie, setEditingMovie] = useState<MovieResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MovieResponse | null>(null);

    const [createPortraitFile, setCreatePortraitFile] = useState<File | null>(null);
    const [createPortraitPreview, setCreatePortraitPreview] = useState<string | null>(null);
    const [createLandscapeFile, setCreateLandscapeFile] = useState<File | null>(null);
    const [createLandscapePreview, setCreateLandscapePreview] = useState<string | null>(null);
    const [editPortraitFile, setEditPortraitFile] = useState<File | null>(null);
    const [editPortraitPreview, setEditPortraitPreview] = useState<string | null>(null);
    const [editLandscapeFile, setEditLandscapeFile] = useState<File | null>(null);
    const [editLandscapePreview, setEditLandscapePreview] = useState<string | null>(null);

    const createForm = useForm<MovieFormInput, unknown, MovieFormValues>({
        resolver: zodResolver(movieFormSchema),
        defaultValues: {
            movieName: "",
            description: "",
            durationMinutes: 90,
            movieTypeId: 0,
            releaseDate: "",
            endDate: "",
            status: "ACTIVE",
            trailerUrl: "",
            ratingAverage: undefined,
            totalVotes: undefined,
            minimumAge: undefined,
            country: "",
            producer: "",
            director: "",
            actors: "",
        },
    });

    const editForm = useForm<MovieFormInput, unknown, MovieFormValues>({
        resolver: zodResolver(movieFormSchema),
        defaultValues: {
            movieName: "",
            description: "",
            durationMinutes: 90,
            movieTypeId: 0,
            releaseDate: "",
            endDate: "",
            status: "ACTIVE",
            trailerUrl: "",
            ratingAverage: undefined,
            totalVotes: undefined,
            minimumAge: undefined,
            country: "",
            producer: "",
            director: "",
            actors: "",
        },
    });

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await movieService.getMovieStatuses();
            const nextStatuses = response.result?.items ?? defaultStatuses;
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchMovieTypes = useCallback(async () => {
        try {
            const response = await movieTypeService.getMovieTypeItemList("ACTIVE");
            setMovieTypes(response.result?.items ?? []);
        } catch {
            setMovieTypes([]);
        }
    }, []);

    const fetchMovies = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await movieService.filterMovies({
                name: filters.name,
                movieTypeId: filters.movieTypeId,
                status: filters.status || undefined,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setMovies([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setMovies(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Cannot load movies"));
            setMovies([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchStatuses();
        void fetchMovieTypes();
    }, [fetchMovieTypes, fetchStatuses]);

    useEffect(() => {
        void fetchMovies();
    }, [fetchMovies]);

    useEffect(() => {
        return () => {
            revokeIfBlob(createPortraitPreview);
            revokeIfBlob(createLandscapePreview);
            revokeIfBlob(editPortraitPreview);
            revokeIfBlob(editLandscapePreview);
        };
    }, [createLandscapePreview, createPortraitPreview, editLandscapePreview, editPortraitPreview]);

    const handleCreatePortraitChange = (file: File | null) => {
        revokeIfBlob(createPortraitPreview);
        setCreatePortraitFile(file);
        setCreatePortraitPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleCreateLandscapeChange = (file: File | null) => {
        revokeIfBlob(createLandscapePreview);
        setCreateLandscapeFile(file);
        setCreateLandscapePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleEditPortraitChange = (file: File | null) => {
        revokeIfBlob(editPortraitPreview);
        setEditPortraitFile(file);
        if (file) {
            setEditPortraitPreview(URL.createObjectURL(file));
            return;
        }
        setEditPortraitPreview(editingMovie ? resolveMoviePortraitImage(editingMovie.imagePortrait) : null);
    };

    const handleEditLandscapeChange = (file: File | null) => {
        revokeIfBlob(editLandscapePreview);
        setEditLandscapeFile(file);
        if (file) {
            setEditLandscapePreview(URL.createObjectURL(file));
            return;
        }
        setEditLandscapePreview(
            editingMovie ? resolveMovieLandscapeImage(editingMovie.imageLandscape) : null
        );
    };

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
            movieTypeId: movieTypeInput === "" ? undefined : movieTypeInput,
            status: statusInput,
            page: 1,
        }));
    };

    const openCreateModal = () => {
        createForm.reset({
            movieName: "",
            description: "",
            durationMinutes: 90,
            movieTypeId: 0,
            releaseDate: "",
            endDate: "",
            status: "ACTIVE",
            trailerUrl: "",
            ratingAverage: undefined,
            totalVotes: undefined,
            minimumAge: undefined,
            country: "",
            producer: "",
            director: "",
            actors: "",
        });
        handleCreatePortraitChange(null);
        handleCreateLandscapeChange(null);
        setOpenCreate(true);
    };

    const openEditModal = (movie: MovieResponse) => {
        setEditingMovie(movie);
        editForm.reset({
            movieName: movie.movieName,
            description: movie.description,
            durationMinutes: Number(movie.durationMinutes ?? 90),
            movieTypeId: resolveMovieTypeId(movie),
            releaseDate: movie.releaseDate ?? "",
            endDate: movie.endDate ?? "",
            status: movie.status,
            trailerUrl: movie.trailerUrl ?? "",
            ratingAverage:
                movie.ratingAverage === null || movie.ratingAverage === undefined
                    ? undefined
                    : Number(movie.ratingAverage),
            totalVotes:
                movie.totalVotes === null || movie.totalVotes === undefined
                    ? undefined
                    : Number(movie.totalVotes),
            minimumAge:
                movie.minimumAge === null || movie.minimumAge === undefined
                    ? undefined
                    : Number(movie.minimumAge),
            country: movie.country ?? "",
            producer: movie.producer ?? "",
            director: movie.director ?? "",
            actors: movie.actors ?? "",
        });
        setEditPortraitFile(null);
        setEditLandscapeFile(null);
        revokeIfBlob(editPortraitPreview);
        revokeIfBlob(editLandscapePreview);
        setEditPortraitPreview(resolveMoviePortraitImage(movie.imagePortrait));
        setEditLandscapePreview(resolveMovieLandscapeImage(movie.imageLandscape));
        setOpenEdit(true);
    };

    const closeCreateModal = () => {
        revokeIfBlob(createPortraitPreview);
        revokeIfBlob(createLandscapePreview);
        setCreatePortraitFile(null);
        setCreatePortraitPreview(null);
        setCreateLandscapeFile(null);
        setCreateLandscapePreview(null);
        setOpenCreate(false);
    };

    const closeEditModal = () => {
        revokeIfBlob(editPortraitPreview);
        revokeIfBlob(editLandscapePreview);
        setEditPortraitFile(null);
        setEditPortraitPreview(null);
        setEditLandscapeFile(null);
        setEditLandscapePreview(null);
        setOpenEdit(false);
        setEditingMovie(null);
    };

    const toMoviePayload = (
        values: MovieFormValues,
        imagePortrait?: File | null,
        imageLandscape?: File | null
    ): MovieCreationRequest => {
        return {
            movieName: values.movieName.trim(),
            description: values.description.trim(),
            durationMinutes: values.durationMinutes,
            movieTypeId: values.movieTypeId,
            releaseDate: values.releaseDate,
            endDate: values.endDate,
            status: values.status as MovieStatus,
            minimumAge: values.minimumAge,
            imageLandscape: imageLandscape ?? undefined,
            imagePortrait: imagePortrait ?? undefined,
            trailerUrl: normalizeOptionalText(values.trailerUrl),
            ratingAverage: values.ratingAverage,
            totalVotes: values.totalVotes,
            country: normalizeOptionalText(values.country),
            producer: normalizeOptionalText(values.producer),
            director: normalizeOptionalText(values.director),
            actors: normalizeOptionalText(values.actors),
        };
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload = toMoviePayload(values, createPortraitFile, createLandscapeFile);

        try {
            const response = await movieService.createMovie(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Create movie failed");
                return;
            }

            toast.success("Movie created successfully");
            closeCreateModal();
            void fetchMovies();
        } catch (error) {
            toast.error(parseApiError(error, "Create movie failed"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingMovie) return;

        const payload: MovieUpdateRequest = toMoviePayload(
            values,
            editPortraitFile,
            editLandscapeFile
        );

        try {
            const response = await movieService.updateMovie(editingMovie.movieId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Update movie failed");
                return;
            }

            toast.success("Movie updated successfully");
            closeEditModal();
            void fetchMovies();
        } catch (error) {
            toast.error(parseApiError(error, "Update movie failed"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await movieService.deleteMovie(deleteTarget.movieId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Delete movie failed");
                return;
            }

            toast.success("Movie deleted successfully");
            setDeleteTarget(null);
            void fetchMovies();
        } catch (error) {
            toast.error(parseApiError(error, "Delete movie failed"));
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Movie Control
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Movie Management
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Filter, create and update movies with full metadata.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Add Movie
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                    <input
                        value={nameInput}
                        onChange={(event) => setNameInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        type="text"
                        placeholder="Search by movie name..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={movieTypeInput}
                        onChange={(event) =>
                            setMovieTypeInput(event.target.value ? Number(event.target.value) : "")
                        }
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">All movie types</option>
                        {movieTypes.map((movieType) => (
                            <option key={movieType.movieTypeId} value={movieType.movieTypeId}>
                                {movieType.movieTypeName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as MovieStatus | "")}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">All statuses</option>
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
                        Apply
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Movie List</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>Total: {totalItems}</span>
                        <label className="flex items-center gap-2">
                            <span>Size</span>
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
                                <th className="px-6 py-3 font-bold text-slate-600">ID</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Poster</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Movie</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Type</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Date Range</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Status</th>
                                <th className="px-6 py-3 text-right font-bold text-slate-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading movies...
                                    </td>
                                </tr>
                            ) : movies.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        No movies found
                                    </td>
                                </tr>
                            ) : (
                                movies.map((movie) => {
                                    const statusClass =
                                        statusClassByMovieStatus[movie.status] ??
                                        "bg-slate-200 text-slate-700";
                                    return (
                                        <tr key={movie.movieId} className="bg-white hover:bg-slate-50/80">
                                            <td className="px-6 py-4 text-slate-600">{movie.movieId}</td>
                                            <td className="px-6 py-4">
                                                <img
                                                    src={resolveMoviePortraitImage(movie.imagePortrait)}
                                                    alt={resolveMovieText(movie.movieName, "Movie")}
                                                    className="h-16 w-12 rounded border border-slate-200 object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700">
                                                    {resolveMovieText(movie.movieName)}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {Number(movie.durationMinutes ?? 0) > 0
                                                        ? `${movie.durationMinutes} min`
                                                        : "Duration not updated"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Country:{" "}
                                                    {resolveMovieText(movie.country, "Not updated")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {resolveMovieText(
                                                    movie.movieType?.movieTypeName,
                                                    "Not updated"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div>
                                                    {resolveMovieText(
                                                        movie.releaseDate,
                                                        "Not updated"
                                                    )}
                                                </div>
                                                <div>
                                                    to{" "}
                                                    {resolveMovieText(movie.endDate, "Not updated")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
                                                >
                                                    {movie.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(movie)}
                                                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(movie)}
                                                        className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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
                        Prev
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
                        Next
                    </button>
                </div>
            </section>

            <ModalShell open={openCreate} onClose={closeCreateModal} title="Add Movie">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <MovieFormFields
                        form={createForm}
                        statuses={statuses}
                        movieTypes={movieTypes}
                        portraitPreview={createPortraitPreview}
                        landscapePreview={createLandscapePreview}
                        onPortraitFileChange={handleCreatePortraitChange}
                        onLandscapeFileChange={handleCreateLandscapeChange}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={openEdit} onClose={closeEditModal} title="Edit Movie">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <MovieFormFields
                        form={editForm}
                        statuses={statuses}
                        movieTypes={movieTypes}
                        portraitPreview={editPortraitPreview}
                        landscapePreview={editLandscapePreview}
                        onPortraitFileChange={handleEditPortraitChange}
                        onLandscapeFileChange={handleEditLandscapeChange}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Delete Movie"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete movie{" "}
                        <strong>{deleteTarget?.movieName ?? ""}</strong>?
                    </p>
                    <p className="text-xs text-rose-500">
                        Delete will be blocked if any active showtime is using this movie.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
};

export default MovieManagement;
