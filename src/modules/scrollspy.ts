//!
//! SpryJs ScrollSpy Module

type SpryJsScrollSpyAnchor = {
    top: number;
    link: Element;
}

export type SpryJsScrollSpyOptions = {
    items?: Element[] | string,
    anchorHashSelector?: string;
    anchorDataAttribute?: string;
	classActive?: string | string[];
    threshold?: number;
    progress?: 'active' | 'linear' | 'seen';
};

export function scrollspy({
    items = '.scrollspy',
    anchorHashSelector = '[href*="#"]',
    anchorDataAttribute = 'data-scrollspy',
    classActive = 'active',
    threshold = 200,
    progress = 'active',
}: SpryJsScrollSpyOptions = {}) {

    const selectors = [anchorHashSelector, '['+anchorDataAttribute+']'];
    const elements = typeof items === 'object' ? items : document.querySelectorAll(items);

    if (!elements) return;

    if (typeof classActive === 'string') {
        classActive = classActive.split(' ');
    }

    let resizeTimer: Timer | null = null;

    const getScrollSpyAnchors = function(): SpryJsScrollSpyAnchor[] {

        let anchors: SpryJsScrollSpyAnchor[] = [];
        const scrollPosition = window.scrollY;

        elements.forEach(element => {
            element.querySelectorAll(selectors.join(',')).forEach(anchor => {

                let section = null;

                // Try Hash Selectors
                const href = (anchor as HTMLElement).getAttribute('href');
                if (href) {
                    try {
                        const url = new URL(href, window.location.href);
                        if (url && url.hash) {
                            const hash = url.hash.replace('#', '').trim();
                            if (hash) {
                                section = document.querySelector('[id="'+hash+'"], a[name="'+hash+'"]');
                            }
                        }
                    } catch (e) {
                        console.log('Invalid URL for ScrollSpy ('+href+')', e);
                    }
                }

                // Try Data Selectors if no Section found
                if (!section) {
                    const dataSelector = (anchor as HTMLElement).getAttribute(anchorDataAttribute);
                    if (dataSelector) {
                        section = document.querySelector(dataSelector);
                    }
                }

                // Add Anchors if found Section
                if (section) {
                    const sectionRect = section.getBoundingClientRect();
                    anchors.push({
                        top: (sectionRect.y + scrollPosition) - threshold,
                        link: anchor
                    });
                }
            });
        });
        
        return anchors.reverse();
    }

    let anchors = getScrollSpyAnchors();

    const updateAnchors = function() {
        let y = window.scrollY;
        const l = anchors.length;
        for (let i = 0; i < l; i++) {
            
            // Active
            if (progress === 'active') {
                if (y > anchors[i].top) {
                    for (let a = 0; a < l; a++) {
                        anchors[a].link.classList.remove(...classActive);
                    }
                    anchors[i].link.classList.add(...classActive);
                    return;
                }
            }

            // Linear || Seen
            if (['linear', 'seen'].includes(progress)) {
                if (y > anchors[i].top) {
                    anchors[i].link.classList.add(...classActive);
                    if (progress === 'seen') return; // If Seen then return
                    for (let a = 0; a < l; a++) {
                        if (y <= anchors[a].top) {
                            anchors[a].link.classList.remove(...classActive);
                        }
                    }
                }
            }
        };
    }

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