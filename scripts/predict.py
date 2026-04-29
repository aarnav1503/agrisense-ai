import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
import re
import torch.nn as nn
from src.rag_query import build_rag_answer
import joblib
import numpy as np
from PIL import Image
from torchvision import models, transforms

# =========================
# PATHS
# =========================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IMAGE_MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_disease_resnet18.pth")
TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "text_symptom_model.pkl")
IMAGE_PATH = os.path.join(BASE_DIR, "data", "image.png")   # keep your test image with this name
IMAGE_SIZE = 224

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =========================
# LOAD IMAGE MODEL
# =========================
image_checkpoint = torch.load(IMAGE_MODEL_PATH, map_location=DEVICE, weights_only=False)
class_names = image_checkpoint["class_names"]
num_classes = len(class_names)

image_model = models.resnet18(weights=None)
image_model.fc = nn.Linear(image_model.fc.in_features, num_classes)
image_model.load_state_dict(image_checkpoint["model_state_dict"])
image_model = image_model.to(DEVICE)
image_model.eval()

# =========================
# LOAD TEXT MODEL
# =========================
text_model = joblib.load(TEXT_MODEL_PATH)
text_classes = list(text_model.classes_)

# =========================
# IMAGE TRANSFORM
# =========================
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# =========================
# USER INPUT
# =========================
text_input = input("Describe crop and symptoms (or press Enter to skip): ").strip().lower()

# =========================
# HELPERS
# =========================
crop_aliases = {
    "tomato": "Tomato",
    "potato": "Potato",
    "corn": "Corn_(maize)",
    "maize": "Corn_(maize)",
    "apple": "Apple",
    "grape": "Grape",
    "orange": "Orange",
    "citrus": "Orange",
    "peach": "Peach",
    "pepper": "Pepper,_bell",
    "bell pepper": "Pepper,_bell",
    "strawberry": "Strawberry",
    "squash": "Squash",
    "soybean": "Soybean",
    "raspberry": "Raspberry",
    "blueberry": "Blueberry",
    "cherry": "Cherry_(including_sour)"
}

strong_symptom_keywords = [
    "rust", "curl", "curling", "mold", "powder", "powdery", "blight",
    "lesion", "lesions", "spots", "spot", "patches", "patch", "mosaic",
    "specks", "webbing", "rotting", "wet", "scorch"
]

disease_keyword_bonus = {
    "rust": ["Common_rust_", "Cedar_apple_rust"],
    "curl": ["Tomato_Yellow_Leaf_Curl_Virus"],
    "curling": ["Tomato_Yellow_Leaf_Curl_Virus"],
    "powder": ["Powdery_mildew"],
    "powdery": ["Powdery_mildew"],
    "mosaic": ["Tomato_mosaic_virus"],
    "blight": ["Early_blight", "Late_blight", "Northern_Leaf_Blight"],
    "scorch": ["Leaf_scorch"],
    "mites": ["Spider_mites"],
    "webbing": ["Spider_mites"],
    "mold": ["Leaf_Mold"],
    "spot": ["Bacterial_spot", "Septoria_leaf_spot", "Target_Spot", "Gray_leaf_spot"],
    "spots": ["Bacterial_spot", "Septoria_leaf_spot", "Target_Spot", "Gray_leaf_spot"],
}

keyword_strength = {
    "rust": 0.10,
    "curl": 0.10,
    "curling": 0.10,
    "powder": 0.08,
    "powdery": 0.08,
    "mosaic": 0.10,
    "blight": 0.07,
    "scorch": 0.08,
    "mites": 0.08,
    "webbing": 0.08,
    "mold": 0.07,
    "spot": 0.03,
    "spots": 0.03,
}

def detect_crop_from_text(text):
    text = text.lower()
    for key, value in crop_aliases.items():
        if re.search(rf"\b{re.escape(key)}\b", text):
            return value
    return None

def count_strong_keywords(text):
    words = set(re.findall(r"\b[a-zA-Z_]+\b", text.lower()))
    keyword_set = set(strong_symptom_keywords)
    return len(words & keyword_set)

def pretty_label(label):
    crop, disease = label.split("___")
    crop = crop.replace("_", " ")
    disease = disease.replace("_", " ")
    return crop, disease

def apply_keyword_bonus(final_probs, text):
    words = set(re.findall(r"\b[a-zA-Z_]+\b", text.lower()))
    bonus_probs = final_probs.copy()

    for word in words:
        if word in disease_keyword_bonus:
            targets = disease_keyword_bonus[word]
            strength = keyword_strength.get(word, 0.05)

            for cls in bonus_probs:
                for target in targets:
                    if target in cls:
                        bonus_probs[cls] += strength

    total = sum(bonus_probs.values())
    if total > 0:
        bonus_probs = {cls: prob / total for cls, prob in bonus_probs.items()}

    return bonus_probs

# =========================
# DYNAMIC WEIGHTS
# =========================
detected_crop = detect_crop_from_text(text_input) if text_input else None
keyword_count = count_strong_keywords(text_input) if text_input else 0

if detected_crop and text_input and keyword_count >= 2:
    IMAGE_WEIGHT = 0.35
    TEXT_WEIGHT = 0.65
elif text_input and keyword_count >= 2:
    IMAGE_WEIGHT = 0.45
    TEXT_WEIGHT = 0.55
elif text_input and keyword_count == 1:
    IMAGE_WEIGHT = 0.75
    TEXT_WEIGHT = 0.25
else:
    IMAGE_WEIGHT = 0.90
    TEXT_WEIGHT = 0.10

# =========================
# IMAGE PREDICTION
# =========================
image_probs_dict = {cls: 0.0 for cls in class_names}
image_available = False

