<script setup lang="ts">
import { computed, ref } from 'vue';
import { stringify } from 'yaml';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { textToBase64 } from '@/utils/base64';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';

interface InspectData {
  [key: string]: any
}

interface RunResult {
  command: string
  warnings: string[]
}

interface ComposeResult {
  yaml: string
  warnings: string[]
}

const exampleInspect = `[
  {
    "Id": "8d8bfb67efcc39cc7d4a6e71a178f9dbb7a4a3f70f4bd9de649a24c81f499304",
    "Name": "/nginx",
    "Config": {
      "Hostname": "nginx",
      "Env": [
        "NGINX_HOST=localhost",
        "NGINX_PORT=80"
      ],
      "Image": "nginx:alpine",
      "Cmd": [
        "nginx",
        "-g",
        "daemon off;"
      ],
      "Labels": {
        "maintainer": "example"
      }
    },
    "HostConfig": {
      "PortBindings": {
        "80/tcp": [
          {
            "HostIp": "",
            "HostPort": "8080"
          }
        ]
      },
      "Binds": [
        "/var/log/nginx:/var/log/nginx:ro"
      ],
      "RestartPolicy": {
        "Name": "always",
        "MaximumRetryCount": 0
      },
      "NetworkMode": "bridge",
      "Privileged": false,
      "CapAdd": null,
      "CapDrop": null,
      "LogConfig": {
        "Type": "json-file",
        "Config": {
          "max-size": "10m",
          "max-file": "3"
        }
      }
    },
    "Mounts": [
      {
        "Type": "bind",
        "Source": "/var/log/nginx",
        "Destination": "/var/log/nginx",
        "Mode": "ro",
        "RW": false
      }
    ],
    "NetworkSettings": {
      "Networks": {
        "bridge": {
          "IPAddress": "172.17.0.2"
        }
      }
    }
  }
]`;

const inspectRaw = ref(exampleInspect);

const SAFE_SHELL_VALUE = /^[A-Za-z0-9_@%+=:,./-]*$/u;

function shellQuote(value: string): string {
  const str = value ?? '';
  if (str.length === 0) {
    return '\'\'';
  }
  if (SAFE_SHELL_VALUE.test(str)) {
    return str;
  }
  return JSON.stringify(str);
}

function cleanName(name?: string | null): string {
  if (typeof name !== 'string') {
    return '';
  }
  return name.replace(/^\/+/, '');
}

function formatPortBindingKey(key: string): string {
  if (key.includes('/')) {
    return key.split('/')[0];
  }
  return key;
}

function buildPortMappings(hostConfig: InspectData): string[] {
  const bindings = (hostConfig?.PortBindings ?? {}) as Record<string, unknown>;
  const results: string[] = [];

  for (const [containerPort, rawValue] of Object.entries(bindings)) {
    const entries = Array.isArray(rawValue) ? rawValue : [];
    for (const item of entries) {
      if (item && typeof item === 'object') {
        const entry = item as InspectData;
        const hostPort = typeof entry.HostPort === 'string' ? entry.HostPort : '';
        const rawHostIp = typeof entry.HostIp === 'string' ? entry.HostIp : '';
        const hostIp = rawHostIp && rawHostIp !== '0.0.0.0' ? `${rawHostIp}:` : '';
        const target = formatPortBindingKey(containerPort);
        if (hostPort) {
          results.push(`${hostIp}${hostPort}:${target}`);
        }
        else {
          results.push(target);
        }
      }
    }
  }

  return results;
}

