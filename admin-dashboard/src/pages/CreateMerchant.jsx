import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateMerchant() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    type: "restaurant",
    lat: "",
    lng: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await api.post("/admin/merchants", form);

      alert("Merchant created successfully");

      navigate("/merchants");

    } catch (error) {

      console.error(error);
      alert("Error creating merchant");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Create Merchant
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >

        <input
          type="text"
          name="name"
          placeholder="Merchant Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >

          <option value="restaurant">Restaurant</option>
          <option value="market">Market</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="store">Store</option>

        </select>

        <input
          type="number"
          name="lat"
          placeholder="Latitude"
          value={form.lat}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="lng"
          placeholder="Longitude"
          value={form.lng}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Merchant"}
        </button>

      </form>

    </div>
  );
}