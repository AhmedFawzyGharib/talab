import React from "react";

export default function DataTable({ columns, data }) {

  return (

    <div className="bg-white rounded-xl shadow overflow-x-auto">

      <table className="w-full text-left">

        <thead className="bg-gray-100">

          <tr>

            {columns.map((col) => (

              <th
                key={col.key}
                className="p-3 text-sm font-semibold text-gray-600"
              >
                {col.label}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {data.map((row, index) => (

            <tr
              key={index}
              className="border-b hover:bg-gray-50"
            >

              {columns.map((col) => (

                <td key={col.key} className="p-3">

                  {col.render
                    ? col.render(row)
                    : row[col.key]}

                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}