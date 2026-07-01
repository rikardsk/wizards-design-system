#!/usr/bin/env python3
import os
import cv2
import numpy as np

def extract_circular_creatures(input_dir, output_dir, target_size=512):
    """
    Extracts central circular region from PNG images in input_dir and saves them
    as transparent circular images of size target_size x target_size in output_dir.
    """
    if not os.path.exists(input_dir):
        # Check case variation
        if input_dir.lower() == "concept art/creatures":
            alt_dir = "concept art/Creatures"
            if os.path.exists(alt_dir):
                input_dir = alt_dir
            else:
                print(f"Error: Input directory '{input_dir}' does not exist.")
                return False
        else:
            print(f"Error: Input directory '{input_dir}' does not exist.")
            return False
            
    os.makedirs(output_dir, exist_ok=True)
    
    # Gather PNG files
    files = [f for f in os.listdir(input_dir) if f.lower().endswith('.png')]
    if not files:
        print(f"No PNG files found in '{input_dir}'.")
        return False
        
    print(f"Found {len(files)} creature images in '{input_dir}'.")
    print(f"Target size = {target_size}x{target_size}px (circular crop with transparent background)\n")
    
    success_count = 0
    
    for f in sorted(files):
        img_path = os.path.join(input_dir, f)
        img = cv2.imread(img_path)
        if img is None:
            print(f"Failed to read '{f}'. Skipping.")
            continue
            
        h, w, _ = img.shape
        
        # Center coordinates
        xc, yc = w // 2, h // 2
        
        # Circular radius - base is 280px for 768px height (approx 36.5% of height)
        r = int(h * 280 / 768)
        
        # Create alpha channel mask for the circle shape
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.circle(mask, (xc, yc), r, 255, -1)
        
        # Convert to BGRA (4 channels)
        rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        rgba[:, :, 3] = mask
        
        # Crop to the bounding box of the circle
        bbox_x1 = max(0, xc - r)
        bbox_x2 = min(w, xc + r)
        bbox_y1 = max(0, yc - r)
        bbox_y2 = min(h, yc + r)
        cropped = rgba[bbox_y1:bbox_y2, bbox_x1:bbox_x2]
        
        # Resize to standard size (target_size x target_size) using cubic interpolation
        resized = cv2.resize(cropped, (target_size, target_size), interpolation=cv2.INTER_CUBIC)
        
        # Save to output folder
        out_path = os.path.join(output_dir, f)
        cv2.imwrite(out_path, resized)
        print(f"Successfully processed '{f}' -> '{out_path}'")
        success_count += 1
        
    print(f"\nProcessing complete! Successfully extracted {success_count}/{len(files)} creatures.")
    return True

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extract circular creatures from concept art frames.")
    parser.add_argument("--input-dir", "-i", default="concept art/Creatures", help="Path to input directory containing creature art")
    parser.add_argument("--output-dir", "-o", default="creatures", help="Path to output directory to save circular creatures")
    parser.add_argument("--size", "-s", type=int, default=512, help="Target size (width and height) of output creature tokens")
    
    args = parser.parse_args()
    
    extract_circular_creatures(args.input_dir, args.output_dir, args.size)
