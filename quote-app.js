import { isPro, tryUnlock } from "./pro.js";

const BUY_URL = "https://buy.stripe.com/28EaEZgrvcga0337UNbwk0b";
const $ = (id) => document.getElementById(id);
const itemsEl = $("items");

const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
const fmt = (n, cur) => cur + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => String(s).replace(/"/g, "&quot;");

function addItem(desc = "", qty = "1", price = "") {
  const row = document.createElement("div");
  row.className = "li";
  row.innerHTML =
    `<input class="desc" placeholder="Description" aria-label="Item description" value="${escAttr(desc)}">` +
    `<input class="qty" type="number" aria-label="Quantity" value="${escAttr(qty)}">` +
    `<input class="price" type="number" placeholder="0.00" aria-label="Unit price" value="${escAttr(price)}">` +
    `<button class="rm" title="Remove">×</button>`;
  row.querySelector(".rm").addEventListener("click", () => { row.remove(); render(); });
  row.querySelectorAll("input").forEach((i) => i.addEventListener("input", render));
  itemsEl.appendChild(row);
}

function render() {
  const cur = $("currency").value || "$";
  $("p-biz").textContent = $("bizName").value || "Your Business";
  $("p-bizd").textContent = $("bizDetails").value;
  $("p-client").textContent = $("clientName").value || "Client";
  $("p-clientd").textContent = $("clientDetails").value;
  const meta = [];
  if ($("invNo").value) meta.push("Estimate: " + escHtml($("invNo").value));
  if ($("invDate").value) meta.push("Date: " + escHtml($("invDate").value));
  if ($("dueDate").value) meta.push("Valid until: " + escHtml($("dueDate").value));
  $("p-meta").innerHTML = meta.join("<br>");

  let sub = 0, rows = "";
  for (const li of itemsEl.querySelectorAll(".li")) {
    const d = li.querySelector(".desc").value;
    const q = num(li.querySelector(".qty").value);
    const p = num(li.querySelector(".price").value);
    if (!d && !q && !p) continue;
    const amt = q * p; sub += amt;
    rows += `<tr><td>${escHtml(d)}</td><td class="r">${q}</td><td class="r">${fmt(p, cur)}</td><td class="r">${fmt(amt, cur)}</td></tr>`;
  }
  $("p-items").innerHTML = rows;
  const taxRate = num($("taxRate").value);
  const tax = sub * taxRate / 100;
  $("p-sub").textContent = fmt(sub, cur);
  $("p-tax").textContent = fmt(tax, cur);
  $("p-taxrow").style.display = taxRate ? "flex" : "none";
  $("p-total").textContent = fmt(sub + tax, cur);
  $("p-notes").textContent = $("notes").value;
  $("p-credit").style.display = isPro() ? "none" : "block";
}

const openUnlock = () => ($("unlock").hidden = false);
const closeUnlock = () => ($("unlock").hidden = true);

function wire() {
  addItem("Design work", "10", "75");
  addItem("Consulting", "2", "120");
  try { $("invDate").value = new Date().toISOString().slice(0, 10); } catch { /* ignore */ }
  document.querySelectorAll(".form input, .form textarea").forEach((i) => i.addEventListener("input", render));
  const dateLabels = { invDate: "Estimate date", dueDate: "Valid until" };
  for (const inp of document.querySelectorAll(".form input, .form textarea")) {
    if (inp.getAttribute("aria-label")) continue;
    const al = dateLabels[inp.id] || inp.placeholder;
    if (al) inp.setAttribute("aria-label", al);
  }
  $("btn-add").addEventListener("click", () => { addItem(); render(); });
  $("btn-print").addEventListener("click", () => window.print());
  $("btn-logo").addEventListener("click", () => { if (!isPro()) { openUnlock(); return; } $("logo").click(); });
  $("logo").addEventListener("change", () => {
    const f = $("logo").files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { $("p-logo").src = r.result; $("p-logo").style.display = "block"; };
    r.readAsDataURL(f);
  });
  const applyColor = (c) => $("invoice").style.setProperty("--inv-accent", c);
  let savedColor = null; try { savedColor = localStorage.getItem("inv_color"); } catch { /* ignore */ }
  if (savedColor && isPro()) applyColor(savedColor);
  $("btn-color").addEventListener("click", () => { if (!isPro()) { openUnlock(); return; } $("brandColor").click(); });
  $("brandColor").addEventListener("change", () => { applyColor($("brandColor").value); try { localStorage.setItem("inv_color", $("brandColor").value); } catch { /* ignore */ } });
  $("p-credit").addEventListener("click", openUnlock);
  $("p-credit").title = "Remove this footer (Pro)";
  $("p-credit").style.cursor = "pointer";
  $("buy").href = BUY_URL;
  $("btn-code").addEventListener("click", () => {
    if (tryUnlock($("code").value)) { closeUnlock(); render(); }
    else { $("code").value = ""; $("code").placeholder = "Invalid code — check your receipt"; }
  });
  $("unlock-close").addEventListener("click", closeUnlock);
  $("unlock").addEventListener("click", (e) => { if (e.target.id === "unlock") closeUnlock(); });
  render();
}
wire();
