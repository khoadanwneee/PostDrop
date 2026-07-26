const stickerCategories = [
  { id: 'cute', name: 'Dễ thương' },
  { id: 'y2k', name: 'Y2K' },
  { id: 'study', name: 'Học tập' },
  { id: 'scrapbook', name: 'Scrapbook' }
];

const stickerList = [
  // 32 Cute Stickers
  { id: 'cute_heart_pink', cat: 'cute', title: 'Trái tim hồng 3D', src: '/stickers/cute/cute_heart_pink.png' },
  { id: 'cute_good_vibes', cat: 'cute', title: 'Good vibes', src: '/stickers/cute/cute_good_vibes.png' },
  { id: 'cute_star_silver', cat: 'cute', title: 'Ngôi sao bạc 3D', src: '/stickers/cute/cute_star_silver.png' },
  { id: 'cute_cloud_blue', cat: 'cute', title: 'Đám mây mỉm cười', src: '/stickers/cute/cute_cloud_blue.png' },
  { id: 'cute_bow_pink', cat: 'cute', title: 'Nơ caro hồng', src: '/stickers/cute/cute_bow_pink.png' },
  { id: 'cute_cherries', cat: 'cute', title: 'Trái anh đào', src: '/stickers/cute/cute_cherries.png' },
  { id: 'cute_luv_u', cat: 'cute', title: 'Luv u', src: '/stickers/cute/cute_luv_u.png' },
  { id: 'cute_smiley_yellow', cat: 'cute', title: 'Mặt cười vàng', src: '/stickers/cute/cute_smiley_yellow.png' },
  { id: 'cute_bestie', cat: 'cute', title: 'Bestie', src: '/stickers/cute/cute_bestie.png' },
  { id: 'cute_star_blue', cat: 'cute', title: 'Ngôi sao xanh', src: '/stickers/cute/cute_star_blue.png' },
  { id: 'cute_flower_pink', cat: 'cute', title: 'Hoa hồng nhỏ', src: '/stickers/cute/cute_flower_pink.png' },
  { id: 'cute_nhan_cau_ne', cat: 'cute', title: 'Nhắn cậu nè', src: '/stickers/cute/cute_nhan_cau_ne.png' },
  { id: 'cute_music_note', cat: 'cute', title: 'Nốt nhạc mơ mộng', src: '/stickers/cute/cute_music_note.png' },
  { id: 'cute_you_got_this', cat: 'cute', title: 'You got this', src: '/stickers/cute/cute_you_got_this.png' },
  { id: 'cute_chill_di', cat: 'cute', title: 'Chill đi', src: '/stickers/cute/cute_chill_di.png' },
  { id: 'cute_crescent_moon', cat: 'cute', title: 'Trăng khuyết ngủ ngoan', src: '/stickers/cute/cute_crescent_moon.png' },
  { id: 'cute_butterfly_purple', cat: 'cute', title: 'Bướm tím', src: '/stickers/cute/cute_butterfly_purple.png' },
  { id: 'cute_tape_pink', cat: 'cute', title: 'Washi tape tim hồng', src: '/stickers/cute/cute_tape_pink.png' },
  { id: 'cute_tape_checkered', cat: 'cute', title: 'Washi tape caro', src: '/stickers/cute/cute_tape_checkered.png' },
  { id: 'cute_tape_daisy', cat: 'cute', title: 'Washi tape hoa cúc', src: '/stickers/cute/cute_tape_daisy.png' },
  { id: 'cute_keo_ngot', cat: 'cute', title: 'Kẹo ngọt', src: '/stickers/cute/cute_keo_ngot.png' },
  { id: 'cute_coffee_cup', cat: 'cute', title: 'Ly cà phê tim', src: '/stickers/cute/cute_coffee_cup.png' },
  { id: 'cute_envelope_love', cat: 'cute', title: 'Phong bì tình yêu', src: '/stickers/cute/cute_envelope_love.png' },
  { id: 'cute_laptop_pink', cat: 'cute', title: 'Laptop tim hồng', src: '/stickers/cute/cute_laptop_pink.png' },
  { id: 'cute_camera_pink', cat: 'cute', title: 'Máy ảnh Y2K', src: '/stickers/cute/cute_camera_pink.png' },
  { id: 'cute_xinh_iu', cat: 'cute', title: 'Xinh iu', src: '/stickers/cute/cute_xinh_iu.png' },
  { id: 'cute_heart_silver', cat: 'cute', title: 'Trái tim bạc', src: '/stickers/cute/cute_heart_silver.png' },
  { id: 'cute_sparkles_pink', cat: 'cute', title: 'Ngôi sao lấp lánh', src: '/stickers/cute/cute_sparkles_pink.png' },
  { id: 'cute_bow_blue', cat: 'cute', title: 'Nơ ngọc bích', src: '/stickers/cute/cute_bow_blue.png' },
  { id: 'cute_chat_bubble', cat: 'cute', title: 'Khung tin nhắn tím', src: '/stickers/cute/cute_chat_bubble.png' },
  { id: 'cute_star_face', cat: 'cute', title: 'Ngôi sao mỉm cười', src: '/stickers/cute/cute_star_face.png' },
  { id: 'cute_heart_holographic', cat: 'cute', title: 'Trái tim cầu vồng', src: '/stickers/cute/cute_heart_holographic.png' },

  // 27 Y2K Stickers
  { id: 'y2k_slay', cat: 'y2k', title: 'Chrome Slay 3D', src: '/stickers/y2k/y2k_slay.png' },
  { id: 'y2k_phone_flip', cat: 'y2k', title: 'Điện thoại nắp gập ur so hot', src: '/stickers/y2k/y2k_phone_flip.png' },
  { id: 'y2k_star_blue_3d', cat: 'y2k', title: 'Ngôi sao xanh 3D', src: '/stickers/y2k/y2k_star_blue_3d.png' },
  { id: 'y2k_so_iconic', cat: 'y2k', title: 'So iconic', src: '/stickers/y2k/y2k_so_iconic.png' },
  { id: 'y2k_heart_checkered', cat: 'y2k', title: 'Trái tim caro', src: '/stickers/y2k/y2k_heart_checkered.png' },
  { id: 'y2k_star_pink', cat: 'y2k', title: 'Ngôi sao hồng', src: '/stickers/y2k/y2k_star_pink.png' },
  { id: 'y2k_heart_holographic', cat: 'y2k', title: 'Trái tim Holographic 3D', src: '/stickers/y2k/y2k_heart_holographic.png' },
  { id: 'y2k_headphones', cat: 'y2k', title: 'Tai nghe chụp tai Y2K', src: '/stickers/y2k/y2k_headphones.png' },
  { id: 'y2k_flame_blue', cat: 'y2k', title: 'Ngọn lửa xanh', src: '/stickers/y2k/y2k_flame_blue.png' },
  { id: 'y2k_main_character', cat: 'y2k', title: 'Main character', src: '/stickers/y2k/y2k_main_character.png' },
  { id: 'y2k_smiley_pink', cat: 'y2k', title: 'Mặt cười hồng', src: '/stickers/y2k/y2k_smiley_pink.png' },
  { id: 'y2k_camera_digital', cat: 'y2k', title: 'Máy ảnh kỹ thuật số Y2K', src: '/stickers/y2k/y2k_camera_digital.png' },
  { id: 'y2k_xinh_iu', cat: 'y2k', title: 'Xinh iu Y2K', src: '/stickers/y2k/y2k_xinh_iu.png' },
  { id: 'y2k_star_checkered', cat: 'y2k', title: 'Ngôi sao caro', src: '/stickers/y2k/y2k_star_checkered.png' },
  { id: 'y2k_chill_di', cat: 'y2k', title: 'Chill đi blue speech', src: '/stickers/y2k/y2k_chill_di.png' },
  { id: 'y2k_flame_smiley', cat: 'y2k', title: 'Ngọn lửa mặt cười hồng', src: '/stickers/y2k/y2k_flame_smiley.png' },
  { id: 'y2k_ball_8', cat: 'y2k', title: 'Bóng bida số 8', src: '/stickers/y2k/y2k_ball_8.png' },
  { id: 'y2k_loading', cat: 'y2k', title: 'Loading pixel tim', src: '/stickers/y2k/y2k_loading.png' },
  { id: 'y2k_cursor', cat: 'y2k', title: 'Con trỏ chuột pixel', src: '/stickers/y2k/y2k_cursor.png' },
  { id: 'y2k_butterfly_cyber', cat: 'y2k', title: 'Bướm Cyberpunk 3D', src: '/stickers/y2k/y2k_butterfly_cyber.png' },
  { id: 'y2k_gamepad', cat: 'y2k', title: 'Tay cầm game PS2', src: '/stickers/y2k/y2k_gamepad.png' },
  { id: 'y2k_badge_text', cat: 'y2k', title: 'Logo Y2K Chrome', src: '/stickers/y2k/y2k_badge_text.png' },
  { id: 'y2k_lips_pink', cat: 'y2k', title: 'Đôi môi hồng sexy', src: '/stickers/y2k/y2k_lips_pink.png' },
  { id: 'y2k_heart_blue_flame', cat: 'y2k', title: 'Trái tim ngọn lửa xanh', src: '/stickers/y2k/y2k_heart_blue_flame.png' },
  { id: 'y2k_okurrr', cat: 'y2k', title: 'Okurrr', src: '/stickers/y2k/y2k_okurrr.png' },
  { id: 'y2k_smiley_holographic', cat: 'y2k', title: 'Mặt cười Holographic', src: '/stickers/y2k/y2k_smiley_holographic.png' },
  { id: 'y2k_sneaker_platform', cat: 'y2k', title: 'Giày sneaker Y2K lửa hồng', src: '/stickers/y2k/y2k_sneaker_platform.png' },

  // 40 Study Stickers
  { id: 'study_you_got_this', cat: 'study', title: 'You got this cloud', src: '/stickers/study/study_you_got_this.png' },
  { id: 'study_olive_star', cat: 'study', title: 'Ngôi sao xanh olive', src: '/stickers/study/study_olive_star.png' },
  { id: 'study_star_face', cat: 'study', title: 'Ngôi sao mỉm cười', src: '/stickers/study/study_star_face.png' },
  { id: 'study_study_mode', cat: 'study', title: 'Study mode badge', src: '/stickers/study/study_study_mode.png' },
  { id: 'study_coffee_first', cat: 'study', title: 'Cốc cà phê Coffee First', src: '/stickers/study/study_coffee_first.png' },
  { id: 'study_matcha_love', cat: 'study', title: 'Ly Matcha Latte', src: '/stickers/study/study_matcha_love.png' },
  { id: 'study_tote_bag', cat: 'study', title: 'Túi vải Tote Bookish Things', src: '/stickers/study/study_tote_bag.png' },
  { id: 'study_heart_pink', cat: 'study', title: 'Trái tim hồng mỉm cười', src: '/stickers/study/study_heart_pink.png' },
  { id: 'study_nhan_cau_ne', cat: 'study', title: 'Nhắn cậu nè speech bubble', src: '/stickers/study/study_nhan_cau_ne.png' },
  { id: 'study_leaf_branch', cat: 'study', title: 'Cành lá olive', src: '/stickers/study/study_leaf_branch.png' },
  { id: 'study_notebook_bear', cat: 'study', title: 'Sổ gáy xoắn gấu nhỏ', src: '/stickers/study/study_notebook_bear.png' },
  { id: 'study_pencil', cat: 'study', title: 'Bút chì gỗ', src: '/stickers/study/study_pencil.png' },
  { id: 'study_focus', cat: 'study', title: 'Focus badge', src: '/stickers/study/study_focus.png' },
  { id: 'study_heart_blue', cat: 'study', title: 'Trái tim xanh pastel', src: '/stickers/study/study_heart_blue.png' },
  { id: 'study_smiley_yellow', cat: 'study', title: 'Mặt cười vàng nhỏ', src: '/stickers/study/study_smiley_yellow.png' },
  { id: 'study_book_stack', cat: 'study', title: 'Chồng sách cổ điển & kính cận', src: '/stickers/study/study_book_stack.png' },
  { id: 'study_cat_sleeping', cat: 'study', title: 'Mèo con nằm ngủ', src: '/stickers/study/study_cat_sleeping.png' },
  { id: 'study_binder_clip', cat: 'study', title: 'Kẹp giấy binder clip', src: '/stickers/study/study_binder_clip.png' },
  { id: 'study_paper_plane', cat: 'study', title: 'Máy bay giấy bay', src: '/stickers/study/study_paper_plane.png' },
  { id: 'study_laptop_cozy', cat: 'study', title: 'Laptop nắp gập cozy', src: '/stickers/study/study_laptop_cozy.png' },
  { id: 'study_headphones_beige', cat: 'study', title: 'Tai nghe chụp tay kem beige', src: '/stickers/study/study_headphones_beige.png' },
  { id: 'study_camera_instant', cat: 'study', title: 'Máy ảnh lấy liền & ảnh in', src: '/stickers/study/study_camera_instant.png' },
  { id: 'study_polaroid_flowers', cat: 'study', title: 'Khung ảnh Polaroid hoa tulip', src: '/stickers/study/study_polaroid_flowers.png' },
  { id: 'study_quote_note', cat: 'study', title: 'Giấy ghi chú câu nói động lực', src: '/stickers/study/study_quote_note.png' },
  { id: 'study_good_day', cat: 'study', title: 'Good day badge', src: '/stickers/study/study_good_day.png' },
  { id: 'study_to_do_list', cat: 'study', title: 'Bảng To-do list học tập', src: '/stickers/study/study_to_do_list.png' },
  { id: 'study_flower_yellow', cat: 'study', title: 'Cành hoa vàng nhỏ', src: '/stickers/study/study_flower_yellow.png' },
  { id: 'study_heart_plaid', cat: 'study', title: 'Trái tim kẻ caro', src: '/stickers/study/study_heart_plaid.png' },
  { id: 'study_take_a_break', cat: 'study', title: 'Take a break speech bubble', src: '/stickers/study/study_take_a_break.png' },
  { id: 'study_its_ok_to_rest', cat: 'study', title: "It's ok to rest cloud", src: '/stickers/study/study_its_ok_to_rest.png' },
  { id: 'study_bear_pouch', cat: 'study', title: 'Linh vật gấu trắng dễ thương', src: '/stickers/study/study_bear_pouch.png' },
  { id: 'study_mug_coffee', cat: 'study', title: 'Cốc gốm sứ cà phê nóng', src: '/stickers/study/study_mug_coffee.png' },
  { id: 'study_paperclips', cat: 'study', title: 'Bộ 3 kẹp ghim giấy pastel', src: '/stickers/study/study_paperclips.png' },
  { id: 'study_plant_potted', cat: 'study', title: 'Chậu cây cảnh để bàn', src: '/stickers/study/study_plant_potted.png' },
  { id: 'study_tape_grid', cat: 'study', title: 'Washi tape kẻ ô beige', src: '/stickers/study/study_tape_grid.png' },
  { id: 'study_tape_daisy', cat: 'study', title: 'Washi tape hoa cúc olive', src: '/stickers/study/study_tape_daisy.png' },
  { id: 'study_tape_polkadot', cat: 'study', title: 'Washi tape chấm bi xanh', src: '/stickers/study/study_tape_polkadot.png' },
  { id: 'study_tape_gingham', cat: 'study', title: 'Washi tape caro vàng', src: '/stickers/study/study_tape_gingham.png' },
  { id: 'study_tape_hearts', cat: 'study', title: 'Washi tape tim cam đất', src: '/stickers/study/study_tape_hearts.png' },
  { id: 'study_tape_floral', cat: 'study', title: 'Washi tape hoạ tiết hoa nhỏ', src: '/stickers/study/study_tape_floral.png' },

  // 31 Scrapbook Stickers
  { id: 'scrapbook_little_moments', cat: 'scrapbook', title: 'Little moments label', src: '/stickers/scrapbook/scrapbook_little_moments.png' },
  { id: 'scrapbook_dried_wildflowers', cat: 'scrapbook', title: 'Hoa dại khô dán băng keo', src: '/stickers/scrapbook/scrapbook_dried_wildflowers.png' },
  { id: 'scrapbook_stamp_mountain', cat: 'scrapbook', title: 'Tem bưu chính núi rừng 20¢', src: '/stickers/scrapbook/scrapbook_stamp_mountain.png' },
  { id: 'scrapbook_pink_flower', cat: 'scrapbook', title: 'Hoa cúc hồng mộc mạc', src: '/stickers/scrapbook/scrapbook_pink_flower.png' },
  { id: 'scrapbook_film_strip', cat: 'scrapbook', title: 'Cuộn phim ảnh Vintage 3 ô', src: '/stickers/scrapbook/scrapbook_film_strip.png' },
  { id: 'scrapbook_mushroom', cat: 'scrapbook', title: 'Nấm rừng minh hoạ cổ điển', src: '/stickers/scrapbook/scrapbook_mushroom.png' },
  { id: 'scrapbook_be_kind', cat: 'scrapbook', title: 'Trái tim Be kind xanh olive', src: '/stickers/scrapbook/scrapbook_be_kind.png' },
  { id: 'scrapbook_torn_note_time', cat: 'scrapbook', title: 'Mảnh giấy xé it\'s okay to take your time', src: '/stickers/scrapbook/scrapbook_torn_note_time.png' },
  { id: 'scrapbook_cloud_vintage', cat: 'scrapbook', title: 'Đám mây minh hoạ cổ điển', src: '/stickers/scrapbook/scrapbook_cloud_vintage.png' },
  { id: 'scrapbook_dear_diary', cat: 'scrapbook', title: 'Nhãn Dear diary', src: '/stickers/scrapbook/scrapbook_dear_diary.png' },
  { id: 'scrapbook_post_card', cat: 'scrapbook', title: 'Bưu thiếp xanh Wish you were here', src: '/stickers/scrapbook/scrapbook_post_card.png' },
  { id: 'scrapbook_camera_vintage', cat: 'scrapbook', title: 'Máy ảnh cơ 35mm Vintage', src: '/stickers/scrapbook/scrapbook_camera_vintage.png' },
  { id: 'scrapbook_sun_face', cat: 'scrapbook', title: 'Mặt trời thần thoại cổ đại', src: '/stickers/scrapbook/scrapbook_sun_face.png' },
  { id: 'scrapbook_olive_leaves', cat: 'scrapbook', title: 'Cành lá xanh mộc mạc', src: '/stickers/scrapbook/scrapbook_olive_leaves.png' },
  { id: 'scrapbook_ticket_pink', cat: 'scrapbook', title: 'Vé hồng Good things are coming', src: '/stickers/scrapbook/scrapbook_ticket_pink.png' },
  { id: 'scrapbook_ticket_admit_one', cat: 'scrapbook', title: 'Vé xi nê Admit One', src: '/stickers/scrapbook/scrapbook_ticket_admit_one.png' },
  { id: 'scrapbook_heart_pink_sketch', cat: 'scrapbook', title: 'Trái tim nét vẽ phác thảo', src: '/stickers/scrapbook/scrapbook_heart_pink_sketch.png' },
  { id: 'scrapbook_see_u_soon', cat: 'scrapbook', title: 'Badge See u soon xanh olive', src: '/stickers/scrapbook/scrapbook_see_u_soon.png' },
  { id: 'scrapbook_crescent_moon_face', cat: 'scrapbook', title: 'Trăng khuyết ngủ ngoan & ngôi sao', src: '/stickers/scrapbook/scrapbook_crescent_moon_face.png' },
  { id: 'scrapbook_gingham_tape', cat: 'scrapbook', title: 'Băng keo washi kẻ ô nâu', src: '/stickers/scrapbook/scrapbook_gingham_tape.png' },
  { id: 'scrapbook_soft_life', cat: 'scrapbook', title: 'Trái tim Soft life xanh xám', src: '/stickers/scrapbook/scrapbook_soft_life.png' },
  { id: 'scrapbook_pink_wildflowers', cat: 'scrapbook', title: 'Cành hoa dại hồng dán băng keo', src: '/stickers/scrapbook/scrapbook_pink_wildflowers.png' },
  { id: 'scrapbook_map_vintage', cat: 'scrapbook', title: 'Bản đồ cổ Let\'s get lost', src: '/stickers/scrapbook/scrapbook_map_vintage.png' },
  { id: 'scrapbook_healing_note', cat: 'scrapbook', title: 'Mảnh giấy Healing chữa lành', src: '/stickers/scrapbook/scrapbook_healing_note.png' },
  { id: 'scrapbook_today_checklist', cat: 'scrapbook', title: 'Checklist Today coffee & sunshine', src: '/stickers/scrapbook/scrapbook_today_checklist.png' },
  { id: 'scrapbook_daisy_bouquet', cat: 'scrapbook', title: 'Bó hoa cúc hoang mộc mạc', src: '/stickers/scrapbook/scrapbook_daisy_bouquet.png' },
  { id: 'scrapbook_take_care', cat: 'scrapbook', title: 'Badge Take care of yourself', src: '/stickers/scrapbook/scrapbook_take_care.png' },
  { id: 'scrapbook_ticket_collect', cat: 'scrapbook', title: 'Vé Collect beautiful things', src: '/stickers/scrapbook/scrapbook_ticket_collect.png' },
  { id: 'scrapbook_grow_through', cat: 'scrapbook', title: 'Tranh in botanical Grow through what you go through', src: '/stickers/scrapbook/scrapbook_grow_through.png' },
  { id: 'scrapbook_world_be_kind', cat: 'scrapbook', title: 'Giấy note In a world where you can be anything, be kind', src: '/stickers/scrapbook/scrapbook_world_be_kind.png' },
  { id: 'scrapbook_keep_going', cat: 'scrapbook', title: 'Huy hiệu phong cảnh Keep going', src: '/stickers/scrapbook/scrapbook_keep_going.png' }
];

