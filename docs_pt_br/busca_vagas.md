# Busca de Vagas (/scrape)

O comando `/scrape` ajuda você a varrer portais de emprego em busca de vagas que se alinhem com seu perfil. Ele utiliza scripts dedicados em TypeScript rodando sobre o **Bun** e arquivos de configuração local para deduplicar e ranquear as oportunidades.

---

## 🔎 Portais de Vagas Suportados Nativamente

A solução acompanha 8 Skills de busca no diretório `.agents/skills/`:

1.  **`gupy-search`:** Busca vagas diretamente no portal Gupy (portal.gupy.io), o principal sistema de recrutamento e seleção do Brasil.
2.  **`programathor-search`:** Busca vagas no portal Programathor (programathor.com.br), focado em desenvolvedores e profissionais de TI no mercado brasileiro.
3.  **`apinfo-search`:** Busca vagas no portal APInfo (apinfo.com), um tradicional classificado de empregos de TI no Brasil (possui restrições de limite de acesso).
4.  **`linkedin-search`:** Busca global de vagas utilizando a API pública de convidados do LinkedIn. É independente de país e aceita um parâmetro de localização livre (ex: `-l "Remote"` ou `-l "São Paulo, Brazil"`).
5.  **`jobindex-search`:** Scraper para o portal dinamarquês *Jobindex.dk*.
6.  **`jobnet-search`:** Scraper para o portal governamental dinamarquês *Jobnet.dk*.
7.  **`jobbank-search`:** Scraper para o portal acadêmico dinamarquês *Akademikernes Jobbank*.
8.  **`jobdanmark-search`:** Scraper para o portal de vagas municipais e gerais *Jobdanmark.dk*.

---

## ⚙️ Como Funciona o Comando `/scrape`

Quando você executa `/scrape` no Antigravity:

```
[Executar /scrape]
        │
[Carregar seen_jobs.json e CSV do Tracker]  <-- Evita vagas já vistas ou aplicadas
        │
[Pesquisar nos Portais com search-queries.md]
        │
[Filtro Geográfico e Exclusão de Expirados]
        │
[Ranquear Compatibilidade (Alta / Média / Baixa)]
        │
[Exibir Tabela de Resultados Ordenados]
```

### 1. Carregamento de Estado
O Antigravity lê o arquivo de estado `job_scraper/seen_jobs.json`. Ele armazena os IDs/URLs de todas as vagas já encontradas em execuções anteriores para não mostrá-las novamente. Ele também lê `job_search_tracker.csv` para ignorar vagas onde você já enviou candidatura.

### 2. Pesquisa Ativa
O agente dispara consultas utilizando os scrapers ativos baseando-se nos termos configurados em `search-queries.md`.
*   Por padrão, ele pesquisa os termos de **Prioridade 1** e **Prioridade 2**.
*   Se você executar `/scrape broad`, o agente fará uma busca ampla englobando todas as prioridades (1 a 4).
*   Você também pode especificar um foco específico diretamente no comando (ex: `/scrape "data science"`).

### 3. Filtros e Limpeza
Vagas fora do seu limite geográfico de locomoção diária ou com prazo de inscrição expirado são descartadas silenciosamente para economizar tokens de contexto.

### 4. Classificação Rápida de Fit (Compatibilidade)
Para cada vaga encontrada que passou pelos filtros, o agente realiza um mapeamento rápido (sem disparar o pipeline completo de avaliação):
*   **High match (Alta compatibilidade):** A vaga cita diretamente suas principais habilidades técnicas e histórico de atuação.
*   **Medium match (Compatibilidade média):** A vaga é correlata, mas exige algumas habilidades adjacentes que você ainda não domina ou cita poucas das suas skills principais.
*   **Low match (Baixa compatibilidade):** A vaga requer experiências que você não possui ou viola deal-breakers (ex: deslocamento muito longo).

### 5. Exibição de Resultados
As vagas encontradas são listadas em uma tabela Markdown limpa e ordenada pela compatibilidade (Altas no topo).

Abaixo da tabela, o Antigravity listará pequenos resumos de pontos fortes e possíveis "red flags" (alertas) para as vagas de alta compatibilidade. Ele encerrará a execução perguntando:

> *"Deseja avaliar em detalhe alguma dessas vagas? Basta digitar o número correspondente."*

Se você escolher um número, o Antigravity invocará automaticamente o fluxo do comando `/apply` para aquela oportunidade específica.

---

## 🤝 Adicionando Novos Portais (/add-portal)

Se você não está buscando vagas na Dinamarca ou apenas no LinkedIn, você pode estender a solução gerando um novo scraper para um portal de empregos do seu mercado local:

1.  Execute `/add-portal`.
2.  Insira a URL principal do portal local de vagas.
3.  O Antigravity investigará as regras de acesso do site (`robots.txt`), o formato de URLs de busca e a estrutura do código HTML de resultados.
4.  Ele gerará um script CLI em TypeScript na pasta `.agents/skills/novo-portal-search/` respeitando as convenções do projeto e realizará um teste de chamada ativo para confirmar o funcionamento.
