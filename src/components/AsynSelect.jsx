import React, { useEffect, useState } from "react";
import { useRef } from "react";

const AsyncSelect = ({
  loadOptions,
  onItemSubmit,
  value,
  onChange,
  className,
  placeholder = "",
  ...rest
}) => {
  const [localValue, setLocalValue] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const inputRef = useRef();
  const valueRef = useRef();

  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (value) pincodeFetcher(value);
    setLocalValue(value);
  }, [value]);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (valueRef.current && valueRef.current.contains(e.target)) {
        // let s = list?.find((item) => item.key === localValue);
        // if (s) {
        //     setLocalValue(s.key);
        //     onChange && onChange(s.key);
        // }
      } else if (inputRef.current && !inputRef.current.contains(e.target)) {
        if (localValue === "") onChange("");
        setOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => {
      window.removeEventListener("click", handler);
    };
  }, [open, localValue, list]);

  const pincodeFetcher = async (pin) => {
    const data = await loadOptions(pin);
    setList(data);
  };

  const handleOnChange = async (_value) => {
    setLocalValue(_value);
    pincodeFetcher(_value);
  };

  const handleOnItemClick = (_selected) => {
    setOpen(false);
    let s = list?.find((item) => item.key === _selected);
    let a = s?.key || localValue;
    setLocalValue(a);
    setSelected(_selected);

    onItemSubmit && onItemSubmit(s);
    onChange && onChange(_selected);
  };

  return (
    <div className="relative">
      <input
        onClick={() => {
          setOpen(true);
        }}
        ref={valueRef}
        className={"form-control " + className}
        value={value}
        style={{ caretColor: "transparent" }}
        placeholder={placeholder}
        readOnly
      />
      {/* {value}
            </input> */}

      {open && (
        <ul className="async-select border-gray-100 border rounded-lg bg-white overflow-y-auto absolute  max-h-[300px] w-full z-50">
          <input
            ref={inputRef}
            autoComplete="off"
            type="text"
            id="123"
            className={"form-control rounded-lg " + className}
            onChange={(e) => handleOnChange(e.currentTarget.value)}
            value={localValue}
            {...rest}
            autoFocus
            placeholder="Search..."
          />
          {localValue ? (
            list.length ? (
              list.map((item, index) => (
                <li
                  key={item.key}
                  onClick={() => handleOnItemClick(item.key)}
                  className={` p-2 hover:bg-blue-200 ${
                    selected === item.key ? "text-cyan-800" : ""
                  }`}
                >
                  {item.value}
                </li>
              ))
            ) : (
              <li className="p-2">No result</li>
            )
          ) : (
            <li className="p-2">Type to Search...</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AsyncSelect;
