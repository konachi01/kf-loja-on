import { useMemo, useState } from "react";

const LOGO_URL =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Camiseta Essential Black",
    category: "Camisetas",
    price: 69.9,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    sizes: ["P", "M", "G", "GG"],
    badge: "Mais vendido",
    description: "Camiseta masculina versátil com visual moderno para o dia a dia.",
    promo: false,
    oldPrice: null,
  },
  {
    id: 2,
    name: "Camisa Premium Slim",
    category: "Camisas",
    price: 119.9,
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80",
    sizes: ["M", "G", "GG"],
    badge: "Nova coleção",
    description: "Camisa com corte elegante para ocasiões casuais e sociais.",
    promo: true,
    oldPrice: 149.9,
  },
  {
    id: 3,
    name: "Conjunto Urban Style",
    category: "Conjuntos",
    price: 159.9,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    sizes: ["P", "M", "G"],
    badge: "Tendência",
    description: "Conjunto moderno para quem quer presença e conforto no look.",
    promo: false,
    oldPrice: null,
  },
  {
    id: 4,
    name: "Boné Signature",
    category: "Acessórios",
    price: 49.9,
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80",
    sizes: ["Único"],
    badge: "Oferta",
    description: "Acessório premium para completar o visual masculino.",
    promo: true,
    oldPrice: 69.9,
  },
];

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function emptyProduct() {
  return {
    id: null,
    name: "",
    category: "Camisetas",
    price: "",
    oldPrice: "",
    image: "",
    sizes: "P,M,G,GG",
    badge: "Novo",
    description: "",
    promo: false,
  };
}

