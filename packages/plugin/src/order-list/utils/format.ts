const latinCache: Record<string, string> = {};
const romanCache: Record<string, string> = {};

const startToLatin = (start: number) => {
  if (start < 1) return "";
  const cache = latinCache[start];
  if (cache) return cache;
  // 1 -> a, 27 -> aa
  let res = "";
  let n = start - 1;
  while (n >= 0) {
    res = String.fromCharCode((n % 26) + 97) + res;
    n = Math.floor(n / 26) - 1;
  }
  latinCache[start] = res;
  return res;
};

const startToRoman = (start: number) => {
  if (start < 1 || start > 5000) return "";
  const cache = romanCache[start];
  if (cache) return cache;
  // https://github.com/bpampuch/pdfmake/blob/7af85/src/DocMeasure.js#L315
  const lookup: Record<string, number> = {
    m: 1000,
    cm: 900,
    d: 500,
    cd: 400,
    c: 100,
    xc: 90,
    l: 50,
    xl: 40,
    x: 10,
    ix: 9,
    v: 5,
    iv: 4,
    i: 1,
  };
  let res = "";
  let n = start;
  for (const i of Object.keys(lookup)) {
    while (n >= lookup[i]) {
      res = res + i;
      n = n - lookup[i];
    }
  }
  romanCache[start] = res;
  return res;
};

/**
 * 序列化有序列表前缀值
 * @param start
 * @param level
 */
export const formatListLevel = (start: number, level: number) => {
  let serial = "";
  const value = level % 3;
  if (value === 0) {
    // 1 -> 1
    serial = start.toString();
  } else if (value === 1) {
    // 1 -> a
    serial = startToLatin(start);
  } else if (value === 2) {
    // 1 -> i
    serial = startToRoman(start);
  }
  return serial + ".";
};
