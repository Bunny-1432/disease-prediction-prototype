"""
app.ui.tabs.lifestyle_tab
~~~~~~~~~~~~~~~~~~~~~~~~~
Gradio UI for the Lifestyle Risk prediction tab.
"""
from __future__ import annotations

import gradio as gr
import xgboost as xgb

from app.ml.predictor import predict_lifestyle as _predict


def build(models: dict[str, xgb.XGBClassifier]) -> gr.TabItem:
    """Build and return the Lifestyle Risk tab."""
    with gr.TabItem("🏃 Lifestyle Risk") as tab:
        with gr.Row():
            with gr.Column():
                age     = gr.Slider(18, 100, value=55, step=1,   label="Age")
                bmi     = gr.Slider(10,  50, value=28.5, step=0.1, label="BMI")
                sys_bp  = gr.Slider(80, 200, value=125, step=1,   label="Systolic BP (mmHg)")
                glucose = gr.Slider(50, 300, value=105, step=1,   label="Fasting Glucose (mg/dL)")
                hr      = gr.Slider(40, 150, value=72,  step=1,   label="Resting Heart Rate (bpm)")
                sleep   = gr.Slider(2,  14,  value=6.5, step=0.5, label="Sleep Hours / Night")
                chol    = gr.Slider(100, 400, value=200, step=1,  label="Cholesterol Level (mg/dL)")
                btn     = gr.Button("Analyze Lifestyle Risk", variant="primary")

            with gr.Column():
                out_risk = gr.Textbox(label="Risk Assessment", lines=2)
                out_conf = gr.Textbox(label="AI Confidence")

        btn.click(
            fn=lambda a, b, s, g, h, sl, c: _predict(models["Lifestyle"], a, b, s, g, h, sl, c),
            inputs=[age, bmi, sys_bp, glucose, hr, sleep, chol],
            outputs=[out_risk, out_conf],
        )
    return tab
