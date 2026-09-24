"""
app.ui.tabs.critical_tab
~~~~~~~~~~~~~~~~~~~~~~~~
Gradio UI for the Critical Disease (Cardiovascular) prediction tab.
"""
from __future__ import annotations

import gradio as gr
import xgboost as xgb

from app.ml.predictor import predict_critical as _predict

_CHEST_PAIN_CHOICES = [
    "0 (Asymptomatic)",
    "1 (Mild)",
    "2 (Moderate)",
    "3 (Severe)",
]


def build(models: dict[str, xgb.XGBClassifier]) -> gr.TabItem:
    """Build and return the Critical Disease tab."""
    with gr.TabItem("❤️ Critical Disease (Cardio)") as tab:
        with gr.Row():
            with gr.Column():
                trop       = gr.Slider(0.01, 1.0, value=0.04, step=0.01, label="Troponin Level (Biomarker)")
                max_hr     = gr.Slider(60, 220,   value=150,  step=1,    label="Maximum Heart Rate (bpm)")
                chest_pain = gr.Radio(
                    choices=_CHEST_PAIN_CHOICES,
                    value=_CHEST_PAIN_CHOICES[0],
                    label="Chest Pain Type",
                )
                btn = gr.Button("Analyze Critical Risk", variant="primary")

            with gr.Column():
                out_risk = gr.Textbox(label="Risk Assessment", lines=2)
                out_conf = gr.Textbox(label="AI Confidence")

        btn.click(
            fn=lambda t, h, cp: _predict(models["Critical"], t, h, cp),
            inputs=[trop, max_hr, chest_pain],
            outputs=[out_risk, out_conf],
        )
    return tab
