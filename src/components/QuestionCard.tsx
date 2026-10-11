import React from 'react';
import { Question } from '../engine/types.ts';
import { GeometryFigure } from './GeometryFigure.tsx';
import { isThinkingTopic } from '../engine/generators/thinking.ts';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const isLifeTopic = ['money', 'time', 'calendar'].includes(question.topic) || isThinkingTopic(question.topic);

  return (
    <div className="question-container">
      {isLifeTopic ? (
        <div className="question-life">{question.prompt}</div>
      ) : (
        <div className="question-math">{question.prompt}</div>
      )}
      {question.diagram && <GeometryFigure diagram={question.diagram} />}
    </div>
  );
};
