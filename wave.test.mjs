import { describe, expect, test } from "bun:test"
import { agent, connect } from "./wave.agent.js"

const gateway = { url: "http://127.0.0.1:3425", v1: "http://127.0.0.1:3425/v1", key: "magpie-wave-test" }

describe("agent", () => {
  test("declares where Wave keeps its AI modes", () => {
    expect(agent.id).toBe("wave")
    expect(agent.config).toBe("~/.config/waveterm/waveai.json")
    expect(agent.format).toBe("json")
    expect(agent.model).toBe("magpie.ai:model")
  })

  test("shows Wave's own icon, as the package gives it", async () => {
    const pkg = await Bun.file(new URL("./package.json", import.meta.url)).json()
    expect(agent.icon).toBe("https://docs.waveterm.dev/img/logo/wave-light.png")
    expect(pkg.magpie.icon).toBe(agent.icon)
  })
})

describe("connect", () => {
  test("points the magpie mode at the gateway's chat completions endpoint", () => {
    const keys = connect({ gateway, model: { id: "acme/acme-coder", name: "Acme Coder" } })
    expect(keys["magpie.ai:endpoint"]).toBe("http://127.0.0.1:3425/v1/chat/completions")
    expect(keys["magpie.ai:apitoken"]).toBe("magpie-wave-test")
    expect(keys["magpie.ai:apitype"]).toBe("openai-chat")
    expect(keys["magpie.ai:provider"]).toBe("custom")
    expect(keys["magpie.display:name"]).toBe("Magpie · Acme Coder")
    expect(keys["magpie.ai:capabilities"]).toEqual(["tools"])
  })

  test("adds images and a thinking level when the model offers them", () => {
    const keys = connect({
      gateway,
      model: { id: "acme/acme-vision", name: "Acme Vision", images: true, efforts: ["low", "medium", "high"] },
    })
    expect(keys["magpie.ai:capabilities"]).toEqual(["tools", "images"])
    expect(keys["magpie.ai:thinkinglevel"]).toBe("medium")
  })

  test("tolerates being called without a model", () => {
    const keys = connect({ gateway })
    expect(keys["magpie.display:name"]).toBe("Magpie")
    expect(keys["magpie.ai:endpoint"]).toBe("http://127.0.0.1:3425/v1/chat/completions")
    expect(keys["magpie.ai:thinkinglevel"]).toBeUndefined()
  })
})
