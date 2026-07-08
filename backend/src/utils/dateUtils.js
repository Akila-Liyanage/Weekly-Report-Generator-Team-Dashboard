function startOfWeek(inputDate = new Date()) {
  const date = new Date(inputDate);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const differenceToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + differenceToMonday);
  return date;
}

function endOfWeek(inputDate = new Date()) {
  const start = startOfWeek(inputDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function normalizeDate(inputDate) {
  const date = new Date(inputDate);
  date.setHours(0, 0, 0, 0);
  return date;
}

function countTextItems(text = '') {
  return text
    .split(/\n|,/)
    .map((item) => item.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean).length;
}

module.exports = {
  startOfWeek,
  endOfWeek,
  normalizeDate,
  countTextItems,
};
