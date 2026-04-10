import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/client/Home";
import BookTicket from "./pages/client/BookTicket";
import Booking from "./pages/client/Booking";
import IsShowing from "./pages/client/IsShowing";
import { Toaster } from "sonner";

import AuthInitializer from "./layouts/AuthInitializer";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AuthInitializer> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/xuat-chieu/:slug" element={<BookTicket />} />
            {/* <Route element={<ProtectedRoute />}>
              <Route path="/dat-ve/:slug" element={<Booking />} />
            </Route> */}
            <Route path="/dat-ve/:slug" element={<Booking />} />
            <Route path="/phim-dang-chieu" element={<IsShowing />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </>
  );
}

export default App;
