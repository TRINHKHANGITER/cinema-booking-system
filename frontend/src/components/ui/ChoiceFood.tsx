import React, { useEffect } from "react";
import Minus from "../icon/minus";
import Plus from "../icon/plus";
import useFoodStore from "../../stores/combo";
import useBookingStore from "../../stores/booking";

const ChoiceFood = () => {
  const { fetchFoods, combo } = useFoodStore();
  const { selectedCombos, toggleCombo } = useBookingStore();
  useEffect(() => {
    fetchFoods();
  }, []);
  return (
    <div className="bg-white p-4 md:h-full h-[80vh] overflow-hidden">
      <h3 className="text-l mb-4 font-semibold">Chọn Combo / Sản phẩm</h3>
      <ul className="concession__list h-[80vh] overflow-auto pb-10 px-2 md:px-0">
        {combo.map((item) => {
          const selected = selectedCombos.find(
            (c) => c.comboId === item.comboId,
          );
          const qty = selected?.quantity ?? 0;
          return (
            <div>
              <li className="md:flex lg:flex xl:flex hidden mb-5 overflow-auto">
                <img
                  alt="Combo 1  Big Extra Premium"
                  loading="lazy"
                  width={150}
                  height={100}
                  decoding="async"
                  data-nimg={1}
                  className='inline-block rounded-md w-[150px] h-[90px] mr-2 object-cover duration-500 ease-in-out group-hover:opacity-100"
scale-100 blur-0 grayscale-0)'
                  src="/images/co-combo-1-extra-premium.png"
                  style={{ color: "transparent" }}
                />
                <div className="flex-1 px-4">
                  <h4 className="text-base font-semibold mb-1">
                    {item.comboName}
                  </h4>
                  <div className="text-sm">{item.description}</div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div>
                      <strong>Giá: </strong>
                      <span className="inline-block font-bold">
                        {Number(item.price).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="flex bg-white border-md rounded shadow-qty ">
                      <div className="md:py-1  rounded outline-none flex items-center justify-center">
                        <button
                          className="md:px-2 outline-none"
                          onClick={() => toggleCombo(item, -1)}
                        >
                          <Minus />
                        </button>
                        <button className="inline-block px-2 mx-1">
                          {qty}
                        </button>
                        <button
                          className="md:px-2"
                          onClick={() => toggleCombo(item, 1)}
                        >
                          <Plus />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="transition-all duration-500 ease-in-out overflow-hidden max-h-0 opacity-0 pt-0 space-y-0">
                    <div className="sm:space-y-4 space-y-2" />
                  </div>
                </div>
              </li>
              <li className="md:hidden lg:hidden xl:hidden flex flex-col mb-5 border rounded-lg p-3 overflow-auto">
                <div className="flex">
                  <img
                    alt="Combo 1  Big Extra Premium"
                    loading="lazy"
                    width={100}
                    height={60}
                    decoding="async"
                    data-nimg={1}
                    className='w-[100px] h-[60px] rounded-md mb-2 object-cover mr-2 object-cover duration-500 ease-in-out group-hover:opacity-100"
scale-100 blur-0 grayscale-0)'
                    src="/images/co-combo-1-extra-premium.png"
                    style={{ color: "transparent" }}
                  />
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-base font-semibold mb-1">
                        {item.comboName}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {item.description}
                        <div>
                          <strong>Giá: </strong>
                          <span className="inline-block font-bold">
                            {Number(item.price).toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-white border rounded shadow-qty text-xs flex items-center justify-center">
                        <button
                          className="px-2 py-1"
                          onClick={() => toggleCombo(item, -1)}
                        >
                          <Minus />
                        </button>
                        <span className="px-2 py-1">{qty}</span>
                        <button
                          className="px-2 py-1"
                          onClick={() => toggleCombo(item, 1)}
                        >
                          <Plus />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default ChoiceFood;
