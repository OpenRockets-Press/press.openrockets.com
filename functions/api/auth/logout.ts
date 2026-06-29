export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.origin + "/",
      "Set-Cookie": "__orp_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
};
