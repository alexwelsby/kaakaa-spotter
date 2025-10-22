from tensorflow import keras
import numpy as np
import requests
from PIL import Image
from io import BytesIO

#pre-processes a single image for our CNN to handle
def load_image(img_path: str):
    """
    Load an image and return a tensor that can be used as an input to DINOv2.
    """
    target_size = (224, 224)

    if img_path.startswith("http://") or img_path.startswith("https://"):
        response = requests.get(img_path)
        response.raise_for_status()
        img = BytesIO(response.content)
    else:
        img = img_path

    image = keras.utils.load_img(img, target_size=target_size)

    image_array = keras.utils.img_to_array(image)

    image_array = np.expand_dims(image_array, axis=0)

    return keras.applications.vgg19.preprocess_input(image_array)