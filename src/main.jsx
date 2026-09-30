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
                  <strong>âˆž</strong>
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
            <span>â€¢</span>
            ARTIFICIAL INTELLIGENCE
            <span>â€¢</span>
            SPACE TECHNOLOGY
            <span>â€¢</span>
            ROBOTICS
            <span>â€¢</span>
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
                  <section id="engineering" className="engineeringSection">

        <div className="engineeringOrb engineeringOrbOne"></div>
        <div className="engineeringOrb engineeringOrbTwo"></div>

        <div className="engineeringHero">
          <div className="engineeringHeroText">
            <div className="engineeringEyebrow">
              <span className="engineeringStatus"></span>
              ENGINEERING / SOFTWARE / AI
            </div>

            <h2>
              Engineering the
              <span> Intelligent Future.</span>
            </h2>

            <p className="engineeringLead">
              Beyond Robotics — advanced software, AI, automation and
              engineering systems built for the next generation of technology.
            </p>

            <div className="engineeringHeroLine"></div>

            <p className="engineeringDescription">
              From autonomous machines and artificial intelligence to
              cybersecurity, embedded systems and cloud infrastructure —
              we design technology around real-world requirements.
            </p>
          </div>

          <div className="engineeringVisual">
            <div className="engineeringCore">
              <div className="coreRing coreRingOne"></div>
              <div className="coreRing coreRingTwo"></div>
              <div className="coreRing coreRingThree"></div>

              <div className="coreCenter">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M50 12 L78 28 L78 62 L50 78 L22 62 L22 28 Z"/>
                  <path d="M50 28 L65 37 L65 55 L50 64 L35 55 L35 37 Z"/>
                  <circle cx="50" cy="46" r="7"/>
                </svg>
              </div>

              <span className="coreLabel">SAR / AI CORE</span>
            </div>
          </div>
        </div>

        <div className="engineeringSectionHeader">
          <span>CAPABILITIES</span>
          <h3>Technology without limits.</h3>
        </div>

        <div className="engineeringGrid">

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">01</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <path d="M18 16h28v32H18z"/>
                  <path d="M25 24h14M25 32h14M25 40h8"/>
                  <path d="M46 24l8-5M46 40l8 5"/>
                </svg>
              </div>
            </div>
            <h4>Software &amp; Application Development</h4>
            <p>Custom platforms, applications, APIs, backend systems and specialized software engineered around your requirements.</p>
            <span className="engineeringTag">SOFTWARE SYSTEMS</span>
          </article>

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">02</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="19"/>
                  <circle cx="32" cy="32" r="6"/>
                  <path d="M32 7v9M32 48v9M7 32h9M48 32h9"/>
                  <path d="M17 17l7 7M40 40l7 7M47 17l-7 7M24 40l-7 7"/>
                </svg>
              </div>
            </div>
            <h4>AI &amp; Machine Learning</h4>
            <p>AI assistants, intelligent automation, computer vision, machine learning and custom intelligence systems.</p>
            <span className="engineeringTag">ARTIFICIAL INTELLIGENCE</span>
          </article>

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">03</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <rect x="17" y="21" width="30" height="25" rx="4"/>
                  <circle cx="26" cy="32" r="3"/>
                  <circle cx="38" cy="32" r="3"/>
                  <path d="M25 40h14M32 21V13M27 13h10"/>
                  <path d="M11 28v12M53 28v12"/>
                </svg>
              </div>
            </div>
            <h4>Robotics Engineering</h4>
            <p>Autonomous robots, navigation systems, control software, robotic platforms and intelligent machines.</p>
            <span className="engineeringTag">ROBOTICS</span>
          </article>

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">04</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <rect x="15" y="15" width="34" height="34" rx="3"/>
                  <rect x="25" y="25" width="14" height="14"/>
                  <path d="M21 9v6M32 9v6M43 9v6M21 49v6M32 49v6M43 49v6"/>
                  <path d="M9 21h6M9 32h6M9 43h6M49 21h6M49 32h6M49 43h6"/>
                </svg>
              </div>
            </div>
            <h4>Embedded Systems</h4>
            <p>Hardware integration, embedded software, sensors, controllers and connected intelligent devices.</p>
            <span className="engineeringTag">HARDWARE / EMBEDDED</span>
          </article>

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">05</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <circle cx="20" cy="32" r="7"/>
                  <circle cx="44" cy="20" r="7"/>
                  <circle cx="44" cy="44" r="7"/>
                  <path d="M26 29l11-6M26 35l11 6"/>
                  <path d="M44 27v10"/>
                </svg>
              </div>
            </div>
            <h4>Automation &amp; Industrial Systems</h4>
            <p>Process automation, intelligent control systems, monitoring platforms and industrial technology.</p>
            <span className="engineeringTag">AUTOMATION</span>
          </article>

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">06</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <path d="M32 10l20 8v14c0 12-8 19-20 23C20 51 12 44 12 32V18z"/>
                  <path d="M23 32l6 6 13-14"/>
                </svg>
              </div>
            </div>
            <h4>Cybersecurity Engineering</h4>
            <p>Security architecture, automated security systems, vulnerability assessment and defensive technology.</p>
            <span className="engineeringTag">SECURITY SYSTEMS</span>
          </article>

          <article className="engineeringCard">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">07</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <path d="M16 42h32"/>
                  <path d="M20 42V28h24v14"/>
                  <path d="M26 28v-8h12v8"/>
                  <circle cx="20" cy="49" r="3"/>
                  <circle cx="44" cy="49" r="3"/>
                  <path d="M32 20V11M27 15l5-5 5 5"/>
                </svg>
              </div>
            </div>
            <h4>Cloud &amp; Infrastructure</h4>
            <p>Cloud platforms, APIs, databases, deployment infrastructure and scalable technology systems.</p>
            <span className="engineeringTag">CLOUD / INFRASTRUCTURE</span>
          </article>

          <article className="engineeringCard engineeringCardFeatured">
            <div className="engineeringCardTop">
              <span className="engineeringNumber">08</span>
              <div className="engineeringIcon">
                <svg viewBox="0 0 64 64">
                  <path d="M32 8l6 17 18 2-14 12 4 18-14-10-14 10 4-18L8 27l18-2z"/>
                </svg>
              </div>
            </div>
            <h4>Custom Engineering Projects</h4>
            <p>Have a unique technical challenge? We design and develop solutions around your exact requirements.</p>
            <span className="engineeringTag">CUSTOM R&amp;D</span>
          </article>

        </div>

        <div className="engineeringCTA">
          <div className="engineeringCTAIcon">
            <svg viewBox="0 0 64 64">
              <path d="M32 8v48M8 32h48"/>
              <circle cx="32" cy="32" r="22"/>
            </svg>
          </div>

          <div className="engineeringCTAText">
            <span>HAVE A PROJECT IN MIND?</span>
            <h3>Let's build something extraordinary.</h3>
            <p>Bring us the problem. We'll engineer the technology.</p>
          </div>

          <a className="engineeringCTAButton" href="mailto:contact@space-age-robotics.com">
            <span>CONTACT ENGINEERING</span>
            <strong>→</strong>
          </a>
        </div>

      </section>
      </main>

      <footer>
        <div className="footerBrand">
          <img src={`${BASE}logo.jpg`} alt="" />
          <strong>SPACE AGE ROBOTICS</strong>
        </div>
        <span>Â© 2026 SPACE AGE ROBOTICS. ALL SYSTEMS NOMINAL.</span>
        <a href="#top">BACK TO TOP â†‘</a>
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