let activeStickerCategory = 'cute';

function getStickerSrc(type) {
  const item = stickerList.find(s => s.id === type);
  if (item) return item.src;
  if (type.startsWith('cute_')) return `/stickers/cute/${type}.png`;
  if (type.startsWith('y2k_')) return `/stickers/y2k/${type}.png`;
  if (type.startsWith('study_')) return `/stickers/study/${type}.png`;
  if (type.startsWith('scrapbook_')) return `/stickers/scrapbook/${type}.png`;
  if (type.startsWith('classic_')) return `/stickers/classic/${type}.png`;
  return `/sticker_${type}.png`;
}

function renderStickerLibrary() {
  const filtered = activeStickerCategory === 'all' 
    ? stickerList 
    : stickerList.filter(s => s.cat === activeStickerCategory);

  const tabsHtml = stickerCategories.map(cat => {
    const count = cat.id === 'all' ? stickerList.length : stickerList.filter(s => s.cat === cat.id).length;
    const activeClass = activeStickerCategory === cat.id ? 'active' : '';
    return `<button type="button" class="cat-tab ${activeClass}" data-cat="${cat.id}">${cat.name}</button>`;
  }).join('');

  const gridHtml = filtered.map(s => `
    <button type="button" class="sticker-item" draggable="true" data-type="${s.id}" title="Kéo hoặc click để đặt ${s.title}">
      <img src="${s.src}" alt="${s.title}" class="sticker-img" />
    </button>
  `).join('');

  return `
    <div class="sticker-categories">${tabsHtml}</div>
    <div class="decorations-library">${gridHtml}</div>
  `;
}

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
  theme: 'none', decorations: [], paperOrientation: null, selectedThemeId: null,
  userElements: [], lastStep: 1, draftId: '',
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
const themeOptions = [
  { id: 'none', name: 'Không dùng theme', description: 'Giữ mẫu giấy đã chọn' },
  { id: 'cute', name: 'Cute', description: 'Hồng pastel đáng yêu' },
  { id: 'y2k', name: 'Y2K', description: 'Lấp lánh và cá tính' },
  { id: 'study', name: 'Study', description: 'Nhẹ nhàng, tập trung' },
  { id: 'scrapbook', name: 'Scrapbook', description: 'Hoài niệm và thủ công' },
];const themeDecorationPresets = {
  cute: [
    { type: 'cute_heart_pink', x: 10, y: 10, width: 18, rotation: -10 },
    { type: 'cute_bow_pink', x: 88, y: 10, width: 20, rotation: 9 },
    { type: 'cute_cherries', x: 8, y: 48, width: 17, rotation: -7 },
    { type: 'cute_cloud_blue', x: 92, y: 50, width: 19, rotation: 8 },
    { type: 'cute_envelope_love', x: 12, y: 90, width: 19, rotation: 8 },
    { type: 'cute_star_silver', x: 88, y: 90, width: 18, rotation: -9 },
  ],
  y2k: [
    { type: 'y2k_star_blue_3d', x: 10, y: 10, width: 19, rotation: -10 },
    { type: 'y2k_smiley_holographic', x: 89, y: 11, width: 19, rotation: 8 },
    { type: 'y2k_flame_blue', x: 8, y: 50, width: 18, rotation: -8 },
    { type: 'y2k_cursor', x: 92, y: 49, width: 16, rotation: 10 },
    { type: 'y2k_gamepad', x: 12, y: 90, width: 20, rotation: 8 },
    { type: 'y2k_butterfly_cyber', x: 88, y: 90, width: 19, rotation: -8 },
  ],
  study: [
    { type: 'study_book_stack', x: 11, y: 10, width: 20, rotation: -8 },
    { type: 'study_coffee_first', x: 89, y: 11, width: 18, rotation: 8 },
    { type: 'study_pencil', x: 7, y: 50, width: 18, rotation: -12 },
    { type: 'study_paperclips', x: 93, y: 49, width: 17, rotation: 10 },
    { type: 'study_plant_potted', x: 12, y: 90, width: 18, rotation: 7 },
    { type: 'study_star_face', x: 88, y: 90, width: 17, rotation: -8 },
  ],
  scrapbook: [
    { type: 'scrapbook_dried_wildflowers', x: 11, y: 11, width: 21, rotation: -9 },
    { type: 'scrapbook_stamp_mountain', x: 89, y: 11, width: 18, rotation: 8 },
    { type: 'scrapbook_film_strip', x: 8, y: 49, width: 19, rotation: -8 },
    { type: 'scrapbook_mushroom', x: 92, y: 50, width: 17, rotation: 8 },
    { type: 'scrapbook_olive_leaves', x: 12, y: 89, width: 21, rotation: 9 },
    { type: 'scrapbook_ticket_pink', x: 88, y: 90, width: 20, rotation: -8 },
  ],
};
const EDITOR_DRAFT_STORAGE_KEY = 'postdrop-letter-editor-draft';

