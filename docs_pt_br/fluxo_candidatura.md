# Fluxo de Candidatura (/apply)

O comando `/apply` executa um pipeline de ponta a ponta para preparar sua candidatura a uma vaga de emprego específica. Este fluxo foi projetado sob o padrão **Drafter-Reviewer (Redator-Revisor)** com verificação automatizada de layout em LaTeX.

---

## 🔄 Visão Geral do Pipeline de Execução

Quando você executa `/apply <URL_da_vaga>` (ou cola a descrição de texto direto no prompt), o Antigravity realiza as seguintes etapas:

```
[Entrada: Vaga] ➔ [1. Avaliação de Fit] ➔ [2. Rascunho Inicial (CV/Carta)]
                                                       │
[5. Apresentação] 🖎 [4. Inspeção do PDF] 🎚 [3. Revisão (Subagente)]
```

### 1. Avaliação de Fit (Compatibilidade)
O Antigravity lê o seu perfil profissional em `.agents/skills/job-application-assistant/01-candidate-profile.md` e o perfil comportamental em `02-behavioral-profile.md`. Ele então compara esses dados com a descrição da vaga e exibe uma tabela de análise contendo:
*   **Habilidades Técnicas:** Correspondência de skills vs. lacunas.
*   **Experiência Requerida:** Como sua história profissional se conecta aos requisitos.
*   **Ajuste de Cultura:** Análise de tom comportamental.
*   **Média Salarial:** (Opcional) Executa o script `salary_lookup.py` se houver banco de dados configurado para a empresa/cargo.
*   **Veredito:** Classificação de compatibilidade (Forte / Moderada / Fraca) e recomendação se você deve ou não entrar em contato com o recrutador antes de submeter.

*O agente perguntará se deve continuar com a geração do currículo e carta.*

### 2. Rascunho Inicial (Drafter)
Se você aprovar, o Antigravity cria dois rascunhos em LaTeX:
*   **Currículo (`cv/main_<empresa>.tex`):** Redigido sempre em inglês, adaptando os bullets de experiência e resumo profissional para destacar as habilidades mais valorizadas na vaga. É limitado estritamente a 2 páginas.
*   **Carta de Apresentação (`cover_letters/cover_<empresa>_<cargo>.tex`):** Escrita no idioma da descrição da vaga (se a vaga estiver em dinamarquês, a carta será em dinamarquês). Utiliza um estilo de comunicação focado em conquistas passadas e impacto futuro.

### 3. Revisão Crítica (Reviewer)
O Antigravity cria um subagente especializado em recrutamento (`invoke_subagent`). Este revisor realiza uma pesquisa web rápida sobre a empresa (valores, produtos recentes, notícias) e analisa os rascunhos gerados sem saber que foram escritos por IA. Ele retorna:
*   **Sugestões estruturadas:** Pequenos ajustes e inclusão de palavras-chave da vaga que o redator original possa ter esquecido.
*   **Análise de Tom:** Garante que a carta de apresentação corresponda ao seu perfil de comportamento natural (definido no onboarding). Por exemplo, se seu perfil é mais voltado à colaboração, o tom não deve ser agressivo ou egocêntrico.

*O Antigravity aplica os ajustes automaticamente de forma direcionada.*

### 4. Compilação e Inspeção Visual (Mandatório)
Esta é a fase crítica. O Antigravity executa localmente:
*   `cv/lualatex` para gerar o PDF do currículo.
*   `cover_letters/xelatex` para gerar a carta de apresentação.

Após a compilação, o Antigravity **lê visualmente o PDF** para realizar as seguintes verificações de layout:
*   **O Currículo possui exatamente 2 páginas?** Caso tenha estourado para 3 páginas, o agente aplica um algoritmo de exclusão ponderado (corta as linhas de menor relevância para a vaga até caber em 2 páginas). Ele também insere diretivas LaTeX como `\needspace` para evitar que títulos de cargos fiquem "órfãos" no rodapé de uma página com o texto na página seguinte.
*   **A Carta possui exatamente 1 página?** Garante que a assinatura e o encerramento caibam na primeira página sem estourar e que a fonte dos bullets coincida exatamente com a fonte do corpo do texto.

### 5. Apresentação Final
O Antigravity limpa os arquivos auxiliares de compilação LaTeX (`.aux`, `.log`, `.out`), apresenta uma lista de verificação final e disponibiliza os arquivos prontos.

---

## 💡 Dicas para Melhores Resultados

1.  **Nunca invente informações:** O Antigravity é programado para nunca fabricar conquistas ou habilidades que não constem no seu perfil do onboarding. Se você tiver uma lacuna de conhecimento exigido na vaga, o agente a reconhecerá de forma honesta no currículo ou focará em competências correlatas.
2.  **Facilidade de Edição:** Se você quiser realizar pequenos ajustes manuais antes da compilação visual do PDF, você pode editar diretamente os arquivos `.tex` e pedir para o Antigravity re-compilar.
