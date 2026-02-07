<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import FavoriteButton from './FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';

const props = defineProps<{ tool: Tool & { category: string } }>();
const { tool } = toRefs(props);
const theme = useThemeVars();
</script>

<template>
  <router-link :to="tool.path" class="decoration-none tool-card-link">
    <c-card class="h-full tool-card !border-2px !hover:border-primary">
      <div flex items-center justify-between>
        <n-icon class="text-neutral-400 dark:text-neutral-300" size="40" :component="tool.icon" />

        <div flex items-center gap-8px>
          <div
            v-if="tool.isNew"
            class="rounded-full px-8px py-3px text-xs text-white dark:text-neutral-800"
            :style="{
              'background-color': theme.primaryColor,
            }"
          >
            {{ $t('toolCard.new') }}
          </div>

          <FavoriteButton :tool="tool" />
        </div>
      </div>

      <div class="truncat my-5px text-lg text-black dark:text-white">
        {{ tool.name }}
      </div>

      <div class="line-clamp-2 text-neutral-500 dark:text-neutral-400">
        {{ tool.description }}
      </div>
    </c-card>
  </router-link>
</template>

<style scoped>
.tool-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.tool-card-link:hover .tool-card {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 165, 76, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06);
}
</style>
