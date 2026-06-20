import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn, useDialog } from '../components/UI'

export function QuizPreview({ setPage, data, refreshData }) {
  const quizzes = data?.quizzes || []
  const [activeQuiz, setActiveQuiz] = useState(null)
  const { alert, confirm, DialogHost } = useDialog()

  const handleDelete = async (id, title) => {
    const ok = await confirm(
      `This will permanently remove the quiz "${title}".`,
      'Delete Quiz?',
      'delete',
      'Delete Quiz'
    )
    if (!ok) return
    try {
      await api.deleteQuiz(id)
      await alert('Quiz deleted successfully!', 'success', 'Quiz Deleted')
      refreshData()
    } catch (err) {
      await alert('Error deleting quiz: ' + err.message, 'error', 'Delete Failed')
    }
  }

  if (activeQuiz) {
    return <MCQQuiz quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />
  }

  return (
    <div className="w-full pb-12">
      <DialogHost />
      <PageHeader 
        title="Quiz Preview" 
        subtitle="Preview and manage all quizzes." 
        action={<Btn icon="plus" onClick={() => setPage('createMcq')}>Create Quiz</Btn>} 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 leading-tight">{q.title}</h3>
                <Badge color="green">Active</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-medium">{q.subject}</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-medium">{q.className || 'All Classes'}</span>
                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-medium">{q.mcqs?.length || 0} Qs</span>
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {q.timeLimit || 30} Mins
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setActiveQuiz(q)}
                className="text-xs px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer bg-white transition-all font-semibold"
              >
                Live Preview
              </button>
              <button 
                onClick={() => handleDelete(q.id, q.title)}
                className="text-xs px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer bg-white transition-all font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No quizzes available.</div>
        )}
      </div>
    </div>
  )
}

