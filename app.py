import gradio as gr
import pandas as pd
from sample_model import train_and_evaluate_model

print("Initializing AI Engine and Pre-training XGBoost Models...")
models = {
    'Lifestyle': train_and_evaluate_model('Lifestyle')[0],
    'Chronic': train_and_evaluate_model('Chronic')[0],
    'Critical': train_and_evaluate_model('Critical')[0]
}

# Inference Wrappers
def predict_lifestyle(age, bmi, sys_bp, glucose, hr, sleep, chol):
    df = pd.DataFrame([{'Age': age, 'BMI': bmi, 'Systolic_BP': sys_bp, 'Fasting_Glucose': glucose, 'Resting_HR': hr, 'Sleep_Hours': sleep, 'Cholesterol_Level': chol}])
    return format_prediction(models['Lifestyle'], df)

def predict_chronic(gfr, creat, smoking, fev1):
    df = pd.DataFrame([{'GFR_Level': gfr, 'Creatinine': creat, 'Smoking_Years': smoking, 'Lung_Capacity_FEV1': fev1}])
    return format_prediction(models['Chronic'], df)

def predict_critical(trop, max_hr, chest_pain):
    # Chest pain is a categorical integer 0-3
    chest_pain = int(chest_pain.split(" ")[0]) if isinstance(chest_pain, str) else int(chest_pain)
    df = pd.DataFrame([{'Troponin_Level': trop, 'Max_HR': max_hr, 'Chest_Pain_Type': chest_pain}])
    return format_prediction(models['Critical'], df)

def format_prediction(model, input_df):
    pred = int(model.predict(input_df)[0])
    prob = model.predict_proba(input_df)[0]
    
    risk_tier = "🚨 CRITICAL RISK (Urgent Action Required)" if pred == 1 else "✅ LOW RISK (Routine Monitoring)"
    conf = f"{prob[pred] * 100:.2f}% System Confidence"
    return risk_tier, conf

# Semantic Chatbot AI (Req: Phase 3)
def chat_response(message, history):
    message = message.lower()
    if "sleep" in message:
        return "Adequate sleep (7-9 hours) is crucial for metabolic health and lowering cardiovascular risk. Low sleep drives up cortisol and stress."
    elif "cholesterol" in message or "diet" in message:
        return "High cholesterol heavily increases plaque buildup in arteries. Consider a diet low in saturated fats and high in fiber to reduce LDL."
    elif "chronic" in message or "kidney" in message:
        return "Chronic conditions like CKD require continuous monitoring of GFR and Creatinine levels. Always consult your nephrologist for actionable steps."
    elif "critical" in message or "pain" in message:
        return "Chest pain and elevated troponin are critical acute symptoms. If you are experiencing this, seek emergency medical attention."
    else:
        return "I am the Multi-Disease AI Assistant. I provide medical knowledge base context for Lifestyle, Chronic, and Critical health metrics! How can I help?"

# UI Premium Aesthetics
theme = gr.themes.Monochrome(
    primary_hue="blue",
    secondary_hue="slate",
    neutral_hue="gray",
    font=[gr.themes.GoogleFont("Inter"), "system-ui", "sans-serif"]
).set(
    button_primary_background_fill="*primary_500",
    button_primary_background_fill_hover="*primary_600",
    block_title_text_color="*primary_500",
    block_background_fill="*neutral_50"
)

with gr.Blocks(title="Next-Gen Health AI", theme=theme) as demo:
    gr.Markdown("<h1 style='text-align: center; color: #1e3a8a;'>🔬 Next-Gen Multi-Disease Prediction Engine</h1>")
    gr.Markdown("<p style='text-align: center;'>Powered by Multi-Stage XGBoost, SHAP Explainability, and a dynamic Medical Knowledge Base.</p>")
    
    with gr.Tabs():
        with gr.TabItem("🏃 Lifestyle Risk"):
            with gr.Row():
                with gr.Column():
                    age = gr.Slider(18, 100, value=55, step=1, label="Age")
                    bmi = gr.Slider(10, 50, value=28.5, step=0.1, label="BMI")
                    sys_bp = gr.Slider(80, 200, value=125, step=1, label="Systolic BP")
                    glucose = gr.Slider(50, 300, value=105, step=1, label="Fasting Glucose")
                    hr = gr.Slider(40, 150, value=72, step=1, label="Resting Heart Rate")
                    sleep = gr.Slider(2, 14, value=6.5, step=0.5, label="Sleep Hours")
                    chol = gr.Slider(100, 400, value=200, step=1, label="Cholesterol Level")
                    btn_life = gr.Button("Analyze Lifestyle Risk", variant="primary")
                with gr.Column():
                    out_life_risk = gr.Textbox(label="Risk Assessment", lines=2)
                    out_life_conf = gr.Textbox(label="AI Confidence")
            btn_life.click(predict_lifestyle, inputs=[age, bmi, sys_bp, glucose, hr, sleep, chol], outputs=[out_life_risk, out_life_conf])

        with gr.TabItem("🫁 Chronic Disease (CKD/COPD)"):
            with gr.Row():
                with gr.Column():
                    gfr = gr.Slider(10, 150, value=70, step=1, label="GFR Level (Assessment of Kidney Function)")
                    creat = gr.Slider(0.5, 10.0, value=1.2, step=0.1, label="Creatinine (mg/dL)")
                    smoke = gr.Slider(0, 50, value=10, step=1, label="Smoking History (Years)")
                    fev1 = gr.Slider(0.5, 5.0, value=2.5, step=0.1, label="Lung Capacity (FEV1)")
                    btn_chron = gr.Button("Analyze Chronic Risk", variant="primary")
                with gr.Column():
                    out_chron_risk = gr.Textbox(label="Risk Assessment", lines=2)
                    out_chron_conf = gr.Textbox(label="AI Confidence")
            btn_chron.click(predict_chronic, inputs=[gfr, creat, smoke, fev1], outputs=[out_chron_risk, out_chron_conf])

        with gr.TabItem("❤️ Critical Disease (Cardio)"):
            with gr.Row():
                with gr.Column():
                    trop = gr.Slider(0.01, 1.0, value=0.04, step=0.01, label="Troponin Level (Biomarker)")
                    max_hr = gr.Slider(60, 220, value=150, step=1, label="Maximum Heart Rate")
                    chest_pain = gr.Radio(choices=["0 (Asymptomatic)", "1 (Mild)", "2 (Moderate)", "3 (Severe)"], value="0 (Asymptomatic)", label="Chest Pain Type")
                    btn_crit = gr.Button("Analyze Critical Risk", variant="primary")
                with gr.Column():
                    out_crit_risk = gr.Textbox(label="Risk Assessment", lines=2)
                    out_crit_conf = gr.Textbox(label="AI Confidence")
            btn_crit.click(predict_critical, inputs=[trop, max_hr, chest_pain], outputs=[out_crit_risk, out_crit_conf])

        with gr.TabItem("🤖 AI Health Assistant (Chat)"):
            gr.ChatInterface(chat_response, title="Medical Knowledge Engine Q&A")

if __name__ == "__main__":
    demo.launch(share=False, inbrowser=True)
