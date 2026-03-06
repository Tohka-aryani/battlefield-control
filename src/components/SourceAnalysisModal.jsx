import { BIAS_LABELS, FACTUAL_LABELS, getSourceAnalysis } from '../data/wallConfig'

export default function SourceAnalysisModal({ sourceName, onClose }) {
  if (!sourceName) return null
  const analysis = getSourceAnalysis(sourceName)
  const biasIndex = BIAS_LABELS.indexOf(analysis.bias)
  const factualIndex = FACTUAL_LABELS.indexOf(analysis.factual)

  return (
    <div className="source-analysis-overlay" role="dialog" aria-labelledby="source-analysis-title">
      <div className="source-analysis-modal">
        <div className="source-analysis-header">
          <div className="source-analysis-title-row">
            <span className="source-analysis-dot" />
            <h2 id="source-analysis-title" className="source-analysis-title">SOURCE ANALYSIS</h2>
          </div>
          <button
            type="button"
            className="source-analysis-close"
            onClick={onClose}
            aria-label="Close"
          >
            [X]
          </button>
        </div>

        <div className="source-analysis-body">
          <section className="source-analysis-section">
            <div className="source-analysis-label">SOURCE</div>
            <div className="source-analysis-value">{sourceName}</div>
          </section>

          <section className="source-analysis-section">
            <div className="source-analysis-label">POLITICAL BIAS</div>
            <div className="source-analysis-bar" role="group" aria-label="Political bias scale">
              <div className="source-analysis-bar-track source-analysis-bias-track">
                {BIAS_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`source-analysis-bar-segment ${i === biasIndex ? 'active' : ''}`}
                    data-bias={label}
                    style={{ '--segment-index': i, '--total': BIAS_LABELS.length }}
                  >
                    <span className="source-analysis-bar-fill" />
                  </div>
                ))}
              </div>
              <div className="source-analysis-bar-labels">
                {BIAS_LABELS.map((label) => (
                  <span key={label} className="source-analysis-bar-label">{label}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="source-analysis-section">
            <div className="source-analysis-label">FACTUAL REPORTING</div>
            <div className="source-analysis-bar" role="group" aria-label="Factual reporting scale">
              <div className="source-analysis-bar-track source-analysis-factual-track">
                {FACTUAL_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`source-analysis-bar-segment ${i === factualIndex ? 'active' : ''}`}
                    data-factual={label}
                    style={{ '--segment-index': i, '--total': FACTUAL_LABELS.length }}
                  >
                    <span className="source-analysis-bar-fill" />
                  </div>
                ))}
              </div>
              <div className="source-analysis-bar-labels source-analysis-factual-labels">
                {FACTUAL_LABELS.map((label) => (
                  <span key={label} className="source-analysis-bar-label">{label}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="source-analysis-section">
            <div className="source-analysis-label">CREDIBILITY</div>
            <div className="source-analysis-credibility">
              <span className="source-analysis-credibility-dot" />
              <span className="source-analysis-credibility-text">{analysis.credibility}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
