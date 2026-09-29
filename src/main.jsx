import React,{useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {Search,ShoppingCart,Menu,X,ChevronRight,Plus,Minus,Trash2,ArrowRight,Shield,Satellite,Bot,Rocket} from "lucide-react";
import "./styles.css";

const products=[
{id:1,name:"SAR-X1 Explorer",cat:"ROBOTICS",price:2499,tag:"NEW",desc:"Autonomous exploration robot platform for research, inspection and extreme environments.",icon:"🤖"},
{id:2,name:"ORBITAL Scout",cat:"SPACE TECH",price:1899,tag:"FEATURED",desc:"Compact autonomous orbital systems concept built for intelligent remote missions.",icon:"🛰️"},
{id:3,name:"NOVA AI Core",cat:"AI SYSTEMS",price:899,tag:"AI",desc:"Edge AI compute module for robotics, computer vision and autonomous decision systems.",icon:"🧠"},
{id:4,name:"LUNAR Rover Kit",cat:"ROBOTICS",price:1299,tag:"LAB",desc:"Modular rover development kit for education, prototyping and field robotics.",icon:"🌑"},
{id:5,name:"ASTRA Vision",cat:"AI SYSTEMS",price:649,tag:"VISION",desc:"Industrial vision package for object detection, mapping and robotic perception.",icon:"👁️"},
{id:6,name:"MARS Habitat Sensor",cat:"SPACE TECH",price:399,tag:"NEW",desc:"Environmental sensing module designed around future planetary habitat scenarios.",icon:"🔴"}
];

function App(){
 const [cart,setCart]=useState([]),[cat,setCat]=useState("ALL"),[q,setQ]=useState(""),[open,setOpen]=useState(false),[menu,setMenu]=useState(false);
 const filtered=useMemo(()=>products.filter(p=>(cat==="ALL"||p.cat===cat)&&(p.name+" "+p.desc).toLowerCase().includes(q.toLowerCase())),[cat,q]);
 const add=p=>setCart(c=>[...c,p]);
 const remove=i=>setCart(c=>c.filter((_,x)=>x!==i));
 const total=cart.reduce((s,p)=>s+p.price,0);
 return <div>
  <div className="top">FREE WORLDWIDE SHIPPING ON ORDERS OVER €500 <span>·</span> ENGINEERING THE FUTURE</div>
  <header>
   <a className="brand" href="#"><span className="brandMark">◉</span><span>SPACE AGE<strong>ROBOTICS</strong><small>THE FUTURE OF INTELLIGENT MACHINES</small></span></a>
   <nav className={menu?"show":""}>{["SHOP","ROBOTS","SPACE TECH","AI SYSTEMS","ABOUT"].map((x,i)=><a key={x} href={i===0?"#shop":"#about"}>{x}</a>)}</nav>
   <div className="headActions"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search technology..."/></div><button className="iconBtn" onClick={()=>setOpen(true)}><ShoppingCart size={21}/>{cart.length>0&&<b>{cart.length}</b>}</button><button className="mobile" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
  </header>

  <main>
   <section className="hero">
    <div className="stars"></div><div className="heroCopy"><p className="eyebrow">SPACE • ROBOTICS • ARTIFICIAL INTELLIGENCE</p><h1>THE FUTURE<br/>STARTS <em>HERE.</em></h1><p>Advanced robots, intelligent systems and space technology for the people building tomorrow.</p><div><a className="btn" href="#shop">EXPLORE THE SHOP <ArrowRight size={17}/></a><a className="btn ghost" href="#about">OUR MISSION</a></div></div>
    <div className="orb"><div className="robot">◉</div><span>01</span><span>INTELLIGENT<br/>SYSTEMS</span></div>
   </section>

   <section className="trust"><span>◈ ENGINEERED FOR THE NEXT FRONTIER</span><span>◈ AI-POWERED</span><span>◈ AUTONOMOUS</span><span>◈ MODULAR</span></section>

   <section className="spotlight" id="about"><div><p className="eyebrow">TECHNOLOGY SPOTLIGHT</p><h2>BUILDING MACHINES<br/><em>BEYOND EARTH.</em></h2><p>Space Age Robotics brings robotics, AI and space engineering together in one technology platform. Discover hardware and systems designed for exploration, automation and intelligent autonomy.</p><a className="textLink" href="#shop">DISCOVER OUR TECHNOLOGY <ChevronRight size={17}/></a></div><div className="spotCard"><Bot size={52}/><strong>AUTONOMOUS<br/>ROBOTICS</strong><span>PERCEPTION / AI / CONTROL</span></div></section>

   <section className="shop" id="shop"><div className="sectionHead"><div><p className="eyebrow">THE STORE</p><h2>EXPLORE THE <em>FRONTIER.</em></h2></div><div className="filters">{["ALL","ROBOTICS","SPACE TECH","AI SYSTEMS"].map(x=><button className={cat===x?"active":""} onClick={()=>setCat(x)} key={x}>{x}</button>)}</div></div>
    <div className="grid">{filtered.map(p=><article className="product" key={p.id}><div className="productVisual"><span>{p.tag}</span><div>{p.icon}</div><small>SAR / {String(p.id).padStart(2,"0")}</small></div><div className="productInfo"><p>{p.cat}</p><h3>{p.name}</h3><span>{p.desc}</span><div className="buy"><strong>€{p.price.toLocaleString("de-DE")}</strong><button onClick={()=>add(p)}>ADD TO CART <Plus size={16}/></button></div></div></article>)}</div>
   </section>

   <section className="mission"><div className="missionImage"><div className="planet"></div><div className="gridLines"></div></div><div><p className="eyebrow">SPACE AGE ROBOTICS</p><h2>INNOVATE.<br/>AUTOMATE.<br/><em>ELEVATE.</em></h2><p>We believe the next generation of machines should expand human capability — on Earth, in orbit and beyond.</p><div className="stats"><div><b>01</b><span>ROBOTICS</span></div><div><b>02</b><span>AI SYSTEMS</span></div><div><b>03</b><span>SPACE TECH</span></div></div></div></section>

   <section className="newsletter"><div><p className="eyebrow">THE SIGNAL</p><h2>GET THE FUTURE<br/><em>DELIVERED.</em></h2></div><form onSubmit={e=>{e.preventDefault();alert("Thanks for subscribing.")}}><input type="email" required placeholder="your@email.com"/><button className="btn">SUBSCRIBE <ArrowRight size={17}/></button></form></section>
  </main>
  <footer><div className="brand"><span className="brandMark">◉</span><span>SPACE AGE<strong>ROBOTICS</strong><small>THE MAGAZINE OF ROBOTICS, AI & THE FUTURE</small></span></div><div><p>EXPLORE</p><a href="#shop">Shop</a><a href="#about">About</a><a href="#shop">Robots</a></div><div><p>SUPPORT</p><a href="#">Shipping</a><a href="#">Returns</a><a href="#">Contact</a></div><div><p>© 2026 SPACE AGE ROBOTICS</p><span>ROBOTICS • AI • SPACE TECHNOLOGY</span></div></footer>

  {open&&<div className="overlay" onClick={()=>setOpen(false)}><aside className="cart" onClick={e=>e.stopPropagation()}><div className="cartHead"><h2>YOUR CART</h2><button onClick={()=>setOpen(false)}><X/></button></div>{cart.length===0?<div className="empty"><ShoppingCart size={40}/><p>Your cart is empty.</p><a href="#shop" onClick={()=>setOpen(false)}>EXPLORE PRODUCTS</a></div>:<><div className="cartItems">{cart.map((p,i)=><div className="cartItem" key={i}><span>{p.icon}</span><div><b>{p.name}</b><small>€{p.price.toLocaleString("de-DE")}</small></div><button onClick={()=>remove(i)}><Trash2 size={16}/></button></div>)}</div><div className="cartFoot"><span>TOTAL</span><strong>€{total.toLocaleString("de-DE")}</strong><button className="btn">CHECKOUT <ArrowRight size={17}/></button><small>Checkout integration ready for Stripe / PayPal.</small></div></>}</aside></div>}
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
