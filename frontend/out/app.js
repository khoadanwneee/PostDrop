const app = document.querySelector('#app');
const toastRegion = document.querySelector('#toast-region');
const modalRoot = document.querySelector('#modal-root');

const icons = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  seal: '<circle cx="12" cy="8" r="5"/><path d="m8.8 12.3-.8 8.2 4-2 4 2-.8-8.2"/>',
  archive: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
  truck: '<path d="M10 17h4V5H2v12h3m9-7h4l4 4v3h-3M7.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m13-7-4-4-4 4m4-4v12"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="m9 12 2 2 4-4"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4m-5 4h18"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h5"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 1 9.2A7 7 0 0 1 11 20Z"/><path d="M19 2c-2.26 4.33-5.27 7.14-8 10"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 8 0 4 4 0 0 0-4-4Z"/><path d="M12 14a4 4 0 0 0-4 4 4 4 0 0 0 8 0 4 4 0 0 0-4-4Z"/><path d="M4 12a4 4 0 0 0 4 4 4 4 0 0 0 0-8 4 4 0 0 0-4 4Z"/><path d="M14 12a4 4 0 0 0 4 4 4 4 0 0 0 0-8 4 4 0 0 0-4 4Z"/>',
};

const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDate = (value) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
const futureDate = () => { const date = new Date(); date.setFullYear(date.getFullYear() + 1); return date.toISOString().slice(0, 10); };

const defaultDraft = {
  letterType: 'online', title: '', content: '', paper: 'ivory', font: 'serif',
  envelope: 'burgundy', recipientMode: 'self', recipientName: '', recipientEmail: '',
  recipientPhone: '', address: '', deliveryDate: futureDate(), deliveryMethod: 'hybrid', note: '',
  decorations: [],
};
const paperOptions = [
  ['ivory', 'paper-ivory', 'Ngà cổ điển'],
  ['rose', 'paper-rose', 'Hồng phấn'],
  ['warm', 'paper-warm', 'Kem ấm'],
  ['sage', 'paper-sage', 'Xanh xô thơm'],
  ['lavender', 'paper-lavender', 'Tím oải hương'],
  ['sky', 'paper-sky', 'Xanh sương'],
  ['parchment', 'paper-parchment', 'Giấy cổ điển'],
  ['linen', 'paper-linen', 'Vải lanh'],
];
const envelopeOptions = [
  ['burgundy', 'envelope-burgundy', 'Đỏ Burgundy'],
  ['olive', 'envelope-olive', 'Xanh Olive'],
  ['terracotta', 'envelope-terracotta', 'Cam đất'],
  ['navy', 'envelope-navy', 'Xanh Navy'],
  ['forest', 'envelope-forest', 'Xanh rừng'],
  ['plum', 'envelope-plum', 'Tím mận'],
  ['dusty-blue', 'envelope-dusty-blue', 'Xanh khói'],
  ['sand', 'envelope-sand', 'Nâu cát'],
  ['charcoal', 'envelope-charcoal', 'Than chì'],
];
let draft = { ...defaultDraft, ...JSON.parse(localStorage.getItem('postdrop-draft') || '{}') };
let currentLetter = null;
let saveTimer;

function persistDraft() {
  const state = document.querySelector('.save-state');
  if (state) { state.textContent = 'Đang lưu…'; state.classList.add('saving'); }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('postdrop-draft', JSON.stringify(draft));
    if (state) { state.textContent = 'Đã lưu bản nháp'; state.classList.remove('saving'); }
  }, 500);
}

function toast(message, type = '') {
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  toastRegion.appendChild(element);
  setTimeout(() => element.remove(), 3500);
}

function openModal({ title, message, confirm = 'Xác nhận', onConfirm }) {
  modalRoot.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal"><h2 id="modal-title">${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><div class="modal-actions"><button class="button button-ghost" data-modal-close>Quay lại</button><button class="button button-primary" data-modal-confirm>${escapeHtml(confirm)}</button></div></div></div>`;
  modalRoot.querySelector('[data-modal-close]').onclick = () => { modalRoot.innerHTML = ''; };
  modalRoot.querySelector('[data-modal-confirm]').onclick = () => { modalRoot.innerHTML = ''; onConfirm?.(); };
}

function brand() { return `<a class="brand" href="#/" aria-label="PostDrop — Trang chủ"><span class="brand-mark"></span><span>PostDrop</span></a>`; }
function button(label, route, kind = 'primary', iconName = '') { return `<a class="button button-${kind}" href="#${route}">${label}${iconName ? icon(iconName) : ''}</a>`; }

function siteHeader() {
  return `<header class="site-header"><div class="container nav">${brand()}<nav class="nav-links" aria-label="Điều hướng chính"><a href="#/" data-scroll="how">Cách hoạt động</a><a href="#/" data-scroll="services">Mẫu thư</a><a href="#/" data-scroll="pricing">Bảng giá</a><a href="#/" data-scroll="trust">Dành cho tổ chức</a></nav><div class="nav-actions"><a class="text-button" href="#/login">Đăng nhập</a>${button('Viết thư ngay', '/create/1')}<button class="menu-toggle" aria-label="Mở menu">${icon('menu')}</button></div></div></header>`;
}

function appHeader() {
  return `<header class="app-header"><div class="container app-header-inner">${brand()}<div class="app-header-actions"><a class="button button-primary" href="#/create/1">${icon('plus')}Tạo lá thư mới</a><button class="icon-button" aria-label="Thông báo">${icon('bell')}</button><a class="avatar" href="#/dashboard" aria-label="Tài khoản Minh Anh">MA</a></div></div></header>`;
}

function journeyStep(iconName, title, text) { return `<div class="journey-step"><div class="step-icon">${icon(iconName)}</div><h3>${title}</h3><p>${text}</p></div>`; }
function trustItem(iconName, title, text) { return `<article class="trust-item">${icon(iconName)}<h3>${title}</h3><p>${text}</p></article>`; }

function paperPlane(className) {
  return `<svg class="paper-plane ${className}" viewBox="0 0 180 140" aria-hidden="true"><path class="paper-plane-body" d="M10 72 168 14 116 126 78 88Z"/><path class="paper-plane-wing" d="M10 72 78 88 168 14 92 78Z"/><path class="paper-plane-fold" d="M78 88 116 126 92 78 168 14"/></svg>`;
}

function landingPlane() {
  return `<div class="landing-plane-corner" aria-hidden="true"><svg class="landing-plane-trail" viewBox="0 0 190 115"><path d="M8 101C50 99 46 56 84 61C117 66 116 26 160 30"/></svg>${paperPlane('landing-paper-plane')}</div>`;
}

