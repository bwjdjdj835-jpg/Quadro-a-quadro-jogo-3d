# Quadro a Quadro — Personagens

Extrator de quadros para character design: tira do vídeo as melhores imagens de personagens (rosto, corpo inteiro, roupas, poses, cores) e baixa tudo em ZIP para alimentar uma IA.

- Escolhe o vídeo do celular, extrai 1 quadro a cada X segundos, dá nota de nitidez e pula quadros repetidos.
- Três modos: **Referências nítidas**, **Poses em sequência** e **Detalhes e cores**.
- Dá o nome do personagem a cada imagem e organiza o ZIP em pastas por personagem.
- **Baixar ZIP com TODAS as fotos** leva tudo o que foi extraído, sem depender de marcação. O outro botão leva só as marcadas.
- Tudo roda no navegador: o vídeo não é enviado para servidor nenhum.

Use só vídeos seus ou com permissão de quem os fez.

## Rodar no computador

    npx serve .

Abra http://localhost:3000.

## Publicar

Site estático, sem build: na Vercel, importe o repositório e clique em Deploy.
