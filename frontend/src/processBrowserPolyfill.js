const processPolyfill = {
  env: {
    NODE_ENV: "development",
  },
  version: "16.0.0",
  nextTick: function (cb) {
    setTimeout(cb, 0);
  },
  browser: true,
};

// Cập nhật NODE_ENV từ window.process nếu có
if (typeof window !== "undefined" && window.process && window.process.env) {
  processPolyfill.env.NODE_ENV = window.process.env.NODE_ENV;
}

// Export cả named và default
export const process = processPolyfill;
export default processPolyfill;
