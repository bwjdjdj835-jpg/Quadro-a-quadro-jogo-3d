# Quadro a Quadro — Personagens

Extrator de quadros para character design: tira do vídeo as melhores imagens de personagens (rosto, corpo inteiro, roupas, poses, cores) e baixa tudo em ZIP para alimentar uma IA.

- Escolhe o vídeo do celular, extrai 1 quadro a cada X segundos, dá nota de nitidez e pula quadros repetidos.
- Três modos: **Referências nítidas**, **Poses em sequência** e **Detalhes e cores**.
- Dá o nome do personagem a cada imagem e organiza o ZIP em pastas por personagem.
- **Baixar ZIP com TODAS as fotos** leva tudo o que foi extraído, sem depender de marcação. O outro botão leva só as marcadas.
- Tudo roda no navegador: o vídeo não é enviado para servidor nenhum.

## Criar o personagem (passo 04)

Com os quadros marcados, escolha:

1. **De onde vêm os quadros:** *Character design para o meu anime* (a IA aprende o estilo e cria o personagem para o seu universo) ou *Filme ou série* (a IA descobre gênero, época e visual e cria um personagem original de um universo fictício).
2. **O que receber:** *Ficha técnica*, *Prompt para o Gemini* ou *Os dois*.

Duas formas de gerar:

- **Opção A, IA do app** (`/api/ficha`): manda até 6 quadros reduzidos para a API do Claude e mostra a ficha e os prompts. Precisa, na Vercel (Settings → Environment Variables):
  - `ANTHROPIC_API_KEY`: chave criada em console.anthropic.com (a API tem cobrança própria, separada da assinatura do Claude);
  - `UPLOAD_CODE`: o mesmo código de envio já usado nos links temporários (protege a chave contra uso por estranhos).
- **Opção B, texto para o Gemini:** monta o pedido pronto para colar no Gemini com as fotos anexadas. Não usa servidor nem chave.

A IA é instruída a criar personagem **original**, sem copiar personagens existentes nem rosto de ator.

Use só vídeos seus ou com permissão de quem os fez.

## Rodar no computador

    npx serve .

Abra http://localhost:3000.

## Publicar

Site estático, sem build: na Vercel, importe o repositório e clique em Deploy.
