import faiss
from faiss import normalize_L2
import json
import os
import numpy as np
from typing import Optional, List
import torch
from django.conf import settings
from collections import Counter
import statistics
from django_backend import DINO_helper, CNN_helper

DINO_MODEL = settings.DINO_MODEL
CNN_MODEL = settings.CNN_MODEL
DEVICE = settings.DEVICE

def load_faiss_index(index_path):
    index = faiss.read_index(index_path)
    with open(index_path + '.paths.json', 'r') as f:
        image_paths = json.load(f)
    print(f"Index loaded from {index_path}")
    return index, image_paths

DINO_FAISS, DINO_PATHS = load_faiss_index("media/FAISS/DINOv2/vector.index")

#CNN_FAISS, CNN_PATHS = load_faiss_index("media/FAISS/CNN/vector.index")

#assumes we're passed a train, val, or test set, and that all images are within class folders
def generate_dict_from_set(embeddings: Optional[List] = None, path_to_dataset = None):
  index = 0 if embeddings is None else int(embeddings[-1]['id']) + 1
  all_embeddings = [] if embeddings is None else embeddings
  for folder in os.listdir(path_to_dataset):
    label = folder
    fold_path = os.path.join(path_to_dataset, folder)
    for file in os.listdir(fold_path):
      filepath = os.path.join(fold_path, file)
      all_embeddings.append({'id': index, 'label':label, 'path': filepath})
      index += 1
  return all_embeddings
#called like dataset = generate_dict_from_set(path_to_dataset="./dataset/train")

#gets the id/label/path for a given index in the dict
def get_label_path_index(dataset_entry, index):
  id = dataset_entry['id']
  id = np.array([id], dtype='int64') #needs to be a 1d nparray for faiss
  label = dataset_entry['label']
  path = dataset_entry['path']
  return id, label, path

#adds the given list to the given FAISS index
def add_to_index(output_path: str, bulk_embeddings: Optional[List] = None):
    faiss_index = faiss.read_index(output_path)
    last_id = faiss.vector_to_array(faiss_index.id_map).max()
    new_start = last_id + 1
    new_embeddings = bulk_embeddings[new_start:]

    model = "CNN" if "CNN" in output_path else "DINO" if "DINO" in output_path else None

    #not the cleanest but we make do
    if model == "DINO":
        with torch.no_grad():
            for i, entry in enumerate(new_embeddings):
                id, label, img_path = get_label_path_index(entry, i)
                vectors = DINO_MODEL(DINO_helper.load_image(img_path).to(DEVICE))

                vector = vectors[0].cpu().numpy()

                vector = np.array(vector).reshape(1, -1)

                #vectors need to be normalized both before adding to the index and before searching
                normalize_L2(vector) #for the sake of using cosine similarity

                faiss_index.add_with_ids(vector, id)
    elif model == "CNN":
        for i, entry in enumerate(new_embeddings):
            id, label, img_path = get_label_path_index(entry, i)

            vector = CNN_MODEL.predict(CNN_helper.load_image(img_path), verbose=0)

            normalize_L2(vector)

            faiss_index.add_with_ids(vector, id)
        
            normalize_L2(vector) 
    else:
       print(f"Something went wonky - model string is {model}.")

    with open(output_path + '.paths.json', 'w') as f:
        json.dump(bulk_embeddings, f)

    faiss.write_index(faiss_index, output_path)
    print(f"Index created and saved to {output_path}")

    return faiss_index

#we can now try to predict....
def majority_voting_cosine(faiss_index_path, embeddings, search_image, k):
    query_vectors = []
    all_guesses = []
    winners = []

    mask_paths = search_image['masks']
    faiss_index = faiss.read_index(faiss_index_path)

    #matters bc each model outputs vectors of different shapes, so they need to have separate indices
    model = "CNN" if "CNN" in faiss_index_path else "DINO" if "DINO" in faiss_index_path else None
  
    if model == "CNN":
        for mask_path in mask_paths:
            query_vector=CNN_MODEL.predict(CNN_helper.load_image(mask_path), verbose=0)
            normalize_L2(query_vector)
            query_vectors.append(query_vector)
    if model == "DINO":
        for mask_path in mask_paths:
            vectors = DINO_MODEL(DINO_helper.load_image(mask_path).to(DEVICE))
            query_vector = vectors[0].cpu().numpy()
            query_vector = np.array(query_vector).reshape(1, -1)
            normalize_L2(query_vector)
            query_vectors.append(query_vector)

    #our vector needs to be normalized to search via cosine simiarity
    
    for query_vector in query_vectors:
        distances, indices = faiss_index.search(query_vector, k)

        neighbor_distances = []

        for i, index in enumerate(indices[0]):
            distance = distances[0][i]

            #kind of a mess. dealing with the json dictionary
            id = embeddings[index]['id']
            new_label = embeddings[index]['label']

            all_guesses.append(new_label)
            neighbor_distances.append(distance)
            print(f"Nearest neighbor {i+1}: {embeddings[index]}, Distance {distance}")

            majority_vote = Counter(all_guesses)
            winner = sorted(all_guesses, key=lambda x: majority_vote[x], reverse=True)[0]

        winners.append({ "winner": winner, "count": majority_vote[winner], "new_bird_flag":majority_vote[winner] <= k/2 or statistics.median(neighbor_distances) < 0.8})