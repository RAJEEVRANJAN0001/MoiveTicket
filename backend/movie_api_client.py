#!/usr/bin/env python3
"""
Movie Database API Client
Fetches movie information from the Movies Database API using RapidAPI
"""

import requests
import json
import time
from typing import List, Dict, Optional


class MovieAPIClient:
    """Client for interacting with Movies Database API via RapidAPI"""
    
    def __init__(self, api_key: str = "ec0fb418acmshf8571fa5e5a3f65p1ba2b6jsnbff1edff123d"):
        self.base_url = "https://moviesdatabase.p.rapidapi.com"
        self.headers = {
            "x-rapidapi-host": "moviesdatabase.p.rapidapi.com",
            "x-rapidapi-key": api_key
        }
    
    def get_main_actors(self, movie_id: str) -> Optional[List[str]]:
        """
        Fetch main actors for a specific movie ID
        
        Args:
            movie_id (str): The movie ID to fetch actors for
            
        Returns:
            List[str]: List of main actor names, or None if error occurred
        """
        try:
            endpoint = f"{self.base_url}/titles/{movie_id}/main_actors"
            
            print(f"🎬 Fetching main actors for movie ID: {movie_id}")
            response = requests.get(endpoint, headers=self.headers, timeout=10)
            
            # Check if request was successful
            if response.status_code == 200:
                data = response.json()
                
                # Extract actor names from the response
                actors = []
                if 'results' in data:
                    for actor_info in data['results']:
                        if 'nameText' in actor_info and 'text' in actor_info['nameText']:
                            actors.append(actor_info['nameText']['text'])
                
                return actors if actors else []
                
            elif response.status_code == 404:
                print(f"❌ Movie ID '{movie_id}' not found")
                return None
            elif response.status_code == 429:
                print("⚠️  Rate limit exceeded. Please wait and try again.")
                return None
            else:
                print(f"❌ API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("⏰ Request timed out. Please check your internet connection.")
            return None
        except requests.exceptions.ConnectionError:
            print("🌐 Connection error. Please check your internet connection.")
            return None
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {str(e)}")
            return None
        except json.JSONDecodeError:
            print("❌ Invalid JSON response from API")
            return None
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return None
    
    def get_multiple_movie_actors(self, movie_ids: List[str], delay: float = 1.0) -> Dict[str, List[str]]:
        """
        Fetch main actors for multiple movie IDs
        
        Args:
            movie_ids (List[str]): List of movie IDs
            delay (float): Delay between requests to respect rate limits
            
        Returns:
            Dict[str, List[str]]: Dictionary mapping movie IDs to actor lists
        """
        results = {}
        
        for i, movie_id in enumerate(movie_ids):
            print(f"\n📡 Processing {i+1}/{len(movie_ids)}")
            actors = self.get_main_actors(movie_id)
            
            if actors is not None:
                results[movie_id] = actors
                print(f"✅ Found {len(actors)} actors")
            else:
                results[movie_id] = []
                print("❌ No actors found")
            
            # Add delay between requests to respect rate limits
            if i < len(movie_ids) - 1:
                time.sleep(delay)
        
        return results


def print_actors_formatted(movie_id: str, actors: List[str]):
    """Print actors in a nicely formatted way"""
    print(f"\n🎭 Main Actors for Movie ID: {movie_id}")
    print("=" * 50)
    
    if not actors:
        print("No main actors found for this movie.")
        return
    
    for i, actor in enumerate(actors, 1):
        print(f"{i:2d}. {actor}")
    
    print(f"\nTotal: {len(actors)} main actors")


def main():
    """Main function demonstrating the usage"""
    # Initialize the API client
    client = MovieAPIClient()
    
    print("🎬 Movie Database API Client")
    print("=" * 40)
    
    # Example 1: Single movie
    print("\n📍 Example 1: Single Movie")
    movie_id = "tt0111161"  # The Shawshank Redemption
    actors = client.get_main_actors(movie_id)
    
    if actors is not None:
        print_actors_formatted(movie_id, actors)
    
    # Example 2: Multiple movies
    print("\n📍 Example 2: Multiple Movies")
    movie_ids = [
        "tt0111161",  # The Shawshank Redemption
        "tt0068646",  # The Godfather
        "tt0071562",  # The Godfather Part II
        "tt0468569",  # The Dark Knight
        "tt0050083"   # 12 Angry Men
    ]
    
    movie_names = {
        "tt0111161": "The Shawshank Redemption",
        "tt0068646": "The Godfather",
        "tt0071562": "The Godfather Part II", 
        "tt0468569": "The Dark Knight",
        "tt0050083": "12 Angry Men"
    }
    
    results = client.get_multiple_movie_actors(movie_ids, delay=1.5)
    
    print("\n🎯 FINAL RESULTS")
    print("=" * 60)
    
    for movie_id, actors in results.items():
        movie_name = movie_names.get(movie_id, "Unknown Movie")
        print(f"\n🎬 {movie_name} ({movie_id})")
        print("-" * (len(movie_name) + len(movie_id) + 5))
        
        if actors:
            for i, actor in enumerate(actors[:5], 1):  # Show top 5 actors
                print(f"  {i}. {actor}")
            if len(actors) > 5:
                print(f"  ... and {len(actors) - 5} more")
        else:
            print("  No actors found")


if __name__ == "__main__":
    main()