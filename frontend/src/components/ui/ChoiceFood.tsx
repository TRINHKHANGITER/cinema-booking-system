import Minus from "../icon/minus";
import Plus from "../icon/plus";
import type { Combo, SelectedCombo } from "../../types/combo";

type ChoiceFoodProps = {
    selectedCombos: SelectedCombo[];
    onChange: (items: SelectedCombo[]) => void;
};

const COMBOS: Combo[] = [
    {
        comboId: 1,
        comboName: "Combo Big",
        image: "/images/co-combo-1-extra-premium.png",
        description: "1 bap + 2 nuoc",
        price: 129000,
        status: "AVAILABLE",
    },
    {
        comboId: 2,
        comboName: "Combo Couple",
        image: "/images/co-combo-1-extra-premium.png",
        description: "2 bap + 2 nuoc",
        price: 199000,
        status: "AVAILABLE",
    },
];

const ChoiceFood = ({ selectedCombos, onChange }: ChoiceFoodProps) => {
    const toggleCombo = (combo: Combo, delta: number) => {
        const current = selectedCombos.find((item) => item.comboId === combo.comboId);
        const currentQty = current?.quantity ?? 0;
        const nextQty = Math.max(0, currentQty + delta);

        if (nextQty === 0) {
            onChange(selectedCombos.filter((item) => item.comboId !== combo.comboId));
            return;
        }

        if (current) {
            onChange(
                selectedCombos.map((item) =>
                    item.comboId === combo.comboId ? { ...item, quantity: nextQty } : item
                )
            );
            return;
        }

        onChange([...selectedCombos, { ...combo, quantity: nextQty }]);
    };

    return (
        <div className="bg-white p-4 md:h-full h-[80vh] overflow-hidden">
            <h3 className="text-l mb-4 font-semibold">Chon Combo / San pham</h3>
            <ul className="concession__list h-[80vh] overflow-auto pb-10 px-2 md:px-0">
                {COMBOS.map((item) => {
                    const selected = selectedCombos.find((c) => c.comboId === item.comboId);
                    const qty = selected?.quantity ?? 0;

                    return (
                        <li key={item.comboId} className="flex mb-5 overflow-auto border rounded-lg p-3">
                            <img
                                alt={item.comboName}
                                width={120}
                                height={80}
                                className="inline-block rounded-md w-[120px] h-[80px] mr-2 object-cover"
                                src={item.image ?? "/images/co-combo-1-extra-premium.png"}
                            />
                            <div className="flex-1 px-2">
                                <h4 className="text-base font-semibold mb-1">{item.comboName}</h4>
                                <div className="text-sm">{item.description}</div>
                                <div className="flex justify-between mt-2 text-sm">
                                    <div>
                                        <strong>Gia: </strong>
                                        <span className="inline-block font-bold">
                                            {Number(item.price).toLocaleString("vi-VN")}d
                                        </span>
                                    </div>
                                    <div className="flex bg-white border rounded shadow-qty text-xs items-center">
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
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ChoiceFood;