function heroFlorals() {
  return `<svg class="floral-defs" aria-hidden="true"><defs><symbol id="postdrop-floral-spray" viewBox="0 0 360 440"><path class="floral-stem" d="M34 431C88 349 114 276 137 190C154 128 207 67 319 20"/><path class="floral-stem floral-stem-soft" d="M82 385C129 327 177 309 252 310M117 266C180 245 232 209 274 151M150 160C139 118 151 83 180 51"/><g class="floral-leaves"><ellipse cx="84" cy="349" rx="13" ry="31" transform="rotate(-53 84 349)"/><ellipse cx="118" cy="292" rx="12" ry="29" transform="rotate(45 118 292)"/><ellipse cx="139" cy="235" rx="11" ry="27" transform="rotate(-48 139 235)"/><ellipse cx="165" cy="171" rx="11" ry="27" transform="rotate(45 165 171)"/><ellipse cx="206" cy="103" rx="10" ry="25" transform="rotate(-41 206 103)"/><ellipse cx="259" cy="61" rx="10" ry="24" transform="rotate(55 259 61)"/><ellipse cx="179" cy="317" rx="11" ry="26" transform="rotate(-75 179 317)"/><ellipse cx="231" cy="309" rx="10" ry="24" transform="rotate(70 231 309)"/><ellipse cx="229" cy="213" rx="10" ry="25" transform="rotate(-65 229 213)"/><ellipse cx="264" cy="164" rx="9" ry="23" transform="rotate(54 264 164)"/></g><g class="floral-flower floral-flower-blush" transform="translate(285 112)"><ellipse cy="-17" rx="10" ry="20"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(72)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(144)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(216)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(288)"/><circle class="floral-center" r="7"/></g><g class="floral-flower floral-flower-cream" transform="translate(257 303) scale(.82)"><ellipse cy="-17" rx="10" ry="20"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(72)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(144)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(216)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(288)"/><circle class="floral-center" r="7"/></g><g class="floral-flower floral-flower-terracotta" transform="translate(185 48) scale(.62)"><ellipse cy="-17" rx="10" ry="20"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(72)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(144)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(216)"/><ellipse cy="-17" rx="10" ry="20" transform="rotate(288)"/><circle class="floral-center" r="7"/></g><circle class="floral-berry" cx="153" cy="134" r="7"/><circle class="floral-berry" cx="170" cy="124" r="5"/><circle class="floral-berry" cx="168" cy="143" r="4"/></symbol></defs></svg><svg class="floral-spray floral-bottom-left" viewBox="0 0 360 440" aria-hidden="true"><use href="#postdrop-floral-spray"/><g class="floral-bottom-bloom" transform="translate(70 345) scale(.9)"><ellipse cy="-24" rx="14" ry="28"/><ellipse cy="-24" rx="14" ry="28" transform="rotate(60)"/><ellipse cy="-24" rx="14" ry="28" transform="rotate(120)"/><ellipse cy="-24" rx="14" ry="28" transform="rotate(180)"/><ellipse cy="-24" rx="14" ry="28" transform="rotate(240)"/><ellipse cy="-24" rx="14" ry="28" transform="rotate(300)"/><circle r="10"/></g></svg>`;
}

function renderLanding() {
  app.innerHTML = `<div class="page-shell">${siteHeader()}<main id="main-content">
    <section class="hero hero-invitation"><div class="invitation-frame" aria-hidden="true"><span class="frame-corner frame-corner-tl"></span><span class="frame-corner frame-corner-tr"></span><span class="frame-corner frame-corner-bl"></span><span class="frame-corner frame-corner-br"></span></div>${heroFlorals()}${landingPlane()}<div class="hero-content"><div class="invitation-monogram" aria-hidden="true"><span>P</span></div><span class="eyebrow">POSTDROP · THƯ GỬI ĐẾN TƯƠNG LAI</span><h1 class="hero-handwritten"><span>Một lá thư từ chính bạn</span><span>của những năm trước.</span></h1><div class="hero-floral-divider" aria-hidden="true"><span></span><i></i><span></span></div><p>Viết hôm nay, PostDrop sẽ lưu giữ và gửi lá thư đến đúng ngày bạn lựa chọn.</p><div class="hero-actions">${button('Viết thư cho tương lai', '/create/1', 'primary', 'arrowRight')}${button('Gửi thư viết tay', '/create/1?type=handwritten', 'secondary')}</div></div></section>
    <section class="letter-section" id="how"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 01</span><h2>Cách PostDrop hoạt động</h2><p>Một nghi thức nhỏ hôm nay, một cuộc gặp gỡ đặc biệt trong tương lai.</p></div><div class="journey">${journeyStep('pen','Viết thư','Dành vài phút để viết điều bạn muốn nhớ.')}${journeyStep('seal','Niêm phong','Xác nhận nội dung và chọn ngày gặp lại.')}${journeyStep('archive','Lưu giữ','Chúng tôi bảo quản an toàn suốt hành trình.')}${journeyStep('truck','Giao đúng hẹn','Lá thư đến tay vào đúng ngày đã chọn.')}</div></div></section>
    <section class="letter-section" id="services"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 02</span><h2>Chọn cách bạn muốn gửi</h2><p>Dù là những dòng chữ trên màn hình hay nét mực trên giấy, cảm xúc vẫn được giữ nguyên vẹn.</p></div><div class="service-grid"><a href="#/create/1" class="service-card"><div class="service-art"><div class="paper-stack"></div></div><span class="eyebrow">TRỰC TUYẾN</span><h3>Viết thư trực tuyến</h3><p>Soạn thư trong không gian yên tĩnh, chọn giấy và phong bì, chúng tôi sẽ làm phần còn lại.</p><div class="service-meta"><span>5–10 phút</span><span>Từ 29.000đ</span></div></a><a href="#/create/1?type=handwritten" class="service-card"><div class="service-art"><div class="mailbox"></div></div><span class="eyebrow">VIẾT TAY</span><h3>Gửi thư viết tay</h3><p>Gửi lá thư thật đến PostDrop. Chúng tôi số hóa, bảo quản và giao lại đúng hẹn.</p><div class="service-meta"><span>3–5 ngày gửi đến</span><span>Từ 119.000đ</span></div></a></div></div></section>
    <section class="letter-section"><div class="container"><div class="section-head"><span class="chapter">NHỮNG DỊP ĐỂ NHỚ</span><h2>Đánh dấu điều quan trọng</h2></div><div class="occasion-row"><span class="occasion">Sinh nhật</span><span class="occasion">Tốt nghiệp</span><span class="occasion">Kỷ niệm</span><span class="occasion">Năm mới</span><span class="occasion">Cột mốc sự nghiệp</span></div></div></section>
    <section class="letter-section" id="trust"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 03</span><h2>Một lời hứa được gìn giữ</h2><p>Niềm tin của bạn được bảo vệ bằng những lớp an toàn rõ ràng, từ hôm nay đến ngày giao.</p></div><div class="trust-grid">${trustItem('database','Số hóa dự phòng','Bản sao được mã hóa và lưu tách biệt để phòng sự cố.')}${trustItem('shield','Bảo quản an toàn','Thư vật lý được lưu tại môi trường kiểm soát độ ẩm.')}${trustItem('map','Xác minh địa chỉ','Chúng tôi nhắc bạn xác nhận địa chỉ trước ngày giao 30 ngày.')}${trustItem('truck','Theo dõi hành trình','Mọi cột mốc quan trọng đều được cập nhật rõ ràng.')}</div></div></section>
    <section class="letter-section" id="pricing"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 04</span><h2>Một mức giá cho mỗi cách gửi</h2><p>Thanh toán một lần. Không có phí ẩn trong suốt thời gian lưu giữ.</p></div><div class="pricing-grid">${priceCard('Email','29.000đ',['Gửi qua email đúng hẹn','Lưu giữ đến 5 năm','1 lần nhắc xác nhận'])}${priceCard('Physical','119.000đ',['In trên giấy cao cấp','Phong bì và niêm phong','Theo dõi giao hàng'])}${priceCard('Hybrid','149.000đ',['Bao gồm Email + Physical','Bản số hóa dự phòng','Ưu tiên hỗ trợ'],true)}</div></div></section>
    <section class="letter-section"><div class="container"><div class="quote-card"><blockquote>“Tôi đã quên mình từng lo lắng nhiều đến thế. Lá thư ấy giống như một cái ôm đến muộn, nhưng đúng lúc.”</blockquote><cite>Hà My · Nhận thư sau 3 năm</cite></div></div></section>
    <section class="letter-section"><div class="container"><div class="section-head"><span class="chapter">NHỮNG ĐIỀU BẠN CÓ THỂ HỎI</span><h2>Câu hỏi thường gặp</h2></div><div class="faq-list">${faq('Nội dung lá thư có được bảo mật không?','Có. Nội dung được mã hóa khi lưu trữ. Sau khi niêm phong, ngay cả bạn cũng không thể mở lại trước ngày đã chọn.')}${faq('Tôi có thể đổi địa chỉ nhận thư không?','Có. PostDrop sẽ chủ động nhắc bạn xác nhận hoặc cập nhật địa chỉ trước ngày giao 30 ngày.')}${faq('Nếu tôi đổi email hoặc số điện thoại thì sao?','Bạn có thể cập nhật thông tin liên hệ bất kỳ lúc nào trong trang chi tiết lá thư.')}${faq('Tôi có thể hủy sau khi niêm phong không?','Bạn có thể liên hệ hỗ trợ để hủy lịch giao. Nội dung đã niêm phong vẫn không thể chỉnh sửa.')}</div></div></section>
    <section class="final-cta"><span class="eyebrow">PHẦN KẾT</span><h2>Bạn muốn gửi điều gì cho mình trong tương lai?</h2><p>Có những điều chỉ thời gian mới giúp chúng ta hiểu được.</p>${button('Viết lá thư của tôi', '/create/1', 'primary', 'arrowRight')}<div class="final-seal" aria-hidden="true">P</div></section>
  </main>${footer()}</div>`;
  bindLanding();
}

