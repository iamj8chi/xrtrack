# MathiasXR - AR Image Tracking Project

An augmented reality web application that uses MindAR library to track image targets and display PNG overlays in real-time.

## 🎯 Features

- **Real-time Image Tracking**: Uses MindAR.js for robust image target detection
- **PNG Overlay Display**: Shows custom PNG images over tracked targets
- **Mobile Optimized**: Responsive design for mobile AR experiences
- **Interactive Elements**: Click interactions with AR overlays
- **Performance Optimized**: Efficient rendering and battery management

## 🚀 Quick Start

### Prerequisites

- A web server (local or remote)
- Camera-enabled device (mobile recommended)
- Modern web browser with WebGL support

### Setup Instructions

1. **Clone or download this project**
2. **Prepare your assets** (see Assets Setup below)
3. **Serve the project** using a local web server
4. **Open in browser** and allow camera permissions

### Assets Setup

You need to prepare two key assets:

#### 1. Target Images → targets.mind
1. Prepare your target image(s):
   - High contrast, detailed images work best
   - Avoid repetitive patterns
   - Recommended size: 480x640px
   - Formats: JPG or PNG

2. Compile using MindAR Compiler:
   - Visit: https://hiukim.github.io/mind-ar-js-doc/tools/compile
   - Upload your target image(s)
   - Download the generated `.mind` file
   - Place it in `assets/` directory as `targets.mind`

#### 2. Overlay Image
- Replace `assets/overlay.png` with your desired overlay image
- Recommended: PNG with transparency, 512x512 or 1024x1024px

## 🖥️ Local Development

### Using Python (if installed)
```bash
# Navigate to project directory
cd path/to/MathiasXR

# Start local server
python -m http.server 8000
# or for Python 2
python -m SimpleHTTPServer 8000

# Open http://localhost:8000 in your browser
```

### Using Node.js (if installed)
```bash
# Install a simple server
npm install -g http-server

# Navigate to project directory and start server
cd path/to/MathiasXR
http-server -p 8000

# Open http://localhost:8000 in your browser
```

### Using VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 📱 Usage

1. **Open the application** in a web browser
2. **Allow camera permissions** when prompted
3. **Point your camera** at the target image
4. **Watch the overlay appear** when the target is detected
5. **Tap the overlay** for interactive features

## 🛠️ Customization

### Changing the Overlay
- Replace `assets/overlay.png` with your image
- Modify overlay properties in `index.html`:
  ```html
  <a-plane 
      src="#overlay-image"
      height="0.552"
      width="1"
      position="0 0 0">
  </a-plane>
  ```

### Adding Animations
Modify the animation properties in `app.js`:
```javascript
overlayPlane.setAttribute('animation__rotation', {
    property: 'rotation',
    to: '0 360 0',
    dur: 5000,
    loop: true
});
```

### Styling
- Edit `styles.css` to change UI appearance
- Modify loading screens, scanning indicators, etc.

## 📁 Project Structure

```
MathiasXR/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js              # JavaScript application logic
├── assets/
│   ├── targets.mind    # Compiled target images (you need to create this)
│   ├── overlay.png     # Overlay image (replace with yours)
│   └── README.md       # Assets documentation
├── .github/
│   └── copilot-instructions.md
└── README.md           # This file
```

## 🔧 Technical Details

### Dependencies
- **A-Frame**: 3D/VR framework
- **MindAR**: Image tracking library
- **Modern Browser**: WebGL and camera support required

### Browser Compatibility
- Chrome 67+ (Android/Desktop)
- Safari 11.1+ (iOS)
- Firefox 67+ (Android/Desktop)
- Edge 79+

### Performance Tips
- Use high-quality target images
- Optimize overlay image file sizes
- Test in good lighting conditions
- Consider battery usage on mobile devices

## 🐛 Troubleshooting

### Camera Access Issues
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try refreshing the page

### Target Not Detected
- Ensure good lighting
- Check target image quality
- Verify `targets.mind` file is properly compiled
- Try different viewing angles/distances

### Performance Issues
- Reduce overlay image file size
- Close other browser tabs
- Ensure device has sufficient processing power

## 📄 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review MindAR documentation: https://hiukim.github.io/mind-ar-js-doc/
3. Check A-Frame documentation: https://aframe.io/docs/

---

**Ready to create amazing AR experiences!** 🚀