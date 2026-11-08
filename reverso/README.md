# Reverso · Character Design

Engenharia reversa de character design. Extrai quadros de um vídeo (ou recebe imagens), analisa os princípios visuais da referência e cria personagens novos para as suas obras.

## Como usar

1. **Referências:** abra um vídeo e clique em *Extrair quadros* (1 quadro a cada X segundos, com nota de nitidez e sem repetidos), ou pause e use *Capturar este quadro*. Também dá para adicionar imagens.
2. **Seu pedido, num lugar só:** escolha *Eu descrevo* (escreva tudo num campo: obra, universo, personagem, papel, personalidade, uso, o que é obrigatório) ou *A IA cria tudo* (a IA inventa o universo e 3 personagens a partir das referências; escrever pistas é opcional). Mais estilo, criatividade e idioma do prompt.
3. **Escolher as referências:** marque as melhores; *Baixar folha das marcadas* junta todas numa imagem numerada para anexar.
4. **Engenharia reversa e criação**, em 6 etapas (leitura, decomposição em 9 tópicos, 5 princípios, 3 conceitos, revisão, prompt final da prancha):
   - **Gerar pedido completo** (grátis, sem código): monta o roteiro para colar no Gemini, ChatGPT ou Claude com a folha anexada.
   - **Analisar com a IA do app**: a IA faz as 6 etapas e mostra tudo organizado. Precisa, na Vercel deste projeto, das variáveis `UPLOAD_CODE` (código que você inventa) e `ANTHROPIC_API_KEY` (chave da API da Anthropic, cobrada à parte).
5. **Minhas criações 2026:** análises salvas por obra, com abrir, baixar .txt e apagar. Ficam no navegador.

O vídeo e as imagens não saem do aparelho, a não ser as referências reduzidas enviadas na opção *Analisar com a IA do app*.

## Publicar

Projeto da Vercel com *Root Directory* `reverso`, sem build.
