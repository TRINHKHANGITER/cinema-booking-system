import { useState } from "react";
import Arrow from "../components/icon/arrow";
import Close from "../components/icon/close";
import Member from "../components/icon/member";
import Menu from "../components/icon/menu";
import Search from "../components/icon/search";
// import Card from "../components/ui/Card";
import Signin from "./signin";
import Register from "./register";
import { useAuthStore } from "../stores/auth";

type MenuType = "starshop" | "gocdienanh" | "sukien" | "rap" | "phim";
const Header = () => {
  const user = useAuthStore(s=>s.user)
  const {signOut} = useAuthStore()
 
const [open, setOpen] = useState<boolean>(false);
const [openSignIn, setOpenSignIn] = useState<boolean>(false)
const [openRegister, setOpenRegister] = useState<boolean>(false)

const [openMenu, setOpenMenu] = useState<MenuType | null>(null);

const toggleMenu = (menu: MenuType) => {
  setOpenMenu(openMenu === menu ? null : menu);
};
  return (
    <header className="pt-5 pb-2 lg:pt-3 min-h-20 block bg-white">
      {open && (
  <div
    onClick={() => setOpen(false)}
    className="bg-[#343a40]/60 fixed inset-0 z-[1020] xl:hidden transition-opacity duration-500"
  />
)}
      {/* <div className="my-0 mx-auto screen1390:max-w-screen-xl xl:max-w-[1200px] screen1200:max-w-6xl lg:max-w-4xl md:max-w-4xl lg:px-0 md:px-4 sm:px-[45px] px-[16px]"> */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[120px] xl:px-[0px] ">
      {/* */}
        <nav className="flex justify-start justify-items-center items-center flex-row undefined">
          <a href="/" className="logo__header grow-0 md:mr-[100px] mr-[20px]">
            <img
              alt="Galaxy - Cinema"
              loading="lazy"
              width={115}
              height={60}
              className='max-w-min w-[77px] h-[40px] lg:w-[115px] lg:h-[60px] object-cover duration-500 ease-in-out group-hover:opacity-100"
scale-100 blur-0 grayscale-0)'
              style={{ color: "transparent" }}
              src={"/images/galaxy-logo-mobile.png"}
            />
          </a>
          {/* repo */}
          <a
            className="xl:hidden grow text-left block mr-4"
            href="/booking/"
          >
            <img
              alt="Ticket"
              loading="lazy"
              width={112}
              height={36}
              className='max-w-min w-[84px] h-[27px] lg:w-[112px] lg:h-[36px] inline-block object-cover duration-500 ease-in-out group-hover:opacity-100"
scale-100 blur-0 grayscale-0)'
              style={{ color: "transparent" }}
              src={"../../images/btn-ticket.webp"}
            />
          </a>
          {/* phần center */}
          <div className="hidden xl:flex screen1200:grow screen1200:basis-full items-center gap-8 px-5 transition-all duration-300 ease-in-out">
            <div className="grow md:flex hidden items-center justify-center">
              <a href="/" className="md:block hidden mr-4">
                <img
                  src={"../../images/btn-ticket.webp"}
                  alt="Ticket"
                  loading="lazy"
                  width="112"
                  height="36"
                  className='max-w-min w-[84px] h-[27px] lg:w-[112px] lg:h-[36px] object-cover duration-500 ease-in-out group-hover:opacity-100"
      scale-100 blur-0 grayscale-0)'
                  style={{ color: "transparent" }}
                />
              </a>
              <div className="hover relative">
                <div className="px-3 text-left md:cursor-pointer group hover:text-orange-500 transition-all duration-300">
                  <a
                    href=""
                    className="py-7 flex text-sm justify-between items-center md:pr-0 pr-5 group hover:text-orange-500 transition-all duration-300 ease-in-out not-italic"
                  >
                    Phim
                    <span className="text-xs md:hidden inline text-[#777777]">
                      <i className="chevron-down transition-all duration-300 ease-in-out"></i>
                    </span>
                    <span className="text-xs md:ml-2 md:block hidden group-hover:text-primary transition-all duration-300 ease-in-out text-[#777777]">
                      <Arrow />
                    </span>
                  </a>
                  <div className="absolute top-[65px] -left-[45px] hidden group-hover:md:block hover:md:block z-[800] transition-all duration-300 ease-in-out">
                    <div
                      className="bg-white min-w-[250px] border border-white border-solid rounded px-6 py-4"
                      style={{
                        boxShadow:
                          "0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)",
                      }}
                    >
                      {/* movie show */}
                      <div className="movie_show">
                        <div>
                          <span className="border-l-4 border-solid border-[#034ea2]"></span>
                          <a
                            type="button"
                            className="text-base font-normal text-[#333333] pl-2 inline cursor-pointer uppercase hover:text-orange-500  transition-all duration-300 ease-in-out"
                            href="/phim-dang-chieu/"
                          >
                            Phim đang chiếu
                          </a>
                        </div>
                        <ul>
                          <li className="text-sm text-black py-2 transition-all duration-300">
                            {/* <Card img={img}/> */}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}
