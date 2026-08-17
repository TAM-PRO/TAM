document.addEventListener("DOMContentLoaded", function () {
    const root = document.documentElement;
    let isRTL = root.dir === "rtl";
    const originalLanguage = root.getAttribute("data-original-lang") || root.lang || (isRTL ? "he" : "en");
    const rtlLanguages = new Set(["ar", "dv", "fa", "he", "iw", "ku", "ps", "sd", "ug", "ur", "yi"]);
    const noMediaText = isRTL ? "אין איורים לסעיף זה." : "No media for this section.";
    const mediaContainer = document.getElementById("media-container");
    const breadcrumbs = document.getElementById("breadcrumbs");
    const appContainer = document.querySelector(".app-container");
    const tocPane = document.querySelector(".toc-pane");
    const mediaPane = document.querySelector(".media-pane");
    const resizer = document.getElementById("media-resizer");
    const tocResizer = document.getElementById("toc-resizer");
    const landingPage = document.getElementById("landing-page");
    const landingSearch = document.getElementById("landing-search");
    const lightbox = document.getElementById("image-lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.getElementById("lightbox-close");
    const tocRoot = document.getElementById("toc-nav");
    const searchInput = document.getElementById("search-input");
    const zoomOutBtn = document.getElementById("media-zoom-out");
    const zoomResetBtn = document.getElementById("media-zoom-reset");
    const zoomInBtn = document.getElementById("media-zoom-in");
    const toggleNumbersBtn = document.getElementById("toc-toggle-numbers");
    const globalToolbar = document.getElementById("global-toolbar");
    const languageSelector = document.getElementById("language-selector");
    const languageSelect = document.getElementById("site-language-select");
    const translationStatus = document.getElementById("translation-status");
    const pdfButton = document.querySelector('[data-tool="pdf"]');
    const sourcePdfUrl = pdfButton ? (pdfButton.getAttribute("data-pdf-url") || "") : "";
    const homeButton = document.querySelector('[data-tool="home"]');
    const homeSectionId = homeButton ? (homeButton.getAttribute("data-home-target") || "") : "";
    const pageViews = Array.from(document.querySelectorAll(".page-view"));
    let mediaZoom = 1;
    let currentSectionId = pageViews[0] ? pageViews[0].id : "";
    let translationJobId = 0;
    let activeTranslator = null;
    let activeTranslationTarget = "__original";
    const translationOriginals = [];
    const translationOriginalMap = new WeakMap();
    const translationCache = new Map();

    function currentHomeLabel() {
        return isRTL ? "\u05e8\u05d0\u05e9\u05d9" : "Home";
    }

    function parseConfig(id) {
        const el = document.getElementById(id);
        if (!el) return {};
        try {
            return JSON.parse(el.textContent || "{}");
        } catch {
            return {};
        }
    }

    const runtimeFeatures = parseConfig("runtime-features-data");
    const toolbarConfig = parseConfig("toolbar-config-data");
    const layoutConfig = parseConfig("layout-config-data");
    const componentRules = parseConfig("component-rules-data");
    const landingConfig = parseConfig("landing-config-data");

    function isToolEnabled(zone, toolId) {
        const entries = Array.isArray(toolbarConfig[zone]) ? toolbarConfig[zone] : [];
        const match = entries.find((item) => item.id === toolId);
        return match ? match.enabled !== false : true;
    }

    function setMediaWidth(px) {
        const viewportWidth = Math.max(320, window.innerWidth || 1280);
        const clamped = Math.max(72, Math.min(viewportWidth - 72, px));
        root.style.setProperty("--media-pane-width", clamped + "px");
    }

    function setTocWidth(px) {
        const clamped = Math.max(200, Math.min(560, px));
        root.style.setProperty("--toc-pane-width", clamped + "px");
    }

    function setMediaZoom(value) {
        mediaZoom = Math.max(0.5, Math.min(3, value));
        root.style.setProperty("--media-zoom", mediaZoom.toFixed(2));
        if (zoomResetBtn) {
            zoomResetBtn.textContent = Math.round(mediaZoom * 100) + "%";
        }
    }

    function setTocNumbersVisible(visible) {
        if (!tocRoot) return;
        tocRoot.classList.toggle("hide-toc-numbers", !visible);
        document.body.classList.toggle("hide-section-numbers", !visible);
        if (toggleNumbersBtn) {
            toggleNumbersBtn.classList.toggle("is-active", !visible);
            toggleNumbersBtn.setAttribute("aria-pressed", visible ? "false" : "true");
            toggleNumbersBtn.textContent = visible ? "123" : "ABC";
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function alignLayoutStart() {
        if (!appContainer) return;
        appContainer.scrollLeft = isRTL ? appContainer.scrollWidth : 0;
    }

    function showLanding() {
        if (!landingPage) return;
        landingPage.hidden = false;
        history.replaceState(null, "", window.location.pathname);
    }

    function hideLanding() {
        if (landingPage) landingPage.hidden = true;
    }

    function setTranslationStatus(message, mode = "") {
        if (!translationStatus) return;
        translationStatus.textContent = message || "";
        translationStatus.dataset.mode = mode;
        translationStatus.hidden = !message;
    }

    function directionForLanguage(langCode) {
        const base = String(langCode || originalLanguage).toLowerCase().split("-")[0];
        return rtlLanguages.has(base) ? "rtl" : "ltr";
    }

    function translatorLanguageCode(langCode) {
        const raw = String(langCode || originalLanguage).trim();
        if (!raw || raw === "__original") return translatorLanguageCode(originalLanguage);
        const lower = raw.toLowerCase();
        const base = lower.split("-")[0];
        if (base === "he" || base === "iw") return "iw";
        if (lower === "zh-cn" || lower === "zh-hans") return "zh";
        if (lower === "zh-hant" || lower === "zh-tw") return "zh-Hant";
        return base;
    }

    function hasTranslatableText(text) {
        return /[A-Za-z\u0590-\u05ff\u0600-\u06ff\u0400-\u04ff\u3040-\u30ff\u3400-\u9fff]/.test(text || "");
    }

    function shouldSkipTextNode(node) {
        const parent = node.parentElement;
        if (!parent) return true;
        if (!hasTranslatableText(node.nodeValue)) return true;
        return Boolean(parent.closest(
            "script,style,noscript,textarea,input,select,option,code,pre,kbd,samp,svg,canvas,[translate='no'],.notranslate,.language-selector"
        ));
    }

    function collectTextNodes(container) {
        if (!container) return [];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        return nodes;
    }

    function collectTranslationRoots() {
        return [
            document.getElementById("toc-nav"),
            document.getElementById("breadcrumbs"),
            document.getElementById("content-container"),
            document.getElementById("media-container"),
            document.getElementById("landing-page")
        ].filter(Boolean);
    }

    function originalTextForNode(node) {
        if (!translationOriginalMap.has(node)) {
            translationOriginalMap.set(node, node.nodeValue);
            translationOriginals.push(node);
        }
        return translationOriginalMap.get(node);
    }

    function restoreOriginalText() {
        translationOriginals.forEach(function (node) {
            if (node && translationOriginalMap.has(node)) {
                node.nodeValue = translationOriginalMap.get(node);
            }
        });
        activeTranslationTarget = "__original";
    }

    function nativeTranslatorAvailable() {
        return "Translator" in self && typeof self.Translator?.create === "function";
    }

    async function getNativeTranslator(sourceLanguage, targetLanguage, jobId) {
        if (!nativeTranslatorAvailable()) {
            throw new Error("Native Translator API is not available in this browser.");
        }
        if (typeof self.Translator.availability === "function") {
            const availability = await self.Translator.availability({ sourceLanguage, targetLanguage });
            if (jobId !== translationJobId) return null;
            if (availability === "unavailable") {
                throw new Error("This language pair is not available in the browser translator.");
            }
        }
        if (activeTranslator && typeof activeTranslator.destroy === "function") {
            try { activeTranslator.destroy(); } catch {}
        }
        return self.Translator.create({
            sourceLanguage,
            targetLanguage,
            monitor(monitor) {
                monitor.addEventListener("downloadprogress", function (event) {
                    if (jobId !== translationJobId) return;
                    const percent = Math.round((event.loaded || 0) * 100);
                    setTranslationStatus("Downloading translation model " + percent + "%", "working");
                });
            }
        });
    }

    async function translateText(translator, text, sourceLanguage, targetLanguage) {
        const leading = text.match(/^\s*/)?.[0] || "";
        const trailing = text.match(/\s*$/)?.[0] || "";
        const core = text.trim();
        if (!core) return text;
        const cacheKey = sourceLanguage + ">" + targetLanguage + ":" + core;
        if (!translationCache.has(cacheKey)) {
            translationCache.set(cacheKey, await translator.translate(core));
        }
        return leading + translationCache.get(cacheKey) + trailing;
    }

    async function translateRegion(container, translator, sourceLanguage, targetLanguage, jobId) {
        const nodes = collectTextNodes(container);
        for (let index = 0; index < nodes.length; index += 1) {
            if (jobId !== translationJobId) return;
            const node = nodes[index];
            const original = originalTextForNode(node);
            node.nodeValue = await translateText(translator, original, sourceLanguage, targetLanguage);
        }
    }

    async function translateVisibleSite(targetLanguage, jobId) {
        const sourceLanguage = translatorLanguageCode(originalLanguage);
        const normalizedTarget = translatorLanguageCode(targetLanguage);
        if (sourceLanguage === normalizedTarget) {
            restoreOriginalText();
            setTranslationStatus("", "");
            return;
        }

        restoreOriginalText();
        setTranslationStatus("Preparing browser translator...", "working");
        const translator = await getNativeTranslator(sourceLanguage, normalizedTarget, jobId);
        if (!translator || jobId !== translationJobId) return;

        activeTranslator = translator;
        activeTranslationTarget = normalizedTarget;
        const roots = collectTranslationRoots();
        const totalNodes = roots.reduce((count, rootNode) => count + collectTextNodes(rootNode).length, 0);
        let completedRoots = 0;

        for (const rootNode of roots) {
            if (jobId !== translationJobId) return;
            await translateRegion(rootNode, translator, sourceLanguage, normalizedTarget, jobId);
            completedRoots += 1;
            setTranslationStatus("Translating site " + completedRoots + "/" + roots.length + " (" + totalNodes + " text blocks)", "working");
        }
        setTranslationStatus("Translated by browser", "success");
    }

    function translateDynamicRegion(container) {
        if (!container || !activeTranslator || activeTranslationTarget === "__original") return;
        const jobId = translationJobId;
        translateRegion(
            container,
            activeTranslator,
            translatorLanguageCode(originalLanguage),
            activeTranslationTarget,
            jobId
        ).catch(function () {
            setTranslationStatus("Could not translate this dynamic area.", "error");
        });
    }

    async function applyLanguageChoice(value, persist = true) {
        const selected = value && value !== "__original" ? value : originalLanguage;
        const direction = directionForLanguage(selected);
        root.lang = selected;
        root.setAttribute("lang", selected);
        root.setAttribute("dir", direction);
        document.body.setAttribute("dir", direction);
        document.body.setAttribute("translate", "yes");
        isRTL = direction === "rtl";
        if (languageSelect) {
            languageSelect.value = value || "__original";
        }
        if (persist) {
            try { localStorage.setItem("digitam:selectedLanguage", value || "__original"); } catch {}
        }
        const jobId = ++translationJobId;
        if (!value || value === "__original" || translatorLanguageCode(selected) === translatorLanguageCode(originalLanguage)) {
            restoreOriginalText();
            setTranslationStatus("", "");
        } else {
            translateVisibleSite(selected, jobId).catch(function (error) {
                if (jobId !== translationJobId) return;
                restoreOriginalText();
                setTranslationStatus(
                    "Automatic browser translation is not available. Use Chrome/Edge with the built-in Translator API enabled.",
                    "error"
                );
                console.warn("Digi-TAM translation failed:", error);
            });
        }
        if (currentSectionId) {
            const activeSection = document.getElementById(currentSectionId);
            if (activeSection) renderBreadcrumbs(activeSection);
        }
        requestAnimationFrame(alignLayoutStart);
    }

    function resolveSectionId(sectionId) {
        if (!sectionId) return "";
        if (document.getElementById(sectionId)) return sectionId;
        const aliasOwner = pageViews.find(function (page) {
            return (page.getAttribute("data-section-aliases") || "")
                .split(/\s+/)
                .filter(Boolean)
                .includes(sectionId);
        });
        return aliasOwner ? aliasOwner.id : sectionId;
    }

    function sectionHasMedia(sectionNode) {
        const sectionMedia = sectionNode ? sectionNode.querySelector(".section-media") : null;
        return Boolean(sectionMedia && sectionMedia.querySelector("img, iframe, video, .media-video-link"));
    }

    function setMediaPaneVisible(visible) {
        document.body.classList.toggle("media-empty-section", !visible);
        if (mediaPane) mediaPane.setAttribute("aria-hidden", visible ? "false" : "true");
        if (resizer) resizer.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    function updateMediaPane(sectionNode) {
        if (!mediaContainer) return;
        mediaContainer.innerHTML = "";
        setMediaZoom(1);

        const sectionMedia = sectionNode.querySelector(".section-media");
        if (sectionHasMedia(sectionNode)) {
            setMediaPaneVisible(true);
            mediaContainer.innerHTML = sectionMedia.innerHTML;
            wireMediaImages();
            translateDynamicRegion(mediaContainer);
            return;
        }
        setMediaPaneVisible(false);
    }

    function wireMediaImages() {
        if (!mediaContainer) return;
        mediaContainer.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("click", function () {
                if (runtimeFeatures.image_lightbox === false || componentRules.media?.lightbox_enabled === false) {
                    return;
                }
                openLightbox(img);
            });
        });
    }

    function openLightbox(img) {
        if (!lightbox || !lightboxImage || !lightboxCaption) return;
        lightboxImage.src = img.currentSrc || img.src;
        lightboxImage.alt = img.alt || "";
        const figure = img.closest("figure");
        const captionNode = figure ? figure.querySelector("figcaption") : null;
        lightboxCaption.textContent = captionNode ? captionNode.textContent.trim() : "";
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImage || !lightboxCaption) return;
        lightbox.hidden = true;
        lightboxImage.removeAttribute("src");
        lightboxCaption.textContent = "";
        document.body.style.overflow = "";
    }

    function renderBreadcrumbs(sectionNode) {
        if (!breadcrumbs) return;
        if (runtimeFeatures.breadcrumbs === false) {
            breadcrumbs.hidden = true;
            return;
        }

        const trail = (sectionNode.getAttribute("data-breadcrumb") || "")
            .split("|")
            .map((part) => part.trim())
            .filter(Boolean);
        const trailIds = (sectionNode.getAttribute("data-breadcrumb-ids") || "")
            .split("|")
            .map((part) => part.trim())
            .filter(Boolean);
        const trailNumbers = (sectionNode.getAttribute("data-breadcrumb-numbers") || "")
            .split("|")
            .map((part) => part.trim());
        const parts = [{ label: currentHomeLabel(), target: pageViews[0] ? pageViews[0].id : "" }].concat(
            trail.map(function (label, index) {
                return { label: label, number: trailNumbers[index] || "", target: trailIds[index] || "" };
            })
        );
        breadcrumbs.hidden = false;
        breadcrumbs.innerHTML = parts.map(function (part, index) {
            const isCurrent = index === parts.length - 1;
            const canNavigate = part.target && !isCurrent;
            const labelHtml = (part.number ? '<span class="breadcrumb-number">' + escapeHtml(part.number) + "</span>" : "") +
                '<span class="breadcrumb-title">' + escapeHtml(part.label) + "</span>";
            const segment = canNavigate
                ? '<button type="button" class="breadcrumb-segment breadcrumb-link" data-target="' + part.target + '">' + labelHtml + "</button>"
                : '<span class="breadcrumb-segment">' + labelHtml + "</span>";
            return index === parts.length - 1 ? segment : segment + '<span class="breadcrumb-separator">›</span>';
        }).join("");
        breadcrumbs.querySelectorAll(".breadcrumb-link[data-target]").forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                window.navigateTo(this.getAttribute("data-target"));
            });
        });
        translateDynamicRegion(breadcrumbs);
    }

    function setTocItemExpanded(item, expanded) {
        item.classList.toggle("is-collapsed", !expanded);
        const toggle = item.querySelector(":scope > .toc-row .toc-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    }

    function expandTocAncestors(link) {
        let current = link.closest(".toc-item");
        while (current) {
            setTocItemExpanded(current, true);
            current = current.parentElement ? current.parentElement.closest(".toc-item") : null;
        }
    }

    function visibleSections() {
        return pageViews.filter((page) => !page.hidden);
    }

    function navigateRelative(step) {
        const sections = visibleSections();
        const index = sections.findIndex((page) => page.id === currentSectionId);
        if (index === -1) return;
        const next = sections[index + step];
        if (next) navigateTo(next.id);
    }

    function copyCurrentLink() {
        if (!currentSectionId) return;
        const url = new URL(window.location.href);
        url.hash = currentSectionId;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url.toString()).catch(() => {});
        }
    }

    function openSourcePdf() {
        if (!sourcePdfUrl) return;
        const opened = window.open(sourcePdfUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
            window.location.href = sourcePdfUrl;
        }
    }

    function filterToolbar() {
        document.querySelectorAll("[data-tool]").forEach((el) => {
            const zone = el.closest(".media-toolbar") ? "media" : (el.closest(".global-toolbar") ? "global" : "toc");
            const toolId = el.getAttribute("data-tool");
            const featureDisabled =
                (toolId === "copy_link" && runtimeFeatures.copy_section_link === false) ||
                ((toolId === "zoom_in" || toolId === "zoom_out" || toolId === "zoom_reset") && (runtimeFeatures.media_zoom === false || componentRules.media?.zoom_enabled === false)) ||
                (toolId === "focus_mode" && runtimeFeatures.focus_mode === false) ||
                (toolId === "search" && runtimeFeatures.search === false) ||
                (toolId === "language_selector" && runtimeFeatures.browser_translation !== true) ||
                (toolId === "pdf" && !sourcePdfUrl) ||
                ((toolId === "prev_section" || toolId === "next_section") && runtimeFeatures.section_navigation === false) ||
                (toolId === "toggle_numbers" && runtimeFeatures.show_hide_numbering === false);
            el.hidden = !isToolEnabled(zone, toolId) || featureDisabled;
        });

        if (searchInput) {
            searchInput.hidden = runtimeFeatures.search === false;
        }
        if (globalToolbar) {
            globalToolbar.hidden = !Array.from(globalToolbar.querySelectorAll("[data-tool]")).some((tool) => !tool.hidden);
        }
    }

    window.navigateTo = function (sectionId) {
        sectionId = resolveSectionId(sectionId);
        hideLanding();
        pageViews.forEach((page) => page.classList.remove("active"));
        const activeSection = document.getElementById(sectionId);
        if (!activeSection) return;
        currentSectionId = sectionId;
        activeSection.classList.add("active");
        renderBreadcrumbs(activeSection);
        updateMediaPane(activeSection);

        document.querySelectorAll("#toc-nav a").forEach(function (link) {
            const isMatch = resolveSectionId(link.getAttribute("data-target")) === sectionId;
            link.classList.toggle("active", isMatch);
            if (isMatch) {
                expandTocAncestors(link);
                link.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        });

        const contentPane = document.querySelector(".content-pane");
        if (contentPane) contentPane.scrollTop = 0;
        if (runtimeFeatures.remember_last_section !== false) {
            try { localStorage.setItem("digitam:lastSection", sectionId); } catch {}
        }
        history.replaceState(null, "", "#" + sectionId);
    };

    document.querySelectorAll("#toc-nav a").forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const target = this.getAttribute("data-target");
            if (target) navigateTo(target);
        });
    });

    document.querySelectorAll(".toc-toggle").forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            const item = this.closest(".toc-item");
            if (!item) return;
            const expanded = this.getAttribute("aria-expanded") !== "true";
            setTocItemExpanded(item, expanded);
        });
    });

    const expandAllBtn = document.getElementById("toc-expand-all");
    if (expandAllBtn) {
        expandAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".toc-item.has-children").forEach((item) => setTocItemExpanded(item, true));
        });
    }

    const collapseAllBtn = document.getElementById("toc-collapse-all");
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener("click", function () {
            document.querySelectorAll(".toc-item.has-children").forEach((item) => setTocItemExpanded(item, false));
        });
    }

    document.querySelectorAll('a[href^="#sec-"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            navigateTo(this.getAttribute("href").substring(1));
        });
    });

    if (breadcrumbs) {
        breadcrumbs.addEventListener("click", function (event) {
            const targetElement = event.target.closest ? event.target : event.target.parentElement;
            const link = targetElement ? targetElement.closest("[data-target]") : null;
            if (!link) return;
            event.preventDefault();
            navigateTo(link.getAttribute("data-target"));
        });
    }

    document.addEventListener("click", function (event) {
        const targetElement = event.target.closest ? event.target : event.target.parentElement;
        const link = targetElement ? targetElement.closest("#breadcrumbs .breadcrumb-link[data-target]") : null;
        if (!link) return;
        event.preventDefault();
        event.stopPropagation();
        navigateTo(link.getAttribute("data-target"));
    }, true);

    if (resizer) {
        let dragging = false;
        const onPointerMove = function (event) {
            if (!dragging) return;
            const viewportWidth = window.innerWidth;
            const width = isRTL ? event.clientX : viewportWidth - event.clientX;
            setMediaWidth(width);
        };
        const stopDragging = function () {
            dragging = false;
            resizer.classList.remove("is-dragging");
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", stopDragging);
        };
        resizer.addEventListener("pointerdown", function (event) {
            if (layoutConfig.media_resizable === false) return;
            dragging = true;
            resizer.classList.add("is-dragging");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", stopDragging);
            event.preventDefault();
        });
        if (layoutConfig.media_resizable === false) {
            resizer.hidden = true;
        }
    }

    if (tocResizer) {
        let draggingToc = false;
        const onTocPointerMove = function (event) {
            if (!draggingToc) return;
            const viewportWidth = window.innerWidth;
            const width = isRTL ? viewportWidth - event.clientX : event.clientX;
            setTocWidth(width);
        };
        const stopTocDragging = function () {
            draggingToc = false;
            tocResizer.classList.remove("is-dragging");
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("pointermove", onTocPointerMove);
            window.removeEventListener("pointerup", stopTocDragging);
        };
        tocResizer.addEventListener("pointerdown", function (event) {
            if (layoutConfig.toc_resizable === false) return;
            draggingToc = true;
            tocResizer.classList.add("is-dragging");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            window.addEventListener("pointermove", onTocPointerMove);
            window.addEventListener("pointerup", stopTocDragging);
            event.preventDefault();
        });
        if (layoutConfig.toc_resizable === false) {
            tocResizer.hidden = true;
            root.style.setProperty("--toc-resizer-width", "0px");
        }
    }

    if (zoomInBtn) zoomInBtn.addEventListener("click", () => setMediaZoom(mediaZoom + 0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => setMediaZoom(mediaZoom - 0.1));
    if (zoomResetBtn) zoomResetBtn.addEventListener("click", () => setMediaZoom(1));

    if (toggleNumbersBtn) {
        toggleNumbersBtn.addEventListener("click", function () {
            const currentlyHidden = tocRoot && tocRoot.classList.contains("hide-toc-numbers");
            setTocNumbersVisible(currentlyHidden);
        });
    }

    if (lightbox && lightboxClose) {
        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
    }

    if (globalToolbar) {
        globalToolbar.addEventListener("click", function (event) {
            const button = event.target.closest("[data-tool]");
            if (!button) return;
            const tool = button.getAttribute("data-tool");
            if (tool === "toggle_toc" && tocPane) {
                const hidden = tocPane.classList.toggle("pane-hidden");
                if (tocResizer) tocResizer.classList.toggle("pane-hidden", hidden);
                document.body.classList.toggle("toc-collapsed", hidden);
            }
            if (tool === "home" || tool === "landing_home") {
                const target = button.getAttribute("data-home-target") || homeSectionId || (pageViews[0] ? pageViews[0].id : "");
                if (target) navigateTo(target);
            }
            if (tool === "prev_section") navigateRelative(-1);
            if (tool === "next_section") navigateRelative(1);
            if (tool === "copy_link") copyCurrentLink();
            if (tool === "focus_mode") document.body.classList.toggle("focus-mode");
            if (tool === "pdf") openSourcePdf();
        });
    }

    if (landingPage) {
        landingPage.querySelectorAll(".landing-card[data-target]").forEach(function (card) {
            card.addEventListener("click", function () {
                navigateTo(this.getAttribute("data-target"));
            });
        });
        landingPage.querySelectorAll(".landing-tab[data-category]").forEach(function (tab) {
            tab.addEventListener("click", function () {
                const category = this.getAttribute("data-category");
                landingPage.querySelectorAll(".landing-tab").forEach((item) => item.classList.toggle("is-active", item === this));
                landingPage.querySelectorAll(".landing-card").forEach((card) => {
                    card.hidden = category !== "all" && card.getAttribute("data-category") !== category;
                });
            });
        });
        if (landingSearch) {
            landingSearch.addEventListener("input", function () {
                const query = this.value.trim().toLowerCase();
                landingPage.querySelectorAll(".landing-card").forEach((card) => {
                    card.hidden = query ? !card.textContent.toLowerCase().includes(query) : false;
                });
            });
        }
        const firstBtn = document.getElementById("landing-enter-first");
        if (firstBtn) firstBtn.addEventListener("click", () => { if (pageViews[0]) navigateTo(pageViews[0].id); });
        const homeBtn = document.getElementById("landing-home-btn");
        if (homeBtn) homeBtn.addEventListener("click", showLanding);
        document.querySelectorAll('[data-tool="toggle_toc"]').forEach((btn) => {
            btn.addEventListener("dblclick", showLanding);
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement !== searchInput && runtimeFeatures.search !== false) {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
        if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
        if (runtimeFeatures.keyboard_shortcuts !== false) {
            if (e.key === "ArrowLeft" && !isRTL) navigateRelative(-1);
            if (e.key === "ArrowRight" && !isRTL) navigateRelative(1);
            if (e.key === "ArrowRight" && isRTL) navigateRelative(-1);
            if (e.key === "ArrowLeft" && isRTL) navigateRelative(1);
        }
    });

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = this.value.trim().toLowerCase();
            const items = Array.from(document.querySelectorAll("#toc-nav .toc-item"));

            if (!query) {
                items.forEach((item) => {
                    item.hidden = false;
                    delete item.dataset.searchMatch;
                });
                return;
            }

            items.slice().reverse().forEach((item) => {
                const ownLink = item.querySelector(":scope > .toc-row .toc-link");
                const ownMatch = ownLink ? ownLink.textContent.toLowerCase().includes(query) : false;
                const childMatch = Array.from(item.querySelectorAll(":scope > .toc-tree .toc-item"))
                    .some((child) => child.dataset.searchMatch === "true");
                const matched = ownMatch || childMatch;
                item.dataset.searchMatch = matched ? "true" : "false";
                item.hidden = !matched;
                if (matched && childMatch) {
                    setTocItemExpanded(item, true);
                }
            });
        });
    }

    if (languageSelect) {
        languageSelect.addEventListener("change", function () {
            applyLanguageChoice(this.value, true);
        });
        let savedLanguage = "__original";
        try { savedLanguage = localStorage.getItem("digitam:selectedLanguage") || "__original"; } catch {}
        applyLanguageChoice(runtimeFeatures.browser_translation === true ? savedLanguage : "__original", false);
    } else {
        root.setAttribute("dir", isRTL ? "rtl" : "ltr");
    }
    setTocNumbersVisible(false);
    setMediaZoom(1);
    filterToolbar();

    const startSection = pageViews[0] ? pageViews[0].id : "";
    if (startSection) navigateTo(startSection);
    requestAnimationFrame(alignLayoutStart);
});
