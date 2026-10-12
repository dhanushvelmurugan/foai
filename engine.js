/**
 * engine.js - Symbolic AI & Rule-Based NLP Inference Engine
 * 
 * Implements deterministic Natural Language Processing, lexical analysis,
 * fuzzy keyword matching, STAR behavioral parsing, fluency/pacing telemetry,
 * and rule-based rubric scoring WITHOUT any machine learning or neural networks.
 */

class SymbolicInterviewEngine {
  constructor() {
    this.fillerLexicon = FILLER_WORDS_LEXICON;
    this.assertivenessLexicon = ASSERTIVENESS_LEXICON;
    this.stopwords = ENGLISH_STOPWORDS;
  }

  /**
   * Rule-Based Stemmer (Simplified Porter Stemmer Algorithm)
   * Strips standard English suffixes to match root forms without ML.
   */
  stem(word) {
    if (!word || word.length < 4) return word;
    let w = word.toLowerCase();

    // Step 1: Plurals and past tense suffixes
    if (w.endsWith("sses")) w = w.slice(0, -2);
    else if (w.endsWith("ies")) w = w.slice(0, -3) + "y";
    else if (w.endsWith("ss")) w = w;
    else if (w.endsWith("s") && !w.endsWith("us") && !w.endsWith("is")) w = w.slice(0, -1);

    if (w.endsWith("eed")) {
      if (w.length > 5) w = w.slice(0, -1);
    } else if (w.endsWith("ed")) {
      w = w.slice(0, -2);
      if (w.endsWith("at") || w.endsWith("bl") || w.endsWith("iz")) w += "e";
      else if (w.length > 3 && w[w.length - 1] === w[w.length - 2]) w = w.slice(0, -1);
    } else if (w.endsWith("ing")) {
      w = w.slice(0, -3);
      if (w.endsWith("at") || w.endsWith("bl") || w.endsWith("iz")) w += "e";
      else if (w.length > 3 && w[w.length - 1] === w[w.length - 2]) w = w.slice(0, -1);
    }

    // Step 2: Derivational suffixes
    if (w.endsWith("ational")) w = w.replace("ational", "ate");
    else if (w.endsWith("tional")) w = w.replace("tional", "tion");
    else if (w.endsWith("alize")) w = w.replace("alize", "al");
    else if (w.endsWith("icate")) w = w.replace("icate", "ic");
    else if (w.endsWith("iciti")) w = w.replace("iciti", "ic");
    else if (w.endsWith("ative")) w = w.replace("ative", "");
    else if (w.endsWith("ful")) w = w.replace("ful", "");
    else if (w.endsWith("ness")) w = w.replace("ness", "");
    else if (w.endsWith("ly")) w = w.replace("ly", "");
    else if (w.endsWith("ment")) w = w.replace("ment", "");

    return w;
  }

