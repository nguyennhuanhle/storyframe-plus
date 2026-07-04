"use strict";

const STAGES = ["download", "prepare", "pages", "listen", "scan", "select", "package"];
const STAGE_LABELS = {
  download: "Đang tải video...",
  prepare: "Đang chuẩn bị...",
  pages: "Đang nhận diện trang sách...",
  listen: "Đang nghe lời đọc (AI)...",
  scan: "Đang quét chữ trên hình (AI)...",
  select: "Đang chọn trang đẹp nhất...",
  package: "Đang đóng gói MP3 và PDF...",
};
const STATUS_LABELS = {
  queued: "Đang chờ",
  running: "Đang xử lý",
  done: "Hoàn tất",
  failed: "Thất bại",
  canceled: "Đã hủy",
};

const $ = (sel, root) => (root || document).querySelector(sel);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

const state = {
  jobs: [],
  expanded: null,
  frames: {},
  logOpen: {},
  selection: {},
};

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let message = "Có lỗi xảy ra.";
    try {
      const body = await response.json();
      if (body.detail) message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch (_) { /* keep default */ }
    throw new Error(message);
  }
  return response.json();
}

// ---------------------------------------------------------------- system

async function checkSystem() {
  try {
    const sys = await api("/api/system");
    const missing = [];
    if (!sys.ffmpeg || !sys.ffprobe) missing.push("ffmpeg (cài bằng: winget install Gyan.FFmpeg)");
    if (!sys.deno) missing.push("deno — cần cho YouTube (cài bằng: winget install DenoLand.Deno)");
    const banner = $("#system-banner");
    if (missing.length) {
      banner.textContent = "⚠ Thiếu công cụ: " + missing.join(" · ");
      banner.classList.remove("hidden");
    }
  } catch (_) { /* server not ready yet */ }
}

// ---------------------------------------------------------------- submit

async function submitJob() {
  const btn = $("#start-btn");
  const errorBox = $("#submit-error");
  errorBox.classList.add("hidden");
  const source = $("#source-input").value.trim();
  if (!source) {
    errorBox.textContent = "Hãy dán link YouTube hoặc bấm 'Chọn file' trước đã.";
    errorBox.classList.remove("hidden");
    return;
  }
  btn.disabled = true;
  btn.textContent = "Đang gửi...";
  try {
    await api("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source,
        caption_mode: $("#caption-mode").value,
        fast: $("#fast-mode").checked,
        keep_work: $("#keep-work").checked,
        cookies_browser: $("#cookies-browser").value,
      }),
    });
    $("#source-input").value = "";
    $("#upload-status").classList.add("hidden");
    await refreshJobs(true);
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "▶ Bắt đầu xử lý";
  }
}

async function uploadFile(file) {
  const status = $("#upload-status");
  status.textContent = `Đang sao chép "${file.name}" vào vùng làm việc...`;
  status.classList.remove("hidden");
  const form = new FormData();
  form.append("file", file);
  try {
    const result = await api("/api/upload", { method: "POST", body: form });
    $("#source-input").value = result.path;
    status.textContent = `✔ Đã chọn: ${file.name} — bấm "Bắt đầu xử lý" để chạy.`;
  } catch (error) {
    status.textContent = "✖ " + error.message;
  }
}

// ---------------------------------------------------------------- render

function stageBar(job) {
  const wrap = el("div", "stage-row");
  const label = el("div", "stage-label");
  label.textContent = STAGE_LABELS[job.stage] || "Đang xử lý...";
  if (job.detail) label.textContent += " — " + job.detail;
  wrap.appendChild(label);

  const track = el("div", "progress-track");
  const fill = el("div", "progress-fill");
  if (job.stage_progress != null) {
    fill.style.width = Math.round(job.stage_progress * 100) + "%";
  } else {
    fill.classList.add("indeterminate");
    fill.style.width = "30%";
  }
  track.appendChild(fill);
  wrap.appendChild(track);

  const mini = el("div", "stages-mini");
  const currentIndex = STAGES.indexOf(job.stage);
  STAGES.forEach((stage, index) => {
    const seg = el("span");
    if (index < currentIndex) seg.classList.add("past");
    if (index === currentIndex) seg.classList.add("now");
    mini.appendChild(seg);
  });
  wrap.appendChild(mini);
  return wrap;
}

