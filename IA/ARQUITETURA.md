# 🏗️ Arquitetura do Sistema - Busca em Grafos Interativa

## 📊 Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DO USUÁRIO                         │
│              http://localhost:3000 (React App)                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │   HTTP    │   WebSocket  │   (Axios + CORS)
          │          │             │
┌─────────▼──────────▼──────────────▼────────────────────────┐
│                    FASTAPI SERVER                           │
│              http://127.0.0.1:8000                         │
│                                                             │
│  • GET  /cities        → Lista cidades                      │
│  • GET  /graph        → Estrutura do grafo                 │
│  • POST /search       → Executa BFS/DFS                    │
│  • GET  /docs         → Documentação interativa            │
└──────────────┬───────────────────────────────────────────────┘
               │
          ┌────┴──────────┐
          │               │
    ┌─────▼────────┐  ┌──▼───────────────────┐
    │ algoritmo.py │  │  cidades_mt.csv      │
    │              │  │  (14 cidades + coords)│
    │  • Graph()   │  └──────────────────────┘
    │  • bfs()     │
    │  • dfs()     │
    │  • bfs_steps()
    │  • dfs_steps()
    └──────────────┘
```

---

## 🔌 Componentes Detalhados

### 1️⃣ Backend (Python + FastAPI)

#### Arquivo: `api.py`

**Responsabilidades**:
- Servir como API REST
- Validar inputs do usuário
- Chamar algoritmos de busca
- Retornar dados para animação

**Endpoints**:

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/cities` | Lista todas as cidades |
| GET | `/graph` | Retorna nós e arestas do grafo |
| POST | `/search` | Executa BFS/DFS e retorna steps |

**Exemplo de Request POST /search**:
```json
{
  "start": "Cuiabá",
  "target": "Sinop",
  "method": "bfs"
}
```

**Exemplo de Response**:
```json
{
  "found": true,
  "visited": ["Cuiabá", "Várzea Grande", ...],
  "path": ["Cuiabá", "Tangará da Serra", "Lucas do Rio Verde", "Sinop"],
  "steps": [
    {"current": "Cuiabá", "visited": ["Cuiabá"], "found": false},
    {"current": "Várzea Grande", "visited": ["Cuiabá", "Várzea Grande"], "found": false},
    ...
    {"current": "Sinop", "visited": [...], "found": true}
  ]
}
```

### 2️⃣ Core Algorithm (Python)

#### Arquivo: `algoritmo.py`

**Classe**: `Graph`

**Métodos principais**:

```python
# Adicionar cidades
add_city(name: str, lat: float, lon: float)

# Construir conexões (até 300km)
build_neighbors(max_distance: float)

# Busca em Largura
bfs(start: str, target: str) -> dict
  → retorna: {"found": bool, "visited": [...], "path": [...]}

# Busca em Profundidade
dfs(start: str, target: str) -> dict
  → retorna: {"found": bool, "visited": [...], "path": [...]}

# Geradores para animação
bfs_steps(start: str, target: str) -> Iterator[dict]
dfs_steps(start: str, target: str) -> Iterator[dict]
```

**Algoritmo BFS**:
```
visited = {start}
queue = [start]
path = []

while queue:
    node = queue.pop(0)
    path.append(node)
    
    if node == target:
        return path, visited
    
    for neighbor in adj_list[node]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)
```

**Algoritmo DFS**:
```
visited = {}
stack = [start]
path = []

while stack:
    node = stack.pop()
    
    if node not in visited:
        visited.add(node)
        path.append(node)
        
        if node == target:
            return path, visited
        
        for neighbor in reversed(adj_list[node]):
            if neighbor not in visited:
                stack.append(neighbor)
```

### 3️⃣ Frontend (React + Vite)

#### Arquivo: `App.jsx`

**Responsabilidades**:
- Interface do usuário
- Gerenciar estado da aplicação
- Fazer requests à API
- Controlar animação

**Estado**:
```javascript
const [cities, setCities] = useState([])         // Lista de cidades
const [startCity, setStartCity] = useState('')   // Cidade origem
const [targetCity, setTargetCity] = useState('') // Cidade destino
const [method, setMethod] = useState('bfs')      // BFS ou DFS
const [graphData, setGraphData] = useState(null) // Dados do grafo
const [animationSteps, setAnimationSteps] = useState([]) // Steps para animar
const [isAnimating, setIsAnimating] = useState(false)    // Flag animação
```

**Fluxo**:
1. Component Mount → Carrega cidades e grafo
2. Usuário seleciona origem/destino
3. Usuário clica "Play"
4. Faz POST /search
5. Recebe `steps` do servidor
6. Passa `steps` para GraphVisualizer
7. GraphVisualizer anima nó por nó

