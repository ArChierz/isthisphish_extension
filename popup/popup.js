console.log("DEBUG: RUNNING");

document.addEventListener("DOMContentLoaded", function() {
  const e = document.getElementById("domain");
  const t = document.getElementById("country");
  const n = document.getElementById("url");
  const o = document.getElementById("reason");
  const c = document.getElementById("submitReason");
  function s(e) {
    const t = document.createElement("div");
    t.textContent = e;
    return t.innerHTML;
  }
  function r(e, t, n) {
    console.log("DEBUG: unblockedSection run");
    const o = document.querySelector("table");
    const c = document.createElement("tr");
    c.innerHTML = `\n            <td class="label">Unblock this site</td>\n            <td>\n                <span id="unblockSite" style="color:blue; cursor:pointer; text-decoration:underline;"> Click Here! </span>\n            </td>\n        `;
    o.appendChild(c);
    document.getElementById("unblockSite").addEventListener("click", function() {
      console.log("DEBUG: unblocksection storage remove");
      chrome.storage.local.get([ "blocked", "originalUrl" ], function(o) {
        const c = o.blocked || {};
        const s = o.originalUrl || {};
        delete c[t];
        delete s[t];
        chrome.storage.local.set({
          blocked: c,
          originalUrl: s
        }, function() {
          chrome.runtime.sendMessage({
            type: "sessionUnblock",
            domain: t
          });
          if (n) {
            chrome.tabs.update(e, {
              url: n
            });
          } else {
            chrome.tabs.reload(e);
          }
        });
      });
    });
  }
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(l) {
    if (l && l[0]) {
      const a = l[0].id;
      const i = l[0].url;
      const d = new URL(i);
      const u = d.hostname;
      chrome.storage.session.get([ "blockedTabs" ], function(t) {
        const o = t.blockedTabs || {};
        const c = o[a];
        if (c) {
          const {domain: t, url: o} = c;
          e.textContent = s(t);
          n.textContent = s(o);
          n.title = o;
          console.log("DEBUG: show unblock section");
          r(a, t, o);
        } else {
          e.textContent = s(u);
          n.textContent = s(i);
          n.title = i;
        }
      });
      chrome.runtime.sendMessage({
        type: "geolocate",
        domain: u
      }, function(e) {
        if (chrome.runtime.lastError) {
          console.error("Message error:", chrome.runtime.lastError.message);
          t.textContent = "Unavailable";
        }
        if (e && e.country) {
          t.textContent = e.country;
        } else {
          t.textContent = "Unavailable";
        }
      });
      c.addEventListener("click", function() {
        const e = o.value;
        feedback = s(e);
        console.log("Reason submitted:", feedback);
        const t = new URL(n.textContent);
        chrome.runtime.sendMessage({
          type: "feedback",
          url: t,
          comment: feedback
        }, function(e) {
          if (chrome.runtime.lastError) {
            console.error("Message error:", chrome.runtime.lastError.message);
          }
          if (e && e.status === "OK") {
            const e = document.getElementById("feedbackResult");
            e.style.display = "block";
            e.textContent = "✅ Report submitted!";
          }
        });
      });
    } else {
      e.textContent = "Unavailable";
      n.textContent = "Unavailable";
      t.textContent = "Unavailable";
    }
  });
});