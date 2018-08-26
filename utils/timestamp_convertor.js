/**
 * 时间戳转换器
 * @param timestamp
 * @returns {string}
 */
export function timestampToTime(timestamp) {
  return new Date(parseInt(timestamp)).toLocaleString().replace(/:\d{1,2}$/,' ');
}
