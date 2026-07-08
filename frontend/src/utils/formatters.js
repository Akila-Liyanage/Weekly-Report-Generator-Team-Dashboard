export function formatDate(date) {
  if (!date) return 'Not available';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function toInputDate(date) {
  if (!date) return '';
  const local = new Date(date);
  const offset = local.getTimezoneOffset();
  return new Date(local.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

export function currentMonday() {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return toInputDate(date);
}

export function sundayFromMonday(mondayString) {
  if (!mondayString) return '';
  const date = new Date(`${mondayString}T00:00:00`);
  date.setDate(date.getDate() + 6);
  return toInputDate(date);
}

export function textItems(text = '') {
  return text
    .split(/\n|,/)
    .map((item) => item.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);
}
