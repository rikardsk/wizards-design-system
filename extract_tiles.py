#!/usr/bin/env python3
import os
import sys
import argparse
import cv2
import numpy as np

def extract_hex_tiles(input_dir, output_dir, target_width, tightness):
    """
    Extracts inner hexagon shapes from PNG images in input_dir and saves them
    as transparent tiles of the same size in output_dir.
    """
    if not os.path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        return False
        
    os.makedirs(output_dir, exist_ok=True)
    
    # Define base coordinates for 768x1408 resolution
    # Based on tightness levels:
    # 100 is the tightest (completely removes all gold border)
    # 95 is slightly looser (keeps slightly more artwork but very low border risk)
    # 90 is looser (keeps more artwork but has small risk of gold slivers)
    if tightness == 100:
        wt, wp, yt, yb = 164, 328, 100, 668
    elif tightness == 95:
        wt, wp, yt, yb = 166, 333, 95, 673
    elif tightness == 90:
        wt, wp, yt, yb = 169, 339, 90, 678
    else:
        # Interpolate/calculate custom values if user passes another tightness value
        pct = (tightness - 90) / 10.0 # 0.0 to 1.0
        pct = max(0.0, min(1.0, pct))
        yt = int(90 + 10 * pct)
        yb = int(678 - 10 * pct)
        height = yb - yt
        wp = int(height / 1.7320508)
        wt = wp // 2
        
    xc, ym = 704, 384
    
    # Gather PNG files
    files = [f for f in os.listdir(input_dir) if f.lower().endswith('.png')]
    if not files:
        print(f"No PNG files found in '{input_dir}'.")
        return False
        
    print(f"Found {len(files)} image files in '{input_dir}'.")
    print(f"Using tightness = {tightness}% (coords: wt={wt}, wp={wp}, yt={yt}, yb={yb})")
    print(f"Target width = {target_width}px (height will scale proportionally to maintain aspect ratio)\n")
    
    success_count = 0
    
    for f in sorted(files):
        img_path = os.path.join(input_dir, f)
        img = cv2.imread(img_path)
        if img is None:
            print(f"Failed to read '{f}'. Skipping.")
            continue
            
        h, w, _ = img.shape
        
        # Calculate scale factor relative to base 1408x768 template
        scale_x = w / 1408.0
        scale_y = h / 768.0
        
        # Scale coordinates to match current image dimensions
        s_wt = int(wt * scale_x)
        s_wp = int(wp * scale_x)
        s_yt = int(yt * scale_y)
        s_yb = int(yb * scale_y)
        s_xc = int(xc * scale_x)
        s_ym = int(ym * scale_y)
        
        # Define 6 vertices of the inner hexagon
        pts = np.array([
            [s_xc - s_wt, s_yt],
            [s_xc + s_wt, s_yt],
            [s_xc + s_wp, s_ym],
            [s_xc + s_wt, s_yb],
            [s_xc - s_wt, s_yb],
            [s_xc - s_wp, s_ym]
        ], np.int32)
        
        # Create alpha channel mask for the hexagon shape
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(mask, [pts], 255)
        
        # Convert to BGRA (4 channels)
        rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        rgba[:, :, 3] = mask
        
        # Crop to the bounding box of the hexagon
        bbox_x1 = s_xc - s_wp
        bbox_x2 = s_xc + s_wp
        bbox_y1 = s_yt
        bbox_y2 = s_yb
        cropped = rgba[bbox_y1:bbox_y2, bbox_x1:bbox_x2]
        
        # Calculate target height keeping aspect ratio
        crop_h, crop_w = cropped.shape[:2]
        target_height = int(target_width * (crop_h / crop_w))
        
        # Resize to standard size using cubic interpolation for best quality
        resized = cv2.resize(cropped, (target_width, target_height), interpolation=cv2.INTER_CUBIC)
        
        # Save to output folder
        out_path = os.path.join(output_dir, f)
        cv2.imwrite(out_path, resized)
        print(f"Successfully processed '{f}' -> '{out_path}' ({target_width}x{target_height})")
        success_count += 1
        
    print(f"\nProcessing complete! Successfully extracted {success_count}/{len(files)} tiles.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract inner hexagon game tiles from concept art frames.")
    parser.add_argument("--input-dir", "-i", default="concept art", help="Path to input directory containing concept art")
    parser.add_argument("--output-dir", "-o", default="game tiles", help="Path to output directory to save game tiles")
    parser.add_argument("--width", "-w", type=int, default=512, help="Uniform target width of output tiles")
    parser.add_argument("--tightness", "-t", type=int, choices=[90, 95, 100], default=100, 
                        help="Crop tightness level (90=looser, 95=medium, 100=tightest to avoid border)")
                        
    args = parser.parse_args()
    
    extract_hex_tiles(args.input_dir, args.output_dir, args.width, args.tightness)
