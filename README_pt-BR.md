<p align="center">
  <img src="claude_animation.gif" alt="Antigravity Job Search Assistant" width="200">
</p>

# AI Job Search (Busca de Emprego com IA)

Um framework de candidatura a vagas de emprego alimentado por IA construído sobre o [Google Antigravity](https://antigravity.google). Faça um fork, preencha seu perfil e deixe o Antigravity avaliar vagas, adaptar seu currículo (CV), escrever cartas de apresentação e prepará-lo para entrevistas.

---

## O que é este projeto

Um fluxo de trabalho estruturado que transforma o Antigravity em um assistente completo de candidatura a vagas. O fluxo principal (autoperfilamento, avaliação de fit e o pipeline redator-revisor de candidaturas) é **independente de idioma e país**. As skills de busca de vagas estão prontas para o mercado dinamarquês (Jobindex, Jobnet, Akademikernes Jobbank, etc.), mas o padrão foi projetado para ser facilmente adaptado para portais de vagas de qualquer região geográfica.

```
/setup          /scrape              /apply <url>
  |                |                     |
  v                v                     v
Preencher      Pesquisar             Avaliar fit
seu perfil     nos portais           Pontuação e recomendação
  |                |                     |
  v                v                     v
Arquivos do    Apresentar vagas      Rascunho de CV + Carta
perfil prontos com compatibilidade   (LaTeX personalizado)
                   |                     |
                   v                     v
               Escolher vaga        Subagente revisa
               -> /apply            -> Revisa -> Saída final
```

O framework implementa as melhores práticas de orientação de carreira, incluindo critérios de avaliação estruturados, redação estratégica de cartas de apresentação e análise salarial opcional.

---

## Pré-requisitos

*   [Google Antigravity](https://antigravity.google) (Interface CLI `agy` ou App Desktop 2.0)
*   Python 3.10+
*   [Bun](https://bun.sh) (necessário para rodar as ferramentas de busca locais em TypeScript)
*   Distribuição LaTeX com suporte a `lualatex` e `xelatex`: [TeX Live](https://tug.org/texlive/) ou [MiKTeX](https://miktex.org/). O CV é compilado com `lualatex`; a carta de apresentação com `xelatex` (devido à dependência do pacote `fontspec` na classe `cover.cls`).

---

## Início Rápido

### 1. Clonar o repositório

```bash
git clone <url-do-seu-fork>
cd ai-job-search
```

### 2. Instalar as dependências das ferramentas de busca

```bash
cd .agents/skills/jobbank-search/cli && bun install && cd ../../../..
cd .agents/skills/jobdanmark-search/cli && bun install && cd ../../../..
cd .agents/skills/jobindex-search/cli && bun install && cd ../../../..
cd .agents/skills/jobnet-search/cli && bun install && cd ../../../..
cd .agents/skills/linkedin-search/cli && bun install && cd ../../../..
```

*Nota: Para o `linkedin-search`, o `bun install` é opcional, pois ele roda com Bun puro sem dependências externas adicionais no runtime.*

### 3. Configurar seu perfil profissional

Inicie o terminal do Antigravity no diretório do projeto:

```bash
agy
# Dentro do prompt do Antigravity, execute:
/setup
```

O comando `/setup` oferece três caminhos:
1.  **Caminho A (Pasta de Documentos):** Coloque seus currículos antigos, PDFs do LinkedIn, diplomas e referências na pasta `documents/`. O agente fará a leitura cruzada e montará seu perfil.
2.  **Caminho B (Importação Única de CV):** Cole seu currículo diretamente no chat ou mencione o arquivo usando `@`.
3.  **Caminho C (Modo Entrevista):** Responda às perguntas do agente de forma conversacional.

### 4. Buscar vagas

```
/scrape
```

Este comando pesquisa em múltiplos portais por vagas compatíveis com suas preferências de localidade e cargo, elimina duplicidades e as exibe ordenadas por afinidade com seu perfil.

### 5. Candidatar-se a uma vaga

```
/apply https://jobindex.dk/job/1234567
```

Se o portal bloquear acessos automatizados, você pode colar a descrição textual da vaga diretamente:

```
/apply <cole a descrição da vaga aqui>
```

Isso dispara o fluxo completo: avaliação de compatibilidade, geração de currículo e carta de apresentação em LaTeX, revisão com subagente secundário e compilação do PDF final.

---

## Outros Comandos

Com o perfil ativo, você pode chamar os seguintes comandos adicionais no Antigravity:

*   **`/expand`**: Enriquece seu perfil varrendo fontes públicas vinculadas (como repositórios GitHub, portfólio, Google Scholar) e ementas de cursos/certificações informadas.
*   **`/upskill`**: Compara seu perfil técnico com as vagas salvas (ou com uma vaga informada por URL) e gera um mapa de lacunas de conhecimento técnico acompanhado de fontes de estudo sugeridas pela internet.
*   **`/add-template`**: Registra seu próprio template LaTeX de currículo ou carta no framework em substituição aos modelos padrão.
*   **`/add-portal`**: Cria e parametriza um novo script de busca (Skill) para portais de emprego específicos do seu país ou mercado local.
*   **`/reset`**: Remove os dados cadastrais criados para permitir recomeçar o onboarding do zero.

---

## Estrutura de Arquivos

```
ai-job-search/
├── ANTIGRAVITY.md                      # Diretrizes e perfil resumido de candidatura
├── .agents/
│   ├── rules/
│   │   └── general.md                  # Regras de workspace persistentes lidas pelo Antigravity
│   ├── skills/
│   │   ├── apply.md                    # Fluxo de candidatura (/apply)
│   │   ├── setup.md                    # Onboarding (/setup)
│   │   ├── expand.md                   # Expansão de perfil (/expand)
│   │   ├── add-template.md             # Cadastro de templates (/add-template)
│   │   ├── add-portal.md               # Scaffolder de portais (/add-portal)
│   │   ├── reset.md                    # Reset de dados (/reset)
│   │   ├── job-application-assistant/  # Dados internos estruturados do perfil
│   │   │   ├── SKILL.md
│   │   │   ├── 01-candidate-profile.md
│   │   │   ├── 02-behavioral-profile.md
│   │   │   ├── 03-writing-style.md
│   │   │   ├── 04-job-evaluation.md
│   │   │   ├── 05-cv-templates.md
│   │   │   ├── 06-cover-letter-templates.md
│   │   │   └── 07-interview-prep.md
│   │   ├── job-scraper/                # Mecanismo de busca e consultas
│   │   │   ├── SKILL.md
│   │   │   └── search-queries.md
│   │   ├── upskill/                    # Mapeador de competências (/upskill)
│   │   │   └── SKILL.md
│   │   ├── jobbank-search/             # Ferramentas locais de scrapers
│   │   ├── jobdanmark-search/
│   │   ├── jobindex-search/
│   │   ├── jobnet-search/
│   │   ├── gupy-search/                # Skill de busca na Gupy (Brasil)
│   │   ├── programathor-search/        # Skill de busca na Programathor (Brasil)
│   │   ├── apinfo-search/              # Skill de busca na APInfo (Brasil)
│   │   └── linkedin-search/            # Skill de busca no LinkedIn (global)
│   └── agents/
│       └── gemini-research-expert.md   # Configuração de subagente de pesquisa
├── cv/
│   └── main_example.tex                # Template moderno de CV em LaTeX
├── cover_letters/
│   ├── cover.cls                       # Classe LaTeX customizada da carta
│   └── OpenFonts/                      # Fontes de texto (Lato / Raleway)
├── templates/                          # Pasta de templates adicionados via /add-template
├── documents/                          # Documentos-fonte (currículos, certificados)
├── salary_lookup.py                    # Script de busca de média salarial
├── tools/                              # Scripts utilitários de tratamento de dados
├── job_scraper/                        # Estado das vagas já pesquisadas
├── upskill/                            # Relatórios gerados pelo comando /upskill
├── job_search_tracker.csv              # Planilha de controle de candidaturas
└── SETUP.md                            # Guia de configuração original
```

---

## Créditos e Agradecimentos

*   Fork adaptado a partir do projeto original [ai-job-search](https://github.com/MadsLorentzen/ai-job-search).
*   [Mikkel Krogholm](https://github.com/mikkelkrogsholm) ([skills repo](https://github.com/mikkelkrogsholm/skills)) pelo desenvolvimento dos scripts das ferramentas de vagas locais.
*   Desenvolvido sobre o ecossistema [Google Antigravity](https://antigravity.google).

---

## Licença

MIT
