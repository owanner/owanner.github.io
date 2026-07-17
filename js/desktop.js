/* =============================================================
   desktop.js
   "Sistema operacional" estático inspirado no Windows XP.

   Este arquivo é organizado em pequenas funções, cada uma com
   uma única responsabilidade, para ficar fácil de ler e manter.
   Se você está aprendendo JavaScript, leia os comentários acima
   de cada função para entender o que ela faz.
   ============================================================= */

// Executa o código só depois que todo o HTML da página foi carregado.
// Isso evita erros de tentar manipular elementos que ainda não existem.
document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------------------------------------
     1. REFERÊNCIAS AOS ELEMENTOS DA PÁGINA (cache)
     Guardamos essas referências em variáveis para não precisar
     buscar no HTML toda vez que precisarmos delas.
     ----------------------------------------------------------- */
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const taskbarOpenWindows = document.getElementById("taskbar-open-windows");
  const taskbarClock = document.getElementById("taskbar-clock");
  const desktopIcons = document.querySelectorAll(".desktop-icon");
  const startMenuItems = document.querySelectorAll(".start-menu-list li");

  // Controla qual é o maior "z-index" usado até agora, para que a
  // janela clicada por último sempre fique por cima das outras.
  let highestZIndex = 10;

  // Guarda o estado de cada janela aberta: se está minimizada, etc.
  // Exemplo: { about: { minimized: false }, resume: { minimized: true } }
  const windowState = {};


  /* -----------------------------------------------------------
     2. SOM OPCIONAL DE CLIQUE (efeito estilo XP)
     Em vez de carregar um arquivo de áudio (que aumentaria o
     tamanho do projeto), geramos um "beep" curtinho usando a
     Web Audio API, disponível em todo navegador moderno.
     Isso é totalmente opcional: se o navegador bloquear áudio
     automático, o site continua funcionando normalmente.
     ----------------------------------------------------------- */
  function playClickSound() {
    try {
      // "AudioContext" é a API nativa do navegador para gerar som.
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 600; // frequência do "beep", em Hz
      gainNode.gain.value = 0.05; // volume bem baixo, só um clique suave

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      // O som dura apenas 80 milissegundos, como um clique de mouse
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (error) {
      // Se o navegador não suportar áudio, apenas ignoramos o erro.
      // O site continua funcionando sem som.
      console.warn("Som opcional não pôde ser reproduzido:", error);
    }
  }


  /* -----------------------------------------------------------
     3. ABRIR UMA JANELA
     Recebe o nome da janela (ex: "about") e mostra ela na tela.
     ----------------------------------------------------------- */
  function openWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    if (!windowElement) return; // proteção: se o id não existir, não faz nada

    playClickSound();

    // Se a janela ainda não tem uma posição definida, colocamos ela
    // em uma posição "em cascata" (cada janela nova um pouco mais
    // para baixo e para a direita que a anterior), como no XP real.
    if (!windowElement.style.left) {
      const offset = (document.querySelectorAll(".xp-window:not(.hidden)").length % 6) * 30;
      windowElement.style.left = `${80 + offset}px`;
      windowElement.style.top = `${60 + offset}px`;
    }

    windowElement.classList.remove("hidden", "minimizing");
    windowElement.classList.add("opening");

    // Remove a classe de animação depois que ela termina, para que
    // a animação possa ser reaplicada da próxima vez que a janela abrir.
    setTimeout(() => windowElement.classList.remove("opening"), 200);

    focusWindow(windowId);

    // Atualiza o estado e garante que exista um botão na taskbar
    windowState[windowId] = { minimized: false };
    updateTaskbarButton(windowId);
  }


  /* -----------------------------------------------------------
     4. FECHAR UMA JANELA
     ----------------------------------------------------------- */
  function closeWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    if (!windowElement) return;

    windowElement.classList.add("hidden");
    delete windowState[windowId];
    removeTaskbarButton(windowId);
  }


  /* -----------------------------------------------------------
     5. MINIMIZAR / RESTAURAR UMA JANELA
     Minimizar apenas esconde a janela visualmente (ela continua
     "aberta" e mantém seu lugar na taskbar).
     ----------------------------------------------------------- */
  function minimizeWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    if (!windowElement) return;

    windowElement.classList.add("minimizing");

    // Espera a animação de encolher terminar antes de esconder de fato
    setTimeout(() => {
      windowElement.classList.add("hidden");
      windowElement.classList.remove("minimizing");
    }, 200);

    windowState[windowId].minimized = true;
    updateTaskbarButton(windowId);
  }

  function restoreWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    if (!windowElement) return;

    windowElement.classList.remove("hidden");
    windowState[windowId].minimized = false;
    focusWindow(windowId);
    updateTaskbarButton(windowId);
  }


  /* -----------------------------------------------------------
     6. COLOCAR UMA JANELA EM FOCO (trazer para frente)
     ----------------------------------------------------------- */
  function focusWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    if (!windowElement) return;

    highestZIndex += 1;
    windowElement.style.zIndex = highestZIndex;

    // Remove o destaque "focused" de todas as janelas...
    document.querySelectorAll(".xp-window").forEach((win) => {
      win.classList.remove("focused");
    });
    // ...e adiciona apenas na janela atual
    windowElement.classList.add("focused");

    updateTaskbarButton(windowId);
  }


  /* -----------------------------------------------------------
     7. BOTÕES DA TASKBAR (uma para cada janela aberta)
     ----------------------------------------------------------- */
  function updateTaskbarButton(windowId) {
    let button = document.getElementById(`taskbar-btn-${windowId}`);

    // Se o botão ainda não existe, criamos um novo
    if (!button) {
      button = document.createElement("button");
      button.id = `taskbar-btn-${windowId}`;
      button.className = "taskbar-window-btn";

      // Pega o texto do título da janela para reaproveitar no botão
      const titleText = document
        .querySelector(`#window-${windowId} .title-bar-text`)
        .textContent.trim();
      button.textContent = titleText;

      // Clicar no botão da taskbar alterna entre minimizar e restaurar
      button.addEventListener("click", () => {
        const isMinimized = windowState[windowId]?.minimized;
        const isCurrentlyFocused = document
          .getElementById(`window-${windowId}`)
          .classList.contains("focused");

        if (isMinimized) {
          restoreWindow(windowId);
        } else if (isCurrentlyFocused) {
          // Se já está em foco e o usuário clica de novo, minimiza
          minimizeWindow(windowId);
        } else {
          focusWindow(windowId);
        }
      });

      taskbarOpenWindows.appendChild(button);
    }

    // Atualiza a aparência do botão (ativo/inativo) conforme o estado atual
    const windowElement = document.getElementById(`window-${windowId}`);
    button.classList.toggle(
      "active",
      windowElement.classList.contains("focused") && !windowState[windowId]?.minimized
    );
  }

  function removeTaskbarButton(windowId) {
    const button = document.getElementById(`taskbar-btn-${windowId}`);
    if (button) button.remove();
  }


  /* -----------------------------------------------------------
     8. ARRASTAR JANELAS (DRAG)
     Permite clicar e segurar na barra de título para mover a
     janela pela tela, tanto com mouse quanto com toque (celular).
     ----------------------------------------------------------- */
  function makeWindowDraggable(windowElement) {
    const titleBar = windowElement.querySelector(".title-bar");

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    // Função chamada quando o usuário começa a arrastar
    // (funciona tanto para "mousedown" quanto para "touchstart")
    function startDrag(clientX, clientY) {
      isDragging = true;
      startX = clientX;
      startY = clientY;
      startLeft = windowElement.offsetLeft;
      startTop = windowElement.offsetTop;
      focusWindow(windowElement.dataset.windowId);
    }

    // Função chamada continuamente enquanto o usuário arrasta
    function duringDrag(clientX, clientY) {
      if (!isDragging) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;

      // Impede que a janela seja arrastada para fora da tela
      // (deixamos uma margem mínima visível de 40px)
      const maxLeft = window.innerWidth - 40;
      const maxTop = window.innerHeight - 80;
      newLeft = Math.max(-windowElement.offsetWidth + 100, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      windowElement.style.left = `${newLeft}px`;
      windowElement.style.top = `${newTop}px`;
    }

    function stopDrag() {
      isDragging = false;
    }

    // --- Eventos de mouse (desktop) ---
    titleBar.addEventListener("mousedown", (event) => {
      startDrag(event.clientX, event.clientY);
    });
    document.addEventListener("mousemove", (event) => {
      duringDrag(event.clientX, event.clientY);
    });
    document.addEventListener("mouseup", stopDrag);

    // --- Eventos de toque (celular/tablet) ---
    titleBar.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      startDrag(touch.clientX, touch.clientY);
    });
    document.addEventListener("touchmove", (event) => {
      if (!isDragging) return;
      const touch = event.touches[0];
      duringDrag(touch.clientX, touch.clientY);
    });
    document.addEventListener("touchend", stopDrag);
  }


  /* -----------------------------------------------------------
     9. CONFIGURA OS BOTÕES DE CADA JANELA (fechar/minimizar/maximizar)
     ----------------------------------------------------------- */
  function setupWindowControls(windowElement) {
    const windowId = windowElement.dataset.windowId;

    windowElement.querySelector(".btn-close").addEventListener("click", () => {
      closeWindow(windowId);
    });

    windowElement.querySelector(".btn-minimize").addEventListener("click", () => {
      minimizeWindow(windowId);
    });

    // O botão "maximizar" alterna a janela entre tamanho normal e
    // ocupando quase toda a tela (não é um verdadeiro "fullscreen").
    windowElement.querySelector(".btn-maximize").addEventListener("click", () => {
      const isMaximized = windowElement.dataset.maximized === "true";

      if (isMaximized) {
        // Restaura o tamanho e a posição que a janela tinha antes
        windowElement.style.width = windowElement.dataset.prevWidth;
        windowElement.style.left = windowElement.dataset.prevLeft;
        windowElement.style.top = windowElement.dataset.prevTop;
        windowElement.style.height = windowElement.dataset.prevHeight || "";
        windowElement.dataset.maximized = "false";
      } else {
        // Guarda o tamanho/posição atuais para poder restaurar depois
        windowElement.dataset.prevWidth = windowElement.style.width;
        windowElement.dataset.prevLeft = windowElement.style.left;
        windowElement.dataset.prevTop = windowElement.style.top;
        windowElement.dataset.prevHeight = windowElement.style.height;

        windowElement.style.width = "96vw";
        windowElement.style.height = "85vh";
        windowElement.style.left = "2vw";
        windowElement.style.top = "2vh";
        windowElement.dataset.maximized = "true";
      }
    });

    // Clicar em qualquer parte da janela também a coloca em foco
    windowElement.addEventListener("mousedown", () => focusWindow(windowId));
  }


  /* -----------------------------------------------------------
     10. RELÓGIO DA TASKBAR
     Atualiza a hora exibida a cada segundo.
     ----------------------------------------------------------- */
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    taskbarClock.textContent = `${hours}:${minutes}`;
  }

  updateClock(); // mostra a hora imediatamente ao carregar a página
  setInterval(updateClock, 1000); // e depois atualiza a cada segundo


  /* -----------------------------------------------------------
     11. MENU START (abrir/fechar)
     ----------------------------------------------------------- */
  function toggleStartMenu() {
    startMenu.classList.toggle("hidden");
    startButton.classList.toggle("active");
  }

  function closeStartMenu() {
    startMenu.classList.add("hidden");
    startButton.classList.remove("active");
  }

  startButton.addEventListener("click", (event) => {
    event.stopPropagation(); // evita que o clique "vaze" e feche o menu na hora
    toggleStartMenu();
    playClickSound();
  });

  // Fecha o menu Start se o usuário clicar em qualquer outro lugar da tela
  document.addEventListener("click", (event) => {
    if (!startMenu.contains(event.target) && event.target !== startButton) {
      closeStartMenu();
    }
  });

  // Cada item da lista do menu Start abre sua respectiva janela
  startMenuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const windowId = item.dataset.window;
      openWindow(windowId);
      closeStartMenu();
    });
  });


  /* -----------------------------------------------------------
     12. ÍCONES DO DESKTOP (abrir janela ao clicar)
     ----------------------------------------------------------- */
  desktopIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const windowId = icon.dataset.window;
      openWindow(windowId);
    });

    // Permite abrir o ícone também pelo teclado (acessibilidade),
    // pressionando Enter quando o ícone estiver em foco.
    icon.setAttribute("tabindex", "0");
    icon.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        openWindow(icon.dataset.window);
      }
    });
  });


  /* -----------------------------------------------------------
     13. INICIALIZAÇÃO
     Prepara todas as janelas que existem no HTML: torna cada
     uma arrastável e conecta os botões de fechar/minimizar.
     ----------------------------------------------------------- */
  document.querySelectorAll(".xp-window").forEach((windowElement) => {
    makeWindowDraggable(windowElement);
    setupWindowControls(windowElement);
  });

});