function resultActions(job) {
  const row = el("div", "result-actions");
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";
  audio.src = `/api/jobs/${job.id}/file/${encodeURIComponent(baseName(job))}.mp3`;
  row.appendChild(audio);

  const pdfBtn = el("button", "btn-result pdf", "📄 Mở PDF");
  pdfBtn.onclick = () => window.open(`/api/jobs/${job.id}/file/${encodeURIComponent(baseName(job))}.pdf`, "_blank");
  row.appendChild(pdfBtn);

  const mp3Btn = el("button", "btn-result mp3", "🎵 Tải MP3");
  mp3Btn.onclick = () => {
    const link = document.createElement("a");
    link.href = audio.src;
    link.download = baseName(job) + ".mp3";
    link.click();
  };
  row.appendChild(mp3Btn);
  return row;
}

function baseName(job) {
  const parts = (job.output_dir || "").split(/[\\/]/);
  return parts[parts.length - 1] || "output";
}

function frameTile(job, frame, removed, index) {
  const tile = el("div", "frame-tile" + (frame.status === "needs_review" ? " needs-review" : "") + (removed ? " removed" : ""));
  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = `/api/jobs/${job.id}/file/${removed ? "removed-frames" : "frames"}/${encodeURIComponent(frame.name)}`;
  img.title = frame.transcript;
  img.onclick = () => openLightbox(img.src);
  tile.appendChild(img);

  if (frame.status === "needs_review") {
    tile.appendChild(el("div", "frame-flag", "cần xem lại"));
  }

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "frame-check";
  const selection = state.selection[job.id] || (state.selection[job.id] = new Set());
  const key = (removed ? "r:" : "a:") + frame.name;
  check.checked = selection.has(key);
  check.onchange = () => {
    if (check.checked) selection.add(key); else selection.delete(key);
    renderJobs();
  };
  tile.appendChild(check);

  const caption = el("div", "frame-caption");
  caption.appendChild(el("b", null, index + ". "));
  caption.appendChild(document.createTextNode(frame.transcript || ""));
  tile.appendChild(caption);
  return tile;
}

function framesSection(job) {
  const container = el("div");
  const data = state.frames[job.id];
  if (!data) {
    loadFrames(job.id);
    container.appendChild(el("p", "hint", "Đang tải danh sách trang..."));
    return container;
  }

  const reviewCount = data.frames.filter((f) => f.status === "needs_review").length;
  const info = el("div", "review-note");
  info.appendChild(document.createTextNode(`${data.frames.length} trang trong PDF`));
  if (reviewCount) {
    info.appendChild(document.createTextNode(" — "));
    info.appendChild(el("span", "warn-count", `${reviewCount} trang cần xem lại (viền cam)`));
  }
  info.appendChild(document.createTextNode(". Tích chọn trang muốn bỏ rồi bấm nút bên dưới."));
  container.appendChild(info);

  const grid = el("div", "frames-grid");
  data.frames.forEach((frame, i) => grid.appendChild(frameTile(job, frame, false, i + 1)));
  container.appendChild(grid);

  const selection = state.selection[job.id] || new Set();
  const activeSelected = [...selection].filter((k) => k.startsWith("a:")).map((k) => k.slice(2));
  const removedSelected = [...selection].filter((k) => k.startsWith("r:")).map((k) => k.slice(2));

  const toolbar = el("div", "frames-toolbar");
  const removeBtn = el("button", "btn-sm danger", `🗑 Bỏ ${activeSelected.length} trang & tạo lại PDF`);
  removeBtn.disabled = !activeSelected.length;
  removeBtn.onclick = () => frameAction(job.id, "remove", activeSelected);
  toolbar.appendChild(removeBtn);

  if (removedSelected.length) {
    const restoreBtn = el("button", "btn-sm", `↩ Khôi phục ${removedSelected.length} trang`);
    restoreBtn.onclick = () => frameAction(job.id, "restore", removedSelected);
    toolbar.appendChild(restoreBtn);
  }
  toolbar.appendChild(el("div", "spacer"));
  container.appendChild(toolbar);

  if (data.removed.length) {
    const removedSection = el("div", "removed-section");
    removedSection.appendChild(el("h4", null, `Trang đã bỏ (${data.removed.length}) — tích chọn rồi bấm Khôi phục nếu đổi ý`));
    const removedGrid = el("div", "frames-grid");
    data.removed.forEach((frame, i) => removedGrid.appendChild(frameTile(job, frame, true, i + 1)));
    removedSection.appendChild(removedGrid);
    container.appendChild(removedSection);
  }
  return container;
}

