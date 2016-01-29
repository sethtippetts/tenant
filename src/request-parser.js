export default function defaultParse(key, req) {
  if (!key) return;
  return req.get(key)
      || req.get(`X-${key}`)
      || req.query[key]
      || req.query[key.toLowerCase()];
}