export function MCQQuiz({ quiz, onBack }) {
  const [selected, setSelected] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizResult, setQuizResult] = useState(null)

  const demoQuiz = {
    title: 'Mathematics Mid-Term Quiz',
    subject: 'Mathematics',
    className: 'Grade 7-A',
    timeLimit: 30,
    mcqs: [
      { question: 'What is the formula for the area of a circle?', options: ['πr²', '2πr', 'πd', '2πr²'], correctAnswer: 'A' },
      { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 'C' },
      { question: 'What is the chemical symbol for Gold?', options: ['Gd', 'Go', 'Au', 'Ag'], correctAnswer: 'C' },
    ]
  };

  const activeQuiz = quiz || demoQuiz;
  const questions = activeQuiz.mcqs || [];

  useEffect(() => {
    if (activeQuiz && activeQuiz.timeLimit) {
      setTimeLeft(activeQuiz.timeLimit * 60)
    }
  }, [activeQuiz])

  useEffect(() => {
    if (!timeLeft) return

    const intervalId = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalId)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = (isAuto = false) => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      const letter = String.fromCharCode(65 + (selected[idx] ?? -1))
      const corrAns = q.correctAnswer || (String.fromCharCode(65 + q.ans))
      if (corrAns === letter) correctCount++
    })
    const msg = isAuto
      ? `Time is up! The quiz has been automatically submitted.\nScore: ${correctCount} / ${questions.length} correct.`
      : `Live Preview Complete!\nScore: ${correctCount} / ${questions.length} correct.`
    // Use a brief timeout so the result shows before navigating back
    setTimeout(() => { if (onBack) onBack() }, 2200)
    // Show a styled inline result banner instead of alert (no useDialog here — MCQQuiz is standalone)
    setQuizResult({ msg, correctCount, total: questions.length })
  }

  return (
    <div className="w-full pb-12">
      {quizResult && (
        <div className={`mb-5 flex items-center gap-4 px-6 py-4 rounded-2xl border ${
          quizResult.correctCount === quizResult.total
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : quizResult.correctCount >= quizResult.total / 2
            ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="text-3xl">
            {quizResult.correctCount === quizResult.total ? '🎉' : quizResult.correctCount >= quizResult.total / 2 ? '✅' : '⚠️'}
          </div>
          <div>
            <p className="font-bold text-base">{quizResult.msg.split('\n')[0]}</p>
            <p className="text-sm font-semibold mt-0.5">{quizResult.msg.split('\n')[1]}</p>
          </div>
        </div>
      )}
      <PageHeader 
        title="Live Quiz Preview" 
        subtitle={`Attempting preview: ${activeQuiz.title}`} 
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <span className="text-sm text-gray-500 font-medium">
            {activeQuiz.subject} • {activeQuiz.className || 'All Classes'} • {questions.length} Questions
          </span>
          {activeQuiz.timeLimit ? (
            <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg shrink-0 ${timeLeft < 60 ? 'text-red-600 bg-red-50 animate-pulse' : 'text-indigo-600 bg-indigo-50'}`}>
              <Icon path={icons.clock} size={14} /> Time Left: {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium shrink-0">
              <Icon path={icons.clock} size={14} /> Unlimited Preview Time
            </div>
          )}
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="mb-8 p-6 bg-slate-50/50 rounded-2xl border border-gray-100">
            <p className="text-base font-bold text-gray-800 mb-4">Q{qi + 1}. {q.question || q.q}</p>
            <div className="grid grid-cols-1 gap-2.5">
              {(q.options || q.opts).map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setSelected((p) => ({ ...p, [qi]: oi }))}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all cursor-pointer ${
                    selected[qi] === oi
                      ? 'border-indigo-400 bg-indigo-50/80 text-indigo-700 font-bold shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/20'
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold mr-3 ${selected[qi] === oi ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {String.fromCharCode(65 + oi)}
                  </span> 
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <Btn onClick={() => handleSubmit(false)}>
            Submit Preview
          </Btn>
          {onBack && (
            <Btn variant="outline" onClick={onBack}>
              Cancel Preview
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}

export function CreateMCQ({ setPage, refreshData }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [className, setClassName] = useState('')
  const [timeLimit, setTimeLimit] = useState('30')
  const [questions, setQuestions] = useState([])
  const [previewing, setPreviewing] = useState(false)
  const dlg = useDialog()
  
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [optA, setOptA] = useState('')
  const [optB, setOptB] = useState('')
  const [optC, setOptC] = useState('')
  const [optD, setOptD] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')

  const handleAddQuestion = async () => {
    if (!currentQuestion.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim() || !correctAnswer) {
      await dlg.alert('Please fill in all question fields and select the correct answer.', 'warning', 'Incomplete Question')
      return
    }
    setQuestions([...questions, {
      question: currentQuestion,
      options: [optA, optB, optC, optD],
      correctAnswer
    }])
    setCurrentQuestion('')
    setOptA('')
    setOptB('')
    setOptC('')
    setOptD('')
    setCorrectAnswer('')
  }

  const handleSaveQuiz = async () => {
    if (!title.trim() || !subject) {
      await dlg.alert('Quiz Title and Subject are required.', 'warning', 'Missing Fields')
      return
    }
    if (questions.length === 0) {
      await dlg.alert('Please add at least one question.', 'warning', 'No Questions')
      return
    }

    try {
      await api.createQuiz({
        title,
        subject,
        className: className || 'All Classes',
        timeLimit: parseInt(timeLimit) || 30,
        mcqs: questions
      })
      await dlg.alert('Quiz created successfully!', 'success', 'Quiz Created')
      refreshData()
      setPage('quizPreview')
    } catch (err) {
      await dlg.alert('Error creating quiz: ' + err.message, 'error', 'Save Failed')
    }
  }

  const handleCancel = () => {
    setPage('quizPreview')
  }

  if (previewing) {
    const draftedQuiz = {
      title: title || 'Untitled Quiz',
      subject: subject || 'General',
      className: className || 'All Classes',
      timeLimit: parseInt(timeLimit) || 30,
      mcqs: questions
    };
    return <MCQQuiz quiz={draftedQuiz} onBack={() => setPreviewing(false)} />
  }

  return (
    <div className="w-full pb-12">
      <dlg.DialogHost />
      <PageHeader title="Create MCQ Quiz" subtitle="Create a new multiple choice question quiz." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <Input 
              label="Quiz Title" 
              placeholder="e.g. Mathematics Chapter 3 Quiz" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Select 
              label="Subject" 
              placeholder="Select subject" 
              options={['Mathematics', 'Science', 'English', 'History', 'Algebra', 'Calculus', 'Physics']} 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Select 
              label="Target Class" 
              placeholder="Select target class (optional)" 
              options={['Grade 6-A', 'Grade 7-A', 'Grade 7-B', 'Grade 8-A', 'Grade 8-B', 'Grade 9-C', 'All Classes']} 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div>
            <Input 
              label="Time Limit (Minutes)" 
              type="number"
              placeholder="e.g. 30" 
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mb-6 border-t pt-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Added Questions ({questions.length})</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="p-5 bg-indigo-50/10 rounded-xl border border-indigo-100/40 text-sm hover:border-indigo-100 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-gray-800">Question {idx + 1}</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg font-bold uppercase">Correct Option: {q.correctAnswer}</span>
                  </div>
                  <p className="text-gray-700 mb-4 font-medium leading-relaxed">{q.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt, oi) => {
                      const letter = String.fromCharCode(65 + oi);
                      const isCorrect = q.correctAnswer === letter;
                      return (
                        <div 
                          key={oi} 
                          className={`px-3 py-2 rounded-lg border text-xs ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-800 font-semibold shadow-sm' 
                              : 'bg-white border-gray-100 text-gray-500'
                          }`}
                        >
                          <span className={`font-bold mr-1.5 ${isCorrect ? 'text-emerald-600' : 'text-gray-400'}`}>{letter}.</span> {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 mb-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-2">New Question Form</h4>
          <Input 
            label="Question Text" 
            placeholder="e.g. What is 5 + 5?" 
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Option A" placeholder="Option A" value={optA} onChange={(e) => setOptA(e.target.value)} />
            <Input label="Option B" placeholder="Option B" value={optB} onChange={(e) => setOptB(e.target.value)} />
            <Input label="Option C" placeholder="Option C" value={optC} onChange={(e) => setOptC(e.target.value)} />
            <Input label="Option D" placeholder="Option D" value={optD} onChange={(e) => setOptD(e.target.value)} />
          </div>
          <Select 
            label="Correct Answer Option" 
            placeholder="Select correct option" 
            options={['A', 'B', 'C', 'D']} 
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
          <button 
            type="button"
            onClick={handleAddQuestion}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 cursor-pointer transition-all"
          >
            + Add Question to Quiz
          </button>
        </div>

        <div className="flex gap-3">
          <Btn icon="pencil" onClick={handleSaveQuiz}>Save Quiz</Btn>
          <Btn onClick={async () => {
            if (questions.length === 0) {
              await dlg.alert('Please add at least one question to preview.', 'warning', 'No Questions')
              return
            }
            setPreviewing(true)
          }}>
            Live Preview
          </Btn>
          <Btn variant="outline" onClick={handleCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}
