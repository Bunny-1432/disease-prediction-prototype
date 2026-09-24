"""
app.ui.theme
~~~~~~~~~~~~
Gradio theme configuration. Isolated so it can be swapped without touching UI logic.
"""
import gradio as gr

theme = gr.themes.Monochrome(
    primary_hue="blue",
    secondary_hue="slate",
    neutral_hue="gray",
    font=[gr.themes.GoogleFont("Inter"), "system-ui", "sans-serif"],
).set(
    button_primary_background_fill="*primary_500",
    button_primary_background_fill_hover="*primary_600",
    block_title_text_color="*primary_500",
    block_background_fill="*neutral_50",
)