function createDraftId() {
  return globalThis.crypto?.randomUUID?.() || `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem('postdrop-draft') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const storedDraft = readStoredDraft();
let draft = {
  ...defaultDraft,
  ...storedDraft,
  decorations: Array.isArray(storedDraft.decorations) ? storedDraft.decorations : [],
  userElements: Array.isArray(storedDraft.userElements) ? storedDraft.userElements : [],
  draftId: typeof storedDraft.draftId === 'string' && storedDraft.draftId ? storedDraft.draftId : createDraftId(),
};

const legacyDraftHasContent = Boolean(
  String(storedDraft.title || '').trim() ||
  String(storedDraft.content || '').trim() ||
  (Array.isArray(storedDraft.decorations) && storedDraft.decorations.length),
);
if (!Object.prototype.hasOwnProperty.call(storedDraft, 'paperOrientation') && legacyDraftHasContent) {
  draft.paperOrientation = 'portrait';
}
if (draft.paperOrientation === 'portrait' || draft.paperOrientation === 'landscape') {
  const legacyTheme = typeof storedDraft.theme === 'string' ? storedDraft.theme : 'none';
  draft.selectedThemeId =
    typeof storedDraft.selectedThemeId === 'string'
      ? storedDraft.selectedThemeId
      : `${legacyTheme}-${draft.paperOrientation}`;
}
let currentLetter = null;
let saveTimer;
const DECORATION_BASE_SIZE = 64;
const DECORATION_MIN_SCALE = 0.4;
const DECORATION_MAX_SCALE = 3;
const DECORATION_SCALE_STEP = 0.15;
const DECORATION_ROTATION_STEP = 15;
let selectedDecorationId = null;

function clampDecorationScale(value) {
  return Math.min(DECORATION_MAX_SCALE, Math.max(DECORATION_MIN_SCALE, value));
}

function roundedDecorationScale(value) {
  return Math.round(clampDecorationScale(value) * 100) / 100;
}

function normalizeDecorationRotation(value) {
  const normalized = ((Number(value) || 0) % 360 + 360) % 360;
  const rounded = Math.round(normalized * 100) / 100;
  return rounded === 360 ? 0 : rounded;
}

function flushPersistDraft() {
  clearTimeout(saveTimer);
  draft.updatedAt = new Date().toISOString();
  localStorage.setItem('postdrop-draft', JSON.stringify(draft));
  const state = document.querySelector('.save-state');
  if (state) {
    state.textContent = 'Đã lưu bản nháp';
    state.classList.remove('saving');
  }
}

function persistDraft() {
  const state = document.querySelector('.save-state');
  if (state) {
    state.textContent = 'Đang lưu…';
    state.classList.add('saving');
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushPersistDraft, 500);
}

function hasMeaningfulDraft() {
  return Boolean(
    draft.paperOrientation ||
    String(draft.title || '').trim() ||
    String(draft.content || '').trim() ||
    (Array.isArray(draft.userElements) && draft.userElements.length) ||
    (Array.isArray(draft.decorations) && draft.decorations.length) ||
    String(draft.recipientName || '').trim() ||
    Number(draft.lastStep || 1) > 1,
  );
}

function resetDraft(letterType = 'online') {
  const previousDraftId = draft.draftId;
  clearTimeout(saveTimer);
  localStorage.removeItem('postdrop-draft');
  localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
  draft = {
    ...defaultDraft,
    letterType,
    deliveryDate: futureDate(),
    decorations: [],
    userElements: [],
    draftId: createDraftId(),
  };
  flushPersistDraft();
  window.dispatchEvent(
    new CustomEvent('postdrop-draft-reset', {
      detail: { previousDraftId, draftId: draft.draftId },
    }),
  );
}

function toast(message, type = '') {
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  toastRegion.appendChild(element);
  setTimeout(() => element.remove(), 3500);
}

window.addEventListener('postdrop-editor-change', (event) => {
  const next = event.detail || {};
  if (next.draftId && next.draftId !== draft.draftId) return;
  if (typeof next.letterContent === 'string') draft.content = next.letterContent;
  if (typeof next.letterTitle === 'string') draft.title = next.letterTitle;
  if (next.letterFont === 'serif' || next.letterFont === 'modern' || next.letterFont === 'hand') {
    draft.font = next.letterFont;
  }
  if (next.paperOrientation === 'portrait' || next.paperOrientation === 'landscape') {
    draft.paperOrientation = next.paperOrientation;
  }
  if (typeof next.selectedThemeId === 'string' || next.selectedThemeId === null) {
    draft.selectedThemeId = next.selectedThemeId;
    if (next.selectedThemeId) draft.theme = next.selectedThemeId;
  }
  if (Array.isArray(next.userElements)) draft.userElements = next.userElements;
  persistDraft();
});

window.addEventListener('postdrop-paper-orientation-selected', (event) => {
  const next = event.detail || {};
  if (next.draftId && next.draftId !== draft.draftId) return;
  if (next.paperOrientation !== 'portrait' && next.paperOrientation !== 'landscape') return;
  draft.paperOrientation = next.paperOrientation;
  draft.selectedThemeId =
    typeof next.selectedThemeId === 'string' ? next.selectedThemeId : `none-${next.paperOrientation}`;
  draft.theme = draft.selectedThemeId;
  draft.lastStep = 3;
  flushPersistDraft();
  location.hash = '/create/3';
});

window.addEventListener('pagehide', flushPersistDraft);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPersistDraft();
});

window.addEventListener('postdrop-editor-saved', () => {
  const state = document.querySelector('.save-state');
  if (state) {
    state.textContent = 'Đã lưu bản nháp';
    state.classList.remove('saving');
  }
});

window.addEventListener('postdrop-editor-toast', (event) => {
  const detail = event.detail || {};
  if (detail.message && detail.type === 'error') toast(detail.message, 'error');
});

function openModal({ title, message, confirm = 'Xác nhận', onConfirm }) {
  modalRoot.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal"><h2 id="modal-title">${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><div class="modal-actions"><button class="button button-ghost" data-modal-close>Quay lại</button><button class="button button-primary" data-modal-confirm>${escapeHtml(confirm)}</button></div></div></div>`;
  modalRoot.querySelector('[data-modal-close]').onclick = () => { modalRoot.innerHTML = ''; };
  modalRoot.querySelector('[data-modal-confirm]').onclick = () => { modalRoot.innerHTML = ''; onConfirm?.(); };
}

