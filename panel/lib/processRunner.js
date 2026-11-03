import { spawn } from 'node:child_process';

/**
 * Fabryka menedżera procesów zewnętrznych (serwer podglądu Astro oraz deploy do Cloudflare).
 * @param {Object} config - Konfiguracja ze ścieżką projektu
 */
export const createProcessRunner = (config) => {
  const rootDir = config.rootDir;
  let devProcess = null;
  const devLogs = [];
  const maxDevLogs = 200;

  const appendDevLog = (log) => {
    devLogs.push(log);
    if (devLogs.length > maxDevLogs) {
      devLogs.shift();
    }
  };

  /**
   * Zwraca aktualny status serwera podglądu.
   */
  const getDevStatus = () => {
    const isRunning = devProcess !== null && !devProcess.killed;
    return Object.freeze({
      isRunning,
      url: 'http://localhost:4321',
      logs: Object.freeze([...devLogs])
    });
  };

  /**
   * Uruchamia serwer developerski Astro w tle.
   */
  const startDevServer = () => {
    if (devProcess !== null && !devProcess.killed) {
      return Object.freeze({ sukces: true, komunikat: 'Serwer podglądu już działa', url: 'http://localhost:4321' });
    }

    devLogs.length = 0;
    appendDevLog(`[${new Date().toLocaleTimeString()}] Uruchamianie serwera podglądu Astro...`);

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    devProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: rootDir,
      env: { ...process.env, FORCE_COLOR: 'true' },
      shell: true
    });

    devProcess.stdout.on('data', (data) => {
      const text = data.toString();
      appendDevLog(text);
    });

    devProcess.stderr.on('data', (data) => {
      const text = data.toString();
      appendDevLog(`[ERR] ${text}`);
    });

    devProcess.on('close', (code) => {
      appendDevLog(`[${new Date().toLocaleTimeString()}] Serwer podglądu zatrzymany (kod wyjścia: ${code})`);
      devProcess = null;
    });

    devProcess.on('error', (err) => {
      appendDevLog(`[BŁĄD] ${err.message}`);
      devProcess = null;
    });

    return Object.freeze({ sukces: true, komunikat: 'Serwer podglądu został uruchomiony', url: 'http://localhost:4321' });
  };

  /**
   * Zatrzymuje serwer developerski.
   */
  const stopDevServer = () => {
    if (!devProcess || devProcess.killed) {
      return Object.freeze({ sukces: true, komunikat: 'Serwer podglądu nie jest uruchomiony' });
    }

    try {
      if (process.platform === 'win32' && devProcess.pid) {
        // Na Windows zatrzymujemy całe drzewo procesów
        spawn('taskkill', ['/pid', String(devProcess.pid), '/f', '/t']);
      } else {
        devProcess.kill('SIGTERM');
      }
      devProcess = null;
      appendDevLog(`[${new Date().toLocaleTimeString()}] Zatrzymano serwer developerski.`);
      return Object.freeze({ sukces: true, komunikat: 'Zatrzymano serwer podglądu' });
    } catch (err) {
      return Object.freeze({ sukces: false, komunikat: err.message });
    }
  };

  /**
   * Uruchamia proces wdrożenia na Cloudflare (npm run deploy).
   */
  const runDeploy = () => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const outputLogs = [];

      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      outputLogs.push(`=== Rozpoczęto publikację na Cloudflare: ${new Date().toLocaleString()} ===`);
      outputLogs.push(`Katalog roboczy: ${rootDir}`);
      outputLogs.push(`Polecenie: npm run deploy\n`);

      const deployProc = spawn(npmCmd, ['run', 'deploy'], {
        cwd: rootDir,
        env: { ...process.env, FORCE_COLOR: 'false' },
        shell: true
      });

      deployProc.stdout.on('data', (chunk) => {
        outputLogs.push(chunk.toString());
      });

      deployProc.stderr.on('data', (chunk) => {
        outputLogs.push(`[stderr] ${chunk.toString()}`);
      });

      deployProc.on('close', (code) => {
        const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
        const isSuccess = code === 0;

        outputLogs.push(`\n=== Wdrożenie zakończone w ${durationSec}s z kodem: ${code} ===`);

        resolve(Object.freeze({
          sukces: isSuccess,
          kodWyjscia: code,
          czasTrwaniaSekund: durationSec,
          logi: outputLogs.join('')
        }));
      });

      deployProc.on('error', (err) => {
        outputLogs.push(`\n[BŁĄD KRYTYCZNY]: ${err.message}`);
        resolve(Object.freeze({
          sukces: false,
          kodWyjscia: -1,
          czasTrwaniaSekund: '0',
          logi: outputLogs.join('')
        }));
      });
    });
  };

  return Object.freeze({
    getDevStatus,
    startDevServer,
    stopDevServer,
    runDeploy
  });
};

