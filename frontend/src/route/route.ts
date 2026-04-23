import Booking from "../pages/client/Booking";
import IsShowing from "../pages/client/IsShowing";
import Home from "../pages/client/Home";
import BookTicket from "../pages/client/BookTicket";
import VnpayReturn from "../pages/client/VnpayReturn";

const routePath = {
    login: "/login",
    home: "/",
    phim_dang_chieu: "/phim-dang-chieu",
    xuat_chieu: "/xuat-chieu/:slug",
    dat_ve: "/dat-ve/:slug",
    checkout_vnpay_return: "/checkout/vnpay/return",
};

const cusPublicRoutes = [
    {
        path: routePath.home,
        label: "Trang chủ",
        isContent: false,
        type: "CUSTOMER",
        component: Home,
        isPrivate: false,
    },

    {
        path: routePath.phim_dang_chieu,
        label: "Phim đang chiếu",
        isContent: false,
        type: "CUSTOMER",
        component: IsShowing,
        isPrivate: false,
    },

    {
        path: routePath.xuat_chieu,
        label: "Xuất chiếu",
        isContent: false,
        type: "CUSTOMER",
        component: BookTicket,
        isPrivate: false,
    },

    {
        path: routePath.dat_ve,
        label: "Đặt vé",
        isContent: false,
        type: "CUSTOMER",
        component: Booking,
        isPrivate: false,
    },

    {
        path: routePath.checkout_vnpay_return,
        label: "Checkout vnpay return",
        isContent: false,
        type: "CUSTOMER",
        component: VnpayReturn,
        isPrivate: false,
    },
];

export { routePath, cusPublicRoutes };