function brand() { return `<a class="brand" href="#/" aria-label="PostDrop — Trang chủ"><span class="brand-mark"></span><span>PostDrop</span></a>`; }
function button(label, route, kind = 'primary', iconName = '') { return `<a class="button button-${kind}" href="#${route}">${label}${iconName ? icon(iconName) : ''}</a>`; }

function siteHeader() {
  return `<header class="site-header"><div class="container nav">${brand()}<nav class="nav-links" aria-label="Điều hướng chính"><a href="#/" data-scroll="how">Cách hoạt động</a><a href="#/" data-scroll="services">Mẫu thư</a><a href="#/" data-scroll="pricing">Bảng giá</a><a href="#/" data-scroll="trust">Dành cho tổ chức</a></nav><div class="nav-actions"><a class="text-button" href="#/login">Đăng nhập</a>${button('Viết thư ngay', '/create/1?new=1')}<button class="menu-toggle" aria-label="Mở menu">${icon('menu')}</button></div></div></header>`;
}

function appHeader() {
  return `<header class="app-header"><div class="container app-header-inner">${brand()}<div class="app-header-actions"><a class="button button-primary" href="#/create/1?new=1">${icon('plus')}Tạo lá thư mới</a><button class="icon-button" aria-label="Thông báo">${icon('bell')}</button><a class="avatar" href="#/dashboard" aria-label="Tài khoản Minh Anh">MA</a></div></div></header>`;
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
    <section class="hero hero-invitation"><div class="invitation-frame" aria-hidden="true"><span class="frame-corner frame-corner-tl"></span><span class="frame-corner frame-corner-tr"></span><span class="frame-corner frame-corner-bl"></span><span class="frame-corner frame-corner-br"></span></div>${heroFlorals()}${landingPlane()}<div class="hero-content"><div class="invitation-monogram" aria-hidden="true"><span>P</span></div><span class="eyebrow">POSTDROP · THƯ GỬI ĐẾN TƯƠNG LAI</span><h1 class="hero-handwritten"><span>Một lá thư từ chính bạn</span><span>của những năm trước.</span></h1><div class="hero-floral-divider" aria-hidden="true"><span></span><i></i><span></span></div><p>Viết hôm nay, PostDrop sẽ lưu giữ và gửi lá thư đến đúng ngày bạn lựa chọn.</p><div class="hero-actions">${button('Viết thư cho tương lai', '/create/1?new=1', 'primary', 'arrowRight')}${button('Gửi thư viết tay', '/create/1?type=handwritten&new=1', 'secondary')}${hasMeaningfulDraft() ? button('Tiếp tục bản nháp', '/create/resume', 'secondary', 'arrowRight') : ''}</div></div></section>
    <section class="letter-section" id="how"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 01</span><h2>Cách PostDrop hoạt động</h2><p>Một nghi thức nhỏ hôm nay, một cuộc gặp gỡ đặc biệt trong tương lai.</p></div><div class="journey">${journeyStep('pen','Viết thư','Dành vài phút để viết điều bạn muốn nhớ.')}${journeyStep('seal','Niêm phong','Xác nhận nội dung và chọn ngày gặp lại.')}${journeyStep('archive','Lưu giữ','Chúng tôi bảo quản an toàn suốt hành trình.')}${journeyStep('truck','Giao đúng hẹn','Lá thư đến tay vào đúng ngày đã chọn.')}</div></div></section>
    <section class="letter-section" id="services"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 02</span><h2>Chọn cách bạn muốn gửi</h2><p>Dù là những dòng chữ trên màn hình hay nét mực trên giấy, cảm xúc vẫn được giữ nguyên vẹn.</p></div><div class="service-grid"><a href="#/create/1?new=1" class="service-card"><div class="service-art"><div class="paper-stack"></div></div><span class="eyebrow">TRỰC TUYẾN</span><h3>Viết thư trực tuyến</h3><p>Soạn thư trong không gian yên tĩnh, chọn giấy và phong bì, chúng tôi sẽ làm phần còn lại.</p><div class="service-meta"><span>5–10 phút</span><span>Từ 29.000đ</span></div></a><a href="#/create/1?type=handwritten&new=1" class="service-card"><div class="service-art"><div class="mailbox"></div></div><span class="eyebrow">VIẾT TAY</span><h3>Gửi thư viết tay</h3><p>Gửi lá thư thật đến PostDrop. Chúng tôi số hóa, bảo quản và giao lại đúng hẹn.</p><div class="service-meta"><span>3–5 ngày gửi đến</span><span>Từ 119.000đ</span></div></a></div></div></section>
    <section class="letter-section"><div class="container"><div class="section-head"><span class="chapter">NHỮNG DỊP ĐỂ NHỚ</span><h2>Đánh dấu điều quan trọng</h2></div><div class="occasion-row"><span class="occasion">Sinh nhật</span><span class="occasion">Tốt nghiệp</span><span class="occasion">Kỷ niệm</span><span class="occasion">Năm mới</span><span class="occasion">Cột mốc sự nghiệp</span></div></div></section>
    <section class="letter-section" id="trust"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 03</span><h2>Một lời hứa được gìn giữ</h2><p>Niềm tin của bạn được bảo vệ bằng những lớp an toàn rõ ràng, từ hôm nay đến ngày giao.</p></div><div class="trust-grid">${trustItem('database','Số hóa dự phòng','Bản sao được mã hóa và lưu tách biệt để phòng sự cố.')}${trustItem('shield','Bảo quản an toàn','Thư vật lý được lưu tại môi trường kiểm soát độ ẩm.')}${trustItem('map','Xác minh địa chỉ','Chúng tôi nhắc bạn xác nhận địa chỉ trước ngày giao 30 ngày.')}${trustItem('truck','Theo dõi hành trình','Mọi cột mốc quan trọng đều được cập nhật rõ ràng.')}</div></div></section>
    <section class="letter-section" id="pricing"><div class="container"><div class="section-head"><span class="chapter">CHƯƠNG 04</span><h2>Một mức giá cho mỗi cách gửi</h2><p>Thanh toán một lần. Không có phí ẩn trong suốt thời gian lưu giữ.</p></div><div class="pricing-grid">${priceCard('Email','29.000đ',['Gửi qua email đúng hẹn','Lưu giữ đến 5 năm','1 lần nhắc xác nhận'])}${priceCard('Physical','119.000đ',['In trên giấy cao cấp','Phong bì và niêm phong','Theo dõi giao hàng'])}${priceCard('Hybrid','149.000đ',['Bao gồm Email + Physical','Bản số hóa dự phòng','Ưu tiên hỗ trợ'],true)}</div></div></section>
    <section class="letter-section"><div class="container"><div class="quote-card"><blockquote>“Tôi đã quên mình từng lo lắng nhiều đến thế. Lá thư ấy giống như một cái ôm đến muộn, nhưng đúng lúc.”</blockquote><cite>Hà My · Nhận thư sau 3 năm</cite></div></div></section>
    <section class="letter-section"><div class="container"><div class="section-head"><span class="chapter">NHỮNG ĐIỀU BẠN CÓ THỂ HỎI</span><h2>Câu hỏi thường gặp</h2></div><div class="faq-list">${faq('Nội dung lá thư có được bảo mật không?','Có. Nội dung được mã hóa khi lưu trữ. Sau khi niêm phong, ngay cả bạn cũng không thể mở lại trước ngày đã chọn.')}${faq('Tôi có thể đổi địa chỉ nhận thư không?','Có. PostDrop sẽ chủ động nhắc bạn xác nhận hoặc cập nhật địa chỉ trước ngày giao 30 ngày.')}${faq('Nếu tôi đổi email hoặc số điện thoại thì sao?','Bạn có thể cập nhật thông tin liên hệ bất kỳ lúc nào trong trang chi tiết lá thư.')}${faq('Tôi có thể hủy sau khi niêm phong không?','Bạn có thể liên hệ hỗ trợ để hủy lịch giao. Nội dung đã niêm phong vẫn không thể chỉnh sửa.')}</div></div></section>
    <section class="final-cta"><span class="eyebrow">PHẦN KẾT</span><h2>Bạn muốn gửi điều gì cho mình trong tương lai?</h2><p>Có những điều chỉ thời gian mới giúp chúng ta hiểu được.</p>${button('Viết lá thư của tôi', '/create/1?new=1', 'primary', 'arrowRight')}<div class="final-seal" aria-hidden="true">P</div></section>
  </main>${footer()}</div>`;
  bindLanding();
}

function priceCard(name, price, features, featured = false) { return `<article class="price-card ${featured ? 'featured' : ''}">${featured ? '<span class="mini-stamp">ĐƯỢC YÊU THÍCH</span>' : ''}<span class="eyebrow">GÓI ${name.toUpperCase()}</span><div class="price">${price} <small>/ lá thư</small></div><ul class="feature-list">${features.map((item) => `<li>${item}</li>`).join('')}</ul>${button(`Chọn gói ${name}`, '/create/1?new=1', featured ? 'primary' : 'secondary')}</article>`; }
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
  steps[1] = 'Lo\u1ea1i gi\u1ea5y';
  steps[2] = 'Vi\u1ebft & thi\u1ebft k\u1ebf';
  if (location.hash.includes('type=handwritten')) draft.letterType = 'handwritten';
  if (step >= 3 && draft.paperOrientation !== 'portrait' && draft.paperOrientation !== 'landscape') {
    location.hash = '/create/2';
    return;
  }
  draft.lastStep = Math.max(Number(draft.lastStep || 1), step);
  persistDraft();
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="container builder-wrap"><div class="builder-head"><div><span class="eyebrow">BƯỚC ${step} / 5 — ${steps[step - 1].toUpperCase()}</span><h1>${stepTitle(step)}</h1><p>${stepDescription(step)}</p></div><span class="save-state">Đã lưu bản nháp</span></div>${stepper(step)}<div id="builder-content">${renderStep(step)}</div></main></div>`;
  bindBuilder(step);
}

