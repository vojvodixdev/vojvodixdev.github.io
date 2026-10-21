(() => {
  // js/util.js
  var HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
  }
  function workId(key) {
    return String(key ?? "").split("/").filter(Boolean).pop() || "";
  }
  function isWorkId(id) {
    return /^OL\d+W$/.test(String(id));
  }
  function hashString(text2) {
    let hash = 2166136261;
    const str = String(text2 ?? "");
    for (let i = 0; i < str.length; i += 1) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function truncate(text2, max) {
    const str = String(text2 ?? "");
    return str.length > max ? `${str.slice(0, max - 1).trimEnd()}\u2026` : str;
  }
  function debounce(fn, wait) {
    let timer = null;
    const debounced = (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
    debounced.flush = (...args) => {
      clearTimeout(timer);
      fn(...args);
    };
    return debounced;
  }
  function localeFor(lang) {
    return lang === "en" ? "en-GB" : "sr-Latn-RS";
  }
  function formatNumber(value, lang, options) {
    return new Intl.NumberFormat(localeFor(lang), options).format(value);
  }
  var MARC_TO_ISO = {
    ger: "de",
    fre: "fr",
    chi: "zh",
    dut: "nl",
    cze: "cs",
    gre: "el",
    rum: "ro",
    mac: "mk",
    per: "fa",
    arm: "hy",
    geo: "ka",
    ice: "is",
    alb: "sq",
    baq: "eu",
    bur: "my",
    wel: "cy",
    slo: "sk",
    tib: "bo",
    mao: "mi",
    may: "ms",
    scc: "sr",
    scr: "hr"
  };
  function languageName(code, lang) {
    const raw = String(code ?? "").toLowerCase();
    if (!raw) return "";
    const iso = MARC_TO_ISO[raw] || raw;
    try {
      const names = new Intl.DisplayNames([localeFor(lang)], { type: "language" });
      const name = names.of(iso);
      if (name && name.toLowerCase() !== iso) return name.charAt(0).toLocaleUpperCase(localeFor(lang)) + name.slice(1);
    } catch {
    }
    return raw.toUpperCase();
  }
  function isoDate(date = /* @__PURE__ */ new Date()) {
    return date.toISOString().slice(0, 10);
  }

  // js/api.js
  var API_ROOT = "https://openlibrary.org";
  var COVERS_ROOT = "https://covers.openlibrary.org";
  var PAGE_SIZE = 24;
  var SEARCH_FIELDS = [
    "key",
    "title",
    "author_name",
    "first_publish_year",
    "cover_i",
    "edition_count",
    "language",
    "number_of_pages_median",
    "ratings_average",
    "ratings_count",
    "ebook_access"
  ].join(",");
  var SORTS = ["relevance", "rating", "editions", "new", "old"];
  var OfflineError = class extends Error {
    constructor() {
      super("offline");
      this.name = "OfflineError";
    }
  };
  var ApiError = class extends Error {
    constructor(message, status) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  };
  function phrase(value) {
    return `"${String(value).replace(/["\\]/g, "")}"`;
  }
  function buildSearchUrl({
    q = "",
    author = "",
    subject = "",
    sort = "relevance",
    lang = "",
    from = "",
    to = "",
    ebooks = false,
    page = 1
  } = {}) {
    const clauses = [];
    if (q.trim()) clauses.push(q.trim());
    if (subject) clauses.push(`subject:${phrase(subject)}`);
    if (lang) clauses.push(`language:${lang}`);
    if (from || to) clauses.push(`first_publish_year:[${from || "*"} TO ${to || "*"}]`);
    if (ebooks) clauses.push("ebook_access:[borrowable TO *]");
    const params = new URLSearchParams();
    if (clauses.length) params.set("q", clauses.join(" "));
    if (author) params.set("author", author);
    if (sort && sort !== "relevance" && SORTS.includes(sort)) params.set("sort", sort);
    params.set("fields", SEARCH_FIELDS);
    params.set("limit", String(PAGE_SIZE));
    params.set("page", String(page));
    return `${API_ROOT}/search.json?${params}`;
  }
  function workUrl(id) {
    return `${API_ROOT}/works/${id}.json`;
  }
  function trendingUrl(limit = 18) {
    return `${API_ROOT}/trending/daily.json?limit=${limit}`;
  }
  function workSummaryUrl(id) {
    const params = new URLSearchParams({ q: `key:/works/${id}`, fields: SEARCH_FIELDS, limit: "1" });
    return `${API_ROOT}/search.json?${params}`;
  }
  function coverUrl(coverId, size = "M") {
    return coverId ? `${COVERS_ROOT}/b/id/${coverId}-${size}.jpg?default=false` : null;
  }
  function openLibraryUrl(key) {
    return `${API_ROOT}/works/${workId(key)}`;
  }
  function normalizeWork(doc = {}) {
    const key = String(doc.key ?? "");
    const authors = Array.isArray(doc.author_name) ? doc.author_name : (doc.authors || []).map((a) => a?.name).filter(Boolean);
    const rating = Number(doc.ratings_average);
    return {
      key: key.startsWith("/works/") ? key : `/works/${workId(key)}`,
      title: String(doc.title ?? "").trim(),
      authors: authors.slice(0, 5),
      year: Number.isFinite(doc.first_publish_year) ? doc.first_publish_year : null,
      coverId: doc.cover_i ?? doc.cover_id ?? null,
      editions: Number.isFinite(doc.edition_count) ? doc.edition_count : null,
      pages: Number.isFinite(doc.number_of_pages_median) ? doc.number_of_pages_median : null,
      rating: Number.isFinite(rating) && rating > 0 ? Math.round(rating * 10) / 10 : null,
      ratingCount: Number.isFinite(doc.ratings_count) ? doc.ratings_count : 0,
      languages: Array.isArray(doc.language) ? doc.language.slice(0, 12) : [],
      ebook: doc.ebook_access || "no_ebook"
    };
  }
  function normalizeWorkDetails(work = {}) {
    const text2 = (v) => typeof v === "string" ? v : v?.value || "";
    return {
      description: cleanDescription(text2(work.description)),
      firstSentence: text2(work.first_sentence),
      subjects: Array.isArray(work.subjects) ? [...new Set(work.subjects)].slice(0, 14) : [],
      coverId: Array.isArray(work.covers) ? work.covers.find((c) => c > 0) ?? null : null,
      title: work.title || ""
    };
  }
  function cleanDescription(text2) {
    return String(text2).replace(/\r/g, "").split(/\n-{3,}\n|\n\*\*Contains\*\*|\n\(\[source\]/)[0].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\n{3,}/g, "\n\n").trim();
  }
  function createApi({ fetchImpl = (...args) => fetch(...args), ttl = 5 * 60 * 1e3 } = {}) {
    const memo = /* @__PURE__ */ new Map();
    async function getJson(url, signal) {
      const hit = memo.get(url);
      if (hit && Date.now() - hit.time < ttl) return hit.data;
      let response;
      try {
        response = await fetchImpl(url, { signal, headers: { Accept: "application/json" } });
      } catch (error) {
        if (error?.name === "AbortError") throw error;
        if (typeof navigator !== "undefined" && navigator.onLine === false) throw new OfflineError();
        throw new ApiError(error?.message || "network", 0);
      }
      if (!response.ok) {
        if (response.status === 503) {
          const body = await response.json().catch(() => null);
          if (body?.offline) throw new OfflineError();
        }
        throw new ApiError(`HTTP ${response.status}`, response.status);
      }
      const data = await response.json();
      memo.set(url, { time: Date.now(), data });
      if (memo.size > 60) memo.delete(memo.keys().next().value);
      return data;
    }
    return {
      async search(state, signal) {
        const data = await getJson(buildSearchUrl(state), signal);
        const items = (data.docs || []).map(normalizeWork).filter((b) => b.title);
        return { total: data.numFound ?? data.num_found ?? items.length, items };
      },
      async trending(signal) {
        const data = await getJson(trendingUrl(), signal);
        return (data.works || []).map(normalizeWork).filter((b) => b.title);
      },
      async workSummary(id, signal) {
        const data = await getJson(workSummaryUrl(id), signal);
        const doc = (data.docs || [])[0];
        return doc ? normalizeWork(doc) : null;
      },
      async workDetails(id, signal) {
        return normalizeWorkDetails(await getJson(workUrl(id), signal));
      }
    };
  }

  // js/store.js
  var STORAGE_KEY = "knjigoteka:v2";
  var LEGACY_KEY = "knjigoteka-lista";
  var STATUSES = ["want", "reading", "read"];
  var MAX_RECENT = 6;
  var MAX_NOTE = 2e3;
  function emptyData() {
    return { version: 2, books: [], recent: [], settings: {} };
  }
  function sanitizeShelfBook(input, now = Date.now()) {
    if (!input || typeof input !== "object") return null;
    const base = normalizeWork({
      ...input,
      cover_i: input.coverId ?? input.cover_i,
      author_name: input.authors ?? input.author_name,
      first_publish_year: input.year ?? input.first_publish_year,
      edition_count: input.editions ?? input.edition_count,
      number_of_pages_median: input.pages ?? input.number_of_pages_median,
      ratings_average: input.rating ?? input.ratings_average,
      ratings_count: input.ratingCount ?? input.ratings_count,
      ebook_access: input.ebook ?? input.ebook_access,
      language: input.languages ?? input.language
    });
    if (!isWorkId(workId(base.key)) || !base.title) return null;
    const status = STATUSES.includes(input.status) ? input.status : "want";
    const rating = Number.isInteger(input.myRating) ? input.myRating : 0;
    const time = (v) => Number.isFinite(v) && v > 0 ? v : null;
    return {
      ...base,
      title: base.title.slice(0, 300),
      status,
      myRating: Math.min(5, Math.max(0, rating)),
      note: typeof input.note === "string" ? input.note.slice(0, MAX_NOTE) : "",
      addedAt: time(input.addedAt) ?? now,
      updatedAt: time(input.updatedAt) ?? now,
      finishedAt: status === "read" ? time(input.finishedAt) ?? now : null
    };
  }
  function createStore(storage, { now = () => Date.now() } = {}) {
    const listeners = /* @__PURE__ */ new Set();
    let data = load();
    function load() {
      try {
        const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
        if (parsed?.version === 2 && Array.isArray(parsed.books)) {
          return {
            ...emptyData(),
            ...parsed,
            books: parsed.books.map((b) => sanitizeShelfBook(b, now())).filter(Boolean),
            recent: Array.isArray(parsed.recent) ? parsed.recent.filter((r) => typeof r === "string").slice(0, MAX_RECENT) : [],
            settings: parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {}
          };
        }
      } catch {
      }
      const fresh = emptyData();
      try {
        const legacy = JSON.parse(storage.getItem(LEGACY_KEY));
        if (Array.isArray(legacy)) {
          const t = now();
          fresh.books = legacy.map((doc, i) => sanitizeShelfBook({ ...doc, status: "want", addedAt: t - i }, t)).filter(Boolean);
        }
      } catch {
      }
      return fresh;
    }
    function persist() {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
      }
      listeners.forEach((fn) => fn(data));
    }
    const find = (key) => data.books.find((b) => b.key === key) || null;
    return {
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      get books() {
        return data.books;
      },
      get recent() {
        return data.recent;
      },
      get settings() {
        return data.settings;
      },
      get: find,
      has: (key) => Boolean(find(key)),
      add(book, status = "want") {
        if (find(book.key)) return this.setStatus(book.key, status);
        const t = now();
        const entry = sanitizeShelfBook({ ...book, status, addedAt: t, updatedAt: t, finishedAt: status === "read" ? t : null }, t);
        if (!entry) return null;
        data.books = [entry, ...data.books];
        persist();
        return entry;
      },
      remove(key) {
        const removed = find(key);
        if (!removed) return null;
        data.books = data.books.filter((b) => b.key !== key);
        persist();
        return removed;
      },
      /** Puts a removed book back exactly where it was (used by "Undo"). */
      restore(book, index = 0) {
        if (!book || find(book.key)) return;
        const books = [...data.books];
        books.splice(Math.min(index, books.length), 0, book);
        data.books = books;
        persist();
      },
      indexOf(key) {
        return data.books.findIndex((b) => b.key === key);
      },
      update(key, patch) {
        const book = find(key);
        if (!book) return null;
        const next = { ...book, ...patch, updatedAt: now() };
        if (patch.status) {
          next.finishedAt = patch.status === "read" ? book.finishedAt ?? now() : null;
        }
        if (typeof next.note === "string") next.note = next.note.slice(0, MAX_NOTE);
        next.myRating = Math.min(5, Math.max(0, Number(next.myRating) || 0));
        data.books = data.books.map((b) => b.key === key ? next : b);
        persist();
        return next;
      },
      setStatus(key, status) {
        if (!STATUSES.includes(status)) return null;
        return this.update(key, { status });
      },
      counts() {
        const counts = { all: data.books.length, want: 0, reading: 0, read: 0 };
        data.books.forEach((b) => {
          counts[b.status] += 1;
        });
        return counts;
      },
      stats(year2 = new Date(now()).getFullYear()) {
        const read = data.books.filter((b) => b.status === "read");
        const rated = data.books.filter((b) => b.myRating > 0);
        return {
          total: data.books.length,
          readThisYear: read.filter((b) => b.finishedAt && new Date(b.finishedAt).getFullYear() === year2).length,
          pagesRead: read.reduce((sum, b) => sum + (b.pages || 0), 0),
          averageRating: rated.length ? rated.reduce((s, b) => s + b.myRating, 0) / rated.length : null
        };
      },
      addRecent(query) {
        const q = String(query ?? "").trim();
        if (!q) return;
        data.recent = [q, ...data.recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
        persist();
      },
      clearRecent() {
        data.recent = [];
        persist();
      },
      setSetting(name, value) {
        data.settings = { ...data.settings, [name]: value };
        persist();
      },
      exportJson() {
        return JSON.stringify({ app: "knjigoteka", version: 2, exportedAt: new Date(now()).toISOString(), books: data.books }, null, 2);
      },
      /**
       * Merges books from an exported file. Existing books are replaced only if
       * the imported copy is newer. Returns { added, updated, skipped }.
       */
      importJson(text2) {
        let parsed;
        try {
          parsed = JSON.parse(text2);
        } catch {
          throw new Error("invalid-json");
        }
        const incoming = Array.isArray(parsed) ? parsed : parsed?.books;
        if (!Array.isArray(incoming)) throw new Error("invalid-format");
        const result = { added: 0, updated: 0, skipped: 0 };
        const books = [...data.books];
        incoming.forEach((raw) => {
          const book = sanitizeShelfBook(raw, now());
          if (!book) {
            result.skipped += 1;
            return;
          }
          const i = books.findIndex((b) => b.key === book.key);
          if (i === -1) {
            books.push(book);
            result.added += 1;
          } else if (book.updatedAt > books[i].updatedAt) {
            books[i] = book;
            result.updated += 1;
          } else result.skipped += 1;
        });
        data.books = books.sort((a, b) => b.addedAt - a.addedAt);
        persist();
        return result;
      }
    };
  }

  // js/router.js
  var SHELF_VIEWS = ["spines", "grid"];
  var SHELF_SORTS = ["added", "title", "author", "rating"];
  var text = (value, max = 200) => String(value ?? "").trim().slice(0, max);
  var year = (value) => /^-?\d{1,4}$/.test(String(value ?? "")) ? String(value) : "";
  function readSearchParams(params) {
    const sort = params.get("sort");
    const lang = params.get("lang");
    return {
      q: text(params.get("q")),
      author: text(params.get("author")),
      subject: text(params.get("subject")),
      sort: SORTS.includes(sort) ? sort : "relevance",
      lang: /^[a-z]{3}$/.test(lang ?? "") ? lang : "",
      from: year(params.get("from")),
      to: year(params.get("to")),
      ebooks: params.get("ebooks") === "1"
    };
  }
  function hasSearch(params) {
    return Boolean(params.q || params.author || params.subject);
  }
  function activeFilterCount(params) {
    return [params.lang, params.from || params.to, params.ebooks].filter(Boolean).length;
  }
  function parseRoute(hash = "") {
    const raw = String(hash).replace(/^#/, "") || "/";
    const [path, query = ""] = raw.split("?");
    const params = new URLSearchParams(query);
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return { name: "home", params: {} };
    switch (segments[0]) {
      case "search":
        return { name: "search", params: readSearchParams(params) };
      case "shelf": {
        const status = params.get("status");
        const view2 = params.get("view");
        const sort = params.get("sort");
        return {
          name: "shelf",
          params: {
            status: STATUSES.includes(status) ? status : "all",
            view: SHELF_VIEWS.includes(view2) ? view2 : "spines",
            sort: SHELF_SORTS.includes(sort) ? sort : "added"
          }
        };
      }
      case "book":
        return isWorkId(segments[1]) ? { name: "book", params: { id: segments[1] } } : { name: "notfound", params: {} };
      default:
        return { name: "notfound", params: {} };
    }
  }
  function searchHash(params = {}) {
    const query = new URLSearchParams();
    ["q", "author", "subject", "sort", "lang", "from", "to"].forEach((name) => {
      const value = params[name];
      if (!value) return;
      if (name === "sort" && value === "relevance") return;
      query.set(name, String(value));
    });
    if (params.ebooks) query.set("ebooks", "1");
    const qs = query.toString();
    return qs ? `#/search?${qs}` : "#/search";
  }
  function shelfHash({ status = "all", view: view2 = "spines", sort = "added" } = {}) {
    const query = new URLSearchParams();
    if (status !== "all") query.set("status", status);
    if (view2 !== "spines") query.set("view", view2);
    if (sort !== "added") query.set("sort", sort);
    const qs = query.toString();
    return qs ? `#/shelf?${qs}` : "#/shelf";
  }
  function bookHash(key) {
    return `#/book/${workId(key)}`;
  }

  // js/i18n.js
  var MESSAGES = {
    sr: {
      "app.skip": "Presko\u010Di na sadr\u017Eaj",
      "app.offline": "Nema interneta. Polica i ranije otvorene stranice i dalje rade.",
      "app.install": "Instaliraj",
      "theme.toDark": "Uklju\u010Di tamni re\u017Eim",
      "theme.toLight": "Uklju\u010Di svetli re\u017Eim",
      "lang.switch": "Switch to English",
      "footer.text": "Knjigoteka je progresivna web aplikacija. Radi i bez interneta i mo\u017Ee da se instalira.",
      "footer.source": "Podaci: Open Library",
      "nav.label": "Glavna navigacija",
      "nav.discover": "Otkrij",
      "nav.search": "Pretraga",
      "nav.shelf": "Moja polica",
      "home.docTitle": "Otkrij knjige",
      "home.title": "\u0160ta \u010Dita\u0161 slede\u0107e?",
      "home.lead": "Pretra\u017Ei katalog Open Library, sa\u010Duvaj knjige na svoju policu i prati \u0161ta si pro\u010Ditao. Sve sa\u010Duvano radi i bez interneta.",
      "home.recent": "Nedavno",
      "home.clearRecent": "Obri\u0161i",
      "home.openShelf": "Otvori moju policu",
      "home.shelfCaption": { one: "{count} knjiga na tvojoj polici", few: "{count} knjige na tvojoj polici", other: "{count} knjiga na tvojoj polici" },
      "home.shelfEmpty": "Tvoja polica \u010Deka prvu knjigu",
      "home.topics": "Teme",
      "home.reading": "Trenutno \u010Dita\u0161",
      "home.trending": "Popularno danas",
      "home.trendingNote": "Knjige koje \u010Ditaoci Open Library najvi\u0161e otvaraju danas",
      "topic.fantasy": "Fantastika",
      "topic.scifi": "Nau\u010Dna fantastika",
      "topic.mystery": "Misterija i krimi",
      "topic.love": "Ljubavni romani",
      "topic.history": "Istorija",
      "topic.philosophy": "Filozofija",
      "topic.poetry": "Poezija",
      "topic.biography": "Biografije",
      "topic.psychology": "Psihologija",
      "topic.children": "Za decu",
      "search.label": "Pretra\u017Ei knjige",
      "search.placeholder": "Naslov, autor ili tema",
      "search.shortcut": "Pritisni / za pretragu",
      "search.submit": "Tra\u017Ei",
      "search.title": "Pretraga",
      "search.titleFor": "Rezultati za \u201E{q}\u201D",
      "search.loading": "U\u010Ditavam\u2026",
      "search.count": { one: "Prikazano {shown} od {total} rezultata", few: "Prikazano {shown} od {total} rezultata", other: "Prikazano {shown} od {total} rezultata" },
      "search.more": "Prika\u017Ei jo\u0161",
      "search.end": "To su svi rezultati.",
      "search.emptyTitle": "Nema rezultata",
      "search.emptyText": "Proveri pravopis ili probaj kra\u0107i pojam, na primer samo prezime autora.",
      "search.emptyWithFilters": "Nijedna knjiga ne odgovara pojmu i izabranim filterima. Ukloni filtere da pro\u0161iri\u0161 pretragu.",
      "search.startTitle": "\u0160ta tra\u017Ei\u0161?",
      "search.startText": "Upi\u0161i naslov, autora ili temu, ili izaberi jednu od tema.",
      "sort.label": "Redosled",
      "sort.relevance": "Najrelevantnije",
      "sort.rating": "Najbolje ocenjene",
      "sort.editions": "Najvi\u0161e izdanja",
      "sort.new": "Najnovije",
      "sort.old": "Najstarije",
      "filters.title": "Filteri",
      "filters.language": "Jezik izdanja",
      "filters.anyLanguage": "Bilo koji jezik",
      "filters.year": "Godina prvog izdanja",
      "filters.from": "Od",
      "filters.to": "Do",
      "filters.ebooks": "Samo knjige koje mogu da se \u010Ditaju online",
      "filters.ebooksShort": "\u010Citanje online",
      "filters.apply": "Primeni",
      "filters.reset": "Ukloni filtere",
      "filters.active": "Aktivni filteri",
      "filters.remove": "Ukloni filter: {label}",
      "filters.topic": "Tema",
      "filters.author": "Autor",
      "error.offlineTitle": "Nema interneta",
      "error.offlineSearch": "Ova pretraga nije ranije sa\u010Duvana. Ranije pretrage i tvoja polica rade i bez interneta.",
      "error.apiTitle": "Open Library ne odgovara",
      "error.apiText": "Servis je trenutno spor ili nedostupan. Poku\u0161aj ponovo za koji trenutak.",
      "error.retry": "Poku\u0161aj ponovo",
      "card.add": "Sa\u010Duvaj na policu: {title}",
      "card.remove": "Ukloni sa police: {title}",
      "book.unknownAuthor": "Nepoznat autor",
      "book.firstPublished": "Prvo izdanje",
      "book.editions": "Broj izdanja",
      "book.pages": "Strana (prose\u010Dno)",
      "book.communityRating": "Ocena \u010Ditalaca",
      "book.ratingCount": { one: "{count} ocena", few: "{count} ocene", other: "{count} ocena" },
      "book.readFree": "\u010Citaj besplatno",
      "book.borrow": "Pozajmi online",
      "book.openLibrary": "Open Library",
      "book.share": "Podeli",
      "book.back": "Nazad",
      "book.coverAlt": "Korica knjige {title}",
      "book.about": "O knjizi",
      "book.subjects": "Teme",
      "book.languages": "Dostupna izdanja na jezicima",
      "book.descriptionOffline": "Opis nije dostupan bez interneta.",
      "book.noDescription": "Open Library nema opis za ovu knjigu.",
      "book.addTitle": "Dodaj na policu",
      "book.onShelf": "Na tvojoj polici",
      "book.yourRating": "Tvoja ocena",
      "book.rateN": { one: "Oceni sa {n} zvezdicom", few: "Oceni sa {n} zvezdice", other: "Oceni sa {n} zvezdica" },
      "book.note": "Bele\u0161ka",
      "book.notePlaceholder": "Utisak, omiljeni citat, kome da je preporu\u010Di\u0161",
      "book.noteSaved": "Sa\u010Duvano",
      "book.addedOn": "Dodato {date}",
      "book.remove": "Ukloni sa police",
      "book.notFound": "Knjiga nije prona\u0111ena",
      "book.notFoundText": "Link je mo\u017Eda pogre\u0161an ili je knjiga uklonjena iz Open Library kataloga.",
      "book.offlineUnknown": "Ova knjiga nije ranije otvorena na ovom ure\u0111aju, pa nije dostupna bez interneta.",
      "book.linkCopied": "Link je kopiran",
      "book.shareFailed": "Deljenje nije uspelo",
      "notFound.title": "Stranica ne postoji",
      "notFound.text": "Adresa nije ispravna. Vrati se na po\u010Detnu stranu.",
      "status.want": "\u017Delim da pro\u010Ditam",
      "status.reading": "\u010Citam",
      "status.read": "Pro\u010Ditano",
      "toast.added": "Sa\u010Duvano na policu",
      "toast.addedAs": "Sa\u010Duvano na policu: {status}",
      "toast.removed": "Uklonjeno sa police",
      "toast.undo": "Poni\u0161ti",
      "shelf.title": "Moja polica",
      "shelf.filterLabel": "Prika\u017Ei po statusu",
      "shelf.viewLabel": "Na\u010Din prikaza",
      "shelf.viewSpines": "Prikaz police",
      "shelf.viewGrid": "Prikaz korica",
      "shelf.statTotal": "Knjiga na polici",
      "shelf.statReadYear": "Pro\u010Ditano u {year}.",
      "shelf.statPages": "Pro\u010Ditanih strana",
      "shelf.statRating": "Prose\u010Dna ocena",
      "shelf.all": "Sve",
      "shelf.emptyStatusTitle": "Ovde jo\u0161 nema knjiga",
      "shelf.emptyStatusText": "Promeni status knjige na njenoj stranici i pojavi\u0107e se ovde.",
      "shelf.showAll": "Prika\u017Ei sve",
      "shelf.emptyTitle": "Polica je prazna",
      "shelf.emptyText": "Prona\u0111i knjigu i dodirni znak za \u010Duvanje. Sa\u010Duvane knjige su dostupne i bez interneta.",
      "shelf.emptyAction": "Prona\u0111i knjigu",
      "shelfSort.added": "Poslednje dodate",
      "shelfSort.title": "Naslov",
      "shelfSort.author": "Autor",
      "shelfSort.rating": "Moja ocena",
      "backup.title": "Rezervna kopija",
      "backup.text": "Polica se \u010Duva samo u ovom pregleda\u010Du. Izvezi je u fajl da je prenese\u0161 na drugi ure\u0111aj ili sa\u010Duva\u0161.",
      "backup.export": "Izvezi policu",
      "backup.import": "Uvezi iz fajla",
      "backup.imported": "Uvezeno: {added} novih, {updated} a\u017Euriranih",
      "backup.importFailed": "Fajl nije ispravna rezervna kopija Knjigoteke",
      "backup.exported": { one: "Izvezena {n} knjiga", few: "Izvezene {n} knjige", other: "Izvezeno {n} knjiga" },
      "pwa.backOnline": "Ponovo si na internetu",
      "pwa.updateReady": "Dostupna je nova verzija aplikacije",
      "pwa.updateAction": "Osve\u017Ei",
      "pwa.installed": "Knjigoteka je instalirana"
    },
    en: {
      "app.skip": "Skip to content",
      "app.offline": "You're offline. Your shelf and pages you've opened before still work.",
      "app.install": "Install",
      "theme.toDark": "Switch to dark mode",
      "theme.toLight": "Switch to light mode",
      "lang.switch": "Prebaci na srpski",
      "footer.text": "Knjigoteka is a progressive web app. It works offline and can be installed.",
      "footer.source": "Data: Open Library",
      "nav.label": "Main navigation",
      "nav.discover": "Discover",
      "nav.search": "Search",
      "nav.shelf": "My shelf",
      "home.docTitle": "Discover books",
      "home.title": "What are you reading next?",
      "home.lead": "Search the Open Library catalogue, save books to your shelf and keep track of what you've read. Everything you save works offline.",
      "home.recent": "Recent",
      "home.clearRecent": "Clear",
      "home.openShelf": "Open my shelf",
      "home.shelfCaption": { one: "{count} book on your shelf", other: "{count} books on your shelf" },
      "home.shelfEmpty": "Your shelf is waiting for its first book",
      "home.topics": "Topics",
      "home.reading": "Currently reading",
      "home.trending": "Popular today",
      "home.trendingNote": "Books Open Library readers are opening most today",
      "topic.fantasy": "Fantasy",
      "topic.scifi": "Science fiction",
      "topic.mystery": "Mystery and crime",
      "topic.love": "Romance",
      "topic.history": "History",
      "topic.philosophy": "Philosophy",
      "topic.poetry": "Poetry",
      "topic.biography": "Biography",
      "topic.psychology": "Psychology",
      "topic.children": "Children's books",
      "search.label": "Search books",
      "search.placeholder": "Title, author or topic",
      "search.shortcut": "Press / to search",
      "search.submit": "Search",
      "search.title": "Search",
      "search.titleFor": "Results for \u201C{q}\u201D",
      "search.loading": "Loading\u2026",
      "search.count": { one: "Showing {shown} of {total} result", other: "Showing {shown} of {total} results" },
      "search.more": "Show more",
      "search.end": "That's every result.",
      "search.emptyTitle": "No results",
      "search.emptyText": "Check the spelling or try a shorter term, such as just the author's surname.",
      "search.emptyWithFilters": "No book matches both the term and your filters. Remove the filters to widen the search.",
      "search.startTitle": "What are you looking for?",
      "search.startText": "Type a title, author or topic, or pick one of the topics.",
      "sort.label": "Sort by",
      "sort.relevance": "Most relevant",
      "sort.rating": "Highest rated",
      "sort.editions": "Most editions",
      "sort.new": "Newest",
      "sort.old": "Oldest",
      "filters.title": "Filters",
      "filters.language": "Edition language",
      "filters.anyLanguage": "Any language",
      "filters.year": "First published",
      "filters.from": "From",
      "filters.to": "To",
      "filters.ebooks": "Only books you can read online",
      "filters.ebooksShort": "Read online",
      "filters.apply": "Apply",
      "filters.reset": "Remove filters",
      "filters.active": "Active filters",
      "filters.remove": "Remove filter: {label}",
      "filters.topic": "Topic",
      "filters.author": "Author",
      "error.offlineTitle": "You're offline",
      "error.offlineSearch": "This search wasn't saved earlier. Previous searches and your shelf work offline.",
      "error.apiTitle": "Open Library isn't responding",
      "error.apiText": "The service is slow or unavailable right now. Try again in a moment.",
      "error.retry": "Try again",
      "card.add": "Save to shelf: {title}",
      "card.remove": "Remove from shelf: {title}",
      "book.unknownAuthor": "Unknown author",
      "book.firstPublished": "First published",
      "book.editions": "Editions",
      "book.pages": "Pages (median)",
      "book.communityRating": "Reader rating",
      "book.ratingCount": { one: "{count} rating", other: "{count} ratings" },
      "book.readFree": "Read for free",
      "book.borrow": "Borrow online",
      "book.openLibrary": "Open Library",
      "book.share": "Share",
      "book.back": "Back",
      "book.coverAlt": "Cover of {title}",
      "book.about": "About this book",
      "book.subjects": "Subjects",
      "book.languages": "Editions available in",
      "book.descriptionOffline": "The description isn't available offline.",
      "book.noDescription": "Open Library has no description for this book.",
      "book.addTitle": "Add to shelf",
      "book.onShelf": "On your shelf",
      "book.yourRating": "Your rating",
      "book.rateN": { one: "Rate {n} star", other: "Rate {n} stars" },
      "book.note": "Note",
      "book.notePlaceholder": "Thoughts, a favourite quote, who to recommend it to",
      "book.noteSaved": "Saved",
      "book.addedOn": "Added {date}",
      "book.remove": "Remove from shelf",
      "book.notFound": "Book not found",
      "book.notFoundText": "The link may be wrong, or the book was removed from the Open Library catalogue.",
      "book.offlineUnknown": "This book hasn't been opened on this device before, so it isn't available offline.",
      "book.linkCopied": "Link copied",
      "book.shareFailed": "Couldn't share",
      "notFound.title": "Page not found",
      "notFound.text": "This address doesn't exist. Go back to the start page.",
      "status.want": "Want to read",
      "status.reading": "Reading",
      "status.read": "Read",
      "toast.added": "Saved to shelf",
      "toast.addedAs": "Saved to shelf: {status}",
      "toast.removed": "Removed from shelf",
      "toast.undo": "Undo",
      "shelf.title": "My shelf",
      "shelf.filterLabel": "Show by status",
      "shelf.viewLabel": "View",
      "shelf.viewSpines": "Shelf view",
      "shelf.viewGrid": "Cover view",
      "shelf.statTotal": "Books on shelf",
      "shelf.statReadYear": "Read in {year}",
      "shelf.statPages": "Pages read",
      "shelf.statRating": "Average rating",
      "shelf.all": "All",
      "shelf.emptyStatusTitle": "No books here yet",
      "shelf.emptyStatusText": "Change a book's status on its page and it will show up here.",
      "shelf.showAll": "Show all",
      "shelf.emptyTitle": "Your shelf is empty",
      "shelf.emptyText": "Find a book and tap the bookmark. Saved books are available offline.",
      "shelf.emptyAction": "Find a book",
      "shelfSort.added": "Recently added",
      "shelfSort.title": "Title",
      "shelfSort.author": "Author",
      "shelfSort.rating": "My rating",
      "backup.title": "Backup",
      "backup.text": "Your shelf is stored only in this browser. Export it to a file to move it to another device or keep a copy.",
      "backup.export": "Export shelf",
      "backup.import": "Import from file",
      "backup.imported": "Imported: {added} new, {updated} updated",
      "backup.importFailed": "That file isn't a valid Knjigoteka backup",
      "backup.exported": { one: "Exported {n} book", other: "Exported {n} books" },
      "pwa.backOnline": "You're back online",
      "pwa.updateReady": "A new version is available",
      "pwa.updateAction": "Reload",
      "pwa.installed": "Knjigoteka is installed"
    }
  };
  var LANGUAGES = Object.keys(MESSAGES);
  var SERBIAN_FAMILY = ["sr", "hr", "bs", "sh", "cnr"];
  function detectLanguage(preferred = []) {
    for (const tag of preferred) {
      const primary = String(tag || "").toLowerCase().split(/[-_]/)[0];
      if (SERBIAN_FAMILY.includes(primary)) return "sr";
      if (LANGUAGES.includes(primary)) return primary;
    }
    return "en";
  }
  function createI18n(initial = "sr") {
    let lang = LANGUAGES.includes(initial) ? initial : "sr";
    let rules = new Intl.PluralRules(localeFor(lang));
    function t(key, vars = {}) {
      let value = MESSAGES[lang][key] ?? MESSAGES.sr[key] ?? key;
      if (typeof value === "object") {
        const n = Number(vars.n ?? vars.count ?? 0);
        value = value[rules.select(n)] ?? value.other;
      }
      return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
    }
    return {
      get lang() {
        return lang;
      },
      setLang(next) {
        if (!LANGUAGES.includes(next)) return;
        lang = next;
        rules = new Intl.PluralRules(localeFor(lang));
      },
      t
    };
  }

  // js/ui.js
  var CLOTH_COLOURS = 8;
  function icon(name, extraClass = "") {
    return `<svg class="icon ${extraClass}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
  }
  function clothIndex(book) {
    return hashString(book.key || book.title) % CLOTH_COLOURS;
  }
  function authorLine(book, t) {
    return book.authors?.length ? book.authors.slice(0, 2).join(", ") : t("book.unknownAuthor");
  }
  function coverHtml(book, { size = "M", eager = false, alt = "", className = "" } = {}) {
    const src = coverUrl(book.coverId, size);
    return `
    <div class="cover cloth-${clothIndex(book)} ${className}">
      <div class="cover__fallback" aria-hidden="true">
        <span class="cover__title">${escapeHtml(truncate(book.title, 70))}</span>
        <span class="cover__author">${escapeHtml(book.authors?.[0] || "")}</span>
      </div>
      ${src ? `<img class="cover__img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async">` : ""}
    </div>`;
  }
  function shelfButtonHtml(book, saved, t) {
    const label = saved ? t("card.remove", { title: book.title }) : t("card.add", { title: book.title });
    return `
    <button class="shelf-btn" type="button" data-action="toggle-shelf" data-key="${escapeHtml(book.key)}"
            aria-pressed="${saved}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
      ${icon(saved ? "bookmark-fill" : "bookmark")}
    </button>`;
  }
  function bookCardHtml(book, ctx) {
    const { t, store: store2 } = ctx;
    return `
    <li class="book-card">
      <a class="book-card__link" href="${bookHash(book.key)}">
        ${coverHtml(book)}
        <span class="book-card__title">${escapeHtml(book.title)}</span>
        <span class="book-card__author">${escapeHtml(authorLine(book, t))}</span>
        ${book.year ? `<span class="book-card__year">${book.year}</span>` : ""}
      </a>
      ${shelfButtonHtml(book, store2.has(book.key), t)}
    </li>`;
  }
  function skeletonCards(count = 8) {
    return Array.from({ length: count }, () => `
    <li class="book-card is-skeleton" aria-hidden="true">
      <div class="cover skeleton"></div>
      <span class="skeleton-line"></span>
      <span class="skeleton-line skeleton-line--short"></span>
    </li>`).join("");
  }
  function syncShelfButtons(root, store2, t) {
    root.querySelectorAll('[data-action="toggle-shelf"]').forEach((button) => {
      const saved = store2.has(button.dataset.key);
      if (button.getAttribute("aria-pressed") === String(saved)) return;
      const title = button.closest(".book-card")?.querySelector(".book-card__title")?.textContent ?? "";
      const label = saved ? t("card.remove", { title }) : t("card.add", { title });
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", label);
      button.title = label;
      button.querySelector("use")?.setAttribute("href", saved ? "#i-bookmark-fill" : "#i-bookmark");
    });
  }
  function spineHtml(book, t, { link = true } = {}) {
    const hash = hashString(book.key);
    const height = 1 + hash % 5;
    const width = book.pages ? clamp(Math.round(book.pages / 160), 1, 5) : 1 + (hash >> 3) % 4;
    const classes = `spine cloth-${clothIndex(book)} spine-h-${height} spine-w-${width} is-${book.status}`;
    const inner = `
    <span class="spine__title">${escapeHtml(truncate(book.title, 48))}</span>
    <span class="spine__author">${escapeHtml(book.authors?.[0]?.split(" ").pop() || "")}</span>`;
    if (!link) return `<li class="spine-slot" aria-hidden="true"><span class="${classes}">${inner}</span></li>`;
    const label = `${book.title}, ${authorLine(book, t)}. ${t(`status.${book.status}`)}`;
    return `
    <li class="spine-slot">
      <a class="${classes}" href="${bookHash(book.key)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(book.title)}">${inner}</a>
    </li>`;
  }
  function decorativeSpines(count = 9) {
    return Array.from({ length: count }, (_, i) => {
      const h = 1 + (i * 7 + 3) % 5;
      const w = 1 + (i * 5 + 1) % 4;
      return `<span class="spine spine--blank cloth-${i * 3 % CLOTH_COLOURS} spine-h-${h} spine-w-${w}"></span>`;
    }).join("");
  }
  function starsHtml(value, { label = "" } = {}) {
    const full = Math.round(value ?? 0);
    return `<span class="stars" ${label ? `aria-label="${escapeHtml(label)}" role="img"` : 'aria-hidden="true"'}>${Array.from({ length: 5 }, (_, i) => icon(i < full ? "star-fill" : "star")).join("")}</span>`;
  }
  function searchFormHtml(t, value = "", { large = false } = {}) {
    return `
    <form class="search-form${large ? " search-form--large" : ""}" role="search" data-search-form>
      <label class="visually-hidden" for="search-input">${t("search.label")}</label>
      ${icon("search", "search-form__icon")}
      <input id="search-input" class="search-form__input" type="search" name="q" value="${escapeHtml(value)}"
             placeholder="${escapeHtml(t("search.placeholder"))}" autocomplete="off" enterkeyhint="search"
             maxlength="200" required>
      <kbd class="search-form__kbd" title="${escapeHtml(t("search.shortcut"))}">/</kbd>
      <button class="btn btn-primary" type="submit">${t("search.submit")}</button>
    </form>`;
  }
  function emptyStateHtml({ title, text: text2 = "", actions = "" }) {
    return `
    <div class="empty-state">
      <h2 class="empty-state__title">${title}</h2>
      ${text2 ? `<p class="empty-state__text">${text2}</p>` : ""}
      ${actions ? `<div class="empty-state__actions">${actions}</div>` : ""}
    </div>`;
  }
  function toast(message, { action, onAction, duration = 5e3 } = {}) {
    const host = document.getElementById("toasts");
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    const text2 = document.createElement("span");
    text2.textContent = message;
    el.append(text2);
    let timer = null;
    const close = () => {
      clearTimeout(timer);
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 180);
    };
    if (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "toast__action";
      button.textContent = action;
      button.addEventListener("click", () => {
        onAction?.();
        close();
      });
      el.append(button);
    }
    [...host.children].forEach((old) => {
      if (old.firstElementChild?.textContent === message) old.remove();
    });
    host.append(el);
    while (host.children.length > 3) host.firstElementChild.remove();
    if (duration) timer = setTimeout(close, duration);
    return close;
  }
  function announce(message) {
    const region = document.getElementById("announcer");
    region.textContent = "";
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }

  // js/pwa.js
  function initPwa({ t, toast: toast2 }) {
    const offlineBar = document.getElementById("offline-bar");
    const installButton = document.getElementById("install-btn");
    const syncOnline = () => {
      offlineBar.hidden = navigator.onLine;
      document.documentElement.classList.toggle("is-offline", !navigator.onLine);
    };
    window.addEventListener("online", () => {
      syncOnline();
      toast2(t("pwa.backOnline"), { duration: 3e3 });
    });
    window.addEventListener("offline", syncOnline);
    syncOnline();
    if ("serviceWorker" in navigator && window.isSecureContext) {
      let updateRequested = false;
      const offerUpdate = (worker) => {
        toast2(t("pwa.updateReady"), {
          action: t("pwa.updateAction"),
          duration: 0,
          onAction: () => {
            updateRequested = true;
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      };
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (updateRequested) window.location.reload();
      });
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("sw.js");
          if (!registration) return;
          if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) offerUpdate(worker);
            });
          });
          setInterval(() => registration.update().catch(() => {
          }), 60 * 60 * 1e3);
        } catch (error) {
          console.warn("Service worker registration failed", error);
        }
      });
    }
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      installButton.hidden = false;
    });
    installButton.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installButton.hidden = true;
    });
    window.addEventListener("appinstalled", () => {
      installButton.hidden = true;
      toast2(t("pwa.installed"));
    });
  }
  async function requestPersistence() {
    try {
      if (navigator.storage?.persist && !await navigator.storage.persisted()) {
        await navigator.storage.persist();
      }
    } catch {
    }
  }

  // js/views/home.js
  var TOPICS = [
    ["fantasy", "topic.fantasy"],
    ["science fiction", "topic.scifi"],
    ["mystery", "topic.mystery"],
    ["love", "topic.love"],
    ["history", "topic.history"],
    ["philosophy", "topic.philosophy"],
    ["poetry", "topic.poetry"],
    ["biography", "topic.biography"],
    ["psychology", "topic.psychology"],
    ["children", "topic.children"]
  ];
  function renderHome(root, _params, ctx) {
    const { t, store: store2, api: api2, signal } = ctx;
    ctx.setTitle(t("home.docTitle"));
    const reading = store2.books.filter((b) => b.status === "reading").slice(0, 6);
    const shelfPreview = store2.books.slice(0, 14);
    root.innerHTML = `
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <h1 class="hero__title" tabindex="-1">${t("home.title")}</h1>
          <p class="hero__lead">${t("home.lead")}</p>
          ${searchFormHtml(t, "", { large: true })}
          ${store2.recent.length ? `
            <div class="recent">
              <span class="recent__label">${t("home.recent")}</span>
              <ul class="chip-list">
                ${store2.recent.map((q) => `<li><a class="chip" href="${searchHash({ q })}">${escapeHtml(q)}</a></li>`).join("")}
              </ul>
              <button class="link-btn" type="button" data-action="clear-recent">${t("home.clearRecent")}</button>
            </div>` : ""}
        </div>
        <a class="hero__shelf" href="#/shelf" aria-label="${escapeHtml(t("home.openShelf"))}">
          <ul class="bookcase bookcase--hero" role="list">
            ${shelfPreview.length ? shelfPreview.map((b) => spineHtml(b, t, { link: false })).join("") : `<li class="spine-slot spine-slot--blank" aria-hidden="true">${decorativeSpines(11)}</li>`}
          </ul>
          <span class="hero__shelf-caption">${shelfPreview.length ? t("home.shelfCaption", { count: store2.books.length }) : t("home.shelfEmpty")}</span>
        </a>
      </div>
    </section>

    <section class="section container" aria-labelledby="topics-title">
      <h2 class="section__title" id="topics-title">${t("home.topics")}</h2>
      <ul class="chip-list chip-list--topics">
        ${TOPICS.map(([subject, key]) => `<li><a class="chip chip--topic" href="${searchHash({ subject })}">${t(key)}</a></li>`).join("")}
      </ul>
    </section>

    ${reading.length ? `
      <section class="section container" aria-labelledby="reading-title">
        <h2 class="section__title" id="reading-title">${t("home.reading")}</h2>
        <ul class="reading-list">
          ${reading.map((b) => `
            <li>
              <a class="reading-item" href="${bookHash(b.key)}">
                ${coverHtml(b, { size: "S", className: "cover--small" })}
                <span class="reading-item__text">
                  <span class="reading-item__title">${escapeHtml(b.title)}</span>
                  <span class="reading-item__author">${escapeHtml(b.authors?.[0] || "")}</span>
                </span>
              </a>
            </li>`).join("")}
        </ul>
      </section>` : ""}

    <section class="section container" aria-labelledby="trending-title" id="trending-section">
      <div class="section__head">
        <h2 class="section__title" id="trending-title">${t("home.trending")}</h2>
        <p class="section__note">${t("home.trendingNote")}</p>
      </div>
      <ul class="book-row" id="trending">${skeletonCards(6)}</ul>
    </section>`;
    const list = root.querySelector("#trending");
    api2.trending(signal).then((books) => {
      books.forEach((b) => ctx.workCache.set(b.key, b));
      if (!books.length) throw new Error("empty");
      list.innerHTML = books.map((b) => bookCardHtml(b, ctx)).join("");
    }).catch((error) => {
      if (error.name === "AbortError") return;
      root.querySelector("#trending-section").hidden = true;
    });
    return {
      onAction(action) {
        if (action === "clear-recent") {
          store2.clearRecent();
          root.querySelector(".recent")?.remove();
          ctx.searchInput()?.focus();
        }
      }
    };
  }

  // js/views/search.js
  var FILTER_LANGUAGES = ["srp", "hrv", "bos", "eng", "ger", "fre", "rus", "spa", "ita"];
  function renderSearch(root, initialParams, ctx) {
    const { t, lang } = ctx;
    let params = initialParams;
    let page = 1;
    let shown = 0;
    let total = 0;
    let request = null;
    root.innerHTML = `
    <section class="search-head">
      <div class="container">
        <h1 class="page-title" tabindex="-1" id="search-title"></h1>
        ${searchFormHtml(t, params.q)}
        <div class="toolbar">
          <p class="toolbar__count" id="result-count"></p>
          <div class="toolbar__controls">
            <label class="select-field">
              <span class="select-field__label">${t("sort.label")}</span>
              <select id="sort-select">
                ${SORTS.map((s) => `<option value="${s}">${t(`sort.${s}`)}</option>`).join("")}
              </select>
            </label>
            <button class="btn btn-quiet" type="button" id="filters-toggle" aria-expanded="false" aria-controls="filters">
              ${icon("filter")} <span>${t("filters.title")}</span> <span class="count-badge" id="filters-count" hidden></span>
            </button>
          </div>
        </div>
        <form class="filters" id="filters" hidden>
          <label class="field">
            <span class="field__label">${t("filters.language")}</span>
            <select name="lang">
              <option value="">${t("filters.anyLanguage")}</option>
              ${FILTER_LANGUAGES.map((code) => `<option value="${code}">${escapeHtml(languageName(code, lang))}</option>`).join("")}
            </select>
          </label>
          <fieldset class="field field--range">
            <legend class="field__label">${t("filters.year")}</legend>
            <input name="from" type="number" inputmode="numeric" min="-3000" max="2100" placeholder="${t("filters.from")}" aria-label="${t("filters.from")}">
            <span aria-hidden="true">\u2013</span>
            <input name="to" type="number" inputmode="numeric" min="-3000" max="2100" placeholder="${t("filters.to")}" aria-label="${t("filters.to")}">
          </fieldset>
          <label class="check">
            <input name="ebooks" type="checkbox">
            <span>${t("filters.ebooks")}</span>
          </label>
          <div class="filters__actions">
            <button class="btn btn-primary" type="submit">${t("filters.apply")}</button>
            <button class="btn btn-quiet" type="button" data-action="reset-filters">${t("filters.reset")}</button>
          </div>
        </form>
        <ul class="chip-list active-filters" id="active-filters" aria-label="${t("filters.active")}"></ul>
      </div>
    </section>
    <section class="container results" aria-labelledby="search-title">
      <ul class="book-grid" id="results"></ul>
      <div class="results__more" id="more"></div>
    </section>`;
    const el = {
      title: root.querySelector("#search-title"),
      count: root.querySelector("#result-count"),
      sort: root.querySelector("#sort-select"),
      filtersToggle: root.querySelector("#filters-toggle"),
      filtersCount: root.querySelector("#filters-count"),
      filters: root.querySelector("#filters"),
      active: root.querySelector("#active-filters"),
      results: root.querySelector("#results"),
      more: root.querySelector("#more"),
      toolbar: root.querySelector(".toolbar")
    };
    el.sort.addEventListener("change", () => ctx.go(searchHash({ ...params, sort: el.sort.value })));
    el.filtersToggle.addEventListener("click", () => {
      const open = el.filters.hidden;
      el.filters.hidden = !open;
      el.filtersToggle.setAttribute("aria-expanded", String(open));
      if (open) el.filters.querySelector("select").focus();
    });
    el.filters.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(el.filters);
      let from = String(form.get("from") || "");
      let to = String(form.get("to") || "");
      if (from && to && Number(from) > Number(to)) [from, to] = [to, from];
      el.filters.hidden = true;
      el.filtersToggle.setAttribute("aria-expanded", "false");
      ctx.go(searchHash({ ...params, lang: form.get("lang"), from, to, ebooks: form.get("ebooks") === "on" }));
    });
    el.filters.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        el.filters.hidden = true;
        el.filtersToggle.setAttribute("aria-expanded", "false");
        el.filtersToggle.focus();
      }
    });
    function syncControls() {
      const input = root.querySelector("#search-input");
      if (input && document.activeElement !== input) input.value = params.q;
      el.sort.value = params.sort;
      const fields = el.filters.elements;
      fields.namedItem("lang").value = params.lang;
      fields.namedItem("from").value = params.from;
      fields.namedItem("to").value = params.to;
      fields.namedItem("ebooks").checked = params.ebooks;
      const n = activeFilterCount(params);
      el.filtersCount.hidden = n === 0;
      el.filtersCount.textContent = String(n);
      const chips = [];
      const chip = (label, without) => `<li><a class="chip chip--removable" href="${searchHash({ ...params, ...without })}" aria-label="${escapeHtml(t("filters.remove", { label }))}">${escapeHtml(label)} ${icon("x")}</a></li>`;
      if (params.subject) chips.push(chip(`${t("filters.topic")}: ${topicLabel(params.subject)}`, { subject: "" }));
      if (params.author) chips.push(chip(`${t("filters.author")}: ${params.author}`, { author: "" }));
      if (params.lang) chips.push(chip(languageName(params.lang, lang), { lang: "" }));
      if (params.from || params.to) chips.push(chip(`${params.from || "\u2026"}\u2013${params.to || "\u2026"}`, { from: "", to: "" }));
      if (params.ebooks) chips.push(chip(t("filters.ebooksShort"), { ebooks: false }));
      el.active.innerHTML = chips.join("");
      el.active.hidden = chips.length === 0;
    }
    function topicLabel(subject) {
      const topic = TOPICS.find(([s]) => s === subject);
      return topic ? t(topic[1]) : subject;
    }
    function heading() {
      if (params.q) return t("search.titleFor", { q: params.q });
      if (params.author) return params.author;
      if (params.subject) return topicLabel(params.subject);
      return t("search.title");
    }
    async function run(nextPage = 1) {
      request?.abort();
      request = new AbortController();
      const signal = AbortSignal.any ? AbortSignal.any([request.signal, ctx.signal]) : request.signal;
      page = nextPage;
      if (page === 1) {
        shown = 0;
        el.results.setAttribute("aria-busy", "true");
        el.results.innerHTML = skeletonCards(12);
        el.more.innerHTML = "";
        el.count.textContent = t("search.loading");
      } else {
        el.more.innerHTML = `<p class="results__loading">${t("search.loading")}</p>`;
      }
      try {
        const result = await ctx.api.search({ ...params, page }, signal);
        result.items.forEach((b) => ctx.workCache.set(b.key, b));
        total = result.total;
        if (page === 1 && params.q) ctx.store.addRecent(params.q);
        if (page === 1 && result.items.length === 0) {
          el.results.innerHTML = "";
          el.count.textContent = "";
          el.more.innerHTML = emptyStateHtml({
            title: t("search.emptyTitle"),
            text: activeFilterCount(params) ? t("search.emptyWithFilters") : t("search.emptyText"),
            actions: activeFilterCount(params) ? `<button class="btn btn-primary" type="button" data-action="reset-filters">${t("filters.reset")}</button>` : ""
          });
          ctx.announce(t("search.emptyTitle"));
          return;
        }
        const html = result.items.map((b) => bookCardHtml(b, ctx)).join("");
        if (page === 1) el.results.innerHTML = html;
        else el.results.insertAdjacentHTML("beforeend", html);
        shown += result.items.length;
        const countText = t("search.count", { shown: formatNumber(shown, lang), total: formatNumber(total, lang), n: total });
        el.count.textContent = countText;
        if (page === 1) ctx.announce(countText);
        const hasMore = shown < total && result.items.length === PAGE_SIZE;
        el.more.innerHTML = hasMore ? `<button class="btn btn-secondary btn-wide" type="button" data-action="more">${t("search.more")}</button>` : shown > PAGE_SIZE ? `<p class="results__end">${t("search.end")}</p>` : "";
        if (page === 1) ctx.restoreScroll();
        else el.results.children[shown - result.items.length]?.querySelector("a")?.focus({ preventScroll: true });
      } catch (error) {
        if (error.name === "AbortError") return;
        el.count.textContent = "";
        if (page === 1) el.results.innerHTML = "";
        const offline = error instanceof OfflineError;
        el.more.innerHTML = emptyStateHtml({
          title: offline ? t("error.offlineTitle") : t("error.apiTitle"),
          text: offline ? t("error.offlineSearch") : t("error.apiText"),
          actions: offline ? `<a class="btn btn-primary" href="#/shelf">${t("nav.shelf")}</a>` : `<button class="btn btn-primary" type="button" data-action="retry">${t("error.retry")}</button>`
        });
        ctx.announce(offline ? t("error.offlineTitle") : t("error.apiTitle"));
      } finally {
        el.results.removeAttribute("aria-busy");
      }
    }
    function show(next) {
      params = next;
      el.title.textContent = heading();
      ctx.setTitle(heading());
      syncControls();
      if (!hasSearch(params)) {
        el.toolbar.hidden = true;
        el.results.innerHTML = "";
        el.more.innerHTML = emptyStateHtml({
          title: t("search.startTitle"),
          text: t("search.startText"),
          actions: `<ul class="chip-list">${TOPICS.slice(0, 6).map(([subject, key]) => `<li><a class="chip chip--topic" href="${searchHash({ subject })}">${t(key)}</a></li>`).join("")}</ul>`
        });
        return;
      }
      el.toolbar.hidden = false;
      run(1);
    }
    show(params);
    return {
      update: show,
      onAction(action) {
        if (action === "more") run(page + 1);
        if (action === "retry") run(page);
        if (action === "reset-filters") ctx.go(searchHash({ ...params, lang: "", from: "", to: "", ebooks: false }));
      },
      destroy() {
        request?.abort();
      }
    };
  }

  // js/views/book.js
  function renderBook(root, { id }, ctx) {
    const { t, lang, store: store2, api: api2, signal } = ctx;
    const key = `/works/${id}`;
    let book = ctx.workCache.get(key) || store2.get(key);
    let details = null;
    let detailsState = "loading";
    let notePending = false;
    const saveNote = debounce((value) => {
      notePending = false;
      store2.update(key, { note: value });
      const status = root.querySelector("#note-status");
      if (status) status.textContent = t("book.noteSaved");
    }, 600);
    function paint() {
      if (!book) {
        root.innerHTML = `<div class="container book-loading" aria-busy="true"><p>${t("search.loading")}</p></div>`;
        return;
      }
      ctx.setTitle(book.title);
      const languages = book.languages.map((code) => languageName(code, lang));
      const facts = [
        book.year && [t("book.firstPublished"), book.year],
        book.editions && [t("book.editions"), formatNumber(book.editions, lang)],
        book.pages && [t("book.pages"), formatNumber(book.pages, lang)],
        book.rating && [
          t("book.communityRating"),
          `${starsHtml(book.rating)} <span>${formatNumber(book.rating, lang, { minimumFractionDigits: 1 })}</span>
         <span class="facts__muted">(${t("book.ratingCount", { n: book.ratingCount, count: formatNumber(book.ratingCount, lang) })})</span>`
        ]
      ].filter(Boolean);
      const readable = book.ebook === "public" || book.ebook === "borrowable";
      root.innerHTML = `
      <article class="book">
        <div class="container">
          <a class="back-link" href="#/" data-action="back">${icon("arrow-left")} ${t("book.back")}</a>
          <div class="book__layout">
            <div class="book__cover">
              ${coverHtml({ ...book, coverId: book.coverId || details?.coverId }, { size: "L", eager: true, alt: t("book.coverAlt", { title: book.title }) })}
            </div>
            <div class="book__main">
              <h1 class="book__title" tabindex="-1">${escapeHtml(book.title)}</h1>
              <p class="book__authors">
                ${book.authors.length ? book.authors.map((a) => `<a href="${searchHash({ author: a })}">${escapeHtml(a)}</a>`).join(", ") : t("book.unknownAuthor")}
              </p>
              ${facts.length ? `<dl class="facts">${facts.map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`).join("")}</dl>` : ""}
              <section class="shelf-panel" id="shelf-panel" aria-labelledby="shelf-panel-title"></section>
              <div class="book__actions">
                ${readable ? `<a class="btn btn-secondary" href="${openLibraryUrl(key)}" target="_blank" rel="noopener">${icon("book-open")} ${t(book.ebook === "public" ? "book.readFree" : "book.borrow")}</a>` : ""}
                <a class="btn btn-quiet" href="${openLibraryUrl(key)}" target="_blank" rel="noopener">${icon("external")} ${t("book.openLibrary")}</a>
                <button class="btn btn-quiet" type="button" data-action="share">${icon("share")} ${t("book.share")}</button>
              </div>
            </div>
          </div>

          <section class="book__about" aria-labelledby="about-title">
            <h2 class="section__title" id="about-title">${t("book.about")}</h2>
            <div class="prose" id="description">${descriptionHtml()}</div>
            ${details?.subjects?.length ? `
              <h3 class="book__subhead">${t("book.subjects")}</h3>
              <ul class="chip-list">
                ${details.subjects.map((s) => `<li><a class="chip" href="${searchHash({ subject: s })}">${escapeHtml(s)}</a></li>`).join("")}
              </ul>` : ""}
            ${languages.length ? `
              <h3 class="book__subhead">${t("book.languages")}</h3>
              <p class="book__languages">${escapeHtml(languages.join(", "))}</p>` : ""}
          </section>
        </div>
      </article>`;
      paintShelfPanel();
    }
    function descriptionHtml() {
      if (detailsState === "loading") return `<span class="skeleton-line"></span><span class="skeleton-line"></span><span class="skeleton-line skeleton-line--short"></span>`;
      if (detailsState === "offline") return `<p class="muted">${t("book.descriptionOffline")}</p>`;
      const text2 = details?.description || details?.firstSentence;
      if (!text2) return `<p class="muted">${t("book.noDescription")}</p>`;
      return text2.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
    }
    function paintShelfPanel() {
      const panel = root.querySelector("#shelf-panel");
      if (!panel) return;
      const saved = store2.get(key);
      if (!saved) {
        panel.innerHTML = `
        <h2 class="shelf-panel__title" id="shelf-panel-title">${t("book.addTitle")}</h2>
        <div class="segmented">
          ${STATUSES.map((s) => `<button class="segmented__btn" type="button" data-action="add" data-status="${s}">${t(`status.${s}`)}</button>`).join("")}
        </div>`;
        return;
      }
      const added = new Intl.DateTimeFormat(localeFor(lang), { dateStyle: "medium" }).format(saved.addedAt);
      panel.innerHTML = `
      <h2 class="shelf-panel__title" id="shelf-panel-title">${t("book.onShelf")}</h2>
      <div class="segmented" role="group" aria-labelledby="shelf-panel-title">
        ${STATUSES.map((s) => `
          <button class="segmented__btn" type="button" data-action="status" data-status="${s}" aria-pressed="${saved.status === s}">
            ${saved.status === s ? icon("check") : ""}${t(`status.${s}`)}
          </button>`).join("")}
      </div>
      <div class="rating-input" role="group" aria-label="${escapeHtml(t("book.yourRating"))}">
        <span class="rating-input__label" aria-hidden="true">${t("book.yourRating")}</span>
        ${[1, 2, 3, 4, 5].map((n) => `
          <button type="button" class="star-btn" data-action="rate" data-value="${n}"
                  aria-pressed="${saved.myRating === n}" aria-label="${escapeHtml(t("book.rateN", { n }))}">
            ${icon(n <= saved.myRating ? "star-fill" : "star")}
          </button>`).join("")}
      </div>
      <label class="field field--note">
        <span class="field__label">${t("book.note")}</span>
        <textarea id="note" rows="3" maxlength="2000" placeholder="${escapeHtml(t("book.notePlaceholder"))}">${escapeHtml(saved.note)}</textarea>
        <span class="field__hint" id="note-status" aria-live="polite"></span>
      </label>
      <p class="shelf-panel__meta">
        <span>${t("book.addedOn", { date: added })}</span>
        <button class="link-btn link-btn--danger" type="button" data-action="remove">${t("book.remove")}</button>
      </p>`;
      panel.querySelector("#note").addEventListener("input", (event) => {
        panel.querySelector("#note-status").textContent = "";
        notePending = true;
        saveNote(event.target.value);
      });
    }
    paint();
    if (!book) {
      api2.workSummary(id, signal).then((summary) => {
        if (summary) {
          book = summary;
          ctx.workCache.set(key, summary);
          paint();
        } else if (detailsState !== "loading" && !book) {
          notFound();
        }
      }).catch((error) => {
        if (error.name === "AbortError") return;
        if (!book && detailsState !== "loading") notFound(error instanceof OfflineError);
      });
    }
    api2.workDetails(id, signal).then((result) => {
      details = result;
      detailsState = "ready";
      if (!book && result.title) {
        book = { key, title: result.title, authors: [], year: null, coverId: result.coverId, editions: null, pages: null, rating: null, ratingCount: 0, languages: [], ebook: "no_ebook" };
      }
      if (book) paint();
    }).catch((error) => {
      if (error.name === "AbortError") return;
      detailsState = error instanceof OfflineError ? "offline" : "error";
      if (book) {
        const box = root.querySelector("#description");
        if (box) box.innerHTML = descriptionHtml();
      } else {
        notFound(error instanceof OfflineError);
      }
    });
    function notFound(offline = false) {
      ctx.setTitle(t("notFound.title"));
      root.innerHTML = `<div class="container">${emptyStateHtml({
        title: offline ? t("error.offlineTitle") : t("book.notFound"),
        text: offline ? t("book.offlineUnknown") : t("book.notFoundText"),
        actions: `<a class="btn btn-primary" href="#/">${t("nav.discover")}</a>`
      })}</div>`;
    }
    async function share() {
      const url = location.href;
      try {
        if (navigator.share) {
          await navigator.share({ title: book.title, text: `${book.title} \u2013 ${book.authors.join(", ")}`, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        ctx.toast(t("book.linkCopied"));
      } catch (error) {
        if (error?.name !== "AbortError") ctx.toast(t("book.shareFailed"));
      }
    }
    return {
      onAction(action, target) {
        if (!book) return;
        const note = root.querySelector("#note");
        if (notePending && note) saveNote.flush(note.value);
        switch (action) {
          case "add":
            store2.add(book, target.dataset.status);
            ctx.requestPersistence();
            ctx.toast(t("toast.addedAs", { status: t(`status.${target.dataset.status}`) }));
            paintShelfPanel();
            root.querySelector('[data-action="status"][aria-pressed="true"]')?.focus();
            break;
          case "status":
            store2.setStatus(key, target.dataset.status);
            paintShelfPanel();
            root.querySelector(`[data-action="status"][data-status="${target.dataset.status}"]`)?.focus();
            break;
          case "rate": {
            const value = Number(target.dataset.value);
            const current2 = store2.get(key)?.myRating;
            store2.update(key, { myRating: current2 === value ? 0 : value });
            paintShelfPanel();
            root.querySelector(`[data-action="rate"][data-value="${value}"]`)?.focus();
            break;
          }
          case "remove": {
            const index = store2.indexOf(key);
            const removed = store2.remove(key);
            paintShelfPanel();
            ctx.toast(t("toast.removed"), {
              action: t("toast.undo"),
              onAction: () => {
                store2.restore(removed, index);
                paintShelfPanel();
              }
            });
            root.querySelector('[data-action="add"]')?.focus();
            break;
          }
          case "share":
            share();
            break;
          default:
        }
      },
      destroy() {
        const note = root.querySelector("#note");
        if (notePending && note) saveNote.flush(note.value);
      }
    };
  }

  // js/views/shelf.js
  function sortShelf(books, sort, lang = "sr") {
    const collator = new Intl.Collator(localeFor(lang), { sensitivity: "base" });
    const list = [...books];
    switch (sort) {
      case "title":
        return list.sort((a, b) => collator.compare(a.title, b.title));
      case "author":
        return list.sort((a, b) => collator.compare(a.authors[0] || "\uFFFF", b.authors[0] || "\uFFFF"));
      case "rating":
        return list.sort((a, b) => b.myRating - a.myRating || b.addedAt - a.addedAt);
      default:
        return list.sort((a, b) => b.addedAt - a.addedAt);
    }
  }
  function renderShelf(root, initialParams, ctx) {
    const { t, lang, store: store2 } = ctx;
    let params = initialParams;
    ctx.setTitle(t("shelf.title"));
    root.innerHTML = `
    <section class="shelf-head">
      <div class="container">
        <h1 class="page-title" tabindex="-1">${t("shelf.title")}</h1>
        <dl class="stats" id="stats"></dl>
        <div class="shelf-controls">
          <nav class="tabs" aria-label="${escapeHtml(t("shelf.filterLabel"))}" id="status-tabs"></nav>
          <div class="shelf-controls__right">
            <label class="select-field">
              <span class="select-field__label">${t("sort.label")}</span>
              <select id="shelf-sort">
                ${SHELF_SORTS.map((s) => `<option value="${s}">${t(`shelfSort.${s}`)}</option>`).join("")}
              </select>
            </label>
            <div class="view-toggle" role="group" aria-label="${escapeHtml(t("shelf.viewLabel"))}">
              <button type="button" class="icon-btn" data-action="view" data-view="spines" aria-label="${escapeHtml(t("shelf.viewSpines"))}" title="${escapeHtml(t("shelf.viewSpines"))}">${icon("spines")}</button>
              <button type="button" class="icon-btn" data-action="view" data-view="grid" aria-label="${escapeHtml(t("shelf.viewGrid"))}" title="${escapeHtml(t("shelf.viewGrid"))}">${icon("grid")}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="container shelf-body" id="shelf-body" aria-live="polite"></section>
    <section class="container backup" aria-labelledby="backup-title">
      <h2 class="section__title" id="backup-title">${t("backup.title")}</h2>
      <p class="backup__text">${t("backup.text")}</p>
      <div class="backup__actions">
        <button class="btn btn-secondary" type="button" data-action="export">${icon("download")} ${t("backup.export")}</button>
        <label class="btn btn-quiet file-btn">
          ${icon("upload")} ${t("backup.import")}
          <input type="file" id="import-file" accept="application/json,.json" class="visually-hidden">
        </label>
      </div>
    </section>`;
    const el = {
      stats: root.querySelector("#stats"),
      tabs: root.querySelector("#status-tabs"),
      sort: root.querySelector("#shelf-sort"),
      body: root.querySelector("#shelf-body"),
      file: root.querySelector("#import-file")
    };
    el.sort.addEventListener("change", () => ctx.go(shelfHash({ ...params, sort: el.sort.value })));
    el.file.addEventListener("change", async () => {
      const file = el.file.files?.[0];
      el.file.value = "";
      if (!file) return;
      try {
        const result = store2.importJson(await file.text());
        ctx.toast(t("backup.imported", { added: result.added, updated: result.updated }));
      } catch {
        ctx.toast(t("backup.importFailed"));
      }
    });
    function paint() {
      const counts = store2.counts();
      const stats = store2.stats();
      el.stats.innerHTML = [
        [t("shelf.statTotal"), formatNumber(stats.total, lang)],
        [t("shelf.statReadYear", { year: (/* @__PURE__ */ new Date()).getFullYear() }), formatNumber(stats.readThisYear, lang)],
        [t("shelf.statPages"), formatNumber(stats.pagesRead, lang)],
        [t("shelf.statRating"), stats.averageRating ? formatNumber(stats.averageRating, lang, { maximumFractionDigits: 1 }) : "\u2013"]
      ].map(([dt, dd]) => `<div class="stats__item"><dt>${dt}</dt><dd>${dd}</dd></div>`).join("");
      el.tabs.innerHTML = ["all", ...STATUSES].map((s) => `
      <a class="tab" href="${shelfHash({ ...params, status: s })}" ${params.status === s ? 'aria-current="page"' : ""}>
        ${t(s === "all" ? "shelf.all" : `status.${s}`)} <span class="tab__count">${counts[s]}</span>
      </a>`).join("");
      el.sort.value = params.sort;
      root.querySelectorAll('[data-action="view"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === params.view)));
      const books = sortShelf(params.status === "all" ? store2.books : store2.books.filter((b) => b.status === params.status), params.sort, lang);
      if (!books.length) {
        el.body.innerHTML = store2.books.length ? emptyStateHtml({ title: t("shelf.emptyStatusTitle"), text: t("shelf.emptyStatusText"), actions: `<a class="btn btn-secondary" href="${shelfHash({ ...params, status: "all" })}">${t("shelf.showAll")}</a>` }) : emptyStateHtml({ title: t("shelf.emptyTitle"), text: t("shelf.emptyText"), actions: `<a class="btn btn-primary" href="#/">${t("shelf.emptyAction")}</a>` });
        return;
      }
      el.body.innerHTML = params.view === "grid" ? `<ul class="book-grid">${books.map((b) => bookCardHtml(b, ctx)).join("")}</ul>` : `<ul class="bookcase" role="list">${books.map((b) => spineHtml(b, t)).join("")}</ul>
         <p class="bookcase__legend">
           <span class="legend legend--reading">${t("status.reading")}</span>
           <span class="legend legend--read">${t("status.read")}</span>
         </p>`;
    }
    function exportShelf() {
      const blob = new Blob([store2.exportJson()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knjigoteka-${isoDate()}.json`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
      ctx.toast(t("backup.exported", { n: store2.books.length }));
    }
    const unsubscribe = store2.subscribe(paint);
    paint();
    ctx.restoreScroll();
    return {
      update(next) {
        params = next;
        paint();
      },
      onAction(action, target) {
        if (action === "view") ctx.go(shelfHash({ ...params, view: target.dataset.view }));
        if (action === "export") exportShelf();
      },
      destroy: unsubscribe
    };
  }

  // js/app.js
  function safeStorage() {
    try {
      const probe = "__knjigoteka__";
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch {
      const memory = /* @__PURE__ */ new Map();
      return { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)), removeItem: (k) => memory.delete(k) };
    }
  }
  var store = createStore(safeStorage());
  var i18n = createI18n(store.settings.lang || detectLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]));
  var api = createApi();
  var workCache = /* @__PURE__ */ new Map();
  var scrollPositions = /* @__PURE__ */ new Map();
  var view = document.getElementById("view");
  var shelfCount = document.getElementById("shelf-count");
  var themeButton = document.getElementById("theme-btn");
  var langSwitch = document.getElementById("lang-switch");
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var baseContext = {
    api,
    store,
    workCache,
    toast,
    announce,
    requestPersistence,
    get t() {
      return i18n.t;
    },
    get lang() {
      return i18n.lang;
    },
    go(hash) {
      if (window.location.hash === hash) render();
      else window.location.hash = hash;
    },
    setTitle(title) {
      document.title = title ? `${title} | Knjigoteka` : "Knjigoteka";
    },
    restoreScroll() {
      const y = scrollPositions.get(window.location.hash || "#/");
      if (y != null) window.scrollTo(0, y);
    },
    searchInput: () => document.getElementById("search-input")
  };
  var VIEWS = {
    home: renderHome,
    search: renderSearch,
    book: renderBook,
    shelf: renderShelf,
    notfound(root, _params, ctx) {
      ctx.setTitle(ctx.t("notFound.title"));
      root.innerHTML = `<div class="container">${emptyStateHtml({
        title: `<span tabindex="-1">${ctx.t("notFound.title")}</span>`,
        text: ctx.t("notFound.text"),
        actions: `<a class="btn btn-primary" href="#/">${ctx.t("nav.discover")}</a>`
      })}</div>`;
    }
  };
  var current = null;
  var renders = 0;
  var focusSearchAfterRender = false;
  function render({ force = false } = {}) {
    const route = parseRoute(window.location.hash);
    const hash = window.location.hash || "#/";
    if (!force && current && current.name === route.name && current.instance?.update) {
      current.hash = hash;
      current.instance.update(route.params);
      return;
    }
    if (current) {
      scrollPositions.set(current.hash, window.scrollY);
      current.instance?.destroy?.();
      current.controller.abort();
    }
    const controller = new AbortController();
    const ctx = Object.create(baseContext);
    ctx.signal = controller.signal;
    view.innerHTML = "";
    const instance = VIEWS[route.name](view, route.params, ctx) || null;
    current = { name: route.name, hash, instance, controller };
    updateNav(route.name);
    if (renders > 0 && !force) {
      if (!scrollPositions.has(hash)) window.scrollTo(0, 0);
      (view.querySelector("h1, [tabindex='-1']") || view).focus({ preventScroll: true });
    }
    if (focusSearchAfterRender) {
      focusSearchAfterRender = false;
      baseContext.searchInput()?.focus();
    }
    renders += 1;
  }
  function updateNav(name) {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === name) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("hashchange", () => render());
  function toggleShelf(key) {
    const t = i18n.t;
    const existing = store.get(key);
    if (existing) {
      const index = store.indexOf(key);
      store.remove(key);
      toast(t("toast.removed"), { action: t("toast.undo"), onAction: () => store.restore(existing, index) });
      return;
    }
    const book = workCache.get(key);
    if (!book) return;
    store.add(book, "want");
    requestPersistence();
    toast(t("toast.added"), { action: t("toast.undo"), onAction: () => store.remove(key) });
  }
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action } = target.dataset;
    if (action === "toggle-shelf") {
      event.preventDefault();
      toggleShelf(target.dataset.key);
    } else if (action === "back") {
      event.preventDefault();
      if (renders > 1) window.history.back();
      else baseContext.go("#/");
    } else {
      current?.instance?.onAction?.(action, target, event);
    }
  });
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-search-form]");
    if (!form) return;
    event.preventDefault();
    const q = form.elements.namedItem("q").value.trim();
    if (!q) return;
    const route = parseRoute(window.location.hash);
    const keep = route.name === "search" ? { sort: route.params.sort, lang: route.params.lang, from: route.params.from, to: route.params.to, ebooks: route.params.ebooks } : {};
    baseContext.go(searchHash({ ...keep, q }));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || document.activeElement?.isContentEditable) return;
    event.preventDefault();
    const input = baseContext.searchInput();
    if (input) input.focus();
    else {
      focusSearchAfterRender = true;
      baseContext.go("#/search");
    }
  });
  document.addEventListener("error", (event) => {
    if (event.target instanceof HTMLImageElement && event.target.classList.contains("cover__img")) event.target.remove();
  }, true);
  document.addEventListener("load", (event) => {
    if (event.target instanceof HTMLImageElement && event.target.classList.contains("cover__img")) {
      if (event.target.naturalWidth < 10) event.target.remove();
      else event.target.classList.add("is-loaded");
    }
  }, true);
  store.subscribe(() => {
    shelfCount.textContent = String(store.books.length);
    syncShelfButtons(view, store, i18n.t);
  });
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const theme = store.settings.theme || (systemDark.matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    themeColor.content = theme === "dark" ? "#0f1a16" : "#1b4332";
    const label = i18n.t(theme === "dark" ? "theme.toLight" : "theme.toDark");
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
    themeButton.querySelector("use").setAttribute("href", theme === "dark" ? "#i-sun" : "#i-moon");
  }
  themeButton.addEventListener("click", () => {
    store.setSetting("theme", document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    applyTheme();
  });
  systemDark.addEventListener("change", applyTheme);
  function applyLanguage() {
    const t = i18n.t;
    document.documentElement.lang = i18n.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nLabel)));
    langSwitch.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === i18n.lang)));
    applyTheme();
  }
  langSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (!button || !LANGUAGES.includes(button.dataset.lang) || button.dataset.lang === i18n.lang) return;
    const next = button.dataset.lang;
    store.setSetting("lang", next);
    i18n.setLang(next);
    applyLanguage();
    render({ force: true });
  });
  shelfCount.textContent = String(store.books.length);
  applyLanguage();
  render();
  initPwa({ t: (...args) => i18n.t(...args), toast });
})();
