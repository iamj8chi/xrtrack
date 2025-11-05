// MathiasXR - Aplicación de Seguimiento de Imágenes AR
class ARImageTracker {
  constructor() {
    this.isInitialized = false;
    this.targetFound = false;
    this.scene = null;
    this.targetEntity = null;

    this.init();
  }

  async init() {
    console.log("Inicializando MathiasXR AR Image Tracker...");

    // Wait for A-Frame to be ready
    this.waitForAFrame().then(() => {
      this.setupEventListeners();
      this.hideLoadingScreen();
    });
  }

  waitForAFrame() {
    return new Promise((resolve) => {
      if (document.querySelector("a-scene").hasLoaded) {
        resolve();
      } else {
        document.querySelector("a-scene").addEventListener("loaded", resolve);
      }
    });
  }

  setupEventListeners() {
    this.scene = document.querySelector("a-scene");
    this.targetEntity = document.querySelector("#target-entity");
    const overlayPlane = document.querySelector("#overlay-plane");

    // Eventos MindAR
    this.scene.addEventListener("arReady", () => {
      console.log("AR Listo");
      this.isInitialized = true;
      this.hideUIElement("#loading");
    });

    this.scene.addEventListener("arError", (event) => {
      console.error("Error AR:", event);
      this.showUIElement("#error");
    });

    // Eventos de seguimiento de objetivo
    this.targetEntity.addEventListener("targetFound", () => {
      console.log("¡Objetivo encontrado!");
      this.targetFound = true;
      this.hideUIElement("#scanning");
      this.onTargetFound();
    });

    this.targetEntity.addEventListener("targetLost", () => {
      console.log("¡Objetivo perdido!");
      this.targetFound = false;
      this.showUIElement("#scanning");
      this.onTargetLost();
    });

    // Add click interaction to overlay
    if (overlayPlane) {
      overlayPlane.classList.add("clickable");
      overlayPlane.addEventListener("click", this.onOverlayClick.bind(this));
    }

    // Handle orientation changes
    window.addEventListener(
      "orientationchange",
      this.handleOrientationChange.bind(this)
    );

    // Handle visibility changes (app backgrounding)
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
  }

  onTargetFound() {
    const overlayPlane = document.querySelector("#overlay-plane");

    if (overlayPlane) {
      // Remover cualquier animación existente
      overlayPlane.removeAttribute("animation");
      overlayPlane.removeAttribute("animation__rotation");
      overlayPlane.removeAttribute("animation__click");
      overlayPlane.removeAttribute("animation__scale");
      
      // Mostrar la imagen directamente sin animaciones
      overlayPlane.setAttribute("scale", "1 1 1");
      overlayPlane.setAttribute("rotation", "0 0 0");
    }

    // Activar retroalimentación háptica si está disponible
    this.triggerHapticFeedback();
  }

  onTargetLost() {
    const overlayPlane = document.querySelector("#overlay-plane");

    if (overlayPlane) {
      // Remover cualquier animación existente
      overlayPlane.removeAttribute("animation");
      overlayPlane.removeAttribute("animation__rotation");
      overlayPlane.removeAttribute("animation__click");
      overlayPlane.removeAttribute("animation__scale");
      
      // Ocultar la imagen directamente sin animaciones
      overlayPlane.setAttribute("scale", "0 0 0");
    }
  }

  onOverlayClick() {
    if (!this.targetFound) return;

    console.log("¡Overlay clickeado!");

    const overlayPlane = document.querySelector("#overlay-plane");
    if (overlayPlane) {
      // Asegurarse de que no hay animaciones al hacer click
      overlayPlane.removeAttribute("animation");
      overlayPlane.removeAttribute("animation__rotation");
      overlayPlane.removeAttribute("animation__click");
      overlayPlane.removeAttribute("animation__scale");
    }

    // Solo retroalimentación háptica, sin animaciones
    this.triggerHapticFeedback();

    // Manejador de click personalizado - agrega tu lógica aquí
    this.handleCustomClick();
  }

  handleCustomClick() {
    // Agrega tu lógica de click personalizada aquí
    // Por ejemplo: cambiar imagen overlay, reproducir sonido, navegar a URL, etc.
    console.log("Manejador de click personalizado - agrega tu lógica aquí");
  }

  triggerHapticFeedback() {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  }

  handleOrientationChange() {
    // Reiniciar AR después del cambio de orientación
    setTimeout(() => {
      if (this.scene && this.scene.components["mindar-image"]) {
        console.log("Manejando cambio de orientación...");
        // La librería MindAR debería manejar esto automáticamente
      }
    }, 500);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      console.log("App oculta - pausando AR");
      this.pauseAR();
    } else {
      console.log("App visible - reanudando AR");
      this.resumeAR();
    }
  }

  pauseAR() {
    if (this.scene && this.scene.components["mindar-image"]) {
      // Pausar procesamiento AR para ahorrar batería
      this.scene.components["mindar-image"].pause();
    }
  }

  resumeAR() {
    if (this.scene && this.scene.components["mindar-image"]) {
      // Reanudar procesamiento AR
      this.scene.components["mindar-image"].unpause();
    }
  }

  showUIElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = "flex";
    }
  }

  hideUIElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = "none";
    }
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) {
        loadingScreen.style.opacity = "0";
        loadingScreen.style.transition = "opacity 0.5s ease";

        setTimeout(() => {
          loadingScreen.style.display = "none";
        }, 500);
      }
    }, 1000);
  }
}

// Funciones de utilidad
const Utils = {
  // Verificar si el dispositivo soporta AR
  checkARSupport() {
    return new Promise((resolve) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
            resolve(true);
          })
          .catch(() => resolve(false));
      } else {
        resolve(false);
      }
    });
  },

  // Verificar capacidades del dispositivo
  getDeviceInfo() {
    return {
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      supportsWebGL: (() => {
        try {
          const canvas = document.createElement("canvas");
          return !!(window.WebGLRenderingContext && canvas.getContext("webgl"));
        } catch (e) {
          return false;
        }
      })(),
    };
  },
};

// Inicializar la aplicación AR cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("MathiasXR - Iniciando Aplicación de Seguimiento de Imágenes AR");

  // Verificar capacidades del dispositivo
  const deviceInfo = Utils.getDeviceInfo();
  console.log("Información del dispositivo:", deviceInfo);

  if (!deviceInfo.supportsWebGL) {
    console.error("WebGL no soportado");
    document.querySelector("#error").innerHTML =
      "<p>Tu dispositivo no soporta WebGL, que es requerido para AR.</p>";
    document.querySelector("#error").style.display = "flex";
    return;
  }

  // Verificar soporte AR
  Utils.checkARSupport().then((supported) => {
    if (!supported) {
      console.warn("Acceso a cámara no disponible");
      document.querySelector("#error").innerHTML =
        "<p>Se requiere acceso a la cámara para AR. Por favor permite los permisos de cámara y actualiza.</p>";
      document.querySelector("#error").style.display = "flex";
      return;
    }

    // Inicializar aplicación AR
    window.arApp = new ARImageTracker();
  });
});
