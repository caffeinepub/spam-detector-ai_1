# Spam Detector AI

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Text input interface for pasting or typing messages/emails
- Motoko backend with keyword-frequency-based spam detection model
- Spam probability scoring with reasoning (which keywords triggered detection)
- Results display with spam/safe classification and confidence percentage
- Color-coded badges: red for spam, green for safe
- Analysis history panel showing previously analyzed messages
- Clear/reset functionality

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- `analyzeMessage(text: Text) -> SpamResult` -- runs keyword-frequency scoring, returns score 0-100, label (spam/ham), and list of matched spam indicators
- `getHistory() -> [HistoryEntry]` -- returns stored analysis history (up to 50 entries)
- `clearHistory() -> ()` -- clears analysis history
- SpamResult type: `{ score: Nat; isSpam: Bool; confidence: Float; reasons: [Text]; snippet: Text; timestamp: Int }`
- HistoryEntry type: `{ id: Nat; snippet: Text; isSpam: Bool; confidence: Float; timestamp: Int }`
- Spam detection logic: weighted keyword dictionary covering common spam categories (financial scams, phishing, adult content, lottery, pills/pharma, urgency language), plus heuristics (excessive caps, exclamation marks, suspicious URLs)

### Frontend (React + TypeScript)
- Header with app name and tagline
- Large textarea input with character count
- "Analyze" button with loading state
- Results card: classification badge, confidence meter/progress bar, reasons list
- Scrollable history sidebar with past analyses
- Responsive layout: two-column on desktop, stacked on mobile
