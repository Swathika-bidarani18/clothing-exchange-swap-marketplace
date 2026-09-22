/* LoopWear API configuration.
   Local development uses the local backend.
   Production uses the live Render backend.
*/
(function () {
    const localHost = ["localhost", "127.0.0.1"].includes(
        window.location.hostname
    );

    const defaultApi = localHost
        ? "http://localhost:5000/api"
        : "https://loopwear-backend.onrender.com/api";

    window.LOOPWEAR_API = window.LOOPWEAR_API || defaultApi;
})();