  /**
   * Deterministic Levenshtein Distance Algorithm
   * Used for bounded fuzzy typo-tolerance (edit distance <= 1 or 2).
   */
  levenshteinDistance(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,       // Deletion
          dp[i][j - 1] + 1,       // Insertion
          dp[i - 1][j - 1] + cost // Substitution
        );
      }
    }
    return dp[m][n];
  }

  /**
   * Clean Tokenizer: converts raw response into normalized tokens and n-grams.
   */
  tokenize(text) {
    if (!text) return { rawWords: [], cleanTokens: [], stemmedTokens: [], ngrams: [] };
    
    // Normalize unicode, remove special characters except hyphens and apostrophes
    const cleaned = text
      .toLowerCase()
      .replace(/[\r\n\t]+/g, " ")
      .replace(/[^a-z0-9\s\-_+]/g, " ");

    const rawWords = cleaned.split(/\s+/).filter(w => w.length > 0);
    const cleanTokens = rawWords.filter(w => !this.stopwords.has(w) && w.length > 1);
    const stemmedTokens = cleanTokens.map(w => this.stem(w));

    // Generate bigrams and trigrams for compound technical terms (e.g., "event loop", "b tree")
    const ngrams = [];
    for (let i = 0; i < rawWords.length - 1; i++) {
      ngrams.push(`${rawWords[i]} ${rawWords[i + 1]}`);
      if (i < rawWords.length - 2) {
        ngrams.push(`${rawWords[i]} ${rawWords[i + 1]} ${rawWords[i + 2]}`);
      }
    }

    return { rawWords, cleanTokens, stemmedTokens, ngrams };
  }

  /**
   * Matches candidate response against a specific target concept rubric.
   */
  matchConcept(tokenized, rawText, concept) {
    const rawLower = rawText.toLowerCase();
    const candidateKeywords = concept.keywords || [];
    
    let matchedKeywords = [];
    let matchScore = 0;

    for (const kw of candidateKeywords) {
      const kwLower = kw.toLowerCase();

      // Check 1: Multi-word phrase exact match or substring in raw text
      if (kwLower.includes(" ") || kwLower.includes("-")) {
        if (rawLower.includes(kwLower)) {
          matchedKeywords.push(kw);
          matchScore += 1.0;
          continue;
        }
      }

      // Check 2: Exact token or N-gram match
      if (tokenized.rawWords.includes(kwLower) || tokenized.ngrams.includes(kwLower)) {
        matchedKeywords.push(kw);
        matchScore += 1.0;
        continue;
      }

      // Check 3: Stemmed equivalence
      const kwStem = this.stem(kwLower);
      if (tokenized.stemmedTokens.includes(kwStem)) {
        matchedKeywords.push(kw);
        matchScore += 0.9;
        continue;
      }

      // Check 4: Bounded fuzzy matching for single words > 5 chars (edit distance <= 1)
      if (kwLower.length >= 6) {
        const fuzzyFound = tokenized.cleanTokens.some(token => {
          if (Math.abs(token.length - kwLower.length) <= 1) {
            return this.levenshteinDistance(token, kwLower) <= 1;
          }
          return false;
        });
        if (fuzzyFound) {
          matchedKeywords.push(`${kw} (approx)`);
          matchScore += 0.8;
        }
      }
    }

    const isCovered = matchedKeywords.length > 0;
    return {
      name: concept.name,
      weight: concept.weight,
      description: concept.description,
      isCovered,
      matchedKeywords: [...new Set(matchedKeywords)],
      conceptScore: isCovered ? Math.min(concept.weight, concept.weight * (matchScore >= 2 ? 1.0 : 0.85)) : 0
    };
  }

  /**
   * Evaluates overall conceptual coverage across all target rubrics.
   */
  evaluateConcepts(rawText, targetConcepts) {
    if (!targetConcepts || targetConcepts.length === 0) {
      return { score: 100, covered: [], missed: [], totalWeight: 100, earnedWeight: 100 };
    }

    const tokenized = this.tokenize(rawText);
    const covered = [];
    const missed = [];
    let earnedWeight = 0;
    let totalWeight = 0;

    targetConcepts.forEach(concept => {
      totalWeight += concept.weight;
      const result = this.matchConcept(tokenized, rawText, concept);
      if (result.isCovered) {
        covered.push(result);
        earnedWeight += result.conceptScore;
      } else {
        missed.push(result);
      }
    });

    const normalizedScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      score: Math.min(100, normalizedScore),
      covered,
      missed,
      totalWeight,
      earnedWeight: Math.round(earnedWeight)
    };
  }

  /**
   * STAR Behavioral Parser (Rule-Based Finite State / Pattern Matching)
   * Detects presence of Situation, Task, Action, and Result indicators.
   */
  parseStarStructure(text) {
    const raw = text.toLowerCase();
    
    // Deterministic Regex patterns for each behavioral milestone
    const starRules = {
      situation: {
        label: "Situation",
        patterns: [
          /\b(when\s+i\s+was|at\s+my\s+previous|in\s+my\s+last|in\s+a\s+prior|during\s+my|we\s+were\s+building|our\s+team\s+was|the\s+company\s+was|in\s+one\s+project|there\s+was\s+a\s+situation)\b/i,
          /\b(back\s+in|a\s+few\s+months\s+ago|at\s+the\s+time|we\s+faced|our\s+codebase|our\s+product)\b/i
        ],
        weight: 25
      },
      task: {
        label: "Task",
        patterns: [
          /\b(my\s+role\s+was|my\s+responsibility\s+was|i\s+was\s+tasked\s+with|i\s+needed\s+to|the\s+goal\s+was|the\s+objective\s+was|our\s+target\s+was)\b/i,
          /\b(responsible\s+for|had\s+to\s+solve|assigned\s+to|it\s+was\s+up\s+to\s+me|my\s+job\s+was)\b/i
        ],
        weight: 25
      },
      action: {
        label: "Action",
        patterns: [
          /\b(i\s+decided\s+to|i\s+implemented|i\s+built|i\s+developed|i\s+created|i\s+scheduled|i\s+organized|i\s+spearheaded|i\s+researched|i\s+designed)\b/i,
          /\b(so\s+i|first\s+i|then\s+i|we\s+benchmarked|i\s+refactored|i\s+analyzed|i\s+proposed|steps\s+i\s+took)\b/i
        ],
        weight: 25
      },
      result: {
        label: "Result",
        patterns: [
          /\b(as\s+a\s+result|consequently|the\s+outcome\s+was|in\s+the\s+end|we\s+achieved|this\s+improved|increased\s+by|reduced\s+by|saved|decreased)\b/i,
          /\b(successfully\s+shipped|delivered\s+on\s+time|the\s+client\s+was|key\s+takeaway|what\s+i\s+learned|ultimately)\b/i
        ],
        weight: 25
      }
    };

    const detected = {};
    let totalScore = 0;

    for (const [phaseKey, phaseObj] of Object.entries(starRules)) {
      let matched = false;
      let matchedSnippet = "";

      for (const pattern of phaseObj.patterns) {
        const match = raw.match(pattern);
        if (match) {
          matched = true;
          matchedSnippet = match[0];
          break;
        }
      }

      detected[phaseKey] = {
        label: phaseObj.label,
        detected: matched,
        snippet: matchedSnippet,
        score: matched ? phaseObj.weight : 0
      };

      if (matched) totalScore += phaseObj.weight;
    }

    // Completeness rating
    const count = Object.values(detected).filter(d => d.detected).length;
    let rating = "Incomplete";
    if (count === 4) rating = "Comprehensive (All 4 STAR Pillars)";
    else if (count === 3) rating = "Good (Missing 1 STAR Pillar)";
    else if (count === 2) rating = "Partial (2 STAR Pillars Missing)";

    return {
      score: totalScore,
      rating,
      count,
      phases: detected
    };
  }

  /**
   * Anti-Pattern / Red-Flag Detector
   */
  detectAntiPatterns(rawText, antiPatterns) {
    if (!antiPatterns || antiPatterns.length === 0) return { penalties: 0, flags: [] };

    let totalPenalty = 0;
    const flags = [];

    antiPatterns.forEach(ap => {
      if (ap.pattern.test(rawText)) {
        totalPenalty += ap.penalty;
        flags.push({ reason: ap.reason, penalty: ap.penalty });
      }
    });

    return { penalties: totalPenalty, flags };
  }

  /**
   * Pacing, Delivery, and Filler Words Analyzer
   */
  analyzeFluency(rawText, elapsedSeconds) {
    const words = rawText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const duration = Math.max(elapsedSeconds, 5); // Avoid division by zero
    const minutes = duration / 60;
    const wpm = Math.round(wordCount / minutes);

    // Filler word detection using regex lexicon
    let totalFillers = 0;
    const fillerBreakdown = {};

    this.fillerLexicon.forEach(item => {
      const matches = rawText.match(item.regex);
      if (matches) {
        const cnt = matches.length;
        totalFillers += cnt;
        fillerBreakdown[item.word] = cnt;
      }
    });

    const fillerDensity = wordCount > 0 ? ((totalFillers / wordCount) * 100).toFixed(1) : 0;

    // Pacing rating and score calculation
    let pacingScore = 100;
    let pacingAssessment = "Optimal Pacing";

    if (wpm < 85) {
      pacingScore = Math.max(50, 100 - (85 - wpm) * 1.5);
      pacingAssessment = "Too Slow (Hesitant / Long Pauses)";
    } else if (wpm > 180) {
      pacingScore = Math.max(50, 100 - (wpm - 180) * 1.2);
      pacingAssessment = "Too Fast (Rushing / Rapid Speech)";
    } else if (wpm >= 115 && wpm <= 160) {
      pacingScore = 100;
      pacingAssessment = "Natural & Eloquent Conversational Pace";
    } else {
      pacingScore = 85;
      pacingAssessment = "Acceptable Pacing";
    }

    // Filler penalty: 0-2% fillers is normal, >3% penalizes progressively
    let fillerScore = 100;
    if (fillerDensity > 2.0) {
      fillerScore = Math.max(30, 100 - (fillerDensity - 2.0) * 12);
    }

    // Composite Fluency Score
    const fluencyScore = Math.round((pacingScore * 0.45) + (fillerScore * 0.55));

    return {
      wordCount,
      durationSec: Math.round(duration),
      wpm,
      pacingAssessment,
      pacingScore: Math.round(pacingScore),
      totalFillers,
      fillerDensity: parseFloat(fillerDensity),
      fillerBreakdown,
      fillerScore: Math.round(fillerScore),
      fluencyScore: Math.min(100, Math.max(0, fluencyScore))
    };
  }

  /**
   * Tone, Confidence & Lexical Diversity Analysis (Deterministic Lexical Polarity)
   */
  analyzeToneAndDiversity(rawText) {
    const { cleanTokens, rawWords } = this.tokenize(rawText);
    const totalWords = rawWords.length;

    // Lexical Diversity: Type-Token Ratio (TTR)
    const uniqueTokens = new Set(cleanTokens);
    const ttr = cleanTokens.length > 0 ? (uniqueTokens.size / cleanTokens.length).toFixed(2) : 0;
    const diversityScore = Math.min(100, Math.round(parseFloat(ttr) * 130));

    // Confidence & Assertiveness Word Matching
    const lower = rawText.toLowerCase();
    const highConfidenceMatches = [];
    const hedgingMatches = [];

    this.assertivenessLexicon.highConfidence.forEach(term => {
      const reg = new RegExp(`\\b${term}\\b`, "gi");
      const m = lower.match(reg);
      if (m) highConfidenceMatches.push({ term, count: m.length });
    });

    this.assertivenessLexicon.hedgingDoubt.forEach(term => {
      const reg = new RegExp(`\\b${term}\\b`, "gi");
      const m = lower.match(reg);
      if (m) hedgingMatches.push({ term, count: m.length });
    });

    const highCount = highConfidenceMatches.reduce((acc, curr) => acc + curr.count, 0);
    const hedgeCount = hedgingMatches.reduce((acc, curr) => acc + curr.count, 0);

    // Assertiveness formula: base 75 + bonus for action verbs - penalty for hedging
    let assertivenessScore = 75 + (highCount * 5) - (hedgeCount * 8);
    assertivenessScore = Math.min(100, Math.max(25, assertivenessScore));

    let toneLabel = "Balanced & Professional";
    if (highCount >= 3 && hedgeCount === 0) toneLabel = "Highly Confident & Assertive";
    else if (hedgeCount >= 3) toneLabel = "Tentative / Unsure (Excessive Hedging)";

    return {
      typeTokenRatio: parseFloat(ttr),
      diversityScore,
      assertivenessScore: Math.round(assertivenessScore),
      toneLabel,
      highConfidenceMatches,
      hedgingMatches,
      highCount,
      hedgeCount
    };
  }

  /**
   * Master Evaluation Orchestrator
   * Aggregates all deterministic sub-engines into an overall transparent evaluation.
   */
  evaluateResponse(candidateText, questionObj, elapsedSeconds = 60) {
    if (!candidateText || candidateText.trim().length === 0) {
      return {
        overallScore: 0,
        grade: "F",
        summary: "No response was recorded. Please attempt answering the question.",
        concepts: { score: 0, covered: [], missed: questionObj.targetConcepts || [] },
        fluency: { wordCount: 0, wpm: 0, fluencyScore: 0, fillerDensity: 0, fillerBreakdown: {} },
        star: questionObj.starRequired ? { score: 0, rating: "Missing", phases: {} } : null,
        tone: { assertivenessScore: 0, toneLabel: "No data", diversityScore: 0 },
        feedback: ["No response detected. Try speaking or typing a clear, detailed answer."],
        idealAnswer: questionObj.idealAnswer
      };
    }

    // 1. Concept Coverage
    const concepts = this.evaluateConcepts(candidateText, questionObj.targetConcepts);

    // 2. Fluency & Pacing
    const fluency = this.analyzeFluency(candidateText, elapsedSeconds);

    // 3. Tone & Diversity
    const tone = this.analyzeToneAndDiversity(candidateText);

    // 4. STAR Behavioral Structure (if required)
    const star = questionObj.starRequired ? this.parseStarStructure(candidateText) : null;

    // 5. Anti-Patterns Check
    const antiPatterns = this.detectAntiPatterns(candidateText, questionObj.antiPatterns);

    // 6. Word Count Depth Heuristic
    const minWords = questionObj.minWordCount || 40;
    let depthPenalty = 0;
    if (fluency.wordCount < minWords) {
      depthPenalty = Math.round(((minWords - fluency.wordCount) / minWords) * 25);
    }

    // 7. Weighted Composite Score
    let overallScore = 0;
    if (questionObj.starRequired) {
      // Behavioral weight distribution: Concepts 30%, STAR 35%, Fluency 20%, Tone 15%
      overallScore = (concepts.score * 0.30) +
                     (star.score * 0.35) +
                     (fluency.fluencyScore * 0.20) +
                     (tone.assertivenessScore * 0.15);
    } else {
      // Technical weight distribution: Concepts 55%, Fluency 25%, Tone 20%
      overallScore = (concepts.score * 0.55) +
                     (fluency.fluencyScore * 0.25) +
                     (tone.assertivenessScore * 0.20);
    }

    // Apply anti-pattern penalties and depth penalties
    overallScore = Math.max(0, Math.round(overallScore - antiPatterns.penalties - depthPenalty));

    // Assign Letter Grade
    let grade = "C";
    if (overallScore >= 92) grade = "A+";
    else if (overallScore >= 83) grade = "A";
    else if (overallScore >= 74) grade = "B+";
    else if (overallScore >= 65) grade = "B";
    else if (overallScore >= 55) grade = "C+";
    else if (overallScore >= 45) grade = "C";
    else grade = "D";

    // 8. Generate Constructive, Explainable Feedback Bullets (Zero ML Hallucination)
    const feedback = [];

    // Concept Feedback
    if (concepts.score >= 85) {
      feedback.push(`🎯 Outstanding conceptual accuracy! You comprehensively articulated ${concepts.covered.length} core technical milestones.`);
    } else if (concepts.score >= 60) {
      feedback.push(`👍 Good coverage of key ideas, but missed important concepts such as: ${concepts.missed.map(m => m.name).slice(0, 2).join(", ")}.`);
    } else {
      feedback.push(`⚠️ Significant gaps in required technical concepts. Ensure you address: ${concepts.missed.map(m => m.name).join(", ")}.`);
    }

    // STAR Feedback (if behavioral)
    if (questionObj.starRequired && star) {
      if (star.count === 4) {
        feedback.push(`⭐ Flawless STAR structure: You clearly articulated the Situation, Task, Action, and Measurable Result.`);
      } else {
        const missingPhases = Object.entries(star.phases)
          .filter(([_, p]) => !p.detected)
          .map(([_, p]) => p.label);
        feedback.push(`📐 Structure Advice: Your behavioral story missed clear markers for: ${missingPhases.join(" and ")}. Explicitly state what actions YOU took and quantify the final outcome.`);
      }
    }

    // Fluency & Fillers Feedback
    if (fluency.fillerDensity > 3.0) {
      const topFillers = Object.entries(fluency.fillerBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([w, c]) => `"${w}" (${c}x)`)
        .join(", ");
      feedback.push(`🎙️ High filler word frequency: Detected ${fluency.totalFillers} filler utterances (${fluency.fillerDensity}% density), especially ${topFillers}. Practice deliberate pausing.`);
    } else if (fluency.totalFillers <= 1 && fluency.wordCount > 30) {
      feedback.push(`✨ Crisp eloquence! Minimal filler words detected.`);
    }

    // Pacing Feedback
    if (fluency.wpm < 95) {
      feedback.push(`⏱️ Delivery pace was somewhat slow (${fluency.wpm} WPM). Aim for a brisk, engaging conversational tempo (120-150 WPM).`);
    } else if (fluency.wpm > 185) {
      feedback.push(`⚡ Delivery pace was very fast (${fluency.wpm} WPM). Slow down slightly to give your points time to resonate.`);
    }

    // Tone Feedback
    if (tone.hedgeCount > 2) {
      feedback.push(`💡 Avoid hedging expressions like ${tone.hedgingMatches.map(h => `"${h.term}"`).join(", ")}. Use assertive, decisive action verbs.`);
    } else if (tone.highCount >= 2) {
      feedback.push(`💪 Strong, assertive vocabulary with proactive verbs like ${tone.highConfidenceMatches.map(c => `"${c.term}"`).join(", ")}.`);
    }

    // Anti-Pattern Warnings
    if (antiPatterns.flags.length > 0) {
      antiPatterns.flags.forEach(flag => {
        feedback.push(`🚩 Red-flag deduction (-${flag.penalty} pts): ${flag.reason}`);
      });
    }

    return {
      overallScore,
      grade,
      concepts,
      fluency,
      tone,
      star,
      antiPatterns,
      depthPenalty,
      feedback,
      idealAnswer: questionObj.idealAnswer
    };
  }
}

// Export instance
const aiEngine = new SymbolicInterviewEngine();
