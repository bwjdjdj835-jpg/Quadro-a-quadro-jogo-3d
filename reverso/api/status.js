/* Diz só SE a IA do app está configurada (nunca devolve os valores). */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ codigo: !!process.env.UPLOAD_CODE, chave: !!process.env.ANTHROPIC_API_KEY });
}
