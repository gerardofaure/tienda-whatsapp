import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import logoBodeguita from "./assets/logo-mitienda.png";

const WHATSAPP_NUMBER = "56987231623";
const ADMIN_USER = "admin";
const ADMIN_PASS = "123";

const INITIAL_PRODUCTS = [
  {
    id: crypto.randomUUID(),
    name: "Pepinillos Dill",
    description: "Pepinillos encurtidos crocantes en vinagre.",
    price: 2990,
    category: "ENCURTIDOS",
    image:
      "https://images.unsplash.com/photo-1603048719539-9ecb4b2a19fd?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Huevos de campo",
    description: "Docena de huevos frescos.",
    price: 4290,
    category: "HUEVOS",
    image:
      "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Atún en agua",
    description: "Lata de atún premium 170g.",
    price: 1890,
    category: "PRODUCTOS DEL MAR",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Chocolate amargo",
    description: "Barra 70% cacao, dulce y salado gourmet.",
    price: 3590,
    category: "DULCES Y SALADOS",
    image:
      "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Arvejas congeladas",
    description: "Bolsa 1kg, congelado premium.",
    price: 2790,
    category: "CONGELADOS",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Detergente líquido",
    description: "Limpieza hogar 3L.",
    price: 5990,
    category: "ASEO",
    image:
      "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Limpiaparabrisas",
    description: "Fluido automotriz 1L.",
    price: 3490,
    category: "AUTOMOTRIZ",
    image:
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: crypto.randomUUID(),
    name: "Pasta Spaghetti",
    description: "Pasta de trigo durum 400g.",
    price: 1490,
    category: "DESPENSA",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    inStock: true,
  },
];

