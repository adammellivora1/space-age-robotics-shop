import React, { useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe2,
  Minus,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
  Zap
} from "lucide-react"
import "./styles.css"

const BASE = import.meta.env.BASE_URL

const products = [
  {
    id: "sar-x1",
    name: "SAR-X1 Explorer",
    category: "ROBOTICS",
    price: 2499,
    icon: Bot,
    code: "SAR-X1",
    description: "Autonomous exploration platform for research, inspection and advanced robotics projects."
  },
  {
    id: "sar-x2",
    name: "SAR-X2 Industrial",
    category: "ROBOTICS",
    price: 3499,
    icon: Bot,
    code: "SAR-X2",
    description: "Heavy-duty autonomous robotics platform built for industrial environments."
  },
  {
    id: "orbital-scout",
    name: "ORBITAL Scout",
    category: "SPACE TECH",
    price: 1899,
    icon: Rocket,
    code: "ORB-S01",
    description: "Compact autonomous scouting system inspired by next-generation space robotics."
  },
  {
    id: "lunar-rover",
    name: "LUNAR Rover Kit",
    category: "ROBOTICS",
    price: 1299,
    icon: Rocket,
    code: "LR-KIT",
    description: "Modular rover platform for education, prototyping and autonomous navigation."
  },
  {
    id: "mars-sensor",
    name: "MARS Habitat Sensor",
    category: "SPACE TECH",
    price: 399,
    icon: Globe2,
    code: "MHS-01",
    description: "Environmental monitoring sensor package for remote and extreme environments."
  },
  {
    id: "astra-vision",
    name: "ASTRA Vision",
    category: "AI SYSTEMS",
    price: 649,
    icon: BrainCircuit,
    code: "AST-V01",
    description: "Computer-vision processing system for autonomous machines and robotics."
  },
  {
    id: "nova-ai",
    name: "NOVA AI Core",
    category: "AI SYSTEMS",
    price: 899,
    icon: Cpu,
    code: "NOVA-01",
    description: "Edge AI computing platform designed for autonomous robotic applications."
  },
  {
    id: "neural-edge",
    name: "NEURAL EDGE",
    category: "AI SYSTEMS",
    price: 1499,
    icon: BrainCircuit,
    code: "NED-01",
    description: "High-performance edge intelligence module for real-time AI inference."
  },
  {
    id: "titan-platform",
    name: "TITAN Autonomous Platform",
    category: "ROBOTICS",
    price: 7990,
    icon: Bot,
    code: "TITAN-01",
    description: "Large autonomous robotics platform for industrial and research applications."
  },
  {
    id: "sar-drone",
    name: "SAR Drone Scout",
    category: "SPACE TECH",
    price: 2190,
    icon: Rocket,
    code: "DRN-S01",
    description: "Autonomous aerial scouting platform with intelligent navigation capabilities."
  },
  {
    id: "space-arm",
    name: "SPACE ARM X1",
    category: "ROBOTICS",
    price: 4590,
    icon: Bot,
    code: "SAX-01",
    description: "Precision robotic arm concept for laboratories, automation and space systems."
  },
  {
    id: "autonomy-core",
    name: "AUTONOMY CORE",
    category: "AI SYSTEMS",
    price: 1990,
    icon: Zap,
    code: "ATC-01",
    description: "Autonomous control and decision engine for advanced robotic platforms."
  }
]

const categories = ["ALL", "ROBOTICS", "AI SYSTEMS", "SPACE TECH"]

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value)
}

