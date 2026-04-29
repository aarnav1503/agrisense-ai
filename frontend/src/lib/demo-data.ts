import cornImg from "@/assets/corn-rust.jpg";
import tomatoImg from "@/assets/tomato-curl.jpg";
import potatoImg from "@/assets/potato-blight.jpg";

export type Severity = "Low" | "Moderate" | "High" | "Severe";
export type ConfidenceLevel = "Low" | "Moderate" | "High";

export interface Prediction {
  label: string;
  score: number;
}

export interface Diagnosis {
  id: string;
  image: string;
  crop: string;
  disease: string;
  confidence: number; // 0-1
  confidenceLevel: ConfidenceLevel;
  imagePredictions: Prediction[];
  textPredictions: Prediction[];
  hybridPredictions: Prediction[];
  branchAgreement: "agree" | "conflict" | "partial";
  imageBranch: string;
  textBranch: string;
  detectedCropFromText: string;
  keywordCount: number;
  fusionWeights: { image: number; text: number };
  knowledge: {
    symptoms: string[];
    cause: string;
    treatment: string[];
    prevention: string[];
    severity: Severity;
    consultExpertWhen: string;
  };
  related: string[];
  evidence: { source: string; tags: string[]; snippet: string }[];
  webInsights?: {
    trends: string[];
    sources: { title: string; link: string }[];
  };
  date: string;
  symptomsInput: string;
}