function buildVolumeSpecs(container: InspectData): string[] {
  const specs = new Set<string>();
  const hostConfig = (container?.HostConfig ?? {}) as InspectData;
  const binds = hostConfig.Binds;

  if (Array.isArray(binds)) {
    for (const bind of binds) {
      if (typeof bind === 'string') {
        const trimmed = bind.trim();
        if (trimmed) {
          specs.add(trimmed);
        }
      }
    }
  }

  const mounts = Array.isArray(container?.Mounts) ? container.Mounts : [];
  for (const mountItem of mounts) {
    if (mountItem && typeof mountItem === 'object') {
      const mount = mountItem as InspectData;
      const destination = typeof mount.Destination === 'string' ? mount.Destination : '';
      const source = typeof mount.Source === 'string' ? mount.Source : '';
      if (destination && source) {
        const mode = typeof mount.Mode === 'string' ? mount.Mode : '';
        let suffix = '';
        if (mode && mode !== 'rw') {
          suffix = `:${mode}`;
        }
        const spec = `${source}:${destination}${suffix}`.replace(/:+$/u, '');
        specs.add(spec);
      }
    }
  }

  return Array.from(specs);
}

function buildEnvList(config: InspectData): string[] {
  const env = config?.Env;
  if (!Array.isArray(env)) {
    return [];
  }
  return env.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function buildLabelList(config: InspectData): string[] {
  const labels = config?.Labels;
  if (!labels || typeof labels !== 'object') {
    return [];
  }
  return Object.entries(labels as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([key, value]) => `${key}=${value}`);
}

function formatDurationFromNanoseconds(value?: number): string | undefined {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return undefined;
  }
  const seconds = value / 1e9;
  if (seconds >= 60 && Number.isInteger(seconds / 60)) {
    return `${seconds / 60}m`;
  }
  if (seconds >= 1) {
    return `${seconds}s`;
  }
  const milliseconds = value / 1e6;
  if (milliseconds >= 1) {
    return `${milliseconds}ms`;
  }
  return `${value}ns`;
}

