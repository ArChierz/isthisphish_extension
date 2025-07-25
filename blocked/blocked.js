console.log("DEBUG: BLOCKED RUNNING");

document.addEventListener("DOMContentLoaded", function() {
  const o = document.getElementById("continue");
  const e = document.getElementById("whitelist");
  if (window.top !== window.self) {
    window.location = "about:blank";
  }
  o.addEventListener("click", function() {
    console.log("DEBUG: Continue Clicked");
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(o) {
      if (!o || o.length === 0) {
        console.log("DEBUG: No active tab found.");
        return;
      }
      const e = o[0].id;
      console.log(`currentTabId: ${e}`);
      chrome.storage.session.get([ "blockedTabs" ], function(o) {
        const n = o.blockedTabs || {};
        const t = n[e];
        if (!t) {
          console.log("DEBUG: No blocked info for this tab.");
          return;
        }
        const {domain: c, url: i} = t;
        chrome.storage.local.get([ "blocked", "originalUrl" ], function(o) {
          const t = o.blocked || {};
          const l = o.originalUrl || {};
          if (t[c] && l[c] === i) {
            delete t[c];
            delete l[c];
            chrome.storage.local.set({
              blocked: t,
              originalUrl: l
            }, function() {
              delete n[e];
              chrome.storage.session.set({
                blockedTabs: n
              }, function() {
                chrome.runtime.sendMessage({
                  type: "sessionUnblock",
                  domain: c
                });
                console.log(`DEBUG: Redirecting to ${i}`);
                window.location.href = i;
              });
            });
          } else {
            console.log("DEBUG: No matched domain/url found to unblock.");
          }
        });
      });
    });
  });
  e.addEventListener("click", () => {
    console.log("DEBUG: Whitelist Clicked, go to Options");
    chrome.runtime.openOptionsPage();
  });
});