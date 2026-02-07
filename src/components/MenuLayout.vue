<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
const showOverlay = computed(() => isSmallScreen.value && !isMenuCollapsed.value);
</script>

<template>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="240"
      :collapsed="isMenuCollapsed"
      :show-trigger="false"
      :native-scrollbar="false"
      :position="siderPosition"
    >
      <slot name="sider" />
    </n-layout-sider>
    <n-layout class="content">
      <slot name="content" />
      <transition name="overlay-fade">
        <div v-if="showOverlay" class="overlay" @click="isMenuCollapsed = true" />
      </transition>
    </n-layout>
  </n-layout>
</template>

<style lang="less" scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  cursor: pointer;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.content {
  ::v-deep(.n-layout-scroll-container) {
    padding: 26px;
  }
}

@media (max-width: 700px) {
  .content {
    ::v-deep(.n-layout-scroll-container) {
      padding: 16px;
    }
  }
}

.n-layout {
  height: 100vh;
}
</style>
