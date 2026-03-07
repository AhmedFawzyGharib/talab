import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {

  const navigate = useNavigate();

  const [merchants, setMerchants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    merchantId: "",
    image: null
  });

  // تحميل المتاجر
  useEffect(() => {

    const fetchMerchants = async () => {

      try {

        const res = await api.get("/admin/merchants");

        setMerchants(res.data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchMerchants();

  }, []);

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (name === "image") {

      setForm({
        ...form,
        image: files[0]
      });

    } else {

      setForm({
        ...form,
        [name]: value
      });

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const data = new FormData();

      data.append("name", form.name);
      data.append("price", form.price);
      data.append("quantity", form.quantity);
      data.append("description", form.description);
      data.append("merchantId", form.merchantId);

      if (form.image) {
        data.append("image", form.image);
      }

      await api.post("/admin/products", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Product created successfully");

      navigate("/products");

    } catch (error) {

      console.error(error);

      alert("Error creating product");

    }

  };

  return (
    <div className="max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Create Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <select
          name="merchantId"
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >

          <option value="">Select Merchant</option>

          {merchants.map(m => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}

        </select>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Product
        </button>

      </form>

    </div>
  );
}