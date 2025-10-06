import numpy as np
import torch
import torchvision.transforms as T
from PIL import Image
import os
import cv2
import json
import glob
from transformers import AutoImageProcessor
from typing import Optional, List

processor = AutoImageProcessor.from_pretrained("facebook/dinov2-small", use_fast=True)

def load_image(img: str) -> torch.Tensor:
    """
    Load an image and return a tensor that can be used as an input to DINOv2.
    """
    img = Image.open(img)

    inputs = processor(images=img, return_tensors="pt")

    return inputs["pixel_values"]