function priceCard(name, price, features, featured = false) { return `<article class="price-card ${featured ? 'featured' : ''}">${featured ? '<span class="mini-stamp">ĐƯỢC YÊU THÍCH</span>' : ''}<span class="eyebrow">GÓI ${name.toUpperCase()}</span><div class="price">${price} <small>/ lá thư</small></div><ul class="feature-list">${features.map((item) => `<li>${item}</li>`).join('')}</ul>${button(`Chọn gói ${name}`, '/create/1', featured ? 'primary' : 'secondary')}</article>`; }
function faq(question, answer) { return `<div class="faq-item"><button class="faq-question" aria-expanded="false">${question}<span>+</span></button><p class="faq-answer">${answer}</p></div>`; }
function footer() { return `<footer class="footer"><div class="container"><div class="footer-grid"><div>${brand()}<p style="margin-top:16px;max-width:270px">Gửi một phần của hôm nay đến đúng người, vào đúng ngày trong tương lai.</p></div><div><h4>SẢN PHẨM</h4><div class="footer-links"><a href="#/" data-scroll="how">Cách hoạt động</a><a href="#/" data-scroll="services">Loại thư</a><a href="#/" data-scroll="pricing">Bảng giá</a></div></div><div><h4>HỖ TRỢ</h4><div class="footer-links"><a href="#/">Câu hỏi thường gặp</a><a href="#/">Liên hệ</a><a href="#/">Theo dõi thư</a></div></div><div><h4>PHÁP LÝ</h4><div class="footer-links"><a href="#/">Quyền riêng tư</a><a href="#/">Điều khoản</a><a href="#/">Bảo mật</a></div></div></div><div class="copyright">© 2026 PostDrop. Mọi quyền được bảo lưu.<span>Được tạo ra để những điều quan trọng không bị lãng quên.</span></div></div></footer>`; }

