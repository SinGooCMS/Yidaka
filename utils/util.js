function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function getYMD (date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

function getHM (date) {
  var hour = date.getHours()
  var minute = date.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}

function getW (date) {
  var d = date.getDay();
  var arr = ['日', '一', '二', '三', '四', '五', '六'];

  return '星期' + arr[d];
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatNumber: formatNumber,
  formatTime: formatTime,
  getYMD: getYMD,
  getHM: getHM,
  getW: getW,
  getFirstDayOfWeek: getFirstDayOfWeek,
  getLastDayOfWeek: getLastDayOfWeek
}

function getFirstDayOfWeek(date) { //获取这周的周一
  var day = date.getDay() || 7;
  return getYMD(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day));
}

function getLastDayOfWeek(date) { //获取这周的最后一天
  var day = date.getDay() || 7;
  var date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
  date.setDate(date.getDate() + 6);
  return getYMD(date);
}