import os
import shutil

temp_files = [
    "inspect_images.py",
    "analyze_image.py",
    "detect_hexagon.py",
    "find_hexagon_bounds.py",
    "mask_gold.py",
    "test_coords.py",
    "crop_test.py",
    "optimize_hexagon.py",
    "optimize_clean_mask.py",
    "crop_manual.py",
    "test_all_concept_art.py",
    "check_coords.png",
    "debug_contours.png",
    "gold_mask.png",
    "gold_mask_cleaned.png",
    "crop_blue_coords.png",
    "crop_green_coords.png",
    "crop_red_coords.png",
    "crop_tight_90.png",
    "crop_tight_95.png",
    "crop_tight_100.png"
]

temp_dirs = [
    "test_outputs"
]

print("Cleaning up temporary development files:")

for f in temp_files:
    if os.path.exists(f):
        try:
            os.remove(f)
            print(f"  Removed file: {f}")
        except Exception as e:
            print(f"  Failed to remove file {f}: {e}")

for d in temp_dirs:
    if os.path.exists(d):
        try:
            shutil.rmtree(d)
            print(f"  Removed directory: {d}")
        except Exception as e:
            print(f"  Failed to remove directory {d}: {e}")

print("Done cleaning!")
