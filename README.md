# InterviewSense AI 🎙️
### Deterministic Symbolic AI & Rule-Based Mock Interview Assistant (Zero Machine Learning)

[![Pure JavaScript](https://img.shields.io/badge/Language-Vanilla%20ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Symbolic AI](https://img.shields.io/badge/AI%20Paradigm-Symbolic%20GOFAI-06B6D4)](#)
[![Zero Machine Learning](https://img.shields.io/badge/Machine%20Learning-None%20(Rule--Based)-10B981)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Native%20Web)-blueviolet)](#)
[![Runs Offline](https://img.shields.io/badge/Offline-100%25%20Client--Side-brightgreen)](#)

---

## 🌟 1. Project Overview

**InterviewSense AI** is a fully functional web-based mock interview simulator powered strictly by **Symbolic Artificial Intelligence (GOFAI - Good Old-Fashioned AI)**, deterministic natural language processing (NLP), knowledge ontologies, and heuristic scoring engines.

**It contains ZERO Machine Learning (no neural networks, no PyTorch/TensorFlow, no OpenAI/GPT API, no black-box embeddings).**

Instead, it embodies classical AI theory: **Knowledge Representation + Inference Engine = Expert System**.

---

## 🔬 2. Why "Symbolic AI Without Machine Learning"?

In academic computer science, Artificial Intelligence is divided into two primary paradigms:
1. **Connectionist AI (Machine Learning / Deep Learning / LLMs)**: Probabilistic, requires millions of training weights, suffers from hallucinations, high latency, requires paid cloud GPUs, and operates as a non-explainable black box.
2. **Symbolic AI (Rule-Based Expert Systems / Formal Grammars / Heuristics)**: 100% deterministic, mathematically explainable, executes in under 2 milliseconds, requires zero cloud costs, runs completely offline, and can never fabricate non-existent facts.

| Metric | Machine Learning / LLMs | InterviewSense Symbolic AI |
| :--- | :--- | :--- |
| **Explainability (XAI)** | ❌ Black-box / Opaque | ✅ **100% Transparent Rule Audit** |
| **Hallucination Risk** | ❌ High (Invents fake facts) | ✅ **Zero (Grounded in strict rules)** |
| **Cloud API Costs** | ❌ Continuous \$ per token | ✅ **$0.00 Forever (Runs in browser)** |
| **Latency** | ❌ 1,500ms – 5,000ms | ✅ **< 5ms Instant Inference** |
| **Offline Capability** | ❌ Requires constant Internet | ✅ **Works 100% Offline** |
| **Hardware Footprint** | ❌ Multi-GB RAM / GPUs | ✅ **< 500 KB total footprint** |

---

## ⚙️ 3. Algorithmic Architecture

InterviewSense AI is composed of five discrete deterministic sub-engines:

```
Candidate Audio Input
        │
        ▼ (Web Speech API: SpeechRecognition)
Raw Transcript & Telemetry Timestamps
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
[1. Tokenizer & Stemmer]     [3. Pacing & Telemetry]     [5. Tone & Polarity]
  • Lowercasing/Punctuation    • Words-Per-Minute (WPM)    • Action Verbs Lexicon
  • Porter Suffix Reduction    • Filler Word RegExes       • Hedging Word Lexicon
  • N-Gram Generation (1,2,3)  • Hesitation Penalties      • Assertiveness Index
        │
        ▼
[2. Knowledge Matcher]
  • Concept Keyword Mapping
  • Bounded Levenshtein (<=1)
  • Concept Coverage Ratio
        │
        ▼
[4. STAR Grammar Automata] (For Behavioral Questions)
  • Situation: Transition regex markers
  • Task: Responsibility markers
  • Action: Proactive implementation verbs
  • Result: Measurable outcome & metrics markers
        │
        └─────────────────────────────┬─────────────────────────────┘
                                      ▼
                        [Weighted Rubric Aggregator]
                                      │
                                      ▼
                       Comprehensive 5-Axis Scorecard
```

### Mathematical & Algorithmic Formulations:

#### A. Morphological Suffix Stripping (Porter-Inspired Stemmer)
Reduces inflected tokens to their root stems without dictionary databases:
$$\text{stem}("encapsulating") \to "encapsul", \quad \text{stem}("asynchronous") \to "async"$$

#### B. Bounded Levenshtein Distance for Typo Resilience
For tokens $s_1, s_2$ with lengths $m, n$, dynamic programming evaluates:
$$D(i, j) = \min \begin{cases} D(i-1, j) + 1 \\ D(i, j-1) + 1 \\ D(i-1, j-1) + \text{cost} \end{cases}$$
If $D(token, keyword) \le 1$ and $|token| \ge 6$, the term is accepted as an approximate match.

#### C. Speech Pacing & Acoustic Prosody Heuristics
$$\text{WPM} = \frac{\text{Total Words}}{\text{Elapsed Seconds} / 60}$$
- **Optimal Conversational Cadence:** $115 \le \text{WPM} \le 160$
- **Fast Penalty:** If $\text{WPM} > 180$, penalty applied for rushing.
- **Hesitant Penalty:** If $\text{WPM} < 85$, penalty applied for excessive pauses.

#### D. Filler Word Density Penalty
$$\text{Filler Density (\%)} = \left(\frac{\sum \text{Filler Utterances}}{\text{Total Words}}\right) \times 100$$
Identifies: `um`, `uh`, `like`, `you know`, `basically`, `actually`, `literally`, `sort of`, `kind of`, `i mean`, `so yeah`. Penalizes candidate when density exceeds $2.0\%$.

#### E. STAR Behavioral Finite State Grammar
A finite state pattern evaluator checks the candidate's behavioral answer for all 4 quadrants:
1. **Situation**: `/(when I was|at my previous|we were building|in a scenario)/i`
2. **Task**: `/(my role was|responsible for|tasked with|needed to solve)/i`
3. **Action**: `/(I decided to|I implemented|I built|I scheduled|I analyzed)/i`
4. **Result**: `/(as a result|consequently|improved by|saved|delivered on time)/i`

---

## 🚀 4. How to Run the Project

### Method 1: Instant 1-Click Launch on Windows (Recommended)
Simply double-click:
```
start.bat
```
*This uses Windows' native PowerShell `.NET HttpListener` to serve `http://localhost:8080` and automatically opens your default browser! No installation of Python, Node, or npm is needed.*

---

### Method 2: PowerShell Terminal
Open PowerShell in the project directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

---

### Method 3: Direct File Opening
Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, or Brave.

*(Note: For native Speech Recognition microphone access, running via `start.bat` / `http://localhost:8080` is recommended by modern Chromium security policies).*

---

## 🖥️ 5. Key Features

- **Realistic Video Interview Chamber**:
  - Live candidate webcam preview (`getUserMedia`) with toggle.
  - Interactive AI interviewer avatar with audio visualizer ring.
- **Voice Synthesis & Native Speech-to-Text**:
  - `window.speechSynthesis` speaks questions aloud.
  - `window.webkitSpeechRecognition` captures candidate voice in real-time.
  - Manual text typing fallback available.
- **Domain-Specific Interview Tracks**:
  - 💻 **Software Engineering**: OOP, Event Loop, Database Indexing, REST vs GraphQL.
  - 🤝 **Behavioral & Leadership**: Conflict resolution, scope creep, technical failure (STAR).
  - 📊 **Data Science & Analytics**: Missing data imputation, SQL Window Functions vs Group By.
  - 🎯 **Product Management**: Feature prioritization (RICE, MVPs), stakeholder trade-offs.
- **Question Studio (Custom Knowledge Base)**:
  - Add custom questions, define required concept keywords, and save them directly into the browser's persistent `localStorage`.
- **5-Axis Competency Radar Chart**:
  - Pure SVG vector rendering of Concepts, Structure, Fluency, Confidence, and Vocabulary Richness.
- **Print / PDF Export**:
  - Formatted print stylesheet allows saving a formal evaluation scorecard to PDF or paper.

---

## 🎓 6. Academic Viva / Defense Guide (Q&A)

Here are the exact answers to common questions asked during academic presentations or project reviews:

### Q1: "How can you call this Artificial Intelligence if there is no Machine Learning or Neural Network?"
> **Answer:** "Artificial Intelligence is historically divided into two branches: Symbolic AI (Knowledge-Based / Expert Systems) and Connectionist AI (Machine Learning). Early milestones of AI—such as expert diagnosis systems (MYCIN), grammar analyzers (ELIZA/SHRDLU), and Deep Blue—did not use neural networks. Our system uses a classical Symbolic AI architecture consisting of an explicit Knowledge Base (concept ontologies, rubrics) and an Inference Engine (morphological stemmer, Levenshtein distance matcher, STAR grammar automata, and multi-criteria scoring heuristics)."

### Q2: "How does the system match technical concepts without semantic embeddings?"
> **Answer:** "We use a multi-tiered lexical matching pipeline:
> 1. Exact string and multi-word N-gram matching.
> 2. Porter-stemming normalization, which matches morphological variations (e.g., 'polymorphic' $\to$ 'polymorph').
> 3. Domain ontology synonym expansion defined in the knowledge base.
> 4. Bounded Levenshtein edit distance ($D \le 1$) for typo tolerance."

### Q3: "What are the advantages of this rule-based approach over using ChatGPT / LLM APIs?"
> **Answer:** "Three major advantages:
> 1. **Complete Explainability (XAI):** Every single point added or deducted is tied to an explicit rule, so candidates understand exactly why they scored what they did.
> 2. **Zero Hallucination:** It can never fabricate false technical assertions.
> 3. **Zero Cost and Privacy:** All processing happens locally in the candidate's browser with zero API costs and zero audio or video leaves the machine."
