#!/usr/bin/env python3
"""
Convert SVG to PNG icons for Tauri application.
Requires: pip install cairosvg Pillow
"""

import os
import subprocess
import sys

# Try to install required packages if not available
try:
    import cairosvg
    from PIL import Image
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cairosvg", "Pillow", "-q"])
    import cairosvg
    from PIL import Image

def svg_to_png(svg_path, png_path, width, height):
    """Convert SVG to PNG with specified dimensions."""
    cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=width, output_height=height)
    print(f"  Created: {os.path.basename(png_path)} ({width}x{height})")

def create_icns(png_512_path, icns_path):
    """Create .icns file for macOS (requires iconutil on macOS)."""
    import tempfile
    import shutil
    
    iconset_dir = tempfile.mkdtemp(suffix='.iconset')
    
    try:
        # Required sizes for iconset
        sizes = [16, 32, 64, 128, 256, 512]
        
        for size in sizes:
            # Normal resolution
            img = Image.open(png_512_path)
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            img.save(os.path.join(iconset_dir, f'icon_{size}x{size}.png'))
            
            # Retina resolution (@2x)
            if size <= 256:
                img = Image.open(png_512_path)
                img = img.resize((size * 2, size * 2), Image.Resampling.LANCZOS)
                img.save(os.path.join(iconset_dir, f'icon_{size}x{size}@2x.png'))
        
        # Use iconutil to create .icns
        result = subprocess.run(['iconutil', '-c', 'icns', iconset_dir, '-o', icns_path], 
                               capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  Created: {os.path.basename(icns_path)}")
        else:
            print(f"  Warning: iconutil failed: {result.stderr}")
    finally:
        shutil.rmtree(iconset_dir)

def create_ico(png_512_path, ico_path):
    """Create .ico file for Windows."""
    img = Image.open(png_512_path)
    
    # ICO can contain multiple sizes
    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    
    icons = []
    for size in sizes:
        resized = img.resize(size, Image.Resampling.LANCZOS)
        icons.append(resized)
    
    # Save as ICO with multiple sizes
    icons[0].save(ico_path, format='ICO', sizes=sizes)
    print(f"  Created: {os.path.basename(ico_path)}")

def main():
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')
    svg_path = os.path.join(icons_dir, 'app-icon.svg')
    
    if not os.path.exists(svg_path):
        print(f"Error: SVG file not found at {svg_path}")
        sys.exit(1)
    
    print(f"Converting {svg_path} to PNG icons...\n")
    
    # Generate main icon.png (512x512)
    icon_512 = os.path.join(icons_dir, 'icon.png')
    svg_to_png(svg_path, icon_512, 512, 512)
    
    # Generate various PNG sizes for Tauri
    png_sizes = [
        ('32x32.png', 32, 32),
        ('128x128.png', 128, 128),
        ('128x128@2x.png', 256, 256),
    ]
    
    for filename, w, h in png_sizes:
        svg_to_png(svg_path, os.path.join(icons_dir, filename), w, h)
    
    # Windows Store icons
    store_sizes = [
        ('Square30x30Logo.png', 30, 30),
        ('Square44x44Logo.png', 44, 44),
        ('Square71x71Logo.png', 71, 71),
        ('Square89x89Logo.png', 89, 89),
        ('Square107x107Logo.png', 107, 107),
        ('Square142x142Logo.png', 142, 142),
        ('Square150x150Logo.png', 150, 150),
        ('Square284x284Logo.png', 284, 284),
        ('Square310x310Logo.png', 310, 310),
        ('StoreLogo.png', 50, 50),
    ]
    
    for filename, w, h in store_sizes:
        svg_to_png(svg_path, os.path.join(icons_dir, filename), w, h)
    
    # Create .icns for macOS
    print("\nCreating macOS .icns file...")
    icns_path = os.path.join(icons_dir, 'icon.icns')
    try:
        create_icns(icon_512, icns_path)
    except Exception as e:
        print(f"  Warning: Could not create .icns: {e}")
    
    # Create .ico for Windows
    print("\nCreating Windows .ico file...")
    ico_path = os.path.join(icons_dir, 'icon.ico')
    try:
        create_ico(icon_512, ico_path)
    except Exception as e:
        print(f"  Warning: Could not create .ico: {e}")
    
    print("\n✅ Icon generation complete!")
    print(f"Icons saved to: {icons_dir}")

if __name__ == '__main__':
    main()
