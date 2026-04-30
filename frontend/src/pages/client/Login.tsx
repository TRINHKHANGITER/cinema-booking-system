import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import Signin from "../../layouts/signin";

const Login = () => {
    const navigate = useNavigate();

    const handleSetOpen: Dispatch<SetStateAction<boolean>> = (value) => {
        const nextValue = typeof value === "function" ? value(true) : value;

        if (!nextValue) {
            navigate("/");
        }
    };

    return <Signin open={true} setOpen={handleSetOpen} />;
};

export default Login;


