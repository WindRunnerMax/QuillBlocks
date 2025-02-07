/**
 * Decode JSON String To Object
 * @param {string} value
 * @returns {T | null}
 */
export const decodeJSON = <T = unknown>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.log("Decode JSON Error:", error);
  }
  return null;
};

/**
 * Encode JSON Object To String
 * @param {unknown} value
 * @returns {string | null}
 */
export const encodeJSON = (value: unknown): string | null => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.log("Encode JSON Error:", error);
  }
  return null;
};

export const TSON = {
  /**
   * Decode JSON String To Object
   * @param {string} value
   * @returns {T | null}
   */
  decode: decodeJSON,
  /**
   * Encode JSON Object To String
   * @param {unknown} value
   * @returns {string | null}
   */
  encode: encodeJSON,
  /**
   * Parse JSON String To Object
   * @param {string} value
   * @returns {T | null}
   */
  parse: decodeJSON,
  /**
   * Stringify JSON Object To String
   * @param {unknown} value
   * @returns {string | null}
   */
  stringify: encodeJSON,
};