const CATEGORIES = [
  "TODOS",
  "HUEVOS",
  "DESPENSA",
  "ENCURTIDOS",
  "DULCES Y SALADOS",
  "PRODUCTOS DEL MAR",
  "CONGELADOS",
  "ASEO",
  "AUTOMOTRIZ",
];

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function ProductCard({
  product,
  quantityInCart = 0,
  onIncrement,
  onDecrement,
}) {
  const isOutOfStock = product.inStock === false;
  const hasInCart = quantityInCart > 0;

  return (
    <div className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/600x400?text=Sin+Imagen";
          }}
        />
        {isOutOfStock && <div className="stock-badge-overlay">SIN STOCK</div>}
      </div>

      <div className="product-content">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-tags-row">
          <div className="product-category">{product.category}</div>
          {!product.inStock && <div className="stock-pill">Sin stock</div>}
        </div>

        <div className="product-bottom">
          <div className="product-price">{formatCLP(product.price)}</div>

          <div className="qty-and-add">
            <div className={`qty-control ${isOutOfStock ? "disabled" : ""}`}>
              <button
                type="button"
                onClick={() => onDecrement(product)}
                aria-label={`Quitar una unidad de ${product.name}`}
                disabled={isOutOfStock || quantityInCart <= 0}
                title={quantityInCart <= 0 ? "Aún no está en el carrito" : "Quitar 1"}
              >
                −
              </button>

              <span className={hasInCart ? "qty-in-cart" : ""}>
                {quantityInCart}
              </span>

              <button
                type="button"
                onClick={() => onIncrement(product)}
                aria-label={`Agregar una unidad de ${product.name}`}
                disabled={isOutOfStock}
                title={isOutOfStock ? "Producto sin stock" : "Agregar 1"}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartModal({
  open,
  items,
  products,
  onClose,
  onChangeQty,
  onRemove,
  onClear,
  onCheckout,
  customerName,
  customerAddress,
  deliveryReference,
  paymentMethod,
  onCustomerNameChange,
  onCustomerAddressChange,
  onDeliveryReferenceChange,
  onPaymentMethodChange,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const detailedItems = items
    .map((it) => {
      const product = products.find((p) => p.id === it.productId);
      if (!product) return null;
      return { ...it, product };
    })
    .filter(Boolean);

  const total = detailedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const hasItems = detailedItems.length > 0;

  return (
    <div
      className="cart-modal-overlay"
      onMouseDown={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="cart-modal-panel"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cart-header">
          <h2>Carro</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar carro"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="cart-body">
          {!hasItems ? (
            <p className="empty-cart">Tu carro está vacío.</p>
          ) : (
            detailedItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/120x120?text=Sin+Imagen";
                  }}
                />

                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">
                    {formatCLP(item.product.price)}
                  </div>

                  {!item.product.inStock && (
                    <div className="cart-item-warning">
                      Este producto quedó sin stock
                    </div>
                  )}

                  <div className="cart-item-controls">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeQty(item.productId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeQty(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => onRemove(item.productId)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  {formatCLP(item.product.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer compact-form">
          <div className="cart-form-grid">
            <div className="field compact-field" style={{ marginTop: 0 }}>
              <label>Nombre</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <div className="field compact-field" style={{ marginTop: 0 }}>
              <label>Medio de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
              >
                <option value="EFECTIVO">Efectivo contra entrega</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            <div
              className="field compact-field cart-field-full"
              style={{ marginTop: 0 }}
            >
              <label>Dirección</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => onCustomerAddressChange(e.target.value)}
                placeholder="Dirección"
              />
            </div>

            <div
              className="field compact-field cart-field-full"
              style={{ marginTop: 0 }}
            >
              <label>Referencia</label>
              <input
                type="text"
                value={deliveryReference}
                onChange={(e) => onDeliveryReferenceChange(e.target.value)}
                placeholder="Ej: portón negro, casa esquina..."
              />
            </div>
          </div>

          <div className="cart-total">
            <span>Total</span>
            <strong>{formatCLP(total)}</strong>
          </div>

          <div className="cart-actions">
            <button type="button" className="secondary-btn" onClick={onClear}>
              Vaciar
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={onCheckout}
              disabled={!hasItems}
              title={!hasItems ? "El carro está vacío" : "Enviar pedido por WhatsApp"}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLoginModal({ open, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setUsername("");
      setPassword("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      setError("");
      onLoginSuccess();
      return;
    }

    setError("Usuario o contraseña incorrectos.");
  };

  return (
    <div className="admin-overlay" onMouseDown={onClose}>
      <div className="admin-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Login Admin</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Usuario</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123"
            />
          </div>

          <div className="field">
            <small className="field-help">
              Demo: usuario <b>admin</b> / clave <b>123</b>
            </small>
            {error && <small className="field-help danger-text">{error}</small>}
          </div>

          <div className="admin-actions">
            <button type="submit" className="primary-btn">
              Ingresar
            </button>
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminEditor({
  open,
  onClose,
  products,
  onCreate,
  onUpdate,
  onDelete,
  onLogout,
}) {
  const [mode, setMode] = useState("create");
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "DESPENSA",
    image: "",
    inStock: true,
  });

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setSelectedId("");
      setForm({
        name: "",
        description: "",
        price: "",
        category: "DESPENSA",
        image: "",
        inStock: true,
      });
    }
  }, [open, mode]);

  useEffect(() => {
    if (mode !== "edit" || !selectedId) return;
    const p = products.find((x) => x.id === selectedId);
    if (!p) return;

    setForm({
      name: p.name || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      category: p.category || "DESPENSA",
      image: p.image || "",
      inStock: p.inStock !== false,
    });
  }, [mode, selectedId, products]);

  if (!open) return null;

  const categoriesWithoutTodos = CATEGORIES.filter((c) => c !== "TODOS");

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim(),
      inStock: Boolean(form.inStock),
    };

    if (!payload.name || !payload.description || !payload.image) {
      alert("Completa nombre, descripción e imagen.");
      return;
    }

    if (Number.isNaN(payload.price) || payload.price < 0) {
      alert("Ingresa un precio válido.");
      return;
    }

    if (mode === "create") {
      onCreate(payload);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "DESPENSA",
        image: "",
        inStock: true,
      });
      alert("Producto agregado.");
      return;
    }

    if (!selectedId) {
      alert("Selecciona un producto para editar.");
      return;
    }

    onUpdate(selectedId, payload);
    alert("Producto actualizado.");
  };

  const handleDelete = () => {
    if (!selectedId) {
      alert("Selecciona un producto para eliminar.");
      return;
    }

    const p = products.find((x) => x.id === selectedId);
    const ok = window.confirm(`¿Eliminar "${p?.name || "producto"}"?`);
    if (!ok) return;

    onDelete(selectedId);
    setSelectedId("");
    setMode("create");
  };

  return (
    <div className="admin-overlay" onMouseDown={onClose}>
      <div className="admin-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Editor de productos (Admin)</h2>
          <div className="admin-header-actions">
            <button type="button" className="secondary-btn" onClick={onLogout}>
              Salir
            </button>
            <button type="button" className="icon-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <button
            type="button"
            className={mode === "create" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("create")}
          >
            Agregar nuevo
          </button>

          <button
            type="button"
            className={mode === "edit" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("edit")}
          >
            Editar / Eliminar
          </button>
        </div>

        {mode === "edit" && (
          <div className="field">
            <label>Producto existente</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Selecciona un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.category} {p.inStock === false ? "(Sin stock)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Aceitunas verdes"
            />
          </div>

          <div className="field">
            <label>Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Descripción breve del producto"
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Precio (CLP)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="2990"
              />
            </div>

            <div className="field">
              <label>Categoría</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {categoriesWithoutTodos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>URL de imagen</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, inStock: e.target.checked }))
                }
              />
              <span>Disponible en stock</span>
            </label>
            {!form.inStock && (
              <small className="field-help danger-text">
                Este producto se mostrará como "Sin stock" y no se podrá agregar al
                carro.
              </small>
            )}
          </div>

          <div className="admin-actions">
            <button type="submit" className="primary-btn">
              {mode === "create" ? "Agregar producto" : "Guardar cambios"}
            </button>

            {mode === "edit" && (
              <button
                type="button"
                className="danger-btn"
                onClick={handleDelete}
              >
                Eliminar producto
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("app_products");
      const parsed = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      return parsed.map((p) => ({
        ...p,
        inStock: p.inStock !== false,
      }));
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("app_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [cartOpen, setCartOpen] = useState(false);

  const [adminLogged, setAdminLogged] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminEditorOpen, setAdminEditorOpen] = useState(false);

  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryReference, setDeliveryReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

  useEffect(() => {
    localStorage.setItem("app_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("app_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    setMobileCategoriesOpen(false);
  }, [selectedCategory]);

  const detailedCartItems = useMemo(() => {
    return cartItems
      .map((it) => {
        const product = products.find((p) => p.id === it.productId);
        if (!product) return null;
        return { ...it, product };
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const filteredProducts = useMemo(() => {
    const searchNorm = normalizeText(search);

    return products.filter((p) => {
      const categoryOk =
        selectedCategory === "TODOS" || p.category === selectedCategory;

      if (!searchNorm) return categoryOk;

      const haystack = normalizeText(`${p.name} ${p.description} ${p.category}`);
      return categoryOk && haystack.includes(searchNorm);
    });
  }, [products, search, selectedCategory]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartQtyByProductId = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.productId] = item.quantity;
    }
    return map;
  }, [cartItems]);

  const incrementProductInCart = (product) => {
    if (!product || product.inStock === false) return;

    setCartItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);

      if (existing) {
        return prev.map((it) =>
          it.productId === product.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      }

      return [...prev, { productId: product.id, quantity: 1 }];
    });
  };

  const decrementProductInCart = (product) => {
    if (!product) return;

    setCartItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (!existing) return prev;

      const nextQty = existing.quantity - 1;
      if (nextQty <= 0) {
        return prev.filter((it) => it.productId !== product.id);
      }

      return prev.map((it) =>
        it.productId === product.id ? { ...it, quantity: nextQty } : it
      );
    });
  };

  const handleCartQtyChange = (productId, nextQty) => {
    setCartItems((prev) => {
      if (nextQty <= 0) return prev.filter((it) => it.productId !== productId);
      return prev.map((it) =>
        it.productId === productId ? { ...it, quantity: nextQty } : it
      );
    });
  };

  const handleCartRemove = (productId) => {
    setCartItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const handleCartClear = () => setCartItems([]);

  const handleCreateProduct = (payload) => {
    setProducts((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev]);
  };

  const handleUpdateProduct = (id, payload) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
    );
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCartItems((prev) => prev.filter((it) => it.productId !== id));
  };

  const handleCheckout = () => {
    if (detailedCartItems.length === 0) {
      alert("Tu carro está vacío.");
      return;
    }

    const availableItems = detailedCartItems.filter(
      (item) => item.product.inStock !== false
    );
    const unavailableItems = detailedCartItems.filter(
      (item) => item.product.inStock === false
    );

    if (availableItems.length === 0) {
      alert("Todos los productos del carro están sin stock.");
      return;
    }

    const total = availableItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const paymentLabel =
      paymentMethod === "TRANSFERENCIA"
        ? "Transferencia"
        : "Efectivo contra entrega";

    const lines = [];
    lines.push("🧾 Pedido Mi Tienda");
    lines.push("");
    lines.push("Detalle:");

    availableItems.forEach((item) => {
      lines.push(
        `${item.quantity} x ${item.product.name} (${formatCLP(item.product.price)})`
      );
    });

    lines.push(`Total: ${formatCLP(total)}`);

    if (unavailableItems.length > 0) {
      lines.push("");
      lines.push("Sin stock (no incluidos):");
      unavailableItems.forEach((item) => {
        lines.push(`- ${item.quantity} x ${item.product.name}`);
      });
    }

    lines.push("");
    lines.push(`Nombre: ${customerName.trim()}`);
    lines.push(`Dirección: ${customerAddress.trim()}`);
    lines.push(`Referencia: ${deliveryReference.trim()}`);
    lines.push(`Medio de pago: ${paymentLabel}`);

    const message = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAdminClick = () => {
    if (adminLogged) {
      setAdminEditorOpen(true);
      return;
    }
    setAdminLoginOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    setAdminLogged(true);
    setAdminLoginOpen(false);
    setAdminEditorOpen(true);
  };

  const handleAdminLogout = () => {
    setAdminLogged(false);
    setAdminEditorOpen(false);
    setAdminLoginOpen(false);
  };

  return (
    <div className="app-shell">
      <section className="branding-hero" aria-label="Encabezado de la tienda">
        <img
          src={logoBodeguita}
          alt="Logo Mi Tienda"
          className="branding-logo"
        />
        <h1 className="branding-title">
          Mi Tienda - Lo mejor para tu familia.
        </h1>
      </section>

      <header className="topbar">
        <div className="brand">Mi Tienda Online</div>

        <div className="search-wrap">
          <input
            type="text"
            placeholder="Buscar por palabra (sin importar acentos)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="top-actions">
          <button
            type="button"
            className="mobile-category-toggle"
            onClick={() => setMobileCategoriesOpen((v) => !v)}
            aria-expanded={mobileCategoriesOpen}
          >
            Categorías
          </button>

          <button
            type="button"
            className="admin-btn"
            onClick={handleAdminClick}
            title={adminLogged ? "Abrir editor admin" : "Ingresar como admin"}
          >
            {adminLogged ? "Admin ✓" : "Admin"}
          </button>

          <button
            type="button"
            className="cart-icon-btn"
            onClick={() => setCartOpen(true)}
            aria-label="Abrir carro"
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main className="layout">
        <aside
          className={`sidebar ${mobileCategoriesOpen ? "mobile-open" : ""}`}
          aria-label="Categorías"
        >
          <h3 className="sidebar-title">Categorías</h3>

          <div className="category-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  selectedCategory === cat ? "category-btn active" : "category-btn"
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <section className="products-section">
          <div className="products-header">
            <div>
              <strong>{filteredProducts.length}</strong> productos
            </div>
            <div className="current-filter">
              Categoría: <strong>{selectedCategory}</strong>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              No hay productos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={cartQtyByProductId[product.id] || 0}
                  onIncrement={incrementProductInCart}
                  onDecrement={decrementProductInCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          DESPACHO GRATIS EN ZONAS CENTRALES DE LA COMUNA.
        </p>
        <p>PAGO EN EFECTIVO O TRANSFERENCIA CONTRA ENTREGA</p>
        <p>INFO: +56987231623</p>
      </footer>

      <CartModal
        open={cartOpen}
        items={cartItems}
        products={products}
        onClose={() => setCartOpen(false)}
        onChangeQty={handleCartQtyChange}
        onRemove={handleCartRemove}
        onClear={handleCartClear}
        onCheckout={handleCheckout}
        customerName={customerName}
        customerAddress={customerAddress}
        deliveryReference={deliveryReference}
        paymentMethod={paymentMethod}
        onCustomerNameChange={setCustomerName}
        onCustomerAddressChange={setCustomerAddress}
        onDeliveryReferenceChange={setDeliveryReference}
        onPaymentMethodChange={setPaymentMethod}
      />

      <AdminLoginModal
        open={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <AdminEditor
        open={adminEditorOpen}
        onClose={() => setAdminEditorOpen(false)}
        products={products}
        onCreate={handleCreateProduct}
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        onLogout={handleAdminLogout}
      />
    </div>
  );
}