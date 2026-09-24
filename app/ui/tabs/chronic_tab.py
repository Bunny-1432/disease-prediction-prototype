"""
app.ui.tabs.chronic_tab
~~~~~~~~~~~~~~~~~~~~~~~
Gradio UI for the Chronic Disease (CKD / COPD) prediction tab.
"""
from __future__ import annotations

import gradio as gr
import xgboost as xgb

from app.ml.predictor import predict_chronic as _predict


def build(models: dict[str, xgb.XGBClassifier]) -> gr.TabItem:
    """Build and return the Chronic Disease tab."""
    with gr.TabItem("🫁 Chronic Disease (CKD / COPD)") as tab:
        with gr.Row():
            with gr.Column():
                gfr   = gr.Slider(10, 150, value=70,  step=1,   label="GFR Level (Kidney Function)")
                creat = gr.Slider(0.5, 10, value=1.2, step=0.1, label="Creatinine (mg/dL)")
                smoke = gr.Slider(0,  50,  value=10,  step=1,   label="Smoking History (years)")
                fev1  = gr.Slider(0.5, 5,  value=2.5, step=0.1, label="Lung Capacity — FEV1 (L)")
                btn   = gr.Button("Analyze Chronic Risk", variant="primary")

            with gr.Column():
                out_risk = gr.Textbox(label="Risk Assessment", lines=2)
                out_conf = gr.Textbox(label="AI Confidence")

        btn.click(
            fn=lambda g, c, s, f: _predict(models["Chronic"], g, c, s, f),
            inputs=[gfr, creat, smoke, fev1],
            outputs=[out_risk, out_conf],
        )
    return tab
