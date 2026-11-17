# Pedidor x Produtor (Java puro)

Motor do ciclo Pedidor -> Produtor escrito em Java, sem bibliotecas externas (só a JDK 17+).

- `src/Estado.java`: o motor (rodadas, turnos, prompts, PERFEITO, exportação, salvar/carregar).
- `src/Servidor.java`: servidor HTTP da própria JDK e a API (`/api/estado`, `/api/pedido`, `/api/entrega`, `/api/config`, `/api/zerar`, `/api/exportar`).
- `src/Pagina.java`: a tela, embutida no Java.

## Rodar

    javac -d out src/*.java
    java -cp out Servidor

Abra http://localhost:8080. Variáveis opcionais: `PORT` (porta) e `DADOS` (arquivo onde o estado é salvo, padrão `dados/estado.xml`).

O servidor escuta só em 127.0.0.1, então roda na sua máquina. A Vercel não executa Java, então para publicar é preciso hospedar em um serviço que rode Java (por exemplo Render, Railway ou Fly.io).
