<script setup lang="ts">
import { createPassword } from './password-generator.service';
import { useCopy } from '@/composable/copy';
import { useQueryParam } from '@/composable/queryParams';
import { computedRefreshable } from '@/composable/computedRefreshable';

const length = useQueryParam({ name: 'length', defaultValue: 16 });
const withUppercase = useQueryParam({ name: 'uppercase', defaultValue: true });
const withLowercase = useQueryParam({ name: 'lowercase', defaultValue: true });
const withNumbers = useQueryParam({ name: 'numbers', defaultValue: true });
const withSymbols = useQueryParam({ name: 'symbols', defaultValue: true });
const excludeAmbiguous = useQueryParam({ name: 'excludeAmbiguous', defaultValue: true });
const ensureEachSelected = useQueryParam({ name: 'ensureEach', defaultValue: true });
const { t } = useI18n();

const [password, refreshPwd] = computedRefreshable(() =>
  createPassword({
    length: length.value,
    withUppercase: withUppercase.value,
    withLowercase: withLowercase.value,
    withNumbers: withNumbers.value,
    withSymbols: withSymbols.value,
    excludeAmbiguous: excludeAmbiguous.value,
    ensureEachSelected: ensureEachSelected.value,
  }),
);

const { copy } = useCopy({ source: password, text: t('tools.password-generator.copied') });
</script>

<template>
  <div>
    <c-card>
      <n-form label-placement="left" label-width="220">
        <div flex justify-center>
          <div>
            <n-form-item :label="t('tools.password-generator.uppercase')">
              <n-switch v-model:value="withUppercase" />
            </n-form-item>

            <n-form-item :label="t('tools.password-generator.lowercase')">
              <n-switch v-model:value="withLowercase" />
            </n-form-item>

            <n-form-item :label="t('tools.password-generator.numbers')">
              <n-switch v-model:value="withNumbers" />
            </n-form-item>
          </div>

          <div>
            <n-form-item :label="t('tools.password-generator.symbols')">
              <n-switch v-model:value="withSymbols" />
            </n-form-item>

            <n-form-item :label="t('tools.password-generator.excludeAmbiguous')">
              <n-switch v-model:value="excludeAmbiguous" />
            </n-form-item>

            <n-form-item :label="t('tools.password-generator.ensureEach')">
              <n-switch v-model:value="ensureEachSelected" />
            </n-form-item>
          </div>
        </div>
      </n-form>

      <n-form-item :label="`${t('tools.password-generator.length')} (${length})`" label-placement="left">
        <n-slider v-model:value="length" :step="1" :min="6" :max="128" />
      </n-form-item>

      <c-input-text
        v-model:value="password"
        :placeholder="t('tools.password-generator.placeholder')"
        type="password"
        readonly
      />

      <div mt-5 flex justify-center gap-3>
        <c-button @click="copy()">
          {{ t('tools.password-generator.button.copy') }}
        </c-button>
        <c-button @click="refreshPwd">
          {{ t('tools.password-generator.button.refresh') }}
        </c-button>
      </div>
    </c-card>
  </div>
  
</template>


