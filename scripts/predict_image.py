import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn as nn

import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_disease_resnet18.pth")
IMAGE_PATH = os.path.join(BASE_DIR, "data", "image.png")   # change this to your test image path
IMAGE_SIZE = 224

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =========================
# LOAD CHECKPOINT
# =========================
checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
class_names = checkpoint["class_names"]
num_classes = len(class_names)

# =========================
# REBUILD MODEL
# =========================
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(DEVICE)
model.eval()

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
# LOAD IMAGE
# =========================
image = Image.open(IMAGE_PATH).convert("RGB")
image_tensor = transform(image).unsqueeze(0).to(DEVICE)

# =========================
# PREDICTION
# =========================
with torch.no_grad():
    outputs = model(image_tensor)
    probabilities = torch.softmax(outputs, dim=1)

top_probs, top_idxs = torch.topk(probabilities, 3)

print("\nTop Predictions:")
for i in range(3):
    class_name = class_names[top_idxs[0][i].item()]
    prob = top_probs[0][i].item()

    crop, disease = class_name.split("___")
    crop = crop.replace("_", " ")
    disease = disease.replace("_", " ")

    print(f"{i+1}. {crop} - {disease} : {prob*100:.2f}%")

if top_probs[0][0].item() < 0.80:
    print("\nLow confidence prediction. Try uploading a clear close-up leaf image.")