<div className="hover relative">
                <div className="px-3 text-left md:cursor-pointer group hover:text-orange-500 transition-all duration-300">
                  <a
                    href=""
                    className="py-7 flex text-sm justify-between items-center md:pr-0 pr-5 group capitalize hover:text-orange-500 transition-all duration-300"
                  >
                    Star Shop{" "}
                    <span className="text-xs md:hidden inline text-[#777777]">
                      <i className="chevron-down transition-all duration-300 ease-in-out"></i>
                    </span>
                    <span className="text-xs md:ml-2 md:block hidden group-hover:text-primary transition-all duration-300 ease-in-out text-[#777777]">
                      <Arrow />
                    </span>
                  </a>
                  <div>
                    <div className="absolute top-[65px] -left-[45px] hidden group-hover:md:block hover:md:block z-[800]">
                      <div
                        className="bg-white min-w-[200px] text-center border border-white border-solid rounded"
                        style={{
                          boxShadow:
                            "0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)",
                        }}
                      >
                        <ul>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/galaxy-merch/"
                            >
                              Seasonal Merchandise
                            </a>
                          </li>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/galaxy-merch/"
                            >
                              Movie Merchandise
                            </a>
                          </li>
                          
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}
              <div className="hover relative">
                <div className="px-3 text-left md:cursor-pointer group hover:text-orange-500 transition-all duration-300">
                  <a
                    href=""
                    className="py-7 flex text-sm justify-between items-center md:pr-0 pr-5 group capitalize hover:text-orange-500 transition-all duration-300"
                  >
                    Góc điện ảnh{" "}
                    <span className="text-xs md:hidden inline text-[#777777]">
                      <i className="chevron-down transition-all duration-300 ease-in-out"></i>
                    </span>
                    <span className="text-xs md:ml-2 md:block hidden group-hover:text-primary transition-all duration-300 ease-in-out text-[#777777]">
                      <Arrow />
                    </span>
                  </a>
                  <div>
                    <div className="absolute top-[65px] -left-[45px] hidden group-hover:md:block hover:md:block z-[800]">
                      <div
                        className="bg-white min-w-[200px] text-center border border-white border-solid rounded"
                        style={{
                          boxShadow:
                            "0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)",
                        }}
                      >
                        <ul>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/galaxy-merch/"
                            >
                              Thể loại phim
                            </a>
                          </li>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/movie-merch/"
                            >
                              Diễn viên
                            </a>
                          </li>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/movie-merch/"
                            >
                              Đạo diễn
                            </a>
                          </li>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/movie-merch/"
                            >
                              Bình luận phim
                            </a>
                          </li>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/movie-merch/"
                            >
                              Blog điện ảnh
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}

              {/*  */}
              <div className="hover relative">
                <div className="px-3 text-left md:cursor-pointer group hover:text-orange-500 transition-all duration-300">
                  <a
                    href=""
                    className="py-7 flex text-sm justify-between items-center md:pr-0 pr-5 group capitalize hover:text-orange-500 transition-all duration-300"
                  >
                    Sự kiện{" "}
                    <span className="text-xs md:hidden inline text-[#777777]">
                      <i className="chevron-down transition-all duration-300 ease-in-out"></i>
                    </span>
                    <span className="text-xs md:ml-2 md:block hidden group-hover:text-primary transition-all duration-300 ease-in-out text-[#777777]">
                      <Arrow />
                    </span>
                  </a>
                  <div>
                    <div className="absolute top-[65px] -left-[45px] hidden group-hover:md:block hover:md:block z-[800]">
                      <div
                        className="bg-white min-w-[200px] text-center border border-white border-solid rounded"
                        style={{
                          boxShadow:
                            "0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)",
                        }}
                      >
                        <ul>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/galaxy-merch/"
                            >
                              Ưu đãi
                            </a>
                          </li>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/movie-merch/"
                            >
                              Phim hay tháng
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}

              {/* Call API để lấy các rạp */}
              <div className="hover relative">
                <div className="px-3 text-left md:cursor-pointer group hover:text-orange-500 transition-all duration-300">
                  <a
                    href=""
                    className="py-7 flex text-sm justify-between items-center md:pr-0 pr-5 group capitalize hover:text-orange-500 transition-all duration-300"
                  >
                    Rạp/Giá vé{" "}
                    <span className="text-xs md:hidden inline text-[#777777]">
                      <i className="chevron-down transition-all duration-300 ease-in-out"></i>
                    </span>
                    <span className="text-xs md:ml-2 md:block hidden group-hover:text-primary transition-all duration-300 ease-in-out text-[#777777]">
                      <Arrow />
                    </span>
                  </a>
                  <div>
                    <div className="absolute top-[65px] -left-[45px] hidden group-hover:md:block hover:md:block z-[800]">
                      <div
                        className="bg-white min-w-[200px] text-center border border-white border-solid rounded"
                        style={{
                          boxShadow:
                            "0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)",
                        }}
                      >
                        <ul>
                          <li className="text-sm text-black hover:text-[#f26b38] hover:pl-0.5 hover:border-l-4 capitalize hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300">
                            <a
                              className="block py-2"
                              href="/product-category/galaxy-merch/"
                            >
                              Galaxy Nguyễn Du
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}
            </div>
          </div>

          {/* Phần đăng nhập */}

