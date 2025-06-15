<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-4 mb-4">
          <UButton 
            @click="navigateTo('/')" 
            variant="outline" 
            color="gray"
            icon="i-heroicons-arrow-left"
          >
            戻る / Back
          </UButton>
          <h1 class="text-2xl font-bold text-gray-800">
            {{ mode === 'cn-jp' ? '中文 → 日本語' : '日本語 → 中文' }}
          </h1>
        </div>
        
        <!-- Stats -->
        <div class="flex justify-center gap-8 text-sm text-gray-600">
          <div>問題数: {{ stats.attempted }}</div>
          <div>正解数: {{ stats.correct }}</div>
          <div v-if="stats.attempted > 0">
            正解率: {{ Math.round((stats.correct / stats.attempted) * 100) }}%
          </div>
        </div>
      </div>

      <!-- Quiz Content -->
      <UCard v-if="currentQuestion && !showResult" class="mb-6">
        <template #header>
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">
              {{ currentQuestion.question }}
            </h2>
            <p class="text-gray-600 text-sm">
              意味: {{ currentQuestion.questionMeaning }}
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <UButton
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectAnswer(index)"
            variant="outline"
            color="gray"
            size="lg"
            class="w-full text-left justify-start h-auto py-4"
          >
            <div>
              <div class="font-medium">{{ option.text }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ option.meaning }}</div>
            </div>
          </UButton>
        </div>
      </UCard>

      <!-- Result Display -->
      <UCard v-if="showResult && currentQuestion">
        <template #header>
          <div class="text-center">
            <div class="text-2xl mb-2">
              {{ lastAnswerCorrect ? '✅ 正解!' : '❌ 不正解' }}
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2">問題:</h3>
            <div class="text-blue-700">
              {{ currentQuestion.question }} - {{ currentQuestion.questionMeaning }}
            </div>
          </div>

          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-800 mb-2">正解:</h3>
            <div class="text-green-700">
              {{ currentQuestion.correctAnswer }} - {{ currentQuestion.correctAnswerMeaning }}
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">選択肢の意味:</h3>
            <div class="space-y-1">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="text-gray-700 text-sm"
                :class="{ 'font-semibold text-green-600': option.isCorrect }"
              >
                {{ option.text }} - {{ option.meaning }}
                {{ option.isCorrect ? ' (正解)' : '' }}
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <UButton 
              @click="nextQuestion" 
              color="blue" 
              size="lg"
              class="flex-1"
            >
              次の問題 / Next
            </UButton>
            <UButton 
              @click="navigateTo('/')" 
              variant="outline" 
              color="gray"
              size="lg"
            >
              終了 / Finish
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Loading state -->
      <UCard v-if="!currentQuestion">
        <div class="text-center py-8">
          <div class="text-gray-600">問題を読み込み中...</div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const mode = route.params.mode as 'cn-jp' | 'jp-cn'

// Validate mode
if (!['cn-jp', 'jp-cn'].includes(mode)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Invalid quiz mode'
  })
}

const { 
  currentQuestion, 
  showResult, 
  lastAnswerCorrect,
  loadWords,
  nextQuestion: generateNextQuestion,
  selectAnswer: selectQuizAnswer,
  getStats
} = useQuiz()

const stats = ref({ attempted: 0, correct: 0 })

const loadStats = () => {
  stats.value = getStats(mode)
}

const selectAnswer = (optionIndex: number) => {
  selectQuizAnswer(optionIndex, mode)
  // Reload stats after answer
  nextTick(() => {
    loadStats()
  })
}

const nextQuestion = () => {
  generateNextQuestion(mode)
}

// Initialize
onMounted(async () => {
  await loadWords()
  loadStats()
  nextQuestion()
})

// Setup page meta
useHead({
  title: `${mode === 'cn-jp' ? '中文→日本語' : '日本語→中文'} クイズ`
})
</script>