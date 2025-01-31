//!
//! SpryJs ScrollSpy Module
type SpryJsScrollSpyOptions = {
	selector: string;
	classActive: string;
};

type SpryJsScrollSpyAnchor = {
    id: string;
    top: number;
    link: Element;
}

export function loadScrollSpy(userOptions?: SpryJsScrollSpyOptions) {

    const defaults = {
		selector: '.scrollspy [href^="#"]',
        classActive: 'active',
	};

	const options = { ...defaults, ...userOptions };

    let resizeTimer: Timer | null = null;

    const getScrollSpyAnchors = function() {
        var scrollSpysLinks = document.querySelectorAll(options.selector);
        var anchors: SpryJsScrollSpyAnchor[] = [];
    
        if (scrollSpysLinks.length) {
            scrollSpysLinks.forEach(link => {
                var href = (link as HTMLElement).getAttribute('href');
                if (href) {
                    var id = href.substring(1);
                    document.querySelectorAll('[id="'+id+'"], a[name="'+id+'"]').forEach(anchor => {
                        var rect = anchor.getBoundingClientRect();
                        anchors.push({
                            id: id,
                            top: (rect.y + window.scrollY) - 100,
                            link: link
                        });
                    });
                }
            });
        }
        
        return anchors.reverse();
    }

    const updateAnchors = function() {
        let y = window.scrollY;

        anchors.forEach(anchor => {anchor.link.classList.remove(options.classActive);});
        for (let a in anchors) {
            var anchor = anchors[a];
            if (y > anchor.top) {
                anchor.link.classList.add(options.classActive);
                break;
            }
        };
    }

    var anchors = getScrollSpyAnchors();
    if (anchors.length) {
        window.addEventListener('scroll', () => {
            updateAnchors();
        });

        window.addEventListener('resize', () => {
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }
            resizeTimer = setTimeout(() => {
                anchors = getScrollSpyAnchors();
            }, 100);
        });
    }

    updateAnchors();
}