<div className="hidden xl:flex xl:grow xl:justify-end items-center relative transition-all duration-300">
              <div className="search mr-4">
              <a
                href=""
                className="font-light cursor-pointer text-sm text-[#777]"
                title="Tìm kiếm"
              >
                <Search />
              </a>
            </div>
            {user ? (
  <div className="md:px-2 py-4 relative items-center text-left md:cursor-pointer group transition-all duration-500 ease-in-out md:flex hidden">
    <div className="w-[40px] h-[40px] leading-[62px] text-center rounded-full bg-[#D0D0D0] border-4 border-solid border-[#E9E9E2] flex-none mr-4">
      <img
        alt="Avatar"
        loading="lazy"
        width={40}
        height={40}
        decoding="async"
        className="w-full h-full rounded-full object-cover duration-500 ease-in-out group-hover:opacity-100 scale-100 blur-0 grayscale-0"
        src="https://www.galaxycine.vn/_next/static/media/user_default.b1a2ce07.png"
      />
    </div>
    <div className="flex items-center justify-center gap-[6px]">
      <img
        alt="Logo Star Mini"
        loading="lazy"
        width={20}
        height={30}
        decoding="async"
        className="inline-block w-[20px] h-[30px]"
        src="https://cdn.galaxycine.vn/media/2020/5/15/s_1589511977688.png"
        style={{ color: "transparent" }}
      />
      <p className="flex-auto md:flex hidden flex-col text-sm font-bold not-italic justify-start items-start md:pr-0 group hover:text-orange-500 transition-all duration-500 ease-in-out capitalize">
        {user.fullName}
        <span className="block text-xs font-light not-italic">Star</span>
      </p>
    </div>

    {/* Dropdown */}
    <div className="absolute left-0 w-full min-w-[150px] max-w-[220px] top-15 pt-2 hidden group-hover:md:block hover:md:block z-[500] transition-all duration-500 ease-in-out">
      <div className="bg-white text-center border border-white border-solid rounded" style={{ boxShadow: "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px" }}>
        <ul className="flex flex-col">
          <li>
            <a className="text-sm text-left text-black py-2 px-[18px] hover:text-[#f26b38] hover:border-l-4 hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300 flex items-center capitalize cursor-pointer">
              <svg aria-hidden="true" focusable="false" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path fill="currentColor" d="M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM128 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM80 432c0-44.2 35.8-80 80-80l64 0c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16L96 448c-8.8 0-16-7.2-16-16z" />
              </svg>
              <span className="grow ml-4">Tài khoản</span>
            </a>
          </li>
          <li>
            <a className="text-sm text-left text-black py-2 px-[18px] hover:text-[#f26b38] hover:border-l-4 hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300 flex items-center capitalize cursor-pointer">
              <svg aria-hidden="true" focusable="false" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M24 56c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24l0 120 16 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l16 0 0-96-8 0C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432l33.2 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-88 0c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
              </svg>
              <span className="grow ml-4">Lịch sử</span>
            </a>
          </li>
          <li>
            <a onClick={()=>{signOut()}} className="text-sm text-left text-black py-2 px-[18px] hover:text-[#f26b38] hover:border-l-4 hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all duration-300 flex items-center capitalize cursor-pointer">
              <svg aria-hidden="true" focusable="false" className="w-4 h-4 rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
              </svg>
              <span className="grow ml-4">Đăng xuất</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
) : (
  <>
    <button onClick={() => setOpenSignIn(true)} data-dialog-target="modal" className="ml-2 text-sm text-[#777] capitalize cursor-pointer transition-all duration-300 hover:text-[#f26b38]">
      Đăng nhập
    </button>
    <Signin open={openSignIn} setOpen={setOpenSignIn} />
    <div className="hover">
      <div className="px-3 py-7 text-left md:cursor-pointer group relative  transition-all duration-300 flex">
        <a href="#" className="cursor-pointer logo__header grow-0">
          <img
            src="../../images/join-member-Gstar.svg"
            alt="Galaxy - Cinema"
            loading="lazy"
            width="100"
            height="42"
            decoding="async"
            data-nimg="1"
            style={{ color: "transparent" }}
          />
        </a>
        <div className="absolute top-20 right-0 hidden md:group-hover:block z-[400] transition-all duration-300 ease-in-out">
          <div
            className="bg-white min-w-[850px] max-w-[1360px] border border-white border-solid rounded px-6 py-4"
            style={{
              boxShadow:
                "0 6px 16px 0 rgba(0,0,0,.08), 0 3px 6px -4px rgba(0,0,0,.12), 0 9px 28px 8px rgba(0,0,0,.05)",
            }}
          >
            <div className="grid grid-cols-4 gap-5">
              <div className="flex flex-col justify-start items-center gap-4 pt-6">
                <img alt="Image Rules" loading="lazy" width={85} height={80} decoding="async" data-nimg={1} className="w-[85px] h-[80px]" style={{ color: "transparent" }} src="../../images/icon-rules.png" />
                <h3 className="text-sm font-bold not-italic capitalize text-center">Thể lệ</h3>
                <a className="w-[80px] h-8 leading-8 text-center text-[#f58020] border border-[#f58020] rounded text-[14px] font-bold not-italic hover:bg-[#f58020] hover:text-white transition-all duration-300 focus:ring-1 focus:outline-none focus:ring-[#fb9440] capitalize" href="#">Chi tiết</a>
              </div>
              <div className="flex flex-col justify-start items-center gap-4 pt-6">
                <img alt="Image login" loading="lazy" width={85} height={80} decoding="async" data-nimg={1} className="w-[85px] h-[80px]" style={{ color: "transparent" }} src="../../images/icon-login.svg" />
                <h3 className="text-sm font-bold not-italic capitalize text-center">Quyền lợi</h3>
                <a className="w-[80px] h-8 leading-8 text-center text-[#f58020] border border-[#f58020] rounded text-[14px] font-bold not-italic hover:bg-[#f58020] hover:text-white transition-all duration-300 focus:ring-1 focus:outline-none focus:ring-[#fb9440] capitalize" href="#">Chi tiết</a>
              </div>
              <div className="flex flex-col justify-start items-center gap-4 pt-6">
                <img alt="Image faq" loading="lazy" width={85} height={80} decoding="async" data-nimg={1} className="w-[85px] h-[80px]" style={{ color: "transparent" }} src="../../images/faq.png" />
                <h3 className="text-sm font-bold not-italic capitalize text-center">Hướng dẫn</h3>
                <a className="w-[80px] h-8 leading-8 text-center text-[#f58020] border border-[#f58020] rounded text-[14px] font-bold not-italic hover:bg-[#f58020] hover:text-white transition-all duration-300 focus:ring-1 focus:outline-none focus:ring-[#fb9440] capitalize" href="#">Chi tiết</a>
              </div>
              <div className="flex flex-col justify-between items-center gap-4">
                <img alt="Image Rules" loading="lazy" width={85} height={80} decoding="async" data-nimg={1} className="w-[85px] h-[80px]" style={{ color: "transparent" }} src="/images/bear_glx.png" />
                <h3 className="text-sm font-bold not-italic capitalize text-center">Đăng Ký Thành Viên G-star Nhận Ngay Ưu Đãi!</h3>
                <button className="w-[96px] h-8 text-white border border-[#f58020] rounded text-[14px] font-bold not-italic bg-[#f58020] hover:text-white transition-all duration-300 ease-in-out focus:ring-1 focus:outline-none focus:ring-[#fb9440] capitalize cursor-pointer" onClick={() => { setOpenRegister(true) }}>
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)}
            
          </div>

          {/* reponsive */}
          <div className="flex md:grow md:basis-6/12 justify-end xl:hidden items-center">
            <a className="text-sm text-[#777] capitalize cursor-pointer transition-all duration-300 hover:text-[#f26b38] flex">
              <span>
                <Member />
              </span>
              Đăng nhập
            </a>
            <button
              className="ml-4"
              data-hs-overlay="#hs-overlay-unstyled"
              aria-controls="hs-overlay-unstyled"
              aria-label="Toggle navigation"
            >
              <span onClick={()=>{setOpen(true)}}>
                <Menu />
              </span>
            </button>
          </div>
          {/*  */}
        </nav>
      </div>

      {/* reponsive */}
      <nav
  className={`
    fixed top-0 right-0 bottom-0
    w-[287px] md:w-[346px]
    bg-white z-[1030]
    pl-8 pt-6 pr-4 md:px-11
    transition-transform duration-500 ease-in-out
    transform
    ${open ? "translate-x-0" : "translate-x-full"}
    xl:hidden
  `}
