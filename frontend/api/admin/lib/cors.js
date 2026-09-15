export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://admin.jeetrack.in');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}
