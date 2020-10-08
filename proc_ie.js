NodeList.prototype.forEach = Array.prototype.forEach;
if (!String.prototype.repeat) {

    String.prototype.repeat = function(count) {
      'use strict';
      if (this == null) {
        throw new TypeError('can\'t convert ' + this + ' to object');
      }
      var str = '' + this;
      count = +count;
      if (count != count) {
        count = 0;
      }
      if (count < 0) {
        throw new RangeError('repeat count must be non-negative');
      }
      if (count == Infinity) {
        throw new RangeError('repeat count must be less than infinity');
      }
      count = Math.floor(count);
      if (str.length == 0 || count == 0) {
        return '';
      }
      // Ensuring count is a 31-bit integer allows us to heavily optimize the
      // main part. But anyway, most current (August 2014) browsers can't handle
      // strings 1 << 28 chars or longer, so:
      if (str.length * count >= 1 << 28) {
        throw new RangeError('repeat count must not overflow maximum string size');
      }
      var maxCount = str.length * count;
      count = Math.floor(Math.log(count) / Math.log(2));
      while (count) {
         str += str;
         count--;
      }
      str += str.substring(0, maxCount - str.length);
      return str;
    }
  }
$(document).ready(function(){
$.get('./data.json').then(
function _init(data) {
    var portfolio = data;

    var periodRegExp = /\(\ .{0,50} \)/g;

    var pageNum = 0;
    var pageMaker = function pageMaker(content) {
        var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var noPageNum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var page = document.createElement('div');
        if (id) page.id = id;
        page.className = 'page';
        page.innerHTML = '<div class="subpage">' + content + (!noPageNum ? ('<div class="pageIndicator">' + (++pageNum) + '</div>') : '') + '</div>';
        return page;
    };

    var body = document.getElementsByTagName('body')[0];
    var appendOnBody = function appendOnBody(element) {
        console.log(element)
        $('body').append($(element));
    };

    appendOnBody(pageMaker('<div id=\'doctitle\'>' + portfolio.title + '</div><div id=\'docsubtitle\'>' + portfolio.subtitle + '</div>    ',null,true));

    var historyPageExist = false;
    if (portfolio.history && portfolio.history.length !== 0) historyPageExist = true;

    // 목차
    var indexPageidx = 1;
    var indexPage = pageMaker('<div class=\'title\'>\uBAA9\uCC28</div><div class=\'descWhole\'>' + (historyPageExist ? '<h2 data-id=\'historyPage\'>\uD788\uC2A4\uD1A0\uB9AC<span>' + indexPageidx++ + '</span></h2><br>' : '') + portfolio.projects.map(function (e) {
        return '<h2 data-id=\'' + e.code + '\'>' + e.title + '<span>' + indexPageidx++ + '</span></h2>' + (e.projects && e.projects.length > 0 ? '<br/>' + e.projects.map(function (r) {
            return '<h3 data-id=\'' + e.code + '_' + r.code + '\'>' + r.title + '<span>' + indexPageidx++ + '</span></h3>';
        }).join('<br />') : '');
    }).join('<br />') + '</div>',null,true);
    indexPage.querySelectorAll('[data-id]').forEach(function (e) {
        e.onclick = function () {
            body.querySelector('#' + this.getAttribute('data-id')).scrollIntoView({ block: 'start', behavior: 'smooth' });
        };
    });
    appendOnBody(indexPage);

    if (historyPageExist) {
        historyPage = pageMaker('<div class=\'title\'>\uD788\uC2A4\uD1A0\uB9AC</div>    <div class=\'contents\'><img class="inimg inimg1" src=\'' + portfolio.history + '\'/></div>    <div class=\'descBottom\'><div>' + portfolio.desc + '</div></div>        ', 'historyPage');
        historyPage.imgViewer = new ImageViewer(historyPage.querySelector('.contents > img'), { zoomValue: 200, x: 842, y: 626 });
    }
    appendOnBody(historyPage);
    //
    var mapBulk = function mapBulk(project) {
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var hasSubproject = false;
        var techStack = [];
        project.desc = project.desc && project.desc.length > 0 ? project.desc : parent.desc;
        try {
            if (project.projects.length > 0) hasSubproject = true;
        } catch (e) {}
        try {
            if (project.tech.length > 0) techStack = project.tech;
        } catch (e) {
            try {
                if (parent.tech.length > 0) techStack = parent.tech;
            } catch (e) {}
        }

        var period = project.title.match(periodRegExp);
        var periodText = period ? '<div class=\'period\'>' + project.title.match(periodRegExp)[0] + '</div>' : '';

        if (hasSubproject) {
            appendOnBody(pageMaker('                <div class=\'title\'>' + project.title.replace(periodRegExp, '') + periodText + '</div>                <div class=\'contents\'>                    ' + project.projects.map(function (subproject) {
                return '<div class="inimg inimg' + project.projects.length + '"                            rel="' + project.code + '" title="' + project.desc + '" data-img="' + project.img + '"                            style=\'background-image:url("' + subproject.img + '")\' ></div>';
            }).join('') + '                </div>                <div class=\'descBottom\'>                    ' + (techStack.length > 0 ? '<div class=\'techStack\'>' + techStack.map(function (tech) {
                return '<strong>' + tech.replace(':', ': </strong>');
            }).join('<br>') + '</div>' : '') + '                    <div class=\'descSubject' + (techStack.length > 0 ? '' : ' descAlone') + '\'>' + project.desc + '</div>                </div>            ', '' + (parent && parent.code ? parent.code + '_' : '') + project.code));
            project.projects.forEach(function (subproject) {
                return mapBulk(subproject, project);
            });
        } else {
            appendOnBody(pageMaker('                <div class=\'title\'>' + project.title.replace(periodRegExp, '') + periodText + '</div>                <div class=\'contents\'>                    <div class="inimg inimgGold"                        rel="' + project.code + '" title="' + project.desc + '" data-img="' + project.img + '"                        style=\'background-image:url("' + project.img + '")\'></div>                    <div class="descGold">                        ' + (techStack.length > 0 ? '<div class=\'techStack\'>' + techStack.map(function (tech) {
                return '<strong>' + tech.replace(':', ': </strong>');
            }).join('<br>') + '</div>' : '') + '                        <div class=\'descSubject' + (techStack.length > 0 ? '' : ' descAlone') + '\'>' + project.desc + '</div>                    </div>                </div>                <div class=\'descBottom screens\'>' + (project.screens.map(function (screen) {
                return '<div class="screen" rel="' + project.code + '" title="' + screen.desc + '" data-img="' + screen.img + '">                        <div class="screenImg" style=\'background-image:url("' + screen.img + '")\'></div>                        <div class="screenTitle">' + screen.title + '</div>                    </div>';
            }).join('') + '<div class="screen empty"></div>'.repeat(project.screens.length % 4)) + '</div>            ', '' + (parent && parent.code ? parent.code + '_' : '') + project.code));
        }
    };
    portfolio.projects.forEach(mapBulk);

    document.querySelectorAll('.pageIndicator').forEach(function(e){
        e.innerHTML += ' / ' + pageNum;
    });

    setTimeout(function () {
        var lightbox = $('div[data-img]').simpleLightbox({
            sourceAttr: 'data-img',
            captionSelector: 'self',
            captionsData: 'title',
            history: false
        });
        $('div[data-img]').click(function () {
            lightbox.open($(this));
        });
    }, 0);
});
});