>
        <div className="flex justify-end">
          <button>
            <span onClick={()=>{setOpen(false)}}>
              <Close />
            </span>
          </button>
        </div>
        {/* inout tìm kiếm */}
        <div className="mt-4">
          <div className="relative">
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="magnifying-glass"
              className="w-4 h-4 svg-inline--fa fa-magnifying-glass absolute top-[30%] left-[5%] text-[#333333]"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full border rounded h-[40px] py-2 outline-none border-[#D0D0D0] px-10"
            />
          </div>
        </div>

        {/*  */}

        {/*mua vé và đăng kí */}
        <div className="flex gap-2 mt-4 justify-center">
          <a className="md:hidden block text-center w-full">
            <img
              alt="Ticket"
              loading="lazy"
              width={87}
              height={27}
              decoding="async"
              data-nimg={1}
              className="max-w-min w-[87px] h-[27px] inline-block object-cover duration-500 ease-in-out group-hover:opacity-100 scale-100 blur-0 grayscale-0"
              style={{ color: "transparent" }}
              src="/images/btn-ticket.png"
            />
          </a>
          <div className="flex justify-center items-center w-full">
            <div className="flex items-center flex-wrap justify-center flex-auto mr-1">
              <a className="cursor-pointer logo__header grow-0">
                <img
                  alt="Galaxy - Cinema"
                  loading="lazy"
                  width={79}
                  height={42}
                  decoding="async"
                  data-nimg={1}
                  style={{ color: "transparent" }}
                  src="/images/join-member-Gstar.svg"
                />
              </a>
            </div>
          </div>
          <div className="flex items-center flex-wrap justify-end flex-auto mr-1 hidden" />
        </div>

        {/*  */}

        {/* Menu */}
        <div className="mt-4 flex flex-col">
          <ul className="flex flex-col justify-start items-start grow-0 h-full gap-1 ">
            {/*  */}
            <div className="text-left capitalize">

  {/* <button
    onClick={() => setDown(!down)}
    className="flex text-sm items-center transition-all duration-200"
  >
    <span className="mr-2">Phim</span>

    <div
      className={`transition-transform duration-300 ${
        down ? "rotate-180" : ""
      }`}
    >
      <Arrow />
    </div>
  </button>

 
  <section
    className={`
      overflow-hidden
      transition-all duration-500 ease-in-out
      ${down ? "max-h-[500px] mt-2" : "max-h-0"}
    `}
  >
    <ul className="pl-5">
      <li className="py-1 text-sm hover:pl-1 hover:border-l-4 hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all">
        Phim đang chiếu
      </li>
      <li className="py-1 text-sm hover:pl-1 hover:border-l-4 hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all">
        Phim sắp chiếu
      </li>
      <li className="py-1 text-sm hover:pl-1 hover:border-l-4 hover:border-[#fd841f] hover:bg-[#fb770b1a] transition-all">
        Phim IMAX
      </li>
    </ul>
  </section> */}
  {/*  */}
  <div className="pb-2">
  <div
    onClick={() => toggleMenu("phim")}
    className="flex text-sm items-center cursor-pointer pr-5 transition-all duration-300"
  >
    <span className={`${openMenu === "phim" ? "text-[#F58020]" : ""} mr-2`}>
      Phim
    </span>

    <div
      className={`transition-transform duration-300 ${
        openMenu === "phim" ? "rotate-180" : ""
      }`}
    >
      <Arrow />
    </div>
  </div>

  <section
    className={`overflow-hidden transition-all duration-500 ease-in-out ${
      openMenu === "phim" ? "max-h-[300px] mt-2" : "max-h-0"
    }`}
  >
    <ul className="pl-5">
      <li className="text-sm py-1 hover:text-[#F58020]">
        Phim đang chiếu
      </li>
      <li className="text-sm py-1 hover:text-[#F58020]">
       Phim sắp chiếu
      </li>
      <li className="text-sm py-1 hover:text-[#F58020]">
       Phim IMAX
      </li>
    </ul>
  </section>
</div>
  {/*  */}
</div>
            {/*  */}
            <div className="pb-2">
  <div
    onClick={() => toggleMenu("starshop")}
    className="flex text-sm  items-center cursor-pointer pr-5 transition-all duration-300"
  >
    <span className={`${openMenu === "starshop" ? "text-[#F58020]" : ""} mr-2`}>
      Star Shop
    </span>

    <div
      className={`transition-transform duration-300 ${
        openMenu === "starshop" ? "rotate-180" : ""
      }`}
    >
      <Arrow />
    </div>
  </div>

  <section
    className={`overflow-hidden transition-all duration-500 ease-in-out ${
      openMenu === "starshop" ? "max-h-[300px] mt-2" : "max-h-0"
    }`}
  >
    <ul className="pl-5">
      <li className="text-sm py-1 hover:text-[#F58020]">
        Seasonal Merchandise
      </li>
      <li className="text-sm py-1 hover:text-[#F58020]">
        Movie Merchandise
      </li>
    </ul>
  </section>
</div>
            {/*  */}
            <div className="pb-2">
  <div
    onClick={() => toggleMenu("gocdienanh")}
    className="flex text-sm items-center cursor-pointer pr-5 transition-all duration-300"
  >
    <span className={`${openMenu === "gocdienanh" ? "text-[#F58020]" : ""} mr-2`}>
      Góc điện ảnh
    </span>

    <div
      className={`transition-transform duration-300 ${
        openMenu === "gocdienanh" ? "rotate-180" : ""
      }`}
    >
      <Arrow />
    </div>
  </div>

  <section
    className={`overflow-hidden transition-all duration-500 ${
      openMenu === "gocdienanh" ? "max-h-[400px] mt-2" : "max-h-0"
    }`}
  >
    <ul className="pl-5">
      <li className="text-sm py-1 hover:text-[#F58020]">Thể loại phim</li>
      <li className="text-sm py-1 hover:text-[#F58020]">Diễn Viên</li>
      <li className="text-sm py-1 hover:text-[#F58020]">Đạo Diễn</li>
      <li className="text-sm py-1 hover:text-[#F58020]">Bình Luận Phim</li>
      <li className="text-sm py-1 hover:text-[#F58020]">Blog Điện Ảnh</li>
    </ul>
  </section>
</div>
            {/*  */}
            <div className="pb-2">
  <div
    onClick={() => toggleMenu("sukien")}
    className="flex text-sm items-center cursor-pointer pr-5 transition-all duration-300"
  >
    <span className={`${openMenu === "sukien" ? "text-[#F58020]" : ""} mr-2`}>
      Sự kiện
    </span>

    <div
      className={`transition-transform duration-300 ${
        openMenu === "sukien" ? "rotate-180" : ""
      }`}
    >
      <Arrow />
    </div>
  </div>

  <section
    className={`overflow-hidden transition-all duration-500 ${
      openMenu === "sukien" ? "max-h-[300px] mt-2" : "max-h-0"
    }`}
  >
    <ul className="pl-5">
      <li className="text-sm py-1 hover:text-[#F58020]">Ưu đãi</li>
      <li className="text-sm py-1 hover:text-[#F58020]">
        Phim Hay Tháng
      </li>
    </ul>
  </section>
</div>
            {/*  */}
            <div>
  <div
    onClick={() => toggleMenu("rap")}
    className="flex text-sm items-center cursor-pointer pr-5 transition-all duration-300"
  >
    <span className={`${openMenu === "rap" ? "text-[#F58020]" : ""} mr-2`}>
      Rạp/Giá vé
    </span>

    <div
      className={`transition-transform duration-300 ${
        openMenu === "rap" ? "rotate-180" : ""
      }`}
    >
      <Arrow />
    </div>
  </div>

  <section
    className={`overflow-hidden transition-all duration-500 ${
      openMenu === "rap"
        ? "max-h-[400px] mt-2 overflow-y-auto"
        : "max-h-0"
    }`}
  >
    <ul className="pl-5">
      <li className="text-sm py-1 hover:text-[#F58020]">
        Galaxy CineX - Hanoi Centre
      </li>
    </ul>
  </section>
</div>
          </ul>
        </div>
        {/*  */}
      </nav>
      <Register open={openRegister} setOpen={setOpenRegister} />
    </header>
  );
};

export default Header;