function bindLanding() {
  document.querySelectorAll('.faq-question').forEach((item) => item.addEventListener('click', () => {
    const parent = item.closest('.faq-item'); parent.classList.toggle('open'); item.setAttribute('aria-expanded', parent.classList.contains('open'));
  }));
  document.querySelector('.menu-toggle')?.addEventListener('click', () => toast('Menu di động: dùng các mục ở cuối trang để khám phá.'));
  document.querySelectorAll('[data-scroll]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelector(`#${link.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

const steps = ['Loại thư', 'Nội dung', 'Thiết kế', 'Giao thư', 'Xác nhận'];
function stepper(step) { return `<div class="stepper" aria-label="Tiến trình tạo thư">${steps.map((name, i) => `<div class="stepper-item ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}"><span class="stepper-dot">${i + 1 < step ? '✓' : i + 1}</span><span>${name}</span></div>`).join('')}</div>`; }

function renderBuilder(step = 1) {
  if (location.hash.includes('type=handwritten')) draft.letterType = 'handwritten';
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="container builder-wrap"><div class="builder-head"><div><span class="eyebrow">BƯỚC ${step} / 5 — ${steps[step - 1].toUpperCase()}</span><h1>${stepTitle(step)}</h1><p>${stepDescription(step)}</p></div><span class="save-state">Đã lưu bản nháp</span></div>${stepper(step)}<div id="builder-content">${renderStep(step)}</div></main></div>`;
  bindBuilder(step);
}

function stepTitle(step) { return ['Bạn muốn gửi lá thư theo cách nào?','Viết điều bạn muốn gặp lại','Tạo dáng vẻ cho lá thư','Lá thư sẽ tìm đến ai?','Kiểm tra trước khi niêm phong'][step - 1]; }
function stepDescription(step) { return ['Chọn một cách phù hợp. Bạn vẫn có thể thay đổi ở bước sau.','Hãy viết tự nhiên. Bản nháp được tự động lưu trên thiết bị này.','Chỉ vài lựa chọn vừa đủ để lá thư mang dấu ấn của bạn.','Thông tin này giúp PostDrop giao lá thư đúng người, đúng ngày.','Sau khi niêm phong, nội dung sẽ không thể chỉnh sửa.'][step - 1]; }

function renderSwatches(group, options) {
  return options.map(([value, colorClass, label]) => swatch(group, value, colorClass, label)).join('');
}

function renderDesignStep() {
  return `<div class="workspace"><section class="panel design-panel">
    <h2>Thiết kế lá thư</h2>
    <p class="panel-intro">Chọn chất giấy và màu phong bì phù hợp với câu chuyện bạn muốn gửi.</p>
    <div class="field"><label>Mẫu giấy · 8 lựa chọn</label><div class="swatches design-swatches">${renderSwatches('paper', paperOptions)}</div></div>
    <div class="field"><label>Kiểu chữ trong thư</label><div class="segmented">${segment('font','serif','Editorial')}${segment('font','modern','Hiện đại')}${segment('font','hand','Viết tay')}</div></div>
    <div class="field"><label>Màu phong bì · 9 lựa chọn</label><div class="swatches design-swatches">${renderSwatches('envelope', envelopeOptions)}</div></div>
    <div class="field">
      <label>Trang trí lá thư (Kéo thả hoặc click chọn)</label>
      <div class="decorations-library">
        <button type="button" class="sticker-item" draggable="true" data-type="flower" title="Kéo hoặc click để đặt hoa khô"><img src="/sticker_flower.png" alt="Hoa khô" class="sticker-img" /></button>
        <button type="button" class="sticker-item" draggable="true" data-type="leaf" title="Kéo hoặc click để đặt lá xanh"><img src="/sticker_leaf.png" alt="Lá xanh" class="sticker-img" /></button>
        <button type="button" class="sticker-item" draggable="true" data-type="heart" title="Kéo hoặc click để đặt dấu tim"><img src="/sticker_heart.png" alt="Dấu tim" class="sticker-img" /></button>
        <button type="button" class="sticker-item" draggable="true" data-type="star" title="Kéo hoặc click để đặt ngôi sao"><img src="/sticker_star.png" alt="Ngôi sao" class="sticker-img" /></button>
        <button type="button" class="sticker-item" draggable="true" data-type="postmark" title="Kéo hoặc click để đặt con tem"><img src="/sticker_postmark.png" alt="Con tem" class="sticker-img" /></button>
      </div>
    </div>
    <div class="info-note">${icon('info')}<span>Bản in thực tế có thể chênh lệch màu nhẹ tùy chất liệu giấy.</span></div>
  </section><aside class="preview-panel">${letterPreview()}</aside></div>${builderActions(3)}`;
}

function renderStep(step) {
  if (step === 3) return renderDesignStep();
  if (step === 1) return `<div class="panel"><div class="choice-grid">${typeCard('online','pen','Viết thư trực tuyến','Soạn thư ngay trên PostDrop, chọn thiết kế và chúng tôi sẽ in hoặc gửi email.','5–10 phút','Từ 29.000đ')}${typeCard('handwritten','mail','Gửi thư viết tay','Bạn viết trên giấy và gửi đến PostDrop. Chúng tôi số hóa rồi bảo quản nguyên bản.','3–5 ngày','Từ 119.000đ')}</div>${builderActions(step)}</div>`;
  if (step === 2) return `<div class="workspace"><section class="panel"><h2>Nội dung lá thư</h2><p class="panel-intro">Không cần hoàn hảo. Chỉ cần là lời bạn thật sự muốn gửi.</p>${field('title','Tiêu đề lá thư',draft.title,'Ví dụ: Gửi mình của tuổi 25')}<div class="field"><label for="content">Nội dung</label><textarea id="content" data-draft="content" placeholder="Gửi mình của tương lai,&#10;&#10;Hôm nay mình đang…">${escapeHtml(draft.content)}</textarea><div class="field-hint"><span id="word-count">${wordCount(draft.content)}</span> từ · Gợi ý: một lá thư ý nghĩa thường có 150–500 từ</div><div class="field-error" data-error="content"></div></div><button class="button button-secondary" type="button" data-upload>${icon('upload')} Thêm một tấm ảnh</button></section><aside class="preview-panel">${letterPreview()}</aside></div>${builderActions(step)}`;
  if (step === 4) return `<div class="workspace"><section class="panel"><h2>Thông tin người nhận</h2><div class="field"><label>Gửi lá thư này cho</label><div class="segmented">${segment('recipientMode','self','Chính tôi')}${segment('recipientMode','other','Người khác')}</div></div><div class="field-row">${field('recipientName','Họ tên người nhận',draft.recipientName,'Nguyễn Minh Anh')}${field('recipientEmail','Email',draft.recipientEmail,'minhanh@example.com','email')}</div><div class="field-row">${field('recipientPhone','Số điện thoại',draft.recipientPhone,'0901 234 567','tel')}${field('deliveryDate','Ngày dự kiến giao',draft.deliveryDate,'','date')}</div><div id="date-message" class="date-message">${dateMessage()}</div><div class="field"><label>Hình thức nhận</label><div class="segmented">${segment('deliveryMethod','email','Email')}${segment('deliveryMethod','physical','Thư vật lý')}${segment('deliveryMethod','hybrid','Cả hai')}</div></div><div class="field" id="address-field"><label for="address">Địa chỉ nhận</label><input id="address" data-draft="address" value="${escapeHtml(draft.address)}" placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành"/><div class="field-error" data-error="address"></div></div><div class="field"><label for="note">Ghi chú giao hàng <span style="font-weight:400;color:var(--muted)">(không bắt buộc)</span></label><textarea id="note" data-draft="note" style="min-height:95px" placeholder="Ví dụ: Gọi trước khi giao">${escapeHtml(draft.note)}</textarea></div></section><aside class="panel"><h2>Ngày gặp lại</h2><p class="panel-intro">Ngày bạn chọn sẽ trở thành một cột mốc. PostDrop sẽ đồng hành để lá thư không bị lạc đường.</p><div class="mini-envelope" style="width:100%;height:185px;aspect-ratio:auto"><span>${draft.deliveryDate ? formatDate(draft.deliveryDate) : 'Chưa chọn ngày'}</span></div><div class="info-note" style="margin-top:24px">${icon('info')}<span>PostDrop sẽ gửi yêu cầu xác nhận địa chỉ trước ngày giao 30 ngày.</span></div></aside></div>${builderActions(step)}`;
  return `<div class="workspace"><section class="panel"><h2>Tóm tắt lá thư</h2><div class="envelope-preview" style="height:190px"><div class="mini-envelope" style="background:${envelopeColor()}"><span>${escapeHtml(draft.title || 'Lá thư của tôi')}</span></div></div><div class="summary-list">${summaryRow('Tiêu đề',draft.title || 'Chưa đặt tên')}${summaryRow('Người nhận',draft.recipientName || 'Chưa điền')}${summaryRow('Ngày gửi',draft.deliveryDate ? formatDate(draft.deliveryDate) : 'Chưa chọn')}${summaryRow('Hình thức',deliveryLabel())}${summaryRow('Mẫu phong bì',labelize(draft.envelope))}</div><div class="sealed-message">${icon('seal')} <strong>Nội dung sắp được niêm phong.</strong><br/>Bạn sẽ gặp lại những dòng chữ này vào đúng ngày đã chọn.</div></section><aside class="panel"><h2>Chi tiết thanh toán</h2><p class="panel-intro">Thanh toán một lần cho toàn bộ hành trình.</p><div class="summary-list">${summaryRow('Phí in',draft.deliveryMethod === 'email' ? '0đ' : '35.000đ')}${summaryRow('Phí lưu giữ','45.000đ')}${summaryRow('Phí giao hàng',draft.deliveryMethod === 'email' ? '0đ' : '39.000đ')}<div class="summary-row total-row"><span>Tổng thanh toán</span><strong>${totalPrice()}</strong></div></div><label class="seal-check"><input id="seal-confirm" type="checkbox"/><span>Tôi hiểu rằng sau khi niêm phong, nội dung lá thư sẽ không thể chỉnh sửa.</span></label><div class="field-error" data-error="seal"></div>${builderActions(step, true)}</aside></div>`;
}

function typeCard(type, iconName, title, description, time, price) { const selected = draft.letterType === type; return `<button class="choice-card ${selected ? 'selected' : ''}" data-type="${type}" aria-pressed="${selected}"><span class="choice-check">${selected ? '✓' : ''}</span><div class="choice-visual">${icon(iconName)}</div><h3>${title}</h3><p>${description}</p><div class="service-meta"><span>${time}</span><span>${price}</span></div></button>`; }
function field(key, label, value, placeholder, type = 'text') { return `<div class="field"><label for="${key}">${label}</label><input id="${key}" type="${type}" data-draft="${key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${type === 'date' ? `min="${new Date().toISOString().slice(0,10)}"` : ''}/><div class="field-error" data-error="${key}"></div></div>`; }
function swatch(group, value, colorClass, label) {
  const selected = draft[group] === value;
  return `<button class="swatch ${colorClass} ${selected ? 'selected' : ''}" data-option="${group}" data-value="${value}" aria-label="${label}" aria-pressed="${selected}" title="${label}"><span class="swatch-color" aria-hidden="true"></span><span class="swatch-label">${label}</span></button>`;
}
function segment(group, value, label) { return `<button class="segment ${draft[group] === value ? 'selected' : ''}" data-option="${group}" data-value="${value}" type="button">${label}</button>`; }
function letterPreview() {
  const content = (draft.content || 'Những dòng chữ của bạn sẽ xuất hiện ở đây, như một lời nhắn đang chờ thời gian mang đi…').normalize('NFC');
  const decos = (draft.decorations || []).map((deco) => {
    const type = deco.type === 'sparkles' ? 'postmark' : deco.type;
    return `<div class="placed-decoration sticker-${type}" style="left: ${deco.x}%; top: ${deco.y}%;" draggable="true" data-id="${deco.id}">
      <img src="/sticker_${type}.png" alt="${type}" class="placed-sticker-img" />
      <button type="button" class="remove-deco" data-remove-id="${deco.id}">&times;</button>
    </div>`;
  }).join('');
  return `<div class="letter-preview paper-${draft.paper} font-${draft.font}" style="--envelope-color:${envelopeColor()}"><small>GỬI ĐẾN TƯƠNG LAI</small><h3>${escapeHtml((draft.title || 'Lá thư của tôi').normalize('NFC'))}</h3><div class="preview-body">${escapeHtml(content)}</div><div class="signature">POSTDROP · NIÊM PHONG VỚI SỰ RIÊNG TƯ</div><div class="preview-envelope-chip"><span aria-hidden="true"></span>Phong bì ${escapeHtml(labelize(draft.envelope))}</div>${decos}</div>`;
}
function summaryRow(label, value) { return `<div class="summary-row"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`; }
function labelize(value) { return ({
  ivory: 'Ngà cổ điển', rose: 'Hồng phấn', warm: 'Kem ấm', sage: 'Xanh xô thơm',
  lavender: 'Tím oải hương', sky: 'Xanh sương', parchment: 'Giấy cổ điển', linen: 'Vải lanh',
  burgundy: 'Đỏ Burgundy', olive: 'Xanh Olive', terracotta: 'Cam đất', navy: 'Xanh Navy',
  forest: 'Xanh rừng', plum: 'Tím mận', 'dusty-blue': 'Xanh khói', sand: 'Nâu cát',
  charcoal: 'Than chì',
})[value] || value; }
function deliveryLabel() { return ({ email: 'Email', physical: 'Thư vật lý', hybrid: 'Email và thư vật lý' })[draft.deliveryMethod]; }
function totalPrice() { return draft.deliveryMethod === 'email' ? '29.000đ' : draft.deliveryMethod === 'physical' ? '119.000đ' : '149.000đ'; }
function envelopeColor() { return ({
  burgundy: '#7a263a', olive: '#68705b', terracotta: '#c86b4a', navy: '#29435c',
  forest: '#315847', plum: '#6d3b61', 'dusty-blue': '#6f8fa8', sand: '#b88d64',
  charcoal: '#3d4147',
})[draft.envelope] || '#7a263a'; }
function wordCount(text) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
function dateMessage() { const days = Math.max(0, Math.ceil((new Date(`${draft.deliveryDate}T00:00:00`) - new Date()) / 86400000)); return `Lá thư này sẽ được gửi sau ${new Intl.NumberFormat('vi-VN').format(days)} ngày.`; }
function builderActions(step, checkout = false) { return `<div class="builder-actions">${step > 1 ? '<button class="text-button" data-save-later>Lưu và hoàn thành sau</button>' : '<span></span>'}<div class="builder-actions-group">${step > 1 ? `<button class="button button-secondary" data-back>${icon('arrowLeft')}Quay lại</button>` : ''}<button class="button button-primary" data-next>${checkout ? 'Thanh toán và niêm phong' : 'Tiếp tục'}${icon(checkout ? 'seal' : 'arrowRight')}</button></div></div>`; }

function bindBuilder(step) {
  document.querySelectorAll('[data-type]').forEach((card) => card.onclick = () => { draft.letterType = card.dataset.type; persistDraft(); renderBuilder(step); });
  document.querySelectorAll('[data-draft]').forEach((control) => control.addEventListener('input', () => {
    draft[control.dataset.draft] = control.value; control.classList.remove('invalid'); document.querySelector(`[data-error="${control.dataset.draft}"]`)?.replaceChildren();
    if (control.id === 'content') { document.querySelector('#word-count').textContent = wordCount(control.value); updatePreview(); }
    if (control.id === 'title') updatePreview();
    if (control.id === 'deliveryDate') { document.querySelector('#date-message').textContent = dateMessage(); }
    persistDraft();
  }));
  document.querySelectorAll('[data-option]').forEach((control) => control.onclick = () => { draft[control.dataset.option] = control.dataset.value; persistDraft(); renderBuilder(step); });
  document.querySelector('[data-back]')?.addEventListener('click', () => { location.hash = `/create/${step - 1}`; });
  document.querySelector('[data-next]')?.addEventListener('click', () => nextStep(step));
  document.querySelector('[data-save-later]')?.addEventListener('click', () => { persistDraft(); toast('Bản nháp đã được lưu. Bạn có thể quay lại bất cứ lúc nào.', 'success'); setTimeout(() => location.hash = '/dashboard', 700); });
  document.querySelector('[data-upload]')?.addEventListener('click', () => toast('Ảnh sẽ được tối ưu và đính kèm vào lá thư (bản prototype).'));

  if (step === 3) {
    const previewPanel = document.querySelector('.preview-panel');
    
    // 1. Drag start for library items & click support
    document.querySelectorAll('.decorations-library .sticker-item').forEach((item) => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'add:' + item.dataset.type);
      });
      item.addEventListener('click', () => {
        if (!draft.decorations) draft.decorations = [];
        const newDeco = {
          id: 'deco-' + Date.now(),
          type: item.dataset.type,
          x: 50,
          y: 50
        };
        draft.decorations.push(newDeco);
        persistDraft();
        updatePreview();
      });
    });

    // 2. Drag start for placed items
    bindPlacedDecorationsDrag();

    // 3. Drop zone & Delete support on previewPanel
    if (previewPanel) {
      previewPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      previewPanel.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const letterPreviewEl = previewPanel.querySelector('.letter-preview');
        if (!letterPreviewEl) return;
        const rect = letterPreviewEl.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const clampedX = Math.min(94, Math.max(6, x));
        const clampedY = Math.min(94, Math.max(6, y));

        if (data.startsWith('add:')) {
          const type = data.split(':')[1];
          if (!draft.decorations) draft.decorations = [];
          const newDeco = {
            id: 'deco-' + Date.now(),
            type,
            x: clampedX,
            y: clampedY
          };
          draft.decorations.push(newDeco);
        } else if (data.startsWith('move:')) {
          const id = data.split(':')[1];
          const deco = draft.decorations.find((d) => d.id === id);
          if (deco) {
            deco.x = clampedX;
            deco.y = clampedY;
          }
        }
        persistDraft();
        updatePreview();
      });

      previewPanel.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-deco');
        if (removeBtn) {
          e.stopPropagation();
          const id = removeBtn.dataset.removeId;
          draft.decorations = (draft.decorations || []).filter((d) => d.id !== id);
          persistDraft();
          updatePreview();
        }
      });
    }
  }
}

