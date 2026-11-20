'use client';

import { useState } from 'react';
import { ROUNDS, type AnswerValue } from '../../fixtures';
import { QuestionBlock } from './QuestionBlock';

const APPROVE = { ...ROUNDS[2].questions[0], id: 'signature', attachments: undefined };

/**
 * The states a world's signature attaches to, held still for comparison: a sent Round's confirmation in the bay-status
 * region, and an approve / reject Question with Approve chosen. Illustrative data.
 */
export function SignatureSample() {
  const [value, setValue] = useState<AnswerValue>('approve');
  return (
    <div className="hh-stack">
      <p className="hh-label">Signature states</p>
      <div className="hh-bay-status">
        <div className="hh-toast" data-placement="inline">
          <span className="hh-badge" data-tone="answered">
            Answered
          </span>
          <span className="hh-body-sm">Answer sent · R-0141 · 1 Question delivered.</span>
        </div>
      </div>
      <div className="hh-round">
        <ol className="hh-round-questions">
          <QuestionBlock question={APPROVE} index={0} scope="signature-sample" value={value} onChange={setValue} hints={false} />
        </ol>
      </div>
    </div>
  );
}
