fetch('./data.json')
    .then((response) => {
        if (!response.ok) throw new Error(`data.json 요청 실패: ${response.status}`);
        return response.json();
    })
    .then((data) => {
        const portfolio = {
            ...data,
            projects: [...data.projects].reverse(),
        };
        const periodRegExp = /\(\ .{0,50} \)/g;
        const body = document.body;
        let pageNum = 0;

        const stripMarkup = (value = '') => {
            const element = document.createElement('span');
            element.innerHTML = value;
            return element.textContent || '';
        };

        const escapeAttribute = (value = '') => String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const splitTitle = (value = '') => {
            const period = value.match(periodRegExp);
            return {
                title: value.replace(periodRegExp, '').trim(),
                period: period ? period[0] : '',
            };
        };

        const formatDisplayTitle = (value = '') => value.replace(
            /([가-힣])-([가-힣])/g,
            '<span class="nowrap">$1-$2</span>',
        );

        const getDensityClass = (description, techStack, prefix) => {
            const density = stripMarkup(description).length + techStack.join('').length;
            if (density >= 650) return `${prefix}--dense`;
            if (density >= 480) return `${prefix}--compact`;
            return '';
        };

        const pageMaker = (
            content,
            id = null,
            noPageNum = false,
            variant = 'project',
            modifier = '',
        ) => {
            const page = document.createElement('section');
            if (id) page.id = id;
            page.className = `page page--${variant}`;
            page.innerHTML = `
                <div class="subpage ${variant}-subpage${modifier ? ` ${modifier}` : ''}">
                    ${content}
                    ${!noPageNum ? `<div class="pageIndicator" aria-hidden="true">${++pageNum}</div>` : ''}
                </div>
            `;
            return page;
        };

        body.innerHTML = `
            <a class="skip-link" href="#index-1">본문으로 건너뛰기</a>
            <header class="site-chrome" aria-label="포트폴리오 탐색">
                <a class="site-mark" href="#top" aria-label="표지로 이동">
                    <span class="site-mark__glyph" aria-hidden="true">N</span>
                    <span class="site-mark__text">PORTFOLIO <span>2026</span></span>
                </a>
                <a class="site-index-link" href="#index-1">목차</a>
            </header>
            <main id="portfolio-document"></main>
        `;

        const documentRoot = body.querySelector('#portfolio-document');
        const appendPage = (page) => documentRoot.appendChild(page);

        appendPage(pageMaker(`
            <div class="cover-kicker" aria-hidden="true"><span></span><span></span><span></span></div>
            <h1 id="top" class="cover-title"><span>${portfolio.title}</span><small>WORK ARCHIVE</small></h1>
            <div class="cover-footer">
                <div id="docsubtitle">${portfolio.subtitle}</div>
                <span class="cover-index" aria-hidden="true">00</span>
            </div>
        `, null, true, 'cover'));

        const historyPageExist = Boolean(portfolio.history && portfolio.history.length);
        const INDEX_LINES_PER_PAGE = 28;
        const indexEntries = [];
        let indexPageIndex = 1;

        if (historyPageExist) indexEntries.push({ tag: 'h2', id: 'historyPage', title: '히스토리' });
        portfolio.projects.forEach((project) => {
            indexEntries.push({ tag: 'h2', id: project.code, title: project.title });
            (project.projects || []).forEach((subproject) => {
                indexEntries.push({
                    tag: 'h3',
                    id: `${project.code}_${subproject.code}`,
                    title: subproject.title,
                });
            });
        });
        indexEntries.forEach((entry) => { entry.page = indexPageIndex++; });

        for (let offset = 0; offset < indexEntries.length; offset += INDEX_LINES_PER_PAGE) {
            const chunk = indexEntries.slice(offset, offset + INDEX_LINES_PER_PAGE);
            const indexPageId = `index-${Math.floor(offset / INDEX_LINES_PER_PAGE) + 1}`;
            const indexPage = pageMaker(`
                <h1 class="title">
                    <span class="title-main">${offset === 0 ? '목차' : ''}</span>
                    <span class="title-meta" aria-hidden="true">${String(Math.floor(offset / INDEX_LINES_PER_PAGE) + 1).padStart(2, '0')}</span>
                </h1>
                <nav class="descWhole" aria-label="프로젝트 목차">
                    ${chunk.map((entry) => {
                        const indexTitle = splitTitle(entry.title);
                        return `
                            <button class="index-row index-row--${entry.tag === 'h3' ? 'child' : 'project'}" type="button" data-id="${entry.id}">
                                <span class="index-row__label">
                                    <span class="index-row__title">${formatDisplayTitle(indexTitle.title)}</span>
                                    ${indexTitle.period ? `<span class="index-row__period">${indexTitle.period}</span>` : ''}
                                </span>
                                <span class="index-row__page" aria-label="순서">${String(entry.page).padStart(2, '0')}</span>
                            </button>
                        `;
                    }).join('')}
                </nav>
            `, indexPageId, true, 'index');

            indexPage.querySelectorAll('[data-id]').forEach((entry) => {
                entry.addEventListener('click', () => {
                    const target = documentRoot.querySelector(`#${CSS.escape(entry.dataset.id)}`);
                    if (!target) return;
                    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                    target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
                });
            });
            appendPage(indexPage);
        }

        if (historyPageExist) {
            const historyPage = pageMaker(`
                <h2 class="title"><span class="title-main">히스토리</span></h2>
                <div class="contents history-contents">
                    <button class="media-trigger history-media" type="button"
                        data-img="${escapeAttribute(portfolio.history)}"
                        data-caption="히스토리"
                        title="히스토리"
                        aria-label="히스토리 이미지 크게 보기"></button>
                </div>
                <div class="descBottom history-description"><div>${portfolio.desc}</div></div>
            `, 'historyPage', false, 'history');
            appendPage(historyPage);
        }

        const mapBulk = (project, parent = null) => {
            const subprojects = project.projects || [];
            const hasSubproject = subprojects.length > 0;
            const screens = project.screens || [];
            const description = project.desc && project.desc.length > 0
                ? project.desc
                : (parent ? parent.desc : '');
            const techStack = project.tech && project.tech.length > 0
                ? project.tech
                : (parent && parent.tech && parent.tech.length > 0 ? parent.tech : []);
            const projectTitle = splitTitle(project.title);
            const periodText = projectTitle.period
                ? `<span class="period">${projectTitle.period}</span>`
                : '';
            const cleanTitle = projectTitle.title;
            const pageId = `${parent && parent.code ? `${parent.code}_` : ''}${project.code}`;
            const techBlock = techStack.length > 0
                ? `<div class="techStack" aria-label="기술 정보">${techStack.map((tech) => `<strong>${tech.replace(':', ': </strong>')}`).join('<br>')}</div>`
                : '';
            const titleBlock = `<h2 class="title"><span class="title-main">${formatDisplayTitle(cleanTitle)}</span>${periodText}</h2>`;

            if (hasSubproject) {
                const groupDensityClass = getDensityClass(
                    description,
                    techStack,
                    'group-subpage',
                );
                const groupPage = pageMaker(`
                    ${titleBlock}
                    <div class="contents group-contents">
                        <div class="group-stage group-stage--${subprojects.length}">
                            ${subprojects.map((subproject) => {
                                const subprojectTitle = splitTitle(subproject.title).title;
                                return `
                                    <button class="media-trigger inimg inimg${subprojects.length}" type="button"
                                        data-img="${escapeAttribute(subproject.img)}"
                                        data-caption="${escapeAttribute(stripMarkup(subprojectTitle))}"
                                        title="${escapeAttribute(stripMarkup(subprojectTitle))}"
                                        aria-label="${escapeAttribute(stripMarkup(subproject.title))} 이미지 크게 보기"
                                        style="background-image:url('${escapeAttribute(subproject.img)}')"></button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="descBottom project-description">
                        ${techBlock}
                        <div class="descSubject${techStack.length > 0 ? '' : ' descAlone'}">${description}</div>
                    </div>
                `, pageId, false, 'group', groupDensityClass);
                appendPage(groupPage);
                subprojects.forEach((subproject) => {
                    mapBulk(subproject, project);
                });
                return;
            }

            if (!project.img) {
                appendPage(pageMaker(`
                    ${titleBlock}
                    <div class="contents textOnly">
                        <div class="descGold descGoldWide">
                            ${techBlock}
                            <div class="descSubject descAlone">${description}</div>
                        </div>
                    </div>
                `, pageId, false, 'text-only'));
                return;
            }

            const projectDensityClass = getDensityClass(
                description,
                techStack,
                'project-subpage',
            );
            appendPage(pageMaker(`
                ${titleBlock}
                <div class="contents project-contents">
                    <button class="media-trigger inimg inimgGold" type="button"
                        data-img="${escapeAttribute(project.img)}"
                        data-caption="${escapeAttribute(stripMarkup(cleanTitle))}"
                        title="${escapeAttribute(stripMarkup(cleanTitle))}"
                        aria-label="${escapeAttribute(stripMarkup(project.title))} 대표 이미지 크게 보기"
                        style="background-image:url('${escapeAttribute(project.img)}')"></button>
                    <div class="descGold">
                        ${techBlock}
                        <div class="descSubject${techStack.length > 0 ? '' : ' descAlone'}">${description}</div>
                    </div>
                </div>
                <div class="descBottom screens" aria-label="${escapeAttribute(stripMarkup(project.title))} 추가 화면">
                    ${screens.map((screen) => {
                        const screenCaption = stripMarkup(screen.title || `${cleanTitle} 추가 화면`);
                        return `
                            <button class="screen media-trigger" type="button"
                                data-img="${escapeAttribute(screen.img)}"
                                data-caption="${escapeAttribute(screenCaption)}"
                                title="${escapeAttribute(screenCaption)}"
                                aria-label="${escapeAttribute(stripMarkup(screen.title || '추가 화면'))} 크게 보기">
                                <span class="screenImg" style="background-image:url('${escapeAttribute(screen.img)}')"></span>
                                <span class="screenTitle">${screen.title || ''}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            `, pageId, false, 'project', projectDensityClass));
        };

        portfolio.projects.forEach((project) => {
            mapBulk(project);
        });
        document.querySelectorAll('.pageIndicator').forEach((indicator) => {
            indicator.innerHTML += ` / ${pageNum}`;
        });

        const mediaTriggers = $('[data-img]');
        const lightbox = mediaTriggers.simpleLightbox({
            sourceAttr: 'data-img',
            captionSelector: 'self',
            captionsData: 'title',
            captionPosition: 'outside',
            history: false,
        });
        let activeMediaTrigger = null;
        let trapLightboxFocus = null;
        const inertRoots = [
            documentRoot,
            body.querySelector('.site-chrome'),
            body.querySelector('.skip-link'),
        ].filter(Boolean);

        mediaTriggers.on('click', function openMedia() {
            activeMediaTrigger = this;
            lightbox.open($(this));
        });
        mediaTriggers.on('shown.simplelightbox', () => {
            const wrapper = document.querySelector('.sl-wrapper');
            if (!wrapper) return;

            wrapper.setAttribute('role', 'dialog');
            wrapper.setAttribute('aria-modal', 'true');
            wrapper.setAttribute('aria-label', '프로젝트 이미지 보기');

            const closeButton = wrapper.querySelector('.sl-close');
            const previousButton = wrapper.querySelector('.sl-prev');
            const nextButton = wrapper.querySelector('.sl-next');
            closeButton?.setAttribute('aria-label', '이미지 보기 닫기');
            previousButton?.setAttribute('aria-label', '이전 이미지');
            nextButton?.setAttribute('aria-label', '다음 이미지');
            inertRoots.forEach((root) => { root.inert = true; });

            trapLightboxFocus = (event) => {
                if (event.key !== 'Tab') return;
                const controls = [closeButton, previousButton, nextButton]
                    .filter((control) => control && control.getClientRects().length > 0);
                if (controls.length === 0) return;
                const firstControl = controls[0];
                const lastControl = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === firstControl) {
                    event.preventDefault();
                    lastControl.focus();
                } else if (!event.shiftKey && document.activeElement === lastControl) {
                    event.preventDefault();
                    firstControl.focus();
                }
            };
            document.addEventListener('keydown', trapLightboxFocus, true);
            closeButton?.focus();
        });
        mediaTriggers.on('closed.simplelightbox', () => {
            inertRoots.forEach((root) => { root.inert = false; });
            if (trapLightboxFocus) {
                document.removeEventListener('keydown', trapLightboxFocus, true);
                trapLightboxFocus = null;
            }
            activeMediaTrigger?.focus();
            activeMediaTrigger = null;
        });

        body.classList.remove('is-loading');
        body.classList.add('is-ready');
    })
    .catch((error) => {
        console.error('[portfolio] 렌더링 실패', error);
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="render-error" role="alert">
                포트폴리오를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.
            </div>
        `);
    });
