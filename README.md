---
title: AgriSense AI
emoji: 🌿
colorFrom: green
colorTo: lime
sdk: docker
pinned: false
app_port: 7860
---

# AgriSense AI: Hybrid Crop Disease Diagnosis

AgriSense AI leverages Multi-Modal Fusion (Image + Text) and Retrieval-Augmented Generation (RAG) to provide accurate crop disease diagnosis and actionable treatment insights.

## Features
- **Hybrid AI**: Combines ResNet-18 image classification with NLP symptom analysis.
- **RAG Knowledge Base**: Retrieves reliable treatment data from curated agricultural sources.
- **Real-time Web Search**: Supplements diagnoses with latest trends and research using DuckDuckGo.
- **Explainable AI**: Visualizes confidence levels and decision-making logic.

## Deployment
This app is hosted on Hugging Face Spaces using the Docker SDK.

### Local Development
1. Clone the repo
2. `pip install -r requirements.txt`
3. `python main.py`
4. In another terminal: `cd frontend && npm install && npm run dev`
