import gradio as gr
from PIL import Image

from explain import DRExplainer

MODEL_PATH = "/kaggle/input/models/harmeharkaursuri/densenet121/pytorch/default/1/densenet121_dr_best.pth"

explainer = DRExplainer(MODEL_PATH)


def process_scan(image):

    if image is None:
        return None, "Please upload an image.", ""

    result = explainer.explain(image)

    if not result["success"]:
        return None, f"❌ Rejected: {result['error']}", ""

    prediction_text = f"**Prediction:** {result['prediction']}  \n**Confidence:** {result['confidence'] * 100:.1f}%"

    return (
        result["heatmap_overlay_image"],
        prediction_text,
        result["explanation"]
    )


demo = gr.Interface(
    fn=process_scan,
    inputs=gr.Image(type="pil", label="Upload Retina Scan"),
    outputs=[
        gr.Image(label="Heatmap Overlay"),
        gr.Markdown(label="Prediction"),
        gr.Textbox(label="Explanation", lines=3)
    ],
    title="Diabetic Retinopathy Detection with Grad-CAM Explainability",
    description="Upload a fundus/retina scan. The system checks image quality, "
                "predicts DR severity, and highlights the most affected region.",
    allow_flagging="never"
)

demo.launch(share=True, debug=True)