function stepTitle(step) { return ['Bạn muốn gửi lá thư theo cách nào?','Bạn muốn viết thư với loại giấy nào?','Viết điều bạn muốn gặp lại','Lá thư sẽ tìm đến ai?','Kiểm tra trước khi niêm phong'][step - 1]; }
function stepDescription(step) { return ['Chọn một cách phù hợp. Bạn vẫn có thể thay đổi ở bước sau.','Bạn vẫn có thể đổi loại giấy sau trong trình chỉnh sửa.','Viết trực tiếp trên trang thư rồi chọn theme và trang trí theo cách của bạn.','Thông tin này giúp PostDrop giao lá thư đúng người, đúng ngày.','Sau khi niêm phong, nội dung sẽ không thể chỉnh sửa.'][step - 1]; }

function renderSwatches(group, options) {
  return options.map(([value, colorClass, label]) => swatch(group, value, colorClass, label)).join('');
}

function renderThemePicker() {
  return `<div class="theme-picker">${themeOptions.map((theme) => {
    const selected = draft.theme === theme.id;
    return `<button type="button" class="theme-card theme-card-${theme.id} ${selected ? 'selected' : ''}" data-option="theme" data-value="${theme.id}" aria-pressed="${selected}">
      <span class="theme-card-preview" aria-hidden="true">${theme.id === 'none' ? '<span class="theme-empty-mark">Aa</span>' : ''}</span>
      <span class="theme-card-copy"><strong>${theme.name}</strong><small>${theme.description}</small></span>
      <span class="theme-card-check" aria-hidden="true">&#10003;</span>
    </button>`;
  }).join('')}</div>`;
}
function renderPaperOrientationStep() {
  return `<div class="paper-orientation-step">
    <div id="paper-orientation-root" data-draft-id="${escapeHtml(draft.draftId)}" aria-live="polite">
      <div class="skeleton" aria-label="Loading paper options"></div>
    </div>
    <div class="builder-actions paper-orientation-actions">
      <span></span>
      <button class="button button-secondary" data-back>${icon('arrowLeft')}Quay l\u1ea1i</button>
    </div>
  </div>`;
}

function renderDesignStep() {
  return `<div class="letter-editor-step">
    <section class="design-basics-bar" aria-label="Tùy chọn mẫu giấy và màu phong bì">
      <div class="field"><label>Mẫu giấy · 8 lựa chọn</label><div class="swatches design-swatches">${renderSwatches('paper', paperOptions)}</div></div>
      <div class="field"><label>Màu phong bì · 9 lựa chọn</label><div class="swatches design-swatches">${renderSwatches('envelope', envelopeOptions)}</div></div>
    </section>
    <div id="letter-editor-root" data-editor-instance="${escapeHtml(draft.draftId)}-${draft.paperOrientation}" aria-live="polite"></div>
  </div>${builderActions(3)}`;
}

