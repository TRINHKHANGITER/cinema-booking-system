import React, { useState } from 'react'
import Select from 'react-dropdown-select'
type Option = {
  label: string;
  value: string;
};
const Dropdown = () => {
   const [value, setValue] = useState<Option[]>([
    { label: "Toàn quốc", value: "all" }
  ]);

  const options = [
    { label: "Toàn quốc", value: "all" },
    { label: "Hồ Chí Minh", value: "hcm" },
    { label: "Hà Nội", value: "hn" },
  ];

  return (
    <Select className='custom-select'
      options={options}
      values={value}
      onChange={(values) => setValue(values)}
    />
  );
}

export default Dropdown