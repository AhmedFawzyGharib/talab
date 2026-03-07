import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Products() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await api.get("/admin/products");

        setProducts(res.data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);

  const deleteProduct = async (id) => {

    await api.delete(`/admin/products/${id}`);

    setProducts(prev =>
      prev.filter(p => p._id !== id)
    );
  };

  const toggleProduct = async (id) => {

    const res = await api.patch(`/admin/products/${id}/toggle`);

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? res.data : p
      )
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Products
        </h1>

        <Link
          to="/products/create"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Create Product
        </Link>

      </div>

      {products.map(product => (

        <div
          key={product._id}
          className="p-4 border-b bg-white rounded mb-3 shadow"
        >

          <div className="flex justify-between items-center">

            <div>

              <p className="font-semibold text-lg">
                {product.name}
              </p>

              <p>Price: {product.price}</p>

              <p>
                Status:
                {product.isAvailable
                  ? " Available"
                  : " Disabled"}
              </p>

            </div>

            <div className="space-x-2">

              <button
                onClick={() => toggleProduct(product._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Toggle
              </button>

              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}