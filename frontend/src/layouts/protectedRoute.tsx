import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useAuthStore } from "../stores/auth";
import Signin from "./signin";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const [open, setOpen] = useState(false);

  const init = async () => {
    if (!accessToken) {
      await refresh();
    }

    if (accessToken && !user) {
      await fetchMe();
    }

    setStarting(false);
    if (!accessToken) setOpen(true);
  };

  useEffect(() => {
    init().catch(console.error);
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <span className="animate-pulse">Đang tải trang...</span>
      </div>
    );
  }

  if (!accessToken) {
    return <Signin open={open} setOpen={setOpen} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;