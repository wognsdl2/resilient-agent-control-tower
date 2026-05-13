const nodeStyle = {
  agent: { fill: "#2454d6", text: "#ffffff" },
  good: { fill: "#0f8b57", text: "#ffffff" },
  warn: { fill: "#aa6a00", text: "#ffffff" },
  bad: { fill: "#c0392b", text: "#ffffff" },
  neutral: { fill: "#eef3f8", text: "#15202b" }
};

export function drawTopology(canvas, result) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f9fbff";
  ctx.fillRect(0, 0, width, height);

  const nodes = [
    { id: "User", x: 95, y: 225, status: "neutral" },
    { id: "Agent", x: 265, y: 225, status: "agent" },
    { id: "LLM Primary", x: 465, y: 130, status: result.llm },
    { id: "LLM Backup", x: 675, y: 130, status: result.llm === "bad" ? "good" : "neutral" },
    { id: "MCP Tools", x: 465, y: 315, status: result.mcp },
    { id: "Cache", x: 675, y: 315, status: result.mcp === "bad" ? "good" : "neutral" },
    { id: "Answer", x: 835, y: 225, status: result.confidence > 80 ? "good" : result.confidence > 65 ? "warn" : "bad" }
  ];

  drawLine(ctx, nodes[0], nodes[1], false);
  drawLine(ctx, nodes[1], nodes[2], result.llm === "bad");
  drawLine(ctx, nodes[2], nodes[3], result.llm === "bad");
  drawLine(ctx, nodes[1], nodes[4], result.mcp === "bad");
  drawLine(ctx, nodes[4], nodes[5], result.mcp === "bad");
  drawLine(ctx, nodes[3], nodes[6], false);
  drawLine(ctx, nodes[5], nodes[6], result.mcp === "bad");
  drawLine(ctx, nodes[2], nodes[6], result.llm !== "bad");

  for (const node of nodes) {
    drawNode(ctx, node);
  }

  ctx.fillStyle = "#5d6978";
  ctx.font = "700 18px Inter, sans-serif";
  ctx.fillText(result.route, 28, 38);
}

function drawLine(ctx, from, to, dashed) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = dashed ? "#aa6a00" : "#9aa8ba";
  ctx.lineWidth = dashed ? 4 : 2;
  if (dashed) ctx.setLineDash([10, 8]);
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawNode(ctx, node) {
  const style = nodeStyle[node.status] ?? nodeStyle.neutral;
  ctx.beginPath();
  ctx.fillStyle = style.fill;
  roundRect(ctx, node.x - 64, node.y - 28, 128, 56, 8);
  ctx.fill();
  ctx.strokeStyle = "#d7dde6";
  ctx.stroke();
  ctx.fillStyle = style.text;
  ctx.font = "800 15px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.id, node.x, node.y);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
}
