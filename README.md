# Traveling Salesman Problem - Simulated Annealing

A visual implementation of the Traveling Salesman Problem (TSP) solver using the Simulated Annealing algorithm. Watch as the algorithm finds the shortest route that visits all cities and returns to the starting point.

## What is the Traveling Salesman Problem?

The Traveling Salesman Problem asks: "Given a list of cities and distances between them, what is the shortest possible route that visits each city exactly once and returns to the starting city?"

It's a classic optimization problem used in logistics, route planning, and circuit design.

## How Simulated Annealing Works

Simulated Annealing is inspired by the process of annealing in metallurgy, where metal is heated and slowly cooled to remove defects.

### Simple Explanation

1. **Start with a random route** connecting all cities
2. **Calculate total distance** (higher distance = worse solution)
3. **Try a small change** (swap two cities in the route)
4. **Decision process:**
   - If the new route is shorter → always accept it
   - If the new route is longer → sometimes accept it anyway
5. **Gradually reduce "exploration"** over time
6. **Repeat** until route is optimized

### Exploration Level

Instead of "temperature", we use "exploration level" to make it easier to understand:

| Exploration Level | Behavior                     | Purpose                               |
| ----------------- | ---------------------------- | ------------------------------------- |
| **High (100%)**   | Accepts many bad routes      | Explores widely, avoids getting stuck |
| **Medium (50%)**  | Sometimes accepts bad routes | Balances exploration and improvement  |
| **Low (10%)**     | Rarely accepts bad routes    | Refines the best route found          |
| **Very Low (1%)** | Only accepts improvements    | Final optimization phase              |

The exploration level starts at 100% and slowly decreases to 0% over thousands of iterations. This allows the algorithm to first explore many possible routes, then gradually focus on improving the best ones.

## Features

- **4 Different City Layouts:**
  - Random Cities - Random positions
  - Circle Pattern - Cities arranged in a circle
  - Grid Pattern - Cities in grid formation
  - Clusters Pattern - Cities grouped in clusters

- **Adjustable City Count:** 8 to 20 cities

- **Real-time Visualization:** Watch the route evolve

- **Detailed Logging:** Shows improvements and exploration level

- **Exploration Level Bar:** Visual indicator of current exploration

## How to Run

### Prerequisites

- Node.js installed on your computer
- Modern web browser

### Steps

1. **Start the server:**
   ```bash
   node server.js
   ```
