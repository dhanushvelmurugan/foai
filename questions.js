/**
 * questions.js - Symbolic AI Knowledge Base
 * 
 * Contains domain-specific interview tracks, questions,
 * target conceptual milestones, synonyms, rubrics, and model benchmark answers.
 * This represents the "Knowledge Base" component of a classical Rule-Based Expert System.
 */

const INTERVIEW_KNOWLEDGE_BASE = {
  swe: {
    id: "swe",
    name: "Software Engineering",
    icon: "💻",
    description: "OOP principles, web protocols, asynchronous execution, database indexing, and system architecture.",
    questions: [
      {
        id: "swe-1",
        difficulty: "Mid",
        question: "Explain the four core principles of Object-Oriented Programming (OOP) and give a brief real-world example of Polymorphism.",
        hints: [
          "Recall the acronym A-P-I-E (Abstraction, Polymorphism, Inheritance, Encapsulation).",
          "For polymorphism, think about compile-time (overloading) vs runtime (overriding / interface implementation)."
        ],
        targetConcepts: [
          {
            name: "Encapsulation",
            keywords: ["encapsulation", "data hiding", "private", "getters", "setters", "bundle", "bundling"],
            weight: 20,
            description: "Bundling data and methods that operate on that data, restricting direct access."
          },
          {
            name: "Inheritance",
            keywords: ["inheritance", "subclass", "superclass", "parent", "child", "extends", "reusability", "derive"],
            weight: 20,
            description: "Mechanism where a new class derives properties and behaviors from an existing class."
          },
          {
            name: "Polymorphism",
            keywords: ["polymorphism", "many forms", "overriding", "overloading", "runtime", "compile-time", "interface", "dynamic dispatch"],
            weight: 25,
            description: "Ability of different classes to respond to the same method call in their own specific way."
          },
          {
            name: "Abstraction",
            keywords: ["abstraction", "hiding complexity", "abstract class", "interface", "essential features", "simplification"],
            weight: 20,
            description: "Hiding internal implementation details and showing only the essential features."
          },
          {
            name: "Real-World Polymorphism Example",
            keywords: ["shape", "draw", "animal", "sound", "payment", "credit card", "paypal", "vehicle", "drive", "speaker"],
            weight: 15,
            description: "Concrete illustration such as PaymentProcessor accepting PayPal or CreditCard, or Shape with draw()."
          }
        ],
        starRequired: false,
        antiPatterns: [
          { pattern: /only\s+inheritance/i, penalty: 10, reason: "Claimed OOP is only about inheritance." },
          { pattern: /global\s+variable/i, penalty: 15, reason: "Advocating global variables directly violates encapsulation." }
        ],
        idealAnswer: "The four core pillars of Object-Oriented Programming are Encapsulation (bundling data and restricting direct access via access modifiers), Abstraction (hiding implementation complexity and exposing clean interfaces), Inheritance (enabling code reuse where derived classes inherit traits from a base class), and Polymorphism (allowing entities to take multiple forms). A classic real-world example of polymorphism is a PaymentGateway interface with a processPayment() method; different subclasses like CreditCardPayment, PayPalPayment, and CryptoPayment each implement their own payment logic while the caller invokes the identical method interface seamlessly.",
        minWordCount: 50,
        idealDurationSec: 90
      },
      {
        id: "swe-2",
        difficulty: "Mid",
        question: "How does the JavaScript Event Loop work, and what is the difference between the Microtask Queue and the Macrotask Queue?",
        hints: [
          "Mention single-threaded execution, call stack, and Web APIs.",
          "Promises go to microtasks, while setTimeout and setInterval go to macrotasks.",
          "Which queue has priority when the call stack empties?"
        ],
        targetConcepts: [
          {
            name: "Single-Threaded Call Stack",
            keywords: ["single-threaded", "call stack", "execution context", "stack", "one thing at a time", "v8"],
            weight: 20,
            description: "JS has one call stack and executes synchronously one frame at a time."
          },
          {
            name: "Event Loop Mechanism",
            keywords: ["event loop", "monitors", "checks", "empty stack", "dequeues", "orchestrates", "coordinating"],
            weight: 25,
            description: "Continuously checks if call stack is empty and moves queued callbacks onto the stack."
          },
          {
            name: "Microtask Queue (High Priority)",
            keywords: ["microtask", "promises", "promise", ".then", "mutationobserver", "queueMicrotask", "priority", "drained first"],
            weight: 25,
            description: "Holds promises/mutation callbacks; completely cleared before any next macrotask runs."
          },
          {
            name: "Macrotask Queue / Callback Queue",
            keywords: ["macrotask", "task queue", "settimeout", "setinterval", "setimmediate", "i/o", "event listener"],
            weight: 20,
            description: "Holds timers and UI events; runs one task per tick after microtasks are depleted."
          },
          {
            name: "Execution Priority Order",
            keywords: ["order", "before", "drain", "priority", "first", "clear all microtasks"],
            weight: 10,
            description: "Explicitly states that all microtasks execute before the next macrotask."
          }
        ],
        starRequired: false,
        antiPatterns: [
          { pattern: /javascript is multi-threaded by default/i, penalty: 15, reason: "JavaScript main thread is single-threaded." }
        ],
        idealAnswer: "JavaScript is single-threaded, meaning it has a single call stack executing synchronous code. Asynchronous operations are delegated to browser Web APIs. Once finished, their callbacks enter either the Microtask Queue (Promises, queueMicrotask) or the Macrotask Queue (setTimeout, setInterval, I/O). The Event Loop constantly monitors the Call Stack. As soon as the stack is completely empty, it first exhausts all pending Microtasks until that queue is empty, and only then executes the next single Macrotask. This priority order explains why Promise.then() callbacks always execute before setTimeout(..., 0).",
        minWordCount: 55,
        idealDurationSec: 90
      },
      {
        id: "swe-3",
        difficulty: "Senior",
        question: "How do database indexes speed up read queries, and what is the trade-off when performing write, update, or delete operations?",
        hints: [
          "Mention data structures like B-Trees or B+ Trees.",
          "Compare full table scans O(N) to index lookups O(log N).",
          "Explain the write overhead (maintaining index balance, disk I/O)."
        ],
        targetConcepts: [
          {
            name: "Data Structure (B-Tree / B+ Tree)",
            keywords: ["b-tree", "b+ tree", "balanced tree", "hash index", "binary search", "ordered", "data structure"],
            weight: 25,
            description: "Indexes typically use B/B+ trees to keep keys sorted for fast logarithmic lookups."
          },
          {
            name: "Read Query Acceleration",
            keywords: ["lookup", "search", "o(log n)", "table scan", "full scan", "fast", "pointers", "row pointer"],
            weight: 25,
            description: "Avoids costly O(N) sequential table scans by traversing the index in O(log N)."
          },
          {
            name: "Write / Insert / Update Overhead",
            keywords: ["write penalty", "insert", "update", "delete", "slower", "overhead", "rebalance", "disk i/o"],
            weight: 30,
            description: "Every insert or delete requires updating and rebalancing all corresponding index trees."
          },
          {
            name: "Storage / Memory Consumption",
            keywords: ["disk space", "storage", "memory", "ram", "footprint", "space complexity"],
            weight: 20,
            description: "Indexes consume auxiliary storage on disk and memory in the buffer pool."
          }
        ],
        starRequired: false,
        antiPatterns: [
          { pattern: /indexes make writes faster/i, penalty: 20, reason: "Indexes slow down writes due to tree rebalancing." }
        ],
        idealAnswer: "Database indexes work like the index at the back of a textbook. Instead of performing a sequential full table scan with O(N) time complexity, the database creates an auxiliary data structure—most commonly a B+ Tree. The B+ Tree keeps indexed columns sorted, allowing the database engine to locate target row pointers in O(log N) operations. The primary trade-off is write degradation: every time an INSERT, UPDATE, or DELETE occurs, the database must not only modify the table rows but also update and rebalance the B+ Tree index structures. Additionally, indexes consume extra disk space and RAM in the buffer pool.",
        minWordCount: 50,
        idealDurationSec: 80
      },
      {
        id: "swe-4",
        difficulty: "Junior",
        question: "What is the difference between REST APIs and GraphQL, and in what scenario would you choose GraphQL over REST?",
        hints: [
          "Mention endpoints, over-fetching and under-fetching.",
          "Describe client-driven querying vs fixed server response models."
        ],
        targetConcepts: [
          {
            name: "Over-fetching & Under-fetching",
            keywords: ["over-fetching", "under-fetching", "too much data", "multiple requests", "round trips", "payload size"],
            weight: 30,
            description: "GraphQL solves REST's issue of returning unneeded fields or needing multiple endpoints."
          },
          {
            name: "Endpoint Architecture",
            keywords: ["single endpoint", "multiple endpoints", "url", "verbs", "get post", "route"],
            weight: 20,
            description: "REST relies on multiple resource URLs; GraphQL typically exposes a single POST endpoint."
          },
          {
            name: "Client Query Flexibility",
            keywords: ["declarative", "schema", "query", "client defines", "exact fields", "custom shape"],
            weight: 25,
            description: "With GraphQL, the client requests exactly the fields it requires."
          },
          {
            name: "Use Case / Trade-offs",
            keywords: ["mobile", "low bandwidth", "complex relationships", "caching", "http caching", "dashboard"],
            weight: 25,
            description: "GraphQL shines in mobile/low-bandwidth apps or composite UIs; REST is simpler for HTTP caching."
          }
        ],
        starRequired: false,
        antiPatterns: [],
        idealAnswer: "REST is an architectural style based on fixed resource endpoints accessed via standard HTTP verbs (GET, POST, PUT, DELETE). Its main drawbacks are over-fetching (receiving extraneous fields) and under-fetching (requiring multiple waterfall network requests to assemble related entities). In contrast, GraphQL exposes a single endpoint where clients submit declarative queries requesting exactly the fields they need. You would favor GraphQL for mobile apps where bandwidth is constrained, or complex frontends that consume deeply nested relational data across multiple entities.",
        minWordCount: 50,
        idealDurationSec: 80
      }
    ]
  },

  behavioral: {
    id: "behavioral",
    name: "Behavioral & Leadership",
    icon: "🤝",
    description: "Evaluates conflict resolution, deadline management, ownership, and adherence to the STAR framework.",
    questions: [
      {
        id: "beh-1",
        difficulty: "Mid",
        question: "Tell me about a time when you faced a serious technical conflict or disagreement with a teammate. How did you resolve it?",
        hints: [
          "Structure your response strictly using STAR: Situation, Task, Action, Result.",
          "Focus on objective data, active listening, and putting project goals above ego."
        ],
        targetConcepts: [
          {
            name: "Situation Context",
            keywords: ["project", "deadline", "architecture", "choice", "disagreement", "team", "colleague", "proposal"],
            weight: 20,
            description: "Sets up the background context and the nature of the disagreement."
          },
          {
            name: "Objective Evaluation & Data",
            keywords: ["data", "benchmark", "proof of concept", "poc", "metrics", "pros and cons", "trade-offs", "testing"],
            weight: 25,
            description: "Resolved conflict through empirical testing or objective trade-off evaluation rather than argument."
          },
          {
            name: "Professional Communication & Empathy",
            keywords: ["listen", "discussed", "compromise", "consensus", "meeting", "perspective", "respectful", "alignment"],
            weight: 25,
            description: "Showed maturity, open communication, and collaborative conflict resolution."
          },
          {
            name: "Measurable Outcome & Reflection",
            keywords: ["delivered", "result", "on time", "learned", "performance", "successful", "relationship", "retrospective"],
            weight: 30,
            description: "Demonstrates positive project outcome and preserved working relationship."
          }
        ],
        starRequired: true,
        antiPatterns: [
          { pattern: /he was completely wrong/i, penalty: 15, reason: "Blaming teammate instead of focusing on constructive solutions." },
          { pattern: /i ignored him/i, penalty: 20, reason: "Ignoring a teammate shows poor collaboration." }
        ],
        idealAnswer: "In my previous engineering project (Situation), our frontend teammate and I disagreed on whether to use server-side rendering with Next.js or a single-page React app with Vite for our client portal. My responsibility was to ensure fast page load speeds and SEO indexing (Task). Instead of engaging in subjective debates, I scheduled a focused working session where we built quick Proof-of-Concepts for both approaches and ran automated Lighthouse audits (Action). The data showed Next.js delivered a 40% faster Largest Contentful Paint, but Vite offered faster developer build times. We reached a consensus to use Next.js for public pages and standard React client routes for the authenticated dashboard. As a result (Result), we shipped two weeks ahead of schedule with 95+ performance scores and forged a strong partnership.",
        minWordCount: 70,
        idealDurationSec: 120
      },
      {
        id: "beh-2",
        difficulty: "Mid",
        question: "Describe a situation where a critical deadline was at risk due to scope creep or unforeseen blockers. How did you handle it?",
        hints: [
          "Use STAR method.",
          "Discuss prioritization (MoSCoW / MVP), stakeholder communication, and transparent trade-offs."
        ],
        targetConcepts: [
          {
            name: "Situation & Root Cause",
            keywords: ["deadline", "timeline", "scope creep", "blocker", "unexpected", "delay", "deliverable", "client"],
            weight: 20,
            description: "Clearly identifies the project context and root cause of the schedule pressure."
          },
          {
            name: "Prioritization & Scope Triage",
            keywords: ["mvp", "prioritized", "triage", "must-have", "nice-to-have", "deferred", "core features", "cut scope"],
            weight: 30,
            description: "Applied logical prioritization to preserve delivery of core customer value."
          },
          {
            name: "Transparent Stakeholder Communication",
            keywords: ["stakeholder", "manager", "communicated", "early", "transparent", "trade-offs", "options", "aligned"],
            weight: 25,
            description: "Proactively informed stakeholders with solutions rather than last-minute surprises."
          },
          {
            name: "Successful Delivery & Post-Mortem",
            keywords: ["launched", "on time", "delivered", "phase 2", "milestone", "post-mortem", "quality", "outcome"],
            weight: 25,
            description: "Met the core deadline without sacrificing system stability, planning deferred items for later."
          }
        ],
        starRequired: true,
        antiPatterns: [
          { pattern: /worked 80 hours with no communication/i, penalty: 15, reason: "Silent burnout overwork is an anti-pattern compared to proper stakeholder management." }
        ],
        idealAnswer: "During a major quarterly release (Situation), our product team requested three new complex report export features two weeks prior to launch, putting our delivery date in jeopardy (Task). Recognizing the risk, I conducted a rapid scope audit with the engineering leads and categorized all deliverables into 'Must-Have MVP' and 'Phase 2 Enhancements' (Action). I then presented these transparent trade-offs to the product manager and executive sponsors, demonstrating that shipping the core portal on time while deferring advanced CSV custom exports by two sprints would protect platform stability. The stakeholders agreed. Consequently (Result), we launched the core platform exactly on the promised launch date with zero critical defects, and successfully rolled out the deferred exports three weeks later.",
        minWordCount: 65,
        idealDurationSec: 110
      },
      {
        id: "beh-3",
        difficulty: "Junior",
        question: "Tell me about a time you made a mistake or experienced a technical failure. What happened and what did you learn?",
        hints: [
          "Admit the mistake openly—interviewers look for accountability and maturity.",
          "Explain the root cause, immediate remediation, and what preventive safeguards you introduced."
        ],
        targetConcepts: [
          {
            name: "Accountability & Situation",
            keywords: ["bug", "mistake", "outage", "error", "broke", "production", "incident", "oversight", "took ownership"],
            weight: 25,
            description: "Takes personal ownership of the mistake without finger-pointing."
          },
          {
            name: "Immediate Remediation",
            keywords: ["rollback", "hotfix", "mitigated", "resolved", "fixed", "patch", "debugged", "notified"],
            weight: 25,
            description: "Took swift action to contain the damage and restore functionality."
          },
          {
            name: "Root Cause Analysis (RCA)",
            keywords: ["root cause", "post-mortem", "why", "investigation", "gap", "flaw", "rca", "diagnosis"],
            weight: 25,
            description: "Understood why the failure happened under the surface."
          },
          {
            name: "Preventive System Safeguards",
            keywords: ["ci/cd", "automated tests", "unit test", "validation", "monitoring", "alert", "prevented", "process"],
            weight: 25,
            description: "Installed automated tests, CI gates, or checks so the mistake can never repeat."
          }
        ],
        starRequired: true,
        antiPatterns: [
          { pattern: /was not my fault/i, penalty: 20, reason: "Deflecting blame indicates lack of accountability." }
        ],
        idealAnswer: "Early in my career, I deployed an unindexed database migration directly to our staging database that accidentally locked the active transactions table, causing a temporary test environment outage (Situation). I was responsible for that deployment pipeline (Task). I immediately owned the error, rolled back the migration, and restored database availability within 12 minutes (Action). Following the incident, I led a blameless post-mortem to analyze the root cause. To prevent this from ever happening again, I added automated query linter checks in our GitHub Actions CI pipeline to verify index presence before any migration executes, and instituted peer reviews for all DDL changes. As a result (Result), our team executed over 50 subsequent database migrations without a single lockup, and I learned the immense value of automated guardrails.",
        minWordCount: 65,
        idealDurationSec: 110
      }
    ]
  },

  data: {
    id: "data",
    name: "Data Science & Analytics",
    icon: "📊",
    description: "Data cleaning, statistical reasoning, SQL optimization, and machine learning life-cycle concepts.",
    questions: [
      {
        id: "data-1",
        difficulty: "Mid",
        question: "How do you detect and handle missing data in a tabular dataset, and what are the risks of simple mean imputation?",
        hints: [
          "Differentiate between MCAR, MAR, and MNAR (Missing Completely at Random, etc.).",
          "Explain why mean imputation distorts variance and correlation.",
          "Discuss alternatives: median, KNN, forward fill, or model-based imputation."
        ],
        targetConcepts: [
          {
            name: "Detection Techniques",
            keywords: ["isnull", "isna", "null count", "visualization", "heatmap", "summary statistics", "percentage"],
            weight: 20,
            description: "Using null counts, proportions, and visual inspection to locate missingness."
          },
          {
            name: "Risks of Mean Imputation",
            keywords: ["variance reduction", "distorts distribution", "underestimates variance", "outliers", "bias", "correlation", "covariance"],
            weight: 35,
            description: "Mean imputation artificially compresses variance and distorts relationships between features."
          },
          {
            name: "Robust Handling Strategies",
            keywords: ["median", "mode", "knn imputation", "forward fill", "backward fill", "indicator variable", "multiple imputation", "iterative"],
            weight: 30,
            description: "Employing median for skewed data, domain defaults, or multivariate algorithms."
          },
          {
            name: "Missingness Mechanism (MCAR/MAR)",
            keywords: ["mcar", "mar", "mnar", "missing at random", "systematic", "pattern"],
            weight: 15,
            description: "Recognizing whether missingness is random or conveys systematic meaning."
          }
        ],
        starRequired: false,
        antiPatterns: [
          { pattern: /always drop all nulls/i, penalty: 15, reason: "Dropping all nulls introduces severe sample bias and data loss." }
        ],
        idealAnswer: "Detecting missing values begins with exploratory data inspection using null counts, percentages, and matrix heatmaps to categorize whether data is Missing Completely at Random (MCAR), Missing at Random (MAR), or Missing Not at Random (MNAR). While simple mean imputation is easy to calculate, it carries substantial statistical risks: it artificially deflates the feature's variance, distorts covariance with other variables, and creates artificial spikes in normal distributions, especially when outliers are present. Better approaches include median imputation for skewed distributions, adding a binary 'missing indicator' column to preserve signal, or using multivariate techniques like K-Nearest Neighbors (KNN) or MICE (Multiple Imputation by Chained Equations).",
        minWordCount: 60,
        idealDurationSec: 90
      },
      {
        id: "data-2",
        difficulty: "Mid",
        question: "What is the difference between WHERE and HAVING in SQL, and how do SQL Window Functions differ from GROUP BY?",
        hints: [
          "WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY.",
          "GROUP BY collapses rows into a single summary row, while Window Functions calculate across a partition while retaining individual row identity."
        ],
        targetConcepts: [
          {
            name: "WHERE vs HAVING Timing",
            keywords: ["where filters before", "having filters after", "aggregation", "group by", "row level", "aggregate functions"],
            weight: 30,
            description: "WHERE filters raw rows prior to aggregation; HAVING filters grouped results on aggregate values."
          },
          {
            name: "GROUP BY Row Collapse",
            keywords: ["collapses", "reduces rows", "one row per group", "summary row", "aggregates"],
            weight: 25,
            description: "GROUP BY reduces multiple records into a single summary line per unique key."
          },
          {
            name: "Window Functions Preservation",
            keywords: ["window function", "over clause", "partition by", "retains individual rows", "does not collapse", "row_number", "rank"],
            weight: 35,
            description: "Window functions compute running totals/ranks over a partition without losing row-level detail."
          },
          {
            name: "Syntax / Keywords",
            keywords: ["over", "partition by", "order by", "count", "sum"],
            weight: 10,
            description: "References the OVER() clause and partition syntax."
          }
        ],
        starRequired: false,
        antiPatterns: [],
        idealAnswer: "In SQL, the WHERE clause filters individual records before any grouping or aggregation takes place, meaning you cannot use aggregate functions like SUM() or COUNT() inside a WHERE clause. In contrast, the HAVING clause filters the aggregated result sets after the GROUP BY operation has executed. Furthermore, GROUP BY collapses multiple rows into a single summary row per group. SQL Window Functions (utilizing the OVER and PARTITION BY clauses) compute running totals, ranks, or moving averages across a defined subset of rows while preserving every single individual row in the output, allowing you to compare an individual record against its group aggregate directly.",
        minWordCount: 55,
        idealDurationSec: 85
      }
    ]
  },

  pm: {
    id: "pm",
    name: "Product Management",
    icon: "🎯",
    description: "Feature prioritization frameworks, metric trade-offs, MVP scoping, and user empathy.",
    questions: [
      {
        id: "pm-1",
        difficulty: "Mid",
        question: "You have a backlog of 30 feature requests from enterprise customers and only two engineering sprints. How do you prioritize what to build?",
        hints: [
          "Reference prioritization frameworks like RICE, Kano model, or Value vs Effort matrix.",
          "Balance business impact, technical debt, and customer retention."
        ],
        targetConcepts: [
          {
            name: "Prioritization Framework",
            keywords: ["rice", "reach", "impact", "confidence", "effort", "kano", "value vs effort", "eisenhower", "scoring matrix"],
            weight: 30,
            description: "Applies a structured framework (such as RICE) rather than subjective gut feeling."
          },
          {
            name: "Strategic Alignment & Metrics",
            keywords: ["okr", "kpi", "business goals", "retention", "arr", "churn", "revenue", "strategic alignment"],
            weight: 25,
            description: "Connects feature candidates directly to company revenue or core retention objectives."
          },
          {
            name: "Stakeholder / Customer Validation",
            keywords: ["customer interviews", "enterprise tier", "contract value", "pain points", "frequency", "validation"],
            weight: 25,
            description: "Segments customers by ACV and validates true user pain points."
          },
          {
            name: "Engineering Feasibility & Scope",
            keywords: ["engineering lead", "tech lead", "feasibility", "complexity", "mvp", "dependencies", "sprint capacity"],
            weight: 20,
            description: "Partners closely with engineering leads to assess architecture dependencies."
          }
        ],
        starRequired: false,
        antiPatterns: [
          { pattern: /build whatever the loudest customer wants/i, penalty: 20, reason: "The loudest customer trap derails strategic roadmap integrity." }
        ],
        idealAnswer: "I approach high-volume backlog triage through a rigorous, transparent prioritization framework like RICE (Reach, Impact, Confidence, Effort). First, I filter requests through our current quarterly OKRs—prioritizing retention and ACV growth over one-off custom requests. Second, I partner with our Tech Lead to estimate engineering complexity and uncover underlying architectural dependencies. Third, I calculate a RICE score for each candidate, grouping related customer needs into a cohesive Minimum Viable Product (MVP) rather than fragmented point fixes. Finally, I present this prioritized backlog transparently to enterprise sales and customer success with clear data-backed rationale for what is in scope and what is scheduled for future quarters.",
        minWordCount: 55,
        idealDurationSec: 90
      }
    ]
  }
};

