const storageKey = "yellowstone-trip-checklist-v1";

function activateTab(button) {
  const group = button.dataset.tabGroup;
  const target = button.dataset.tabTarget;

  document.querySelectorAll(`[data-tab-group="${group}"]`).forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  document.querySelectorAll(`[data-tab-panel="${group}"]`).forEach((panel) => {
    panel.hidden = panel.id !== target;
  });
}

document.querySelectorAll("[data-tab-target]").forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const groupTabs = [...document.querySelectorAll(`[data-tab-group="${button.dataset.tabGroup}"]`)];
    const currentIndex = groupTabs.indexOf(button);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = groupTabs[(currentIndex + direction + groupTabs.length) % groupTabs.length];
    next.focus();
    activateTab(next);
  });
});

const checklist = [...document.querySelectorAll("[data-check-id]")];
const progressLabel = document.querySelector("#checklistProgress");
const progressBar = document.querySelector("#progressBar");

function readChecklist() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function renderProgress() {
  const complete = checklist.filter((item) => item.checked).length;
  const percent = checklist.length ? Math.round((complete / checklist.length) * 100) : 0;
  progressLabel.textContent = `${complete} of ${checklist.length} complete`;
  progressBar.style.width = `${percent}%`;
}

const savedChecklist = readChecklist();
checklist.forEach((item) => {
  item.checked = Boolean(savedChecklist[item.dataset.checkId]);
  item.addEventListener("change", () => {
    const state = readChecklist();
    state[item.dataset.checkId] = item.checked;
    localStorage.setItem(storageKey, JSON.stringify(state));
    renderProgress();
  });
});
renderProgress();

document.querySelector("#resetChecklist")?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  localStorage.removeItem(storageKey);
  checklist.forEach((item) => { item.checked = false; });
  renderProgress();
});

const shareButton = document.querySelector("#sharePage");
shareButton?.addEventListener("click", async () => {
  const originalText = shareButton.textContent;
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    shareButton.textContent = "Link copied";
  } catch (error) {
    if (error?.name !== "AbortError") shareButton.textContent = "Copy the address above";
  } finally {
    window.setTimeout(() => { shareButton.textContent = originalText; }, 2200);
  }
});
