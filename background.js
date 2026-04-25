importScripts("config.js");

let activeTab = null;
let startTime = Date.now();

function getDomain(url) {
  try { return new URL(url).hostname; }
  catch { return "unknown"; }
}

async function logTime() {
  let duration = Date.now() - startTime;
  let domain = getDomain(activeTab?.url || "");

  let category = getCategory(domain);

  let data = await chrome.storage.local.get(["stats"]);
  let stats = data.stats || {};

  if (!stats[domain]) stats[domain] = { time: 0, category };
  stats[domain].time += duration;

  await chrome.storage.local.set({ stats });

  startTime = Date.now();
}

chrome.tabs.onActivated.addListener(async (info) => {
  await logTime();
  activeTab = await chrome.tabs.get(info.tabId);
});

chrome.tabs.onUpdated.addListener(async (_, change, tab) => {
  if (tab.active && change.status === "complete") {
    await logTime();
    activeTab = tab;
  }
});
