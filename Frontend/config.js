/* LoopWear API configuration.
   Local development: http://localhost:5000/api
   Production: set LOOPWEAR_API before loading the app, or serve the frontend
   from the same Express server so /api is used automatically. */
(function () {
    const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const defaultApi = localHost
        ? "http://localhost:5000/api"
        : "/api";

    window.LOOPWEAR_API = window.LOOPWEAR_API || defaultApi;
})();
