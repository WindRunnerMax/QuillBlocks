/**
 * 异步延迟 [非精准]
 * @param {number} ms
 * @returns {Promise<NodeJS.Timeout>}
 */
export const sleep = (ms: number): Promise<NodeJS.Timeout> => {
  return new Promise(resolve => {
    let id: NodeJS.Timeout | null = null;
    id = setTimeout(() => resolve(id!), ms);
  });
};

/**
 * Go-Style 异步异常处理
 * @param { Promise } promise
 * @return { Promise }
 */
export const to = <T, U extends Error>(
  promise: Promise<T>
): Promise<[null, T] | [U, undefined]> => {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((error: U) => {
      if (error instanceof Error === false) {
        return [new Error(String(error)) as U, undefined];
      }
      return [error, undefined];
    });
};
