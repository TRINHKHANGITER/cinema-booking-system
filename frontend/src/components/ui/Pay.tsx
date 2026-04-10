import React from "react";

const Pay = () => {
  return (
    <div>
      <div className="bg-white p-4 ">
        <h3 className="text-l mb-4 font-semibold">Khuyến mãi</h3>
        <div className="md:mt-4 mt-2">
          <form autoComplete="off">
            <div className="mt-4 grid grid-cols-2 gap-4 xl:w-2/3 w-full">
              <div className="col-span-1">
                <label
                  className="inline-block mb-1 text-black-10 text-sm font-bold"
                  htmlFor="voucher-code"
                >
                  Mã khuyến mãi
                </label>
                <input
                  id="voucher-code"
                  type="text"
                  className="border border-gray-200 w-full py-2 px-4 outline-none"
                  name="barcode"
                />
              </div>
              <div className="col-span-1 flex items-start mt-7">
                <button className="bg-[rgb(245,128,32)] text-white text-sm rounded px-12 py-2 h-[42px]">
                  Áp Dụng
                </button>
              </div>
            </div>
            <p className="text-[12px] text-[rgb(119,119,119)] mt-2">
              Lưu ý: Có thể áp dụng nhiều vouchers vào 1 lần thanh toán
            </p>
          </form>
          </div>
      </div>
      <div className="bg-white p-4 mt-8">
        <h3 className="text-l mb-4 font-semibold">Phương thức thanh toán</h3>
        <div className="my-4">
            <ul className="leading-5">
                <li className="mb-4 flex items-start gap-3">
                    <input type="radio" className="mt-1 w-4 h-4 text-primary shrink-0" name="payment-methods" id="payment-onepay" defaultValue="onepay" defaultChecked />
                    <img
  alt=""
  loading="lazy"
  width={50}
  height={50}
  decoding="async"
  data-nimg="1"
  className="shrink-0 object-cover duration-500 ease-in-out group-hover:opacity-100 scale-100 blur-0 grayscale-0"
  src="/images/Mbank.png"
  style={{ color: "transparent" }}
/>
                    <label htmlFor="payment-onepay" className="flex-1 min-w-0 md:text-base text-sm leading-5 break-words">MBank - Visa, Master, JCB,... / ATM / QR Ngân hàng / Apple Pay</label>


                </li>
            </ul>
        </div>
        <div className="mt-8 text-sm"><strong className="text-red-500 font-semibold">(*) </strong><span>Bằng việc click/chạm vào THANH TOÁN bên phải, bạn đã xác nhận hiểu rõ các Quy Định Giao Dịch Trực Tuyến của Galaxy Cinema.</span></div>
      </div>
    </div>
  );
};

export default Pay;
