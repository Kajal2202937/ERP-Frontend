import _toast from "react-hot-toast";

const toast = {
  success: (msg, opts) => _toast.success(msg, opts),
  error: (msg, opts) => _toast.error(msg, opts),
  info: (msg, opts) =>
    _toast(msg, {
      icon: "ℹ️",
      ...opts,
    }),
  warning: (msg, opts) =>
    _toast(msg, {
      icon: "⚠️",
      style: {
        borderLeft: "3px solid var(--amber)",
      },
      ...opts,
    }),
  /** Promise toast — shows loading → success/error automatically */
  promise: (promise, msgs, opts) => _toast.promise(promise, msgs, opts),
  /** Dismiss a specific toast or all toasts */
  dismiss: (id) => _toast.dismiss(id),
};

export { toast };
export default toast;
