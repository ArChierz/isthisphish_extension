console.log("DEBUG: OPTIONS RUNNING");

const e = "whitelist";

document.addEventListener("DOMContentLoaded", () => {
  const t = document.getElementById("input-domain");
  const n = document.getElementById("button");
  const o = document.getElementById("whitelistDisplay");
  c();
  n.addEventListener("click", async () => {
    const e = t.value.trim().toLowerCase();
    if (!e) {
      return;
    }
    const n = await s();
    if (!n.includes(e)) {
      n.push(e);
      await a(n);
      t.value = "";
      c();
    }
  });
  async function c() {
    const e = await s();
    o.innerHTML = "";
    e.forEach(t => {
      const n = document.createElement("li");
      n.className = "whitelist-box";
      n.textContent = t;
      const s = document.createElement("button");
      s.className = "remove-btn";
      s.textContent = "X";
      s.addEventListener("click", async () => {
        const n = e.filter(e => e !== t);
        await a(n);
        c();
        chrome.runtime.sendMessage({
          type: "invalidateTabCache",
          domain: t
        });
      });
      n.appendChild(s);
      o.appendChild(n);
    });
  }
  function s() {
    return new Promise(t => {
      chrome.storage.local.get([ e ], n => {
        const o = n[e] || {};
        const c = o["user"] ? Object.keys(o["user"]) : [];
        t(c);
      });
    });
  }
  function a(t) {
    const n = {};
    t.forEach(e => {
      n[e] = true;
    });
    const o = {
      user: n
    };
    return new Promise(t => {
      chrome.storage.local.set({
        [e]: o
      }, t);
    });
  }
});