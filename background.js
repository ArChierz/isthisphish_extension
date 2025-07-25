const o = 30 * 60 * 1e3;

const e = "geoCache";

const s = "whitelist";

const t = new Map;

const n = new Set;

const c = "https://isthisphish.app";

l();

chrome.runtime.onInstalled.addListener(o => {
  if (o.reason === "install") {
    chrome.tabs.create({
      url: `${c}/welcome`
    });
  }
});

chrome.storage.session.get([ "sessionId" ], o => {
  if (!o.sessionId) {
    const o = crypto.randomUUID();
    chrome.storage.session.set({
      sessionId: o
    }, () => {
      console.log("DEBUG: Initialized session ID:", o);
    });
  } else {
    console.log("DEBUG: Session ID already exists:", o.sessionId);
  }
});

function l() {
  return new Promise(o => {
    chrome.storage.local.get([ s ], e => {
      if (!e[s]) {
        const e = {
          default: {}
        };
        chrome.storage.local.set({
          [s]: e
        }, () => {
          console.log(`Initialized whitelist with default key.`);
          o();
        });
      } else {
        o();
      }
    });
  });
}

function r(o) {
  return o.startsWith("http://") || o.startsWith("https://");
}

function i(o) {
  const e = o.split(".");
  if (e.length > 2) {
    return e.slice(-2).join(".");
  }
  return o;
}

function a(e) {
  const s = Date.now();
  for (const t in e) {
    if (s - e[t].timestamp > o) {
      delete e[t];
    }
  }
  return e;
}

function d(o) {
  return new Promise(e => {
    chrome.storage.local.get(o, e);
  });
}

function g(o) {
  return new Promise(e => {
    chrome.storage.session.get(o, e);
  });
}

function m(o, e, s) {
  chrome.storage.local.get([ "blocked", "originalUrl" ], t => {
    const n = t.blocked || {};
    const c = t.originalUrl || {};
    n[e] = true;
    c[e] = s;
    chrome.storage.local.set({
      blocked: n,
      originalUrl: c
    }, () => {
      chrome.storage.session.get([ "blockedTabs" ], t => {
        const n = t.blockedTabs || {};
        n[o] = {
          domain: e,
          url: s
        };
        chrome.storage.session.set({
          blockedTabs: n
        }, () => {
          chrome.tabs.update(o, {
            url: chrome.runtime.getURL("blocked/blocked.html")
          });
        });
      });
    });
  });
}

function h(o) {
  return n.has(o);
}

async function u() {
  return new Promise(o => {
    chrome.storage.local.get([ s ], e => {
      o(e[s] || {});
    });
  });
}

async function f() {
  const o = await u();
  const e = "user";
  if (!o[e]) {
    o[e] = {};
  }
  o[e][domain] = true;
  return new Promise(e => {
    chrome.storage.local.set({
      [s]: o
    }, () => {
      console.log(`set ${domain} whitelist`);
      e();
    });
  });
}

async function U(o) {
  const e = await u();
  const t = "user";
  if (e[t] && e[t][o]) {
    delete e[t][o];
  }
  if (n.has(o)) {
    n.delete(o);
    console.log(`DEBUG: Removed ${o} from sessionUnblocked`);
  }
  return new Promise(t => {
    chrome.storage.local.set({
      [s]: e
    }, () => {
      console.log(`Removed ${o} from whitelist`);
      t();
    });
  });
}