function toDockerRun(container: InspectData): RunResult {
  const warnings: string[] = ['Assumed detached mode (-d); remove it if you need interactive mode.'];
  const config = (container?.Config ?? {}) as InspectData;
  const hostConfig = (container?.HostConfig ?? {}) as InspectData;
  const parts: string[] = ['docker run', '-d'];

  const name = cleanName(container?.Name ?? config?.Name);
  if (name) {
    parts.push(`--name ${shellQuote(name)}`);
  }

  const hostname = typeof config?.Hostname === 'string' ? config.Hostname : '';
  if (hostname && hostname !== name) {
    parts.push(`--hostname ${shellQuote(hostname)}`);
  }

  const workingDir = typeof config?.WorkingDir === 'string' ? config.WorkingDir : '';
  if (workingDir) {
    parts.push(`--workdir ${shellQuote(workingDir)}`);
  }

  const user = typeof config?.User === 'string' ? config.User : '';
  if (user) {
    parts.push(`--user ${shellQuote(user)}`);
  }

  const stopSignal = typeof config?.StopSignal === 'string' ? config.StopSignal : '';
  if (stopSignal) {
    parts.push(`--stop-signal ${shellQuote(stopSignal)}`);
  }

  if (hostConfig?.AutoRemove) {
    parts.push('--rm');
  }
  if (hostConfig?.ReadonlyRootfs) {
    parts.push('--read-only');
  }
  if (hostConfig?.Privileged) {
    parts.push('--privileged');
  }
  if (hostConfig?.Init) {
    parts.push('--init');
  }

  const portMappings = buildPortMappings(hostConfig);
  for (const mapping of portMappings) {
    parts.push(`-p ${mapping}`);
  }

  const envList = buildEnvList(config);
  for (const env of envList) {
    parts.push(`-e ${shellQuote(env)}`);
  }

  const labelList = buildLabelList(config);
  for (const label of labelList) {
    parts.push(`--label ${shellQuote(label)}`);
  }

  const capAdd = hostConfig?.CapAdd;
  if (Array.isArray(capAdd)) {
    for (const cap of capAdd) {
      if (typeof cap === 'string' && cap) {
        parts.push(`--cap-add ${shellQuote(cap)}`);
      }
    }
  }

  const capDrop = hostConfig?.CapDrop;
  if (Array.isArray(capDrop)) {
    for (const cap of capDrop) {
      if (typeof cap === 'string' && cap) {
        parts.push(`--cap-drop ${shellQuote(cap)}`);
      }
    }
  }

  const groupAdd = hostConfig?.GroupAdd;
  if (Array.isArray(groupAdd)) {
    for (const group of groupAdd) {
      if (typeof group === 'string' && group) {
        parts.push(`--group-add ${shellQuote(group)}`);
      }
    }
  }

  const securityOptions = hostConfig?.SecurityOpt;
  if (Array.isArray(securityOptions)) {
    for (const option of securityOptions) {
      if (typeof option === 'string' && option) {
        parts.push(`--security-opt ${shellQuote(option)}`);
      }
    }
  }

  const extraHosts = hostConfig?.ExtraHosts;
  if (Array.isArray(extraHosts)) {
    for (const host of extraHosts) {
      if (typeof host === 'string' && host) {
        parts.push(`--add-host ${shellQuote(host)}`);
      }
    }
  }

  const dnsServers = hostConfig?.Dns;
  if (Array.isArray(dnsServers)) {
    for (const dns of dnsServers) {
      if (typeof dns === 'string' && dns) {
        parts.push(`--dns ${shellQuote(dns)}`);
      }
    }
  }

  const dnsSearchDomains = hostConfig?.DnsSearch;
  if (Array.isArray(dnsSearchDomains)) {
    for (const domain of dnsSearchDomains) {
      if (typeof domain === 'string' && domain) {
        parts.push(`--dns-search ${shellQuote(domain)}`);
      }
    }
  }

  const devices = hostConfig?.Devices;
  if (Array.isArray(devices)) {
    for (const deviceItem of devices) {
      if (deviceItem && typeof deviceItem === 'object') {
        const device = deviceItem as InspectData;
        const hostPath = typeof device.PathOnHost === 'string' ? device.PathOnHost : '';
        const containerPath = typeof device.PathInContainer === 'string' ? device.PathInContainer : '';
        if (hostPath && containerPath) {
          const permissions = typeof device.CgroupPermissions === 'string' && device.CgroupPermissions
            ? `:${device.CgroupPermissions}`
            : '';
          parts.push(`--device ${shellQuote(`${hostPath}:${containerPath}${permissions}`)}`);
        }
      }
    }
  }

  const tmpfs = hostConfig?.Tmpfs;
  if (tmpfs && typeof tmpfs === 'object') {
    for (const [path, options] of Object.entries(tmpfs as Record<string, unknown>)) {
      if (typeof path === 'string') {
        const spec = typeof options === 'string' && options ? `${path}:${options}` : path;
        parts.push(`--tmpfs ${shellQuote(spec)}`);
      }
    }
  }

  const sysctls = hostConfig?.Sysctls;
  if (sysctls && typeof sysctls === 'object') {
    for (const [key, value] of Object.entries(sysctls as Record<string, unknown>)) {
      if (typeof value === 'string') {
        parts.push(`--sysctl ${shellQuote(`${key}=${value}`)}`);
      }
    }
  }

  const ulimits = hostConfig?.Ulimits;
  if (Array.isArray(ulimits)) {
    for (const limitItem of ulimits) {
      if (limitItem && typeof limitItem === 'object') {
        const limit = limitItem as InspectData;
        if (typeof limit.Name === 'string') {
          const soft = limit.Soft ?? '';
          const hard = limit.Hard ?? '';
          parts.push(`--ulimit ${shellQuote(`${limit.Name}=${soft}:${hard}`)}`);
        }
      }
    }
  }

  const restartPolicy = hostConfig?.RestartPolicy;
  if (restartPolicy && typeof restartPolicy === 'object') {
    const policyName = typeof restartPolicy.Name === 'string' ? restartPolicy.Name : '';
    if (policyName && policyName !== 'no') {
      const retries = typeof restartPolicy.MaximumRetryCount === 'number' ? restartPolicy.MaximumRetryCount : 0;
      const value = policyName === 'on-failure' && retries > 0 ? `${policyName}:${retries}` : policyName;
      parts.push(`--restart ${value}`);
    }
  }

  const networkMode = typeof hostConfig?.NetworkMode === 'string' ? hostConfig.NetworkMode : '';
  if (networkMode && networkMode !== 'default') {
    parts.push(`--network ${networkMode}`);
  }

  const logConfig = hostConfig?.LogConfig;
  if (logConfig && typeof logConfig === 'object') {
    const driver = typeof logConfig.Type === 'string' ? logConfig.Type : '';
    if (driver && driver !== 'json-file') {
      parts.push(`--log-driver ${shellQuote(driver)}`);
    }
    const logOptions = logConfig.Config;
    if (logOptions && typeof logOptions === 'object') {
      for (const [key, value] of Object.entries(logOptions as Record<string, unknown>)) {
        if (typeof value === 'string') {
          parts.push(`--log-opt ${shellQuote(`${key}=${value}`)}`);
        }
      }
    }
  }

  const deviceCgroupRules = hostConfig?.DeviceCgroupRules;
  if (Array.isArray(deviceCgroupRules) && deviceCgroupRules.length > 0) {
    warnings.push('Device cgroup rules are not translated; please review them manually.');
  }

  const volumes = buildVolumeSpecs(container);
  for (const volume of volumes) {
    parts.push(`-v ${shellQuote(volume)}`);
  }

  const entrypoint = config?.Entrypoint;
  if (Array.isArray(entrypoint)) {
    const entryArgs = entrypoint.filter((item): item is string => typeof item === 'string');
    if (entryArgs.length > 0) {
      parts.push(`--entrypoint ${shellQuote(entryArgs.join(' '))}`);
    }
  }
  else if (typeof entrypoint === 'string' && entrypoint) {
    parts.push(`--entrypoint ${shellQuote(entrypoint)}`);
  }

  const image = typeof config?.Image === 'string' ? config.Image : '';
  if (image) {
    parts.push(shellQuote(image));
  }
  else {
    warnings.push('Image name missing from inspect JSON; please add it manually.');
  }

  const cmd = config?.Cmd;
  if (Array.isArray(cmd)) {
    for (const arg of cmd) {
      parts.push(shellQuote(String(arg)));
    }
  }
  else if (typeof cmd === 'string' && cmd) {
    parts.push(cmd);
  }

  return {
    command: parts.join(' '),
    warnings,
  };
}

