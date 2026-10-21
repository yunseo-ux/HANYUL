const pageMenuButton = document.querySelector('.menu-toggle');
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
