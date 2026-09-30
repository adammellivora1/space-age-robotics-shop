import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

const app = express()
const PORT = 8787

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json({ limit: "2mb" }))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"))
})

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Space Age Robotics Alibaba Importer"
  })
})

app.post("/api/alibaba/import", (req, res) => {

  const { url } = req.body

  if (!url) {
    return res.status(400).json({
      ok: false,
      error: "Alibaba product URL is required."
    })
  }

  const match = url.match(/(\d{8,})/)

  if (!match) {
    return res.status(400).json({
      ok: false,
      error: "Could not detect Alibaba product ID."
    })
  }

  res.json({
    ok: true,
    productId: match[1],
    message: "Alibaba product detected."
  })
})

app.listen(PORT, () => {
  console.log("")
  console.log("========================================")
  console.log(" SPACE AGE ROBOTICS / ADMIN")
  console.log("========================================")
  console.log("")
  console.log("Admin: http://localhost:8787")
  console.log("API:   http://localhost:8787/api/health")
  console.log("")
})
