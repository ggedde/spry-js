//!
//! SpryJs Sliders Module

declare global {
    interface Element {
        spryJsSliderCount: number;
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

	let controller: AbortController | null = null;
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
		const slidesWidth = slides ? slides.scrollWidth : 0;
		const block = slides ? slides.innerHTML : "";

		let scrollTimer: Timer | null = null;
		let playTimer: Timer | null = null;
		let isPaused = false;

		if (!document.body.contains(slider) || !slides || (!next && !prev && !loop && !stop && !play)) return null;

		function isVisible(): boolean {
			if (!slider || !document.body.contains(slider)) return false;
			var rect = slider.getBoundingClientRect();
			return (rect.bottom >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight));
		}

		function goTo(to: number | string, instant?: boolean) {
			var offsetSlides = loop ? slider.spryJsSliderCount : 0;
			if (!slides) return;
			if (to === 'next') {
				slides.scrollBy((slider as HTMLElement).offsetWidth, 0);
			} else if (to === 'prev') {
				slides.scrollBy(-((slides as HTMLElement).offsetWidth), 0);
			} else {
				slides.scrollTo({ left: (slides.children[(parseFloat(to.toString()) + offsetSlides)] as HTMLElement).offsetLeft, behavior: instant ? 'instant' : 'smooth' });
			}
		}

		function playPause() {
			isPaused = true;
		}

		function playResume() {
			isPaused = false;
		}

		function playStop() {
			if (playTimer) {
				clearInterval(playTimer);
				playTimer = null;
				playPause();
			}
		}

		function playStart() {
			if (play && !isPaused && document.body.contains(slider)) {
				playTimer = setTimeout(() => {
					if (isVisible() && !isPaused) {
						goTo('next');
					}
					resetPlay();
				}, play);
			}
		}

		function resetPlay() {
			playStop();
			playResume();
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
							childIndex = (childIndex === slider.spryJsSliderCount * 2) ? 0 : (childIndex - slider.spryJsSliderCount);
						}
						if (childIndex !== undefined && pagination.children[childIndex]) {
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
            if (controller) {
				if (slides) slides.addEventListener('scroll', sliderScroll, {signal: controller.signal});
				if (next) next.addEventListener('click', goToNext, {signal: controller.signal});
				if (prev) prev.addEventListener('click', goToPrev, {signal: controller.signal});
				if (play) {
					if (stop === 'hover') {
						slider.addEventListener('mouseover', sliderHover, {signal: controller.signal});
						slider.addEventListener('mouseout', sliderMouseOut, {signal: controller.signal});
					}
					if (stop === 'action') {
						document.addEventListener('selectionchange', sliderSelectionChange, {signal: controller.signal});
						slider.addEventListener('selectstart', sliderSelectStart, {signal: controller.signal});
						slider.addEventListener('mouseup', sliderSelectEnd, {signal: controller.signal});
						const buttons = slider.querySelectorAll('a, button');
						if (buttons) {
							for (let b = 0; b < buttons.length; b++) {
								buttons[b].addEventListener('mouseover', sliderHover, {signal: controller.signal});
								buttons[b].addEventListener('mouseout', sliderMouseOut, {signal: controller.signal});
							};
						}
					}
				}
				if (slides && slider.spryJsSliderCount && pagination && pagination.childNodes.length) {
					for (let index = 0; index < pagination.childNodes.length; index++) {
						pagination.childNodes[index].addEventListener('click', () => {
							goTo(index);
							Array.from(pagination.children).forEach(paginate => {
								paginate.classList.remove('active');
							});
							(pagination.childNodes[index] as HTMLElement).classList.add('active');
						}, {signal: controller.signal});
					}
				}
			}
		}

		if (!slider.spryJsSliderCount) {
			if (!slider.spryJsSliderCount) slider.spryJsSliderCount = slides ? slides.childElementCount : 0;
			if (pagination && !pagination.childNodes.length && slides && slider.spryJsSliderCount) {
				for (let index = 0; index < slider.spryJsSliderCount; index++) {
					let btn = document.createElement("button");
					if (index === 0) btn.classList.add('active');
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
		}

		resetPlay();
		sliderAddEvents();

		return {
			destroy: function() {
				playStop();
			}
		}
	}
	
	function update() {
		destroy();

		if (!controller) {
			controller = new AbortController();
		}
		
		const elements = typeof items === 'object' ? items : document.querySelectorAll(items);
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
		if (controller) {
            controller.abort();
            controller = null;
        }
		if (sliders) {
			for (let s = 0; s < sliders.length; s++) {
				sliders[s].destroy();
			}
		}
		sliders = [];
    };

	update();

    return {
        destroy: destroy,
        update: update
    }
}
