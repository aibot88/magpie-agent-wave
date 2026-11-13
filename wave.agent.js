// Wave Terminal (waveterm.dev) reads its AI modes from
// ~/.config/waveterm/waveai.json: each top-level key is a mode whose
// ai:endpoint is a full chat-completions URL (localhost is fine), so a
// "magpie" mode pointing at magpie's gateway works with no cloud
// involved. magpie writes the picked model into the mode's ai:model,
// and connect keeps the rest of the mode in place.
export const agent = {
  id: "wave",
  name: "Wave",
  // waveterm.dev's own mark, on the Agents page and the plugin's row
  icon: "https://docs.waveterm.dev/img/logo/wave-light.png",
  bin: "wsh",
  dir: "~/.waveterm",
  config: "~/.config/waveterm/waveai.json",
  format: "json",
  model: "magpie.ai:model",
  ua: ["waveterm", "wave"],
  notice:
    "Wave reads waveai.json live; pick the Magpie mode in Wave AI's mode dropdown once, or run `wsh setconfig waveai:defaultmode=magpie`. Wave 实时读取 waveai.json；在 Wave AI 面板的模式下拉里选一次 Magpie，或执行 `wsh setconfig waveai:defaultmode=magpie`。",
}

// Wave's thinking levels are just low/medium/high; pick the closest a
// model's efforts offer, or leave the mode without one.
function thinkingLevel(model) {
  const efforts = model?.efforts || []
  for (const level of ["medium", "high", "low"]) {
    if (efforts.includes(level)) return level
  }
  return undefined
}

export function connect({ gateway, model }) {
  const name = model?.name || model?.id
  const capabilities = ["tools"]
  if (model?.images) capabilities.push("images")
  const mode = {
    "magpie.display:name": name ? `Magpie · ${name}` : "Magpie",
    "magpie.display:order": 1,
    // FontAwesome's bird, the closest it has to a magpie
    "magpie.display:icon": "crow",
    "magpie.ai:provider": "custom",
    "magpie.ai:apitype": "openai-chat",
    // Wave wants the full endpoint path, not a base URL
    "magpie.ai:endpoint": `${gateway.v1}/chat/completions`,
    // magpie's key for Wave, so Usage names its requests
    "magpie.ai:apitoken": gateway.key,
    "magpie.ai:capabilities": capabilities,
  }
  const thinking = thinkingLevel(model)
  if (thinking) mode["magpie.ai:thinkinglevel"] = thinking
  return mode
}
