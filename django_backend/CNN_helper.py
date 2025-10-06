from tensorflow import keras
import numpy as np

#pre-processes a single image for our CNN to handle
def load_image(img_path: str):
    """
    Load an image and return a tensor that can be used as an input to DINOv2.
    """
    target_size = (224, 224)

    image = keras.utils.load_img(img_path, target_size=target_size)

    image_array = keras.utils.img_to_array(image)

    image_array = np.expand_dims(image_array, axis=0)

    return keras.applications.vgg19.preprocess_input(image_array)