// Common English filler words dictionary with weight penalties
const FILLER_WORDS_LEXICON = [
  { word: "um", regex: /\bum+\b/gi, weight: 1.0 },
  { word: "uh", regex: /\buh+\b/gi, weight: 1.0 },
  { word: "like", regex: /\blike\b/gi, weight: 0.6 },
  { word: "you know", regex: /\byou\s+know\b/gi, weight: 0.8 },
  { word: "basically", regex: /\bbasically\b/gi, weight: 0.6 },
  { word: "actually", regex: /\bactually\b/gi, weight: 0.5 },
  { word: "literally", regex: /\bliterally\b/gi, weight: 0.6 },
  { word: "sort of", regex: /\bsort\s+of\b/gi, weight: 0.7 },
  { word: "kind of", regex: /\bkind\s+of\b/gi, weight: 0.7 },
  { word: "i mean", regex: /\bi\s+mean\b/gi, weight: 0.6 },
  { word: "so yeah", regex: /\bso\s+yeah\b/gi, weight: 0.7 },
  { word: "right?", regex: /\bright\?/gi, weight: 0.5 }
];

// Confidence & Tone Lexicons (Symbolic Sentiment / Assertiveness)
const ASSERTIVENESS_LEXICON = {
  highConfidence: [
    "spearheaded", "architected", "delivered", "optimized", "implemented", "achieved",
    "executed", "solved", "designed", "streamlined", "accelerated", "resolved",
    "collaborated", "orchestrated", "engineered", "validated", "mentored", "drove",
    "measured", "formulated", "concluded", "demonstrated", "ensured"
  ],
  hedgingDoubt: [
    "maybe", "probably", "i think", "i guess", "not sure", "sort of", "kinda",
    "might be", "perhaps", "could be", "i suppose", "possibly", "i don't know",
    "hopefully", "somewhat"
  ]
};

// Common Stopwords for Lexical Diversity & Clean NLP Tokenization
const ENGLISH_STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
  "were", "weren't", "what", "what's", "when", "when's", "where", "where's",
  "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
  "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your",
  "yours", "yourself", "yourselves"
]);