chrome.tabs.onUpdated.addListener(async function(o, e, s) {
  if (e.status !== "complete" || !s.url) {
    return;
  }
  const n = new URL(s.url);
  const l = s.url;
  const a = await g("sessionId");
  const f = a.sessionId;
  console.log(f);
  if (!f) {
    console.log("DEBUG: Invalid or missing session ID.");
    return;
  }
  if (t.get(o) === n.href) {
    console.log("DEBUG: Already processed this url for this tab");
    return;
  }
  t.set(o, n.href);
  if (!r(n.href) || (n.hostname === "localhost" || n.hostname === "127.0.0.1" || n.hostname === "0.0.0.0")) {
    return;
  }
  try {
    const e = new URL(s.url);
    const t = e.hostname;
    const n = i(t);
    console.log("DEBUG: reach whitelist/blocklist/predict site");
    const r = await u();
    const a = await d([ "blocked" ]);
    const g = a.blocked || {};
    console.log(`DEBUG: Full whitelist:`, r);
    console.log(`DEBUG: Check ${n} in whitelist.`);
    let U = false;
    for (const o in r) {
      const e = r[o];
      if (e[n]) {
        U = true;
        break;
      }
    }
    console.log(`DEBUG: Check ${n} in whitelist.`);
    if (U) {
      console.log(`DEBUG: ${n} is in whitelist. Bypass detection`);
      return;
    }
    if (h(n)) {
      console.log(`DEBUG: ${n} is temporarily unblocked for this session.`);
      return;
    }
    console.log(`DEBUG: Check ${n} is blocked.`);
    if (g[n]) {
      console.log(`DEBUG: ${n} is blocked. blocking.`);
      return m(o, n, s.url);
    }
    console.log(`DEBUG: try detect phishing for ${s.url}`);
    const b = performance.now();
    const D = await fetch(`${c}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: s.url,
        sessionId: f
      })
    });
    const w = await D.json();
    console.log(`DEBUG: ${w}`);
    console.log(`DEBUG: ${w.message}`);
    console.log(`DEBUG: ${w.status}`);
    if (w.error) {
      console.log(`DEBUG: ${w.error}`);
    }
    const E = w.label === 1;
    const G = performance.now();
    const p = (G - b).toFixed(2);
    if (E) {
      console.log(`DEBUG: ${n} is detected as phishing.`);
      console.log(`DEBUG: Time from load to block: ${p} ms`);
      chrome.tabs.get(o, e => {
        if (e && e.url === l) {
          m(o, n, l);
        } else {
          console.log("DEBUG: Tab URL changed before block. Skip blocking.");
        }
      });
      return;
    }
    console.log(`DEBUG: Time from load to show: ${p} ms`);
  } catch (o) {
    console.log("Invalid URL, tab info, or detection error", o);
  }
});

chrome.tabs.onRemoved.addListener(function(o) {
  t.delete(o);
  chrome.storage.session.get([ "blockedTabs" ], e => {
    const s = e.blockedTabs || {};
    if (s[o]) {
      delete s[o];
      chrome.storage.session.set({
        blockedTabs: s
      });
    }
  });
});

chrome.runtime.onMessage.addListener((o, s, l) => {
  if (o.type === "sessionUnblock" && o.domain) {
    console.log(`DEBUG: Adding ${o.domain} to session unblock list`);
    n.add(o.domain);
  }
  if (o.type === "geolocate") {
    const s = o.domain;
    const t = Date.now();
    chrome.storage.local.get([ e ], async o => {
      let n = o[e] || {};
      n = a(n);
      if (n[s] && n[s].country) {
        console.log("DEBUG: Valid Cache Hit");
        l({
          country: n[s].country
        });
        return;
      }
      console.log("DEBUG: Cache miss or expired");
      console.log("DEBUG: try geo locate");
      console.log(`DEBUG: Geolocate ${s}`);
      try {
        const o = await fetch(`${c}/api/geo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            domain: s
          })
        });
        if (!o.ok) {
          throw new Error(`HTTP error! status: ${o.status}`);
        }
        const r = await o.json();
        const i = r.country || "Unavailable";
        n[s] = {
          country: i,
          timestamp: t
        };
        chrome.storage.local.set({
          [e]: n
        }, () => {
          l({
            country: i
          });
        });
      } catch (o) {
        console.log("Geo API Error:", o);
        l({
          country: "Unavailable"
        });
      }
    });
  }
  if (o.type === "feedback") {
    const e = o.url;
    const s = o.comment;
    chrome.storage.session.get("sessionId", async o => {
      let t = o["sessionId"] || {};
      console.log(`DEBUG: => URL:${e}`);
      console.log(`DEBUG: => comment:${s}`);
      console.log(`DEBUG: => sessionId:${t}`);
      if (!t) {
        console.log("DEBUG: Invalid or missing session ID.");
        return;
      }
      console.log("DEBUG: send feedback");
      try {
        const o = await fetch(`${c}/api/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: e,
            sessionId: t,
            comment: s
          })
        });
        const n = await o.json();
        console.log(`DEBUG: ${n}`);
        console.log(`DEBUG: ${n.status}`);
        console.log(`DEBUG: ${n.message}`);
        if (n.error) {
          console.log(`DEBUG: ${n.error}`);
        }
        if (n.status === "success") {
          l({
            status: "OK"
          });
        }
      } catch (o) {
        console.log("Feedback failed", o);
      }
    });
  }
  if (o.type === "invalidateTabCache") {
    for (const [e, s] of t.entries()) {
      const n = new URL(s).hostname;
      const c = i(n);
      if (c === o.domain) {
        t.delete(e);
        console.log(`DEBUG: cleared cache for tab ${e} (domain: ${c})`);
        U(o.domain);
      }
    }
  }
  return true;
});