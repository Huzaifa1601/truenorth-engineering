export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const prettyRoutes = {
      "/about": "/about.html",
      "/about/": "/about.html",
      "/admin": "/admin.html",
      "/admin/": "/admin.html",
    };

    const target = prettyRoutes[url.pathname];
    if (target) {
      url.pathname = target;
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};