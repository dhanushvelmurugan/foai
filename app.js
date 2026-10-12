/**
 * app.js - Main Application Orchestrator & UI Controller
 * 
 * Manages interview lifecycle, camera stream, speech synchronization,
 * UI transitions, and scorecard generation.
 */

class InterviewApp {
  constructor() {
    this.selectedTrack = "swe";
    this.difficulty = "all";
    this.questionCount = 3;
    this.useVoice = true;
    this.useWebcam = true;

    this.activeQuestions = [];
    this.currentIndex = 0;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.maxSeconds = 120;
    this.cameraStream = null;
    this.evaluations = [];
    this.isRecording = false;

    // Load any persisted custom questions
    this.loadCustomQuestions();

    this.initElements();
    this.bindEvents();
    this.setupVoiceCallbacks();
  }

  loadCustomQuestions() {
    try {
      const saved = localStorage.getItem("custom_interview_questions");
      if (saved) {
        const parsed = JSON.parse(saved);
        INTERVIEW_KNOWLEDGE_BASE.custom = {
          id: "custom",
          name: "Custom Track",
          icon: "⚙️",
          description: "User-defined questions with bespoke conceptual rubrics and keywords.",
          questions: parsed
        };
      }
    } catch (e) {
      console.warn("Could not load custom questions from localStorage", e);
    }
  }

  saveCustomQuestions(questions) {
    try {
      localStorage.setItem("custom_interview_questions", JSON.stringify(questions));
      INTERVIEW_KNOWLEDGE_BASE.custom = {
        id: "custom",
        name: "Custom Track",
        icon: "⚙️",
        description: "User-defined questions with bespoke conceptual rubrics and keywords.",
        questions: questions
      };
    } catch (e) {
      console.warn("Could not save custom questions", e);
    }
  }

  initElements() {
    // Screens
    this.setupScreen = document.getElementById("setupScreen");
    this.interviewScreen = document.getElementById("interviewScreen");
    this.resultsScreen = document.getElementById("resultsScreen");

    // Setup elements
    this.trackSelector = document.getElementById("trackSelector");
    this.diffSelector = document.getElementById("diffSelector");
    this.countSelector = document.getElementById("countSelector");
    this.voiceToggle = document.getElementById("voiceToggle");
    this.webcamToggle = document.getElementById("webcamToggle");
    this.startBtn = document.getElementById("startInterviewBtn");

    // Interview elements
    this.trackBadge = document.getElementById("currentTrackBadge");
    this.diffBadge = document.getElementById("currentDiffBadge");
    this.progressText = document.getElementById("questionProgressText");
    this.timerDisplay = document.getElementById("timerDisplay");
    this.timerBar = document.getElementById("timerBar");
    this.questionPrompt = document.getElementById("questionPrompt");
    this.candidateVideo = document.getElementById("candidateVideo");
    this.videoPlaceholder = document.getElementById("videoPlaceholder");
    this.candidateTranscript = document.getElementById("candidateTranscript");
    this.interviewerAvatar = document.getElementById("interviewerAvatar");
    this.speakingPulse = document.getElementById("speakingPulse");
    this.hintBox = document.getElementById("hintBox");
    this.hintText = document.getElementById("hintText");
    this.toggleHintBtn = document.getElementById("toggleHintBtn");
    this.replayVoiceBtn = document.getElementById("replayVoiceBtn");
    this.recordToggleBtn = document.getElementById("recordToggleBtn");
    this.recordStatus = document.getElementById("recordStatus");
    this.liveWordCount = document.getElementById("liveWordCount");
    this.liveFillerBadge = document.getElementById("liveFillerBadge");
    this.skipQuestionBtn = document.getElementById("skipQuestionBtn");
    this.submitAnswerBtn = document.getElementById("submitAnswerBtn");
    this.cameraToggleBtn = document.getElementById("cameraToggleBtn");

    // Results elements
    this.overallGrade = document.getElementById("overallGrade");
    this.overallScore = document.getElementById("overallScore");
    this.scoreSummaryText = document.getElementById("scoreSummaryText");
    this.totalWordsSpoken = document.getElementById("totalWordsSpoken");
    this.avgPacingWpm = document.getElementById("avgPacingWpm");
    this.totalFillersCount = document.getElementById("totalFillersCount");
    this.questionsAccordion = document.getElementById("questionsAccordion");
    this.retakeBtn = document.getElementById("retakeInterviewBtn");
    this.printReportBtn = document.getElementById("printReportBtn");

    // Modals
    this.howItWorksBtn = document.getElementById("howItWorksBtn");
    this.howItWorksModal = document.getElementById("howItWorksModal");
    this.closeModalBtn = document.getElementById("closeModalBtn");
    this.customQuestionsBtn = document.getElementById("customQuestionsBtn");
    this.customModal = document.getElementById("customQuestionsModal");
    this.closeCustomModalBtn = document.getElementById("closeCustomModalBtn");
    this.addCustomQForm = document.getElementById("addCustomQForm");
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.startInterview());
    this.retakeBtn.addEventListener("click", () => this.resetToSetup());
    this.printReportBtn.addEventListener("click", () => window.print());

