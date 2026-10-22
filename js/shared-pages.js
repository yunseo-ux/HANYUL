const pageMenuButton = document.querySelector('.menu-toggle');
const brandStoryTitle = document.querySelector('#brand-story-title');
if (brandStoryTitle) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollReleaseTimer;
  let waitingForScroll = false;
  const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'];
  const releaseBrandIntro = () => {
    clearTimeout(scrollReleaseTimer);
    waitingForScroll = false;
    document.documentElement.classList.remove('brand-intro-playing');
    window.removeEventListener('wheel', consumeIntroWheel);
    window.removeEventListener('touchmove', consumeIntroTouch);
    window.removeEventListener('touchend', finishIntroTouch);
    window.removeEventListener('keydown', consumeIntroKey);
    window.removeEventListener('keyup', finishIntroKey);
  };
  const consumeIntroWheel = event => {
    if (event.ctrlKey) return;
    event.preventDefault();
    clearTimeout(scrollReleaseTimer);
    scrollReleaseTimer = setTimeout(releaseBrandIntro, 220);
  };
  const consumeIntroTouch = event => {
    event.preventDefault();
    waitingForScroll = true;
  };
  const finishIntroTouch = () => {
    if (waitingForScroll) releaseBrandIntro();
  };
  const consumeIntroKey = event => {
    if (!scrollKeys.includes(event.key) || event.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
    event.preventDefault();
    waitingForScroll = true;
  };
  const finishIntroKey = event => {
    if (waitingForScroll && scrollKeys.includes(event.key)) releaseBrandIntro();
  };
  const waitForExtraScroll = () => {
    if (reducedMotion.matches) return releaseBrandIntro();
    window.addEventListener('wheel', consumeIntroWheel, { passive: false });
    window.addEventListener('touchmove', consumeIntroTouch, { passive: false });
    window.addEventListener('touchend', finishIntroTouch);
    window.addEventListener('keydown', consumeIntroKey);
    window.addEventListener('keyup', finishIntroKey);
  };
  if (!reducedMotion.matches) document.documentElement.classList.add('brand-intro-playing');
  window.addEventListener('pagehide', releaseBrandIntro, { once: true });
  brandStoryTitle.style.setProperty('--ink-color', getComputedStyle(brandStoryTitle).color);
  brandStoryTitle.setAttribute('aria-label', brandStoryTitle.innerText.replace(/\s*\n\s*/g, ' '));
  const walker = document.createTreeWalker(brandStoryTitle, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  const characters = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    Array.from(node.textContent).forEach(character => {
      const span = document.createElement('span');
      span.className = 'intro-ink-char';
      span.textContent = character;
      span.setAttribute('aria-hidden', 'true');
      fragment.append(span);
      if (character.trim()) characters.push(span);
    });
    node.replaceWith(fragment);
  });
  const updateBrandTitle = progress => {
    characters.forEach((character, index) => {
      const fill = Math.min(Math.max(progress * characters.length - index, 0), 1);
      character.style.setProperty('--ink-fill', `${fill * 100}%`);
    });
  };
  let animationFrame;
  let startTime;
  const animateBrandTitle = time => {
    if (startTime === undefined) startTime = time;
    const progress = reducedMotion.matches ? 1 : Math.min(Math.max((time - startTime) / 500, 0), 1);
    updateBrandTitle(progress);
    if (progress < 1) animationFrame = requestAnimationFrame(animateBrandTitle);
    else waitForExtraScroll();
  };
  updateBrandTitle(reducedMotion.matches ? 1 : 0);
  Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1500))]).then(() => {
    animationFrame = requestAnimationFrame(animateBrandTitle);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(animationFrame);
      updateBrandTitle(1);
      releaseBrandIntro();
    }
  });
}
if (pageMenuButton) {
  pageMenuButton.addEventListener('click', () => {
    const open = pageMenuButton.getAttribute('aria-expanded') !== 'true';
    pageMenuButton.setAttribute('aria-expanded', String(open));
    pageMenuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.querySelector('.primary-nav').classList.toggle('is-open', open);
  });
}

const orderDialog = document.querySelector('.order-dialog');
document.querySelectorAll('.order-detail').forEach((button) => {
  button.addEventListener('click', () => {
    const cells = [...button.closest('tr').cells].slice(0, 5);
    const labels = ['주문번호', '상품 정보', '주문 금액', '주문 상태', '주문 일자'];
    const content = document.querySelector('#order-dialog-content');
    content.replaceChildren(...cells.map((cell, index) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = labels[index];
      detail.textContent = cell.textContent;
      row.append(term, detail);
      return row;
    }));
    orderDialog.showModal();
  });
});

document.querySelectorAll('.favorite-button').forEach((button) => {
  button.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(pressed));
    button.querySelector('img').src = pressed
      ? './assets/mypage/heart-filled.svg'
      : './assets/mypage/imgMdiLightHeart1.svg';
    const productName = button.closest('.recent-product').querySelector('h3').textContent;
    button.setAttribute('aria-label', `${productName} ${pressed ? '찜 취소' : '찜하기'}`);
  });
});

