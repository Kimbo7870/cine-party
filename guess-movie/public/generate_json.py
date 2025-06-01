import json
from pathlib import Path

def generate_data_json():
    videos_dir = Path("videos_mov")
    images_dir = Path("images")
    videos_output = Path("data/data.json")
    images_output = Path("data/data2.json")
    videos_data = []
    images_data = []
    # make video json
    video_extensions = ['.mov', '.MOV', '.mp4', '.MP4']
    video_files = []
    for ext in video_extensions:
        video_files.extend(videos_dir.glob(f"*{ext}"))
    for video_file in sorted(video_files):
        title = video_file.stem
        file_path = f"/videos_mov/{video_file.name}"
        video_entry = {
            "title": title,
            "file": file_path,
            "dimension": "vertical"
        }
        videos_data.append(video_entry)
    # make image json
    image_extensions = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG']
    image_files = []
    for ext in image_extensions:
        image_files.extend(images_dir.glob(f"*{ext}"))
    for image_file in sorted(image_files):
        title = image_file.stem
        file_path = f"/images/{image_file.name}"
        image_entry = {
            "title": title,
            "file": file_path,
            "dimension": "vertical"
        }
        images_data.append(image_entry)
    with open(videos_output, 'w', encoding='utf-8') as f:
        json.dump(videos_data, f, indent=2, ensure_ascii=False)
    with open(images_output, 'w', encoding='utf-8') as f:
        json.dump(images_data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    print("\nMaking the data...")
    generate_data_json()