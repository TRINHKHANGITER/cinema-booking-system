// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/client/Home";
// import BookTicket from "./pages/client/BookTicket";
// import Booking from "./pages/client/Booking";
// import IsShowing from "./pages/client/IsShowing";
// import { Toaster } from "sonner";

// import AuthInitializer from "./layouts/AuthInitializer";

// function App() {
//   return (
//     <>
//       <Toaster position="top-right" richColors />
//       <BrowserRouter>
//         <AuthInitializer>
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/xuat-chieu/:slug" element={<BookTicket />} />
//             {/* <Route element={<ProtectedRoute />}>
//               <Route path="/dat-ve/:slug" element={<Booking />} />
//             </Route> */}
//             <Route path="/dat-ve/:slug" element={<Booking />} />
//             <Route path="/phim-dang-chieu" element={<IsShowing />} />
//           </Routes>
//         </AuthInitializer>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { cusPublicRoutes } from "./route/route";
import DefaultLayout from "./layouts/DefaultLayout";
import { Toaster } from "sonner";
import AuthInitializer from "./layouts/AuthInitializer";
import AdminGuard from "./layouts/AdminGuard";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import MovieManagement from "./pages/admin/MovieManagement";
import MovieTypeManagement from "./pages/admin/MovieTypeManagement";
import PriceTicketManagement from "./pages/admin/PriceTicketManagement";
import ProvinceManagement from "./pages/admin/ProvinceManagement";
import RoomTypeManagement from "./pages/admin/RoomTypeManagement";
import SeatTypeManagement from "./pages/admin/SeatTypeManagement";
import ShowtimeManagement from "./pages/admin/ShowtimeManagement";
import UserManagement from "./pages/admin/UserManagement";
import ComboManagement from "./pages/admin/ComboManagement";
import CinemaManagement from "./pages/admin/CinemaManagement";

function App() {
    return (
        <>
            <Router>
                <Toaster position="top-right" richColors />
                <AuthInitializer>
                    <Routes>
                        {cusPublicRoutes.map((route, index) => {
                            const ContentComp = route.component;
                            let Layouts: React.FC<{ children: React.ReactNode }> =
                                DefaultLayout;

                            if (route.isContent) {
                                Layouts = ({ children }) => <>{children}</>;
                            }

                            if (route.type === "CUSTOMER" || route.type === "COMMON") {
                                const element = (
                                    <Layouts>
                                        <ContentComp />
                                    </Layouts>
                                );

                                return (
                                    <Route key={index} path={route.path} element={element} />
                                );
                            }

                            return null;
                        })}

                        <Route element={<AdminGuard />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="users" element={<UserManagement />} />
                                <Route path="provinces" element={<ProvinceManagement />} />
                                <Route path="cinemas" element={<CinemaManagement />} />
                                <Route path="movie-types" element={<MovieTypeManagement />} />
                                <Route path="room-types" element={<RoomTypeManagement />} />
                                <Route path="seat-types" element={<SeatTypeManagement />} />
                                <Route
                                    path="price-tickets"
                                    element={<PriceTicketManagement />}
                                />
                                <Route path="combos" element={<ComboManagement />} />
                                <Route path="movies" element={<MovieManagement />} />
                                <Route path="showtimes" element={<ShowtimeManagement />} />
                            </Route>
                        </Route>
                    </Routes>
                </AuthInitializer>
            </Router>
        </>
    );
}

export default App;