export default function KfMultimarcasStore() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(() =>
    Object.fromEntries(INITIAL_PRODUCTS.map((p) => [p.id, p.sizes[0]]))
  );

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLogged, setAdminLogged] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "admin@kf.com",
    password: "123456",
  });
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);

  const categories = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const searchMatch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, search]);

  const addToCart = (product) => {
    const chosenSize = selectedSizes[product.id] || product.sizes[0] || "Único";

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.size === chosenSize
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === chosenSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size: chosenSize,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, size, amount) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity: item.quantity + amount };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const whatsappItems = cart
    .map(
      (item) =>
        `• ${item.name} | Tamanho: ${item.size} | Qtd: ${item.quantity} | ${currency(
          item.price * item.quantity
        )}`
    )
    .join("\n");

  const whatsappMessage = encodeURIComponent(
    cart.length
      ? `Olá! Quero fechar um pedido na KF Multimarcas:\n\n${whatsappItems}\n\nTotal: ${currency(
          totalPrice
        )}`
      : "Olá! Quero atendimento da KF Multimarcas."
  );

  const checkoutLink = `https://wa.me/5527996992922?text=${whatsappMessage}`;

  const handleLogin = () => {
    if (loginData.email === "admin@kf.com" && loginData.password === "123456") {
      setAdminLogged(true);
      setLoginError("");
      return;
    }
    setLoginError("Email ou senha inválidos na demonstração.");
  };

  const resetForm = () => {
    setForm(emptyProduct());
    setEditingId(null);
  };

  const publishProduct = () => {
    if (!form.name || !form.category || !form.price || !form.image) {
      return;
    }

    const parsedSizes = String(form.sizes)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const prepared = {
      id: editingId || Date.now(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      oldPrice: form.promo && form.oldPrice ? Number(form.oldPrice) : null,
      image: form.image,
      sizes: parsedSizes.length ? parsedSizes : ["Único"],
      badge: form.badge || "Novo",
      description: form.description || "Novo produto da coleção KF Multimarcas.",
      promo: Boolean(form.promo),
    };

    if (editingId) {
      setProducts((current) =>
        current.map((item) => (item.id === editingId ? prepared : item))
      );
    } else {
      setProducts((current) => [prepared, ...current]);
    }

    setSelectedSizes((current) => ({
      ...current,
      [prepared.id]: prepared.sizes[0] || "Único",
    }));

    resetForm();
  };

  const editProduct = (product) => {
    setAdminOpen(true);
    setAdminLogged(true);
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      image: product.image,
      sizes: product.sizes.join(","),
      badge: product.badge,
      description: product.description,
      promo: product.promo,
    });
  };

  const duplicateProduct = (product) => {
    setEditingId(null);
    setForm({
      id: null,
      name: `${product.name} Cópia`,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      image: product.image,
      sizes: product.sizes.join(","),
      badge: product.badge,
      description: product.description,
      promo: product.promo,
    });
  };

  const deleteProduct = (id) => {
    setProducts((current) => current.filter((item) => item.id !== id));
    setCart((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const togglePromo = (id) => {
    setProducts((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const nextPromo = !item.promo;
        return {
          ...item,
          promo: nextPromo,
          oldPrice: nextPromo
            ? item.oldPrice || Number((item.price * 1.25).toFixed(2))
            : null,
          badge: nextPromo ? "Promoção" : item.badge === "Promoção" ? "Novo" : item.badge,
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-white/10">
              <img
                src={LOGO_URL}
                alt="KF Multimarcas"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.24em]">KF MULTIMARCAS</p>
              <p className="text-xs text-neutral-400">Loja virtual masculina</p>
            </div>
          </div>

          <div className="hidden flex-1 md:flex md:justify-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto"
              className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminOpen((v) => !v)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
            >
              Painel admin
            </button>
            <a
              href="#carrinho"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black"
            >
              Carrinho ({totalItems})
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-neutral-300">
              Loja virtual pronta para vender
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              Compre online na KF Multimarcas com catálogo, carrinho e pedido rápido.
            </h1>
            <p className="mt-5 max-w-xl text-neutral-300">
              Escolha os produtos, selecione o tamanho, adicione ao carrinho e finalize seu pedido direto no WhatsApp da loja.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#produtos"
                className="rounded-2xl bg-white px-6 py-3 font-medium text-black"
              >
                Ver produtos
              </a>
              <a
                href={checkoutLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white"
              >
                Finalizar no WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
            <div className="grid h-full gap-4 rounded-[1.5rem] border border-white/10 bg-black/40 p-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white p-5 text-black">
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Oferta da semana
                </p>
                <h2 className="mt-3 text-2xl font-semibold">Até 20% off</h2>
                <p className="mt-3 text-sm text-neutral-700">
                  Em peças selecionadas da coleção masculina.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Atendimento
                </p>
                <p className="mt-3 text-2xl font-semibold">(27) 99699-2922</p>
                <p className="mt-3 text-sm text-neutral-300">
                  Loja física em Pinheiros - ES com atendimento rápido pelo WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {adminOpen && (
        <section className="border-b border-white/10 bg-black/30">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {!adminLogged ? (
              <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
                  Acesso do dono
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Login do painel admin</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Nesta demonstração, use o login abaixo para entrar no painel.
                </p>
                <div className="mt-6 grid gap-3">
                  <input
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((c) => ({ ...c, email: e.target.value }))
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Email"
                  />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((c) => ({ ...c, password: e.target.value }))
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Senha"
                  />
                  {loginError ? (
                    <p className="text-sm text-red-300">{loginError}</p>
                  ) : null}
                  <button
                    onClick={handleLogin}
                    className="rounded-2xl bg-white px-5 py-4 font-medium text-black"
                  >
                    Entrar no painel
                  </button>
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-4 text-sm text-neutral-400">
                    Demo: admin@kf.com | 123456
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
                        Painel admin
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold">
                        {editingId ? "Editar produto" : "Adicionar produto"}
                      </h2>
                    </div>
                    <button
                      onClick={resetForm}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
                    >
                      Limpar
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <input
                      value={form.name}
                      onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Nome do produto"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={form.category}
                      onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                      placeholder="Categoria"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={form.price}
                      onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                      type="number"
                      placeholder="Preço atual"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={form.oldPrice}
                      onChange={(e) => setForm((c) => ({ ...c, oldPrice: e.target.value }))}
                      type="number"
                      placeholder="Preço antigo"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={form.image}
                      onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))}
                      placeholder="Link da foto"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none sm:col-span-2"
                    />
                    <input
                      value={form.sizes}
                      onChange={(e) => setForm((c) => ({ ...c, sizes: e.target.value }))}
                      placeholder="Tamanhos: P,M,G,GG"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={form.badge}
                      onChange={(e) => setForm((c) => ({ ...c, badge: e.target.value }))}
                      placeholder="Selo"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={form.promo}
                        onChange={(e) =>
                          setForm((c) => ({ ...c, promo: e.target.checked }))
                        }
                      />
                      Marcar produto em promoção
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, description: e.target.value }))
                      }
                      placeholder="Descrição do produto"
                      className="min-h-[120px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none sm:col-span-2"
                    />
                    <button
                      onClick={publishProduct}
                      className="rounded-2xl bg-white px-5 py-4 font-medium text-black sm:col-span-2"
                    >
                      {editingId ? "Salvar alterações" : "Publicar produto"}
                    </button>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
                        Produtos cadastrados
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold">Gerenciar vitrine</h2>
                    </div>
                    <button
                      onClick={() => {
                        setAdminLogged(false);
                        setAdminOpen(false);
                      }}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
                    >
                      Sair
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-2xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold">{product.name}</h3>
                              {product.promo ? (
                                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-black">
                                  Promoção
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-neutral-400">
                              {product.category}
                            </p>
                            <p className="mt-2 text-sm text-neutral-300">
                              {currency(product.price)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-4">
                          <button
                            onClick={() => editProduct(product)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => togglePromo(product.id)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                          >
                            Marcar promoção
                          </button>
                          <button
                            onClick={() => duplicateProduct(product)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                          >
                            Duplicar base
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
          />
        </div>

        <section id="produtos">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
                Produtos
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                Loja virtual da KF Multimarcas
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${
                    selectedCategory === category
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-lg shadow-black/20"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-80 w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                    {product.promo ? "Promoção" : product.badge}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{product.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-300">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-end gap-3">
                    <p className="text-2xl font-semibold">{currency(product.price)}</p>
                    {product.promo && product.oldPrice ? (
                      <p className="text-sm text-neutral-500 line-through">
                        {currency(product.oldPrice)}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm text-neutral-400">Tamanho</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setSelectedSizes((current) => ({
                              ...current,
                              [product.id]: size,
                            }))
                          }
                          className={`rounded-xl px-3 py-2 text-sm ${
                            selectedSizes[product.id] === size
                              ? "bg-white text-black"
                              : "border border-white/10 bg-black/30 text-white"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="rounded-2xl bg-white px-4 py-3 font-medium text-black"
                    >
                      Adicionar ao carrinho
                    </button>
                    <a
                      href={`https://wa.me/5527996992922?text=${encodeURIComponent(
                        `Olá! Tenho interesse em: ${product.name} | Tamanho: ${
                          selectedSizes[product.id] || product.sizes[0]
                        }`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-medium text-white"
                    >
                      Comprar agora
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="carrinho" className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
                  Carrinho
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Seu pedido</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-neutral-300">
                {totalItems} item(ns)
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-neutral-400">
                  Seu carrinho está vazio. Adicione produtos para começar seu pedido.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="mt-1 text-sm text-neutral-400">
                        Tamanho: {item.size}
                      </p>
                      <p className="mt-2 text-sm text-neutral-300">
                        {currency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, -1)}
                        className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-lg"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, 1)}
                        className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
              Resumo
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Finalizar compra</h2>

            <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Itens</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Subtotal</span>
                <span>{currency(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
                <span>Total</span>
                <span>{currency(totalPrice)}</span>
              </div>
            </div>

            <a
              href={checkoutLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block rounded-2xl bg-white px-5 py-4 text-center font-medium text-black"
            >
              Finalizar pedido no WhatsApp
            </a>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-neutral-300">
              O cliente monta o carrinho no site e envia o pedido pronto para o WhatsApp da loja.
            </div>

            <div className="mt-6 space-y-3 text-sm text-neutral-400">
              <p>Loja física: Rua Santos Dumont, Bairro Domiciano, Pinheiros - ES</p>
              <p>Instagram: @kfmul.timarcas</p>
              <p>WhatsApp: (27) 99699-2922</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
