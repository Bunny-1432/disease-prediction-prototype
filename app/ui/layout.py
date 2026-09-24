"""
app.ui.layout
~~~~~~~~~~~~~
Assembles all tab UIs into a single Gradio Blocks application.
Previously: the massive with gr.Blocks() block inside app.py.
"""
from __future__ import annotations

import gradio as gr
import xgboost as xgb

from app.config import APP_TITLE
from app.ui.tabs import lifestyle_tab, chronic_tab, critical_tab, chat_tab


def build_app(models: dict[str, xgb.XGBClassifier]) -> gr.Blocks:
    """Compose all tabs into the main Gradio Blocks app and return it."""
    with gr.Blocks(title=APP_TITLE) as demo:
        gr.Markdown(
            f"<h1 style='text-align:center;color:#1e3a8a;'>🔬 {APP_TITLE}</h1>"
        )
        gr.Markdown(
            "<p style='text-align:center;'>"
            "Powered by Multi-Stage XGBoost · SHAP Explainability · Medical Knowledge Base"
            "</p>"
        )

        with gr.Tabs():
            lifestyle_tab.build(models)
            chronic_tab.build(models)
            critical_tab.build(models)
            chat_tab.build()

    return demo
