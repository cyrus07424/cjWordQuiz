<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          中日单词测验 / 中日単語クイズ
        </h1>
        <p class="text-lg text-gray-600">
          Choose your quiz mode / クイズモードを選択してください
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <!-- Chinese to Japanese Quiz -->
        <UCard class="hover:shadow-lg transition-shadow duration-300">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">中文 → 日本語</h2>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-blue-500" />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600">
              中国語の単語を見て、対応する日本語を選択してください
            </p>
            
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-sm text-blue-800 mb-1">統計 / Statistics:</div>
              <div class="text-blue-700">
                正解: {{ cnJpStats.correct }} / {{ cnJpStats.attempted }}
                <span v-if="cnJpStats.attempted > 0">
                  ({{ Math.round((cnJpStats.correct / cnJpStats.attempted) * 100) }}%)
                </span>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton 
                @click="startQuiz('cn-jp')" 
                size="lg" 
                color="primary"
                class="flex-1"
              >
                開始 / Start
              </UButton>
              <UButton 
                @click="resetStats('cn-jp')" 
                variant="outline" 
                color="neutral"
                size="lg"
              >
                リセット
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Japanese to Chinese Quiz -->
        <UCard class="hover:shadow-lg transition-shadow duration-300">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">日本語 → 中文</h2>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-green-500" />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600">
              日本語の単語を見て、対応する中国語を選択してください
            </p>
            
            <div class="bg-green-50 p-3 rounded-lg">
              <div class="text-sm text-green-800 mb-1">統計 / Statistics:</div>
              <div class="text-green-700">
                正解: {{ jpCnStats.correct }} / {{ jpCnStats.attempted }}
                <span v-if="jpCnStats.attempted > 0">
                  ({{ Math.round((jpCnStats.correct / jpCnStats.attempted) * 100) }}%)
                </span>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton 
                @click="startQuiz('jp-cn')" 
                size="lg" 
                color="success"
                class="flex-1"
              >
                開始 / Start
              </UButton>
              <UButton 
                @click="resetStats('jp-cn')" 
                variant="outline" 
                color="neutral"
                size="lg"
              >
                リセット
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getStats, resetStats: resetQuizStats, loadWords } = useQuiz()

// Load stats reactively
const cnJpStats = ref({ attempted: 0, correct: 0 })
const jpCnStats = ref({ attempted: 0, correct: 0 })

const loadStats = () => {
  cnJpStats.value = getStats('cn-jp')
  jpCnStats.value = getStats('jp-cn')
}

const startQuiz = (mode: 'cn-jp' | 'jp-cn') => {
  navigateTo(`/quiz/${mode}`)
}

const resetStats = (mode: 'cn-jp' | 'jp-cn') => {
  resetQuizStats(mode)
  loadStats()
}

// Load data and stats on mount
onMounted(async () => {
  await loadWords()
  loadStats()
})

// Reload stats when returning to page
onActivated(() => {
  loadStats()
})

// Setup page meta
useHead({
  title: '中日単語クイズ - Chinese Japanese Word Quiz'
})
</script>