function buildCompose(container: InspectData): ComposeResult {
  const warnings: string[] = [];
  const config = (container?.Config ?? {}) as InspectData;
  const hostConfig = (container?.HostConfig ?? {}) as InspectData;
  const networks = (container?.NetworkSettings?.Networks ?? {}) as Record<string, InspectData>;

  const serviceName = cleanName(container?.Name ?? config?.Hostname) || 'service';
  const service: InspectData = {};

  const image = typeof config?.Image === 'string' ? config.Image : '';
  if (image) {
    service.image = image;
  }
  else {
    warnings.push('Image name missing from inspect JSON; please add it manually.');
  }

  const containerName = cleanName(container?.Name);
  if (containerName) {
    service.container_name = containerName;
  }

  const hostname = typeof config?.Hostname === 'string' ? config.Hostname : '';
  if (hostname) {
    service.hostname = hostname;
  }

  const workingDir = typeof config?.WorkingDir === 'string' ? config.WorkingDir : '';
  if (workingDir) {
    service.working_dir = workingDir;
  }

  const user = typeof config?.User === 'string' ? config.User : '';
  if (user) {
    service.user = user;
  }

  const stopSignal = typeof config?.StopSignal === 'string' ? config.StopSignal : '';
  if (stopSignal) {
    service.stop_signal = stopSignal;
  }

  if (hostConfig?.AutoRemove) {
    service.restart = 'no';
  }

  const portMappings = buildPortMappings(hostConfig);
  if (portMappings.length > 0) {
    service.ports = portMappings;
  }

  const envList = buildEnvList(config);
  if (envList.length > 0) {
    const envAsObject: Record<string, string> = {};
    let canUseObject = true;
    for (const env of envList) {
      const separatorIndex = env.indexOf('=');
      if (separatorIndex === -1) {
        canUseObject = false;
        break;
      }
      const key = env.slice(0, separatorIndex);
      const value = env.slice(separatorIndex + 1);
      envAsObject[key] = value;
    }
    service.environment = canUseObject ? envAsObject : envList;
  }

  const labels = config?.Labels;
  if (labels && typeof labels === 'object') {
    const entries = Object.entries(labels as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
    if (entries.length > 0) {
      service.labels = Object.fromEntries(entries);
    }
  }

  const volumes = buildVolumeSpecs(container);
  if (volumes.length > 0) {
    service.volumes = volumes;
  }

  const capAdd = hostConfig?.CapAdd;
  if (Array.isArray(capAdd) && capAdd.length > 0) {
    service.cap_add = capAdd;
  }

  const capDrop = hostConfig?.CapDrop;
  if (Array.isArray(capDrop) && capDrop.length > 0) {
    service.cap_drop = capDrop;
  }

  const groupAdd = hostConfig?.GroupAdd;
  if (Array.isArray(groupAdd) && groupAdd.length > 0) {
    service.group_add = groupAdd;
  }

  if (hostConfig?.Privileged) {
    service.privileged = true;
  }

  if (hostConfig?.ReadonlyRootfs) {
    service.read_only = true;
  }

  if (hostConfig?.Init) {
    service.init = true;
  }

  const extraHosts = hostConfig?.ExtraHosts;
  if (Array.isArray(extraHosts) && extraHosts.length > 0) {
    service.extra_hosts = extraHosts;
  }

  const dnsServers = hostConfig?.Dns;
  if (Array.isArray(dnsServers) && dnsServers.length > 0) {
    service.dns = dnsServers;
  }

  const dnsSearchDomains = hostConfig?.DnsSearch;
  if (Array.isArray(dnsSearchDomains) && dnsSearchDomains.length > 0) {
    service.dns_search = dnsSearchDomains;
  }

  const tmpfs = hostConfig?.Tmpfs;
  if (tmpfs && typeof tmpfs === 'object') {
    const items = Object.entries(tmpfs as Record<string, unknown>)
      .map(([path, options]) => (typeof options === 'string' && options ? `${path}:${options}` : path));
    if (items.length > 0) {
      service.tmpfs = items;
    }
  }

  const sysctls = hostConfig?.Sysctls;
  if (sysctls && typeof sysctls === 'object' && Object.keys(sysctls).length > 0) {
    service.sysctls = sysctls;
  }

  const securityOptions = hostConfig?.SecurityOpt;
  if (Array.isArray(securityOptions) && securityOptions.length > 0) {
    service.security_opt = securityOptions;
  }

  const devices = hostConfig?.Devices;
  if (Array.isArray(devices)) {
    const mapped = devices
      .filter(item => item && typeof item === 'object')
      .map((item) => {
        const device = item as InspectData;
        const hostPath = typeof device.PathOnHost === 'string' ? device.PathOnHost : '';
        const containerPath = typeof device.PathInContainer === 'string' ? device.PathInContainer : '';
        if (!hostPath || !containerPath) {
          return '';
        }
        const permissions = typeof device.CgroupPermissions === 'string' && device.CgroupPermissions
          ? `:${device.CgroupPermissions}`
          : '';
        return `${hostPath}:${containerPath}${permissions}`;
      })
      .filter((value): value is string => Boolean(value));
    if (mapped.length > 0) {
      service.devices = mapped;
    }
  }

  const ulimits = hostConfig?.Ulimits;
  if (Array.isArray(ulimits) && ulimits.length > 0) {
    const result: Record<string, InspectData> = {};
    for (const limitItem of ulimits) {
      if (limitItem && typeof limitItem === 'object') {
        const limit = limitItem as InspectData;
        if (typeof limit.Name === 'string') {
          result[limit.Name] = {
            soft: limit.Soft,
            hard: limit.Hard,
          };
        }
      }
    }
    if (Object.keys(result).length > 0) {
      service.ulimits = result;
    }
  }

  const restartPolicy = hostConfig?.RestartPolicy;
  if (restartPolicy && typeof restartPolicy === 'object') {
    const policyName = typeof restartPolicy.Name === 'string' ? restartPolicy.Name : '';
    if (policyName && policyName !== 'no') {
      const retries = typeof restartPolicy.MaximumRetryCount === 'number' ? restartPolicy.MaximumRetryCount : 0;
      service.restart = policyName === 'on-failure' && retries > 0 ? `${policyName}:${retries}` : policyName;
    }
  }

  const networkMode = typeof hostConfig?.NetworkMode === 'string' ? hostConfig.NetworkMode : '';
  if (networkMode && networkMode !== 'default') {
    if (networkMode.startsWith('container:')) {
      warnings.push(`Network mode ${networkMode} is not directly supported in docker-compose; please adjust manually.`);
    }
    else {
      service.network_mode = networkMode;
    }
  }

  const logConfig = hostConfig?.LogConfig;
  if (logConfig && typeof logConfig === 'object') {
    const driver = typeof logConfig.Type === 'string' ? logConfig.Type : '';
    const logOptions = logConfig.Config && typeof logConfig.Config === 'object' ? logConfig.Config : {};
    if ((driver && driver !== 'json-file') || Object.keys(logOptions as InspectData).length > 0) {
      service.logging = {
        driver: driver || 'json-file',
        options: logOptions,
      };
    }
  }

  const entrypoint = config?.Entrypoint;
  if (Array.isArray(entrypoint) && entrypoint.length > 0) {
    service.entrypoint = entrypoint;
  }
  else if (typeof entrypoint === 'string' && entrypoint) {
    service.entrypoint = entrypoint;
  }

  const cmd = config?.Cmd;
  if (Array.isArray(cmd) && cmd.length > 0) {
    service.command = cmd;
  }
  else if (typeof cmd === 'string' && cmd) {
    service.command = cmd;
  }

  if (config?.ExposedPorts && typeof config.ExposedPorts === 'object') {
    const expose = Object.keys(config.ExposedPorts).map(port => formatPortBindingKey(port));
    if (expose.length > 0) {
      service.expose = expose;
    }
  }

  if (config?.Healthcheck && typeof config.Healthcheck === 'object') {
    const healthcheck: InspectData = {};
    const test = config.Healthcheck.Test;
    if (Array.isArray(test) && test.length > 0) {
      healthcheck.test = test;
    }
    const interval = formatDurationFromNanoseconds(config.Healthcheck.Interval);
    if (interval) {
      healthcheck.interval = interval;
    }
    const timeout = formatDurationFromNanoseconds(config.Healthcheck.Timeout);
    if (timeout) {
      healthcheck.timeout = timeout;
    }
    const startPeriod = formatDurationFromNanoseconds(config.Healthcheck.StartPeriod);
    if (startPeriod) {
      healthcheck.start_period = startPeriod;
    }
    if (typeof config.Healthcheck.Retries === 'number') {
      healthcheck.retries = config.Healthcheck.Retries;
    }
    if (Object.keys(healthcheck).length > 0) {
      service.healthcheck = healthcheck;
    }
  }

  if (typeof hostConfig?.ShmSize === 'number' && hostConfig.ShmSize > 0) {
    const sizeMb = Math.round(hostConfig.ShmSize / (1024 * 1024));
    service.shm_size = `${sizeMb}M`;
  }

  if (Array.isArray(config?.Cmd) && config.Cmd.length === 0 && Array.isArray(config?.Entrypoint)) {
    warnings.push('Entrypoint is set without a command; verify command arguments.');
  }

  const networkNames = Object.keys(networks);
  const customNetworks = networkNames.filter(name => name && name !== 'bridge' && name !== 'default');
  const networkDefinitions: Record<string, InspectData> = {};
  if (customNetworks.length > 0) {
    const serviceNetworks: Record<string, InspectData> = {};
    for (const network of customNetworks) {
      const info = networks[network];
      if (info && typeof info === 'object' && Array.isArray(info.Aliases) && info.Aliases.length > 0) {
        serviceNetworks[network] = { aliases: info.Aliases };
      }
      else {
        serviceNetworks[network] = {};
      }
      networkDefinitions[network] = { external: true };
    }
    service.networks = serviceNetworks;
  }

  const mounts = Array.isArray(container?.Mounts) ? container.Mounts : [];
  const volumeDefinitions: Record<string, InspectData> = {};
  for (const mountItem of mounts) {
    if (mountItem && typeof mountItem === 'object') {
      const mount = mountItem as InspectData;
      if (mount.Type === 'volume') {
        const volumeName = typeof mount.Name === 'string' ? mount.Name : typeof mount.Source === 'string' ? mount.Source : '';
        if (volumeName) {
          volumeDefinitions[volumeName] = { external: true };
        }
      }
    }
  }

  const compose: InspectData = {
    version: '3.9',
    services: {
      [serviceName]: service,
    },
  };

  if (Object.keys(networkDefinitions).length > 0) {
    compose.networks = networkDefinitions;
  }

  if (Object.keys(volumeDefinitions).length > 0) {
    compose.volumes = volumeDefinitions;
  }

  return {
    yaml: stringify(compose, { lineWidth: 120 }),
    warnings,
  };
}

function parseInspect(raw: string): { container: InspectData | null; errors: string[]; warnings: string[] } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { container: null, errors: [], warnings: [] };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    if (items.length === 0) {
      return { container: null, errors: ['Parsed JSON is empty.'], warnings: [] };
    }
    const first = items[0];
    const warnings: string[] = [];
    if (Array.isArray(parsed) && parsed.length > 1) {
      warnings.push('Detected multiple inspect entries; using the first one.');
    }
    if (!first || typeof first !== 'object') {
      return { container: null, errors: ['Input does not look like docker inspect JSON.'], warnings };
    }
    return { container: first as InspectData, errors: [], warnings };
  }
  catch (error) {
    return {
      container: null,
      errors: [`Failed to parse JSON: ${(error as Error).message}`],
      warnings: [],
    };
  }
}

