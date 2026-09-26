import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, type Plugin } from "vitest/config"

function presentationPage(): Plugin {
  const rewrite = (url: string | undefined) => {
    if (!url) return url
    const path = url.split("?")[0]
    if (path === "/presentation" || path === "/presentation/") {
      return "/presentation/index.html"
    }
    return url
  }

  const attach = (middlewares: {
    use: (
      fn: (req: { url?: string }, res: unknown, next: () => void) => void,
    ) => void
  }) => {
    middlewares.use((req, _res, next) => {
      const nextUrl = rewrite(req.url)
      if (nextUrl && nextUrl !== req.url) req.url = nextUrl
      next()
    })
  }

  return {
    name: "presentation-page",
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}

function mswDevPlugin(): Plugin {
  return {
    name: "msw-dev",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (ctx.server?.config.mode !== "mock") return html
        return html.replace(
          '<script type="module" src="/src/main.tsx"></script>',
          '<script type="module" src="/mocks/enable.ts"></script>\n    <script type="module" src="/src/main.tsx"></script>',
        )
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [presentationPage(), mswDevPlugin(), react(), tailwindcss()],
  build: {
    // Иначе lightningcss ломает light-dark() в цветах: два значения склеиваются в одно невалидное.
    cssTarget: "chrome123",
  },
  test: {
    environment: "node",
    setupFiles: ["./mocks/vitest.setup.ts"],
  },
})
