export function makeRes() {
  const res = {
    _status: 200,
    _body: undefined,
    _headers: {},
    setHeader(k, v) { this._headers[k] = v; },
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    end() { return this; },
  };
  return res;
}

export function makeReq({ method = 'GET', query = {}, body, headers = {} } = {}) {
  return { method, query, body, headers, socket: {} };
}
