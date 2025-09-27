<script setup lang="ts">
import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';
import { useStyleStore } from '@/stores/style.store';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import parser from 'cron-parser';

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const styleStore = useStyleStore();

const cron = ref('40 * * * *');
const command = ref('echo "hello"');
const enableLogging = ref(true);
const logPath = ref('/var/log/myjob');
const rotateDaily = ref(true);
const redirectStderr = ref(true);
const tz = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
const previewCount = ref(5);
const previews = ref<string[]>([]);
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const helpers = [
  {
    symbol: '*',
    meaning: 'Any value',
    example: '* * * *',
    equivalent: 'Every minute',
  },
  {
    symbol: '-',
    meaning: 'Range of values',
    example: '1-10 * * *',
    equivalent: 'Minutes 1 through 10',
  },
  {
    symbol: ',',
    meaning: 'List of values',
    example: '1,10 * * *',
    equivalent: 'At minutes 1 and 10',
  },
  {
    symbol: '/',
    meaning: 'Step values',
    example: '*/10 * * *',
    equivalent: 'Every 10 minutes',
  },
  {
    symbol: '@yearly',
    meaning: 'Once every year at midnight of 1 January',
    example: '@yearly',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@annually',
    meaning: 'Same as @yearly',
    example: '@annually',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@monthly',
    meaning: 'Once a month at midnight on the first day',
    example: '@monthly',
    equivalent: '0 0 1 * *',
  },
  {
    symbol: '@weekly',
    meaning: 'Once a week at midnight on Sunday morning',
    example: '@weekly',
    equivalent: '0 0 * * 0',
  },
  {
    symbol: '@daily',
    meaning: 'Once a day at midnight',
    example: '@daily',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@midnight',
    meaning: 'Same as @daily',
    example: '@midnight',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@hourly',
    meaning: 'Once an hour at the beginning of the hour',
    example: '@hourly',
    equivalent: '0 * * * *',
  },
  {
    symbol: '@reboot',
    meaning: 'Run at startup',
    example: '',
    equivalent: '',
  },
];

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    return cronstrue.toString(cron.value, cronstrueConfig);
  }
  return ' ';
});

const logFile = computed(() => `${logPath.value}${rotateDaily.value ? '_$(date +\\%F)' : ''}.log`);
const crontabLine = computed(() => {
  const baseCmd = (command.value || '').trim() || 'echo';
  const withLog = enableLogging.value ? `${baseCmd} >> ${logFile.value}${redirectStderr.value ? ' 2>&1' : ''}` : baseCmd;
  return `${cron.value} ${withLog}`;
});

watch([cron, tz, previewCount], () => {
  try {
    const options: any = { tz: tz.value };
    const interval = parser.parseExpression(cron.value, options);
    const list: string[] = [];
    for (let i = 0; i < Math.max(0, Math.min(previewCount.value, 20)); i++) list.push(interval.next().toString());
    previews.value = list;
  }
  catch {
    previews.value = [];
  }
});

const cronValidationRules = [
  {
    validator: (value: string) => isCronValid(value),
    message: 'This cron is invalid',
  },
];
</script>

<template>
  <c-card>
    <div mx-auto max-w-sm>
      <c-input-text
        v-model:value="cron"
        size="large"
        placeholder="* * * * *"
        :validation-rules="cronValidationRules"
        mb-3
      />
    </div>

    <div class="cron-string">
      {{ cronString }}
    </div>

    <div>
      <n-form :show-feedback="false" label-width="170" label-placement="left">
        <n-form-item label="Command" style="width: 100%">
          <c-input-text v-model:value="command" placeholder='your command, e.g. /usr/bin/backup' raw-text monospace class="w-full" />
        </n-form-item>
        <n-form-item label="Log to file">
          <n-switch v-model:value="enableLogging" />
        </n-form-item>
        <div v-if="enableLogging">
          <n-form-item label="Log base path" style="width: 100%">
            <c-input-text v-model:value="logPath" placeholder="/var/log/myjob" raw-text monospace class="w-full" />
          </n-form-item>
          <n-form-item label="Rotate daily (suffix by date)">
            <n-switch v-model:value="rotateDaily" />
          </n-form-item>
          <n-form-item label="Redirect stderr to same file">
            <n-switch v-model:value="redirectStderr" />
          </n-form-item>
        </div>
        <n-form-item label="Crontab line" style="width: 100%">
          <TextareaCopyable :value="crontabLine" language="bash" class="w-full" />
        </n-form-item>
        <n-form-item label="Timezone">
          <c-input-text v-model:value="tz" placeholder="e.g. Asia/Ho_Chi_Minh" class="w-full" />
        </n-form-item>
        <n-form-item label="Preview next runs">
          <n-input-number v-model:value="previewCount" :min="0" :max="20" />
        </n-form-item>
        <div v-if="previews.length">
          <div class="mb-1 opacity-80">Next runs ({{ tz }}):</div>
          <ul class="list-disc pl-4">
            <li v-for="p in previews" :key="p">{{ p }}</li>
          </ul>
        </div>
      </n-form>
    </div>

    <n-divider />

    <div flex justify-center>
      <n-form :show-feedback="false" label-width="170" label-placement="left">
        <n-form-item label="Verbose">
          <n-switch v-model:value="cronstrueConfig.verbose" />
        </n-form-item>
        <n-form-item label="Use 24 hour time format">
          <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
        </n-form-item>
        <n-form-item label="Days start at 0">
          <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
        </n-form-item>
      </n-form>
    </div>
  </c-card>
  <c-card>
    <pre>
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

    <div v-if="styleStore.isSmallScreen">
      <c-card v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol" mb-3 important:border-none>
        <div>
          Symbol: <strong>{{ symbol }}</strong>
        </div>
        <div>
          Meaning: <strong>{{ meaning }}</strong>
        </div>
        <div>
          Example:
          <strong><code>{{ example }}</code></strong>
        </div>
        <div>
          Equivalent: <strong>{{ equivalent }}</strong>
        </div>
      </c-card>
    </div>

    <c-table v-else :data="helpers" />
  </c-card>
</template>

<style lang="less" scoped>
::v-deep(input) {
  font-size: 30px;
  font-family: monospace;
  padding: 5px;
  text-align: center;
}

.cron-string {
  text-align: center;
  font-size: 22px;
  opacity: 0.8;
  margin: 5px 0 15px;
}

pre {
  overflow: auto;
  padding: 10px 0;
}
</style>
