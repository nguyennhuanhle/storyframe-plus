"use strict";

// ------------------------------------------------------------- i18n

const T = {
  "doc.title": { vi: "Storyframe", en: "Storyframe" },
  "tagline": {
    vi: "Biến video đọc truyện thành sách PDF + file nghe MP3 — mọi thứ chạy trên máy của bạn",
    en: "Turn a read-aloud story video into a PDF book + an MP3 — all on your own computer",
  },
  "guide.btn": { vi: "📖 Hướng dẫn sử dụng", en: "📖 User guide" },
  "lang.toggle": { vi: "🌐 English", en: "🌐 Tiếng Việt" },
  "newjob.title": { vi: "Thêm video mới", en: "Add a new video" },
  "input.placeholder": { vi: "Dán link YouTube vào đây...", en: "Paste a YouTube link here..." },
  "or": { vi: "hoặc", en: "or" },
  "file.btn": { vi: "Chọn file", en: "Choose file" },
  "file.title": { vi: "Chọn file video trên máy", en: "Choose a video file on your computer" },
  "caption.label": { vi: "Chữ truyện trên màn hình?", en: "Story text on screen?" },
  "caption.off": { vi: "Video CÓ chữ trên màn hình", en: "Video HAS text on screen" },
  "caption.force": { vi: "Video KHÔNG có chữ (tự tạo phụ đề)", en: "Video has NO text (auto-caption)" },
  "caption.auto": { vi: "Không chắc — tự phát hiện", en: "Not sure — auto-detect" },
  "fast.title": { vi: "Chế độ nhanh", en: "Fast mode" },
  "fast.hint": {
    vi: "(khuyên dùng — tận dụng phụ đề YouTube và bộ nhớ đệm)",
    en: "(recommended — reuse YouTube captions and cache)",
  },
  "advanced.summary": { vi: "Cài đặt nâng cao", en: "Advanced settings" },
  "cookies.label": {
    vi: "Lấy cookies từ trình duyệt <small>(khi YouTube đòi đăng nhập)</small>",
    en: "Use cookies from browser <small>(when YouTube asks you to sign in)</small>",
  },
  "cookies.none": { vi: "Không dùng", en: "None" },
  "keepwork": { vi: "Giữ file tạm để gỡ lỗi", en: "Keep temporary files for debugging" },
  "start.btn": { vi: "Bắt đầu xử lý", en: "Start" },
  "start.sending": { vi: "Đang gửi...", en: "Sending..." },
  "jobs.heading": { vi: "Danh sách xử lý", en: "Processing list" },
  "footer.note": {
    vi: "Chỉ xử lý video mà bạn có quyền tải và sử dụng. Toàn bộ dữ liệu được xử lý ngay trên máy này.",
    en: "Only process videos you have the right to download and use. Everything is processed on this computer.",
  },
  "guide.title": { vi: "📖 Hướng dẫn sử dụng Storyframe", en: "📖 Storyframe user guide" },

  "submit.empty": {
    vi: "Hãy dán link YouTube hoặc bấm 'Chọn file' trước đã.",
    en: "Paste a YouTube link or click 'Choose file' first.",
  },
  "upload.copying": { vi: 'Đang sao chép "{name}"...', en: 'Copying "{name}"...' },
  "upload.done": {
    vi: '✔ Đã chọn: {name} — bấm "Bắt đầu xử lý" để chạy.',
    en: '✔ Selected: {name} — click "Start" to run.',
  },
  "api.error": { vi: "Có lỗi xảy ra.", en: "Something went wrong." },
  "sys.missing": { vi: "⚠ Thiếu công cụ: ", en: "⚠ Missing tools: " },
  "sys.ffmpeg": {
    vi: "ffmpeg (cài bằng: winget install Gyan.FFmpeg)",
    en: "ffmpeg (install: winget install Gyan.FFmpeg)",
  },
  "sys.deno": {
    vi: "deno — cần cho YouTube (cài bằng: winget install DenoLand.Deno)",
    en: "deno — needed for YouTube (install: winget install DenoLand.Deno)",
  },

  "status.queued": { vi: "Đang chờ", en: "Queued" },
  "status.running": { vi: "Đang xử lý", en: "Processing" },
  "status.done": { vi: "Hoàn tất", en: "Done" },
  "status.failed": { vi: "Thất bại", en: "Failed" },
  "status.canceled": { vi: "Đã hủy", en: "Canceled" },

  "stage.download": { vi: "Đang tải video...", en: "Downloading video..." },
  "stage.prepare": { vi: "Đang chuẩn bị...", en: "Preparing..." },
  "stage.pages": { vi: "Đang nhận diện trang sách...", en: "Detecting book pages..." },
  "stage.listen": { vi: "Đang nghe lời đọc (AI)...", en: "Listening to narration (AI)..." },
  "stage.scan": { vi: "Đang quét chữ trên hình (AI)...", en: "Scanning text on frames (AI)..." },
  "stage.select": { vi: "Đang chọn trang đẹp nhất...", en: "Selecting the best pages..." },
  "stage.package": { vi: "Đang đóng gói MP3 và PDF...", en: "Packaging MP3 and PDF..." },
  "stage.default": { vi: "Đang xử lý...", en: "Processing..." },
  "scan.count": { vi: " — {done}/{total} khung hình", en: " — {done}/{total} frames" },

  "pages.count": { vi: "{n} trang", en: "{n} pages" },
  "pdf.btn": { vi: "📄 Mở PDF", en: "📄 Open PDF" },
  "mp3.btn": { vi: "🎵 Tải MP3", en: "🎵 Download MP3" },
  "del.title": { vi: "Xóa dự án", en: "Delete project" },
  "frames.loading": { vi: "Đang tải danh sách trang...", en: "Loading pages..." },
  "frames.info": { vi: "{n} trang trong PDF", en: "{n} pages in the PDF" },
  "frames.review": {
    vi: "{n} trang cần xem lại (viền cam)",
    en: "{n} pages need review (orange outline)",
  },
  "frames.hint": {
    vi: ". Tích chọn trang muốn bỏ rồi bấm nút bên dưới.",
    en: ". Tick pages to remove, then click the button below.",
  },
  "frame.flag": { vi: "cần xem lại", en: "needs review" },
  "remove.btn": { vi: "🗑 Bỏ {n} trang & tạo lại PDF", en: "🗑 Remove {n} pages & rebuild PDF" },
  "restore.btn": { vi: "↩ Khôi phục {n} trang", en: "↩ Restore {n} pages" },
  "removed.heading": {
    vi: "Trang đã bỏ ({n}) — tích chọn rồi bấm Khôi phục nếu đổi ý",
    en: "Removed pages ({n}) — tick and click Restore to undo",
  },
  "cancel.btn": { vi: "✖ Hủy", en: "✖ Cancel" },
  "retry.btn": { vi: "↻ Thử lại", en: "↻ Retry" },
  "delete.btn": { vi: "🗑 Xóa dự án", en: "🗑 Delete project" },
  "log.show": { vi: "📋 Xem nhật ký kỹ thuật", en: "📋 Show technical log" },
  "log.hide": { vi: "Ẩn nhật ký", en: "Hide log" },
  "log.loading": { vi: "Đang tải nhật ký...", en: "Loading log..." },
  "log.empty": { vi: "(chưa có nhật ký)", en: "(no log yet)" },
  "log.error": { vi: "(không tải được nhật ký)", en: "(couldn't load log)" },
  "confirm.delete": {
    vi: "Xóa hẳn dự án này?\n\nToàn bộ ảnh, PDF và MP3 của dự án sẽ bị xóa khỏi máy và KHÔNG thể khôi phục.",
    en: "Permanently delete this project?\n\nAll images, PDF and MP3 for this project will be removed from your computer and CANNOT be recovered.",
  },

  "err.video_unavailable": {
    vi: "Video không tồn tại, đã bị xóa hoặc bị chặn ở khu vực của bạn. Hãy kiểm tra lại đường link.",
    en: "The video doesn't exist, was removed, or is blocked in your region. Check the link.",
  },
  "err.login_required": {
    vi: "YouTube yêu cầu đăng nhập. Mở Cài đặt nâng cao và chọn trình duyệt để lấy cookies.",
    en: "YouTube requires sign-in. Open Advanced settings and pick a browser to use its cookies.",
  },
  "err.no_frames": {
    vi: "Không tìm thấy chữ truyện trên màn hình. Hãy thử lại và chọn 'Video KHÔNG có chữ'.",
    en: "No story text found on screen. Try again and choose 'Video has NO text'.",
  },
  "err.no_audio": {
    vi: "Không nghe được lời đọc trong video. Video có thể không có tiếng nói.",
    en: "Couldn't hear narration in the video. It may have no speech.",
  },
  "err.ffmpeg_missing": {
    vi: "Thiếu ffmpeg trên máy. Cài bằng: winget install Gyan.FFmpeg",
    en: "ffmpeg is missing. Install: winget install Gyan.FFmpeg",
  },
  "err.interrupted": {
    vi: "Phiên làm việc trước bị gián đoạn. Hãy chạy lại.",
    en: "The previous session was interrupted. Please run it again.",
  },
  "err.generic": { vi: "Xử lý thất bại: {detail}", en: "Processing failed: {detail}" },
};