function renderStep(step) {
  if (step === 2) return renderPaperOrientationStep();
  if (step === 3) return renderDesignStep();
  if (step === 1) return `<div class="panel"><div class="choice-grid">${typeCard('online','pen','Viết thư trực tuyến','Soạn thư ngay trên PostDrop, chọn thiết kế và chúng tôi sẽ in hoặc gửi email.','5–10 phút','Từ 29.000đ')}${typeCard('handwritten','mail','Gửi thư viết tay','Bạn viết trên giấy và gửi đến PostDrop. Chúng tôi số hóa rồi bảo quản nguyên bản.','3–5 ngày','Từ 119.000đ')}</div>${builderActions(step)}</div>`;
  if (step === 2) return renderPaperOrientationStep();
  if (step === 4) return `<div class="workspace"><section class="panel"><h2>Thông tin người nhận</h2><div class="field"><label>Gửi lá thư này cho</label><div class="segmented">${segment('recipientMode','self','Chính tôi')}${segment('recipientMode','other','Người khác')}</div></div><div class="field-row">${field('recipientName','Họ tên người nhận',draft.recipientName,'Nguyễn Minh Anh')}${field('recipientEmail','Email',draft.recipientEmail,'minhanh@example.com','email')}</div><div class="field-row">${field('recipientPhone','Số điện thoại',draft.recipientPhone,'0901 234 567','tel')}${field('deliveryDate','Ngày dự kiến giao',draft.deliveryDate,'','date')}</div><div id="date-message" class="date-message">${dateMessage()}</div><div class="field"><label>Hình thức nhận</label><div class="segmented">${segment('deliveryMethod','email','Email')}${segment('deliveryMethod','physical','Thư vật lý')}${segment('deliveryMethod','hybrid','Cả hai')}</div></div><div class="field" id="address-field"><label for="address">Địa chỉ nhận</label><input id="address" data-draft="address" value="${escapeHtml(draft.address)}" placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành"/><div class="field-error" data-error="address"></div></div><div class="field"><label for="note">Ghi chú giao hàng <span style="font-weight:400;color:var(--muted)">(không bắt buộc)</span></label><textarea id="note" data-draft="note" style="min-height:95px" placeholder="Ví dụ: Gọi trước khi giao">${escapeHtml(draft.note)}</textarea></div></section><aside class="panel"><h2>Ngày gặp lại</h2><p class="panel-intro">Ngày bạn chọn sẽ trở thành một cột mốc. PostDrop sẽ đồng hành để lá thư không bị lạc đường.</p><div class="mini-envelope" style="width:100%;height:185px;aspect-ratio:auto"><span>${draft.deliveryDate ? formatDate(draft.deliveryDate) : 'Chưa chọn ngày'}</span></div><div class="info-note" style="margin-top:24px">${icon('info')}<span>PostDrop sẽ gửi yêu cầu xác nhận địa chỉ trước ngày giao 30 ngày.</span></div></aside></div>${builderActions(step)}`;
  return `<div class="workspace"><section class="panel"><h2>Tóm tắt lá thư</h2><div class="envelope-preview" style="height:190px"><div class="mini-envelope" style="background:${envelopeColor()}"><span>${escapeHtml(draft.title || 'Lá thư của tôi')}</span></div></div><div class="summary-list">${summaryRow('Tiêu đề',draft.title || 'Chưa đặt tên')}${summaryRow('Người nhận',draft.recipientName || 'Chưa điền')}${summaryRow('Ngày gửi',draft.deliveryDate ? formatDate(draft.deliveryDate) : 'Chưa chọn')}${summaryRow('Hình thức',deliveryLabel())}${summaryRow('Mẫu phong bì',labelize(draft.envelope))}</div><div class="sealed-message">${icon('seal')} <strong>Nội dung sắp được niêm phong.</strong><br/>Bạn sẽ gặp lại những dòng chữ này vào đúng ngày đã chọn.</div></section><aside class="panel"><h2>Chi tiết thanh toán</h2><p class="panel-intro">Thanh toán một lần cho toàn bộ hành trình.</p><div class="summary-list">${summaryRow('Phí in',draft.deliveryMethod === 'email' ? '0đ' : '35.000đ')}${summaryRow('Phí lưu giữ','45.000đ')}${summaryRow('Phí giao hàng',draft.deliveryMethod === 'email' ? '0đ' : '39.000đ')}<div class="summary-row total-row"><span>Tổng thanh toán</span><strong>${totalPrice()}</strong></div></div><label class="seal-check"><input id="seal-confirm" type="checkbox"/><span>Tôi hiểu rằng sau khi niêm phong, nội dung lá thư sẽ không thể chỉnh sửa.</span></label><div class="field-error" data-error="seal"></div>${builderActions(step, true)}</aside></div>`;
}

