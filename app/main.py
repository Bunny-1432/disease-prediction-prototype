"""
app.main
~~~~~~~~
Entry point for the Disease Prediction application.
Replaces the old root-level app.py.

Run:
    python -m app.main
    # or from project root:
    python app/main.py
"""
from app.config import SHARE_PUBLIC, OPEN_IN_BROWSER
from app.ml.trainer import train_all
from app.ui.layout import build_app
from app.ui.theme import theme


def main() -> None:
    models = train_all(verbose=True)
    demo = build_app(models)
    demo.launch(share=SHARE_PUBLIC, inbrowser=OPEN_IN_BROWSER, theme=theme)


if __name__ == "__main__":
    main()
