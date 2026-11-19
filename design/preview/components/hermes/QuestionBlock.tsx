'use client';

import type { AnswerValue, Question } from '../../fixtures';
import { Icon } from '../Icon';
import { Attachment } from './Attachment';
import { QUESTION_KIND } from './Strip';

type QuestionBlockProps = {
  question: Question;
  index: number;
  /** Scopes input names and ids to one Round. */
  scope: string;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  current?: boolean;
  onFocus?: () => void;
  /** Show digit and letter key hints beside the choices. */
  hints?: boolean;
};

export function isAnswered(question: Question, value: AnswerValue | undefined) {
  if (question.kind === 'text') return true;
  if (question.kind === 'multi') return Array.isArray(value) && value.length > 0;
  return typeof value === 'string' && value.length > 0;
}

export function answerWord(question: Question, value: AnswerValue | undefined) {
  if (question.kind === 'text') return typeof value === 'string' && value.trim() ? 'Answered' : 'Optional';
  if (!isAnswered(question, value)) return 'Not answered';
  if (question.kind === 'approve') return value === 'approve' ? 'Approved' : 'Rejected';
  return 'Answered';
}

/** One Question beside its Answer slot: the call on the left, the response on the right (stacked on narrow screens). */
export function QuestionBlock({ question, index, scope, value, onChange, current = false, onFocus, hints = true }: QuestionBlockProps) {
  const promptId = `${scope}-${question.id}-prompt`;
  const stateId = `${scope}-${question.id}-state`;
  return (
    <li className="hh-question" data-current={current ? 'true' : undefined} onFocus={onFocus}>
      <div className="hh-question-call">
        <div className="hh-question-meta">
          <span className="hh-mono-sm">Q{index + 1}</span>
          <span className="hh-badge">{QUESTION_KIND[question.kind]}</span>
          <span id={stateId} className="hh-answer-state">
            {isAnswered(question, value) && question.kind !== 'text' ? <Icon name="check" /> : null} {answerWord(question, value)}
          </span>
        </div>
        <p id={promptId} className="hh-question-prompt">
          {question.prompt}
        </p>
        {question.attachments?.map((attachment) => <Attachment key={attachment.title} attachment={attachment} />)}
      </div>

      {question.kind === 'single' || question.kind === 'multi' ? (
        <fieldset className="hh-question-response" aria-labelledby={promptId} aria-describedby={stateId}>
          {question.options.map((option, optionIndex) => {
            const selected = question.kind === 'multi' ? Array.isArray(value) && value.includes(option.id) : value === option.id;
            const recommended = question.kind === 'multi' ? question.recommended?.includes(option.id) : question.recommended === option.id;
            return (
              <label key={option.id} className="hh-option" data-recommended={recommended ? 'true' : undefined}>
                {/* Always three grid cells: an empty slot keeps the columns aligned when key hints are off. */}
                {hints && optionIndex < 9 ? (
                  <span className="hh-kbd" aria-hidden="true">
                    {optionIndex + 1}
                  </span>
                ) : (
                  <span aria-hidden="true" />
                )}
                <input
                  type={question.kind === 'multi' ? 'checkbox' : 'radio'}
                  name={`${scope}-${question.id}`}
                  checked={selected}
                  onChange={() => {
                    if (question.kind === 'single') onChange(option.id);
                    else {
                      const list = Array.isArray(value) ? value : [];
                      onChange(selected ? list.filter((id) => id !== option.id) : [...list, option.id]);
                    }
                  }}
                />
                <span className="hh-option-text">
                  {recommended ? (
                    <span className="hh-recommended">
                      <Icon name="check" /> Recommended
                    </span>
                  ) : null}
                  <span>{option.label}</span>
                  {option.detail ? <span className="hh-option-detail">{option.detail}</span> : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      {question.kind === 'approve' ? (
        <div className="hh-question-response" role="group" aria-labelledby={promptId} aria-describedby={stateId}>
          <div className="hh-approve-pair">
            <button type="button" className="hh-button" data-variant="primary" data-size="lg" aria-pressed={value === 'approve'} onClick={() => onChange('approve')}>
              <Icon name="check" /> Approve
              {hints ? (
                <span className="hh-kbd" aria-hidden="true">
                  A
                </span>
              ) : null}
            </button>
            <button type="button" className="hh-button" data-variant="destructive" data-size="lg" aria-pressed={value === 'reject'} onClick={() => onChange('reject')}>
              <Icon name="x" /> Reject
              {hints ? (
                <span className="hh-kbd" aria-hidden="true">
                  R
                </span>
              ) : null}
            </button>
          </div>
          {question.recommended ? (
            <p className="hh-body-sm">
              <span className="hh-recommended">
                <Icon name="check" /> Recommended
              </span>{' '}
              {question.recommended === 'approve' ? 'Approve' : 'Reject'}
            </p>
          ) : (
            <p className="hh-body-sm">
              No recommendation from the Agent.
            </p>
          )}
        </div>
      ) : null}

      {question.kind === 'text' ? (
        <div className="hh-question-response">
          <div className="hh-field">
            <label className="hh-label" htmlFor={`${scope}-${question.id}-text`}>
              Answer (optional)
            </label>
            <textarea
              id={`${scope}-${question.id}-text`}
              className="hh-textarea"
              aria-describedby={promptId}
              placeholder={question.placeholder}
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </li>
  );
}