function typeCard(type, iconName, title, description, time, price) { const selected = draft.letterType === type; return `<button class="choice-card ${selected ? 'selected' : ''}" data-type="${type}" aria-pressed="${selected}"><span class="choice-check">${selected ? '✓' : ''}</span><div class="choice-visual">${icon(iconName)}</div><h3>${title}</h3><p>${description}</p><div class="service-meta"><span>${time}</span><span>${price}</span></div></button>`; }
function field(key, label, value, placeholder, type = 'text') { return `<div class="field"><label for="${key}">${label}</label><input id="${key}" type="${type}" data-draft="${key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${type === 'date' ? `min="${new Date().toISOString().slice(0,10)}"` : ''}/><div class="field-error" data-error="${key}"></div></div>`; }
function swatch(group, value, colorClass, label) {
  const selected = draft[group] === value;
  return `<button class="swatch ${colorClass} ${selected ? 'selected' : ''}" data-option="${group}" data-value="${value}" aria-label="${label}" aria-pressed="${selected}" title="${label}"><span class="swatch-color" aria-hidden="true"></span></button>`;
}
function segment(group, value, label) { return `<button class="segment ${draft[group] === value ? 'selected' : ''}" data-option="${group}" data-value="${value}" type="button">${label}</button>`; }
function letterPreview() {
  const selectedTheme = themeOptions.some((theme) => theme.id === draft.theme) ? draft.theme : 'none';
  const hasTheme = selectedTheme !== 'none';
  const themeDecorations = (themeDecorationPresets[selectedTheme] || []).map((decoration) => `<img class="theme-decoration" src="${getStickerSrc(decoration.type)}" alt="" aria-hidden="true" style="--theme-x: ${decoration.x}%; --theme-y: ${decoration.y}%; --theme-width: ${decoration.width}%; --theme-rotation: ${decoration.rotation}deg;" />`).join('');  const content = (draft.content || 'Những dòng chữ của bạn sẽ xuất hiện ở đây, như một lời nhắn đang chờ thời gian mang đi…').normalize('NFC');
  const decos = (draft.decorations || []).map((deco) => {
    const type = deco.type === 'sparkles' ? 'postmark' : deco.type;
    const scale = roundedDecorationScale(deco.scale || 1);
    const rotation = normalizeDecorationRotation(deco.rotation || 0);
    const size = DECORATION_BASE_SIZE * scale;
    const selected = deco.id === selectedDecorationId;
    return `<div class="placed-decoration sticker-${type}${selected ? ' is-selected' : ''}" style="left: ${deco.x}%; top: ${deco.y}%; width: ${size}px; height: ${size}px; --deco-rotation: ${rotation}deg; --deco-counter-rotation: ${-rotation}deg;" draggable="true" tabindex="0" role="group" aria-label="Sticker ${escapeHtml(type)}, ${Math.round(scale * 100)}%, xoay ${rotation} độ" data-id="${deco.id}">
      <img src="${getStickerSrc(type)}" alt="${type}" class="placed-sticker-img" />
      <div class="sticker-controls" role="toolbar" aria-label="Điều chỉnh kích thước sticker">
        <button type="button" class="scale-btn scale-down" data-scale="down" data-scale-id="${deco.id}" aria-label="Thu nhỏ sticker" title="Thu nhỏ">−</button>
        <output class="scale-value" aria-live="polite">${Math.round(scale * 100)}%</output>
        <button type="button" class="scale-btn scale-up" data-scale="up" data-scale-id="${deco.id}" aria-label="Phóng to sticker" title="Phóng to">+</button>
        <button type="button" class="remove-deco" data-remove-id="${deco.id}" aria-label="Xóa sticker" title="Xóa">&times;</button>
      </div>
      ${['nw', 'ne', 'sw', 'se'].map((corner) => `<button type="button" class="resize-handle resize-handle-${corner}" data-resize-id="${deco.id}" data-resize-corner="${corner}" aria-label="Thay đổi kích thước sticker từ góc ${corner}" title="Kéo để phóng to / thu nhỏ"></button>`).join('')}
      <button type="button" class="rotate-handle" data-rotate-handle-id="${deco.id}" aria-label="Kéo để xoay sticker" title="Kéo để xoay · Giữ Shift để bắt góc 15 độ"><span aria-hidden="true">↻</span></button>
    </div>`;
  }).join('');
  return `<div class="preview-stage-wrap">
    <div class="preview-stage-head">
      <span>Khung xem trước</span>
      <small>Kéo thả, phóng to / thu nhỏ và xoay sticker trực tiếp trên mặt giấy</small>
    </div>
    <div class="letter-preview paper-${draft.paper} font-${draft.font}${hasTheme ? ` has-theme theme-${selectedTheme}` : ''}">
      ${hasTheme ? '<div class="letter-theme-surface" aria-hidden="true"></div>' : ''}
      ${hasTheme ? `<div class="theme-decoration-layer" aria-hidden="true">${themeDecorations}</div>` : ''}
      <div class="letter-content">
      <h3>${escapeHtml((draft.title || 'Lá thư của tôi').normalize('NFC'))}</h3>
      <div class="preview-body">${escapeHtml(content)}</div>
      </div>
      ${decos}
    </div>
  </div>`;
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
  document.querySelectorAll('[data-option]').forEach((control) => control.onclick = () => {
    const group = control.dataset.option;
    draft[group] = control.dataset.value;
    persistDraft();
    if (step === 3) {
      document.querySelectorAll(`[data-option="${group}"]`).forEach((item) => {
        const selected = item.dataset.value === control.dataset.value;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      return;
    }
    renderBuilder(step);
  });
  document.querySelector('[data-back]')?.addEventListener('click', () => {
    flushPersistDraft();
    location.hash = `/create/${step - 1}`;
  });
  document.querySelector('[data-next]')?.addEventListener('click', () => nextStep(step));
  document.querySelector('[data-save-later]')?.addEventListener('click', () => { flushPersistDraft(); toast('Bản nháp đã được lưu. Bạn có thể quay lại bất cứ lúc nào.', 'success'); setTimeout(() => location.hash = '/dashboard', 700); });
  document.querySelector('[data-upload]')?.addEventListener('click', () => toast('Ảnh sẽ được tối ưu và đính kèm vào lá thư (bản prototype).'));

  if (step === 3) {
    const previewPanel = document.querySelector('.preview-panel');
    
    // 1. Sticker library category tabs & item events
    function bindStickerEvents() {
      document.querySelectorAll('.sticker-categories .cat-tab').forEach((tab) => {
        tab.onclick = () => {
          activeStickerCategory = tab.dataset.cat;
          const container = document.querySelector('.sticker-library-wrapper');
          if (container) {
            container.innerHTML = renderStickerLibrary();
            bindStickerEvents();
          }
        };
      });

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
            y: 50,
            scale: 1,
            rotation: 0
          };
          draft.decorations.push(newDeco);
          selectedDecorationId = newDeco.id;
          persistDraft();
          updatePreview();
        });
      });
    }
    bindStickerEvents();

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
            y: clampedY,
            scale: 1,
            rotation: 0
          };
          draft.decorations.push(newDeco);
          selectedDecorationId = newDeco.id;
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
        const scaleBtn = e.target.closest('[data-scale-id]');
        if (scaleBtn) {
          e.stopPropagation();
          const id = scaleBtn.dataset.scaleId;
          const action = scaleBtn.dataset.scale;
          const deco = (draft.decorations || []).find(d => d.id === id);
          if (deco) {
            const direction = action === 'up' ? 1 : -1;
            deco.scale = roundedDecorationScale((deco.scale || 1) + (direction * DECORATION_SCALE_STEP));
            selectedDecorationId = id;
            persistDraft();
            updatePreview();
          }
          return;
        }

        const removeBtn = e.target.closest('.remove-deco');
        if (removeBtn) {
          e.stopPropagation();
          const id = removeBtn.dataset.removeId;
          draft.decorations = (draft.decorations || []).filter((d) => d.id !== id);
          if (selectedDecorationId === id) selectedDecorationId = null;
          persistDraft();
          updatePreview();
          return;
        }

        const decoration = e.target.closest('.placed-decoration');
        if (decoration) {
          selectedDecorationId = decoration.dataset.id;
          previewPanel.querySelectorAll('.placed-decoration').forEach((item) => {
            item.classList.toggle('is-selected', item === decoration);
          });
        } else if (e.target.closest('.letter-preview')) {
          selectedDecorationId = null;
          previewPanel.querySelectorAll('.placed-decoration').forEach((item) => item.classList.remove('is-selected'));
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
    decoEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.sticker-controls, .resize-handle, .rotate-handle')) return;
      selectedDecorationId = decoEl.dataset.id;
      document.querySelectorAll('.letter-preview .placed-decoration').forEach((item) => {
        item.classList.toggle('is-selected', item === decoEl);
      });
    });

    decoEl.addEventListener('dragstart', (e) => {
      selectedDecorationId = decoEl.dataset.id;
      e.dataTransfer.setData('text/plain', 'move:' + decoEl.dataset.id);
    });

    decoEl.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const id = decoEl.dataset.id;
      const deco = (draft.decorations || []).find(d => d.id === id);
      if (deco) {
        const direction = e.deltaY < 0 ? 1 : -1;
        deco.scale = roundedDecorationScale((deco.scale || 1) + (direction * 0.1));
        selectedDecorationId = id;
        persistDraft();
        updatePreview();
      }
    }, { passive: false });

    decoEl.addEventListener('keydown', (e) => {
      const id = decoEl.dataset.id;
      const deco = (draft.decorations || []).find(d => d.id === id);
      if (!deco) return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        deco.scale = roundedDecorationScale((deco.scale || 1) + DECORATION_SCALE_STEP);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        deco.scale = roundedDecorationScale((deco.scale || 1) - DECORATION_SCALE_STEP);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const direction = e.shiftKey ? -1 : 1;
        deco.rotation = normalizeDecorationRotation((deco.rotation || 0) + (direction * DECORATION_ROTATION_STEP));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        draft.decorations = (draft.decorations || []).filter((item) => item.id !== id);
        selectedDecorationId = null;
      } else if (e.key === 'Escape') {
        selectedDecorationId = null;
      } else {
        return;
      }
      persistDraft();
      updatePreview();
    });

    decoEl.querySelectorAll('.resize-handle').forEach((handle) => {
      handle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const id = handle.dataset.resizeId;
        const deco = (draft.decorations || []).find(d => d.id === id);
        if (!deco) return;
        const preview = decoEl.closest('.letter-preview');
        if (!preview) return;

        selectedDecorationId = id;
        decoEl.classList.add('is-selected', 'is-resizing');
        decoEl.setAttribute('draggable', 'false');

        const previewRect = preview.getBoundingClientRect();
        const startSize = DECORATION_BASE_SIZE * roundedDecorationScale(deco.scale || 1);
        const startCenterX = previewRect.left + ((deco.x || 0) / 100) * previewRect.width;
        const startCenterY = previewRect.top + ((deco.y || 0) / 100) * previewRect.height;
        const corner = handle.dataset.resizeCorner;
        const cornerX = corner.includes('w') ? -1 : 1;
        const cornerY = corner.includes('n') ? -1 : 1;
        const rotationRadians = normalizeDecorationRotation(deco.rotation || 0) * Math.PI / 180;
        const cosine = Math.cos(rotationRadians);
        const sine = Math.sin(rotationRadians);
        const localXAxisX = cosine;
        const localXAxisY = sine;
        const localYAxisX = -sine;
        const localYAxisY = cosine;
        const diagonalX = (cornerX * localXAxisX) + (cornerY * localYAxisX);
        const diagonalY = (cornerX * localXAxisY) + (cornerY * localYAxisY);
        const anchorX = startCenterX - (diagonalX * startSize / 2);
        const anchorY = startCenterY - (diagonalY * startSize / 2);

        const onPointerMove = (moveEvt) => {
          const vectorX = moveEvt.clientX - anchorX;
          const vectorY = moveEvt.clientY - anchorY;
          const requestedSize = ((vectorX * diagonalX) + (vectorY * diagonalY)) / 2;
          const minSize = DECORATION_BASE_SIZE * DECORATION_MIN_SCALE;
          const maxSize = DECORATION_BASE_SIZE * DECORATION_MAX_SCALE;
          const newSize = Math.min(maxSize, Math.max(minSize, requestedSize));
          const halfSize = newSize / 2;
          const requestedCenterX = anchorX + (diagonalX * halfSize);
          const requestedCenterY = anchorY + (diagonalY * halfSize);
          const rotatedExtent = halfSize * (Math.abs(cosine) + Math.abs(sine));
          const centerX = Math.min(previewRect.right - rotatedExtent, Math.max(previewRect.left + rotatedExtent, requestedCenterX));
          const centerY = Math.min(previewRect.bottom - rotatedExtent, Math.max(previewRect.top + rotatedExtent, requestedCenterY));

          deco.scale = roundedDecorationScale(newSize / DECORATION_BASE_SIZE);
          deco.x = Math.round(((centerX - previewRect.left) / previewRect.width) * 10000) / 100;
          deco.y = Math.round(((centerY - previewRect.top) / previewRect.height) * 10000) / 100;

          decoEl.style.width = `${DECORATION_BASE_SIZE * deco.scale}px`;
          decoEl.style.height = `${DECORATION_BASE_SIZE * deco.scale}px`;
          decoEl.style.left = `${deco.x}%`;
          decoEl.style.top = `${deco.y}%`;
          decoEl.querySelector('.scale-value').textContent = `${Math.round(deco.scale * 100)}%`;
          decoEl.setAttribute('aria-label', `Sticker ${deco.type}, ${Math.round(deco.scale * 100)}%, xoay ${normalizeDecorationRotation(deco.rotation || 0)} do`);
        };

        const onPointerUp = () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);
          decoEl.classList.remove('is-resizing');
          decoEl.setAttribute('draggable', 'true');
          persistDraft();
          updatePreview();
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      });
    });

    const rotateHandle = decoEl.querySelector('.rotate-handle');
    if (rotateHandle) {
      rotateHandle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const id = rotateHandle.dataset.rotateHandleId;
        const deco = (draft.decorations || []).find((item) => item.id === id);
        if (!deco) return;
        const preview = decoEl.closest('.letter-preview');
        if (!preview) return;
        const previewRect = preview.getBoundingClientRect();
        const centerX = previewRect.left + ((deco.x || 0) / 100) * previewRect.width;
        const centerY = previewRect.top + ((deco.y || 0) / 100) * previewRect.height;
        const startPointerAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = normalizeDecorationRotation(deco.rotation || 0);

        selectedDecorationId = id;
        decoEl.classList.add('is-selected', 'is-rotating');
        decoEl.setAttribute('draggable', 'false');

        const onPointerMove = (moveEvt) => {
          const currentAngle = Math.atan2(moveEvt.clientY - centerY, moveEvt.clientX - centerX);
          const deltaDegrees = (currentAngle - startPointerAngle) * 180 / Math.PI;
          const rawRotation = startRotation + deltaDegrees;
          const snappedRotation = moveEvt.shiftKey ? Math.round(rawRotation / DECORATION_ROTATION_STEP) * DECORATION_ROTATION_STEP : rawRotation;
          deco.rotation = normalizeDecorationRotation(snappedRotation);
          decoEl.style.setProperty('--deco-rotation', `${deco.rotation}deg`);
          decoEl.style.setProperty('--deco-counter-rotation', `${-deco.rotation}deg`);
          decoEl.setAttribute('aria-label', `Sticker ${deco.type}, ${Math.round((deco.scale || 1) * 100)}%, xoay ${deco.rotation} do`);
        };

        const onPointerUp = () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);
          decoEl.classList.remove('is-rotating');
          decoEl.setAttribute('draggable', 'true');
          persistDraft();
          updatePreview();
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      });
    }
  });
}