let LANG = localStorage.getItem("storyframe-lang") || "vi";

function t(key, vars) {
  const entry = T[key];
  let s = entry ? entry[LANG] || entry.vi || key : key;
  if (vars) for (const k in vars) s = s.replaceAll("{" + k + "}", vars[k]);
  return s;
}

function applyStaticI18n() {
  document.documentElement.lang = LANG;
  document.title = t("doc.title");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.innerHTML = t(node.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((node) => {
    node.placeholder = t(node.getAttribute("data-i18n-ph"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.getAttribute("data-i18n-title"));
  });
  $("#lang-toggle").textContent = t("lang.toggle");
}

function setLang(lang) {
  LANG = lang;
  localStorage.setItem("storyframe-lang", lang);
  applyStaticI18n();
  renderJobs();
  checkSystem();
  if (!$("#guide-modal").classList.contains("hidden")) renderGuide();
}

const $ = (sel, root) => (root || document).querySelector(sel);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

const STAGES = ["download", "prepare", "pages", "listen", "scan", "select", "package"];

const state = {
  jobs: [],
  expanded: null,
  frames: {},
  logOpen: {},
  selection: {},
  system: {},
};

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let message = t("api.error");
    try {
      const body = await response.json();
      if (body.detail) message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch (_) { /* keep default */ }
    throw new Error(message);
  }
  return response.json();
}

function errorText(job) {
  if (job.error_code && T["err." + job.error_code]) return t("err." + job.error_code);
  if (job.error) return t("err.generic", { detail: job.error });
  return t("err.generic", { detail: "?" });
}

// ---------------------------------------------------------------- system

async function checkSystem() {
  try {
    const sys = await api("/api/system");
    state.system = sys;
    const missing = [];
    if (!sys.ffmpeg || !sys.ffprobe) missing.push(t("sys.ffmpeg"));
    if (!sys.deno) missing.push(t("sys.deno"));
    const banner = $("#system-banner");
    if (missing.length) {
      banner.textContent = t("sys.missing") + missing.join(" · ");
      banner.classList.remove("hidden");
    } else {
      banner.classList.add("hidden");
    }
  } catch (_) { /* server not ready yet */ }
}

// ---------------------------------------------------------------- submit

async function submitJob() {
  const btn = $("#start-btn");
  const label = $("#start-label");
  const errorBox = $("#submit-error");
  errorBox.classList.add("hidden");
  const source = $("#source-input").value.trim();
  if (!source) {
    errorBox.textContent = t("submit.empty");
    errorBox.classList.remove("hidden");
    return;
  }
  btn.disabled = true;
  label.textContent = t("start.sending");
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
    label.textContent = t("start.btn");
  }
}

