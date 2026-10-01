import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 8787;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "20mb" }));

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(value = "") {
  return String(value)
    .replace(/\\u002F/g, "/")
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, '"')
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function absoluteUrl(value, base) {
  try {
    return new URL(value, base).href;
  } catch {
    return "";
  }
}

function validAlibabaUrl(url) {
  try {
    const u = new URL(url);

    return (
      u.hostname.includes("alibaba.com") ||
      u.hostname.includes("aliexpress.com")
    );
  } catch {
    return false;
  }
}

/* =========================================================
   META
========================================================= */

function getMeta(html, name) {

  const patterns = [

    new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),

    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
      "i"
    )

  ];

  for (const regex of patterns) {

    const match = html.match(regex);

    if (match) {
      return clean(match[1]);
    }

  }

  return "";
}

/* =========================================================
   JSON-LD
========================================================= */

function getJsonLd(html) {

  const result = [];

  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;

  while ((match = regex.exec(html))) {

    try {

      const data =
        JSON.parse(match[1]);

      if (Array.isArray(data)) {
        result.push(...data);
      } else {
        result.push(data);
      }

    } catch {}

  }

  return result;
}

/* =========================================================
   PRODUCT NAME
========================================================= */

function extractProductName(html, jsonLd) {

  for (const item of jsonLd) {

    if (
      item &&
      typeof item.name === "string" &&
      item.name.trim().length > 3
    ) {

      return clean(item.name);

    }

  }

  const ogTitle =
    getMeta(html, "og:title");

  if (ogTitle) {
    return ogTitle;
  }

  const title =
    html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

  if (title) {

    return clean(title[1])
      .replace(/\s*\|\s*Alibaba.*$/i, "")
      .trim();

  }

  return "Imported Product";
}

/* =========================================================
   DESCRIPTION
   IMPORTANT:
   ONLY TRUSTED PRODUCT SOURCES
========================================================= */

