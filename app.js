document.addEventListener('DOMContentLoaded', () => {
  // --- Brand Branding & Smooth Scroll Verification ---
  // The BuildIoT BD.png logo is loaded inside a high-contrast container.
  // Smooth scroll links are natively processed via CSS.
  
  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openDrawer() {
    mobileDrawer.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeDrawer() {
    mobileDrawer.classList.add('translate-x-full');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn && mobileDrawer && mobileDrawerClose) {
    mobileMenuBtn.addEventListener('click', openDrawer);
    mobileDrawerClose.addEventListener('click', closeDrawer);
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // --- Tech Stack Matrix Tabs ---
  const tabButtons = document.querySelectorAll('.stack-tab-btn');
  const tabPanes = document.querySelectorAll('.stack-tab-pane');

  if (tabButtons.length > 0 && tabPanes.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Update button active state
        tabButtons.forEach(btn => {
          btn.classList.remove('border-blue-600', 'text-white', 'bg-blue-600', 'shadow-sm');
          btn.classList.add('border-transparent', 'bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
        });
        button.classList.remove('border-transparent', 'bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
        button.classList.add('border-blue-600', 'text-white', 'bg-blue-600', 'shadow-sm');

        // Update visible tab content with a neat transition
        tabPanes.forEach(pane => {
          if (pane.id === targetTab) {
            pane.classList.remove('hidden');
            pane.classList.add('grid', 'opacity-0');
            // Allow DOM paint for transition
            setTimeout(() => {
              pane.classList.remove('opacity-0');
              pane.classList.add('opacity-100');
            }, 10);
          } else {
            pane.classList.add('hidden');
            pane.classList.remove('grid', 'opacity-100');
          }
        });
      });
    });
  }

  // --- Live Hardware Monitor Matrix Simulation ---
  const mcuFreqVal = document.getElementById('mon-mcu-freq');
  const currentDrawVal = document.getElementById('mon-current');
  const freeRtosStateVal = document.getElementById('mon-rtos-state');
  const telemetryTxVal = document.getElementById('mon-telemetry');
  const registerGrid = document.getElementById('mon-register-grid');
  const terminalLog = document.getElementById('mon-terminal-log');

  // Initial registers data
  const registerAddresses = [
    '0x3FF44004', '0x3FF44008', '0x3FF4401C', '0x3FF44020',
    '0x3FF44038', '0x3FF4403C', '0x40001000', '0x40001004'
  ];

  // Logs queue
  const logsList = [
    { type: 'ok', msg: 'RTOS scheduler initialized successfully.' },
    { type: 'ok', msg: 'ESP32 dual-core boot stage 2 complete. Core 0 @ 240MHz.' },
    { type: 'info', msg: 'MQTT connection requested: broker.buildiotlabs.com:1883' },
    { type: 'ok', msg: 'MQTT TCP handshake established.' },
    { type: 'warn', msg: 'Low battery threshold warning: V_cell = 3.65V' },
    { type: 'info', msg: 'Power management mode set to LIGHT_SLEEP.' },
    { type: 'ok', msg: 'Waking on external RTC GPIO_NUM_12 interrupt.' },
    { type: 'info', msg: 'Publishing telemetry payload: {"v":3.65,"t":24.5,"p":1012.3}' },
    { type: 'ok', msg: 'MQTT publication ACK received. QoS 1.' },
    { type: 'info', msg: 'Deep Sleep timer scheduled: 120s interval.' },
    { type: 'ok', msg: 'Entering DEEP_SLEEP mode. Micro-amp monitor active.' },
    { type: 'info', msg: 'ADC calibration coefficients loaded from eFuse.' },
    { type: 'warn', msg: 'Wi-Fi RSSI dropped below -75dBm, switching to fallback antenna.' },
    { type: 'ok', msg: 'I2C Bus Scan: found 0x3C (OLED) and 0x76 (BME280).' },
    { type: 'ok', msg: 'DMA channel 0 mapped to SPI flash. Bandwidth optimized.' }
  ];

  let logIndex = 0;
  let packetsSent = 158402;
  let activeState = 'RUNNING'; // RUNNING, SLEEPING, WAKING

  // Populate dynamic register grid initially
  if (registerGrid) {
    registerGrid.innerHTML = '';
    registerAddresses.forEach(addr => {
      const regVal = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
      const regEl = document.createElement('div');
      regEl.className = 'flex justify-between border-b border-zinc-900/60 pb-1 text-xs font-mono';
      regEl.innerHTML = `
        <span class="text-zinc-500">${addr}</span>
        <span class="text-red-500 font-medium tracking-wider" id="reg-${addr}">0x0000${regVal}</span>
      `;
      registerGrid.appendChild(regEl);
    });
  }

  // Helper to add log line
  function appendLog(text, type = 'info') {
    if (!terminalLog) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${(now.getMilliseconds()/10).toFixed(0).padStart(2, '0')}`;
    
    let colorClass = 'text-zinc-400';
    let prefix = '[INFO]';
    if (type === 'ok') {
      colorClass = 'terminal-green';
      prefix = '[ OK ]';
    } else if (type === 'warn') {
      colorClass = 'terminal-amber';
      prefix = '[WARN]';
    }

    const logLine = document.createElement('div');
    logLine.className = `leading-relaxed ${colorClass}`;
    logLine.innerHTML = `<span class="text-zinc-600 font-semibold">${timeStr}</span> ${prefix} ${text}`;
    
    terminalLog.appendChild(logLine);
    // Auto-scroll to bottom
    terminalLog.scrollTop = terminalLog.scrollHeight;

    // Keep log clean, remove old lines if limit exceeded
    while (terminalLog.children.length > 25) {
      terminalLog.removeChild(terminalLog.firstChild);
    }
  }

  // Initial seed logs
  for (let i = 0; i < 5; i++) {
    const item = logsList[Math.floor(Math.random() * logsList.length)];
    appendLog(item.msg, item.type);
  }

  // Update simulator loop
  function updateHardwareMonitor() {
    // 1. Cycle state machine occasionally
    const randState = Math.random();
    if (randState < 0.05 && activeState !== 'SLEEPING') {
      // Transition to deep sleep
      activeState = 'SLEEPING';
      appendLog('Entering ultra-low power state (DEEP_SLEEP). All RF rails powered down.', 'warn');
      if (mcuFreqVal) mcuFreqVal.textContent = '10 kHz (RTC)';
      if (currentDrawVal) {
        currentDrawVal.textContent = '14.8 µA';
        currentDrawVal.className = 'text-green-400 terminal-green font-medium font-technical';
      }
      if (freeRtosStateVal) freeRtosStateVal.textContent = 'SLEEPING';
    } else if (randState < 0.15 && activeState === 'SLEEPING') {
      // Wake up from sleep
      activeState = 'WAKING';
      appendLog('Deep Sleep Wakeup detected: RTC Timer alarm triggered.', 'ok');
      appendLog('Enabling VDD_SDIO LDO regulator. Clock source stabilized.', 'info');
      
      setTimeout(() => {
        activeState = 'RUNNING';
        appendLog('Cores clocked at 240MHz. Restoring FreeRTOS tasks stack context.', 'ok');
        if (mcuFreqVal) mcuFreqVal.textContent = '240 MHz';
        if (currentDrawVal) {
          currentDrawVal.textContent = '48.3 mA';
          currentDrawVal.className = 'text-red-500 font-medium font-technical';
        }
        if (freeRtosStateVal) freeRtosStateVal.textContent = 'SCHED_RUN';
      }, 800);
    }

    // 2. Perform actions based on running state
    if (activeState === 'RUNNING') {
      // Fluctuating current
      if (currentDrawVal) {
        const baseCurrent = Math.random() > 0.8 ? 84.6 : 42.1; // TX spikes
        const fuzz = (Math.random() * 4 - 2).toFixed(1);
        currentDrawVal.textContent = `${(parseFloat(baseCurrent) + parseFloat(fuzz)).toFixed(1)} mA`;
        currentDrawVal.className = baseCurrent > 70 ? 'text-red-400 terminal-crimson font-medium font-technical' : 'text-red-500 font-medium font-technical';
        
        if (baseCurrent > 70) {
          appendLog(`Transmitting telemetry payload. TX burst: ${(parseFloat(baseCurrent) + parseFloat(fuzz)).toFixed(1)} mA`, 'info');
        }
      }

      // Fluctuating frequency slightly (dynamic throttling)
      if (mcuFreqVal && Math.random() > 0.95) {
        const downclock = Math.random() > 0.5;
        mcuFreqVal.textContent = downclock ? '160 MHz' : '240 MHz';
        appendLog(`Dynamic frequency scaling: adjusted clock to ${downclock ? '160 MHz' : '240 MHz'}.`, 'info');
      }

      // Add a dynamic log occasionally
      if (Math.random() > 0.85) {
        const item = logsList[logIndex % logsList.length];
        logIndex++;
        appendLog(item.msg, item.type);
      }

      // Update telemetry count
      if (telemetryTxVal && Math.random() > 0.4) {
        packetsSent += Math.floor(Math.random() * 3) + 1;
        telemetryTxVal.textContent = `${packetsSent.toLocaleString()} TX`;
      }
    } else if (activeState === 'SLEEPING') {
      // Idle sleep current
      if (currentDrawVal) {
        const fuzz = (Math.random() * 0.4 - 0.2).toFixed(2);
        currentDrawVal.textContent = `${(14.8 + parseFloat(fuzz)).toFixed(2)} µA`;
      }
    }

    // 3. Mutate random register in grid
    if (registerGrid && Math.random() > 0.5) {
      const targetAddr = registerAddresses[Math.floor(Math.random() * registerAddresses.length)];
      const targetEl = document.getElementById(`reg-${targetAddr}`);
      if (targetEl) {
        const regVal = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        targetEl.textContent = `0x0000${regVal}`;
        targetEl.classList.add('text-white', 'font-bold');
        setTimeout(() => {
          targetEl.classList.remove('text-white', 'font-bold');
        }, 150);
      }
    }
  }

  // Spin up interval loop (runs every 1.5 seconds)
  setInterval(updateHardwareMonitor, 1500);

  // --- Lead Capture / Contact Portal Form ---
  const briefingForm = document.getElementById('briefing-form');
  const formFeedback = document.getElementById('form-feedback');
  const formSubmitBtn = document.getElementById('form-submit-btn');

  if (briefingForm && formFeedback && formSubmitBtn) {
    briefingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect data
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const designation = document.getElementById('form-designation').value.trim();
      const desc = document.getElementById('form-desc').value.trim();

      if (!name || !email || !designation || !desc) {
        alert('Please fill out all fields.');
        return;
      }

      // UI state progression
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Initializing Briefing...
      `;

      formFeedback.classList.remove('hidden');
      formFeedback.innerHTML = `
        <div class="font-mono text-xs border border-blue-200 bg-blue-50/30 p-3 rounded-lg space-y-1">
          <div class="text-slate-500">> Initiating transmission tunnel...</div>
        </div>
      `;

      const formData = new FormData(briefingForm);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        console.log("Web3Forms Response:", data);

        if (response.ok && data.success) {
          // Simulate cryptographic commitment steps for premium engineering feel
          await new Promise((resolve) => {
            setTimeout(() => {
              const step1 = document.createElement('div');
              step1.className = 'text-slate-500';
              step1.textContent = '> Generating firmware briefing metadata keys...';
              const target = formFeedback.firstElementChild;
              if (target) target.appendChild(step1);
            }, 300);

            setTimeout(() => {
              const step2 = document.createElement('div');
              step2.className = 'terminal-amber';
              step2.textContent = '> Encrypting briefing payload (ECC SECP256R1)...';
              const target = formFeedback.firstElementChild;
              if (target) target.appendChild(step2);
            }, 700);

            setTimeout(() => {
              const step3 = document.createElement('div');
              step3.className = 'terminal-green';
              step3.textContent = '> Transmission success! Data packets committed.';
              const target = formFeedback.firstElementChild;
              if (target) target.appendChild(step3);
            }, 1100);

            setTimeout(() => {
              formFeedback.innerHTML = `
                <div class="border border-emerald-200 bg-emerald-50/50 p-6 rounded-xl text-center space-y-3 shadow-sm">
                  <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 font-bold text-lg">✓</div>
                  <h4 class="font-bold text-slate-900 text-sm">Briefing Securely Transmitted</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Briefing transmitted successfully. Our engineers will review the telemetry pipeline within 24 hours.
                  </p>
                </div>
              `;
              briefingForm.reset();
              resolve();
            }, 2000);
          });
        } else {
          console.warn("Web3Forms error response:", data);
          formFeedback.innerHTML = `
            <div class="border border-red-200 bg-red-50/50 p-4 rounded-xl text-center text-xs text-red-600 font-mono">
              Transmission Failed: Please ensure your API form key is activated.
            </div>
          `;
        }
      } catch (error) {
        console.error("Submission Error:", error);
        formFeedback.innerHTML = `
          <div class="border border-red-200 bg-red-50/50 p-4 rounded-xl text-center text-xs text-red-600 font-mono">
            Transmission Failed: Please ensure your API form key is activated.
          </div>
        `;
      } finally {
        formSubmitBtn.disabled = false;
        formSubmitBtn.textContent = 'Initialize Briefing';
      }
    });
  }
});
