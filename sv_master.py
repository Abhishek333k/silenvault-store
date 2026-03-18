import os
import sys
import csv
import shutil
import json
import time
import PIL.Image
from google import genai
from google.genai import types

# --- WINDOWS SOUND ALARM ---
try:
    import winsound
    HAS_WINSOUND = True
except ImportError:
    HAS_WINSOUND = False

# --- CONFIGURATION ---
API_KEY = "AIzaSyDwUjqS2bkv-ixoG3HviVY8HsWL6znE_RQ"  # <-- YOUR GEMINI KEY
MODEL_ID = "gemini-2.5-flash"
WATERMARK_FILE = "watermark.png"  
WATERMARK_OPACITY = 120 
WATERMARK_SCALE = 0.4 

client = genai.Client(api_key=API_KEY)

def trigger_qa_alarm(reason):
    """Fires a high-pitched dual-tone siren and prints a red warning."""
    print(f"\n\033[91m[🚨 CRITICAL QA ALERT] DEFECTIVE MEDIA REJECTED!\033[0m")
    print(f"\033[91m  --> AI REASON: {reason}\033[0m")
    
    if HAS_WINSOUND:
        for _ in range(3):
            winsound.Beep(2500, 400) # 2500Hz for 400ms
            winsound.Beep(2000, 400) # 2000Hz for 400ms
            time.sleep(0.1)

def apply_watermark(image_path, output_path):
    """Downscales to 1080p and stamps the watermark with MAX WebP quality."""
    try:
        wm_original = PIL.Image.open(WATERMARK_FILE).convert("RGBA")
        alpha = wm_original.split()[3]
        alpha = alpha.point(lambda p: p * (WATERMARK_OPACITY / 255.0))
        wm_original.putalpha(alpha)

        with PIL.Image.open(image_path) as img:
            if img.mode != 'RGBA':
                img = img.convert('RGBA')

            img.thumbnail((1920, 1080), PIL.Image.Resampling.LANCZOS)
            base_w, base_h = img.size

            wm_w_new = int(base_w * WATERMARK_SCALE)
            wm_ratio = wm_w_new / float(wm_original.size[0])
            wm_h_new = int(float(wm_original.size[1]) * wm_ratio)
            
            wm_resized = wm_original.resize((wm_w_new, wm_h_new), PIL.Image.Resampling.LANCZOS)

            pos_x = (base_w - wm_w_new) // 2
            pos_y = (base_h - wm_h_new) // 2

            transparent = PIL.Image.new('RGBA', (base_w, base_h), (0,0,0,0))
            transparent.paste(img, (0,0))
            transparent.paste(wm_resized, (pos_x, pos_y), mask=wm_resized)

            final_image = transparent.convert('RGB')
            # STUDIO UPGRADE: quality=95 and method=6 prevents severe quality drops
            final_image.save(output_path, "WEBP", quality=95, method=6)
            return True
    except Exception as e:
        print(f"  --> [WATERMARK ERROR] {e}")
        return False

