/*!
 * SpryJs Sliders Module
 */
type SpryJsSliderOptions = {
	selector: string;
	classActive: string;
};

export function loadSliders(userOptions?: SpryJsSliderOptions) {
	const defaults = {
		selector: ".slider",
		slides: ".slider-slides",
		next: ".slider-next",
		prev: ".slider-prev",
		pagination: ".slider-pagination",
	};

	const options = { ...defaults, ...userOptions };

	document.querySelectorAll(options.selector).forEach(slider => {
		if (slider.hasAttribute("data-loaded")) return;

		var play = parseInt((slider.getAttribute("data-play") || 0).toString());
		var loop = slider.hasAttribute("data-loop");
		var stop = slider.getAttribute("data-stop");
		var snap = slider.hasAttribute("data-snap");
		var slides = slider.querySelector(options.slides);
		var slideCount = slides ? slides.childElementCount : 0;
		var next = slider.querySelector(options.next);
		var prev = slider.querySelector(options.prev);
		var pagination = slider.querySelector(options.pagination);
		var slidesWidth = slides ? slides.scrollWidth : 0;
		var block = slides ? slides.innerHTML : "";
		var scrollTimer: Timer | null = null;
		var playTimer: Timer | null = null;
		var isSelecting = false;

		const isVisible = () => {
			const rect = slider.getBoundingClientRect();
			return (rect.bottom >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight));
		}

		if (!document.body.contains(slider)) {
			return;
		}

		if (!next && !prev && !loop && !stop && !play) {
			return;
		}

		const goTo = (to: number | string, instant?: boolean) => {
			if (slider.hasAttribute("data-sliding")) {
				return;
			}
			if (to === 'next' && slides) {
				to = slides.scrollLeft + (slider as HTMLElement).offsetWidth;
				if (snap) {
					to = slides.scrollLeft + (slider.querySelector(".slider-slides > :first-child") as HTMLElement).offsetWidth;
				}
				slides.scrollTo({ left: to, behavior: instant ? "instant" : "smooth" });
			} else if (to === 'prev' && slides) {
				to = slides.scrollLeft - (slider as HTMLElement).offsetWidth;
				if (snap) {
					to = slides.scrollLeft - (slider.querySelector(".slider-slides > :first-child") as HTMLElement).offsetWidth;
				}
				slides.scrollTo({ left: to, behavior: instant ? "instant" : "smooth" });
			} else if (slides) {
				slides.scrollTo({
					left: (slides.children[parseFloat(to.toString()) + (loop ? slideCount : 0)] as HTMLElement).offsetLeft,
					behavior: instant ? "instant" : "smooth",
				});
			}
		};
		const resetPlay = () => {
			if (playTimer) {
				 clearInterval(playTimer);
				 playTimer = null;
			}
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
		if (next) {
			next.addEventListener("click", () => {
				goTo("next");
			});
		}
		if (prev) {
			prev.addEventListener("click", () => {
				goTo("prev");
			});
		}
		if (pagination && !pagination.childNodes.length && slides && slideCount) {
			for (let index = 0; index < slideCount; index++) {
				let btn = document.createElement("button");
				if (index === 0) btn.classList.add("active");
				btn.onclick = () => {
					goTo(index);
					if (pagination && pagination.children) {
						Array.from(pagination.children).forEach((paginate) => {
							paginate.classList.remove("active");
						});
					}
					btn.classList.add("active");
				};
				pagination.append(btn);
			}
		}

		if (!slides) {
			return;
		}

		slides.addEventListener("scroll", () => {
			slider.setAttribute("data-sliding", "");
			slider.removeAttribute("data-position");
			if (scrollTimer) clearTimeout(scrollTimer);
			if (playTimer) {
				clearInterval(playTimer);
				playTimer = null;
			}
			scrollTimer = setTimeout(function () {
				slider.removeAttribute("data-sliding");
				resetPlay();
				if (loop && slides) {
					var blockWidth = slides.scrollWidth / 3;
					if (slides.scrollLeft < blockWidth) {
						var offset = blockWidth - slides.scrollLeft;
						slides.scrollTo({
							left: blockWidth * 2 - offset,
							behavior: "instant",
						});
					}
					if (slides.scrollLeft >= blockWidth * 2) {
						var offset = slides.scrollLeft - blockWidth * 2;
						slides.scrollTo({ left: blockWidth + offset, behavior: "instant" });
					}
				} else if (slides) {
					if (!slides.scrollLeft) {
						slider.setAttribute("data-position", "start");
					} else if (slides.scrollLeft + (slider as HTMLElement).offsetWidth >= slides.scrollWidth - 2) {
						slider.setAttribute("data-position", "end");
					}
				}
				slider.querySelectorAll(".slider-slides > *").forEach(element => {
					element.removeAttribute("data-first");
					element.removeAttribute("data-last");
					var left = Math.round(element.getBoundingClientRect().left - slider.getBoundingClientRect().left);
					element.toggleAttribute("data-showing", left >= 0 && left < slider.clientWidth);
				});
				var showing = slider.querySelectorAll("[data-showing]");
				if (showing.length) {
					if (pagination && slides) {
						pagination.querySelectorAll(".active").forEach(active => {
							active.classList.remove("active");
						});
						var childIndex = Array.from(slides.children).indexOf(showing[0]);
						if (loop) {
							childIndex =
								childIndex === slideCount * 2 ? 0 : childIndex - slideCount;
						}
						if (childIndex !== undefined) {
							pagination.children[childIndex].classList.add("active");
						}
					}
					showing[0].setAttribute("data-first", "");
					showing[showing.length - 1].setAttribute("data-last", "");
					var preLoadImages = function (elem: HTMLImageElement | null, type: string, total: number) {
						var i = 0;
						var imageSrcs = [];
						if (!elem) return;
						while ((elem = type === "next" ? (elem.nextSibling as HTMLImageElement) : (elem.previousSibling as HTMLImageElement))) {
							if (i >= total || !elem.nodeType || elem.nodeType === 3) continue; // text node
							var loading = elem.getAttribute("loading");
							if (elem.tagName === "IMG" && loading && loading.toLowerCase() === "lazy") {
								imageSrcs.push(elem.src);
							} else {
								elem.querySelectorAll('img[loading="lazy"]').forEach((img) => {
									imageSrcs.push((img as HTMLImageElement).src);
								});
							}
							i++;
						}
						imageSrcs.forEach((imageSrc) => {
							var newImg = new Image();
							newImg.src = imageSrc;
						});
					};
					preLoadImages(slider.querySelector("[data-last]"), "next", showing.length);
					preLoadImages(slider.querySelector("[data-last]"), "prev", showing.length);
				}
			}, 100);
		});
		if (loop) {
			slides.innerHTML += block + block;
			slides.scrollTo({ left: slidesWidth, behavior: "instant" });
		} else {
			slides.dispatchEvent(new CustomEvent("scroll"));
			slider.setAttribute("data-position", "start");
		}
		resetPlay();
		if (play) {
			if (stop === "hover") {
				slider.addEventListener("mouseout", () => {
					resetPlay();
				});
				slider.addEventListener("mouseover", () => {
					if (playTimer) {
						clearInterval(playTimer);
						playTimer = null;
					}
				});
			}
			if (stop === "action") {
				document.addEventListener("selectionchange", () => {
					var selection: Selection | null | string = document.getSelection();
					if (selection) {
						selection = selection.toString();
					}
					if (isSelecting && selection) {
						if (playTimer) {
							clearInterval(playTimer);
							playTimer = null;
						}
					}
					if (!isSelecting && !selection && !playTimer) {
						resetPlay();
					}
				});
				slider.addEventListener("selectstart", () => {
					isSelecting = true;
				});
				slider.addEventListener("mouseup", () => {
					isSelecting = false;
				});
			}
		}
		slider.setAttribute("data-loaded", "");
	});
}
