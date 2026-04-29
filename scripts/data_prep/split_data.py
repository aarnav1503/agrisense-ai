import os
import random
import shutil
from pathlib import Path

random.seed(42)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DIR = BASE_DIR / "data/raw"
TRAIN_DIR = BASE_DIR / "data/train"
VALID_DIR = BASE_DIR / "data/valid"
TEST_DIR = BASE_DIR / "data/test"

TRAIN_RATIO = 0.7
VALID_RATIO = 0.15
TEST_RATIO = 0.15

for folder in [TRAIN_DIR, VALID_DIR, TEST_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

for class_dir in RAW_DIR.iterdir():
    if not class_dir.is_dir():
        continue

    images = [img for img in class_dir.iterdir() if img.is_file()]
    random.shuffle(images)

    total = len(images)
    train_count = int(total * TRAIN_RATIO)
    valid_count = int(total * VALID_RATIO)

    train_images = images[:train_count]
    valid_images = images[train_count:train_count + valid_count]
    test_images = images[train_count + valid_count:]

    (TRAIN_DIR / class_dir.name).mkdir(parents=True, exist_ok=True)
    (VALID_DIR / class_dir.name).mkdir(parents=True, exist_ok=True)
    (TEST_DIR / class_dir.name).mkdir(parents=True, exist_ok=True)

    for img in train_images:
        shutil.copy(img, TRAIN_DIR / class_dir.name / img.name)

    for img in valid_images:
        shutil.copy(img, VALID_DIR / class_dir.name / img.name)

    for img in test_images:
        shutil.copy(img, TEST_DIR / class_dir.name / img.name)

    print(f"{class_dir.name}: train={len(train_images)}, valid={len(valid_images)}, test={len(test_images)}")

print("\nDataset split completed successfully.")