async function frameAction(jobId, action, names) {
  try {
    await api(`/api/jobs/${jobId}/frames/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    state.selection[jobId] = new Set();
    await loadFrames(jobId);
  } catch (error) {
    alert(error.message);
  }
}

async function deleteJob(jobId) {
  const ok = window.confirm(
    "Xóa hẳn dự án này?\n\nToàn bộ ảnh, PDF và MP3 của dự án sẽ bị xóa khỏi máy và KHÔNG thể khôi phục."
  );
  if (!ok) return;
  try {
    await api(`/api/jobs/${jobId}?purge=true`, { method: "DELETE" });
  } catch (error) {
    alert(error.message);
  }
  if (state.expanded === jobId) state.expanded = null;
  delete state.frames[jobId];
  refreshJobs(true);
}

async function loadFrames(jobId) {
  try {
    state.frames[jobId] = await api(`/api/jobs/${jobId}/frames`);
    renderJobs();
  } catch (_) { /* transient */ }
}

const STATUS_EMOJI = { queued: "⏳", running: "⚙️", failed: "⚠️", canceled: "✖", done: "📖" };

function jobCard(job) {
  const card = el("div", "card job-card");
  const head = el("div", "job-head");

  if (job.status === "done") {
    const thumb = document.createElement("img");
    thumb.className = "job-thumb";
    thumb.src = `/api/jobs/${job.id}/thumb`;
    thumb.onerror = () => {
      const ph = el("div", "job-thumb placeholder", "📖");
      thumb.replaceWith(ph);
    };
    head.appendChild(thumb);
  } else {
    head.appendChild(el("div", "job-thumb placeholder", STATUS_EMOJI[job.status] || "🎬"));
  }

  head.appendChild(el("div", "job-title", job.title || job.source));
  if (job.status === "done") {
    head.appendChild(el("span", "job-pages", `${job.frame_count} trang`));
  }
  head.appendChild(el("span", `badge ${job.status}`, STATUS_LABELS[job.status] || job.status));
  if (job.status !== "running" && job.status !== "queued") {
    const del = el("button", "job-del", "🗑");
    del.title = "Xóa dự án";
    del.onclick = (event) => { event.stopPropagation(); deleteJob(job.id); };
    head.appendChild(del);
  }
  head.onclick = () => {
    state.expanded = state.expanded === job.id ? null : job.id;
    if (state.expanded === job.id && job.status === "done") loadFrames(job.id);
    renderJobs();
  };
  card.appendChild(head);

  if (job.status === "running") card.appendChild(stageBar(job));
  if (job.status === "failed" && job.error) {
    const box = el("div", "error-box", job.error);
    card.appendChild(box);
  }

  const showBody = state.expanded === job.id || (job.status === "running" && state.expanded === null);
  if (state.expanded === job.id) {
    const body = el("div", "job-body");

    if (job.status === "done") {
      body.appendChild(resultActions(job));
      body.appendChild(framesSection(job));
    }

    const toolbar = el("div", "frames-toolbar");
    if (job.status === "running" || job.status === "queued") {
      const cancelBtn = el("button", "btn-sm danger", "✖ Hủy");
      cancelBtn.onclick = async (event) => {
        event.stopPropagation();
        try { await api(`/api/jobs/${job.id}/cancel`, { method: "POST" }); } catch (e) { alert(e.message); }
        refreshJobs(true);
      };
      toolbar.appendChild(cancelBtn);
    }
    if (job.status === "failed" || job.status === "canceled") {
      const retryBtn = el("button", "btn-sm", "↻ Thử lại");
      retryBtn.onclick = async () => {
        try { await api(`/api/jobs/${job.id}/retry`, { method: "POST" }); } catch (e) { alert(e.message); }
        refreshJobs(true);
      };
      toolbar.appendChild(retryBtn);
    }
    if (job.status !== "running" && job.status !== "queued") {
      const delBtn = el("button", "btn-sm danger", "🗑 Xóa dự án");
      delBtn.onclick = () => deleteJob(job.id);
      toolbar.appendChild(delBtn);
    }
    const logBtn = el("button", "btn-sm", state.logOpen[job.id] ? "Ẩn nhật ký" : "📋 Xem nhật ký kỹ thuật");
    logBtn.onclick = async () => {
      state.logOpen[job.id] = !state.logOpen[job.id];
      renderJobs();
    };
    toolbar.appendChild(logBtn);
    body.appendChild(toolbar);

    if (state.logOpen[job.id]) {
      const logBox = el("div", "log-box", "Đang tải nhật ký...");
      api(`/api/jobs/${job.id}`).then((detail) => {
        logBox.textContent = (detail.log || []).join("\n") || "(chưa có nhật ký)";
        logBox.scrollTop = logBox.scrollHeight;
      }).catch(() => { logBox.textContent = "(không tải được nhật ký)"; });
      body.appendChild(logBox);
    }
    card.appendChild(body);
  }
  return card;
}

function renderJobs() {
  const list = $("#jobs-list");
  const heading = $("#jobs-heading");
  list.innerHTML = "";
  heading.classList.toggle("hidden", !state.jobs.length);
  state.jobs.forEach((job) => list.appendChild(jobCard(job)));
}

// ---------------------------------------------------------------- polling

let pollTimer = null;

async function refreshJobs(immediate) {
  try {
    state.jobs = await api("/api/jobs");
    renderJobs();
  } catch (_) { /* server restarting */ }
  const anyActive = state.jobs.some((j) => j.status === "running" || j.status === "queued");
  clearTimeout(pollTimer);
  pollTimer = setTimeout(() => refreshJobs(false), anyActive ? 1500 : 6000);
}

// ---------------------------------------------------------------- lightbox

function openLightbox(src) {
  const overlay = el("div", "lightbox");
  const img = document.createElement("img");
  img.src = src;
  overlay.appendChild(img);
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

// ---------------------------------------------------------------- init

$("#start-btn").onclick = submitJob;
$("#upload-btn").onclick = () => $("#file-input").click();
$("#file-input").onchange = (event) => {
  if (event.target.files.length) uploadFile(event.target.files[0]);
};
$("#source-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitJob();
});

const guideModal = $("#guide-modal");
$("#guide-btn").onclick = () => guideModal.classList.remove("hidden");
$("#guide-close").onclick = () => guideModal.classList.add("hidden");
guideModal.onclick = (event) => {
  if (event.target === guideModal) guideModal.classList.add("hidden");
};
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") guideModal.classList.add("hidden");
});

checkSystem();
refreshJobs(true);
