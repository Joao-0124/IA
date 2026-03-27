"""FastAPI server for graph search visualization."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from algoritmo import load_cities_from_csv

# Load graph once at startup
graph = load_cities_from_csv("cidades_mt.csv")

app = FastAPI(title="Graph Search API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    """Request model for search endpoint."""
    start: str
    target: str
    method: str  # "bfs" or "dfs"


class SearchResponse(BaseModel):
    """Response model for search endpoint."""
    found: bool
    visited: List[str]
    path: List[str]
    steps: List[Dict[str, Any]]  # For animation


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/states")
def get_states():
    """Get list of all states with city counts."""
    states = {}
    for city, state in graph.city_states.items():
        if state not in states:
            states[state] = 0
        states[state] += 1
    return {"states": sorted(states.keys()), "counts": states}

@app.get("/cities")
def get_cities(state: str = None):
    """Get list of all cities, optionally filtered by state."""
    if state:
        cities = [c for c, s in graph.city_states.items() if s == state]
        return {
            "cities": sorted(cities),
            "count": len(cities),
            "state": state
        }
    return {
        "cities": sorted(list(graph.cities.keys())),
        "count": len(graph.cities)
    }


@app.get("/graph")
def get_graph():
    """Get full graph structure with coordinates."""
    nodes = []
    edges = []
    
    # Create nodes with coordinates
    for city, (lat, lon) in graph.cities.items():
        state = graph.city_states.get(city, '')
        nodes.append({
            "id": city,
            "label": city,
            "lat": lat,
            "lon": lon,
            "state": state
        })
    
    # Create edges
    seen = set()
    for city, neighbors in graph.adj_list.items():
        for neighbor in neighbors:
            edge_key = tuple(sorted([city, neighbor]))
            if edge_key not in seen:
                edges.append({
                    "source": city,
                    "target": neighbor
                })
                seen.add(edge_key)
    
    return {
        "nodes": nodes,
        "edges": edges
    }


@app.post("/search")
def search(request: SearchRequest):
    """Execute search and return steps for animation."""
    
    # Validate inputs
    if request.start not in graph.cities:
        raise HTTPException(status_code=400, detail=f"Start city '{request.start}' not found")
    
    if request.target not in graph.cities:
        raise HTTPException(status_code=400, detail=f"Target city '{request.target}' not found")
    
    if request.method not in {"bfs", "dfs"}:
        raise HTTPException(status_code=400, detail="Method must be 'bfs' or 'dfs'")
    
    # Execute search
    if request.method == "bfs":
        result = graph.bfs(request.start, request.target)
        steps_gen = graph.bfs_steps(request.start, request.target)
    else:
        result = graph.dfs(request.start, request.target)
        steps_gen = graph.dfs_steps(request.start, request.target)
    
    # Convert steps generator to list
    steps = []
    for step in steps_gen:
        steps.append({
            "current": step["current"],
            "visited": list(step["visited"]),
            "found": step["found"]
        })
    
    return SearchResponse(
        found=result["found"],
        visited=result["visited"],
        path=result["path"],
        steps=steps
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
