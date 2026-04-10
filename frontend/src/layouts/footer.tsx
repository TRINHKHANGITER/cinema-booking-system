import React from "react";
import Facebook from "../components/icon/facebook";
import Youtube from "../components/icon/youtube";
import Ig from "../components/icon/ig";
import Phone from "../components/icon/phone";
import Mobile from "../components/icon/mobile";
import Plane from "../components/icon/plane";

const Footer = () => {
  return (
    <footer className="footer bg-[#1f1f1f] text-[#d0d0d0]">
      <div className="xl:max-w-screen-xl lg:max-w-4xl md:max-w-4xl mx-auto md:px-4 sm:px-[45px] px-[16px]">

        {/* Top footer */}
        <div className="py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-y-0">

            {/* Giới thiệu */}
            <div>
              <h3 className="font-semibold mb-3 md:mb-6 text-white">Giới thiệu</h3>
              <ul className="space-y-4 text-[16px]">
                <li><a href="#" className="hover:text-[#FD841F] transition">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Thoả thuận sử dụng</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Quy chế hoạt động</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Chính sách bảo mật</a></li>
              </ul>
            </div>

            {/* Góc điện ảnh */}
            <div>
              <h3 className="font-semibold mb-3 md:mb-6 text-white">Góc điện ảnh</h3>
              <ul className="space-y-4 text-[16px]">
                <li><a href="#" className="hover:text-[#FD841F] transition">Thể loại phim</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Bình luận phim</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Blog điện ảnh</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Phim hay tháng</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Phim IMAX</a></li>
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h3 className="font-semibold mb-3 md:mb-6 text-white">Hỗ trợ</h3>
              <ul className="space-y-4 text-[16px]">
                <li><a href="#" className="hover:text-[#FD841F] transition">Góp ý</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Sale & Services</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Rạp / Giá vé</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-[#FD841F] transition">FAQ</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <div className="mb-5">
                <img
                  src="/images/galaxy-logo-mobile.png"
                  alt="Galaxy Cinema"
                  className="w-[94px]"
                />
              </div>

              <ul className="flex gap-4">
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Facebook />
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Youtube />
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Ig />
                  </a>
                </li>
              </ul>

              <div className="mt-5">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/glx_trade.png"
                    alt="Trade"
                    className="w-[150px]"
                  />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">

            <img
              src="/images/glx-footer.svg"
              alt="Galaxy"
              className="w-[94px]"
            />

            <div className="text-sm space-y-1">
              <h3 className="font-semibold text-white">
                CÔNG TY CỔ PHẦN PHIM THIÊN NGÂN
              </h3>

              <p>MST: 0101595681</p>

              <p>
                3/9 Võ Văn Tần, Phường Xuân Hòa, Thành phố Hồ Chí Minh, Việt Nam
              </p>

              <p className="flex items-center justify-center gap-x-2">
                <Phone/>
                <a
                  href="tel:02839333303"
                  className="hover:text-[#FD841F] transition"
                >
                  028.39.333.303
                </a>{" "}
                -{" "}
                <a
                  href="tel:19002224"
                  className="hover:text-[#FD841F] transition flex items-center justify-center gap-x-2"
                >
                  <Mobile/>
                  19002224 (9:00 - 22:00)
                </a>{" "}
                -{" "}
                <a
                  href="mailto:hotro@galaxystudio.vn"
                  className="hover:text-[#FD841F] transition flex items-center justify-center gap-x-2"
                >
                  <Plane/>
                  hotro@galaxystudio.vn
                </a>
              </p>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;