function updatePreview() {
  const preview = document.querySelector('.preview-panel');
  if (preview) {
    preview.innerHTML = letterPreview();
    if (document.querySelector('.decorations-library')) {
      bindPlacedDecorationsDrag();
    }
  }
}

function bindPlacedDecorationsDrag() {
  document.querySelectorAll('.letter-preview .placed-decoration').forEach((decoEl) => {
    decoEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'move:' + decoEl.dataset.id);
    });
  });
}

function setError(key, message) {
  const control = document.querySelector(`[data-draft="${key}"]`); control?.classList.add('invalid');
  const error = document.querySelector(`[data-error="${key}"]`); if (error) error.textContent = message;
}

async function nextStep(step) {
  if (step === 2) {
    let valid = true;
    if (draft.title.trim().length < 2) { setError('title','Hãy đặt một tiêu đề gồm ít nhất 2 ký tự.'); valid = false; }
    if (draft.content.trim().length < 10) { setError('content','Hãy viết ít nhất 10 ký tự trước khi tiếp tục.'); valid = false; }
    if (!valid) { toast('Vẫn còn thông tin cần hoàn thiện.', 'error'); return; }
  }
  if (step === 4) {
    let valid = true;
    if (draft.recipientName.trim().length < 2) { setError('recipientName','Vui lòng nhập họ tên người nhận.'); valid = false; }
    if (!/^\S+@\S+\.\S+$/.test(draft.recipientEmail)) { setError('recipientEmail','Email chưa đúng định dạng.'); valid = false; }
    if (draft.deliveryMethod !== 'email' && draft.address.trim().length < 8) { setError('address','Vui lòng nhập địa chỉ đầy đủ để giao thư.'); valid = false; }
    if (new Date(draft.deliveryDate) <= new Date()) { setError('deliveryDate','Ngày giao cần nằm trong tương lai.'); valid = false; }
    if (!valid) { toast('Vẫn còn thông tin cần hoàn thiện.', 'error'); return; }
  }
  if (step === 5) {
    if (!document.querySelector('#seal-confirm')?.checked) { document.querySelector('[data-error="seal"]').textContent = 'Bạn cần xác nhận điều này trước khi niêm phong.'; return; }
    openModal({ title: 'Niêm phong lá thư?', message: 'Đây là khoảnh khắc cuối cùng bạn có thể quay lại chỉnh sửa nội dung.', confirm: 'Niêm phong ngay', onConfirm: submitLetter });
    return;
  }
  location.hash = `/create/${step + 1}`;
}

