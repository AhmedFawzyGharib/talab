import React, { useState } from "react";
import api from "../services/api";

const ROLE_OPTIONS = [
  { value: "admin", label: "🛡 Admin", description: "Full management access" },
  { value: "merchant", label: "🏬 Merchant", description: "Owns shops/products" },
  { value: "driver", label: "🚚 Driver", description: "Delivers orders" },
  { value: "customer", label: "👤 Customer", description: "Places orders" },
];

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    setResult(null);

    if (form.name.trim().length < 2) {
      return setError("Name must be at least 2 characters");
    }
    if (!/^01[0125]\d{8}$/.test(form.phone)) {
      return setError("Phone must be 11 digits starting with 010/011/012/015");
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setError("Invalid email format");
    }

    try {
      setLoading(true);
      const res = await api.post("/admin/users", {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone,
        role: form.role,
      });
      setResult(res.data);
      setForm({ name: "", email: "", phone: "", role: "admin" });
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (!result?.generatedPassword) return;
    navigator.clipboard.writeText(result.generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New User</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a user with a generated password (shown once)
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              placeholder="01012345678"
              value={form.phone}
              onChange={handleChange}
              maxLength={11}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, role: opt.value })}
                className={`p-3 rounded-lg border text-left transition ${
                  form.role === opt.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-200"
                }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-lg font-semibold transition"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">✓</span>
            <h3 className="text-lg font-bold text-green-800">
              User created successfully
            </h3>
          </div>
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-semibold">{result.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phone</span>
              <span className="font-semibold">{result.phone}</span>
            </div>
            {result.email && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold">{result.email}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Role</span>
              <span className="font-semibold capitalize">{result.role}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="text-xs text-gray-500 font-semibold uppercase mb-2">
                Generated Password (save it now!)
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 text-green-400 px-3 py-2 rounded font-mono text-sm">
                  {result.generatedPassword}
                </code>
                <button
                  onClick={copyPassword}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                ⚠️ This password will not be shown again. Share it securely with
                the user.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
