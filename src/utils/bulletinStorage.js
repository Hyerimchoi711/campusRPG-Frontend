const KEYS = {
  announcements: 'campusRpg_board_announcements',
  events: 'campusRpg_board_events',
};

function parseList(raw) {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((x) => x && typeof x.id === 'string' && typeof x.title === 'string')
      .map((x) => ({
        id: x.id,
        title: String(x.title).slice(0, 200),
        body: typeof x.body === 'string' ? x.body.slice(0, 20000) : '',
        createdAt: typeof x.createdAt === 'string' ? x.createdAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function loadBoard(boardKey) {
  try {
    const raw = localStorage.getItem(KEYS[boardKey]);
    if (!raw) return [];
    return parseList(raw).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function saveBoard(boardKey, items) {
  try {
    localStorage.setItem(KEYS[boardKey], JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function newBulletinItem(title, body) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return {
    id,
    title: title.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
}
