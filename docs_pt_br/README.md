# AI Job Search - Guia do Usuário (Antigravity)

Bem-vindo ao **AI Job Search**, um framework de busca e candidatura a vagas de emprego otimizado para o **Google Antigravity**. 

Esta solução automatiza todo o processo de onboarding do seu perfil profissional, busca de vagas em portais (incluindo LinkedIn, portais brasileiros como Gupy e Programathor, e portais dinamarqueses), avaliação de compatibilidade de vagas e a redação/ajuste personalizado de currículos (CV) e cartas de apresentação em LaTeX com verificação automática de PDF.

---

## 🚀 Como Iniciar

### 1. Pré-requisitos
Para utilizar todas as funções deste repositório, garanta que você possui os seguintes itens instalados em seu ambiente local:

*   **Google Antigravity CLI (`agy`)** ou o **Antigravity IDE/App 2.0**.
*   **Python 3.10+** (necessário para a ferramenta de média salarial).
*   **Bun** (necessário para executar as ferramentas de busca de vagas em TypeScript):
    *   No Windows/macOS/Linux: consulte o [guia de instalação oficial do Bun](https://bun.sh/).
*   **Distribuição LaTeX** para compilar currículos e cartas de apresentação para PDF:
    *   **Windows:** [MiKTeX](https://miktex.org/)
    *   **macOS:** [MacTeX](https://tug.org/mactex/)
    *   **Linux:** `texlive-full`

---

### 2. Instalação das Ferramentas de Busca
Antes de iniciar a busca por vagas, você precisa instalar as dependências de cada ferramenta de busca (Portais dinamarqueses, LinkedIn e brasileiros). Execute os seguintes comandos no terminal na raiz do projeto:

```bash
cd .agents/skills/jobbank-search/cli && bun install && cd ../../../..
cd .agents/skills/jobdanmark-search/cli && bun install && cd ../../../..
cd .agents/skills/jobindex-search/cli && bun install && cd ../../../..
cd .agents/skills/jobnet-search/cli && bun install && cd ../../../..
cd .agents/skills/linkedin-search/cli && bun install && cd ../../../..
cd .agents/skills/gupy-search/cli && bun install && cd ../../../..
cd .agents/skills/programathor-search/cli && bun install && cd ../../../..
cd .agents/skills/apinfo-search/cli && bun install && cd ../../../..
```

---

### 3. Configurando seu Perfil Profissional
Abra o **Antigravity** na raiz do projeto e execute o comando:

```
/setup
```

O Antigravity iniciará um processo interativo com três caminhos disponíveis:
1.  **Caminho A (Pasta de Documentos):** O Antigravity lerá arquivos (como currículos antigos, PDFs do LinkedIn, diplomas e cartas de referência) que você colocar na pasta `documents/` e estruturará seu perfil de forma inteligente e sem duplicações.
2.  **Caminho B (Importação Única de CV):** Cole ou mencione um arquivo de currículo e responda a perguntas rápidas sobre as informações faltantes.
3.  **Caminho C (Modo Entrevista):** O Antigravity fará perguntas de forma conversacional sobre sua carreira, habilidades, objetivos e preferências.

---

## 🛠️ Comandos Disponíveis no Antigravity

Como migramos a solução para o Antigravity, os antigos comandos do Claude Code agora são carregados automaticamente como **Skills** e expostos como comandos slash (`/`):

| Comando | Descrição |
| :--- | :--- |
| **`/setup`** | Configura seu perfil profissional e as consultas de busca de vagas. |
| **`/scrape`** | Realiza pesquisas nos portais de emprego ativos, consolida os resultados novos e os classifica por compatibilidade. |
| **`/apply <url_ou_texto>`** | Avalia a vaga informada, gera rascunhos de CV e carta, envia para um revisor e compila/inspeciona o PDF LaTeX final. |
| **`/expand`** | Varre suas redes públicas configuradas (GitHub, Scholar, etc.) e ementas de disciplinas acadêmicas para enriquecer sua lista de competências. |
| **`/upskill`** | Compara seu currículo com vagas pretendidas e gera um mapa térmico de lacunas de habilidades junto a um cronograma de estudos. |
| **`/add-template`** | Registra um template LaTeX customizado (CV ou Carta) para ser usado nas candidaturas. |
| **`/add-portal`** | Gera e integra uma Skill de busca para um novo portal de vagas de sua região geográfica. |
| **`/reset`** | Limpa dados do perfil de forma segura para permitir um recomeço do zero. |

---

## 📁 Estrutura de Arquivos da Solução

*   `ANTIGRAVITY.md`: Guia de configuração geral e "constituição" do agente para o seu perfil.
*   `.agents/rules/general.md`: Cópia do perfil carregada automaticamente como regra global do workspace.
*   `.agents/skills/`: Contém os comandos customizados convertidos e os scrapers locais dos portais de vaga.
*   `.agents/skills/job-application-assistant/`: Diretório com arquivos-fonte do seu perfil (perfil comportamental, histórico profissional, STARs, etc.).
*   `cv/`: Arquivos LaTeX do seu currículo e versões geradas por vaga.
*   `cover_letters/`: Cartas de apresentação geradas por vaga em formato LaTeX.
*   `documents/`: Pasta para armazenar documentos-fonte de onboarding (currículos, diplomas, portfólios).
*   `job_scraper/`: Histórico de vagas já visualizadas (evita duplicidade).
*   `job_search_tracker.csv`: Planilha simples para acompanhar o progresso e o status das candidaturas.
