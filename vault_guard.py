import os
import sys
from PIL import Image

# --- CONFIGURATION ---
WATERMARK_FILE = "watermark.png"  # Make sure this exists in the same folder as this script
TARGET_RESOLUTION = (1920, 1080)  # Max bounds for web previews
WATERMARK_OPACITY = 120  # 0 is invisible, 255 is solid (120 is a nice glass effect)
WATERMARK_SCALE = 0.4  # Watermark will take up 40% of the image width

def apply_watermark(folder_path):
    print(f"\n==================================================")
    print(f"  INITIATING VAULT GUARD (WATERMARK ENGINE)")
    print(f"  Target: {folder_path}")
    print(f"==================================================\n")

    if not os.path.exists(WATERMARK_FILE):
        print(f"[CRITICAL ERROR] '{WATERMARK_FILE}' not found. Please place your transparent logo next to this script.")
        return

    # Create the output directory
    output_dir = os.path.join(folder_path, "Web_Previews")
    os.makedirs(output_dir, exist_ok=True)

    # Load the watermark
    wm_original = Image.open(WATERMARK_FILE).convert("RGBA")

    # Adjust watermark opacity
    alpha = wm_original.split()[3]
    alpha = alpha.point(lambda p: p * (WATERMARK_OPACITY / 255.0))
    wm_original.putalpha(alpha)

    processed_count = 0

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            file_path = os.path.join(folder_path, filename)
            
            try:
                with Image.open(file_path) as img:
                    # Convert to RGBA for compositing
                    if img.mode != 'RGBA':
                        img = img.convert('RGBA')

                    # 1. Resize the image for web performance (maintaining aspect ratio)
                    img.thumbnail(TARGET_RESOLUTION, Image.Resampling.LANCZOS)
                    base_w, base_h = img.size

                    # 2. Dynamically scale the watermark to fit the current image
                    wm_w_new = int(base_w * WATERMARK_SCALE)
                    wm_ratio = wm_w_new / float(wm_original.size[0])
                    wm_h_new = int(float(wm_original.size[1]) * wm_ratio)
                    
                    wm_resized = wm_original.resize((wm_w_new, wm_h_new), Image.Resampling.LANCZOS)

                    # 3. Calculate center position
                    pos_x = (base_w - wm_w_new) // 2
                    pos_y = (base_h - wm_h_new) // 2

                    # 4. Stamp the watermark
                    transparent = Image.new('RGBA', (base_w, base_h), (0,0,0,0))
                    transparent.paste(img, (0,0))
                    transparent.paste(wm_resized, (pos_x, pos_y), mask=wm_resized)

                    # 5. Save as optimized WebP
                    output_filename = os.path.splitext(filename)[0] + ".webp"
                    output_path = os.path.join(output_dir, output_filename)
                    
                    # Convert back to RGB to save as WebP/JPEG
                    final_image = transparent.convert('RGB')
                    final_image.save(output_path, "WEBP", quality=85)
                    
                    print(f"  --> [SECURED] {output_filename}")
                    processed_count += 1

            except Exception as e:
                print(f"  --> [ERROR] Failed to process {filename}: {e}")

    print(f"\n[SUCCESS] Vault Guard secured {processed_count} images in the 'Web_Previews' folder.")
    print("Upload THESE webp files to GitHub for your website UI!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1].strip('"').strip("'")
    else:
        target = input("Drop folder path here to secure: ").strip('"').strip("'")
        
    if os.path.isdir(target):
        apply_watermark(target)
    else:
        print("[ERROR] Invalid directory path.")