function extractProductDescription(html, jsonLd) {

  const descriptions = [];

  /* JSON-LD */

  for (const item of jsonLd) {

    if (
      item &&
      typeof item.description === "string"
    ) {

      const value =
        clean(item.description);

      if (
        value.length >= 30 &&
        value.length <= 10000
      ) {

        descriptions.push(value);

      }

    }

  }

  /* OG DESCRIPTION */

  const og =
    getMeta(
      html,
      "og:description"
    );

  if (og && og.length >= 30) {
    descriptions.push(og);
  }

  /* NORMAL META DESCRIPTION */

  const meta =
    getMeta(
      html,
      "description"
    );

  if (meta && meta.length >= 30) {
    descriptions.push(meta);
  }

  /* Alibaba specific description containers */

  const selectors = [

    "detail-desc",

    "detail-description",

    "product-description",

    "productDetail",

    "product-detail",

    "description-content",

    "detail-content",

    "product-detail-description"

  ];

  for (const selector of selectors) {

    const regex =
      new RegExp(
        `<[^>]+class=["'][^"']*${selector}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
        "gi"
      );

    let match;

    while (
      (match = regex.exec(html))
    ) {

      const text =
        clean(match[1]);

      if (
        text.length >= 80 &&
        text.length <= 10000
      ) {

        descriptions.push(text);

      }

    }

  }

  return unique(descriptions)
    .sort(
      (a, b) =>
        b.length - a.length
    )
    .slice(0, 5);
}

/* =========================================================
   IMAGES
   IMPORTANT:
   ONLY PRODUCT IMAGE SOURCES
========================================================= */

function collectProductImages(
  html,
  baseUrl,
  jsonLd
) {

  const images = [];

  function add(value) {

    if (!value) return;

    let url =
      String(value)
        .replace(/\\u002F/g, "/")
        .replace(/\\\//g, "/")
        .trim();

    if (
      url.startsWith("//")
    ) {
      url = "https:" + url;
    }

    const finalUrl =
      absoluteUrl(
        url,
        baseUrl
      );

    if (!finalUrl) return;

    if (
      !/^https?:\/\//i.test(finalUrl)
    ) {
      return;
    }

    /* Must look like an actual image */

    const imageLike =
      /\.(jpg|jpeg|png|webp|avif)(?:[?#].*)?$/i.test(
        finalUrl
      );

    const alicdn =
      /alicdn\.com/i.test(
        finalUrl
      );

    if (
      !imageLike &&
      !alicdn
    ) {
      return;
    }

    /* Reject obvious UI assets */

    if (
      /logo|icon|favicon|avatar|sprite|qr|code|loading|placeholder|banner|badge|flag|country|payment|trustpilot|facebook|twitter|youtube|instagram/i.test(
        finalUrl
      )
    ) {
      return;
    }

    if (
      !images.includes(finalUrl)
    ) {

      images.push(finalUrl);

    }

  }

  /* -----------------------------------------
     1. JSON-LD images
  ----------------------------------------- */

  for (const item of jsonLd) {

    if (!item) continue;

    if (
      typeof item.image === "string"
    ) {

      add(item.image);

    }

    if (
      Array.isArray(item.image)
    ) {

      for (
        const image of item.image
      ) {

        if (
          typeof image === "string"
        ) {

          add(image);

        } else if (
          image?.url
        ) {

          add(image.url);

        }

      }

    }

    if (
      item.image?.url
    ) {

      add(
        item.image.url
      );

    }

  }

  /* -----------------------------------------
     2. OG IMAGE
  ----------------------------------------- */

  const og =
    getMeta(
      html,
      "og:image"
    );

  if (og) {
    add(og);
  }

  /* -----------------------------------------
     3. IMG tags
  ----------------------------------------- */

  const imgRegex =
    /<img\b[^>]*>/gi;

  let match;

  while (
    (match = imgRegex.exec(html))
  ) {

    const tag =
      match[0];

    /* Ignore obvious non-product image tags */

    if (
      /logo|icon|avatar|sprite|qr|loading|placeholder|banner|flag/i.test(
        tag
      )
    ) {
      continue;
    }

    const attrs = [

      "data-src",

      "data-original",

      "data-image",

      "data-img",

      "src"

    ];

    for (
      const attr of attrs
    ) {

      const regex =
        new RegExp(
          `${attr}\\s*=\\s*["']([^"']+)["']`,
          "i"
        );

      const found =
        tag.match(regex);

      if (found) {

        add(found[1]);

      }

    }

  }

  /*
   * IMPORTANT:
   * Do NOT scan the entire HTML for random
   * alicdn.com URLs.
   */

  return unique(images)
    .slice(0, 12);
}

/* =========================================================
   TECHNICAL SPECIFICATIONS
========================================================= */

function extractSpecifications(html) {

  const specs = [];

  const tableRegex =
    /<table[^>]*>([\s\S]*?)<\/table>/gi;

  let table;

  while (
    (table =
      tableRegex.exec(html))
  ) {

    const rowRegex =
      /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

    let row;

    while (
      (row =
        rowRegex.exec(table[1]))
    ) {

      const cells = [];

      const cellRegex =
        /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;

      let cell;

      while (
        (cell =
          cellRegex.exec(row[1]))
      ) {

        const value =
          clean(cell[1]);

        if (value) {
          cells.push(value);
        }

      }

      if (
        cells.length >= 2 &&
        cells.length <= 4
      ) {

        const key =
          cells[0];

        const value =
          cells.slice(1)
            .join(" — ");

        if (
          key.length >= 2 &&
          key.length <= 120 &&
          value.length >= 1 &&
          value.length <= 500
        ) {

          specs.push({
            key,
            value
          });

        }

      }

    }

  }

  const seen =
    new Set();

  return specs.filter(item => {

    const id =
      `${item.key}|${item.value}`
        .toLowerCase();

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;

  }).slice(0, 60);
}

/* =========================================================
   PRICE
========================================================= */

function extractPrice(
  html,
  jsonLd
) {

  for (
    const item of jsonLd
  ) {

    const values = [

      item?.offers?.price,

      item?.offers?.lowPrice,

      item?.price

    ];

    for (
      const raw of values
    ) {

      const value =
        Number(
          String(raw)
            .replace(/,/g, "")
            .replace(/[^\d.]/g, "")
        );

      if (
        Number.isFinite(value) &&
        value > 0
      ) {

        return value;

      }

    }

  }

  const patterns = [

    /"price"\s*:\s*"?(?:USD|US\$|\$)?\s*([\d.,]+)/i,

    /"minPrice"\s*:\s*"?(?:USD|US\$|\$)?\s*([\d.,]+)/i,

    /US\s*\$?\s*([\d.,]+)/i,

    /\$\s*([\d.,]+)/i

  ];

  for (
    const pattern of patterns
  ) {

    const match =
      html.match(pattern);

    if (!match) continue;

    const value =
      Number(
        match[1]
          .replace(/,/g, "")
          .replace(/[^\d.]/g, "")
      );

    if (
      Number.isFinite(value) &&
      value > 0
    ) {

      return value;

    }

  }

  return 0;
}

/* =========================================================
   CATEGORY
========================================================= */

function detectCategory(text) {

  const value =
    text.toLowerCase();

  if (
    /humanoid|biped|human robot/
      .test(value)
  )
    return "HUMANOIDS";

  if (
    /drone|uav|quadcopter|fpv/
      .test(value)
  )
    return "DRONES";

  if (
    /mower|lawn mower|grass cutting/
      .test(value)
  )
    return "MOWERS";

  if (
    /rover|quadruped|robot dog/
      .test(value)
  )
    return "ROVERS";

  if (
    /industrial robot|robot arm|robotic arm|automation/
      .test(value)
  )
    return "INDUSTRIAL";

  if (
    /security robot|patrol robot|surveillance/
      .test(value)
  )
    return "SECURITY";

  if (
    /agriculture|agricultural|farm robot|harvesting/
      .test(value)
  )
    return "AGRICULTURE";

  if (
    /underwater|submersible|marine robot/
      .test(value)
  )
    return "UNDERWATER";

  if (
    /construction|building robot/
      .test(value)
  )
    return "CONSTRUCTION";

  if (
    /space|orbital|lunar|mars/
      .test(value)
  )
    return "SPACE ROBOTICS";

  if (
    /artificial intelligence|computer vision|ai system/
      .test(value)
  )
    return "AI SYSTEMS";

  return "ROBOTICS";
}

/* =========================================================
   DESCRIPTIONS
========================================================= */

function makeShortDescription(
  name,
  descriptions
) {

  if (
    descriptions.length
  ) {

    const best =
      descriptions
        .sort(
          (a, b) =>
            Math.abs(a.length - 500) -
            Math.abs(b.length - 500)
        )[0];

    return best.length > 650
      ? best
          .substring(0, 647)
          .replace(/\s+\S*$/, "") +
        "..."
      : best;
  }

  return `${name} — product information supplied by the manufacturer.`;
}

function makeDetailedDescription(
  name,
  descriptions,
  specifications
) {

  const sections = [];

  if (
    descriptions.length
  ) {

    sections.push(
      descriptions.join("\n\n")
    );

  }

  if (
    specifications.length
  ) {

    sections.push(
      "TECHNICAL SPECIFICATIONS\n\n" +
      specifications
        .map(
          item =>
            `${item.key}: ${item.value}`
        )
        .join("\n")
    );

  }

  if (!sections.length) {

    sections.push(
      `${name} — product information supplied by the manufacturer.`
    );

  }

  return sections.join(
    "\n\n"
  );
}

/* =========================================================
   PRODUCT CODE
========================================================= */

function makeCode(name) {

  const code =
    name
      .toUpperCase()
      .replace(
        /[^A-Z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      )
      .substring(
        0,
        28
      );

  return `SAR-${code || Date.now()}`;
}

/* =========================================================
   IMPORT
========================================================= */

app.post(
  "/api/scrape-alibaba",
  async (req, res) => {

    try {

      const { url } =
        req.body || {};

      if (!url) {

        return res.status(400).json({
          error:
            "Alibaba URL is required."
        });

      }

      if (
        !validAlibabaUrl(url)
      ) {

        return res.status(400).json({
          error:
            "Only Alibaba or AliExpress URLs are supported."
        });

      }

      console.log("");
      console.log(
        "IMPORTING:"
      );
      console.log(url);

      const response =
        await fetch(
          url,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
              "Accept":
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language":
                "en-US,en;q=0.9"
            },
            redirect:
              "follow"
          }
        );

      if (!response.ok) {

        throw new Error(
          `Alibaba returned HTTP ${response.status}`
        );

      }

      const html =
        await response.text();

      const jsonLd =
        getJsonLd(html);

      const name =
        extractProductName(
          html,
          jsonLd
        );

      const descriptions =
        extractProductDescription(
          html,
          jsonLd
        );

      const specifications =
        extractSpecifications(
          html
        );

      const images =
        collectProductImages(
          html,
          url,
          jsonLd
        );

      const combinedText =
        [
          name,
          ...descriptions,
          ...specifications.map(
            x =>
              `${x.key} ${x.value}`
          )
        ].join(" ");

      const category =
        detectCategory(
          combinedText
        );

      const supplierPrice =
        extractPrice(
          html,
          jsonLd
        );

      const product = {

        id:
          makeCode(name),

        code:
          makeCode(name),

        name,

        category,

        description:
          makeShortDescription(
            name,
            descriptions
          ),

        shortDescription:
          makeShortDescription(
            name,
            descriptions
          ),

        technicalDescription:
          makeDetailedDescription(
            name,
            descriptions,
            specifications
          ),

        technicalSpecifications:
          specifications,

        supplierPrice,

        price:
          supplierPrice,

        images,

        sourceUrl:
          url
      };

      console.log("");
      console.log(
        "========== IMPORT RESULT =========="
      );
      console.log(
        "NAME:",
        name
      );
      console.log(
        "DESCRIPTION SOURCES:",
        descriptions.length
      );
      console.log(
        "SPECIFICATIONS:",
        specifications.length
      );
      console.log(
        "PRODUCT IMAGES:",
        images.length
      );
      console.log(
        "PRICE:",
        supplierPrice
      );
      console.log(
        "==================================="
      );
      console.log("");

      res.json({
        success: true,
        product
      });

    } catch (error) {

      console.error(
        "IMPORT ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Alibaba import failed."
      });

    }

  }
);

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      ok: true,
      service:
        "Space Age Robotics Smart Importer"
    });

  }
);

/* =========================================================
   ADMIN
========================================================= */

app.get(
  "/",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "admin.html"
      )
    );

  }
);

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  () => {

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      " SPACE AGE ROBOTICS / SMART IMPORTER"
    );
    console.log(
      "========================================"
    );
    console.log("");
    console.log(
      `Admin: http://localhost:${PORT}`
    );
    console.log(
      `API:   http://localhost:${PORT}/api/health`
    );
    console.log("");

  }
);
