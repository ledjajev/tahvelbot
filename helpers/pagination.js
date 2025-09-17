// helpers/pagination.js
export function paginateItems(items, page = 0, pageSize = 10, prefix = "institution") {
    const start = page * pageSize;
    const end = start + pageSize;
    const slice = items.slice(start, end);
  
    const buttons = slice.map(i => [{ text: i.nameEt, callback_data: `${prefix}_${i.id}` }]);
  
    const nav = [];
    if (page > 0) nav.push({ text: "⬅️ Prev", callback_data: `${prefix}_page_${page - 1}` });
    if (end < items.length) nav.push({ text: "➡️ Next", callback_data: `${prefix}_page_${page + 1}` });
    if (nav.length) buttons.push(nav);
  
    return buttons;
  }
  