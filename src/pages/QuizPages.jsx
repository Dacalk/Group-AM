import { useState } from 'react'
import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn } from '../components/UI'

export function QuizPreview({ setPage }) {
  const quizzes = [
    { title: 'Mathematics Mid-Term Quiz', class: 'Grade 7-A', subject: 'Math', questions: 20, duration: '45 min', status: 'Active' },
    { title: 'Science Chapter 5 Quiz', class: 'Grade 8-B', subject: 'Science', questions: 15, duration: '30 min', status: 'Active' },
    { title: 'English Grammar Test', class: 'All Grades', subject: 'English', questions: 25, duration: '60 min', status: 'Draft' },
    { title: 'World History Quiz 3', class: 'Grade 9-C', subject: 'History', questions: 18, duration: '35 min', status: 'Active' },
  ]

  return (
    <div>
      <PageHeader title="Quiz Preview" subtitle="Preview and manage all quizzes." action={<Btn icon="plus" onClick={() => setPage('createMcq')}>Create Quiz</Btn>} />
      <div className="grid grid-cols-2 gap-4">
        {quizzes.map((q, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">{q.title}</h3>
              <Badge color={q.status === 'Active' ? 'green' : 'gray'}>{q.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{q.class}</span>
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">{q.subject}</span>
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">{q.questions} Qs</span>
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">{q.duration}</span>
            </div>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50">Preview</button>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MCQQuiz() {
  const [selected, setSelected] = useState({})
  const questions = [
    { q: 'What is the formula for the area of a circle?', opts: ['πr²', '2πr', 'πd', '2πr²'], ans: 0 },
    { q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Jupiter', 'Mars', 'Saturn'], ans: 2 },
    { q: 'What is the chemical symbol for Gold?', opts: ['Gd', 'Go', 'Au', 'Ag'], ans: 2 },
  ]

  return (
    <div>
      <PageHeader title="MCQ Quiz" subtitle="Mathematics Mid-Term Quiz - Grade 7-A" />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <span className="text-sm text-gray-500">20 Questions • 45 Minutes</span>
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
            <Icon path={icons.clock} size={14} /> 42:15 remaining
          </div>
        </div>
        {questions.map((q, qi) => (
          <div key={qi} className="mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">Q{qi + 1}. {q.q}</p>
            <div className="space-y-2">
              {q.opts.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setSelected((p) => ({ ...p, [qi]: oi }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    selected[qi] === oi
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Btn>Submit Quiz</Btn>
          <Btn variant="outline">Save & Continue Later</Btn>
        </div>
      </div>
    </div>
  )
}

export function CreateMCQ() {
  return (
    <div>
      <PageHeader title="Create MCQ" subtitle="Create a new multiple choice question quiz." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="mb-4"><Input label="Quiz Title" placeholder="e.g. Mathematics Chapter 3 Quiz" /></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select label="Class" placeholder="Select class" options={['Grade 6-A', 'Grade 7-A', 'Grade 8-B']} />
          <Select label="Subject" placeholder="Select subject" options={['Mathematics', 'Science', 'English']} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Duration (minutes)" placeholder="e.g. 45" />
          <Input label="Total Marks" placeholder="e.g. 20" />
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
            <Icon path={icons.plus} size={20} color="#5b5fc7" />
          </div>
          <p className="text-sm font-medium text-gray-700">Add Questions</p>
          <p className="text-xs text-gray-400 mt-1">Click to add MCQ questions one by one</p>
          <button className="mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary">
            + Add Question
          </button>
        </div>
        <div className="flex gap-3">
          <Btn icon="pencil">Save Quiz</Btn>
          <Btn variant="outline">Cancel</Btn>
        </div>
      </div>
    </div>
  )
}
