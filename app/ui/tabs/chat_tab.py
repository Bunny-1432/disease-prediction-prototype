"""
app.ui.tabs.chat_tab
~~~~~~~~~~~~~~~~~~~~
Gradio UI for the AI Medical Knowledge Assistant tab.
"""
import gradio as gr
from app.chat.knowledge_engine import respond


def build() -> gr.TabItem:
    """Build and return the AI Health Assistant tab."""
    with gr.TabItem("🤖 AI Health Assistant") as tab:
        gr.ChatInterface(
            fn=respond,
            title="Medical Knowledge Engine Q&A",
            description=(
                "Ask about symptoms, risk factors, treatments, or lifestyle advice. "
                "**Not a substitute for professional medical consultation.**"
            ),
            examples=[
                "What does high cholesterol mean?",
                "How does sleep affect heart health?",
                "What is GFR and why does it matter?",
                "What are the warning signs of a heart attack?",
            ],
        )
    return tab
