//!
//! SpryJs ScrollSpy Module
type SpryJsScrollSpyOptions = {
	selector: string;
	classActive: string;
};

type SpryJsScrollSpyAnchor = {
    top: number;
    link: Element;
}

export function loadScrollSpy(userOptions?: SpryJsScrollSpyOptions) {

    const defaults = {
		selector: '.scroll-spy [href*="#"]',
		dataAttribute: 'data-scroll-spy',
        classActive: 'active',
        threshold: 100,
	};

	const options = { ...defaults, ...userOptions };

    let resizeTimer: Timer | null = null;

    const selectors = [options.selector, '['+options.dataAttribute+']'];

    const getScrollSpyAnchors = function() {
        const scrollSpyAnchors = document.querySelectorAll(selectors.join(','));
        let anchors: SpryJsScrollSpyAnchor[] = [];
    
        if (scrollSpyAnchors.length) {
            scrollSpyAnchors.forEach(anchor => {

                // Data Selectors
                const dataSelector = (anchor as HTMLElement).getAttribute(options.dataAttribute);
                if (dataSelector) {
                    document.querySelectorAll(dataSelector).forEach(anchor => {
                        var rect = anchor.getBoundingClientRect();
                        anchors.push({
                            top: (rect.y + window.scrollY) - options.threshold,
                            link: anchor
                        });
                    });
                }

                // Hash Selectors
                const href = (anchor as HTMLElement).getAttribute('href');
                if (href) {
                    try {
                        const url = new URL(href, window.location.href);
                        if (url && url.hash) {
                            const hash = url.hash.replace('#', '');
                            if (hash) {
                                document.querySelectorAll('[id="'+hash+'"], a[name="'+hash+'"]').forEach(section => {
                                    const rect = section.getBoundingClientRect();
                                    anchors.push({
                                        top: (rect.y + window.scrollY) - options.threshold,
                                        link: anchor
                                    });
                                });
                            }
                        }
                    } catch (e) {
                        console.log(['Invalid URL for Scroll Spy ('+href+')', e]);
                    }
                }
            });
        }
        
        return anchors.reverse();
    }

    const updateAnchors = function() {
        let y = window.scrollY;

        anchors.forEach(anchor => {anchor.link.classList.remove(options.classActive)});
        for (const anchor of anchors) {
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