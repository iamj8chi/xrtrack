// MathiasXR - Aplicación de Seguimiento de Imágenes AR

// Smoothing and tracking optimization
class TrackingSmoothing {
  constructor(smoothingFactor = 0.8) {
    this.smoothingFactor = smoothingFactor;
    this.lastPosition = { x: 0, y: 0, z: 0 };
    this.lastRotation = { x: 0, y: 0, z: 0 };
    this.lastScale = { x: 1, y: 1, z: 1 };
    this.isFirstFrame = true;
  }

  smoothTransform(entity, newTransform) {
    if (this.isFirstFrame) {
      this.lastPosition = newTransform.position || this.lastPosition;
      this.lastRotation = newTransform.rotation || this.lastRotation;
      this.lastScale = newTransform.scale || this.lastScale;
      this.isFirstFrame = false;
      return;
    }

    // Smooth position
    if (newTransform.position) {
      this.lastPosition.x = this.lerp(
        this.lastPosition.x,
        newTransform.position.x,
        this.smoothingFactor
      );
      this.lastPosition.y = this.lerp(
        this.lastPosition.y,
        newTransform.position.y,
        this.smoothingFactor
      );
      this.lastPosition.z = this.lerp(
        this.lastPosition.z,
        newTransform.position.z,
        this.smoothingFactor
      );
      entity.setAttribute(
        "position",
        `${this.lastPosition.x} ${this.lastPosition.y} ${this.lastPosition.z}`
      );
    }

    // Smooth rotation
    if (newTransform.rotation) {
      this.lastRotation.x = this.lerp(
        this.lastRotation.x,
        newTransform.rotation.x,
        this.smoothingFactor
      );
      this.lastRotation.y = this.lerp(
        this.lastRotation.y,
        newTransform.rotation.y,
        this.smoothingFactor
      );
      this.lastRotation.z = this.lerp(
        this.lastRotation.z,
        newTransform.rotation.z,
        this.smoothingFactor
      );
      entity.setAttribute(
        "rotation",
        `${this.lastRotation.x} ${this.lastRotation.y} ${this.lastRotation.z}`
      );
    }

    // Smooth scale
    if (newTransform.scale) {
      this.lastScale.x = this.lerp(
        this.lastScale.x,
        newTransform.scale.x,
        this.smoothingFactor
      );
      this.lastScale.y = this.lerp(
        this.lastScale.y,
        newTransform.scale.y,
        this.smoothingFactor
      );
      this.lastScale.z = this.lerp(
        this.lastScale.z,
        newTransform.scale.z,
        this.smoothingFactor
      );
      entity.setAttribute(
        "scale",
        `${this.lastScale.x} ${this.lastScale.y} ${this.lastScale.z}`
      );
    }
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  reset() {
    this.isFirstFrame = true;
  }
}

// Initialize smoothing for both targets
const smoothing1 = new TrackingSmoothing(0.7);
const smoothing2 = new TrackingSmoothing(0.7);

// Tracking state management
let trackingStates = {
  target1: { isTracking: false, confidence: 0, framesSinceDetection: 0 },
  target2: { isTracking: false, confidence: 0, framesSinceDetection: 0 },
};

// Optimized tracking parameters
const TRACKING_CONFIG = {
  minConfidenceThreshold: 0.3,
  stabilityFrames: 3,
  lossToleranceFrames: 8,
  smoothingIntensity: 0.7,
  scaleStabilization: true,
};

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

    // Configurar múltiples objetivos
    this.targetEntities = [
      document.querySelector("#target-entity-1"),
      document.querySelector("#target-entity-2"),
    ];

    // Verificar que las imágenes se cargan correctamente
    const overlayImages = [
      document.querySelector("#overlay-image-1"),
      document.querySelector("#overlay-image-2"),
    ];

    overlayImages.forEach((overlayImage, index) => {
      if (overlayImage) {
        overlayImage.onload = () => {
          console.log(
            `✅ Imagen overlay ${index + 1} cargada correctamente:`,
            overlayImage.src
          );
        };
        overlayImage.onerror = () => {
          console.error(
            `❌ Error al cargar imagen overlay ${index + 1}:`,
            overlayImage.src
          );
        };
      }
    });

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

    // Eventos de seguimiento de múltiples objetivos
    this.targetEntities.forEach((targetEntity, index) => {
      if (targetEntity) {
        targetEntity.addEventListener("targetFound", () => {
          console.log(`¡Objetivo ${index + 1} encontrado!`);
          this.targetFound = true;
          this.hideUIElement("#scanning");
          this.onTargetFound(index);
        });

        targetEntity.addEventListener("targetLost", () => {
          console.log(`¡Objetivo ${index + 1} perdido!`);
          this.targetFound = false;
          this.showUIElement("#scanning");
          this.onTargetLost(index);
        });
      }
    });

