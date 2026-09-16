import torch
import torch.nn.functional as F
import numpy as np


class GradCAM:

    def __init__(self, model, target_layer=None):
        self.model = model
        self.target_layer = target_layer if target_layer is not None else model.features

        self.activations = None
        self.gradients = None

        self._register_hooks()

    def _register_hooks(self):

        def forward_hook(module, input, output):
            self.activations = output.clone()
            output.register_hook(self._save_gradient)

        self.target_layer.register_forward_hook(forward_hook)

    def _save_gradient(self, grad):
        self.gradients = grad

    def generate(self, image_tensor, target_class=None):

        self.model.zero_grad()

        outputs = self.model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]

        if target_class is None:
            target_class = torch.argmax(probabilities).item()

        score = outputs[0, target_class]
        score.backward()

        activations = self.activations[0]
        gradients = self.gradients[0]

        weights = gradients.mean(dim=(1, 2))

        cam = torch.zeros(
            activations.shape[1:],
            dtype=torch.float32,
            device=activations.device
        )

        for c in range(activations.shape[0]):
            cam += weights[c] * activations[c]

        cam = F.relu(cam)

        cam = cam.detach().cpu().numpy()

        if cam.max() > 0:
            cam = cam / cam.max()
        else:
            cam = np.zeros_like(cam)

        return cam, target_class, probabilities.detach()
    