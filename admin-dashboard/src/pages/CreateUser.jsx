import React, { useState } from "react";
import api from "../services/api";

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.post("/admin/users", form);

      setResult(res.data);
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "admin",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Create New User
      </h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-xl">
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="driver">Driver</option>
            <option value="merchant">Merchant</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-green-100 rounded">
            <p>
              <strong>Email:</strong> {result.email}
            </p>
            <p>
              <strong>Password:</strong>{" "}
              {result.generatedPassword}
            </p>
          </div>
        )}
      </div>
    </>
  );
}