#### Arquivo: `GraphVisualizer.jsx`

**Responsabilidades**:
- Desenhar grafo com Cytoscape.js
- Animar alterações de cores dos nós
- Normalizar coordenadas geográficas para posições na tela

**Processo de Posicionamento**:
```
Lat/Lon (geográficas) → Normalizar para [0,1] → Mapear para pixel [x,y]

x = ((lon - lonMin) / (lonMax - lonMin)) * width
y = ((latMax - lat) / (latMax - latMin)) * height
```

**Estados dos Nós**:
- **Azul claro** (#c5d9f1): Não visitado
- **Verde** (#2ecc71): Sendo visitado agora
- **Laranja** (#f39c12): Já visitado

### 4️⃣ Dados (CSV)

#### Arquivo: `cidades_mt.csv`

```csv
cidade,latitude,longitude
Cuiabá,-15.5945,-56.0949
Várzea Grande,-15.6499,-56.1386
Rondonópolis,-16.4674,-54.6345
...
```

**Processamento**:
1. Lê CSV
2. Cria nós no grafo
3. Calcula distâncias (Haversine)
4. Conecta cidades com  ≤ 300km

---

## 🔄 Fluxo Completo de uma Busca

### Passo 1: Usuário inicia busca

```
React (App.jsx)
    ↓ handlePlay()
    ├ Valida inputs
    ├ POST /search com {start, target, method}
    └ Aguarda resposta
```

### Passo 2: Backend processa

```
FastAPI (api.py)
    ↓ /search endpoint
    ├ Valida cidades
    ├ Chama graph.bfs() ou graph.dfs()
    │   ↑
    │   └ algoritmo.py - Graph.bfs/dfs()
    │       ├ Inicializa estruturas (visited, queue/stack)
    │       ├ Loop principal iterando nós
    │       └ Retorna {found, visited, path}
    │
    └ Converte steps_generator para list
    └ Retorna JSON resposta
```

### Passo 3: Frontend recebe e anima

```
React (App.jsx)
    ↓ Recebe resposta
    ├ setAnimationSteps(data.steps)
    ├ setIsAnimating(true)
    └ Passa para GraphVisualizer
        ↓
        GraphVisualizer (GraphVisualizer.jsx)
            ├ useEffect com setInterval
            ├ Itera sobre animationSteps
            ├ A cada passo: cy.nodes().style(...)
            └ Atualiza cores baseado em "current" e "visited"
```

---

## 🌍 Distribuição Geográfica

As cidades são posicionadas no grafo de acordo com suas coordenadas reais usando a fórmula de normalização:

```
NORTE (Sinop, Alta Floresta)     ┌────────┐
                                 │        │
                                 │ MT     │
OESTE (Cáceres)  ◄────────────►  │ Brasil │  ► LESTE (Barra do Garças)
                                 │        │
CENTRO (Cuiabá, Várzea Grande)   │        │
                                 │        │
SUL (Rondonópolis)               └────────┘
```

---

## 📉 Complexidade do Algoritmo

### BFS - Busca em Largura
- **Tempo**: O(V + E) onde V = vértices, E = arestas
- **Espaço**: O(V) para fila
- **Uso**: Encontrar caminho mais curto

### DFS - Busca em Profundidade
- **Tempo**: O(V + E)
- **Espaço**: O(V) para stack
- **Uso**: Exploração profunda

Para nosso grafo:
- V = 14 cidades
- E ≈ 40 conexões
- Tempo de execução: < 1ms

---

## 🔐 Segurança

1. **CORS Habilitado**: Permite requisições do frontend ao backend
2. **Validação de Input**: Verifica se cidades existem
3. **Tratamento de Erros**: Retorna HTTP errors apropriados
4. **Isolamento**: Backend e Frontend isolados

---

## 🚀 Escalabilidade

**Para aumentar o número de cidades**:

1. Adicionar linhas ao `cidades_mt.csv`
2. Aumentar `max_distance` em `build_neighbors()` se necessário
3. Frontend escala automaticamente

**Performance**:
- Até 100 cidades: Sem problemas
- Até 1000 cidades: Pode ficar lento em DFS
- Maiores: Otimizar com hashmap e índices

---

## 📚 Referências

- **BFS**: https://en.wikipedia.org/wiki/Breadth-first_search
- **DFS**: https://en.wikipedia.org/wiki/Depth-first_search
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Cytoscape.js**: https://js.cytoscape.org/

---

**Criado com ❤️ para fins educacionais**
