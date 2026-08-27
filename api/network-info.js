export default function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'minhas-compras.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    port: 443,
    primaryIP: host,
    interfaces: [{ name: 'Vercel Edge', address: host }],
    fullUrl: `${proto}://${host}`
  });
}