function App() {
  const [category, setCategory] = useState("ALL")
  const [query, setQuery] = useState("")
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()

    return products.filter((product) => {
      const categoryMatch =
        category === "ALL" || product.category === category

      const queryMatch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.code.toLowerCase().includes(q)

      return categoryMatch && queryMatch
    })
  }, [category, query])

  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id)
      return product ? { ...product, quantity: item.quantity } : null
    })
    .filter(Boolean)

  const itemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const shipping = subtotal === 0 ? 0 : subtotal >= 2500 ? 0 : 49
  const total = subtotal + shipping

  function addToCart(id) {
    setCart((current) => {
      const existing = current.find((item) => item.id === id)

      if (existing) {
        return current.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...current, { id, quantity: 1 }]
    })

    setCartOpen(true)
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function removeItem(id) {
    setCart((current) => current.filter((item) => item.id !== id))
  }

  async function checkout() {
    setCheckoutError("")

    const endpoint = import.meta.env.VITE_CHECKOUT_API

    if (!endpoint) {
      setCheckoutError(
        "Checkout is not connected yet. Add VITE_CHECKOUT_API to connect Stripe Checkout."
      )
      return
    }

    setCheckoutLoading(true)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout could not be started.")
      }

      window.location.href = data.url
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Checkout could not be started."
      )
      setCheckoutLoading(false)
    }
  }

  const success =
    new URLSearchParams(window.location.search).get("checkout") === "success"

  return (
    <div className="site">
      {success && (
        <div className="successBanner">
          <ShieldCheck size={18} />
          Payment completed successfully. Thank you for your order.
        </div>
      )}

      <header className="header">
        <a href="#top" className="brand">
          <img
            className="brandLogo"
            src={`${BASE}logo.jpg`}
            alt="Space Age Robotics"
          />
          <div>
            <strong>SPACE AGE ROBOTICS</strong>
            <span>ADVANCED SYSTEMS / FUTURE TECHNOLOGY</span>
          </div>
        </a>

        <nav className="nav">
          <a href="#shop">SHOP</a>
          <a href="#mission">MISSION</a>
          <a href="#technology">TECHNOLOGY</a>
        </nav>

        <button
          className="cartButton"
          onClick={() => setCartOpen(true)}
          aria-label="Open shopping cart"
        >
          <ShoppingCart size={19} />
          <span>CART</span>
          {itemCount > 0 && <b>{itemCount}</b>}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="heroGrid">
            <div className="heroCopy">
              <div className="eyebrow">
                <span />
                NEXT GENERATION ROBOTICS
              </div>

              <h1>
                BUILD THE
                <br />
                <em>FUTURE.</em>
              </h1>

              <p>
                Advanced robotics, autonomous intelligence and space-grade
                technology for the next generation of builders.
              </p>

              <div className="heroActions">
                <a className="primaryButton" href="#shop">
                  EXPLORE SYSTEMS
                  <ArrowRight size={18} />
                </a>

                <a className="secondaryButton" href="#mission">
                  OUR MISSION
                </a>
              </div>

              <div className="heroStats">
                <div>
                  <strong>12+</strong>
                  <span>ADVANCED SYSTEMS</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>AUTONOMOUS</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>POSSIBILITIES</span>
                </div>
              </div>
            </div>

            <div className="heroVisual">
              <div className="orbit orbitOne" />
              <div className="orbit orbitTwo" />
              <div className="heroCore">
                <Bot size={92} strokeWidth={1.1} />
                <span>SAR / CORE-01</span>
              </div>
              <div className="scanLine" />
              <div className="techLabel labelOne">AI CONTROL</div>
              <div className="techLabel labelTwo">AUTONOMY</div>
              <div className="techLabel labelThree">SPACE GRADE</div>
            </div>
          </div>
        </section>

        <section className="ticker">
          <div>
            <Sparkles size={15} />
            AUTONOMOUS SYSTEMS
            <span>•</span>
            ARTIFICIAL INTELLIGENCE
            <span>•</span>
            SPACE TECHNOLOGY
            <span>•</span>
            ROBOTICS
            <span>•</span>
            AUTONOMOUS SYSTEMS
          </div>
        </section>

        <section className="section" id="shop">
          <div className="sectionHeader">
            <div>
              <div className="eyebrow">
                <span />
                THE COLLECTION
              </div>
              <h2>ENGINEERED FOR TOMORROW.</h2>
            </div>

            <p>
              Explore our growing collection of robotics and AI systems
              designed for ambitious builders.
            </p>
          </div>

          <div className="shopTools">
            <div className="categories">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="searchBox">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="SEARCH SYSTEMS..."
              />
            </label>
          </div>

          <div className="productGrid">
            {filteredProducts.map((product) => {
              const Icon = product.icon

              return (
                <article className="productCard" key={product.id}>
                  <div className="productVisual">
                    <div className="productCorner">SAR / {product.code}</div>
                    <Icon size={70} strokeWidth={1} />
                    <div className="productGlow" />
                  </div>

                  <div className="productInfo">
                    <span className="productCategory">
                      {product.category}
                    </span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>

                    <div className="productBottom">
                      <strong>{money(product.price)}</strong>
                      <button onClick={() => addToCart(product.id)}>
                        ADD TO CART
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="emptySearch">
              <Search size={32} />
              <h3>NO SYSTEMS FOUND</h3>
              <p>Try another search or category.</p>
            </div>
          )}
        </section>

        <section className="technology" id="technology">
          <div className="techContent">
            <div className="eyebrow">
              <span />
              THE TECHNOLOGY
            </div>

            <h2>
              INTELLIGENCE
              <br />
              <em>WITHOUT LIMITS.</em>
            </h2>

            <p>
              We combine robotics, artificial intelligence, autonomous
              navigation and advanced sensing to create machines capable of
              operating in the real world.
            </p>

            <div className="techFeatures">
              <div>
                <BrainCircuit />
                <strong>AI SYSTEMS</strong>
                <span>Real-time machine intelligence.</span>
              </div>

              <div>
                <Bot />
                <strong>ROBOTICS</strong>
                <span>Physical autonomy and control.</span>
              </div>

              <div>
                <Rocket />
                <strong>SPACE TECH</strong>
                <span>Designed beyond Earth.</span>
              </div>
            </div>
          </div>

          <div className="techDiagram">
            <div className="diagramCore">
              <Cpu size={54} />
              <span>AI CORE</span>
            </div>
            <div className="diagramRing ringA" />
            <div className="diagramRing ringB" />
            <div className="diagramNode nodeA">VISION</div>
            <div className="diagramNode nodeB">CONTROL</div>
            <div className="diagramNode nodeC">NAVIGATION</div>
            <div className="diagramNode nodeD">AUTONOMY</div>
          </div>
        </section>

        <section className="mission" id="mission">
          <div className="missionNumber">01</div>
          <div>
            <div className="eyebrow">
              <span />
              OUR MISSION
            </div>
            <h2>MAKE THE FUTURE REAL.</h2>
            <p>
              Space Age Robotics exists to make advanced robotics and
              autonomous technology accessible to engineers, companies,
              researchers and future builders.
            </p>
          </div>
        </section>

        <section className="newsletter">
          <div>
            <div className="eyebrow">
              <span />
              SAR INTELLIGENCE
            </div>
            <h2>STAY AHEAD OF THE CURVE.</h2>
            <p>
              New systems, robotics technology and future projects.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.currentTarget.reset()
              alert("You are on the SAR intelligence list.")
            }}
          >
            <input type="email" placeholder="YOUR EMAIL ADDRESS" required />
            <button type="submit">
              SUBSCRIBE
              <ArrowRight size={17} />
            </button>
          </form>
        </section>
      </main>

      <footer>
        <div className="footerBrand">
          <img src={`${BASE}logo.jpg`} alt="" />
          <strong>SPACE AGE ROBOTICS</strong>
        </div>
        <span>© 2026 SPACE AGE ROBOTICS. ALL SYSTEMS NOMINAL.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      {cartOpen && (
        <div className="cartBackdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cartPanel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cartHeader">
              <div>
                <span className="eyebrow">
                  <span />
                  YOUR ORDER
                </span>
                <h2>SHOPPING CART</h2>
              </div>

              <button
                className="iconButton"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                <X />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="emptyCart">
                <ShoppingCart size={48} strokeWidth={1} />
                <h3>YOUR CART IS EMPTY</h3>
                <p>Add a system from the collection to begin.</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="primaryButton"
                >
                  EXPLORE SHOP
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <>
                <div className="cartItems">
                  {cartItems.map((item) => {
                    const Icon = item.icon

                    return (
                      <div className="cartItem" key={item.id}>
                        <div className="cartItemIcon">
                          <Icon size={28} />
                        </div>

                        <div className="cartItemInfo">
                          <span>{item.category}</span>
                          <strong>{item.name}</strong>
                          <b>{money(item.price)}</b>

                          <div className="quantity">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                            >
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              className="removeButton"
                              onClick={() => removeItem(item.id)}
                              title="Remove"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="cartSummary">
                  <div>
                    <span>SUBTOTAL</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div>
                    <span>SHIPPING</span>
                    <strong>
                      {shipping === 0 ? "FREE" : money(shipping)}
                    </strong>
                  </div>

                  <div className="cartTotal">
                    <span>TOTAL</span>
                    <strong>{money(total)}</strong>
                  </div>

                  {checkoutError && (
                    <div className="checkoutError">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    className="checkoutButton"
                    onClick={checkout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading
                      ? "CONNECTING TO CHECKOUT..."
                      : "PROCEED TO CHECKOUT"}
                    {!checkoutLoading && <ArrowRight size={18} />}
                  </button>

                  <small>
                    Secure checkout will be handled by our payment provider.
                  </small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById("root")).render(<App />)