/** 原始字符 */
const CHARTS = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789";

/**
 * 生成唯一 ID
 * @param {number} len ID 长度
 */
export const getUniqueId = (len: number = 10): string => {
  const chars = new Array(len - 1).fill("");
  return (
    // 保证首字符非数字 避免 querySelector 方法抛异常
    CHARTS[Math.floor(Math.random() * 52)] +
    chars.map(() => CHARTS[Math.floor(Math.random() * CHARTS.length)]).join("")
  );
};

/**
 * 生成唯一 ID
 * @param {number} len ID 长度
 */
export const getId = getUniqueId;
