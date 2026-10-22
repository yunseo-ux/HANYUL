const shopGrid = document.querySelector('#shop-grid');
const categoryButtons = [...document.querySelectorAll('[data-category]')];
let category = 'best';

const resizeCards = () => {
  shopGrid.querySelectorAll('.shop-item').forEach((item) => {
    item.style.setProperty('--card-scale', item.clientWidth / 326);
    item.querySelector('.shop-artwork').style.height = `${item.clientWidth * 390 / 326}px`;
  });
};

const renderProducts = () => {
  let products = [...shopProducts];
  if (category === 'sale') products = products.filter((product) => product.discount > 0);
  // The design supplies no release dates; preserve its order for new introductions.
  shopGrid.replaceChildren(...products.map((product) => {
    const article = document.createElement('article');
    article.className = 'shop-item';
    article.setAttribute('aria-label', product.name);
    article.innerHTML = product.html;
    const canvas = article.querySelector('.shop-card-canvas');
    const imageViewport = document.createElement('div');
    imageViewport.className = 'shop-image-viewport';
    const imageContent = document.createElement('div');
    imageContent.className = 'shop-image-content';
    [...canvas.children].filter((layer) => layer.querySelector('img')).forEach((layer) => {
      imageContent.appendChild(layer);
    });
    imageViewport.appendChild(imageContent);
    canvas.appendChild(imageViewport);
    const originalPrice = canvas.querySelector('[style*="line-through"]').textContent.trim();
    [...canvas.children].filter((layer) => layer !== imageViewport).forEach((layer) => layer.remove());
    canvas.style.height = '390px';
    const artwork = document.createElement('div');
    artwork.className = 'shop-artwork';
    artwork.appendChild(canvas);
    const info = document.createElement('div');
    info.className = 'shop-product-info';
    const title = document.createElement('h2');
    title.textContent = product.name;
    const prices = document.createElement('p');
    prices.className = 'shop-product-prices';
    const discount = document.createElement('span');
    discount.textContent = `${product.discount}%`;
    const price = document.createElement('strong');
    price.textContent = `${product.price.toLocaleString('ko-KR')}원`;
    const original = document.createElement('del');
    original.textContent = originalPrice;
    prices.append(discount, price, original);
    info.append(title, prices);
    article.append(artwork, info);
    return article;
  }));
  document.querySelector('#shop-count').textContent = `${products.length}개의 상품`;
  document.querySelector('#shop-empty').hidden = products.length > 0;
  resizeCards();
};

categoryButtons.forEach((button) => button.addEventListener('click', () => {
  category = button.dataset.category;
  categoryButtons.forEach((tab) => {
    if (tab === button) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  renderProducts();
}));
new ResizeObserver(resizeCards).observe(shopGrid);
renderProducts();

const shopMenu = document.querySelector('.menu-toggle');
shopMenu.addEventListener('click', () => {
  const open = shopMenu.getAttribute('aria-expanded') !== 'true';
  shopMenu.setAttribute('aria-expanded', String(open));
  shopMenu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  document.querySelector('.primary-nav').classList.toggle('is-open', open);
});
