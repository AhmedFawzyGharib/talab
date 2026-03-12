import React from "react";

export default function Pagination({
  page,
  totalPages,
  setPage
}) {

  return (

    <div className="flex justify-center space-x-3 mt-6">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 bg-gray-200 rounded"
      >
        Prev
      </button>

      <span>
        Page {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 bg-gray-200 rounded"
      >
        Next
      </button>

    </div>

  );

}