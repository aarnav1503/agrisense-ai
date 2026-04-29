import joblib
import numpy as np
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODEL_PATH = os.path.join(BASE_DIR, "models", "text_symptom_model.pkl")

model = joblib.load(MODEL_PATH)

text = input("Describe crop and symptoms: ").strip().lower()

if len(text.split()) < 4:
    print("\nPlease describe symptoms in more detail.")
    print("Example: yellow curling leaves on tomato plant")
    exit()

pred = model.predict([text])[0]
probs = model.predict_proba([text])[0]
top_idxs = np.argsort(probs)[-3:][::-1]
classes = model.classes_

print("\nTop Predictions:")
for i in top_idxs:
    label = classes[i]
    prob = probs[i]

    crop, disease = label.split("___")
    crop = crop.replace("_", " ")
    disease = disease.replace("_", " ")

    print(f"{crop} - {disease} : {prob*100:.2f}%")

crop_keywords = [
    "tomato", "potato", "corn", "maize", "apple", "grape", "peach",
    "pepper", "bell pepper", "strawberry", "squash", "soybean",
    "raspberry", "orange", "citrus", "blueberry", "cherry"
]

symptom_keywords = [
    "spot", "spots", "patch", "patches", "lesion", "lesions", "mold",
    "powder", "curl", "curling", "rust", "blight", "yellow", "brown",
    "black", "orange", "dry", "rotting", "mosaic", "specks"
]

has_crop = any(word in text for word in crop_keywords)
symptom_count = sum(1 for word in symptom_keywords if word in text)

if probs[top_idxs[0]] < 0.20 or not has_crop or symptom_count < 2:
    print("\nLow confidence. Please provide:")
    print("- crop name")
    print("- clearer symptoms like spots / curling / mold / color")
    print("- or upload a close-up leaf image")