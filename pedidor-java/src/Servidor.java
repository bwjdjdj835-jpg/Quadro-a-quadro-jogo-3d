import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

/** Servidor HTTP da JDK (sem dependências). Serve a tela e a API do motor Estado. */
public final class Servidor {

    public static void main(String[] args) throws IOException {
        int porta = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        Path arquivo = Paths.get(System.getenv().getOrDefault("DADOS", "dados/estado.xml"));
        Estado estado = Estado.carregar(arquivo);

        HttpServer servidor = HttpServer.create(new InetSocketAddress(System.getenv().getOrDefault("HOST", "127.0.0.1"), porta), 0);
        servidor.createContext("/", ex -> rota(ex, estado, arquivo));
        servidor.setExecutor(Executors.newFixedThreadPool(4));
        servidor.start();
        System.out.println("Pedidor x Produtor rodando em http://localhost:" + porta);
    }

    private static void rota(HttpExchange ex, Estado e, Path arquivo) {
        try {
            String metodo = ex.getRequestMethod();
            String caminho = ex.getRequestURI().getPath();

            if (metodo.equals("GET") && caminho.equals("/")) {
                enviar(ex, 200, "text/html; charset=utf-8", Pagina.HTML);
            } else if (metodo.equals("GET") && caminho.equals("/api/estado")) {
                enviar(ex, 200, "application/json; charset=utf-8", json(e, null));
            } else if (metodo.equals("GET") && caminho.equals("/api/exportar")) {
                ex.getResponseHeaders().add("Content-Disposition", "attachment; filename=\"livro-tecnico.md\"");
                enviar(ex, 200, "text/markdown; charset=utf-8", e.exportarMarkdown());
            } else if (metodo.equals("POST") && caminho.equals("/api/pedido")) {
                String erro = e.enviarPedido(form(ex).get("texto"));
                e.salvar(arquivo);
                enviar(ex, 200, "application/json; charset=utf-8", json(e, erro));
            } else if (metodo.equals("POST") && caminho.equals("/api/entrega")) {
                String erro = e.enviarEntrega(form(ex).get("texto"));
                e.salvar(arquivo);
                enviar(ex, 200, "application/json; charset=utf-8", json(e, erro));
            } else if (metodo.equals("POST") && caminho.equals("/api/config")) {
                Map<String, String> f = form(ex);
                int max = 5;
                try {
                    max = Integer.parseInt(f.getOrDefault("max", "5").trim());
                } catch (NumberFormatException ignorada) {
                    // mantém 5
                }
                e.configurar(f.get("tema"), f.get("criterios"), max);
                e.salvar(arquivo);
                enviar(ex, 200, "application/json; charset=utf-8", json(e, null));
            } else if (metodo.equals("POST") && caminho.equals("/api/zerar")) {
                e.zerar();
                e.salvar(arquivo);
                enviar(ex, 200, "application/json; charset=utf-8", json(e, null));
            } else {
                enviar(ex, 404, "text/plain; charset=utf-8", "não encontrado");
            }
        } catch (IOException | RuntimeException err) {
            try {
                enviar(ex, 500, "text/plain; charset=utf-8", "erro interno: " + err.getMessage());
            } catch (IOException ignorada) {
                // conexão já fechada
            }
        }
    }

    private static Map<String, String> form(HttpExchange ex) throws IOException {
        String corpo = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        Map<String, String> m = new HashMap<>();
        for (String par : corpo.split("&")) {
            if (par.isEmpty()) continue;
            int i = par.indexOf('=');
            String chave = i < 0 ? par : par.substring(0, i);
            String valor = i < 0 ? "" : par.substring(i + 1);
            m.put(URLDecoder.decode(chave, StandardCharsets.UTF_8),
                  URLDecoder.decode(valor, StandardCharsets.UTF_8));
        }
        return m;
    }

    private static void enviar(HttpExchange ex, int codigo, String tipo, String corpo) throws IOException {
        byte[] bytes = corpo.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", tipo);
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        ex.sendResponseHeaders(codigo, bytes.length);
        try (OutputStream out = ex.getResponseBody()) {
            out.write(bytes);
        }
    }

    static String json(Estado e, String erro) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"tema\":").append(texto(e.tema())).append(',');
        sb.append("\"criterios\":").append(texto(e.criterios())).append(',');
        sb.append("\"max\":").append(e.max()).append(',');
        sb.append("\"turno\":").append(texto(e.turno())).append(',');
        sb.append("\"rodada\":").append(e.rodada()).append(',');
        sb.append("\"concluido\":").append(e.concluido()).append(',');
        sb.append("\"podePedir\":").append(e.podePedir()).append(',');
        sb.append("\"podeEntregar\":").append(e.podeEntregar()).append(',');
        sb.append("\"promptPedidor\":").append(texto(e.promptPedidor())).append(',');
        sb.append("\"promptProdutor\":").append(texto(e.promptProdutor())).append(',');
        sb.append("\"erro\":").append(erro == null ? "null" : texto(erro)).append(',');
        sb.append("\"historico\":[");
        boolean primeira = true;
        for (Estado.Entrada h : e.historico()) {
            if (!primeira) sb.append(',');
            primeira = false;
            sb.append("{\"quem\":").append(texto(h.quem()))
              .append(",\"rodada\":").append(h.rodada())
              .append(",\"texto\":").append(texto(h.texto())).append('}');
        }
        sb.append("]}");
        return sb.toString();
    }

    private static String texto(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.append('"').toString();
    }
}
