import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Simple Product Catalog Web App
 * - Login (Admin / Agent)
 * - Add / Edit products (Admin)
 * - Product list with image, price, description
 * - WhatsApp Share button
 * - Data persisted in localStorage
 *
 * Default logins:
 * - Admin: username "admin", password "admin123"
 * - Agent: username "agent", password "agent123"
 */

const STORAGE_KEY = "catalogAppDataV1";

const defaultData = {
  users: [
    { id: "u1", role: "admin", username: "admin", password: "admin123", name: "Admin" },
    { id: "u2", role: "agent", username: "agent", password: "agent123", name: "Agent" },
  ],
  products: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    // basic shape guard
    if (!parsed.users || !parsed.products) return defaultData;
    return parsed;
  } catch (e) {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function useLocalData() {
  const [data, setData] = useState(() => loadData());
  useEffect(() => saveData(data), [data]);
  return [data, setData];
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const db = loadData();
    const user = db.users.find((u) => u.username === username && u.password === password);
    if (!user) {
      setError("Galat username ya password. Baraye meherbani dubara koshish karein.");
      return;
    }
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-slate-800">Product Catalog – Login</h1>
        <p className="text-slate-500 mt-1">Admin ya Agent ke tor par login karein.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin ya agent"
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full rounded-xl shadow p-3 font-semibold bg-slate-900 text-white hover:opacity-90">Login</button>
          <div className="text-xs text-slate-500 mt-2">
            <p><b>Admin</b>: admin / admin123</p>
            <p><b>Agent</b>: agent / agent123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

function TopBar({ user, onLogout }) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">📦 Catalog</span>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border">{user.role.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">Welcome, <b>{user.name || user.username}</b></span>
          <button onClick={onLogout} className="rounded-xl border px-3 py-1.5 hover:bg-slate-50">Logout</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, canEdit, onEdit, onDelete }) {
  const shareText = `*${product.name}*\nPrice: ${product.price}\n${product.description || ""}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Details copy ho gaye. WhatsApp me paste kar saktay ho.");
    } catch (e) {
      alert("Copy nahi ho saka. Browser permissions check karein.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      {product.image && (
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-sm">{product.price}</span>
        </div>
        {product.description && (
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.description}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <a href={waLink} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 border hover:bg-slate-50">Share on WhatsApp</a>
          <button onClick={copyToClipboard} className="rounded-xl px-3 py-2 border hover:bg-slate-50">Copy details</button>
          {canEdit && (
            <>
              <button onClick={onEdit} className="rounded-xl px-3 py-2 border hover:bg-slate-50">Edit</button>
              <button onClick={onDelete} className="rounded-xl px-3 py-2 border text-red-600 hover:bg-red-50">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ initial, onCancel, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [image, setImage] = useState(initial?.image || "");
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Name aur Price lazmi hai.");
      return;
    }
    onSave({ name, price, description, image });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border p-3" placeholder="Item ka naam" />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded-xl border p-3" placeholder="Rs 1200 / $10" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border p-3 min-h-[90px]" placeholder="Choti si tafseel" />
      </div>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div>
          <label className="block text-sm font-medium">Image (upload ya URL)</label>
          <div className="flex gap-2 mt-1">
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="block w-full text-sm"
            />
          </div>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-2 w-full rounded-xl border p-3"
            placeholder="https://... (optional)"
          />
        </div>
        <div>
          <div className="text-sm text-slate-600 mb-2">Preview</div>
          <div className="aspect-video w-full overflow-hidden rounded-xl border bg-slate-50 flex items-center justify-center">
            {image ? (
              <img src={image} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400">No image</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2">Save</button>
        <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2">Cancel</button>
      </div>
    </form>
  );
}

function AdminPanel({ data, setData }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.products;
    return data.products.filter((p) =>
      [p.name, p.price, p.description].some((x) => (x || "").toLowerCase().includes(q))
    );
  }, [data.products, search]);

  const createProduct = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const onSave = (p) => {
    if (editing) {
      setData({
        ...data,
        products: data.products.map((x) => (x.id === editing.id ? { ...x, ...p } : x)),
      });
    } else {
      const newP = { id: crypto.randomUUID(), createdAt: Date.now(), ...p };
      setData({ ...data, products: [newP, ...data.products] });
    }
    setOpenForm(false);
  };

  const onDelete = (id) => {
    if (!confirm("Kya aap sure hain?")) return;
    setData({ ...data, products: data.products.filter((p) => p.id !== id) });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border p-3"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={createProduct} className="rounded-xl bg-slate-900 text-white px-4 py-2">+ Add Product</button>
          <button onClick={() => setData(defaultData)} className="rounded-xl border px-4 py-2" title="Reset users & empty products">Reset App</button>
        </div>
      </div>

      {openForm && (
        <div className="mb-6 rounded-2xl border p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">{editing ? "Edit Product" : "Add New Product"}</h2>
          <ProductForm initial={editing} onCancel={() => setOpenForm(false)} onSave={onSave} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            canEdit
            onEdit={() => {
              setEditing(p);
              setOpenForm(true);
            }}
            onDelete={() => onDelete(p.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-slate-500 p-10 border rounded-2xl bg-white">
          Abhi koi product nahi. "Add Product" par click kar ke item add karein.
        </div>
      )}
    </div>
  );
}

function AgentView({ data }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.products;
    return data.products.filter((p) =>
      [p.name, p.price, p.description].some((x) => (x || "").toLowerCase().includes(q))
    );
  }, [data.products, search]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border p-3"
        />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-slate-500 p-10 border rounded-2xl bg-white">
          Products nazar nahi aa rahe. Admin se items add karne ko kahain.
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [data, setData] = useLocalData();
  const [user, setUser] = useState(null);

  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar user={user} onLogout={handleLogout} />
      {user.role === "admin" ? (
        <AdminPanel data={data} setData={setData} />
      ) : (
        <AgentView data={data} />
      )}
      <footer className="text-center text-xs text-slate-500 py-6">
        Built for quick catalogs • Data stays in your browser (localStorage)
      </footer>
    </div>
  );
}
