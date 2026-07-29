fetch('./data.json').then(response => response.json()).then(function _init(data) {
    let portfolio = data;

    portfolio.projects = portfolio.projects.reverse();

    const periodRegExp = /\(\ .{0,50} \)/g;

    let pageNum = 0;
    const pageMaker = (content, id=null, noPageNum) => {
        const page = document.createElement('div');
        if(id) page.id = id;
        page.className = 'page';
        page.innerHTML = `<div class="subpage">${content}${!noPageNum ? `<div class="pageIndicator">${++pageNum}</div>` : ''}</div>`;
        return page;
    }
    const body = document.getElementsByTagName('body')[0];
    const appendOnBody = (element) => {
        body.appendChild(element);
    }

    appendOnBody(pageMaker(`
    <div id='doctitle'>${portfolio.title}</div>
    <div id='docsubtitle'>${portfolio.subtitle}</div>
    `,null,true));

    let historyPageExist = false;
    if(portfolio.history && portfolio.history.length !== 0) historyPageExist = true;

    // 목차 : 프로젝트/서브프로젝트를 한 줄씩 펼친 뒤 페이지 용량만큼 자동 분할
    const INDEX_LINES_PER_PAGE = 28;   // 목차 1페이지 가용 943px / 항목당 약 31px
    let indexPageidx = 1;
    const indexEntries = [];
    if (historyPageExist) indexEntries.push({ tag: 'h2', id: 'historyPage', title: '히스토리' });
    portfolio.projects.forEach((project) => {
        indexEntries.push({ tag: 'h2', id: project.code, title: project.title });
        (project.projects || []).forEach((sub) => {
            indexEntries.push({ tag: 'h3', id: `${project.code}_${sub.code}`, title: sub.title });
        });
    });
    indexEntries.forEach((entry) => { entry.page = indexPageidx++; });

    for (let offset = 0; offset < indexEntries.length; offset += INDEX_LINES_PER_PAGE) {
        const chunk = indexEntries.slice(offset, offset + INDEX_LINES_PER_PAGE);
        const indexPage = pageMaker(`
    <div class='title'>${offset === 0 ? '목차' : ''}</div>
    <div class='descWhole'>${chunk.map(entry =>
            `<${entry.tag} data-id='${entry.id}'>${entry.title}<span>${entry.page}</span></${entry.tag}>`
        ).join('')}</div>`, null, true);
        indexPage.querySelectorAll('[data-id]').forEach((e)=>{
            e.onclick = function() {
                const target = body.querySelector('#' + this.getAttribute('data-id'));
                if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
        });
        appendOnBody(indexPage);
    }

    let historyPage;

    if (historyPageExist) {
        historyPage = pageMaker(`
            <div class='title'>히스토리</div>
            <div class='contents'><img class="inimg inimg1" src='${portfolio.history}'/></div>
            <div class='descBottom'><div>${portfolio.desc}</div></div>
        `,'historyPage');
        historyPage.imgViewer = new ImageViewer(historyPage.querySelector('.contents > img'),{zoomValue: 200,x:842,y:626});
    }
    historyPage && appendOnBody(historyPage);
    //
    const mapBulk = (project, parent=null)=>{
        const subprojects = project.projects || [];
        const hasSubproject = subprojects.length > 0;
        const screens = project.screens || [];
        project.desc = (project.desc && project.desc.length > 0) ? project.desc : (parent ? parent.desc : '');

        let techStack = [];
        if (project.tech && project.tech.length > 0) techStack = project.tech;
        else if (parent && parent.tech && parent.tech.length > 0) techStack = parent.tech;

        const period = project.title.match(periodRegExp);
        const periodText = period ? `<div class='period'>${period[0]}</div>` : '';
        const techBlock = techStack.length > 0
            ? `<div class='techStack'>` + techStack.map(tech=>`<strong>${tech.replace(':',': </strong>')}`).join('<br>') + `</div>`
            : '';
        const pageId = `${parent && parent.code ? parent.code + '_' : ''}${project.code}`;

        if (hasSubproject) {
            appendOnBody(pageMaker(`
                <div class='title'>${project.title.replace(periodRegExp,'')}${periodText}</div>
                <div class='contents'>
                    ${subprojects.map((subproject)=>
                        `<div class="inimg inimg${subprojects.length}"
                            rel="${project.code}" title="${project.desc}" data-img="${project.img}"
                            style='background-image:url("${subproject.img}")' ></div>`).join('\n')
                    }
                </div>
                <div class='descBottom'>
                    ${techBlock}
                    <div class='descSubject${techStack.length > 0 ? '' : ' descAlone'}'>${project.desc}</div>
                </div>
            `, pageId));
            subprojects.forEach((subproject)=>mapBulk(subproject, project));
        } else if (!project.img) {
            // 이미지를 공개할 수 없는 프로젝트 : 본문 전폭 레이아웃
            appendOnBody(pageMaker(`
                <div class='title'>${project.title.replace(periodRegExp,'')}${periodText}</div>
                <div class='contents textOnly'>
                    <div class="descGold descGoldWide">
                        ${techBlock}
                        <div class='descSubject descAlone'>${project.desc}</div>
                    </div>
                </div>
            `, pageId));
        } else {
            appendOnBody(pageMaker(`
                <div class='title'>${project.title.replace(periodRegExp,'')}${periodText}</div>
                <div class='contents'>
                    <div class="inimg inimgGold"
                        rel="${project.code}" title="${project.desc}" data-img="${project.img}"
                        style='background-image:url("${project.img}")'></div>
                    <div class="descGold">
                        ${techBlock}
                        <div class='descSubject${techStack.length > 0 ? '' : ' descAlone'}'>${project.desc}</div>
                    </div>
                </div>
                <div class='descBottom screens'>${screens.map((screen)=>
                    `<div class="screen" rel="${project.code}" title="${screen.desc}" data-img="${screen.img}">
                        <div class="screenImg" style='background-image:url("${screen.img}")'></div>
                        <div class="screenTitle">${screen.title}</div>
                    </div>`).join('\n')+
                    '<div class="screen empty"></div>'.repeat(screens.length % 4)
                }</div>
            `, pageId));
        }
    }
    portfolio.projects.forEach(mapBulk);
    document.querySelectorAll('.pageIndicator').forEach(function(e){
        e.innerHTML += ' / ' + pageNum;
    })
    setTimeout(()=>{
        const lightbox = $('div[data-img]').simpleLightbox({
            sourceAttr: 'data-img',
            captionSelector: 'self',
            captionsData: 'title',
            history: false
        });
        $('div[data-img]').click(function(){
            lightbox.open($(this))
        })
    },0);
}).catch((e) => {
    console.error('[portfolio] 렌더링 실패', e);
    document.body.insertAdjacentHTML('afterbegin',
        `<div style="padding:2cm;font:14pt 'Nanum Gothic'">포트폴리오를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</div>`);
});
