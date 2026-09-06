/* ============================================================
   SIGAP - scoring.js
   PROGRESS (XP) is separated from PERFORMANCE (competencies).

   Case score = 40% investigation quality + 30% decision +
                20% evidence relevance + 10% confidence calibration.
   Wrong main decision caps the case score at 59.
   Replays of completed content are PRACTICE RUNS:
   no XP, no competency updates, no badges. latestScore still updates.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var COMPETENCIES = {
    criticalThinking: 'Critical Thinking',
    aiLiteracy: 'AI Literacy',
    digitalSafety: 'Digital Safety',
    evidenceReasoning: 'Evidence Reasoning',
    ethicalReasoning: 'Ethical Reasoning'
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /**
   * Calibration score + verdict.
   * Correct decision: ideal confidence 75–90 (well calibrated).
   * Wrong decision: lower confidence is better calibrated than high.
   */
  function calibrate(decisionCorrect, confidence) {
    var score, verdict;
    if (decisionCorrect) {
      if (confidence >= 75 && confidence <= 90) {
        score = 100; verdict = 'wellCalibrated';
      } else if (confidence > 90) {
        score = clamp(100 - (confidence - 90) * 4, 40, 100);
        verdict = confidence >= 98 ? 'overconfident' : 'wellCalibrated';
      } else {
        // correct but unsure
        score = clamp(100 - (75 - confidence) * 1.6, 0, 100);
        verdict = confidence < 45 ? 'underconfident' : 'wellCalibrated';
      }
    } else {
      if (confidence <= 40) {
        score = 80; verdict = 'wellCalibrated'; // wrong but appropriately uncertain
      } else {
        score = clamp(80 - (confidence - 40) * 1.5, 0, 80);
        verdict = confidence >= 70 ? 'overconfident' : 'wellCalibrated';
      }
    }
    return { score: Math.round(score), verdict: verdict };
  }

  /** Human feedback text for calibration. */
  function calibrationFeedback(decisionCorrect, confidence, verdict) {
    if (verdict === 'overconfident') {
      return decisionCorrect
        ? 'Kesimpulanmu benar, tetapi hampir tidak ada kesimpulan investigasi yang layak diberi keyakinan mendekati 100%. Sisakan ruang untuk bukti baru.'
        : 'Kamu sangat yakin, padahal keputusanmu belum didukung bukti yang cukup. Confidence tinggi tanpa bukti kuat adalah tanda bahaya.';
    }
    if (verdict === 'underconfident') {
      return 'Kesimpulanmu benar, tetapi confidence-mu jauh lebih rendah daripada kekuatan bukti yang kamu kumpulkan. Percayai bukti yang saling mendukung.';
    }
    return decisionCorrect
      ? 'Confidence-mu sesuai dengan kekuatan bukti. Ini yang disebut kalibrasi yang baik.'
      : 'Keputusanmu keliru, tetapi kamu jujur dengan ketidakpastianmu. Itu sikap epistemik yang sehat. Sekarang periksa bukti yang terlewat.';
  }

  SIGAP.scoring = {
    COMPETENCIES: COMPETENCIES,
    calibrate: calibrate,

    /**
     * Compute a case score. All inputs 0–100 except decisionCorrect (bool).
     */
    computeCaseScore: function (inp) {
      var iq = clamp(inp.investigationQuality || 0, 0, 100);
      var er = clamp(inp.evidenceRelevance || 0, 0, 100);
      var dec = inp.decisionCorrect ? 100 : 0;
      var cal = calibrate(!!inp.decisionCorrect, clamp(inp.confidence || 0, 0, 100));
      var total = Math.round(0.4 * iq + 0.3 * dec + 0.2 * er + 0.1 * cal.score);
      if (!inp.decisionCorrect) total = Math.min(total, 59);
      return {
        total: total,
        breakdown: {
          investigationQuality: Math.round(iq),
          decisionCorrectness: dec,
          evidenceRelevance: Math.round(er),
          confidenceCalibration: cal.score
        },
        calibration: cal.verdict,
        calibrationFeedback: calibrationFeedback(!!inp.decisionCorrect, inp.confidence || 0, cal.verdict)
      };
    },

    /**
     * Record competency performance (weighted average). Practice runs must
     * NOT call this; enforced by finishCase/finishLab.
     * comps: { criticalThinking: {score: 0-100, weight: 1}, ... }
     */
    recordCompetencies: function (comps) {
      SIGAP.state.update(function (s) {
        for (var key in comps) {
          if (!comps.hasOwnProperty(key) || !COMPETENCIES[key]) continue;
          var c = comps[key];
          var raw = s.performance.raw[key] || { sum: 0, weight: 0 };
          raw.sum += clamp(c.score, 0, 100) * (c.weight || 1);
          raw.weight += (c.weight || 1);
          s.performance.raw[key] = raw;
        }
      });
    },

    /** Displayed competency value (0–100) or null if no data yet. */
    competencyValue: function (key) {
      var raw = SIGAP.state.get().performance.raw[key];
      if (!raw || !raw.weight) return null;
      return Math.round(raw.sum / raw.weight);
    },

    competencySummary: function () {
      var out = {};
      for (var key in COMPETENCIES) {
        if (COMPETENCIES.hasOwnProperty(key)) out[key] = SIGAP.scoring.competencyValue(key);
      }
      return out;
    },

    /** Record a misconception warning for the teacher dashboard. */
    recordMisconception: function (caseId, text) {
      SIGAP.state.update(function (s) {
        s.performance.misconceptions.push({ caseId: caseId, text: text, at: Date.now() });
        if (s.performance.misconceptions.length > 40) s.performance.misconceptions.shift();
      });
    },

    /**
     * Finalize a case run. Handles practice-run rules, XP, competencies,
     * calibration flags, and progress records.
     *
     * params: {
     *   caseId, investigationQuality, decisionCorrect, evidenceRelevance,
     *   confidence, decisionLabel,
     *   competencies: { key: {score, weight} },
     *   xp (default 100)
     * }
     * Returns { result, practice }.
     */
    finishCase: function (p) {
      var practice = SIGAP.state.isPractice('case', p.caseId);
      var result = SIGAP.scoring.computeCaseScore(p);

      SIGAP.state.update(function (s) {
        var c = SIGAP.state.caseProgress(p.caseId);
        c.attempts += 1;
        if (practice) c.practiceRuns += 1;
        c.latestScore = result.total;
        if (c.bestScore === null || result.total > c.bestScore) c.bestScore = result.total;
        if (!practice) {
          c.breakdown = result.breakdown;
          c.decision = p.decisionLabel || null;
          c.confidence = p.confidence;
        }
        c.completedAt = Date.now();
        var wasCompleted = c.completed;
        c.completed = true;

        // Calibration flags count only on scored (non-practice) runs.
        if (!practice) {
          s.performance.flags[result.calibration] = (s.performance.flags[result.calibration] || 0) + 1;
        }
      });

      if (!practice) {
        if (p.competencies) SIGAP.scoring.recordCompetencies(p.competencies);
        SIGAP.state.addXP(typeof p.xp === 'number' ? p.xp : 100, 'CASE selesai');
        if (result.calibration === 'overconfident') {
          SIGAP.scoring.recordMisconception(p.caseId,
            'Confidence terlalu tinggi dibanding kekuatan bukti (' + p.confidence + '%).');
        }
      }

      return { result: result, practice: practice };
    },

    /**
     * Finalize a lab run.
     * params: { labId, score (0-100), competencies, xp (default 50) }
     */
    finishLab: function (p) {
      var practice = SIGAP.state.isPractice('lab', p.labId);
      SIGAP.state.update(function (s) {
        var l = SIGAP.state.labProgress(p.labId);
        l.attempts += 1;
        l.latestScore = p.score;
        if (l.bestScore === null || p.score > l.bestScore) l.bestScore = p.score;
        l.completed = true;
        l.completedAt = Date.now();
      });
      if (!practice) {
        if (p.competencies) SIGAP.scoring.recordCompetencies(p.competencies);
        SIGAP.state.addXP(typeof p.xp === 'number' ? p.xp : 50, 'Lab selesai');
      }
      return { practice: practice };
    }
  };
})();
