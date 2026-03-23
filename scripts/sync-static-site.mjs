import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const pub = path.join(root, "public")
const siteSrc = path.join(root, "site")

const indexFrom = path.join(root, "index.html")

if (!fs.existsSync(indexFrom)) {
  console.error(`sync-static-site: missing ${indexFrom}`)
  process.exit(1)
}
if (!fs.existsSync(siteSrc)) {
  console.error(`sync-static-site: missing ${siteSrc}`)
  process.exit(1)
}

fs.mkdirSync(pub, { recursive: true })
fs.copyFileSync(indexFrom, path.join(pub, "index.html"))

const siteDest = path.join(pub, "site")
fs.rmSync(siteDest, { recursive: true, force: true })
fs.cpSync(siteSrc, siteDest, { recursive: true })

for (const legacy of ["app.js", "style.css"]) {
  const p = path.join(pub, legacy)
  if (fs.existsSync(p)) fs.unlinkSync(p)
}
