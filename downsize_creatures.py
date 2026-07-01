#!/usr/bin/env python3
import os
import cv2

def downsize_tokens(input_dir, output_dir, scale_percent=10):
    if not os.path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        return False
        
    os.makedirs(output_dir, exist_ok=True)
    
    files = [f for f in os.listdir(input_dir) if f.lower().endswith('.png')]
    if not files:
        print(f"No PNG files found in '{input_dir}'.")
        return False
        
    print(f"Downsizing creature tokens in '{input_dir}' to {scale_percent}%...")
    success_count = 0
    
    for f in sorted(files):
        img_path = os.path.join(input_dir, f)
        img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED) # Load with alpha channel
        if img is None:
            print(f"Failed to read '{f}'. Skipping.")
            continue
            
        h, w = img.shape[:2]
        new_w = int(w * scale_percent / 100.0)
        new_h = int(h * scale_percent / 100.0)
        
        # Ensure at least 1x1
        new_w = max(1, new_w)
        new_h = max(1, new_h)
        
        # Resize using area interpolation (best for shrinking images)
        resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        out_path = os.path.join(output_dir, f)
        cv2.imwrite(out_path, resized)
        print(f"Resized '{f}' from {w}x{h} -> {new_w}x{new_h}")
        success_count += 1
        
    print(f"\nCompleted! Successfully downsized {success_count}/{len(files)} creature tokens to '{output_dir}'.")
    return True

if __name__ == "__main__":
    downsize_tokens("creatures", "creatures small", 10)
