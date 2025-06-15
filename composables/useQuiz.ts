export interface WordData {
  japanese: string
  japanese_meaning: string
  chinese: string
  chinese_meaning: string
  pinyin: string
}

export interface QuizQuestion {
  question: string
  questionMeaning: string
  correctAnswer: string
  correctAnswerMeaning: string
  options: Array<{
    text: string
    meaning: string
    isCorrect: boolean
  }>
}

export interface QuizStats {
  attempted: number
  correct: number
}

export const useQuiz = () => {
  const words = ref<WordData[]>([])
  const currentQuestionIndex = ref(0)
  const currentQuestion = ref<QuizQuestion | null>(null)
  const showResult = ref(false)
  const lastAnswerCorrect = ref(false)
  
  // Load words from CSV data
  const loadWords = async () => {
    try {
      // Import the CSV data as raw text
      const csvData = `japanese,japanese_meaning,chinese,chinese_meaning,pinyin
こんにちは,挨拶,你好,问候,nǐ hǎo
ありがとう,感謝,谢谢,感谢,xiè xiè
すみません,謝罪,对不起,道歉,duì bù qǐ
水,液体,水,液体,shuǐ
本,書籍,书,书籍,shū
学校,教育機関,学校,教育机关,xué xiào
友達,仲間,朋友,朋友,péng yǒu
時間,時刻,时间,时间,shí jiān
食べ物,食料,食物,食物,shí wù
家,住居,家,家,jiā`
      
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',')
      
      words.value = lines.slice(1).map(line => {
        const values = line.split(',')
        return {
          japanese: values[0],
          japanese_meaning: values[1],
          chinese: values[2],
          chinese_meaning: values[3],
          pinyin: values[4]
        }
      })
    } catch (error) {
      console.error('Failed to load words:', error)
    }
  }

  // Generate quiz question for Chinese -> Japanese mode
  const generateChineseToJapaneseQuestion = (): QuizQuestion => {
    const correctWord = words.value[Math.floor(Math.random() * words.value.length)]
    const wrongWords = words.value
      .filter(w => w.japanese !== correctWord.japanese)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    const options = [
      {
        text: correctWord.japanese,
        meaning: correctWord.japanese_meaning,
        isCorrect: true
      },
      ...wrongWords.map(w => ({
        text: w.japanese,
        meaning: w.japanese_meaning,
        isCorrect: false
      }))
    ].sort(() => Math.random() - 0.5)

    return {
      question: `${correctWord.chinese} (${correctWord.pinyin})`,
      questionMeaning: correctWord.chinese_meaning,
      correctAnswer: correctWord.japanese,
      correctAnswerMeaning: correctWord.japanese_meaning,
      options
    }
  }

  // Generate quiz question for Japanese -> Chinese mode
  const generateJapaneseToChineseQuestion = (): QuizQuestion => {
    const correctWord = words.value[Math.floor(Math.random() * words.value.length)]
    const wrongWords = words.value
      .filter(w => w.chinese !== correctWord.chinese)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    const options = [
      {
        text: `${correctWord.chinese} (${correctWord.pinyin})`,
        meaning: correctWord.chinese_meaning,
        isCorrect: true
      },
      ...wrongWords.map(w => ({
        text: `${w.chinese} (${w.pinyin})`,
        meaning: w.chinese_meaning,
        isCorrect: false
      }))
    ].sort(() => Math.random() - 0.5)

    return {
      question: correctWord.japanese,
      questionMeaning: correctWord.japanese_meaning,
      correctAnswer: `${correctWord.chinese} (${correctWord.pinyin})`,
      correctAnswerMeaning: correctWord.chinese_meaning,
      options
    }
  }

  // Start a new question
  const nextQuestion = (mode: 'cn-jp' | 'jp-cn') => {
    if (words.value.length === 0) {
      loadWords()
      return
    }

    showResult.value = false
    currentQuestion.value = mode === 'cn-jp' 
      ? generateChineseToJapaneseQuestion()
      : generateJapaneseToChineseQuestion()
  }

  // Handle answer selection
  const selectAnswer = (optionIndex: number, mode: 'cn-jp' | 'jp-cn') => {
    if (!currentQuestion.value) return

    const selectedOption = currentQuestion.value.options[optionIndex]
    lastAnswerCorrect.value = selectedOption.isCorrect
    showResult.value = true

    // Update stats
    updateStats(mode, selectedOption.isCorrect)
  }

  // Get quiz stats from localStorage
  const getStats = (mode: 'cn-jp' | 'jp-cn'): QuizStats => {
    if (process.client) {
      const stored = localStorage.getItem(`quiz-stats-${mode}`)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return { attempted: 0, correct: 0 }
  }

  // Update quiz stats in localStorage
  const updateStats = (mode: 'cn-jp' | 'jp-cn', isCorrect: boolean) => {
    if (process.client) {
      const stats = getStats(mode)
      stats.attempted++
      if (isCorrect) stats.correct++
      localStorage.setItem(`quiz-stats-${mode}`, JSON.stringify(stats))
    }
  }

  // Reset stats
  const resetStats = (mode: 'cn-jp' | 'jp-cn') => {
    if (process.client) {
      localStorage.removeItem(`quiz-stats-${mode}`)
    }
  }

  return {
    words: readonly(words),
    currentQuestion: readonly(currentQuestion),
    showResult: readonly(showResult),
    lastAnswerCorrect: readonly(lastAnswerCorrect),
    loadWords,
    nextQuestion,
    selectAnswer,
    getStats,
    resetStats
  }
}