async function submitLetter() {
  const next = document.querySelector('[data-next]'); if (next) { next.disabled = true; next.textContent = 'Đang niêm phong…'; }
  try {
    const payload = {
      title: draft.title, content: draft.content, recipientName: draft.recipientName,
      recipientEmail: draft.recipientEmail, recipientPhone: draft.recipientPhone || undefined,
      address: draft.address || undefined, deliveryDate: new Date(`${draft.deliveryDate}T09:00:00`).toISOString(),
      deliveryMethod: draft.deliveryMethod, letterType: draft.letterType,
      paper: labelize(draft.paper), font: draft.font, envelope: labelize(draft.envelope), note: draft.note || undefined,
    };
    const createdResponse = await fetch('/api/letters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!createdResponse.ok) throw new Error('Không thể tạo lá thư');
    const created = await createdResponse.json();
    const sealResponse = await fetch(`/api/letters/${created.id}/seal`, { method: 'POST' });
    if (!sealResponse.ok) throw new Error('Không thể niêm phong');
    currentLetter = await sealResponse.json();
    localStorage.removeItem('postdrop-draft'); draft = { ...defaultDraft, deliveryDate: futureDate() };
    location.hash = '/success';
  } catch (error) {
    toast('Chưa thể niêm phong lúc này. Vui lòng thử lại.', 'error');
    if (next) { next.disabled = false; next.innerHTML = `Thanh toán và niêm phong${icon('seal')}`; }
  }
}

function renderSuccess() {
  const date = currentLetter?.deliveryDate?.slice(0,10) || draft.deliveryDate;
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="success-page"><div class="success-seal">P</div><span class="eyebrow">LÁ THƯ ĐÃ ĐƯỢC NIÊM PHONG</span><h1>Hẹn gặp lại những dòng chữ này trong tương lai.</h1><p>PostDrop sẽ gìn giữ lá thư an toàn và nhắc bạn xác nhận thông tin trước ngày giao.</p><div class="success-meta"><span>${date ? formatDate(date) : 'Ngày đã chọn'}</span><span>·</span><span>${deliveryLabel()}</span></div><div class="hero-actions">${button('Xem thư trong dashboard','/dashboard','primary', 'arrowRight')}${button('Viết thêm một lá thư','/create/1','secondary')}</div></main></div>`;
}

const statusMap = { draft: 'Bản nháp', awaiting_payment: 'Chờ thanh toán', received: 'PostDrop đã nhận thư', stored: 'Đang được lưu giữ', address_confirmation: 'Cần xác nhận địa chỉ', scheduled: 'Đã lên lịch gửi', in_transit: 'Đang vận chuyển', delivered: 'Đã giao thành công' };
async function renderDashboard() {
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="container dashboard-main"><div class="dashboard-title"><div><span class="eyebrow">KHÔNG GIAN CỦA BẠN</span><h1>Chào buổi sáng, Minh Anh.</h1><p>Những lá thư của bạn đang được gìn giữ an toàn.</p></div>${button('Tạo lá thư mới','/create/1','primary','plus')}</div><div id="dashboard-content"><div class="skeleton"></div></div></main></div>`;
  try {
    const response = await fetch('/api/letters/dashboard'); if (!response.ok) throw new Error();
    const data = await response.json();
    document.querySelector('#dashboard-content').innerHTML = `${statCards(data.summary)}<section class="letters-panel"><div class="panel-head"><h2>Những lá thư của bạn</h2><select aria-label="Lọc trạng thái"><option>Tất cả trạng thái</option><option>Đang lưu giữ</option><option>Sắp được gửi</option></select></div>${data.letters.length ? letterTable(data.letters) : emptyState()}</section>`;
  } catch { document.querySelector('#dashboard-content').innerHTML = `<div class="empty-state">${icon('info')}<h3>Chưa thể tải những lá thư</h3><p>Đường truyền đang gián đoạn. Hãy thử tải lại trang sau ít phút.</p><button class="button button-primary" onclick="location.reload()">Thử lại</button></div>`; }
}

function statCards(summary) { return `<div class="stat-grid">${statCard('archive',summary.stored,'Thư đang lưu giữ')}${statCard('clock',summary.upcoming,'Sắp được gửi')}${statCard('map',summary.confirmation,'Cần xác nhận địa chỉ')}${statCard('check',summary.delivered,'Đã giao thành công')}</div>`; }
function statCard(iconName, count, label) { return `<article class="stat-card">${icon(iconName)}<strong>${count}</strong><span>${label}</span></article>`; }
function letterTable(letters) { return `<table class="letter-table"><thead><tr><th>Lá thư</th><th>Người nhận</th><th>Ngày giao</th><th>Hình thức</th><th>Trạng thái</th><th></th></tr></thead><tbody>${letters.map((letter) => `<tr><td><strong>${escapeHtml(letter.title)}</strong><small>#${escapeHtml(letter.id.slice(-8).toUpperCase())}</small></td><td>${escapeHtml(letter.recipientName)}</td><td>${formatDate(letter.deliveryDate.slice(0,10))}</td><td>${({email:'Email',physical:'Thư vật lý',hybrid:'Cả hai'})[letter.deliveryMethod]}</td><td><span class="badge ${letter.status}">${statusMap[letter.status]}</span></td><td><a class="text-button" href="#/letters/${letter.id}">Xem chi tiết</a></td></tr>`).join('')}</tbody></table>`; }
function emptyState() { return `<div class="empty-state">${icon('mail')}<h3>Bạn chưa có lá thư nào đang chờ trong tương lai.</h3><p>Hãy bắt đầu bằng một điều nhỏ bạn muốn nhắc mình nhớ.</p>${button('Viết lá thư đầu tiên','/create/1')}</div>`; }

async function renderLetterDetail(id) {
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="container detail-main"><a class="back-link" href="#/dashboard">${icon('arrowLeft')}Trở về dashboard</a><div id="detail-content"><div class="skeleton"></div></div></main></div>`;
  try {
    const response = await fetch(`/api/letters/${id}`); if (!response.ok) throw new Error();
    const letter = await response.json();
    document.querySelector('#detail-content').innerHTML = `<div class="detail-grid"><section class="detail-hero"><div class="envelope-preview"><div class="mini-envelope" style="background:${letter.envelope === 'Burgundy' ? '#7a263a' : '#fffdf8'}"><span>${escapeHtml(letter.recipientName)}</span></div></div><span class="badge ${letter.status}">${statusMap[letter.status]}</span><h1 style="font-size:clamp(2rem,4vw,3rem);margin:18px 0 8px">${escapeHtml(letter.title)}</h1><p>Gửi đến ${escapeHtml(letter.recipientName)} · ${formatDate(letter.deliveryDate.slice(0,10))}</p>${letter.sealedAt ? `<div class="sealed-message"><strong>Nội dung lá thư đã được niêm phong vào ngày ${formatDate(letter.sealedAt.slice(0,10))}.</strong><br/>Bạn sẽ gặp lại những dòng chữ này vào đúng ngày đã chọn.</div>` : ''}<div class="timeline"><h3>Hành trình lá thư</h3>${timeline(letter)}</div></section><aside class="detail-side"><div class="detail-card"><h3>Thông tin giao thư</h3><div class="summary-list">${summaryRow('Người nhận',letter.recipientName)}${summaryRow('Địa chỉ',letter.address || 'Gửi qua email')}${summaryRow('Phương thức',({email:'Email',physical:'Thư vật lý',hybrid:'Email và thư vật lý'})[letter.deliveryMethod])}${summaryRow('Gói dịch vụ',letter.deliveryMethod === 'hybrid' ? 'Hybrid' : letter.deliveryMethod)}${summaryRow('Mã theo dõi',letter.trackingCode || 'Sẽ cập nhật khi gửi')}</div></div><div class="detail-card"><h3>Thao tác</h3><div class="detail-actions"><button class="button button-secondary">${icon('map')}Cập nhật địa chỉ</button><button class="button button-ghost">${icon('user')}Cập nhật liên hệ</button><button class="button button-ghost">${icon('file')}Xem hóa đơn</button><button class="button button-ghost">${icon('mail')}Liên hệ hỗ trợ</button></div></div></aside></div>`;
  } catch { document.querySelector('#detail-content').innerHTML = `<div class="empty-state">${icon('info')}<h3>Không tìm thấy lá thư</h3><p>Lá thư có thể đã được chuyển hoặc đường dẫn không còn đúng.</p>${button('Về dashboard','/dashboard')}</div>`; }
}

function timeline(letter) {
  const dates = [letter.createdAt, letter.sealedAt, letter.updatedAt, '', '', ''];
  const names = ['Đã tạo','Đã niêm phong','Đang lưu giữ','Xác nhận địa chỉ','Đang vận chuyển','Đã giao'];
  const doneThrough = letter.status === 'stored' ? 2 : letter.status === 'scheduled' ? 3 : letter.status === 'in_transit' ? 4 : letter.status === 'delivered' ? 5 : 1;
  return names.map((name, i) => `<div class="timeline-item ${i <= doneThrough ? 'done' : ''}"><span class="timeline-dot"></span><strong>${name}</strong><span>${dates[i] ? formatDate(dates[i].slice(0,10)) : 'Chưa đến'}</span></div>`).join('');
}

function renderAuth(mode = 'login') {
  const config = {
    login: ['Chào mừng bạn trở lại','Đăng nhập để xem những lá thư đang chờ trong tương lai.','Đăng nhập','Chưa có tài khoản?','Tạo tài khoản'],
    register: ['Tạo không gian của bạn','Chỉ mất một phút để lưu giữ lá thư đầu tiên.','Tạo tài khoản','Đã có tài khoản?','Đăng nhập'],
    forgot: ['Tìm lại tài khoản','Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu đến email của bạn.','Gửi đường dẫn','Đã nhớ mật khẩu?','Đăng nhập'],
  }[mode];
  app.innerHTML = `<main id="main-content" class="auth-page"><section class="auth-art"><div><small>POSTDROP · THƯ GỬI ĐẾN TƯƠNG LAI</small><blockquote>“Có những điều chỉ thời gian mới giúp ta hiểu được.”</blockquote></div></section><section class="auth-form-wrap"><form class="auth-form">${brand()}<h1>${config[0]}</h1><p>${config[1]}</p>${mode === 'register' ? field('fullName','Họ và tên','','Nguyễn Minh Anh') : ''}${field('authEmail','Email','','ban@example.com','email')}${mode !== 'forgot' ? field('password','Mật khẩu','','••••••••','password') : ''}${mode === 'login' ? '<div style="text-align:right;margin:-10px 0 14px"><a class="text-button" href="#/forgot">Quên mật khẩu?</a></div>' : ''}<button class="button button-primary auth-submit" type="submit">${config[2]}</button><p class="auth-helper">${config[3]} <a class="text-button" href="#/${mode === 'register' ? 'login' : mode === 'forgot' ? 'login' : 'register'}">${config[4]}</a></p></form></section></main>`;
  document.querySelector('.auth-form').onsubmit = (event) => { event.preventDefault(); toast(mode === 'register' ? 'Tài khoản đã được tạo. Hãy kiểm tra email xác thực.' : mode === 'forgot' ? 'Đường dẫn đặt lại mật khẩu đã được gửi.' : 'Đăng nhập thành công.', 'success'); setTimeout(() => location.hash = mode === 'register' ? '/verify' : mode === 'forgot' ? '/login' : '/dashboard', 800); };
}

function renderVerify() {
  app.innerHTML = `<main id="main-content" class="auth-page"><section class="auth-art"><div><small>POSTDROP · MỘT BƯỚC NHỎ NỮA</small><blockquote>“Mỗi lá thư đều cần một địa chỉ để tìm đường đến tương lai.”</blockquote></div></section><section class="auth-form-wrap"><div class="auth-form">${brand()}<div class="step-icon" style="margin:0 0 28px">${icon('mail')}</div><h1>Kiểm tra hộp thư của bạn</h1><p>Chúng tôi đã gửi liên kết xác thực đến email bạn vừa đăng ký. Liên kết có hiệu lực trong 30 phút.</p><a class="button button-primary auth-submit" href="#/dashboard">Tôi đã xác thực email</a><button class="button button-ghost auth-submit" id="resend-email">Gửi lại email xác thực</button><p class="auth-helper">Nhập nhầm email? <a class="text-button" href="#/register">Quay lại đăng ký</a></p></div></section></main>`;
  document.querySelector('#resend-email').onclick = () => toast('Email xác thực mới đã được gửi.', 'success');
}

function route() {
  window.scrollTo(0, 0);
  const hash = location.hash.slice(1) || '/';
  if (hash.startsWith('/create/')) return renderBuilder(Number(hash.split('/')[2].split('?')[0]) || 1);
  if (hash === '/success') return renderSuccess();
  if (hash === '/dashboard') return renderDashboard();
  if (hash.startsWith('/letters/')) return renderLetterDetail(hash.split('/')[2]);
  if (hash === '/login') return renderAuth('login');
  if (hash === '/register') return renderAuth('register');
  if (hash === '/forgot') return renderAuth('forgot');
  if (hash === '/verify') return renderVerify();
  renderLanding();
}

function initIntro() {
  const intro = document.querySelector('#intro');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasSeenIntro = localStorage.getItem('postdrop-intro-seen');
  const pageSkipLink = document.querySelector('.skip-link');
  const animatedTargets = '.intro-topbar, .intro-copy, .floating-note, .envelope-stage, .envelope, .envelope-flap, .wax-seal, .wax-seal i, .seal-halo, .intro-letter, .letter-kicker, .letter-greeting, .letter-line, .letter-signature, .intro-paper-plane, .mail-trail, .mail-trail path, .intro-glow';

  if (hasSeenIntro) intro.classList.add('hidden');
  if (!hasSeenIntro) {
    app.inert = true;
    app.setAttribute('aria-hidden', 'true');
    pageSkipLink.tabIndex = -1;
  }

  const revealLanding = () => {
    document.querySelector('.page-shell')?.classList.add('intro-revealed');
  };
  const showLandedPlane = () => {
    document.querySelector('.page-shell')?.classList.add('plane-arrived');
  };
  const finish = () => {
    if (window.anime) window.anime.remove(animatedTargets);
    intro.classList.add('hidden');
    revealLanding();
    showLandedPlane();
    localStorage.setItem('postdrop-intro-seen','true');
    app.inert = false;
    app.removeAttribute('aria-hidden');
    pageSkipLink.removeAttribute('tabindex');
  };

  document.querySelector('#skip-intro').onclick = finish;
  intro.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finish();
  });

  if (!hasSeenIntro && !reduced && window.anime) {
    anime.set('.intro-copy', { opacity: 0, translateY: -12 });
    anime.set('.letter-kicker, .letter-greeting, .letter-signature', { opacity: 0, translateY: 8 });
    anime.set('.letter-line', { opacity: 0, scaleX: 0 });

    anime({ targets: '.envelope-stage', translateY: [20, 0], scale: [.97, 1], rotateX: [-2, 0], duration: 800, delay: 120, easing: 'cubicBezier(.22, 1, .36, 1)' });
    anime({ targets: '.intro-copy', opacity: [0, 1], translateY: [-12, 0], duration: 650, easing: 'cubicBezier(.22, 1, .36, 1)' });
    anime({ targets: '.envelope', translateY: [4, -3, 0], duration: 850, delay: 450, easing: 'easeInOutSine' });
    anime({ targets: '.floating-note', opacity: [.2, .72], translateY: [10, 0], scale: [.96, 1], delay: anime.stagger(90, { start: 220 }), duration: 700, easing: 'cubicBezier(.22, 1, .36, 1)' });
  }

  let isOpening = false;
  const startOpening = () => {
    if (isOpening) return;
    isOpening = true;
    if (reduced) return finish();
    intro.classList.add('opening');
    const status = document.querySelector('.intro-status');

    if (!window.anime) {
      intro.classList.add('fallback-opening');
      status.textContent = 'Lá thư đang gấp thành máy bay giấy…';
      setTimeout(() => {
        intro.classList.add('handoff');
        revealLanding();
        showLandedPlane();
      }, 6300);
      setTimeout(finish, 7300);
      return;
    }

    anime.remove(animatedTargets);
    anime.set('.letter-kicker, .letter-greeting, .letter-signature', { opacity: 0, translateY: 8 });
    anime.set('.letter-line', { opacity: 0, scaleX: 0 });
    anime.set('.mail-trail', { opacity: 0 });
    anime.set('.mail-trail path', { strokeDashoffset: 180 });

    const extractionY = window.innerWidth < 680 ? -142 : -183;
    const flyingPlane = document.querySelector('.intro-paper-plane');
    const landedPlane = document.querySelector('.landing-paper-plane');
    const flyingRect = flyingPlane.getBoundingClientRect();
    const landedRect = landedPlane.getBoundingClientRect();
    const flightX = landedRect.left + landedRect.width / 2 - (flyingRect.left + flyingRect.width / 2);
    const flightY = landedRect.top + landedRect.height / 2 - (flyingRect.top + flyingRect.height / 2);
    const landingScale = landedRect.width / flyingRect.width;
    const startY = extractionY - 8;
    const verticalTravel = Math.abs(flightY - startY);
    const lift = Math.max(86, verticalTravel * .58);
    const control1 = { x: flightX * .2, y: startY - lift };
    const control2 = { x: flightX * .72, y: flightY - Math.max(28, lift * .22) };
    const flightState = { progress: 0 };
    const cubicPoint = (start, first, second, end, progress) => {
      const remaining = 1 - progress;
      return remaining ** 3 * start + 3 * remaining ** 2 * progress * first + 3 * remaining * progress ** 2 * second + progress ** 3 * end;
    };
    const cubicTangent = (start, first, second, end, progress) => {
      const remaining = 1 - progress;
      return 3 * remaining ** 2 * (first - start) + 6 * remaining * progress * (second - first) + 3 * progress ** 2 * (end - second);
    };
    const smoothStep = (progress) => progress * progress * (3 - 2 * progress);
    const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

    anime.set('.intro-paper-plane', {
      opacity: 0, translateX: 0, translateY: startY, rotate: -14, scale: .55,
    });

    const timeline = anime.timeline({ easing: 'cubicBezier(.22, 1, .36, 1)', autoplay: true });

    timeline
      .add({ targets: '.intro-topbar', opacity: 0, translateY: -10, duration: 430 }, 0)
      .add({ targets: '.intro-copy', opacity: 0, translateY: -18, duration: 460 }, 0)
      .add({ targets: '.seal-halo', opacity: 0, scale: 1.2, duration: 340 }, 0)
      .add({ targets: '.floating-note', opacity: 0, translateY: (_, index) => index % 2 ? -18 : 18, delay: anime.stagger(80), duration: 500 }, 30)
      .add({
        targets: '.wax-seal i', opacity: [0, 1], scaleX: [0, 1], delay: anime.stagger(65), duration: 260,
        begin: () => { status.textContent = 'Đang mở niêm phong…'; },
      }, 360)
      .add({ targets: '.wax-seal', scale: [1, 1.12, .12], rotate: [0, -7, 24], opacity: [1, 1, 0], duration: 560, easing: 'easeInBack' }, 430)
      .add({ targets: '.envelope-flap', rotateX: [0, -12, 180], translateY: [0, -3, 0], duration: 820, easing: 'cubicBezier(.4, 0, .15, 1)' }, 720)
      .add({
        targets: '.intro-letter', translateY: [0, extractionY], scale: [1, 1.045], rotate: [0, -.7], opacity: [0, 1], duration: 1080, easing: 'cubicBezier(.16, 1, .3, 1)',
        begin: () => { status.textContent = 'Một lá thư từ quá khứ…'; },
      }, 1040)
      .add({ targets: '.envelope-stage', duration: 1, begin: () => intro.classList.add('letter-released') }, 1740)
      .add({ targets: '.letter-kicker, .letter-greeting', opacity: [0, 1], translateY: [8, 0], delay: anime.stagger(130), duration: 560 }, 1540)
      .add({ targets: '.letter-line', opacity: [0, 1], scaleX: [0, 1], delay: anime.stagger(110), duration: 600, easing: 'easeOutQuart' }, 1740)
      .add({ targets: '.letter-signature', opacity: [0, 1], translateY: [8, 0], duration: 560 }, 2010)
      .add({ targets: '.envelope', translateY: [0, 95], scale: [1, .9], opacity: [1, 0], duration: 820 }, 2110)
      .add({
        targets: '.intro-letter',
        translateY: [extractionY, extractionY - 8], scaleX: [1, .72, .3], scaleY: [1, .32, .08],
        rotate: [-.7, -7, -14], opacity: [1, 1, 0], duration: 820, easing: 'cubicBezier(.65, 0, .35, 1)',
        begin: () => { status.textContent = 'Lá thư đang tự gấp lại…'; },
      }, 2800)
      .add({
        targets: '.intro-paper-plane', opacity: [0, 1], scale: [.55, 1], rotate: [-14, -5],
        duration: 560, easing: 'cubicBezier(.16, 1, .3, 1)',
      }, 3060)
      .add({ targets: '.mail-trail', opacity: [0, .72, 0], duration: 2350, easing: 'cubicBezier(.45, .03, .2, 1)' }, 3650)
      .add({ targets: '.mail-trail path', strokeDashoffset: [180, 0], duration: 2350, easing: 'cubicBezier(.45, .03, .2, 1)' }, 3650)
      .add({
        targets: flightState,
        progress: [0, 1],
        duration: 2350,
        easing: 'cubicBezier(.45, .03, .2, 1)',
        begin: () => {
          status.textContent = 'Máy bay giấy đang mang lá thư đến tương lai…';
        },
        update: () => {
          const progress = flightState.progress;
          const x = cubicPoint(0, control1.x, control2.x, flightX, progress);
          const y = cubicPoint(startY, control1.y, control2.y, flightY, progress);
          const tangentX = cubicTangent(0, control1.x, control2.x, flightX, progress);
          const tangentY = cubicTangent(startY, control1.y, control2.y, flightY, progress);
          const direction = clamp(Math.atan2(tangentY, tangentX) * 180 / Math.PI * .38, -16, 9);
          const takeoffBlend = smoothStep(Math.min(1, progress / .16));
          const landingBlend = progress < .82 ? 1 : 1 - smoothStep((progress - .82) / .18);
          const wingDrift = Math.sin(progress * Math.PI * 4) * 1.6 * (1 - progress);
          const rotation = (-5 + (direction + 5) * takeoffBlend) * landingBlend + wingDrift;
          const scaleProgress = smoothStep(progress);
          const scale = 1 + (landingScale - 1) * scaleProgress + Math.sin(Math.PI * progress) * .045;
          flyingPlane.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
        },
        complete: () => {
          status.textContent = 'Lá thư đã đến nơi. Chào mừng bạn đến PostDrop.';
          intro.classList.add('handoff');
          revealLanding();
          showLandedPlane();
        },
      }, 3650)
      .add({ targets: '.intro-paper-plane', opacity: [1, 0], duration: 360, easing: 'easeOutQuad' }, 6000)
      .add({
        targets: '.intro', opacity: [1, 0], duration: 1050, easing: 'cubicBezier(.22, 1, .36, 1)',
        complete: finish,
      }, 6120);
  };

  const envelopeTrigger = document.querySelector('.envelope-stage');
  envelopeTrigger.addEventListener('click', startOpening);
}
window.addEventListener('hashchange', route);
initIntro();
route();
