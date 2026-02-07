import { useRoute } from 'vue-router';
import { useCopy } from './copy';

export function useShareableUrl() {
  const route = useRoute();
  const { t } = useI18n();

  const shareableUrl = computed(() => {
    return `${window.location.origin}${route.fullPath}`;
  });

  const hasQueryParams = computed(() => {
    return Object.keys(route.query).length > 0;
  });

  const { copy } = useCopy({ text: t('share.copied', 'URL copied to clipboard') });

  async function copyShareUrl() {
    try {
      await copy(shareableUrl.value);
    }
    catch {
      // Fallback silently handled by useCopy
    }
  }

  return {
    shareableUrl,
    hasQueryParams,
    copyShareUrl,
  };
}
