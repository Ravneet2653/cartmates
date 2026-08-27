// Wraps an async controller function so any thrown error (bad id, DB failure,
// anything) gets passed to next(err) automatically, instead of needing a
// try/catch written out in every single controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
