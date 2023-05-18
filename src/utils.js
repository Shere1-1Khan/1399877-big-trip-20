import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

function getRandomInteger(a = 0, b = 1){
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a,b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

function getRandomValue(items){
  return items[getRandomInteger(0, items.length - 1)];
}

function formatStringToDateTime(date) {
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
}

function formatStringToShortDate(date) {
  return dayjs(date).format('MMM DD');
}

function formatStringShorTime(date){
  return dayjs(date).format('HH:mm');
}
function callcDate(dateFrom,dateTo){
  const from = dayjs(dateFrom);
  const to = dayjs(dateTo);
  const diff = to.diff(from,'hours', true);
  dayjs.duration(diff, 'hours');
  return duration.format('HH:mm');
}

export{getRandomInteger, getRandomValue,formatStringToDateTime,formatStringToShortDate, formatStringShorTime, callcDate};
