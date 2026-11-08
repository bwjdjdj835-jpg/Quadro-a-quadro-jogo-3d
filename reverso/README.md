# Reverso · Character Design

Engenharia reversa de character design. Extrai quadros de um vídeo (ou recebe imagens), analisa os princípios visuais da referência e cria personagens novos para as suas obras.

## Como usar

1. **Referências:** abra um vídeo e clique em *Extrair quadros* (1 quadro a cada X segundos, com nota de nitidez e sem repetidos), ou pause e use *Capturar este quadro*. Também dá para adicionar imagens.
2. **Seu pedido, num lugar só:** escolha *Eu descrevo* (escreva tudo num campo: obra, universo, personagem, papel, personalidade, uso, o que é obrigatório) ou *A IA cria tudo* (a IA inventa o universo e 3 personagens a partir das referências; escrever pistas é opcional). Mais estilo, criatividade e idioma do prompt.
3. **Escolher as referências:** marque as melhores; *Baixar folha das marcadas* junta todas numa imagem numerada para anexar.
4. **Analisar com o motor do app** (grátis, sem API e sem crédito): o próprio app, em JavaScript puro (`motor.js`), mede todas as referências marcadas no seu aparelho (silhueta, proporção de cabeças, distribuição de massa, formas, simetria, valores, paleta, ponto focal, contorno, sombreamento) e gera as 6 etapas: leitura, decomposição em 9 tópicos, 5 princípios, 3 conceitos (ou universo + 3 personagens no modo *O app cria tudo*), revisão e prompt final com o estilo escrito em palavras, mais um bloco de estilo reutilizável. **Lê o modelo da folha:** conta e localiza título, pose principal, turnaround (frente/costas), cabeças de expressão, detalhes em close, quadros com moldura e linhas de texto, e o prompt final pode repetir esse mesmo modelo (*model sheet*) com o seu personagem, incluindo o que vai escrito na folha. **Aprende por obra:** escreva "Obra: nome" no pedido; as medidas de cada análise se somam ao perfil daquela obra (fica no navegador). Limite: o motor mede formas e cores, não reconhece rosto, roupa ou objetos como uma IA treinada.
   - Opcional: *Gerar pedido completo* para colar no Gemini/ChatGPT com as medidas escritas.
5. **Minhas criações 2026:** análises salvas por obra, com abrir, baixar .txt e apagar. Ficam no navegador.

O vídeo e as imagens não saem do aparelho. Não há servidor nem API.

## Publicar

Site estático (HTML + JavaScript), projeto da Vercel com *Root Directory* `reverso`, sem build.