try:
    image = Image.open(IMAGE_PATH).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = image_model(image_tensor)
        probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]

    for cls, prob in zip(class_names, probs):
        image_probs_dict[cls] = float(prob)

    image_available = True
except Exception:
    image_available = False

if image_available:
    image_sorted = sorted(image_probs_dict.items(), key=lambda x: x[1], reverse=True)[:3]
    print("\nImage Model Top Predictions:")
    for i, (label, prob) in enumerate(image_sorted, start=1):
        crop, disease = pretty_label(label)
        print(f"{i}. {crop} - {disease} : {prob*100:.2f}%")

# =========================
# TEXT PREDICTION
# =========================
text_probs_dict = {cls: 0.0 for cls in class_names}
text_available = False

if text_input:
    probs = text_model.predict_proba([text_input])[0]
    for cls, prob in zip(text_classes, probs):
        if cls in text_probs_dict:
            text_probs_dict[cls] = float(prob)
    text_available = True

if text_available:
    text_sorted = sorted(text_probs_dict.items(), key=lambda x: x[1], reverse=True)[:3]
    print("\nText Model Top Predictions:")
    for i, (label, prob) in enumerate(text_sorted, start=1):
        crop, disease = pretty_label(label)
        print(f"{i}. {crop} - {disease} : {prob*100:.2f}%")

# =========================
# COMBINE LOGIC
# =========================
final_probs = {}

if image_available and text_available:
    for cls in class_names:
        final_probs[cls] = (IMAGE_WEIGHT * image_probs_dict[cls]) + (TEXT_WEIGHT * text_probs_dict[cls])
elif image_available:
    final_probs = image_probs_dict.copy()
elif text_available:
    final_probs = text_probs_dict.copy()
else:
    print("No image or text input provided.")
    exit()

# =========================
# CROP FILTERING
# =========================
if detected_crop:
    filtered_probs = {
        cls: prob for cls, prob in final_probs.items()
        if cls.startswith(detected_crop + "___")
    }

    if filtered_probs:
        total = sum(filtered_probs.values())
        if total > 0:
            final_probs = {cls: prob / total for cls, prob in filtered_probs.items()}
        else:
            final_probs = filtered_probs

# =========================
# KEYWORD BONUS
# =========================
if text_input:
    final_probs = apply_keyword_bonus(final_probs, text_input)

# =========================
# SORT TOP RESULTS
# =========================
sorted_preds = sorted(final_probs.items(), key=lambda x: x[1], reverse=True)[:3]

print("\nTop Hybrid Predictions:")
for i, (label, prob) in enumerate(sorted_preds, start=1):
    crop, disease = pretty_label(label)
    print(f"{i}. {crop} - {disease} : {prob*100:.2f}%")

# =========================
# AGREEMENT CHECK
# =========================
image_top_label = max(image_probs_dict, key=image_probs_dict.get) if image_available else None
text_top_label = max(text_probs_dict, key=text_probs_dict.get) if text_available else None
final_top_label = sorted_preds[0][0]
final_top_prob = sorted_preds[0][1]

image_crop = image_top_label.split("___")[0] if image_top_label else None
text_crop = text_top_label.split("___")[0] if text_top_label else None

same_crop = (image_crop == text_crop) if image_crop and text_crop else False
same_label = (image_top_label == text_top_label) if image_top_label and text_top_label else False

print("\nFinal Diagnosis:")
crop, disease = pretty_label(final_top_label)
print(f"- Likely Crop: {crop}")
print(f"- Likely Disease: {disease}")
print(f"- Confidence Score: {final_top_prob*100:.2f}%")

print("\nDecision Info:")
print(f"- Detected crop from text: {detected_crop if detected_crop else 'Not found'}")
print(f"- Text specificity keywords found: {keyword_count}")
print(f"- Fusion weights -> Image: {IMAGE_WEIGHT:.2f}, Text: {TEXT_WEIGHT:.2f}")

if image_available and text_available and not same_label:
    img_crop, img_disease = pretty_label(image_top_label)
    txt_crop, txt_disease = pretty_label(text_top_label)

    print("\nBranch Disagreement Note:")
    print(f"- Image suggests: {img_crop} - {img_disease}")
    print(f"- Text suggests: {txt_crop} - {txt_disease}")

# =========================
# SMART CONFIDENCE MESSAGE
# =========================
if image_available and text_available:
    if same_label and final_top_prob >= 0.50:
        print("\nHigh confidence: image and text agree strongly.")
    elif same_crop and final_top_prob >= 0.35:
        print("\nModerate confidence: image and text agree on crop, but disease match is not exact.")
    else:
        print("\nLow confidence: image and text do not agree strongly. Try a clearer leaf image and more specific symptoms.")
elif image_available:
    if final_top_prob >= 0.50:
        print("\nImage-based prediction only: moderate confidence.")
    else:
        print("\nImage-based prediction only: low confidence. Try a clearer close-up leaf image.")
elif text_available:
    if final_top_prob >= 0.35:
        print("\nText-based prediction only: moderate confidence.")
    else:
        print("\nText-based prediction only: low confidence. Please provide more specific symptoms.")

# =========================
# LOCAL RAG OUTPUT
# =========================
top_labels = [label for label, _ in sorted_preds[:2]]
combined_labels = " OR ".join(top_labels)

if text_input:
    rag_query = f"{combined_labels}. User symptoms: {text_input}. Provide symptoms, cause, treatment, prevention, severity."
else:
    rag_query = f"{combined_labels} symptoms cause treatment prevention severity"

print(build_rag_answer(
    rag_query,
    top_k=20,
    crop_filter=crop,
    preferred_labels=top_labels
))