    this.toggleHintBtn.addEventListener("click", () => {
      this.hintBox.classList.toggle("hidden");
    });

    this.replayVoiceBtn.addEventListener("click", () => {
      const q = this.activeQuestions[this.currentIndex];
      if (q) voiceManager.speak(q.question);
    });

    this.recordToggleBtn.addEventListener("click", () => {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    });

    this.candidateTranscript.addEventListener("input", () => {
      this.updateLiveTelemetry(this.candidateTranscript.value);
    });

    this.submitAnswerBtn.addEventListener("click", () => this.submitAnswer());
    this.skipQuestionBtn.addEventListener("click", () => this.skipQuestion());

    this.cameraToggleBtn.addEventListener("click", () => {
      this.useWebcam = !this.useWebcam;
      this.syncCameraState();
    });

    // Modals
    this.howItWorksBtn.addEventListener("click", () => this.howItWorksModal.classList.remove("hidden"));
    this.closeModalBtn.addEventListener("click", () => this.howItWorksModal.classList.add("hidden"));

    if (this.customQuestionsBtn) {
      this.customQuestionsBtn.addEventListener("click", () => this.customModal.classList.remove("hidden"));
    }
    if (this.closeCustomModalBtn) {
      this.closeCustomModalBtn.addEventListener("click", () => this.customModal.classList.add("hidden"));
    }

    if (this.addCustomQForm) {
      this.addCustomQForm.addEventListener("submit", (e) => this.handleCustomQuestionSubmit(e));
    }

