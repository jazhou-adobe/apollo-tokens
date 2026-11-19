'use client';

import type { AnswerValue, Question } from '../../fixtures';
import { Icon, type IconName } from '../Icon';
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
  /** Submit was tried while this Question had no Answer. */
  invalid?: boolean;
  /** The Round expired or was cancelled: the draft stays visible and selectable, but can no longer change. */
  readOnly?: boolean;
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

/** Id of a Question's block, so the bay can move focus to the first unanswered one. */
export const questionDomId = (scope: string, questionId: string) => `${scope}-${questionId}`;

type OptionRowProps = {
  type: 'radio' | 'checkbox';
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  hint?: string;
  recommended?: boolean;
  choice?: 'approve' | 'reject';
  icon?: IconName;
  label: string;
  detail?: string;
};

/** One choice row: the whole row is the label and the target. The key hint slot is always present to keep columns aligned. */
function OptionRow({ type, name, value, checked, onChange, hint, recommended, choice, icon, label, detail }: OptionRowProps) {
  return (
    <label className="hh-option" data-recommended={recommended ? 'true' : undefined} data-choice={choice} data-checked={checked ? 'true' : undefined}>
      {hint ? (
        <span className="hh-kbd" aria-hidden="true">
          {hint}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} aria-keyshortcuts={hint} />
      <span className="hh-option-text">
        {recommended ? (
          <span className="hh-recommended">
            <Icon name="check" /> Recommended
          </span>
        ) : null}
        <span className="hh-option-label">
          {icon ? <Icon name={icon} /> : null}
          {label}
        </span>
        {detail ? <span className="hh-option-detail">{detail}</span> : null}
      </span>
    </label>
  );
}

/** One Question beside its Answer slot: the call on the left, the response on the right (stacked on narrow screens). */
export function QuestionBlock({ question, index, scope, value, onChange, current = false, onFocus, hints = true, invalid = false, readOnly = false }: QuestionBlockProps) {
  const promptId = `${scope}-${question.id}-prompt`;
  const stateId = `${scope}-${question.id}-state`;
  const errorId = `${scope}-${question.id}-error`;
  const describedBy = [stateId, invalid ? errorId : null].filter(Boolean).join(' ');
  const name = `${scope}-${question.id}`;
  return (
    <li id={questionDomId(scope, question.id)} className="hh-question" data-current={current ? 'true' : undefined} data-invalid={invalid ? 'true' : undefined} onFocus={onFocus}>
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
        <fieldset className="hh-question-response" aria-labelledby={promptId} aria-describedby={describedBy} disabled={readOnly}>
          {question.options.map((option, optionIndex) => {
            const selected = question.kind === 'multi' ? Array.isArray(value) && value.includes(option.id) : value === option.id;
            const recommended = question.kind === 'multi' ? question.recommended?.includes(option.id) : question.recommended === option.id;
            return (
              <OptionRow
                key={option.id}
                type={question.kind === 'multi' ? 'checkbox' : 'radio'}
                name={name}
                value={option.id}
                checked={selected}
                hint={hints && optionIndex < 9 ? String(optionIndex + 1) : undefined}
                recommended={recommended}
                label={option.label}
                detail={option.detail}
                onChange={() => {
                  if (question.kind === 'single') onChange(option.id);
                  else {
                    const list = Array.isArray(value) ? value : [];
                    onChange(selected ? list.filter((id) => id !== option.id) : [...list, option.id]);
                  }
                }}
              />
            );
          })}
        </fieldset>
      ) : null}

      {question.kind === 'approve' ? (
        // APG radio group: two options, arrows move and select, A and R choose directly. Choosing never submits.
        <fieldset className="hh-question-response" aria-labelledby={promptId} aria-describedby={describedBy} disabled={readOnly}>
          <div className="hh-approve-pair">
            {(['approve', 'reject'] as const).map((choice) => (
              <OptionRow
                key={choice}
                type="radio"
                name={name}
                value={choice}
                choice={choice}
                checked={value === choice}
                hint={hints ? (choice === 'approve' ? 'A' : 'R') : undefined}
                recommended={question.recommended === choice}
                icon={choice === 'approve' ? 'check' : 'x'}
                label={choice === 'approve' ? 'Approve' : 'Reject'}
                onChange={() => onChange(choice)}
              />
            ))}
          </div>
          {question.recommended ? null : <p className="hh-body-sm">No recommendation from the Agent.</p>}
        </fieldset>
      ) : null}

      {question.kind === 'text' ? (
        <div className="hh-question-response">
          <div className="hh-field">
            <label className="hh-label" htmlFor={`${name}-text`}>
              Answer (optional)
            </label>
            <textarea
              id={`${name}-text`}
              className="hh-textarea"
              aria-describedby={promptId}
              placeholder={question.placeholder}
              value={typeof value === 'string' ? value : ''}
              readOnly={readOnly}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {invalid ? (
        <p id={errorId} className="hh-error">
          <span className="hh-badge" data-tone="destructive">
            Error
          </span>
          {question.kind === 'multi' ? 'Choose at least one option.' : question.kind === 'approve' ? 'Choose Approve or Reject.' : 'Choose one option.'}
        </p>
      ) : null}
    </li>
  );
}
