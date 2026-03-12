import React from "react";

export default function SearchBar({ value, onChange }) {

  return (

    <input
      type="text"
      placeholder="Search..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2 w-full max-w-sm"
    />

  );

}