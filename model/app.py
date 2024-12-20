from flask import Flask, request, jsonify, render_template
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
import pickle
import requests
import pandas as pd
import os 

with open('sentence_transformer_model.pkl', 'rb') as file:
    model = pickle.load(file)

with open('movie_embeddings.pkl', 'rb') as file:
    movies_embeddings = pickle.load(file)

movies = pd.read_csv('movies.csv')

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "API is working"

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    query = data['query']
    top_n = data['top_n']

    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding, movies_embeddings)[0]
    top_indices = similarities.argsort()[-top_n:][::-1]
    recommendations = movies.iloc[top_indices]

    movie_titles = recommendations['title'].tolist()
    moviesList = ["+".join(title.split()[:-1]) for title in movie_titles]
    print(moviesList)

    omdb_responses = []
    for movie in moviesList:
        response = requests.get(f'http://www.omdbapi.com/?i=tt3896198&apikey=e868bc26&t={movie}')
        if response.status_code == 200:
            omdb_responses.append(response.json())
        else:
            omdb_responses.append({"error": f'failed to fetch dara for {movie}'})
    
    return omdb_responses

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))