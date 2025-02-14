//!
//! SpryJs Sliders Module

declare global {
    interface Element {
        spryJsSliderLoaded: boolean;
    }
}

export type SpryJsSliderOptions = {
	items?: Element[] | string,
	classSlides?: string;
	classNext?: string;
	classPrev?: string;
	classPagination?: string;
};

type SpryJsSliderObject = {
	destroy: Function;
};

export function slider({
	items = ".slider",
	classSlides = ".slider-slides",
	classNext = ".slider-next",
	classPrev = ".slider-prev",
	classPagination = ".slider-pagination",
}: SpryJsSliderOptions = {}): {destroy: Function, update: Function} {

	let elements: Element[] | NodeListOf<Element> | null = null;
	let isSelecting = false;
	let sliders: SpryJsSliderObject[] = [];

	function createSliderObject(slider: Element): SpryJsSliderObject | null {

		const play = parseInt((slider.getAttribute("data-play") || 0).toString());
		const loop = slider.hasAttribute("data-loop");
		const stop = slider.getAttribute("data-stop");
		const next = slider.querySelector(classNext);
		const prev = slider.querySelector(classPrev);
		const pagination = slider.querySelector(classPagination);
		const slides = slider.querySelector(classSlides);
		const slideCount = slides ? slides.childElementCount : 0;
		const slidesWidth = slides ? slides.scrollWidth : 0;
		const block = slides ? slides.innerHTML : "";

		let scrollTimer: Timer | null = null;
		let playTimer: Timer | null = null;

		if (!document.body.contains(slider) || !slides || (!next && !prev && !loop && !stop && !play)) return null;

		function isVisible(): boolean {
			if (!slider || !document.body.contains(slider)) return false;
			var rect = slider.getBoundingClientRect();
			return (rect.bottom >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight));
		}

		function goTo(to: number | string, instant?: boolean) {
			var offsetSlides = loop ? slideCount : 0;
			if (!slides) return;
			if (to === 'next') {
				slides.scrollBy((slider as HTMLElement).offsetWidth, 0);
			} else if (to === 'prev') {
				slides.scrollBy(-((slides as HTMLElement).offsetWidth), 0);
			} else {
				slides.scrollTo({ left: (slides.children[(parseFloat(to.toString()) + offsetSlides)] as HTMLElement).offsetLeft, behavior: instant ? 'instant' : 'smooth' });
			}
		}

		function playStop() {
			if (playTimer) {
				clearInterval(playTimer);
				playTimer = null;
			}
		}

		function playStart() {
			if (play && document.body.contains(slider)) {
				playTimer = setTimeout(() => {
					if (isVisible()) {
						var hasAction = stop === 'action' && (slider.querySelector('a:hover') || slider.querySelector('button:hover'));
						var hasHover = stop === 'hover' && slider.matches(':hover');
						if (!hasAction && !hasHover) {
							goTo('next');
						}
					}
					resetPlay();
				}, play);
			}
		}

		function resetPlay() {
			playStop();
			playStart();
		}
		
		function goToNext() {
			goTo('next');
		}

		function goToPrev() {
			goTo('prev');
		}

		function sliderScroll() {
			slider.setAttribute('data-sliding', '');
			slider.removeAttribute('data-position');
			if (scrollTimer) clearTimeout(scrollTimer);
			playStop();
			scrollTimer = setTimeout(function () {
				slider.removeAttribute('data-sliding');
				resetPlay();
				if (loop && slides) {
					var blockWidth = (slides.scrollWidth / 3);
					if (slides.scrollLeft < blockWidth) {
						var offset = blockWidth - slides.scrollLeft;
						slides.scrollTo({ left: (((blockWidth * 2) - offset)), behavior: 'instant' });
					}
					if (slides.scrollLeft >= (blockWidth * 2)) {
						var offset = slides.scrollLeft - (blockWidth * 2);
						slides.scrollTo({ left: blockWidth + offset, behavior: 'instant' });
					}

				} else if(slides) {
					if (!slides.scrollLeft) {
						slider.setAttribute('data-position', 'start');
					} else if (slides.scrollLeft + (slider as HTMLElement).offsetWidth >= (slides.scrollWidth - 2)) {
						slider.setAttribute('data-position', 'end');
					}
				}
				slider.querySelectorAll('.slider-slides > *').forEach(element => {
					element.removeAttribute('data-first');
					element.removeAttribute('data-last');
					var left = Math.round(element.getBoundingClientRect().left - slider.getBoundingClientRect().left);
					element.toggleAttribute('data-showing', (left >= 0 && left < slider.clientWidth));
				});
				var showing = slider.querySelectorAll('[data-showing]');
				if (showing.length) {
					if (pagination && slides) {
						pagination.querySelectorAll('.active').forEach(active => {
							active.classList.remove('active');
						});
						var childIndex = Array.from(slides.children).indexOf(showing[0]);
						if (loop) {
							childIndex = (childIndex === slideCount * 2) ? 0 : (childIndex - slideCount);
						}
						if (childIndex !== undefined) {
							pagination.children[childIndex].classList.add('active');
						}
					}
					showing[0].setAttribute('data-first', '');
					showing[showing.length - 1].setAttribute('data-last', '');
					var preLoadImages = function (elem: HTMLImageElement | null, type: string, total: number) {
						var i = 0;
						var imageSrcs = [];
						if (!elem) return;
						while ((elem = type === "next" ? (elem.nextSibling as HTMLImageElement) : (elem.previousSibling as HTMLImageElement))) {
							if (i >= total || !elem.nodeType || elem.nodeType === 3) continue; // text node
							var loading = elem.getAttribute("loading");
							if (elem.tagName === 'IMG' && loading && loading.toLowerCase() === 'lazy') {
								imageSrcs.push(elem.src);
							} else {
								elem.querySelectorAll('img[loading="lazy"]').forEach(img => {
									imageSrcs.push((img as HTMLImageElement).src);
								});
							}
							i++;
						}
						imageSrcs.forEach(imageSrc => {
							var newImg = new Image();
							newImg.src = imageSrc;
						});
					}
					preLoadImages(slider.querySelector('[data-last]'), 'next', showing.length);
					preLoadImages(slider.querySelector('[data-last]'), 'prev', showing.length);
				}
			}, 100);
		}

		function sliderSelectionChange() {
			if (!document.body.contains(slider)) {
				document.removeEventListener('selectionchange', sliderSelectionChange);
				return;
			}
			if (isVisible()) {
				var selection: Selection | null | string = document.getSelection();
				if (selection) {
					selection = selection.toString();
				}
				if (isSelecting && selection) {
					playStop();
				}
				if (!isSelecting && !selection && !playTimer) {
					resetPlay();
				}
			}
		}

		function sliderSelectStart() {
			isSelecting = true;
		}

		function sliderSelectEnd() {
			isSelecting = false;
		}

		function sliderHover() {
			playStop();
		}

		function sliderMouseOut() {
			resetPlay();
		}

		function sliderAddEvents() {
			if (slides) slides.addEventListener('scroll', sliderScroll);
			if (next) next.addEventListener('click', goToNext);
			if (prev) prev.addEventListener('click', goToPrev);
			if (play) {
				if (stop === 'hover') {
					slider.addEventListener('mouseover', sliderHover);
					slider.addEventListener('mouseout', sliderMouseOut);
				}
				if (stop === 'action') {
					document.addEventListener('selectionchange', sliderSelectionChange);
					slider.addEventListener('selectstart', sliderSelectStart);
					slider.addEventListener('mouseup', sliderSelectEnd);
				}
			}
		}

		if (pagination && !pagination.childNodes.length && slides && slideCount) {
			for (let index = 0; index < slideCount; index++) {
				let btn = document.createElement("button");
				if (index === 0) btn.classList.add('active');
				btn.onclick = () => {
					goTo(index);
					if (pagination && pagination.children) {
						Array.from(pagination.children).forEach(paginate => {
							paginate.classList.remove('active');
						});
					}
					btn.classList.add('active');
				}
				pagination.append(btn);
			}
		}

		if (loop) {
			slides.innerHTML += block + block;
			slides.scrollTo({ left: slidesWidth, behavior: 'instant' });
		} else {
			slides.dispatchEvent(new CustomEvent('scroll'));
			slider.setAttribute('data-position', 'start');
		}

		resetPlay();
		sliderAddEvents();

		return {
			destroy: function() {
				playStop();
				if (slides) slides.removeEventListener('scroll', sliderScroll);
				if (next) next.removeEventListener('click', goToNext);
				if (prev) prev.removeEventListener('click', goToPrev);
				if (play) {
					if (stop === 'hover') {
						slider.removeEventListener('mouseover', sliderHover);
						slider.removeEventListener('mouseout', sliderMouseOut);
					}
					if (stop === 'action') {
						document.removeEventListener('selectionchange', sliderSelectionChange);
						slider.removeEventListener('selectstart', sliderSelectStart);
						slider.removeEventListener('mouseup', sliderSelectEnd);
					}
				}
			}
		}
	}
	
	function update() {
		destroy();
		sliders = [];
		elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
			for (let e = 0; e < elements.length; e++) {
				const sliderObject = createSliderObject(elements[e]);
				if (sliderObject) {
					sliders.push(sliderObject);
				}
			};
		}
    };

	function destroy() {
		if (sliders) {
			for (let s = 0; s < sliders.length; s++) {
				sliders[s].destroy();
			}
		}
    };

	update();

    return {
        destroy: destroy,
        update: update
    }
}
