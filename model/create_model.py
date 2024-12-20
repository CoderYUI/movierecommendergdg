import pandas as pd
import sentence_transformers as SentenceTransformer
import torch
import torch.nn.functional as F
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer , AutoModel


movies = pd.read_csv('movies.csv')
print(f"Loaded {len(movies)} movies")
print(movies.head(3))

movies['desc'] = 'Title: ' + movies['title'] + ',genre: ' + movies['genres']
print(movies.head(3))

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min = 1e-9)

tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')

def get_recommends(query, embeddings, df, top_n = 5):
    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding, embeddings)
    top_indices = similarities[0].argsort()[-top_n:][::-1]
    return top_indices

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
model_embeddings = model.encode(movies['desc'].tolist())

def get_recommends(query, embeddings, df, top_n = 5):
    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding, embeddings)
    top_indices = similarities[0].argsort()[-top_n:][::-1]
    return top_indices

with open('sentence_transformer_model.pkl', 'wb') as file:
    pickle.dump(model, file)

with open('movie_embeddings.pkl', 'wb') as file:
    pickle.dump(model_embeddings, file)