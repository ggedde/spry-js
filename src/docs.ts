/*!
 * SpryJS Docs
 *
 * Author: gedde.dev
 * Github: https://github.com/ggedde/spry-css
 */

const SpryJsDocs = {

    _currentPanel: <Element | null>null,
    _panelContents: <{ [key: string]: string }>{},

    toggleTheme: function(element: Element) {
        element.classList.toggle('scheme-toggle');
        if (element === document.documentElement) {
            document.documentElement.querySelectorAll('.scheme-toggle').forEach(elem => {
                elem.classList.remove('scheme-toggle');
            });
        }
    },

    cleanContent: function(html: string) {
        html = html.replaceAll(' class="bg-faint r-1 p-2"', '');
        html = html.replaceAll('bg-faint r-1 p-2 ', '');
        html = html.replaceAll(' bg-faint r-1 p-2', '');
        html = html.replaceAll('<div class="code-resize-handle"></div>', '');
        html = html.replaceAll('</code>', '');
        var firsTagIndex = html.indexOf('&lt');
        var firstSpaces = '';
        if (firsTagIndex === -1) {
            firsTagIndex = html.indexOf('<');
        }
        if (firsTagIndex === -1) {
            var match = html.match(/[a-zA-Z0-9\/\{]{1}/);
            if (match && match.index) {
                firsTagIndex = match.index;
            }
        }
        if (firsTagIndex > -1) {
            firstSpaces = html.slice(0, firsTagIndex);
            if (firstSpaces) {
                html = html.replaceAll(firstSpaces, "\n").trim();
            }
        }
        var infoTxt = [
            'col',
            'fixed',
            'auto',
            'md-w-300',
            'col A',
            'col B',
            'col C',
            '.span-6',
            '.span-3',
            '.md-span-3',
            '.md-span-4',
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitrsed diam nonumy.', // cspell:disable-line.
            'Lorem ipsum dolor sit amet, consetetur sadipscing ut labore et dolore magna aliquyam erat.', // cspell:disable-line.
            '.span-6 .md-span-3 .lg-span-3',
            'auto fill with larger content'
        ];

        infoTxt.forEach((item) => {
            html = html.replaceAll("\n        " + item + "\n    ", '');
            html = html.replaceAll("\n            " + item + "\n        ", '');
            html = html.replaceAll("\n                " + item + "\n            ", '');
            html = html.replaceAll("\n                    " + item + "\n                ", '');
        });

        html = html.replaceAll('data-loop=""', 'data-loop');
        html = html.replaceAll('data-snap=""', 'data-snap');
        html = html.replaceAll('data-over=""', 'data-over');
        html = html.replaceAll('data-wait=""', 'data-wait');
        html = html.replaceAll('data-toggle=""', 'data-toggle');
        html = html.replaceAll('data-toggle-close=""', 'data-toggle-close');
        html = html.replaceAll('data-scheme-dark=""', 'data-scheme-dark');
        html = html.replaceAll('data-toggle-escapable=""', 'data-toggle-escapable');
        html = html.replaceAll('data-toggle-dismissible=""', 'data-toggle-dismissible');
        html = html.replaceAll('@click.stop=""', '@click.stop');
        html = html.replaceAll(' data-v-app=""', '');
        html = html.replaceAll('defer=""', 'defer');
        html = html.replaceAll('popover=""', 'popover');
        html = html.replaceAll(' data-enpassusermodified="yes"', ''); // cspell:disable-line.

        html = html.replaceAll('&ltdiv class="code-resize-handle"&gt&lt/div&gt', '###'); // cspell:disable-line.
        html = html.replace(/\&gt\n.*\#\#\#/, '&gt');
        html = html.replace('<!-- AlpineJsScript -->', '&ltscript src="//unpkg.com/alpinejs" defer&gt&lt/script&gt'); // cspell:disable-line.

        return html.trim();
    },

    getContent: function(el: Element) {
        var html = '';
        var elem = el.closest('.code-content-container');
        if (elem) {
            var id: string | null = elem.getAttribute('id');
            if (id && this._panelContents[id]) {
                html = this._panelContents[id];
            }
            var languageSelector = elem.querySelector('.language-selector');
            if (languageSelector && (languageSelector as HTMLInputElement).value && id && this._panelContents[id]) {
                var div = document.createElement("div");
                div.innerHTML = this._panelContents[id];
                var divElement = div.querySelector('.language-select[data-language='+(languageSelector as HTMLInputElement).value+']');
                html = divElement ? divElement.innerHTML : '';
            }
        }
        
        if (html) html = this.cleanContent(html);

        return html;
    },

    copyCode: function(event: Event) {
        if (event.target) {
            var code = this.getContent((event.target as Element));
            code = code.replaceAll('&lt;', '<');
            code = code.replaceAll('&gt;', '>');
            code = code.replaceAll('&lt', '<');
            code = code.replaceAll('&gt', '>');
            navigator.clipboard.writeText(code).then(function() {
                var modal = document.getElementById('copy-code-modal');
                if (modal) {
                    modal.classList.add('open');
                    setTimeout(() => {
                        if (modal) {
                            modal.classList.remove('open');
                        }
                    }, 2000);
                }
            }, function(err) {
                console.error('Async: Could not copy text: ', err);
            });
        }
    },

    resizePanel: function(e: MouseEvent){
        e.preventDefault();
        if (SpryJsDocs._currentPanel) {
            var rect = (SpryJsDocs._currentPanel as HTMLElement).getBoundingClientRect();
            const dx = (e.x - rect.x) + 3;
            if (dx && dx > 0) {
                (SpryJsDocs._currentPanel as HTMLElement).style.width = dx.toString() + "px";
            }
        }
    },

    loadSingleCodeContainers: function(api: string | null = null, installer: string | null = null) {
        
        if (api) {
            localStorage.setItem('SpryJSDocsApi', api);
            document.querySelectorAll('.language-select').forEach(langElement => {
                var setLang = langElement.getAttribute('data-language');
                langElement.classList.toggle('none', !setLang || setLang !== api);
            });
            document.querySelectorAll('.language-selector').forEach(selector => {
                if (selector.querySelector('option[value="'+api+'"]')) {
                    (selector as HTMLSelectElement).value = api;
                }
            });
        }
        if (installer) {
            localStorage.setItem('SpryJSDocsInstaller', installer);
            document.querySelectorAll('.installer-select').forEach(installerElement => {
                var setLang = installerElement.getAttribute('data-language');
                installerElement.classList.toggle('none', !setLang || setLang !== installer);
            });
            document.querySelectorAll('.language-selector').forEach(selector => {
                if (selector.querySelector('option[value="'+installer+'"]')) {
                    (selector as HTMLSelectElement).value = installer;
                }
            });
        }
    },

    loadCodeContainer: function(el: Element, languageSync: boolean = false) {

        var elemContainer = el.closest('.code-content-container');
        var langValue = '';

        if (!elemContainer) {
            langValue = (el as HTMLInputElement).value;
            if (langValue) this.loadSingleCodeContainers(langValue);
        }
        
        if (!elemContainer) return;
        var codeDiv = elemContainer.querySelector('.code-preview-container');
        if (!codeDiv) return;

        var minHeight: string | null = '';

        var lang = elemContainer.querySelector('.language-selector');
        
        if (lang && (lang as HTMLInputElement).value) {
            langValue = (lang as HTMLInputElement).value;
            var langSelect = elemContainer.querySelector('.language-select[data-language='+langValue+']');
            if (langSelect) {
                minHeight = langSelect.getAttribute('data-min-height');
            }
            if (langValue && languageSync) {
                document.querySelectorAll('.language-selector option[value='+langValue+']').forEach((option) => {
                    var select = option.closest('select');
                    if (select && select.value !== langValue) {
                        select.value = langValue;
                        const changeEvent = new Event('change');
                        select.dispatchEvent(changeEvent);
                    }
                });
            }
        }

        var html = this.getContent(el);
        html = html.replaceAll('<', '&lt').replaceAll('>', '&gt');
        
        var type = 'html';

        if (html.indexOf('&lt') < 0 && html.indexOf('&gt') < 0) {
            type = 'typescript';
        }

        if (['bun','npm','yarn'].includes(langValue)) {
            type = 'bash';
        }

        var noHeader = elemContainer.hasAttribute('data-no-header');
        var codeDivContents = (type === 'bash' ? '<svg class="icon block color-gray absolute inset my-auto ml-3 index-1" viewBox="0 0 24 24"><path d="M8.59 16.58 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.42z" /></svg>' : '') + '<code class="language-'+type+' '+(type === 'bash' ? 'pl-5' : '')+' '+(noHeader ? 'b-1 r-2' : 'bb-1 border/5')+' block w auto bg-surface p-4 content-center sm'+(elemContainer.classList.contains('with-wrap')?' pre-wrap':'')+'"' + (minHeight ? ' style="min-height: '+minHeight+'px;"' : '') + '>' + html + '</code>';

        codeDiv.innerHTML = codeDivContents;

        // @ts-ignore
        if (typeof Prism !== 'undefined') {
            // @ts-ignore
            Prism.highlightAllUnder(codeDiv);
        }

        var collapse = elemContainer.querySelector('.collapse');
        if (collapse) {
            if (elemContainer.hasAttribute('data-code-only')) {
                collapse.classList.add('open');
            } else {
                collapse.classList.toggle('open');
            }
        }
    }
}

const originalText = document.documentElement.innerHTML;
const newText = originalText.replaceAll('spry-js@x.x.x', 'spry-js@1.0.0');
document.documentElement.innerHTML = newText;

const api = localStorage.getItem('SpryJSDocsApi');
const installer = localStorage.getItem('SpryJSDocsInstaller');

SpryJsDocs.loadSingleCodeContainers(api ? api : 'cdnEsm', installer ? installer : 'npm');

document.querySelectorAll('code[class*=language-]').forEach(codeElement => {
    var html = codeElement.innerHTML;
    var firsTagIndex = html.indexOf('&lt');
    if (firsTagIndex === -1) {
        firsTagIndex = html.indexOf('<');
    }
    if (firsTagIndex === -1) {
        var match = html.match(/[a-zA-Z0-9\/\{]{1}/);
        if (match && match.index) {
            firsTagIndex = match.index;
        }
    }
    
    if (firsTagIndex > -1) {
        var firstSpaces = html.slice(0, firsTagIndex);
        if (firstSpaces && firsTagIndex) {
            html = html.replaceAll(firstSpaces, "\n").trim();
            codeElement.innerHTML = html;
        }
    }
});

document.querySelectorAll('.show-code').forEach((elemContainer, index) => {
    var toggleId = Math.random().toString().replace('.', '');
    var badge = (elemContainer.hasAttribute('data-badge') ? '<'+(elemContainer.hasAttribute('data-badge-link') ? 'a title="Link to '+elemContainer.getAttribute('data-badge-link')+'" aria-label="'+elemContainer.getAttribute('data-badge')+'" href="'+elemContainer.getAttribute('data-badge-link')+'"' : 'span')+' class="badge dense gray outline xs ml-1 align-text-bottom">'+elemContainer.getAttribute('data-badge')+(elemContainer.hasAttribute('data-badge-link') ? '</a>' : '</span>') : '');
    var tooltipWarning = (elemContainer.hasAttribute('data-tooltip-warning') ? '<span class="sm"><i class="icon color-secondary shy"><svg viewBox="0 0 24 24"><path d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2v6z" /></svg></i><span class="tooltip sm center-x outset-top">'+elemContainer.getAttribute('data-tooltip-warning')+'</span></span>' : '');
    var note = (elemContainer.hasAttribute('data-note') ? '<p>'+elemContainer.getAttribute('data-note')+'</p>' : '');
    var warning = (elemContainer.hasAttribute('data-warning') ? '<p class="color-warning">'+elemContainer.getAttribute('data-warning')+'</p>' : '');
    var footer = (elemContainer.hasAttribute('data-footer') ? '<p>'+elemContainer.getAttribute('data-footer')+'</p>' : '');
    var footerNote = (elemContainer.hasAttribute('data-footer-note') ? '<p class="note">'+elemContainer.getAttribute('data-footer-note')+'</p>' : '');
    var codeDiv = '<div class="collapse"><div class="code-preview-container hidden"></div></div>';
    var title = elemContainer.getAttribute('data-title');
    var object = elemContainer.getAttribute('data-object');
    var codeOnly = elemContainer.hasAttribute('data-code-only');
    // var hideLanguageSelector = elemContainer.hasAttribute('data-language-selector-hide');

    var noHeader = elemContainer.hasAttribute('data-no-header');
    
    var languageSync = elemContainer.hasAttribute('data-language-sync');

    var elemContainerId = elemContainer.getAttribute('id');

    if (!elemContainerId) {
        if (object) {
            elemContainerId = object+'.'+index;
        } else {
            elemContainerId = 'code-container-'+index;
        }
        elemContainer.setAttribute('id', elemContainerId);
    }

    if (noHeader) {
        elemContainer.classList.add('b-0');
    }

    var innerContents = elemContainer.innerHTML;
    SpryJsDocs._panelContents[elemContainerId] = innerContents+'';

    var languages = elemContainer.querySelectorAll('.language-select');

    var languageSelector = '';
    var headerNote = warning || note ? '<div class="note bg-faint bb-1 py-2 mt-0">' + warning + note + '</div>' : '';
    var footerNote = footerNote || footer ? '<footer class="bg-faint py-2">' + footer + footerNote + '</footer>' : '';

    var headerNotes = headerNote;
    var footerNotes = footerNote;

    var languageNames: any = {
        html: 'HTML',
        js: 'JS',
        jsGlobal: 'JS Global Object',
        jsEsm: 'JS ESM',
        cdn: 'CDN Custom',
        cdnEsm: 'CDN ESM',
        cdnLoad: 'CDN Auto Loaded',
        node: 'Node',
        npm: 'npm',
        pnpm: 'pnpm',
        yarn: 'yarn',
        bun: 'Bun',
        spryJs: 'SpryJS', 
        petiteVue: 'Petite Vue',
        vueJs: 'Vue.js',
        alpineJs: 'Alpine.js',
    };

    var languageKey: string | null = '';
    var languageNote = '';
    var languageTitle = '';
    var languageWarning = '';
    var languageFooterNote = '';
    var languageFooter = '';

    if (languages && languages.length) {
        languageSelector += '<div class="items-center flex'+(noHeader ? ' mb-2' : '')+'"><select class="language-selector dense pr-4 pl-3 py-2 border/6" onchange="SpryJsDocs.loadCodeContainer(this, '+languageSync+')">';
        languages.forEach(language => {
            languageKey = language.getAttribute('data-language');
            languageTitle = languageKey && languageNames[languageKey] ? languageNames[languageKey] : '';
            if (languageKey && languageTitle) {
                languageSelector += '<option value="'+languageKey+'">'+languageTitle+'</option>';
                languageNote = (language.hasAttribute('data-note') ? '<p>'+language.getAttribute('data-note')+'</p>' : '');
                languageWarning = (language.hasAttribute('data-warning') ? '<p class="color-warning">'+language.getAttribute('data-warning')+'</p>' : '');
                languageFooterNote = (language.hasAttribute('data-footer-note') ? '<footer class="language-'+languageKey+' note p-2 px-3 bg-faint mt-0">'+language.getAttribute('data-footer-note')+'</footer>' : '');
                languageFooter = (language.hasAttribute('data-footer') ? '<footer class="language-'+languageKey+' block p-2 px-3 bg-faint mt-0">'+language.getAttribute('data-footer')+'</footer>' : '');

                headerNotes += languageNote || languageWarning ? '<div class="language-'+languageKey+' note bg-faint bb-1 py-2 mt-0">' + languageNote + languageWarning + '</div>' : '';
                footerNotes = languageFooter + languageFooterNote + footerNotes;
            }
        });
        languageSelector += '</select></div>';
    }

    var innerContents = elemContainer.innerHTML;

    elemContainer.classList.add('outline', 'code-content-container', noHeader ? 'bg-none' : 'bg-theme');

    var themeButton = '';
    var showCodeButton = '';
    var copyCodeButton = '';

    if (!codeOnly) {
        elemContainer.insertAdjacentHTML('beforeend', '<div class="code-content relative p-3 md:p-4"></div>');

        var children = elemContainer.children;
        var codeContent = elemContainer.querySelector('.code-content');
        if (codeContent) {
            for (let c = 0; c < children.length; c++) {
                if (codeContent && codeContent.parentElement && !children[c].classList.contains('code-content') && children[c].tagName && !['SCRIPT', 'STYLE'].includes(children[c].tagName)) {
                    codeContent.appendChild(children[c]);
                }
            }
            codeContent.insertAdjacentHTML('beforeend', '<div class="code-resize-handle"></div>');
        }

        themeButton = '<button class="shy icon link" title="Toggle Theme" onclick="SpryJsDocs.toggleTheme(this.parentElement.parentElement.parentElement);"><svg viewBox="0 0 24 24"><path d="M12,18V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,15.31L23.31,12L20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31Z" /></svg></button>';
        showCodeButton = '<button onclick="SpryJsDocs.loadCodeContainer(this)" class="shy icon link" title="Show HTML code"><svg class="lg" viewBox="0 0 24 24"><path d="m14.6 16.6 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4m-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z" /></svg></button>';
        copyCodeButton = '<button class="shy icon link f:swap" title="Copy HTML to Clipboard" onclick="SpryJsDocs.copyCode(event); setTimeout(() => {this.classList.remove(\'open\'); this.classList.remove(\'active\'); this.setAttribute(\'aria-pressed\', false)}, 2000)"><svg viewBox="0 0 24 24"><path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z" /></svg><svg viewBox="0 0 24 24"><path d="M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z" /></svg></button>';
    }
    
    var header = '<header class="block md:flex '+(noHeader ? 'bg-none p-0' : 'rt-1 hidden')+'">'+(title || badge || tooltipWarning ? '<h4><a href="#'+elemContainerId+'" class="color-inherit">'+title+'</a> '+badge+tooltipWarning+'</h4>' : '')+'<div class="flex content-end mt-2 md:mt-0 ml-auto">'+languageSelector+themeButton+showCodeButton+copyCodeButton+'</div></header>';
    var codeContainer = '<div class="code-container p-0" id="code-'+toggleId+'">'+codeDiv+'</div>';
    
    elemContainer.insertAdjacentHTML('afterbegin', header + headerNotes + codeContainer);

    elemContainer.insertAdjacentHTML('beforeend', footerNotes);

    if (elemContainer.hasAttribute('data-code-only')) {
        SpryJsDocs.loadCodeContainer(elemContainer);
    }
});

document.querySelectorAll('.code-resize-handle').forEach((elem) => {
    elem.addEventListener("mousedown", function(e){
        elem.classList.add('moving');
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
        SpryJsDocs._currentPanel = elem.closest('.code-content-container');
        document.addEventListener("mousemove", SpryJsDocs.resizePanel, false);
    }, false);
});

document.addEventListener("mouseup", function(){
    SpryJsDocs._currentPanel = null;
    document.removeEventListener("mousemove", SpryJsDocs.resizePanel, false);
    document.querySelectorAll('.code-resize-handle.moving').forEach((elem) => {
        elem.classList.remove('moving');
        document.body.style.cursor = 'default';
    });
}, false);

document.querySelectorAll('[href="#"]').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        return false;
    });
});