export const demoDiagnoses: Record<string, Diagnosis> = {
  "corn-rust": {
    id: "corn-rust",
    image: cornImg,
    crop: "Corn (Maize)",
    disease: "Common Rust",
    confidence: 0.94,
    confidenceLevel: "High",
    imagePredictions: [
      { label: "Corn — Common Rust", score: 0.92 },
      { label: "Corn — Northern Leaf Blight", score: 0.05 },
      { label: "Corn — Healthy", score: 0.03 },
    ],
    textPredictions: [
      { label: "Corn — Common Rust", score: 0.88 },
      { label: "Corn — Southern Rust", score: 0.09 },
      { label: "Corn — Gray Leaf Spot", score: 0.03 },
    ],
    hybridPredictions: [
      { label: "Corn — Common Rust", score: 0.94 },
      { label: "Corn — Southern Rust", score: 0.04 },
      { label: "Corn — Northern Leaf Blight", score: 0.02 },
    ],
    branchAgreement: "agree",
    imageBranch: "Corn — Common Rust",
    textBranch: "Corn — Common Rust",
    detectedCropFromText: "Corn",
    keywordCount: 4,
    fusionWeights: { image: 0.6, text: 0.4 },
    knowledge: {
      symptoms: [
        "Small reddish-brown to orange pustules on both leaf surfaces",
        "Powdery rust spores rub off when touched",
        "Yellow halos surrounding mature pustules",
        "Premature drying of leaves in severe cases",
      ],
      cause: "Caused by the fungus Puccinia sorghi, favored by cool temperatures (16–25°C) and prolonged leaf wetness or high humidity.",
      treatment: [
        "Apply foliar fungicide (Mancozeb or Propiconazole) at first sign of pustules",
        "Repeat fungicide every 10–14 days during active disease pressure",
        "Remove and destroy heavily infected leaves to reduce spore load",
        "Ensure adequate potassium nutrition to strengthen plant defenses",
      ],
      prevention: [
        "Plant rust-resistant hybrid varieties when available",
        "Rotate crops on a 2–3 year cycle",
        "Avoid overhead irrigation late in the day",
        "Maintain proper plant spacing for airflow",
        "Scout fields weekly during humid weather",
      ],
      severity: "Moderate",
      consultExpertWhen:
        "More than 30% leaf area is affected, lesions appear before tasseling, or fungicide applications fail to slow spread.",
    },
    related: ["Southern Rust", "Northern Leaf Blight", "Gray Leaf Spot"],
    evidence: [
      {
        source: "agronomy_corn_diseases.pdf",
        tags: ["Corn", "Rust", "Fungicide"],
        snippet:
          "Common rust (Puccinia sorghi) appears as cinnamon-brown pustules on both leaf surfaces. Triazole fungicides at VT–R2 stage provide effective control.",
      },
      {
        source: "ipm_handbook_2024.md",
        tags: ["IPM", "Corn", "Prevention"],
        snippet:
          "Cultural management combined with resistant hybrids reduces yield losses by up to 40% in rust-prone regions.",
      },
    ],
    date: "2025-04-15",
    symptomsInput: "corn leaves have orange rust spots and powdery patches",
  },
  "tomato-curl": {
    id: "tomato-curl",
    image: tomatoImg,
    crop: "Tomato",
    disease: "Yellow Leaf Curl Virus",
    confidence: 0.87,
    confidenceLevel: "High",
    imagePredictions: [
      { label: "Tomato — Yellow Leaf Curl Virus", score: 0.85 },
      { label: "Tomato — Mosaic Virus", score: 0.1 },
      { label: "Tomato — Early Blight", score: 0.05 },
    ],
    textPredictions: [
      { label: "Tomato — Yellow Leaf Curl Virus", score: 0.83 },
      { label: "Tomato — Nutrient Deficiency", score: 0.12 },
      { label: "Tomato — Mosaic Virus", score: 0.05 },
    ],
    hybridPredictions: [
      { label: "Tomato — Yellow Leaf Curl Virus", score: 0.87 },
      { label: "Tomato — Mosaic Virus", score: 0.08 },
      { label: "Tomato — Nutrient Deficiency", score: 0.05 },
    ],
    branchAgreement: "agree",
    imageBranch: "Tomato — Yellow Leaf Curl Virus",
    textBranch: "Tomato — Yellow Leaf Curl Virus",
    detectedCropFromText: "Tomato",
    keywordCount: 5,
    fusionWeights: { image: 0.55, text: 0.45 },
    knowledge: {
      symptoms: [
        "Upward curling and cupping of leaves",
        "Yellowing of leaf margins and interveinal areas",
        "Stunted plant growth and shortened internodes",
        "Reduced fruit set and small, deformed fruit",
      ],
      cause:
        "Caused by Tomato Yellow Leaf Curl Virus (TYLCV), transmitted by the silverleaf whitefly (Bemisia tabaci).",
      treatment: [
        "Remove and destroy infected plants immediately to prevent spread",
        "Apply insecticidal soap or neem oil to control whitefly populations",
        "Use yellow sticky traps to monitor and reduce vectors",
        "There is no chemical cure — focus on vector control",
      ],
      prevention: [
        "Use TYLCV-resistant tomato varieties",
        "Cover seedlings with insect-proof netting (50-mesh)",
        "Maintain weed-free borders to remove whitefly hosts",
        "Use reflective silver mulches to repel whiteflies",
        "Avoid planting near other infected solanaceous crops",
      ],
      severity: "Severe",
      consultExpertWhen:
        "Infection appears before flowering or affects more than 20% of plants in the field.",
    },
    related: ["Tomato Mosaic Virus", "Curly Top Virus", "Whitefly Damage"],
    evidence: [
      {
        source: "viral_diseases_solanaceae.pdf",
        tags: ["Tomato", "Virus", "TYLCV"],
        snippet:
          "TYLCV is transmitted persistently by Bemisia tabaci. Once a plant is infected, no curative treatment exists; vector management is the only effective approach.",
      },
      {
        source: "whitefly_management_guide.md",
        tags: ["IPM", "Whitefly", "Vector"],
        snippet:
          "Reflective mulches reduce whitefly settlement by up to 70%, significantly lowering TYLCV incidence in field trials.",
      },
    ],
    date: "2025-04-10",
    symptomsInput: "tomato leaves curling upward, yellow margins, plants stunted",
  },
  "potato-blight": {
    id: "potato-blight",
    image: potatoImg,
    crop: "Potato",
    disease: "Late Blight",
    confidence: 0.91,
    confidenceLevel: "High",
    imagePredictions: [
      { label: "Potato — Late Blight", score: 0.9 },
      { label: "Potato — Early Blight", score: 0.07 },
      { label: "Potato — Healthy", score: 0.03 },
    ],
    textPredictions: [
      { label: "Potato — Late Blight", score: 0.86 },
      { label: "Potato — Early Blight", score: 0.1 },
      { label: "Potato — Black Scurf", score: 0.04 },
    ],
    hybridPredictions: [
      { label: "Potato — Late Blight", score: 0.91 },
      { label: "Potato — Early Blight", score: 0.06 },
      { label: "Potato — Black Scurf", score: 0.03 },
    ],
    branchAgreement: "agree",
    imageBranch: "Potato — Late Blight",
    textBranch: "Potato — Late Blight",
    detectedCropFromText: "Potato",
    keywordCount: 6,
    fusionWeights: { image: 0.6, text: 0.4 },
    knowledge: {
      symptoms: [
        "Dark water-soaked lesions on leaves and stems",
        "White fuzzy growth on the underside of leaves in humid conditions",
        "Rapid wilting and collapse of foliage",
        "Brown firm rot in tubers",
      ],
      cause:
        "Caused by the oomycete Phytophthora infestans, favored by cool, wet weather (10–20°C and >90% humidity).",
      treatment: [
        "Apply protectant fungicide (Chlorothalonil or Mancozeb) preventively",
        "Switch to systemic fungicide (Cymoxanil or Metalaxyl) once symptoms appear",
        "Remove and destroy infected plant debris immediately",
        "Stop irrigation to lower humidity and slow disease progress",
      ],
      prevention: [
        "Plant certified disease-free seed potatoes",
        "Choose resistant varieties such as Sarpo Mira",
        "Hill soil over tubers to prevent spore contact",
        "Avoid evening irrigation",
        "Destroy volunteer potatoes and cull piles",
      ],
      severity: "Severe",
      consultExpertWhen:
        "Lesions spread more than 30 cm per day, sporulation appears on leaf undersides, or weather forecasts cool wet conditions.",
    },
    related: ["Early Blight", "Black Scurf", "Pink Rot"],
    evidence: [
      {
        source: "phytophthora_management.pdf",
        tags: ["Potato", "Late Blight", "Fungicide"],
        snippet:
          "Late blight epidemics can destroy a potato field in 7–10 days under favorable weather. Preventive fungicide schedules are essential during high-risk windows.",
      },
      {
        source: "potato_ipm_2024.md",
        tags: ["IPM", "Potato", "Prevention"],
        snippet:
          "Combining resistant cultivars with weather-based decision support reduces fungicide applications by 30% while maintaining yield.",
      },
    ],
    date: "2025-04-05",
    symptomsInput:
      "potato leaves have dark water-soaked patches spreading fast and white mold underneath",
  },
};

export const demoList = Object.values(demoDiagnoses);