const recentTrack = document.querySelector('.recent-product-track');
if (recentTrack) {
  const previous = document.querySelector('.recent-prev');
  const next = document.querySelector('.recent-next');
  const updateRecentControls = () => {
    previous.disabled = recentTrack.scrollLeft <= 2;
    next.disabled = recentTrack.scrollLeft >= recentTrack.scrollWidth - recentTrack.clientWidth - 2;
  };
  const step = () => recentTrack.querySelector('.recent-product').getBoundingClientRect().width
    + Number.parseFloat(getComputedStyle(recentTrack).gap);
  const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  previous.addEventListener('click', () => recentTrack.scrollBy({ left: -step(), behavior: scrollBehavior() }));
  next.addEventListener('click', () => recentTrack.scrollBy({ left: step(), behavior: scrollBehavior() }));
  recentTrack.addEventListener('scroll', updateRecentControls, { passive: true });
  new ResizeObserver(updateRecentControls).observe(recentTrack);
  updateRecentControls();
}

const storyPillars = document.querySelector('.story-pillars');
if (storyPillars) {
  const scrollSection = document.createElement('div');
  scrollSection.className = 'story-pillars-scroll';
  storyPillars.before(scrollSection);
  scrollSection.append(storyPillars);
  const cards = [...storyPillars.querySelectorAll('.story-pillar')];
  const characterGroups = cards.map(card => {
    const characters = [];
    card.querySelectorAll('.pillar-heading h2').forEach(element => {
      element.style.setProperty('--ink-color', getComputedStyle(element).color);
      element.setAttribute('aria-label', element.innerText.replace(/\s*\n\s*/g, ' '));
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        Array.from(node.textContent).forEach(character => {
          const span = document.createElement('span');
          span.className = 'intro-ink-char';
          span.textContent = character;
          span.setAttribute('aria-hidden', 'true');
          fragment.append(span);
          if (character.trim()) characters.push(span);
        });
        node.replaceWith(fragment);
      });
    });
    return characters;
  });
  const desktop = window.matchMedia('(min-width: 761px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  const updatePillarInk = () => {
    const range = Math.max(scrollSection.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-scrollSection.getBoundingClientRect().top / range, 0), 1);
    characterGroups.forEach((characters, cardIndex) => {
      const cardProgress = reducedMotion.matches ? 1 : desktop.matches
        ? Math.min(Math.max((progress * 3 - cardIndex) / .9, 0), 1)
        : Math.min(Math.max((window.innerHeight * .8 - cards[cardIndex].getBoundingClientRect().top) / (window.innerHeight * .65), 0), 1);
      characters.forEach((character, index) => {
        const fill = Math.min(Math.max(cardProgress * characters.length - index, 0), 1);
        character.style.setProperty('--ink-fill', fill * 100 + '%');
      });
    });
    scheduled = false;
  };
  const requestPillarInk = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updatePillarInk);
  };
  window.addEventListener('scroll', requestPillarInk, { passive: true });
  window.addEventListener('resize', requestPillarInk);
  reducedMotion.addEventListener('change', requestPillarInk);
  document.fonts.ready.then(requestPillarInk);
  updatePillarInk();
}

const brandPhotoTrio = document.querySelector('.story-photo-trio');
if (brandPhotoTrio) {
  const photos = [...brandPhotoTrio.querySelectorAll('img')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 761px)');
  const scrollSection = document.createElement('div');
  scrollSection.className = 'story-photo-trio-scroll';
  brandPhotoTrio.before(scrollSection);
  scrollSection.append(brandPhotoTrio);
  let scheduled = false;
  const revealTrio = () => {
    const range = Math.max(scrollSection.offsetHeight - window.innerHeight, 1);
    const sectionTop = scrollSection.getBoundingClientRect().top;
    const progress = Math.min(Math.max(-sectionTop / range, 0), 1);
    const entryProgress = Math.min(Math.max((window.innerHeight - sectionTop) / window.innerHeight, 0), 1);
    photos.forEach((photo, index) => {
      const fill = reducedMotion.matches ? 1 : desktop.matches
        ? (index === 0 ? entryProgress : Math.min(Math.max((progress * 2.4 - (index - 1)) / .9, 0), 1))
        : Math.min(Math.max((window.innerHeight * .9 - photo.getBoundingClientRect().top) / (window.innerHeight * .6), 0), 1);
      photo.style.setProperty('--trio-reveal-bottom', (1 - fill) * 100 + '%');
    });
    scheduled = false;
  };
  const requestTrioReveal = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(revealTrio);
  };
  revealTrio();
  brandPhotoTrio.classList.add('trio-reveal-ready');
  window.addEventListener('scroll', requestTrioReveal, { passive: true });
  window.addEventListener('resize', requestTrioReveal);
  window.addEventListener('load', requestTrioReveal, { once: true });
  reducedMotion.addEventListener('change', requestTrioReveal);
}
