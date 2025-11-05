# MathiasXR Assets Directory

This directory contains the assets needed for the AR image tracking application.

## Required Files

### 1. targets.mind

This file contains the compiled image targets for MindAR.

**To create this file:**

1. Go to https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload your target image(s)
3. Download the generated `.mind` file
4. Place it in this `assets/` directory as `targets.mind`

**Requirements for target images:**

- High contrast
- Rich in details/textures
- Avoid repetitive patterns
- Recommended resolution: 480x640 or similar
- Supported formats: JPG, PNG
- Good lighting and sharp focus

### 2. overlay.png

This is the PNG image that will be displayed over the tracked target.

**Requirements:**

- PNG format with transparency support
- Recommended size: 512x512 or 1024x1024
- Keep file size reasonable for web loading
- Use transparent background if needed

## Placeholder Files

**IMPORTANT:** The current files in this directory are placeholders. You need to replace them with your actual assets:

1. Replace `overlay.png` with your actual overlay image
2. Create and add your `targets.mind` file using the MindAR compiler tool

## Usage Notes

- The overlay image will automatically scale to fit the tracked target
- Multiple target images can be compiled into a single `.mind` file
- Test your target images in good lighting conditions
- Consider different viewing angles and distances when creating targets
