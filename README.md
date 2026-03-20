# 🗺️ Sistema de Busca em Grafos - Visualização Interativa

Sistema completo de visualização interativa de **Busca em Largura (BFS)** e **Busca em Profundidade (DFS)** com dados reais de cidades de Mato Grosso.

## 🏗️ Arquitetura

- **Backend**: Python + FastAPI (API REST)
- **Frontend**: React + Vite + Cytoscape.js (Visualização de Grafos)
- **Dados**: CSV com 14 cidades principais de MT com coordenadas geográficas

## 📋 Pré-requisitos

- Python 3.10+
- Node.js 18+ e npm
- Git (opcional)

## 🚀 Como Executar

### 1️⃣ Backend (Python API)

```bash
# Instalar dependências (já feito)
pip install fastapi uvicorn pydantic python-multipart

# Iniciar servidor
python api.py
```

O servidor estará disponível em: **http://127.0.0.1:8000**

Documentação interativa: **http://127.0.0.1:8000/docs**

### 2️⃣ Frontend (React)

```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 📁 Estrutura de Arquivos

```
IA/
├── algoritmo.py          # Classe Graph com BFS/DFS
├── api.py               # API FastAPI
├── cidades_mt.csv       # Base de dados
├── frontend/            # Projeto React
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── App.css          # Estilos do App
│   │   ├── GraphVisualizer.jsx    # Visualizador do grafo
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Estilos globais
│   ├── public/
│   ├── index.html       # HTML principal
│   ├── vite.config.js   # Configuração Vite
│   └── package.json     # Dependências npm
└── README.md            # Este arquivo
```

## 🎨 Funcionalidades

✅ **Interface Interativa**
- Seleção de cidades de origem e destino
- Escolha entre BFS e DFS
- Controle de velocidade da animação

✅ **Visualização em Tempo Real**
- Grafo com nós posicionados geograficamente
- Animação suave das buscas
- Cores intuitivas:
  - 🟩 **Verde**: Nó sendo visitado
  - 🟧 **Laranja**: Nós já visitados
  - 🔵 **Azul claro**: Nós não visitados

✅ **Algoritmos Implementados**
- **BFS (Busca em Largura)**: Explora nível por nível
- **DFS (Busca em Profundidade)**: Aprofunda em um ramo antes de voltar

✅ **Dados Reais**
- 14 cidades principais de Mato Grosso
- Conexões por vizinhança geográfica (até 300 km)
- Cálculo de distância usando fórmula de Haversine

## 🔗 API REST - Endpoints

### GET /cities
Lista todas as cidades disponíveis.

```json
{
  "cities": ["Cuiabá", "Várzea Grande", ...],
  "count": 14
}
```

### GET /graph
Retorna estrutura completa do grafo.

```json
{
  "nodes": [
    {"id": "Cuiabá", "label": "Cuiabá", "lat": -15.5945, "lon": -56.0949},
    ...
  ],
  "edges": [
    {"source": "Cuiabá", "target": "Várzea Grande"},
    ...
  ]
}
```

### POST /search
Executa uma busca BFS/DFS.

**Request:**
```json
{
  "start": "Cuiabá",
  "target": "Sinop",
  "method": "bfs"
}
```

**Response:**
```json
{
  "found": true,
  "visited": ["Cuiabá", "Várzea Grande", ...],
  "path": ["Cuiabá", "Tangará da Serra", "Lucas do Rio Verde", "Sinop"],
  "steps": [
    {"current": "Cuiabá", "visited": ["Cuiabá"], "found": false},
    {"current": "Várzea Grande", "visited": ["Cuiabá", "Várzea Grande"], "found": false},
    ...
  ]
}
```

## 📊 Exemplo de Uso

1. **Abra o navegador** em http://localhost:3000
2. **Selecione a cidade de origem** (ex: Cuiabá)
3. **Selecione a cidade de destino** (ex: Sinop)
4. **Escolha o tipo de busca** (Largura ou Profundidade)
5. **Clique em "Play"** para iniciar a animação
6. Observe o grafo com nós mudando de cor conforme o algoritmo executa

## 🎯 Casos de Teste

| Busca | Origem | Destino | Cidades Visitadas | Caminho Mais Curto |
|-------|--------|---------|-------------------|--------------------|
| BFS | Cuiabá | Sinop | 12 | Cuiabá → Tangará da Serra → Lucas do Rio Verde → Sinop |
| DFS | Cuiabá | Cáceres | 14 | Cuiabá → Várzea Grande → Rondonópolis → ... → Cáceres |

## 🛠️ Troubleshooting

### API não conecta
- Verifique se o servidor Python está rodando: `http://127.0.0.1:8000`
- Verifique CORS na API (já configurado)

### Grafo não aparece
- Verifique o console do navegador (F12)
- Certifique-se que `cidades_mt.csv` está no mesmo diretório que `api.py`

### npm install falhando
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

## 📚 Tecnologias Utilizadas

- **FastAPI**: Framework Python para APIs
- **Uvicorn**: Servidor ASGI
- **React 18**: UI library
- **Vite**: Build tool
- **Cytoscape.js**: Visualização de grafos
- **Axios**: Cliente HTTP
- **CSS3**: Estilos

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais.

## 🤝 Contribuições

Para melhorias ou sugestões, abra uma issue ou pull request!

---

**Desenvolvido com ❤️ para aprender sobre Estruturas de Dados e Algoritmos**
