'use client';

import { useId, useState } from 'react';
import type { AnswerValue, Question } from '../../fixtures';
import { QuestionBlock } from './QuestionBlock';

/** Each Question type on its own strip paper, answerable, with its live answer value printed underneath. */
export function QuestionsDemo({ questions }: { questions: Question[] }) {
  const scope = useId();
  const [values, setValues] = useState<Record<string, AnswerValue>>({});
  return (
    <div className="hh-round">
      <ol className="hh-round-questions">
        {questions.map((question, index) => (
          <QuestionBlock
            key={question.id}
            question={question}
            index={index}
            scope={scope}
            value={values[question.id]}
            onChange={(value) => setValues((previous) => ({ ...previous, [question.id]: value }))}
            hints={false}
          />
        ))}
      </ol>
      <div className="hh-answer-bar">
        <p className="hh-mono-sm" aria-live="polite">
          Answer value: {JSON.stringify(values)}
        </p>
      </div>
    </div>
  );
}
