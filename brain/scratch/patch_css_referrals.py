with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

referral_styles = '''
/* ─── REFERRAL QUESTIONNAIRE (Sunset Orange & Obsidian Black) ───────── */
.referral-fieldset {
  border: 1px solid rgba(255, 107, 53, 0.25) !important;
  background: linear-gradient(180deg, rgba(255, 107, 53, 0.03) 0%, rgba(14, 14, 18, 0.8) 100%);
  border-radius: 14px;
  padding: 24px !important;
  margin-top: 14px;
}

.referral-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.referral-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #F7EDE2;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.referral-card:hover {
  background: rgba(255, 107, 53, 0.08);
  border-color: rgba(255, 107, 53, 0.35);
  transform: translateY(-1px);
}

.referral-card.selected {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.12) 100%);
  border-color: #FF6B35;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.25), inset 0 0 0 1px #FF6B35;
  color: #FFFFFF;
  font-weight: 600;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.referral-card.selected .radio-circle {
  border-color: #FF6B35;
  background: #FF6B35;
}

.radio-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #FFFFFF;
}

.source-label {
  font-size: 13px;
  line-height: 1.25;
}

.referral-conditional-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-left: 3px solid #FF6B35;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
}

.referral-conditional-box label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #F7EDE2;
}

.referral-conditional-box input {
  background: #0E0E12;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.referral-conditional-box input:focus {
  border-color: #FF6B35;
  box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
}

.prior-attendance-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 16px;
  margin-top: 8px;
}

.prior-title {
  font-size: 13px;
  font-weight: 600;
  color: #F7EDE2;
  margin: 0 0 12px 0;
}

.prior-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.prior-choice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #E2D7CC;
  cursor: pointer;
  transition: all 0.2s;
}

.prior-choice:hover {
  background: rgba(255, 107, 53, 0.08);
  border-color: rgba(255, 107, 53, 0.3);
}

.prior-choice.selected {
  background: rgba(255, 107, 53, 0.18);
  border-color: #FF6B35;
  color: #FFFFFF;
  font-weight: 600;
}

.radio-circle-small {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prior-choice.selected .radio-circle-small {
  border-color: #FF6B35;
  background: #FF6B35;
}

.radio-dot-small {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #FFFFFF;
}

@media (max-width: 640px) {
  .referral-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .referral-card {
    padding: 10px 12px;
  }
  .source-label {
    font-size: 12px;
  }
  .prior-options {
    flex-direction: column;
  }
}
'''

if '.referral-fieldset' not in css:
    css += '\n' + referral_styles
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print('Added referral styles to src/index.css')
else:
    print('Referral styles already in src/index.css')

