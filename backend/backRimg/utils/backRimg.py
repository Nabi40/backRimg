# backRimg/utils/backRimg.py
from PIL import Image
import torch
import torch.nn.functional as F
from transformers import AutoModelForImageSegmentation
from torchvision.transforms.functional import normalize
import numpy as np
from skimage import io
from pathlib import Path

# Load model once
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
model = AutoModelForImageSegmentation.from_pretrained(
    "briaai/RMBG-1.4",
    trust_remote_code=True
)
model.to(device)

def preprocess_image(im: np.ndarray, model_input_size: list) -> torch.Tensor:
    if len(im.shape) < 3:
        im = im[:, :, np.newaxis]
    im_tensor = torch.tensor(im, dtype=torch.float32).permute(2, 0, 1)
    im_tensor = F.interpolate(torch.unsqueeze(im_tensor, 0), size=model_input_size, mode='bilinear')
    image = torch.divide(im_tensor, 255.0)
    image = normalize(image, [0.5, 0.5, 0.5], [1.0, 1.0, 1.0])
    return image

def postprocess_image(result: torch.Tensor, im_size: list) -> np.ndarray:
    result = torch.squeeze(F.interpolate(result, size=im_size, mode='bilinear'), 0)
    ma = torch.max(result)
    mi = torch.min(result)
    result = (result - mi) / (ma - mi)
    im_array = (result * 255).permute(1, 2, 0).cpu().data.numpy().astype(np.uint8)
    im_array = np.squeeze(im_array)
    return im_array

def remove_bg(input_image_path: str, output_dir: str) -> str:
    """
    Removes background from input image and saves the result to output_dir.
    Returns the output image path.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    orig_im = io.imread(input_image_path)
    orig_im_size = orig_im.shape[0:2]
    model_input_size = [1024, 1024]

    image = preprocess_image(orig_im, model_input_size).to(device)
    result = model(image)
    result_image = postprocess_image(result[0][0], orig_im_size)

    pil_mask_im = Image.fromarray(result_image)
    orig_image = Image.open(input_image_path).convert("RGBA")
    no_bg_image = orig_image.copy()
    no_bg_image.putalpha(pil_mask_im)

    output_path = Path(output_dir) / f"{Path(input_image_path).stem}_no_bg.png"
    no_bg_image.save(output_path)

    return str(output_path)
