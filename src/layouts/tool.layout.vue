<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import { IconHome, IconShare } from '@tabler/icons-vue';

import BaseLayout from './base.layout.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import { useShareableUrl } from '@/composable/shareableUrl';
import type { Tool } from '@/tools/tools.types';

const route = useRoute();
const { copyShareUrl } = useShareableUrl();

const head = computed(() => ({
  title: `${route.meta.name} - IT Tools`,
  meta: [
    {
      name: 'description',
      content: route.meta?.description as string,
    },
    {
      name: 'keywords',
      content: ((route.meta.keywords ?? []) as string[]).join(','),
    },
  ],
}));
useHead(head);
const { t } = useI18n();

const i18nKey = computed<string>(() => route.path.trim().replace('/', ''));
const toolTitle = computed<string>(() => t(`tools.${i18nKey.value}.title`, String(route.meta.name)));
const toolDescription = computed<string>(() => t(`tools.${i18nKey.value}.description`, String(route.meta.description)));
</script>

<template>
  <BaseLayout>
    <div class="tool-layout">
      <div class="tool-header">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">
            <IconHome :size="16" stroke-width="2" />
            <span>Home</span>
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ toolTitle }}</span>
        </nav>

        <div flex flex-nowrap items-center justify-between>
          <h1 class="tool-title">
            {{ toolTitle }}
          </h1>

          <div flex items-center gap-4px>
            <c-tooltip :tooltip="t('share.tooltip', 'Share this tool')">
              <c-button variant="text" circle size="small" @click="copyShareUrl">
                <IconShare :size="20" stroke-width="1.5" />
              </c-button>
            </c-tooltip>
            <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
          </div>
        </div>

        <div class="separator" />

        <div class="description">
          {{ toolDescription }}
        </div>
      </div>
    </div>

    <div class="tool-content">
      <slot />
    </div>
  </BaseLayout>
</template>

<style lang="less" scoped>
.tool-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  animation: fadeSlideUp 0.3s ease-out;

  ::v-deep(& > *) {
    flex: 0 1 600px;
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tool-layout {
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    margin-bottom: 16px;
    opacity: 0.6;

    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: inherit;
      text-decoration: none;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }

    .breadcrumb-separator {
      opacity: 0.5;
    }

    .breadcrumb-current {
      opacity: 0.8;
    }
  }

  .tool-header {
    padding: 32px 0;
    width: 100%;

    .tool-title {
      opacity: 0.9;
      font-size: 32px;
      font-weight: 600;
      margin: 0;
      line-height: 1.2;
    }

    .separator {
      width: 60px;
      height: 3px;
      background: #6366f1;
      border-radius: 2px;
      margin: 12px 0;
    }

    .description {
      margin: 0;
      opacity: 0.7;
      font-size: 15px;
      line-height: 1.5;
    }
  }
}

@media (max-width: 700px) {
  .tool-layout {
    .tool-header {
      padding: 20px 0;

      .tool-title {
        font-size: 24px;
      }
    }
  }
}
</style>
