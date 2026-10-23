/**
 * 从后台「更新管理」拉取各端下载地址，覆盖页面上带 data-dl 的链接。
 * 失败时保留 HTML 里写死的兜底 href。
 *
 * data-dl 取值：
 *   chrome | windows | mac | play | apk | desktop
 * （iOS 不走后台，保持页面写死的 TestFlight / IPA）
 * data-dl-sync-text：同步把链接可见文字改成新 URL（用于正文里展示的地址）
 */
(function applyManagedDownloads() {
  const API =
    window.DOWNLOADS_API ||
    'https://serial.babyamy.store/api/extension/latest';

  /** @type {Record<string, { device: string, field?: string }>} */
  const MAP = {
    chrome: { device: 'chrome' },
    windows: { device: 'windows' },
    mac: { device: 'mac' },
    play: { device: 'mobile' },
    apk: { device: 'mobile', field: 'apk_download_url' },
    desktop: { device: 'desktop' },
  };

  const needed = Object.keys(MAP).filter(
    (key) => document.querySelectorAll(`[data-dl="${key}"]`).length > 0
  );
  if (!needed.length) return;

  const cache = Object.create(null);

  function applyUrl(key, url) {
    if (!url) return;
    document.querySelectorAll(`[data-dl="${key}"]`).forEach((el) => {
      if (el.tagName === 'A') {
        el.setAttribute('href', url);
        if (el.hasAttribute('data-dl-sync-text')) {
          el.textContent = url;
        }
      } else if (el.hasAttribute('data-copy')) {
        el.setAttribute('data-copy', url);
      }
    });
  }

  async function fetchDevice(device) {
    if (cache[device]) return cache[device];
    const res = await fetch(`${API}?device=${encodeURIComponent(device)}`, {
      credentials: 'omit',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache[device] = data && data.success ? data : null;
    return cache[device];
  }

  needed.forEach(async (key) => {
    const { device, field = 'download_url' } = MAP[key];
    try {
      const data = await fetchDevice(device);
      const url = data && data[field];
      if (typeof url === 'string' && url.trim()) applyUrl(key, url.trim());
    } catch (_) {
      /* keep hardcoded fallback */
    }
  });
})();
