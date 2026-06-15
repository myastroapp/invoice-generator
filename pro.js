// Pro unlock for the invoice generator (removes the footer credit). Honor-system client-side (v1).
const PRO_CODE = "INV-PRO-5T8W-2H6L";
export function isPro() { try { return localStorage.getItem("inv_pro") === "1"; } catch { return false; } }
export function setPro() { try { localStorage.setItem("inv_pro", "1"); } catch { /* ignore */ } }
export function tryUnlock(code) {
  if ((code || "").trim().toUpperCase() === PRO_CODE) { setPro(); return true; }
  return false;
}
