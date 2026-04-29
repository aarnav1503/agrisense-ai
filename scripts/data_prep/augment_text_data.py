import os
import pandas as pd
import random

# =========================
# PATHS
# =========================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, "data", "symptoms", "symptoms_data.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "symptoms", "symptoms_data_augmented.csv")

df = pd.read_csv(DATA_PATH)

augmented_rows = []

# simple synonym replacements
synonyms = {
    "yellow": ["yellowish", "pale yellow", "light yellow"],
    "brown": ["dark brown", "brownish", "dry brown"],
    "spots": ["patches", "marks", "lesions"],
    "leaves": ["leaf", "foliage"],
    "plant": ["crop", "plant", "tree"],
    "dark": ["blackish", "very dark", "deep dark"]
}

def augment_text(text):
    words = text.split()
    new_words = []

    for word in words:
        if word in synonyms and random.random() < 0.5:
            new_words.append(random.choice(synonyms[word]))
        else:
            new_words.append(word)

    return " ".join(new_words)

# generate augmented data
for _, row in df.iterrows():
    original_text = row["symptoms"]
    label = row["label"]

    for _ in range(3):  # generate 3 variations per row
        new_text = augment_text(original_text)
        augmented_rows.append({"symptoms": new_text, "label": label})

# combine original + augmented
new_df = pd.concat([df, pd.DataFrame(augmented_rows)], ignore_index=True)

# shuffle
new_df = new_df.sample(frac=1).reset_index(drop=True)

# save
new_df.to_csv(OUTPUT_PATH, index=False)

print("Augmented dataset created:", new_df.shape)