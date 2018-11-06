export const partial = (fn, ...args) => fn.bind(null, ...args);
export const compose = (f, g) => (...args) => g(f(...args));
