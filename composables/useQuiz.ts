import wordsJson from '~/data/words.json'

export interface WordData {
  japanese: string
  yomigana: string
  japanese_meaning: string
  chinese: string
  pinyin: string
  chinese_meaning: string
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

  // Utility function to format Japanese text with ruby tags
  const formatJapaneseWithRuby = (japanese: string, yomigana: string): string => {
    return `<ruby>${japanese}<rt>${yomigana}</rt></ruby>`
  }

  // Utility function to format Chinese text with ruby tags
  const formatChineseWithRuby = (chinese: string, pinyin: string): string => {
    return `<ruby>${chinese}<rt>${pinyin}</rt></ruby>`
  }

  // 単語データを読み込む
  const loadWords = async () => {
    // FIXME words.jsonの内容を利用
    words.value = wordsJson
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
        text: formatJapaneseWithRuby(correctWord.japanese, correctWord.yomigana),
        meaning: correctWord.japanese_meaning,
        isCorrect: true
      },
      ...wrongWords.map(w => ({
        text: formatJapaneseWithRuby(w.japanese, w.yomigana),
        meaning: w.japanese_meaning,
        isCorrect: false
      }))
    ].sort(() => Math.random() - 0.5)

    return {
      question: formatChineseWithRuby(correctWord.chinese, correctWord.pinyin),
      questionMeaning: correctWord.chinese_meaning,
      correctAnswer: formatJapaneseWithRuby(correctWord.japanese, correctWord.yomigana),
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
        text: formatChineseWithRuby(correctWord.chinese, correctWord.pinyin),
        meaning: correctWord.chinese_meaning,
        isCorrect: true
      },
      ...wrongWords.map(w => ({
        text: formatChineseWithRuby(w.chinese, w.pinyin),
        meaning: w.chinese_meaning,
        isCorrect: false
      }))
    ].sort(() => Math.random() - 0.5)

    return {
      question: correctWord.japanese,
      questionMeaning: correctWord.japanese_meaning,
      correctAnswer: formatChineseWithRuby(correctWord.chinese, correctWord.pinyin),
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