async function uploadFile(file) {
  const status = $("#upload-status");
  status.textContent = t("upload.copying", { name: file.name });
  status.classList.remove("hidden");
  const form = new FormData();
  form.append("file", file);
  try {
    const result = await api("/api/upload", { method: "POST", body: form });
    $("#source-input").value = result.path;
    status.textContent = t("upload.done", { name: file.name });
  } catch (error) {
    status.textContent = "✖ " + error.message;
  }
}

// ---------------------------------------------------------------- render

function stageBar(job) {
  const wrap = el("div", "stage-row");
  const label = el("div", "stage-label");
  let text = t("stage." + job.stage) || t("stage.default");
  if (job.stage === "scan" && job.scan_total) {
    text += t("scan.count", { done: job.scan_done, total: job.scan_total });
  }
  label.textContent = text;
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

  const pdfBtn = el("button", "btn-result pdf", t("pdf.btn"));
  pdfBtn.onclick = () => window.open(`/api/jobs/${job.id}/file/${encodeURIComponent(baseName(job))}.pdf`, "_blank");
  row.appendChild(pdfBtn);

  const mp3Btn = el("button", "btn-result mp3", t("mp3.btn"));
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
    tile.appendChild(el("div", "frame-flag", t("frame.flag")));
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
    container.appendChild(el("p", "hint", t("frames.loading")));
    return container;
  }

  const reviewCount = data.frames.filter((f) => f.status === "needs_review").length;
  const info = el("div", "review-note");
  info.appendChild(document.createTextNode(t("frames.info", { n: data.frames.length })));
  if (reviewCount) {
    info.appendChild(document.createTextNode(" — "));
    info.appendChild(el("span", "warn-count", t("frames.review", { n: reviewCount })));
  }
  info.appendChild(document.createTextNode(t("frames.hint")));
  container.appendChild(info);

  const grid = el("div", "frames-grid");
  data.frames.forEach((frame, i) => grid.appendChild(frameTile(job, frame, false, i + 1)));
  container.appendChild(grid);

  const selection = state.selection[job.id] || new Set();
  const activeSelected = [...selection].filter((k) => k.startsWith("a:")).map((k) => k.slice(2));
  const removedSelected = [...selection].filter((k) => k.startsWith("r:")).map((k) => k.slice(2));

  const toolbar = el("div", "frames-toolbar");
  const removeBtn = el("button", "btn-sm danger", t("remove.btn", { n: activeSelected.length }));
  removeBtn.disabled = !activeSelected.length;
  removeBtn.onclick = () => frameAction(job.id, "remove", activeSelected);
  toolbar.appendChild(removeBtn);

  if (removedSelected.length) {
    const restoreBtn = el("button", "btn-sm", t("restore.btn", { n: removedSelected.length }));
    restoreBtn.onclick = () => frameAction(job.id, "restore", removedSelected);
    toolbar.appendChild(restoreBtn);
  }
  toolbar.appendChild(el("div", "spacer"));
  container.appendChild(toolbar);

  if (data.removed.length) {
    const removedSection = el("div", "removed-section");
    removedSection.appendChild(el("h4", null, t("removed.heading", { n: data.removed.length })));
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
  if (!window.confirm(t("confirm.delete"))) return;
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
    thumb.onerror = () => thumb.replaceWith(el("div", "job-thumb placeholder", "📖"));
    head.appendChild(thumb);
  } else {
    head.appendChild(el("div", "job-thumb placeholder", STATUS_EMOJI[job.status] || "🎬"));
  }

  head.appendChild(el("div", "job-title", job.title || job.source));
  if (job.status === "done") {
    head.appendChild(el("span", "job-pages", t("pages.count", { n: job.frame_count })));
  }
  head.appendChild(el("span", `badge ${job.status}`, t("status." + job.status)));
  if (job.status !== "running" && job.status !== "queued") {
    const del = el("button", "job-del", "🗑");
    del.title = t("del.title");
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
  if (job.status === "failed") card.appendChild(el("div", "error-box", errorText(job)));

  if (state.expanded === job.id) {
    const body = el("div", "job-body");

    if (job.status === "done") {
      body.appendChild(resultActions(job));
      body.appendChild(framesSection(job));
    }

    const toolbar = el("div", "frames-toolbar");
    if (job.status === "running" || job.status === "queued") {
      const cancelBtn = el("button", "btn-sm danger", t("cancel.btn"));
      cancelBtn.onclick = async (event) => {
        event.stopPropagation();
        try { await api(`/api/jobs/${job.id}/cancel`, { method: "POST" }); } catch (e) { alert(e.message); }
        refreshJobs(true);
      };
      toolbar.appendChild(cancelBtn);
    }
    if (job.status === "failed" || job.status === "canceled") {
      const retryBtn = el("button", "btn-sm", t("retry.btn"));
      retryBtn.onclick = async () => {
        try { await api(`/api/jobs/${job.id}/retry`, { method: "POST" }); } catch (e) { alert(e.message); }
        refreshJobs(true);
      };
      toolbar.appendChild(retryBtn);
    }
    if (job.status !== "running" && job.status !== "queued") {
      const delBtn = el("button", "btn-sm danger", t("delete.btn"));
      delBtn.onclick = () => deleteJob(job.id);
      toolbar.appendChild(delBtn);
    }
    const logBtn = el("button", "btn-sm", state.logOpen[job.id] ? t("log.hide") : t("log.show"));
    logBtn.onclick = () => { state.logOpen[job.id] = !state.logOpen[job.id]; renderJobs(); };
    toolbar.appendChild(logBtn);
    body.appendChild(toolbar);

    if (state.logOpen[job.id]) {
      const logBox = el("div", "log-box", t("log.loading"));
      api(`/api/jobs/${job.id}`).then((detail) => {
        logBox.textContent = (detail.log || []).join("\n") || t("log.empty");
        logBox.scrollTop = logBox.scrollHeight;
      }).catch(() => { logBox.textContent = t("log.error"); });
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

// ---------------------------------------------------------------- guide

// Each section: { install: true } sections are hidden when running as the
// installed desktop app (installation/launch steps don't apply there).
const GUIDE = [
  {
    vi: { h: "1. Storyframe là gì?", b: `<p>Đưa cho Storyframe một video đọc truyện (ví dụ video đọc sách thiếu nhi trên YouTube), nó trả lại:</p><ul><li>📄 một file <b>PDF</b> — mỗi trang truyện là một tấm ảnh</li><li>🎵 một file <b>MP3</b> — phần giọng đọc</li></ul><div class="callout ok">🔒 Mọi thứ xử lý ngay trên máy của bạn. Không gửi dữ liệu lên mạng, trừ khi tải video từ YouTube.</div>` },
    en: { h: "1. What is Storyframe?", b: `<p>Give Storyframe a story video (like the animated read-aloud storybooks on YouTube) and it gives you back:</p><ul><li>📄 a <b>PDF</b> — each page of the story as a picture</li><li>🎵 an <b>MP3</b> — the narration audio</li></ul><div class="callout ok">🔒 Everything runs on your own machine. Nothing is uploaded, except downloading the video from YouTube.</div>` },
  },
  {
    install: true,
    vi: { h: "2. Cài đặt (chỉ làm một lần)", b: `<p>Máy Windows 10/11. Bạn <b>không cần cài gì thủ công</b> — chỉ cần:</p><ol><li>Tải thư mục ứng dụng về và mở nó.</li><li>Nhấp đúp vào <code>start.bat</code>.</li><li>Chờ chuẩn bị xong (lần đầu vài phút), rồi dùng được ngay.</li></ol><div class="callout">💡 Cửa sổ nền đen hiện nhiều chữ khi cài là bình thường — đừng đóng nó khi đang dùng app.</div>` },
    en: { h: "2. Install (one time)", b: `<p>Windows 10/11. You <b>don't install anything by hand</b> — just:</p><ol><li>Download the app folder and open it.</li><li>Double-click <code>start.bat</code>.</li><li>Wait for setup to finish (a few minutes the first time), then it's ready.</li></ol><div class="callout">💡 A black window full of text during setup is normal — don't close it while using the app.</div>` },
  },
  {
    install: true,
    vi: { h: "3. Mở ứng dụng", b: `<ol><li>Nhấp đúp <code>start.bat</code>.</li><li>Sau vài giây, trình duyệt tự mở ứng dụng. Muốn tắt: đóng cửa sổ nền đen.</li></ol>` },
    en: { h: "3. Open the app", b: `<ol><li>Double-click <code>start.bat</code>.</li><li>After a few seconds the app opens in your browser. To close it, close the black window.</li></ol>` },
  },
  {
    vi: { h: "Cách sao chép link YouTube", b: `<p>Mở video trên youtube.com, bấm <b>Chia sẻ</b> dưới video, rồi <b>Sao chép</b> — hoặc chép địa chỉ trên thanh trình duyệt. Link trông giống <code>https://www.youtube.com/watch?v=XXXXXXXXXXX</code>.</p>` },
    en: { h: "Copying a YouTube link", b: `<p>Open the video on youtube.com, click <b>Share</b> below it, then <b>Copy</b> — or copy the address bar. A link looks like <code>https://www.youtube.com/watch?v=XXXXXXXXXXX</code>.</p>` },
  },
  {
    vi: { h: "Xử lý một video", b: `<ol><li><b>Dán link YouTube</b>, hoặc bấm <b>Chọn file</b> để chọn video trên máy.</li><li>Chọn <b>“Chữ truyện trên màn hình?”</b>:<ul><li><b>Video CÓ chữ</b> — lựa chọn thông thường.</li><li><b>Video KHÔNG có chữ</b> — app nghe giọng đọc và tự thêm phụ đề.</li></ul></li><li>Để nguyên <b>Chế độ nhanh</b>.</li><li>Bấm <b>Bắt đầu xử lý</b>.</li></ol>` },
    en: { h: "Process a video", b: `<ol><li><b>Paste a YouTube link</b>, or click <b>Choose file</b> to pick a video on your computer.</li><li>Choose <b>“Story text on screen?”</b>:<ul><li><b>Video HAS text</b> — the usual choice.</li><li><b>Video has NO text</b> — the app listens and adds subtitles.</li></ul></li><li>Leave <b>Fast mode</b> on.</li><li>Click <b>Start</b>.</li></ol>` },
  },
  {
    vi: { h: "Tiến độ & kết quả", b: `<div class="callout warn">⏱️ Video dài có thể mất 10–40 phút — bình thường với AI chạy trên máy. Muốn dừng, bấm <b>Hủy</b>.</div><p>Khi xong (nhãn <b>Hoàn tất</b>): nghe MP3, <b>Mở PDF</b>, hoặc <b>Tải MP3</b>.</p>` },
    en: { h: "Progress & results", b: `<div class="callout warn">⏱️ A long video can take 10–40 minutes — normal for on-device AI. To stop, click <b>Cancel</b>.</div><p>When done (the <b>Done</b> badge): play the MP3, <b>Open PDF</b>, or <b>Download MP3</b>.</p>` },
  },
  {
    vi: { h: "Chỉnh sửa trang & xóa dự án", b: `<ul><li>Trang <b>viền cam “cần xem lại”</b> là trang chưa chắc chắn — nên kiểm tra. Bấm ảnh để phóng to.</li><li>Tích chọn trang thừa rồi bấm <b>Bỏ … trang & tạo lại PDF</b>. Đổi ý thì <b>Khôi phục</b>.</li><li>Bấm <b>🗑</b> để xóa hẳn dự án khỏi máy (không khôi phục được).</li></ul>` },
    en: { h: "Edit pages & delete a project", b: `<ul><li>Pages with an <b>orange “needs review”</b> outline are uncertain — check them. Click a picture to enlarge.</li><li>Tick extra pages and click <b>Remove … pages & rebuild PDF</b>. Changed your mind? <b>Restore</b> them.</li><li>Click <b>🗑</b> to permanently delete a project from your computer (cannot be undone).</li></ul>` },
  },
  {
    vi: { h: "Xử lý sự cố", b: `<ul><li><b>YouTube báo “video không tồn tại”:</b> thường thiếu <code>deno</code>. Cài: <code>winget install DenoLand.Deno</code>.</li><li><b>YouTube đòi đăng nhập:</b> mở <b>Cài đặt nâng cao</b> → chọn trình duyệt để mượn cookies.</li><li><b>Không tìm thấy chữ truyện:</b> thử lại và chọn <b>Video KHÔNG có chữ</b>.</li></ul>` },
    en: { h: "Troubleshooting", b: `<ul><li><b>YouTube says “video not available”:</b> usually <code>deno</code> is missing. Install: <code>winget install DenoLand.Deno</code>.</li><li><b>YouTube asks to sign in:</b> open <b>Advanced settings</b> → pick a browser to borrow cookies.</li><li><b>No story text found:</b> try again and choose <b>Video has NO text</b>.</li></ul>` },
  },
];

function renderGuide() {
  const isDesktop = !!state.system.desktop;
  const html = GUIDE
    .filter((s) => !(s.install && isDesktop))
    .map((s) => `<h3>${s[LANG].h}</h3>${s[LANG].b}`)
    .join("");
  $("#guide-content").innerHTML = html;
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
$("#lang-toggle").onclick = () => setLang(LANG === "vi" ? "en" : "vi");

const guideModal = $("#guide-modal");
$("#guide-btn").onclick = () => { renderGuide(); guideModal.classList.remove("hidden"); };
$("#guide-close").onclick = () => guideModal.classList.add("hidden");
guideModal.onclick = (event) => {
  if (event.target === guideModal) guideModal.classList.add("hidden");
};
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") guideModal.classList.add("hidden");
});

applyStaticI18n();
checkSystem();
refreshJobs(true);
