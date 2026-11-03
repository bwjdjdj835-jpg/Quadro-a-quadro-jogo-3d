# Quadro a Quadro — Jogo 3D

Extrator de quadros para o jogo 3D de Rondônia: transforma um vídeo da cidade (ex.: Ministro Andreazza) em fotos boas para gerar os blocos 3D.

- Escolhe o vídeo do celular, extrai 1 quadro a cada X segundos, dá nota de nitidez e pula quadros repetidos.
- Três modos: **Foto → 3D** (Hunyuan3D, TRELLIS, Tripo), **Fotogrametria** (RealityScan, Polycam) e **Referência/textura**.
- Dá nome do lugar a cada foto e baixa um ZIP separado em pastas.
- Tudo roda no navegador: o vídeo não é enviado para servidor nenhum.

## Rodar no computador

    npx serve .

Abra http://localhost:3000.

## Publicar

Site estático, sem build: na Vercel, importe o repositório e clique em Deploy.
