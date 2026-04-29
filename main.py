import os
import sys
import torch
import torch.nn as nn
import joblib
import numpy as np
from PIL import Image
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import io

# Import RAG and Web logic
from src.rag_query import build_rag_answer, get_structured_knowledge
from src.web_helper import fetch_web_info, extract_latest_trends
from mangum import Mangum

app = FastAPI()
handler = Mangum(app)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_disease_resnet18.pth")
TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "text_symptom_model.pkl")
IMAGE_SIZE = 224

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =========================
# STATIC FILES (For Deployment)
# =========================
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If the path looks like an API call, it might be a 404 from the API router
        # otherwise serve the index.html for SPA support
        if full_path.startswith("predict") or full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# =========================
# LOAD MODELS
# =========================
# Load Image Model
try:
    image_checkpoint = torch.load(IMAGE_MODEL_PATH, map_location=DEVICE, weights_only=False)
    class_names = image_checkpoint["class_names"]
    num_classes = len(class_names)

    image_model = models.resnet18(weights=None)
    image_model.fc = nn.Linear(image_model.fc.in_features, num_classes)
    image_model.load_state_dict(image_checkpoint["model_state_dict"])
    image_model = image_model.to(DEVICE)
    image_model.eval()
except Exception as e:
    print(f"Error loading image model: {e}")
    image_model = None

# Load Text Model
try:
    text_model = joblib.load(TEXT_MODEL_PATH)
except Exception as e:
    print(f"Error loading text model: {e}")
    text_model = None

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
# HELPERS
# =========================
crop_aliases = {
    "tomato": "Tomato", "potato": "Potato", "corn": "Corn_(maize)", "maize": "Corn_(maize)",
    "apple": "Apple", "grape": "Grape", "orange": "Orange", "citrus": "Orange",
    "peach": "Peach", "pepper": "Pepper,_bell", "bell pepper": "Pepper,_bell",
    "strawberry": "Strawberry", "squash": "Squash", "soybean": "Soybean",
    "raspberry": "Raspberry", "blueberry": "Blueberry", "cherry": "Cherry_(including_sour)"
}

def pretty_label(label):
    if "___" not in label: return label, "Unknown"
    crop, disease = label.split("___")
    return crop.replace("_", " "), disease.replace("_", " ")

# =========================
# API ENDPOINTS
# =========================

# Main APIPredict handles the analysis
@app.post("/predict")
async def predict(
    file: Optional[UploadFile] = File(None),
    symptoms: Optional[str] = Form(None)
):
    if not file and not symptoms:
        raise HTTPException(status_code=400, detail="Either image or symptoms text must be provided.")

    final_results = {}
    
    # 1. Image Prediction
    image_probs = {}
    if file and image_model:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            image_tensor = transform(image).unsqueeze(0).to(DEVICE)
            with torch.no_grad():
                outputs = image_model(image_tensor)
                probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            image_probs = {class_names[i]: float(probs[i]) for i in range(len(class_names))}
        except Exception as e:
            print(f"Image prediction error: {e}")

    # 2. Text Prediction
    text_probs = {}
    if symptoms and text_model:
        try:
            probs = text_model.predict_proba([symptoms.lower()])[0]
            text_classes = text_model.classes_
            text_probs = {text_classes[i]: float(probs[i]) for i in range(len(text_classes))}
        except Exception as e:
            print(f"Text prediction error: {e}")

    # 3. Hybrid Logic (Simple average for now, similar to predict.py)
    combined_probs = {}
    all_classes = set(list(image_probs.keys()) + list(text_probs.keys()))
    
    # Dynamic weighting based on input availability (simplified)
    if image_probs and text_probs:
        img_w, txt_w = 0.5, 0.5
    elif image_probs:
        img_w, txt_w = 1.0, 0.0
    else:
        img_w, txt_w = 0.0, 1.0

    for cls in all_classes:
        p_img = image_probs.get(cls, 0)
        p_txt = text_probs.get(cls, 0)
        combined_probs[cls] = (p_img * img_w) + (p_txt * txt_w)

    # Sort and take top 3
    sorted_results = sorted(combined_probs.items(), key=lambda x: x[1], reverse=True)[:3]
    
    top_prediction = sorted_results[0] if sorted_results else ("Unknown___Unknown", 0)
    label, confidence = top_prediction
    crop, disease = pretty_label(label)

    # 4. RAG Knowledge
    rag_query = symptoms if symptoms else f"{crop} {disease}"
    knowledge = get_structured_knowledge(rag_query, crop_filter=crop.replace(" ", "_"), preferred_labels=[label])

    # 5. Real-time Web Scraping
    web_results = fetch_web_info(f"{crop} {disease}")
    web_insights = extract_latest_trends(web_results)

    return {
        "prediction": {
            "label": label,
            "crop": crop,
            "disease": disease,
            "confidence": confidence
        },
        "top_3": [
            {"crop": pretty_label(cls)[0], "disease": pretty_label(cls)[1], "confidence": conf}
            for cls, conf in sorted_results
        ],
        "image_top_3": [
            {"crop": pretty_label(cls)[0], "disease": pretty_label(cls)[1], "confidence": conf}
            for cls, conf in sorted(image_probs.items(), key=lambda x: x[1], reverse=True)[:3]
        ] if image_probs else [],
        "text_top_3": [
            {"crop": pretty_label(cls)[0], "disease": pretty_label(cls)[1], "confidence": conf}
            for cls, conf in sorted(text_probs.items(), key=lambda x: x[1], reverse=True)[:3]
        ] if text_probs else [],
        "fusion": {
            "image_weight": img_w,
            "text_weight": txt_w,
            "has_image": bool(image_probs),
            "has_text": bool(text_probs)
        },
        "knowledge": knowledge,
        "web_insights": {
            "trends": web_insights,
            "sources": [
                {"title": r["title"], "link": r["link"]} for r in web_results[:3]
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
