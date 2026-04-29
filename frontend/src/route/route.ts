import Booking from "../pages/client/Booking";
import Home from "../pages/client/Home";
import IsShowing from "../pages/client/IsShowing";
import SearchPage from "../pages/client/SearchPage";
import VnpayReturn from "../pages/client/VnpayReturn";
import ShowtimesPageRoute from "./ShowtimesPageRoute";
import QuickBookingPage from "../pages/client/QuickBooking";
import OrderHistoryPage from "../pages/client/OrderHistory";
import Login from "../pages/client/Login";

const routePath = {
    login: "/login",
    home: "/",
    search: "/search",
    phim_dang_chieu: "/phim-dang-chieu",
    xuat_chieu: "/xuat-chieu/:slug",
    xuat_chieu_province: "/xuat-chieu/:slug/province/:province",
    xuat_chieu_day: "/xuat-chieu/:slug/day/:day",
    xuat_chieu_province_day: "/xuat-chieu/:slug/province/:province/day/:day",
    dat_ve: "/dat-ve/:slug/showtime/:showtimeId",
    lich_su_dat_ve: "/lich-su-dat-ve",
    checkout_vnpay_return: "/checkout/vnpay/return",
    dat_ve_quick: "/dat-ve-quick",
};

const cusPublicRoutes = [
    {
        path: routePath.login,
        label: "Đăng nhập",
        isContent: true,
        type: "COMMON",
        component: Login,
        isPrivate: false,
    },

    {
        path: routePath.home,
        label: "Trang chu",
        isContent: false,
        type: "CUSTOMER",
        component: Home,
        isPrivate: false,
    },

    {
        path: routePath.search,
        label: "Search",
        isContent: false,
        type: "CUSTOMER",
        component: SearchPage,
        isPrivate: false,
    },

    {
        path: routePath.phim_dang_chieu,
        label: "Phim dang chieu",
        isContent: false,
        type: "CUSTOMER",
        component: IsShowing,
        isPrivate: false,
    },

    {
        path: routePath.xuat_chieu,
        label: "Xuat chieu",
        isContent: false,
        type: "CUSTOMER",
        component: ShowtimesPageRoute,
        isPrivate: false,
    },

    {
        path: routePath.xuat_chieu_province,
        label: "Xuat chieu",
        isContent: false,
        type: "CUSTOMER",
        component: ShowtimesPageRoute,
        isPrivate: false,
    },

    {
        path: routePath.xuat_chieu_day,
        label: "Xuat chieu",
        isContent: false,
        type: "CUSTOMER",
        component: ShowtimesPageRoute,
        isPrivate: false,
    },

    {
        path: routePath.xuat_chieu_province_day,
        label: "Xuat chieu",
        isContent: false,
        type: "CUSTOMER",
        component: ShowtimesPageRoute,
        isPrivate: false,
    },

    {
        path: routePath.dat_ve,
        label: "Dat ve",
        isContent: false,
        type: "CUSTOMER",
        component: Booking,
        isPrivate: false,
    },

    {
        path: routePath.lich_su_dat_ve,
        label: "Lich su dat ve",
        isContent: false,
        type: "CUSTOMER",
        component: OrderHistoryPage,
        isPrivate: false,
    },

    {
        path: routePath.dat_ve_quick,
        label: "Dat ve quick",
        isContent: false,
        type: "CUSTOMER",
        component: QuickBookingPage,
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