const parseState = computed(() => parseInspect(inspectRaw.value));
const container = computed(() => parseState.value.container);
const parseErrors = computed(() => parseState.value.errors);
const parseWarnings = computed(() => parseState.value.warnings);

const dockerRunResult = computed<RunResult>(() => {
  if (!container.value) {
    return { command: '', warnings: [] };
  }
  return toDockerRun(container.value);
});

const dockerComposeResult = computed<ComposeResult>(() => {
  if (!container.value) {
    return { yaml: '', warnings: [] };
  }
  return buildCompose(container.value);
});

const warnings = computed(() => {
  const combined = [...parseWarnings.value, ...dockerRunResult.value.warnings, ...dockerComposeResult.value.warnings];
  return Array.from(new Set(combined.filter(Boolean)));
});

const composeDownloadUrl = computed(() => {
  if (!dockerComposeResult.value.yaml) {
    return '';
  }
  return `data:application/yaml;base64,${textToBase64(dockerComposeResult.value.yaml)}`;
});

const { download: downloadCompose } = useDownloadFileFromBase64({
  source: composeDownloadUrl,
  filename: 'docker-compose.generated.yml',
});
</script>

<template>
  <div>
    <n-form-item label="docker inspect JSON" style="width: 100%">
      <c-input-text v-model:value="inspectRaw" rows="16" raw-text multiline monospace class="w-full" />
    </n-form-item>

    <n-alert v-if="parseErrors.length > 0" type="error" title="Unable to parse input" mb-4>
      <ul>
        <li v-for="(message, index) in parseErrors" :key="index">
          {{ message }}
        </li>
      </ul>
    </n-alert>

    <n-alert v-if="warnings.length > 0" type="info" title="Review required" mb-4>
      <ul>
        <li v-for="(message, index) in warnings" :key="index">
          {{ message }}
        </li>
      </ul>
    </n-alert>

    <n-divider>docker run</n-divider>
    <TextareaCopyable :value="dockerRunResult.command" language="bash" />

    <n-divider>docker-compose.yml</n-divider>
    <TextareaCopyable :value="dockerComposeResult.yaml" language="yaml" />

    <div mt-5 flex justify-center>
      <c-button :disabled="dockerComposeResult.yaml === ''" secondary @click="downloadCompose">
        Download docker-compose.yml
      </c-button>
    </div>
  </div>
</template>
