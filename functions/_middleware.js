export async function onRequest(context) {
  const { request, next, env } = context;
  const password = env.CFP_PASSWORD;
  const token = env.CFP_SECRET_TOKEN;

  if (!password || !token) {
    return new Response("Service misconfigured", { status: 503 });
  }

  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";

  if (cookie.includes(`cfp_auth=${token}`)) {
    return next();
  }

  if (request.method === "POST" && url.pathname === "/_auth") {
    const formData = await request.formData();
    if (formData.get("password") === password) {
      return new Response("", {
        status: 302,
        headers: {
          "Location": "/",
          "Set-Cookie": `cfp_auth=${token}; Path=/; Max-Age=604800`
        }
      });
    }
    return loginPage("Bad password, try again");
  }

  if (request.method === "GET") {
    return loginPage("");
  }

  return next();
}

function loginPage(error) {
  return new Response(`
    <html><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5">
    <form method="POST" action="/_auth" style="background:white;padding:2rem;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <h2 style="margin-top:0">Enter password</h2>
      ${error ? `<p style="color:red;margin-bottom:1rem">${error}</p>` : ""}
      <input type="password" name="password" placeholder="Password" style="display:block;width:100%;padding:8px;margin-bottom:1rem;box-sizing:border-box;border:1px solid #ddd;border-radius:4px">
      <button type="submit" style="width:100%;padding:8px;background:#0051c3;color:white;border:none;border-radius:4px;cursor:pointer">Enter prototype</button>
    </form></body></html>
  `, { headers: { "Content-Type": "text/html" } });
}