def process_master_pipeline(folder_path):
    print(f"\n==================================================")
    print(f"  INITIATING SILENVAULT 'TRUE AUDIT' & QA PIPELINE")
    print(f"  Target: {folder_path}")
    print(f"==================================================\n")
    
    if not os.path.exists(WATERMARK_FILE):
        print(f"[CRITICAL ERROR] '{WATERMARK_FILE}' not found. Please place your transparent logo next to this script.")
        return

    folder_name = os.path.basename(folder_path)
    csv_file_path = os.path.join(folder_path, f"{folder_name}_seo_log.csv")
    
    # 1. Gather all file types for a TRUE AUDIT
    all_files = os.listdir(folder_path)
    images_to_process = [f for f in all_files if f.lower().endswith(('.png', '.jpg', '.jpeg')) and not f.startswith('sv-') and not f[0].isdigit()]
    videos_to_process = [f for f in all_files if f.lower().endswith(('.mp4', '.webm')) and not f.startswith('sv-') and not f[0].isdigit()]
    text_to_process = [f for f in all_files if f.lower().endswith(('.txt', '.md', '.json')) and not f.endswith('.csv')]
    
    if not images_to_process and not videos_to_process and not text_to_process:
        print("[INFO] No valid raw media or code files found. Pipeline aborted.")
        return

    # --- PHASE 1: DISCOVERY & INGESTION ---
    print("\n[PHASE 1] Deep Ingestion (Uploading to AI Core)...")
    contents = []
    opened_images = []
    api_uploaded_files = [] 
    
    prompt = """You are a Senior Digital Asset Manager, Technical Auditor, and strict QA Inspector for SilenVault. 
    You are performing a 'True Audit' on a folder of digital assets. I have provided images, videos, and/or text/code files.
    
    YOUR DIRECTIVES:
    1. TRUE AUDIT: Do not guess. Watch the videos. Read the code/text. Look at the images. What is this product actually doing? 
    2. THE HERO DECISION (RANKING): Rate the visual media (images/videos) from most stunning/impactful to least. 
    3. SURGICAL RENAMING: Generate a highly descriptive SEO filename for EACH media file based on its actual content.
       - RULE A: Prefix the new filename with its ranking number. The absolute best asset MUST start with '01-sv-', the second '02-sv-', etc.
       - RULE B: MUST be lowercase, use hyphens instead of spaces, NO special characters. Keep the original extension.
    4. STRICT QA INSPECTION: Look closely at the visual fidelity. Are any images incredibly blurry, heavily artifacted, broken, or purely garbage/mistakes? If so, flag them in the bad_files list.
    5. QUALITY ASSESSMENT: Decide if this bundle is 'Premium' or 'Free'. Do not just say Premium. If it looks simple, basic, or small, tag it as 'Free'. If it is high-fidelity, complex, or a large bundle, tag it as 'Premium'.
    6. SEO METADATA: Generate a highly accurate Title, a 2-sentence precise Description based on the audit, and exactly 10 SmartTags (mix of keywords, style, and format).
    
    OUTPUT FORMAT: Strictly JSON matching this schema.
    {
      "qa_report": {
        "has_garbage_files": false,
        "bad_files": ["example_bad_file.jpg"],
        "reason": "Explain exactly why they failed QA."
      },
      "metadata": {
        "title": "Exact Title Here",
        "description": "2-sentence factual description here.",
        "type": "Free or Premium",
        "smartTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"
      },
      "renames": {
        "original_file_1.jpg": "01-sv-actual-visual-description-1.jpg",
        "original_file_2.mp4": "02-sv-actual-video-description-2.mp4"
      }
    }"""
    contents.append(prompt)

    # Ingest Videos
    for v_file in videos_to_process:
        v_path = os.path.join(folder_path, v_file)
        print(f"  --> [UPLOADING VIDEO] {v_file} to Gemini Server...")
        try:
            uploaded_file = client.files.upload(file=v_path)
            while uploaded_file.state.name == "PROCESSING":
                print("      ...processing video on server...")
                time.sleep(3)
                uploaded_file = client.files.get(name=uploaded_file.name)
            
            contents.extend([f"\nVideo Filename: {v_file}", uploaded_file])
            api_uploaded_files.append(uploaded_file)
            print(f"      Video Ready for Audit.")
        except Exception as e:
            print(f"  --> [VIDEO ERROR] Could not upload {v_file}: {e}")

    # Ingest Text/Code
    for t_file in text_to_process:
        t_path = os.path.join(folder_path, t_file)
        try:
            with open(t_path, 'r', encoding='utf-8') as f:
                contents.append(f"\n--- TEXT/CODE FILE: {t_file} ---\n{f.read()}\n-----------------------")
        except: pass

    # Ingest Images 
    for filename in images_to_process[:40]: 
        file_path = os.path.join(folder_path, filename)
        try:
            img = PIL.Image.open(file_path)
            img.thumbnail((768, 768))
            if img.mode != 'RGB': img = img.convert('RGB')
            contents.extend([f"\nImage Filename: {filename}", img])
            opened_images.append(img)
            print(f"  --> [INGESTED IMAGE] {filename}")
        except Exception as e: pass

    # --- PHASE 2: AI AUDIT ---
    print("\n[PHASE 2] Executing Deep Neural Audit & QA Check...")
    try:
        response = client.models.generate_content(
            model=MODEL_ID, contents=contents,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        for img in opened_images: img.close()
            
        result_json = json.loads(response.text)
        qa_report = result_json.get("qa_report", {})
        metadata = result_json.get("metadata", {})
        renames = result_json.get("renames", {})
        
        # --- THE QA GATEKEEPER ---
        bad_files_list = qa_report.get("bad_files", [])
        if qa_report.get("has_garbage_files") and len(bad_files_list) > 0:
            trigger_qa_alarm(qa_report.get("reason", "Low quality detected."))
            print(f"\033[91m  --> THE FOLLOWING FILES FAILED QA AND ARE BANNED FROM THE ZIP: {bad_files_list}\033[0m")
        else:
            print("\n[QA PASSED] All assets meet SilenVault aesthetic standards.")

        # --- PHASE 3: RENAMING & ORGANIZATION ---
        print("\n[PHASE 3] Applying Audit Results & Art Director Rankings...")
        final_file_list = []
        files_to_zip = []

        for old_name, new_name in renames.items():
            # SKIP BAD FILES!
            if old_name in bad_files_list:
                print(f"  --> [REJECTED] {old_name} was left behind in the dirt.")
                continue

            old_path = os.path.join(folder_path, old_name)
            if not os.path.exists(old_path): continue

            original_ext = os.path.splitext(old_name)[1].lower()
            ai_base_name = os.path.splitext(new_name)[0]
            new_path = os.path.join(folder_path, f"{ai_base_name}{original_ext}")
            os.rename(old_path, new_path)
            
            final_file_name = f"{ai_base_name}{original_ext}"
            final_file_list.append(final_file_name)
            files_to_zip.append(final_file_name)
            print(f"  --> [APPROVED & RENAMED] {old_name} -> {final_file_name}")

        files_to_zip.extend(text_to_process)

        # --- PHASE 4: PACKAGING HIGH-RES ZIP (LOCAL EXPORT) ---
        print("\n[PHASE 4] Packaging High-Res Lemon Squeezy Bundle...")
        zip_filename = os.path.join(folder_path, f"SV_{folder_name}_Bundle")
        temp_dir = os.path.join(folder_path, "temp_zip_build")
        os.makedirs(temp_dir, exist_ok=True)
        
        readme_path = os.path.join(temp_dir, "READ_ME_FIRST.txt")
        title = metadata.get("title", f"{folder_name.replace('_', ' ').title()} Bundle")
        asset_type = metadata.get("type", "Premium")
        with open(readme_path, "w", encoding="utf-8") as readme:
            readme.write(f"=========================================\n")
            readme.write(f"  {title.upper()}\n")
            readme.write(f"  A {asset_type} Asset by SilenVault\n")
            readme.write(f"=========================================\n\n")
            readme.write(f"Thank you for your support. This asset pack was carefully engineered to elevate your digital workspace.\n\n")
            readme.write(f"DISCOVER MORE ASSSETS:\nhttps://silenvault.com/store\n\n")
            readme.write(f"SUPPORT & CUSTOM REQUESTS:\nsupport@silenvault.com\n\n")
            readme.write(f"LICENSE AGREEMENT:\nThese assets are for personal use. Do not resell or redistribute the raw files.\n")
            readme.write(f"=========================================\n")
            readme.write(f"SilenVault // All systems operational.\n")
            
        for filename in files_to_zip:
            shutil.copy(os.path.join(folder_path, filename), temp_dir)
            
        shutil.make_archive(zip_filename, 'zip', temp_dir)
        shutil.rmtree(temp_dir)
        print(f"  --> [ZIP CREATED LOCALLY] {os.path.basename(zip_filename)}.zip")

        # --- PHASE 5: VAULT GUARD (WATERMARK & CLEANUP) ---
        print("\n[PHASE 5] Vault Guard: Generating Web Previews & Deleting Raw Images...")
        for filename in final_file_list:
            old_path = os.path.join(folder_path, filename)
            
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                new_webp_path = os.path.join(folder_path, os.path.splitext(filename)[0] + ".webp")
                if apply_watermark(old_path, new_webp_path):
                    os.remove(old_path) 
                    print(f"  --> [SECURED & REPLACED] {os.path.basename(new_webp_path)}")
            elif filename.lower().endswith(('.mp4', '.webm')):
                print(f"  --> [VIDEO PRESERVED FOR WEB UI] {filename}")

        # --- PHASE 6: CSV METADATA LOGGING ---
        desc = metadata.get("description", "A digital asset collection by SilenVault.")
        smart_tags = metadata.get("smartTags", "digital, asset")
        
        path_parts = folder_path.replace("\\", "/").split("silenvault-store/")
        repo_path = "assets/products/" + folder_name if len(path_parts) == 1 else path_parts[-1]
        
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Status", "ID", "Title", "Description", "Price", "Type", "Tag", "Images", "Included Files", "SmartTags"])
            writer.writerow(["Draft", folder_name, title, desc, "", asset_type, "", repo_path, f"{len(files_to_zip)} Files", smart_tags])
            
        print(f"\n[SUCCESS] Master Pipeline Complete. CSV Logged.")
        
    except Exception as e:
        print(f"\n[CRITICAL ERROR] Pipeline Failed: {e}")
        
    finally:
        print("\n[CLEANUP] Wiping temporary files from AI Core...")
        for api_file in api_uploaded_files:
            try:
                client.files.delete(name=api_file.name)
                print(f"  --> Deleted {api_file.name}")
            except: pass

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1].strip('"').strip("'")
    else:
        target = input("Drop folder path here: ").strip('"').strip("'")
        
    if os.path.isdir(target):
        process_master_pipeline(target)
    else:
        print("[ERROR] Invalid directory path.")