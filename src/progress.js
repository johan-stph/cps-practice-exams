const KEY = 'cps-practice-exams-done';

export function loadDone() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveDone(done) {
  localStorage.setItem(KEY, JSON.stringify(done));
}

export function clearDone() {
  localStorage.removeItem(KEY);
}
