try{
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

    // 목차
    let indexPageidx = 1;
    const front = portfolio.projects.slice(0,14);
    const behind = portfolio.projects.slice(15,19);
    let indexPage = pageMaker(`
    <div class='title'>목차</div>
    <div class='descWhole'>${historyPageExist ? `<h2 data-id='historyPage'>히스토리<span>${indexPageidx++}</span></h2><br>` : ''}${front.map(e=>`<h2 data-id='${e.code}'>${e.title}<span>${indexPageidx++}</span></h2>${(e.projects && e.projects.length>0) ? '<br/>' + e.projects.map(r=>`<h3 data-id='${e.code}_${r.code}'>${r.title}<span>${indexPageidx++}</span></h3>`).join('<br />') : ''}`).join('<br />')}</div>`
    ,null, true);
    let indexPage2 = pageMaker(`
    <div class='title'></div>
    <div class='descWhole'>${behind.map(e=>`<h2 data-id='${e.code}'>${e.title}<span>${indexPageidx++}</span></h2>${(e.projects && e.projects.length>0) ? '<br/>' + e.projects.map(r=>`<h3 data-id='${e.code}_${r.code}'>${r.title}<span>${indexPageidx++}</span></h3>`).join('<br />') : ''}`).join('<br />')}</div>`
        ,null, true);

    [indexPage, indexPage2].forEach(i=>i.querySelectorAll('[data-id]').forEach((e)=>{
        e.onclick = function() {
            body.querySelector('#'+this.getAttribute('data-id')).scrollIntoView({ block: 'start',  behavior: 'smooth' });
        }
    }));
    appendOnBody(indexPage);
    appendOnBody(indexPage2);

    if (historyPageExist) {
        historyPage = pageMaker(`
            <div class='title'>히스토리</div>
            <div class='contents'><img class="inimg inimg1" src='${portfolio.history}'/></div>
            <div class='descBottom'><div>${portfolio.desc}</div></div>
        `,'historyPage');
        historyPage.imgViewer = new ImageViewer(historyPage.querySelector('.contents > img'),{zoomValue: 200,x:842,y:626});
    }
    appendOnBody(historyPage);
    //
    const mapBulk = (project, parent=null)=>{
        let hasSubproject = false;
        let techStack = [];
        project.desc = (project.desc && project.desc.length >0) ? project.desc : parent.desc;
        try {
            if(project.projects.length >0) hasSubproject = true;
        }catch (e){}
        try {
            if(project.tech.length >0) techStack = project.tech;
        }catch (e){
            try {
                if(parent.tech.length >0) techStack = parent.tech;
            }catch (e){}
        }


        const period = project.title.match(periodRegExp);
        const periodText = period? `<div class='period'>${project.title.match(periodRegExp)[0]}</div>` : '';

        if (hasSubproject) {
            appendOnBody(pageMaker(`
                <div class='title'>${project.title.replace(periodRegExp,'')}${periodText}</div>
                <div class='contents'>
                    ${project.projects.map((subproject)=>
                        `<div class="inimg inimg${project.projects.length}"
                            rel="${project.code}" title="${project.desc}" data-img="${project.img}"
                            style='background-image:url("${subproject.img}")' ></div>`).join('\n')
                    }
                </div>
                <div class='descBottom'>
                    ${techStack.length > 0 ? `<div class='techStack'>` + techStack.map(tech=>`<strong>${tech.replace(':',': </strong>')}`).join('<br>') + `</div>` : ''}
                    <div class='descSubject${techStack.length > 0 ? '' : ' descAlone'}'>${project.desc}</div>
                </div>
            `,`${parent && parent.code ? parent.code + '_' : ''}${project.code}`));
            project.projects.forEach((subproject)=>mapBulk(subproject, project));
        } else {
            appendOnBody(pageMaker(`
                <div class='title'>${project.title.replace(periodRegExp,'')}${periodText}</div>
                <div class='contents'>
                    <div class="inimg inimgGold"
                        rel="${project.code}" title="${project.desc}" data-img="${project.img}"
                        style='background-image:url("${project.img}")'></div>
                    <div class="descGold">
                        ${techStack.length > 0 ? `<div class='techStack'>` + techStack.map(tech=>`<strong>${tech.replace(':',': </strong>')}`).join('<br>') + `</div>` : ''}
                        <div class='descSubject${techStack.length > 0 ? '' : ' descAlone'}'>${project.desc}</div>
                    </div>
                </div>
                <div class='descBottom screens'>${project.screens.map((screen)=>
                    `<div class="screen" rel="${project.code}" title="${screen.desc}" data-img="${screen.img}">
                        <div class="screenImg" style='background-image:url("${screen.img}")'></div>
                        <div class="screenTitle">${screen.title}</div>
                    </div>`).join('\n')+
                    '<div class="screen empty"></div>'.repeat(project.screens.length % 4)
                }</div>
            `,`${parent && parent.code ? parent.code + '_' : ''}${project.code}`));
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
});
}catch (e) {
    alert(JSON.stringify(e))
}