function setError(key, message) {
  const control = document.querySelector(`[data-draft="${key}"]`); control?.classList.add('invalid');
  const error = document.querySelector(`[data-error="${key}"]`); if (error) error.textContent = message;
}

async function nextStep(step) {
  if (step === 3) {
    const title = document.querySelector('#canvas-letter-title');
    const content = document.querySelector('#canvas-letter-content');
    const invalidTitle = String(draft.title || '').trim().length < 2;
    const invalidContent = String(draft.content || '').trim().length < 10;
    title?.setAttribute('aria-invalid', String(invalidTitle));
    content?.setAttribute('aria-invalid', String(invalidContent));
    if (invalidTitle || invalidContent) {
      toast(
        invalidTitle ? 'Hãy đặt một tiêu đề gồm ít nhất 2 ký tự.' : 'Hãy viết ít nhất 10 ký tự trước khi tiếp tục.',
        'error',
      );
      (invalidTitle ? title : content)?.focus();
      return;
    }
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
  flushPersistDraft();
  const nextStepNumber =
    step === 1 && draft.paperOrientation ? 3 : step + 1;
  location.hash = `/create/${nextStepNumber}`;
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
      paperOrientation: draft.paperOrientation, selectedThemeId: draft.selectedThemeId,
    };
    const createdResponse = await fetch('/api/letters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!createdResponse.ok) throw new Error('Không thể tạo lá thư');
    const created = await createdResponse.json();
    const sealResponse = await fetch(`/api/letters/${created.id}/seal`, { method: 'POST' });
    if (!sealResponse.ok) throw new Error('Không thể niêm phong');
    currentLetter = await sealResponse.json();
    const previousDraftId = draft.draftId;
    clearTimeout(saveTimer);
    localStorage.removeItem('postdrop-draft');
    localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
    draft = {
      ...defaultDraft,
      deliveryDate: futureDate(),
      decorations: [],
      userElements: [],
      draftId: createDraftId(),
    };
    window.dispatchEvent(new CustomEvent('postdrop-draft-reset', { detail: { previousDraftId, draftId: draft.draftId } }));
    location.hash = '/success';
  } catch (error) {
    toast('Chưa thể niêm phong lúc này. Vui lòng thử lại.', 'error');
    if (next) { next.disabled = false; next.innerHTML = `Thanh toán và niêm phong${icon('seal')}`; }
  }
}

function renderSuccess() {
  const date = currentLetter?.deliveryDate?.slice(0,10) || draft.deliveryDate;
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="success-page"><div class="success-seal">P</div><span class="eyebrow">LÁ THƯ ĐÃ ĐƯỢC NIÊM PHONG</span><h1>Hẹn gặp lại những dòng chữ này trong tương lai.</h1><p>PostDrop sẽ gìn giữ lá thư an toàn và nhắc bạn xác nhận thông tin trước ngày giao.</p><div class="success-meta"><span>${date ? formatDate(date) : 'Ngày đã chọn'}</span><span>·</span><span>${deliveryLabel()}</span></div><div class="hero-actions">${button('Xem thư trong dashboard','/dashboard','primary', 'arrowRight')}${button('Viết thêm một lá thư','/create/1?new=1','secondary')}</div></main></div>`;
}

const statusMap = { draft: 'Bản nháp', awaiting_payment: 'Chờ thanh toán', received: 'PostDrop đã nhận thư', stored: 'Đang được lưu giữ', address_confirmation: 'Cần xác nhận địa chỉ', scheduled: 'Đã lên lịch gửi', in_transit: 'Đang vận chuyển', delivered: 'Đã giao thành công' };
async function renderDashboard() {
  app.innerHTML = `<div class="app-page">${appHeader()}<main id="main-content" class="container dashboard-main"><div class="dashboard-title"><div><span class="eyebrow">KHÔNG GIAN CỦA BẠN</span><h1>Chào buổi sáng, Minh Anh.</h1><p>Những lá thư của bạn đang được gìn giữ an toàn.</p></div>${button('Tạo lá thư mới','/create/1?new=1','primary','plus')}</div><div id="dashboard-content"><div class="skeleton"></div></div></main></div>`;
  try {
    const response = await fetch('/api/letters/dashboard'); if (!response.ok) throw new Error();
    const data = await response.json();
    document.querySelector('#dashboard-content').innerHTML = `${statCards(data.summary)}<section class="letters-panel"><div class="panel-head"><h2>Những lá thư của bạn</h2><select aria-label="Lọc trạng thái"><option>Tất cả trạng thái</option><option>Đang lưu giữ</option><option>Sắp được gửi</option></select></div>${data.letters.length ? letterTable(data.letters) : emptyState()}</section>`;
  } catch { document.querySelector('#dashboard-content').innerHTML = `<div class="empty-state">${icon('info')}<h3>Chưa thể tải những lá thư</h3><p>Đường truyền đang gián đoạn. Hãy thử tải lại trang sau ít phút.</p><button class="button button-primary" onclick="location.reload()">Thử lại</button></div>`; }
}

function statCards(summary) { return `<div class="stat-grid">${statCard('archive',summary.stored,'Thư đang lưu giữ')}${statCard('clock',summary.upcoming,'Sắp được gửi')}${statCard('map',summary.confirmation,'Cần xác nhận địa chỉ')}${statCard('check',summary.delivered,'Đã giao thành công')}</div>`; }
function statCard(iconName, count, label) { return `<article class="stat-card">${icon(iconName)}<strong>${count}</strong><span>${label}</span></article>`; }
function letterTable(letters) { return `<table class="letter-table"><thead><tr><th>Lá thư</th><th>Người nhận</th><th>Ngày giao</th><th>Hình thức</th><th>Trạng thái</th><th></th></tr></thead><tbody>${letters.map((letter) => `<tr><td><strong>${escapeHtml(letter.title)}</strong><small>#${escapeHtml(letter.id.slice(-8).toUpperCase())}</small></td><td>${escapeHtml(letter.recipientName)}</td><td>${formatDate(letter.deliveryDate.slice(0,10))}</td><td>${({email:'Email',physical:'Thư vật lý',hybrid:'Cả hai'})[letter.deliveryMethod]}</td><td><span class="badge ${letter.status}">${statusMap[letter.status]}</span></td><td><a class="text-button" href="#/letters/${letter.id}">Xem chi tiết</a></td></tr>`).join('')}</tbody></table>`; }
function emptyState() { return `<div class="empty-state">${icon('mail')}<h3>Bạn chưa có lá thư nào đang chờ trong tương lai.</h3><p>Hãy bắt đầu bằng một điều nhỏ bạn muốn nhắc mình nhớ.</p>${button('Viết lá thư đầu tiên','/create/1?new=1')}</div>`; }

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
  if (hash === '/create/resume') {
    const requestedStep = Math.min(5, Math.max(1, Number(draft.lastStep || 1)));
    const resumeStep =
      requestedStep >= 3 && !draft.paperOrientation ? 2 : requestedStep;
    history.replaceState(null, '', `${location.pathname}${location.search}#/create/${resumeStep}`);
    return renderBuilder(resumeStep);
  }
  if (hash.startsWith('/create/')) {
    const [path, query = ''] = hash.split('?');
    const params = new URLSearchParams(query);
    const requestedStep = Math.min(
      5,
      Math.max(1, Number(path.split('/')[2]) || 1),
    );
    if (params.get('new') === '1') {
      const letterType =
        params.get('type') === 'handwritten' ? 'handwritten' : 'online';
      resetDraft(letterType);
      history.replaceState(null, '', `${location.pathname}${location.search}#/create/1`);
      return renderBuilder(1);
    }
    if (
      requestedStep >= 3 &&
      draft.paperOrientation !== 'portrait' &&
      draft.paperOrientation !== 'landscape'
    ) {
      history.replaceState(null, '', `${location.pathname}${location.search}#/create/2`);
      return renderBuilder(2);
    }
    return renderBuilder(requestedStep);
  }
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