    // Add click interactions to overlays
    const overlayPlanes = [
      document.querySelector("#overlay-plane-1"),
      document.querySelector("#overlay-plane-2"),
    ];

    overlayPlanes.forEach((overlayPlane, index) => {
      if (overlayPlane) {
        overlayPlane.classList.add("clickable");
        overlayPlane.addEventListener("click", () =>
          this.onOverlayClick(index)
        );
      }
    });

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

  onTargetFound(targetIndex) {
    const targetState =
      targetIndex === 0 ? trackingStates.target1 : trackingStates.target2;
    const overlayPlane = document.querySelector(
      `#overlay-plane-${targetIndex + 1}`
    );
    const smoothWrapper = document.querySelector(
      `#smooth-wrapper-${targetIndex + 1}`
    );

    if (!overlayPlane) {
      console.error(
        `❌ Elemento overlay-plane-${targetIndex + 1} no encontrado`
      );
      return;
    }

    // Reset frame counter and update state
    targetState.framesSinceDetection = 0;
    targetState.confidence = 1.0;

    // Only show if not already tracking (prevents flickering)
    if (!targetState.isTracking) {
      targetState.isTracking = true;

      console.log(
        `🎯 Objetivo ${targetIndex + 1} detectado con estabilización`
      );

      // Smooth appearance transition
      overlayPlane.setAttribute("visible", true);
      overlayPlane.removeAttribute("animation__fadeout");
      overlayPlane.setAttribute("animation__fadein", {
        property: "material.opacity",
        from: 0,
        to: 1,
        dur: 200,
        easing: "easeOutQuad",
      });

      // Apply scale stabilization
      if (TRACKING_CONFIG.scaleStabilization) {
        overlayPlane.setAttribute("scale", "1 1 1");
      }

      // Reset smoothing for this target
      if (targetIndex === 0) smoothing1.reset();
      else smoothing2.reset();
    }

    // Activar retroalimentación háptica si está disponible
    this.triggerHapticFeedback();
  }

  onTargetLost(targetIndex) {
    const targetState =
      targetIndex === 0 ? trackingStates.target1 : trackingStates.target2;
    const overlayPlane = document.querySelector(
      `#overlay-plane-${targetIndex + 1}`
    );

    if (!overlayPlane) return;

    targetState.framesSinceDetection++;
    targetState.confidence = Math.max(0, targetState.confidence - 0.1);

    // Only hide after tolerance period to reduce jitter
    if (
      targetState.framesSinceDetection >= TRACKING_CONFIG.lossToleranceFrames
    ) {
      if (targetState.isTracking) {
        targetState.isTracking = false;

        console.log(
          `❌ Objetivo ${targetIndex + 1} perdido después de ${
            TRACKING_CONFIG.lossToleranceFrames
          } frames`
        );

        // Smooth disappearance transition
        overlayPlane.removeAttribute("animation__fadein");
        overlayPlane.setAttribute("animation__fadeout", {
          property: "material.opacity",
          from: 1,
          to: 0,
          dur: 300,
          easing: "easeOutQuad",
        });

        // Hide after animation completes
        setTimeout(() => {
          if (!targetState.isTracking) {
            overlayPlane.setAttribute("visible", false);
          }
        }, 300);
      }
    }
  }

  onOverlayClick(targetIndex) {
    if (!this.targetFound) return;

    console.log(`¡Overlay ${targetIndex + 1} clickeado!`);

    const overlayPlane = document.querySelector(
      `#overlay-plane-${targetIndex + 1}`
    );
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
    this.handleCustomClick(targetIndex);
  }

  handleCustomClick(targetIndex) {
    // Agrega tu lógica de click personalizada aquí
    // Por ejemplo: cambiar imagen overlay, reproducir sonido, navegar a URL, etc.
    console.log(
      `Manejador de click personalizado para objetivo ${
        targetIndex + 1
      } - agrega tu lógica aquí`
    );
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

// Performance monitoring and optimization
let frameCount = 0;
let lastFPSCheck = Date.now();

function monitorPerformance() {
  frameCount++;
  const now = Date.now();

  if (now - lastFPSCheck > 1000) {
    // Check every second
    const fps = frameCount;
    frameCount = 0;
    lastFPSCheck = now;

    // Adjust smoothing based on performance
    if (fps < 20) {
      TRACKING_CONFIG.smoothingIntensity = 0.5; // Less smoothing for better performance
      console.log("⚡ Rendimiento bajo detectado, reduciendo suavizado");
    } else if (fps > 50) {
      TRACKING_CONFIG.smoothingIntensity = 0.8; // More smoothing for better quality
    }
  }

  requestAnimationFrame(monitorPerformance);
}

// Inicializar la aplicación AR cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("Iniciando con optimizaciones de tracking...");

  // Start performance monitoring
  monitorPerformance();

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
