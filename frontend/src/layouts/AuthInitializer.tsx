import { useEffect } from "react";
import { useAuthStore } from "../stores/auth";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user, refresh, fetchMe } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        await refresh();
      }
      if (accessToken && !user) {
        await fetchMe();
      }
    };
    init().catch(console.error);
  }, []);

  return <>{children}</>;
};

export default AuthInitializer;