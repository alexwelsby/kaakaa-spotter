import numpy as np
import torch
import torchvision.transforms as T
from PIL import Image
import requests
from io import BytesIO
from transformers import AutoImageProcessor
from typing import Optional, List

processor = AutoImageProcessor.from_pretrained("facebook/dinov2-small", use_fast=True)

def load_image(img_path: str) -> torch.Tensor:
    """
    Load an image and return a tensor that can be used as an input to DINOv2.
    """

    if img_path.startswith("http://") or img_path.startswith("https://"):
        response = requests.get(img_path)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
    else:
        img = Image.open(img_path)

    inputs = processor(images=img, return_tensors="pt")

    return inputs["pixel_values"]
