import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

/** Motor do ciclo Pedidor -> Produtor. Não sabe nada de HTTP nem de tela. */
final class Estado {

    record Entrada(String quem, int rodada, String texto) {}

    private String tema = "Rondônia: dados técnicos do jogo";
    private String criterios = String.join("\n",
            "Cada número tem fonte ou está marcado como [estimado]",
            "Os dados do jogo batem com o que já foi definido no projeto",
            "Tabelas e listas têm unidades e nomes consistentes",
            "Sem trechos vagos ou com \"etc.\"");
    private int max = 5;
    private String turno = "pedidor";
    private int rodada = 1;
    private boolean concluido = false;
    private final List<Entrada> historico = new ArrayList<>();

    synchronized String tema() { return tema; }
    synchronized String criterios() { return criterios; }
    synchronized int max() { return max; }
    synchronized String turno() { return turno; }
    synchronized int rodada() { return rodada; }
    synchronized boolean concluido() { return concluido; }
    synchronized List<Entrada> historico() { return new ArrayList<>(historico); }

    synchronized boolean podePedir() { return !concluido && turno.equals("pedidor"); }
    synchronized boolean podeEntregar() { return !concluido && turno.equals("produtor"); }

    private String ultimo(String quem) {
        for (int i = historico.size() - 1; i >= 0; i--) {
            if (historico.get(i).quem().equals(quem)) return historico.get(i).texto();
        }
        return "(nenhum ainda)";
    }

    synchronized String promptPedidor() {
        return "Você é o PEDIDOR de um livro técnico sobre: " + tema + ".\n\n"
                + "Critérios de aceite:\n" + criterios + "\n\n"
                + "Última entrega do produtor:\n" + ultimo("produtor") + "\n\n"
                + "Escreva o próximo pedido: qual seção, quais dados, formato e o que precisa mudar. "
                + "Se a última entrega atende TODOS os critérios, responda apenas com a palavra PERFEITO "
                + "e o motivo em uma linha.";
    }

    synchronized String promptProdutor() {
        return "Você é o PRODUTOR do livro técnico sobre: " + tema + ".\n\n"
                + "Pedido atual do pedidor:\n" + ultimo("pedidor") + "\n\n"
                + "Entregue a seção pedida em Markdown, com dados concretos. "
                + "Marque cada dado como [verificado] (com fonte) ou [estimado]. Não invente números.";
    }

    /** Devolve null se deu certo, ou a mensagem de erro. */
    synchronized String enviarPedido(String texto) {
        if (concluido) return "O ciclo já terminou. Zere o histórico para recomeçar.";
        if (!turno.equals("pedidor")) return "Ainda é a vez do produtor.";
        String t = texto == null ? "" : texto.trim();
        if (t.isEmpty()) return "A resposta do pedidor está vazia.";
        historico.add(new Entrada("pedidor", rodada, t));
        if (t.toUpperCase(Locale.ROOT).startsWith("PERFEITO")) {
            concluido = true;
        } else {
            turno = "produtor";
        }
        return null;
    }

    synchronized String enviarEntrega(String texto) {
        if (concluido) return "O ciclo já terminou. Zere o histórico para recomeçar.";
        if (!turno.equals("produtor")) return "Ainda é a vez do pedidor.";
        String t = texto == null ? "" : texto.trim();
        if (t.isEmpty()) return "A entrega do produtor está vazia.";
        historico.add(new Entrada("produtor", rodada, t));
        turno = "pedidor";
        rodada++;
        if (rodada > max) concluido = true;
        return null;
    }

    synchronized void zerar() {
        historico.clear();
        turno = "pedidor";
        rodada = 1;
        concluido = false;
    }

    synchronized void configurar(String novoTema, String novosCriterios, int novoMax) {
        if (novoTema != null && !novoTema.isBlank()) tema = novoTema.trim();
        if (novosCriterios != null) criterios = novosCriterios.trim();
        max = Math.max(1, novoMax);
        if (rodada > max) concluido = true;
    }

    synchronized String exportarMarkdown() {
        StringBuilder sb = new StringBuilder("# ").append(tema).append("\n\n");
        for (Entrada h : historico) {
            sb.append("## Rodada ").append(h.rodada()).append(" · ")
              .append(h.quem().equals("pedidor") ? "Pedidor" : "Produtor")
              .append("\n\n").append(h.texto()).append("\n\n");
        }
        return sb.toString();
    }

    synchronized void salvar(Path arquivo) throws IOException {
        Properties p = new Properties();
        p.setProperty("tema", tema);
        p.setProperty("criterios", criterios);
        p.setProperty("max", String.valueOf(max));
        p.setProperty("turno", turno);
        p.setProperty("rodada", String.valueOf(rodada));
        p.setProperty("concluido", String.valueOf(concluido));
        p.setProperty("n", String.valueOf(historico.size()));
        for (int i = 0; i < historico.size(); i++) {
            Entrada h = historico.get(i);
            p.setProperty("q" + i, h.quem());
            p.setProperty("r" + i, String.valueOf(h.rodada()));
            p.setProperty("t" + i, h.texto());
        }
        if (arquivo.getParent() != null) Files.createDirectories(arquivo.getParent());
        try (OutputStream out = Files.newOutputStream(arquivo)) {
            p.storeToXML(out, "estado do painel Pedidor x Produtor");
        }
    }

    static Estado carregar(Path arquivo) throws IOException {
        Estado e = new Estado();
        if (!Files.exists(arquivo)) return e;
        Properties p = new Properties();
        try (InputStream in = Files.newInputStream(arquivo)) {
            p.loadFromXML(in);
        }
        e.tema = p.getProperty("tema", e.tema);
        e.criterios = p.getProperty("criterios", e.criterios);
        e.max = Integer.parseInt(p.getProperty("max", "5"));
        e.turno = p.getProperty("turno", "pedidor");
        e.rodada = Integer.parseInt(p.getProperty("rodada", "1"));
        e.concluido = Boolean.parseBoolean(p.getProperty("concluido", "false"));
        int n = Integer.parseInt(p.getProperty("n", "0"));
        for (int i = 0; i < n; i++) {
            e.historico.add(new Entrada(
                    p.getProperty("q" + i),
                    Integer.parseInt(p.getProperty("r" + i, "1")),
                    p.getProperty("t" + i, "")));
        }
        return e;
    }
}
