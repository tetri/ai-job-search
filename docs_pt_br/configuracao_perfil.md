# Configuração de Perfil Profissional e Consultas de Busca

O coração do **AI Job Search** é a profundidade e a precisão do seu perfil profissional. Quanto mais rico em detalhes ele for, melhor o Antigravity conseguirá adaptar seus currículos e cartas de apresentação para cada vaga.

---

## 📁 Estrutura de Arquivos do Perfil

Os arquivos de dados do seu perfil residem no diretório `.agents/skills/job-application-assistant/`:

```
.agents/skills/job-application-assistant/
├── 01-candidate-profile.md     # Currículo estruturado (experiência, educação, skills)
├── 02-behavioral-profile.md    # Perfil comportamental (PI/DISC/Myers-Briggs)
├── 03-writing-style.md         # Diretrizes de estilo de escrita e tom de voz
├── 04-job-evaluation.md        # Matriz de pesos e pontuação de compatibilidade
├── 05-cv-templates.md          # Templates de introdução do CV por tipo de cargo
├── 06-cover-letter-templates.md# Blocos e estruturas padrão de cartas
└── 07-interview-prep.md        # Exemplos no formato STAR para preparação de entrevistas
```

### 1. `01-candidate-profile.md`
Este arquivo abriga seus dados cadastrais, histórico de educação formal, cargos anteriores com descrição detalhada de realizações e ferramentas utilizadas, publicações, prêmios e contatos de referências profissionais.
*   *Dica de Qualidade:* Não se limite a listar cargos e datas. Adicione bullets ricos com projetos reais executados, tecnologias utilizadas e números/resultados obtidos.

### 2. `02-behavioral-profile.md`
Contém avaliações de personalidade (como Predictive Index - PI, DISC ou Myers-Briggs) ou resumos autoavaliados sobre como você trabalha melhor em equipe, quais ambientes o desmotivam e suas preferências de liderança. O Antigravity usa estes dados para garantir que a voz da sua carta de apresentação seja autêntica.

### 3. `03-writing-style.md`
Define regras de estilo de escrita (como evitar clichês corporativos, não utilizar traços em excesso e manter frases curtas e diretas).

### 4. `04-job-evaluation.md`
Este arquivo instrui o agente sobre como classificar a compatibilidade de uma vaga. Ele divide suas competências em áreas de **Forte Compatibilidade** (suas habilidades primárias), **Compatibilidade Moderada** (suas habilidades secundárias) e **Gargalos** (tecnologias que você ainda não domina ou restrições de distância física e salário).

### 5. `07-interview-prep.md`
Contém respostas estruturadas no modelo **STAR (Situação, Tarefa, Ação, Resultado)** baseadas na sua história. Quando você passar para as fases de entrevista de uma vaga, o Antigravity utilizará este arquivo para treinar você para as perguntas mais comuns.

---

## 🔍 Configuração de Consultas de Busca (`search-queries.md`)

O comando `/scrape` utiliza o arquivo `.agents/skills/job-scraper/search-queries.md` para rodar buscas nos portais de emprego.

Este arquivo contém uma coleção de termos de busca ordenados por prioridade e filtros de portais específicos:

*   **Priority 1 (Foco Principal):** Termos para cargos de maior desejo (ex: "Data Scientist", "Machine Learning Engineer").
*   **Priority 2 (Especialização de Domínio):** Termos que cruzam suas habilidades com seu nicho de atuação acadêmico ou setorial (ex: "Geophysics Python", "Seismic Data Analyst").
*   **Priority 3 (Adjacentes/Pivô):** Cargos que você tem capacidade de assumir mesmo não sendo o foco principal (ex: "Data Analyst", "Software Developer").

Ele também define limites geográficos e filtros específicos para o mercado de atuação (como as cidades toleráveis para deslocamento diário e se aceita regimes híbridos/remotos).