    // Modal background dismiss
    window.addEventListener("click", (e) => {
      if (e.target === this.howItWorksModal) this.howItWorksModal.classList.add("hidden");
      if (e.target === this.customModal) this.customModal.classList.add("hidden");
    });
  }

  setupVoiceCallbacks() {
    voiceManager.onInterviewerStart = () => {
      if (this.speakingPulse) this.speakingPulse.classList.add("animate-pulse-ring");
      if (this.interviewerAvatar) this.interviewerAvatar.classList.add("ring-4", "ring-cyan-400");
    };

    voiceManager.onInterviewerEnd = () => {
      if (this.speakingPulse) this.speakingPulse.classList.remove("animate-pulse-ring");
      if (this.interviewerAvatar) this.interviewerAvatar.classList.remove("ring-4", "ring-cyan-400");
    };

    voiceManager.onCandidateTranscript = (fullDisplay, rawFinal) => {
      this.candidateTranscript.value = fullDisplay;
      this.updateLiveTelemetry(fullDisplay);
    };

    voiceManager.onCandidateStateChange = (listening) => {
      this.isRecording = listening;
      if (listening) {
        this.recordStatus.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-2"></span>Listening...`;
        this.recordToggleBtn.classList.replace("bg-cyan-600", "bg-rose-600");
        this.recordToggleBtn.innerHTML = `<span>⏹️</span> Stop Mic`;
      } else {
        this.recordStatus.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-slate-500 mr-2"></span>Mic Inactive`;
        this.recordToggleBtn.classList.replace("bg-rose-600", "bg-cyan-600");
        this.recordToggleBtn.innerHTML = `<span>🎤</span> Speak`;
      }
    };

    voiceManager.onError = (err) => {
      console.warn("Voice error:", err);
      this.recordStatus.innerHTML = `<span class="text-amber-400 text-xs">⚠️ Speech mic not detected. You can type directly.</span>`;
    };
  }

  async startCamera() {
    if (!this.useWebcam) return;
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      this.candidateVideo.srcObject = this.cameraStream;
      this.candidateVideo.classList.remove("hidden");
      this.videoPlaceholder.classList.add("hidden");
    } catch (err) {
      console.warn("Webcam access denied or unavailable:", err);
      this.candidateVideo.classList.add("hidden");
      this.videoPlaceholder.classList.remove("hidden");
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.candidateVideo.classList.add("hidden");
    this.videoPlaceholder.classList.remove("hidden");
  }

  syncCameraState() {
    if (this.useWebcam) {
      this.startCamera();
      this.cameraToggleBtn.innerHTML = `<span>📹</span> Cam On`;
      this.cameraToggleBtn.classList.replace("bg-slate-700", "bg-emerald-700");
    } else {
      this.stopCamera();
      this.cameraToggleBtn.innerHTML = `<span>🚫</span> Cam Off`;
      this.cameraToggleBtn.classList.replace("bg-emerald-700", "bg-slate-700");
    }
  }

  startInterview() {
    this.selectedTrack = this.trackSelector.value;
    this.difficulty = this.diffSelector.value;
    this.questionCount = parseInt(this.countSelector.value, 10);
    this.useVoice = this.voiceToggle.checked;
    this.useWebcam = this.webcamToggle.checked;

    let trackObj = INTERVIEW_KNOWLEDGE_BASE[this.selectedTrack];
    if (!trackObj || !trackObj.questions || trackObj.questions.length === 0) {
      if (this.selectedTrack === "custom") {
        alert("No custom questions found! Please add at least one question in the Question Studio first, or choose another track.");
        return;
      }
      trackObj = INTERVIEW_KNOWLEDGE_BASE.swe;
    }
    let questionsPool = [...trackObj.questions];

    if (this.difficulty !== "all") {
      questionsPool = questionsPool.filter(q => q.difficulty.toLowerCase() === this.difficulty.toLowerCase());
      if (questionsPool.length === 0) {
        questionsPool = [...trackObj.questions]; // fallback if no questions match strict filter
      }
    }

    // Shuffle pool deterministically
    questionsPool.sort(() => Math.random() - 0.5);
    this.activeQuestions = questionsPool.slice(0, this.questionCount);
    this.currentIndex = 0;
    this.evaluations = [];

    // Switch screen
    this.setupScreen.classList.add("hidden");
    this.resultsScreen.classList.add("hidden");
    this.interviewScreen.classList.remove("hidden");

    this.syncCameraState();
    this.loadQuestion(this.currentIndex);
  }

  loadQuestion(index) {
    if (index >= this.activeQuestions.length) {
      this.finishInterview();
      return;
    }

    const q = this.activeQuestions[index];
    this.elapsedSeconds = 0;
    this.maxSeconds = q.idealDurationSec || 90;
    this.candidateTranscript.value = "";
    voiceManager.resetTranscript();

    // Update UI headers
    this.trackBadge.innerText = INTERVIEW_KNOWLEDGE_BASE[this.selectedTrack]?.name || "General Track";
    this.diffBadge.innerText = `${q.difficulty} Level`;
    this.progressText.innerText = `Question ${index + 1} of ${this.activeQuestions.length}`;
    this.questionPrompt.innerText = q.question;

    // Hints
    this.hintBox.classList.add("hidden");
    this.hintText.innerHTML = q.hints && q.hints.length > 0 
      ? q.hints.map(h => `<li class="mb-1">${h}</li>`).join("")
      : "<li>Focus on technical correctness, trade-offs, and clear structure.</li>";

    // Live Telemetry Reset
    this.updateLiveTelemetry("");

    // Start Timer
    this.startQuestionTimer();

    // Voice reading
    if (this.useVoice) {
      voiceManager.speak(q.question, () => {
        // Auto-start microphone once interviewer finishes asking
        if (voiceManager.isSpeechRecognitionSupported()) {
          this.startRecording();
        }
      });
    }
  }

  startQuestionTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const updateDisplay = () => {
      const remaining = Math.max(0, this.maxSeconds - this.elapsedSeconds);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      this.timerDisplay.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      const pct = Math.min(100, (this.elapsedSeconds / this.maxSeconds) * 100);
      this.timerBar.style.width = `${pct}%`;

      if (pct > 80) {
        this.timerBar.classList.replace("bg-cyan-500", "bg-amber-500");
      } else if (pct > 95) {
        this.timerBar.classList.replace("bg-amber-500", "bg-rose-500");
      } else {
        this.timerBar.className = "h-full bg-cyan-500 transition-all duration-300 rounded-full";
      }

      this.elapsedSeconds++;
    };

    updateDisplay();
    this.timerInterval = setInterval(updateDisplay, 1000);
  }

  stopQuestionTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  startRecording() {
    voiceManager.startListening(this.candidateTranscript.value);
  }

  stopRecording() {
    voiceManager.stopListening();
  }

  updateLiveTelemetry(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    this.liveWordCount.innerText = `${words.length} words`;

    // Quick filler count for live feedback badge
    let fillerCount = 0;
    FILLER_WORDS_LEXICON.forEach(item => {
      const matches = text.match(item.regex);
      if (matches) fillerCount += matches.length;
    });

    if (fillerCount === 0) {
      this.liveFillerBadge.innerText = "0 Fillers";
      this.liveFillerBadge.className = "px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800";
    } else if (fillerCount <= 2) {
      this.liveFillerBadge.innerText = `${fillerCount} Fillers`;
      this.liveFillerBadge.className = "px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-950/70 text-amber-400 border border-amber-800";
    } else {
      this.liveFillerBadge.innerText = `${fillerCount} Fillers!`;
      this.liveFillerBadge.className = "px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-950/70 text-rose-400 border border-rose-800 animate-pulse";
    }
  }

  submitAnswer() {
    voiceManager.stopSpeaking();
    this.stopRecording();
    this.stopQuestionTimer();

    const q = this.activeQuestions[this.currentIndex];
    const candidateAnswer = this.candidateTranscript.value;

    // Evaluate using the Symbolic AI Engine
    const evalResult = aiEngine.evaluateResponse(candidateAnswer, q, this.elapsedSeconds);
    evalResult.question = q;
    evalResult.candidateAnswer = candidateAnswer;
    evalResult.timeTakenSec = this.elapsedSeconds;
    this.evaluations.push(evalResult);

    // Proceed to next question
    this.currentIndex++;
    if (this.currentIndex < this.activeQuestions.length) {
      this.loadQuestion(this.currentIndex);
    } else {
      this.finishInterview();
    }
  }

  skipQuestion() {
    if (confirm("Are you sure you want to skip this question? It will be marked with 0 points.")) {
      voiceManager.stopSpeaking();
      this.stopRecording();
      this.stopQuestionTimer();

      const q = this.activeQuestions[this.currentIndex];
      const evalResult = aiEngine.evaluateResponse("", q, 1);
      evalResult.question = q;
      evalResult.candidateAnswer = "[Skipped by candidate]";
      evalResult.timeTakenSec = 0;
      this.evaluations.push(evalResult);

      this.currentIndex++;
      if (this.currentIndex < this.activeQuestions.length) {
        this.loadQuestion(this.currentIndex);
      } else {
        this.finishInterview();
      }
    }
  }

  finishInterview() {
    this.stopQuestionTimer();
    voiceManager.stopSpeaking();
    this.stopRecording();
    this.stopCamera();

    this.interviewScreen.classList.add("hidden");
    this.resultsScreen.classList.remove("hidden");

    this.renderScorecard();
  }

  renderScorecard() {
    if (this.evaluations.length === 0) return;

    // Compute aggregates
    const totalScore = this.evaluations.reduce((acc, curr) => acc + curr.overallScore, 0);
    const avgScore = Math.round(totalScore / this.evaluations.length);

    let avgConcept = 0;
    let avgStructure = 0;
    let avgFluency = 0;
    let avgConfidence = 0;
    let avgDiversity = 0;
    let totalWords = 0;
    let totalFillers = 0;
    let totalWpm = 0;

    this.evaluations.forEach(ev => {
      avgConcept += ev.concepts.score;
      avgStructure += ev.star ? ev.star.score : ev.concepts.score;
      avgFluency += ev.fluency.fluencyScore;
      avgConfidence += ev.tone.assertivenessScore;
      avgDiversity += ev.tone.diversityScore;
      totalWords += ev.fluency.wordCount;
      totalFillers += ev.fluency.totalFillers;
      totalWpm += ev.fluency.wpm;
    });

    const count = this.evaluations.length;
    const radarMetrics = {
      concepts: Math.round(avgConcept / count),
      structure: Math.round(avgStructure / count),
      fluency: Math.round(avgFluency / count),
      confidence: Math.round(avgConfidence / count),
      diversity: Math.round(avgDiversity / count)
    };

    // Render Overall Grade & Score
    let grade = "C";
    if (avgScore >= 92) grade = "A+";
    else if (avgScore >= 83) grade = "A";
    else if (avgScore >= 74) grade = "B+";
    else if (avgScore >= 65) grade = "B";
    else if (avgScore >= 55) grade = "C+";
    else if (avgScore >= 45) grade = "C";
    else grade = "D";

    this.overallGrade.innerText = grade;
    this.overallScore.innerText = `${avgScore}/100`;

    // Summary description
    if (avgScore >= 85) {
      this.scoreSummaryText.innerText = "Exceptional Interview Readiness! Strong concept coverage, crisp articulation, and assertive delivery.";
    } else if (avgScore >= 70) {
      this.scoreSummaryText.innerText = "Solid Performance! Good conceptual foundation with room for tighter structure and fewer filler words.";
    } else {
      this.scoreSummaryText.innerText = "Development Needed. Review missing conceptual milestones and focus on the STAR structure.";
    }

    // Telemetry stats
    this.totalWordsSpoken.innerText = totalWords;
    this.avgPacingWpm.innerText = `${Math.round(totalWpm / count)} WPM`;
    this.totalFillersCount.innerText = totalFillers;

    // Render SVG Radar Chart
    ScoreVisualizer.renderRadarChart("radarChartContainer", radarMetrics);

    // Render Question Breakdown Accordion
    this.renderQuestionBreakdown();
  }

  renderQuestionBreakdown() {
    this.questionsAccordion.innerHTML = "";

    this.evaluations.forEach((ev, idx) => {
      const q = ev.question;
      const isPass = ev.overallScore >= 70;
      const badgeClass = isPass ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-amber-950 text-amber-400 border-amber-800";

      const coveredTags = ev.concepts.covered.map(c => `
        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 mr-1.5 mb-1.5">
          ✓ ${c.name}
        </span>
      `).join("");

      const missedTags = ev.concepts.missed.map(m => `
        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60 mr-1.5 mb-1.5">
          ✗ ${m.name}
        </span>
      `).join("");

      const feedbackItems = ev.feedback.map(f => `<li class="text-xs text-slate-300 mb-1.5">${f}</li>`).join("");

      const card = document.createElement("div");
      card.className = "bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-4 shadow-lg";
      card.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-800">
          <div>
            <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Question ${idx + 1} (${q.difficulty})</span>
            <h4 class="text-base font-semibold text-white mt-0.5">${q.question}</h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}">Score: ${ev.overallScore}% (${ev.grade})</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <!-- Concepts Covered / Missed -->
          <div class="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symbolic Knowledge Concepts</h5>
            <div class="mb-2">
              <span class="text-xs text-slate-400 block mb-1">Covered Milestones:</span>
              <div class="flex flex-wrap">${coveredTags || '<span class="text-xs text-slate-500 italic">No target concepts detected.</span>'}</div>
            </div>
            <div>
              <span class="text-xs text-slate-400 block mb-1">Missed Milestones:</span>
              <div class="flex flex-wrap">${missedTags || '<span class="text-xs text-emerald-400 font-medium">None! All concepts addressed.</span>'}</div>
            </div>
          </div>

          <!-- Fluency & Pacing Telemetry -->
          <div class="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery & Fluency Analysis</h5>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-slate-900/80 p-2 rounded">
                <span class="text-slate-400 block">Pacing:</span>
                <span class="font-semibold text-white">${ev.fluency.wpm} WPM</span>
                <span class="text-[10px] text-slate-400 block">${ev.fluency.pacingAssessment}</span>
              </div>
              <div class="bg-slate-900/80 p-2 rounded">
                <span class="text-slate-400 block">Fillers Count:</span>
                <span class="font-semibold text-white">${ev.fluency.totalFillers} (${ev.fluency.fillerDensity}%)</span>
              </div>
              <div class="bg-slate-900/80 p-2 rounded">
                <span class="text-slate-400 block">Assertiveness:</span>
                <span class="font-semibold text-white">${ev.tone.assertivenessScore}/100</span>
              </div>
              <div class="bg-slate-900/80 p-2 rounded">
                <span class="text-slate-400 block">Vocabulary TTR:</span>
                <span class="font-semibold text-white">${ev.tone.typeTokenRatio}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback Bullets -->
        <div class="mb-4 bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/80">
          <h5 class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Rule-Based Diagnostic Feedback</h5>
          <ul class="list-disc list-inside space-y-1">${feedbackItems}</ul>
        </div>

        <!-- Candidate Transcript Accordion -->
        <details class="bg-slate-950/40 rounded-lg border border-slate-800 p-3 text-xs mb-3">
          <summary class="cursor-pointer font-semibold text-slate-300 hover:text-white select-none">
            📄 View Candidate's Recorded Response
          </summary>
          <p class="mt-2 text-slate-300 italic whitespace-pre-wrap leading-relaxed">${ev.candidateAnswer || '[No response provided]'}</p>
        </details>

        <!-- Model Benchmark Answer -->
        <details class="bg-slate-950/40 rounded-lg border border-slate-800 p-3 text-xs">
          <summary class="cursor-pointer font-semibold text-cyan-400 hover:text-cyan-300 select-none">
            🌟 View Expert Benchmark Answer
          </summary>
          <p class="mt-2 text-slate-300 leading-relaxed">${q.idealAnswer}</p>
        </details>
      `;

      this.questionsAccordion.appendChild(card);
    });
  }

  resetToSetup() {
    this.resultsScreen.classList.add("hidden");
    this.setupScreen.classList.remove("hidden");
  }

  handleCustomQuestionSubmit(e) {
    e.preventDefault();
    const qText = document.getElementById("customQText").value.trim();
    const qTrack = document.getElementById("customQTrack").value;
    const qDiff = document.getElementById("customQDiff").value;
    const qKeywordsRaw = document.getElementById("customQKeywords").value;
    const qIdeal = document.getElementById("customQIdeal").value.trim();

    if (!qText || !qKeywordsRaw) {
      alert("Please fill in the question and target keywords.");
      return;
    }

    const keywordList = qKeywordsRaw.split(",").map(k => k.trim()).filter(k => k.length > 0);
    const customObj = {
      id: "cust-" + Date.now(),
      difficulty: qDiff,
      question: qText,
      hints: ["Address all core concepts and provide a concrete practical example."],
      targetConcepts: [
        {
          name: "Core Concept & Key Terminology",
          keywords: keywordList,
          weight: 60,
          description: "Essential terms and principles defined in the rubric."
        },
        {
          name: "Practical Implementation",
          keywords: ["example", "practice", "production", "real-world", "system", "use case"],
          weight: 40,
          description: "Illustration of how this concept behaves in production."
        }
      ],
      starRequired: qTrack === "behavioral",
      antiPatterns: [],
      idealAnswer: qIdeal || "A complete and rigorous answer addressing the specified concepts.",
      minWordCount: 40,
      idealDurationSec: 90
    };

    const existing = INTERVIEW_KNOWLEDGE_BASE.custom ? INTERVIEW_KNOWLEDGE_BASE.custom.questions : [];
    existing.push(customObj);
    this.saveCustomQuestions(existing);

    alert("Custom question successfully registered in the Symbolic AI Knowledge Base!");
    this.addCustomQForm.reset();
    this.customModal.classList.add("hidden");

    // Automatically select the custom track
    this.trackSelector.value = "custom";
  }
}

// Instantiate application once DOM is fully ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new InterviewApp();
});
