// MathiasXR - AR Image Tracking Application
class ARImageTracker {
  constructor() {
    this.isInitialized = false;
    this.targetFound = false;
    this.scene = null;
    this.targetEntity = null;

    this.init();
  }

  async init() {
    console.log("Initializing MathiasXR AR Image Tracker...");

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

    // MindAR Events
    this.scene.addEventListener("arReady", () => {
      console.log("AR Ready");
      this.isInitialized = true;
      this.hideUIElement("#loading");
    });

    this.scene.addEventListener("arError", (event) => {
      console.error("AR Error:", event);
      this.showUIElement("#error");
    });

    // Target tracking events
    this.targetEntity.addEventListener("targetFound", () => {
      console.log("Target found!");
      this.targetFound = true;
      this.hideUIElement("#scanning");
      this.onTargetFound();
    });

    this.targetEntity.addEventListener("targetLost", () => {
      console.log("Target lost!");
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
      // Add entrance animation
      overlayPlane.setAttribute("animation", {
        property: "scale",
        from: "0 0 0",
        to: "1 1 1",
        dur: 500,
        easing: "easeOutElastic",
      });

      // Start rotation animation
      setTimeout(() => {
        overlayPlane.setAttribute("animation__rotation", {
          property: "rotation",
          to: "0 360 0",
          dur: 5000,
          loop: true,
          easing: "linear",
        });
      }, 500);
    }

    // Trigger haptic feedback if available
    this.triggerHapticFeedback();
  }

  onTargetLost() {
    const overlayPlane = document.querySelector("#overlay-plane");

    if (overlayPlane) {
      // Stop animations
      overlayPlane.removeAttribute("animation__rotation");

      // Add exit animation
      overlayPlane.setAttribute("animation", {
        property: "scale",
        from: "1 1 1",
        to: "0 0 0",
        dur: 300,
        easing: "easeInQuart",
      });
    }
  }

  onOverlayClick() {
    if (!this.targetFound) return;

    console.log("Overlay clicked!");

    const overlayPlane = document.querySelector("#overlay-plane");

    // Add click animation
    overlayPlane.setAttribute("animation__click", {
      property: "scale",
      from: "1 1 1",
      to: "1.2 1.2 1.2",
      dur: 200,
      dir: "alternate",
      easing: "easeInOutQuad",
    });

    // Trigger haptic feedback
    this.triggerHapticFeedback();

    // Custom click handler - add your logic here
    this.handleCustomClick();
  }

  handleCustomClick() {
    // Add your custom click logic here
    // For example: change overlay image, play sound, navigate to URL, etc.
    console.log("Custom click handler - add your logic here");
  }

  triggerHapticFeedback() {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  }

  handleOrientationChange() {
    // Restart AR after orientation change
    setTimeout(() => {
      if (this.scene && this.scene.components["mindar-image"]) {
        console.log("Handling orientation change...");
        // The MindAR library should handle this automatically
      }
    }, 500);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      console.log("App hidden - pausing AR");
      this.pauseAR();
    } else {
      console.log("App visible - resuming AR");
      this.resumeAR();
    }
  }

  pauseAR() {
    if (this.scene && this.scene.components["mindar-image"]) {
      // Pause AR processing to save battery
      this.scene.components["mindar-image"].pause();
    }
  }

  resumeAR() {
    if (this.scene && this.scene.components["mindar-image"]) {
      // Resume AR processing
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

// Utility functions
const Utils = {
  // Check if device supports AR
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

  // Check device capabilities
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

// Initialize the AR application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("MathiasXR - Starting AR Image Tracking Application");

  // Check device capabilities
  const deviceInfo = Utils.getDeviceInfo();
  console.log("Device Info:", deviceInfo);

  if (!deviceInfo.supportsWebGL) {
    console.error("WebGL not supported");
    document.querySelector("#error").innerHTML =
      "<p>Your device does not support WebGL, which is required for AR.</p>";
    document.querySelector("#error").style.display = "flex";
    return;
  }

  // Check AR support
  Utils.checkARSupport().then((supported) => {
    if (!supported) {
      console.warn("Camera access not available");
      document.querySelector("#error").innerHTML =
        "<p>Camera access is required for AR. Please allow camera permissions and refresh.</p>";
      document.querySelector("#error").style.display = "flex";
      return;
    }

    // Initialize AR application
    window.arApp = new ARImageTracker();
  });
});
