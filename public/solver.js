/**
 * Traveling Salesman Problem Solver - Fixed Version
 * Changing start city does NOT change the graph or route
 */

// City layouts
const CITY_LAYOUTS = {
  random: function(count) {
    const cities = [];
    for(let i = 0; i < count; i++) {
      cities.push({
        x: 80 + Math.random() * 520,
        y: 60 + Math.random() * 380
      });
    }
    return cities;
  },
  
  circle: function(count) {
    const cities = [];
    const centerX = 325;
    const centerY = 250;
    const radius = 180;
    for(let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      cities.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return cities;
  },
  
  grid: function(count) {
    const cities = [];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacingX = 480 / cols;
    const spacingY = 380 / rows;
    const startX = 80;
    const startY = 60;
    
    for(let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      cities.push({
        x: startX + col * spacingX,
        y: startY + row * spacingY
      });
    }
    return cities;
  },
  
  cluster: function(count) {
    const cities = [];
    const clusters = 3;
    const clusterCenters = [
      {x: 150, y: 130},
      {x: 500, y: 130},
      {x: 325, y: 350}
    ];
    
    for(let i = 0; i < count; i++) {
      const cluster = i % clusters;
      const center = clusterCenters[cluster];
      cities.push({
        x: center.x + (Math.random() - 0.5) * 80,
        y: center.y + (Math.random() - 0.5) * 80
      });
    }
    return cities;
  }
};

// Calculate distance between two cities
function calculateDistance(city1, city2) {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate total tour distance including return to start
function calculateTotalDistance(cities, route) {
  let total = 0;
  for(let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(cities[route[i]], cities[route[i+1]]);
  }
  total += calculateDistance(cities[route[route.length-1]], cities[route[0]]);
  return total;
}

// TSP Solver Class
class TSPSolver {
  constructor(cities, startCity, existingRoute = null) {
    this.cities = cities;
    this.numCities = cities.length;
    this.startCity = startCity;
    this.route = [];
    this.bestRoute = [];
    this.distance = 0;
    this.bestDistance = Infinity;
    this.exploration = 100;
    this.iterations = 0;
    this.acceptedMoves = 0;
    this.rejectedMoves = 0;
    
    if(existingRoute) {
      // Use existing route but reorder to start at new start city
      this.route = this.reorderRouteToStart(existingRoute, startCity);
      this.distance = calculateTotalDistance(this.cities, this.route);
      this.bestRoute = [...this.route];
      this.bestDistance = this.distance;
    } else {
      this.randomInit();
    }
  }
  
  // Reorder existing route to start at new start city without changing the path
  reorderRouteToStart(route, newStartCity) {
    const index = route.indexOf(newStartCity);
    if(index === -1) return [...route];
    
    // Rotate route to start at newStartCity
    const newRoute = [...route.slice(index), ...route.slice(0, index)];
    return newRoute;
  }

  randomInit() {
    const otherCities = [];
    for(let i = 0; i < this.numCities; i++) {
      if(i !== this.startCity) {
        otherCities.push(i);
      }
    }
    
    for(let i = otherCities.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherCities[i], otherCities[j]] = [otherCities[j], otherCities[i]];
    }
    
    this.route = [this.startCity, ...otherCities];
    this.distance = calculateTotalDistance(this.cities, this.route);
    this.bestRoute = [...this.route];
    this.bestDistance = this.distance;
  }

  generateNeighbor() {
    const newRoute = [...this.route];
    let i = Math.floor(Math.random() * (this.numCities - 1)) + 1;
    let j = Math.floor(Math.random() * (this.numCities - 1)) + 1;
    while(i === j) {
      j = Math.floor(Math.random() * (this.numCities - 1)) + 1;
    }
    if(i > j) {
      [i, j] = [j, i];
    }
    
    while(i < j) {
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      i++;
      j--;
    }
    
    return newRoute;
  }

  getDeltaDistance(newRoute) {
    const oldDistance = this.distance;
    const newDistance = calculateTotalDistance(this.cities, newRoute);
    return newDistance - oldDistance;
  }

  step(exploration) {
    const newRoute = this.generateNeighbor();
    const delta = this.getDeltaDistance(newRoute);
    
    let accepted = false;
    
    if(delta < 0) {
      this.route = newRoute;
      this.distance += delta;
      accepted = true;
      this.acceptedMoves++;
    } else if(Math.random() < Math.exp(-delta / exploration)) {
      this.route = newRoute;
      this.distance += delta;
      accepted = true;
      this.acceptedMoves++;
    } else {
      this.rejectedMoves++;
    }
    
    if(this.distance < this.bestDistance) {
      this.bestDistance = this.distance;
      this.bestRoute = [...this.route];
    }
    
    return {accepted, delta, distance: this.distance, bestDistance: this.bestDistance};
  }

  solve(options) {
    const {
      initialExploration = 100,
      coolingRate = 0.999,
      minExploration = 0.01,
      maxIterations = 50000
    } = options;
    
    this.randomInit();
    this.exploration = initialExploration;
    this.iterations = 0;
    this.acceptedMoves = 0;
    this.rejectedMoves = 0;
    
    const steps = [];
    steps.push({
      iter: 0,
      exploration: this.exploration,
      distance: this.distance,
      bestDistance: this.bestDistance,
      route: [...this.route]
    });
    
    while(this.iterations < maxIterations && this.exploration > minExploration) {
      const result = this.step(this.exploration);
      this.iterations++;
      this.exploration *= coolingRate;
      
      if(this.iterations % 200 === 0 || result.bestDistance < steps[steps.length-1].bestDistance) {
        steps.push({
          iter: this.iterations,
          exploration: this.exploration,
          distance: this.distance,
          bestDistance: this.bestDistance,
          route: [...this.bestRoute],
          accepted: result.accepted,
          delta: result.delta
        });
      }
    }
    
    this.route = [...this.bestRoute];
    this.distance = this.bestDistance;
    
    return {
      route: this.bestRoute,
      distance: this.bestDistance,
      steps: steps,
      totalIterations: this.iterations,
      acceptedMoves: this.acceptedMoves,
      rejectedMoves: this.rejectedMoves
    };
  }
}

// Global variables
let cities = [];
let currentRoute = null;
let currentSolver = null;
let solving = false;
let animationId = null;
let steps = [];
let stepIndex = 0;
let canvas = null;
let ctx = null;

// Function to draw the map
function drawMap(route, startCityValue) {
  if(!canvas || !ctx) {
    console.error('Canvas not ready');
    return;
  }
  
  if(!cities || cities.length === 0) {
    console.log('No cities to draw');
    return;
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw a white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw connections if route exists
  if(route && route.length > 0) {
    // Draw forward connections (blue lines)
    for(let i = 0; i < route.length - 1; i++) {
      const city1 = cities[route[i]];
      const city2 = cities[route[i+1]];
      
      if(city1 && city2) {
        ctx.beginPath();
        ctx.moveTo(city1.x, city1.y);
        ctx.lineTo(city2.x, city2.y);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // Draw distance
        const dist = calculateDistance(city1, city2);
        const midX = (city1.x + city2.x) / 2;
        const midY = (city1.y + city2.y) / 2;
        ctx.font = '10px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(Math.round(dist), midX, midY - 5);
      }
    }
    
    // Draw return connection (red dashed line)
    const lastCity = cities[route[route.length-1]];
    const firstCity = cities[route[0]];
    
    if(lastCity && firstCity) {
      ctx.beginPath();
      ctx.moveTo(lastCity.x, lastCity.y);
      ctx.lineTo(firstCity.x, firstCity.y);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      const dist = calculateDistance(lastCity, firstCity);
      const midX = (lastCity.x + firstCity.x) / 2;
      const midY = (lastCity.y + firstCity.y) / 2;
      ctx.font = '10px Arial';
      ctx.fillStyle = '#e74c3c';
      ctx.fillText(Math.round(dist), midX, midY - 5);
    }
  }
  
  // Draw cities
  for(let i = 0; i < cities.length; i++) {
    const city = cities[i];
    if(!city) continue;
    
    // Draw shadow
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(city.x, city.y, 14, 0, Math.PI * 2);
    
    // Color based on start city
    if(i === startCityValue) {
      ctx.fillStyle = '#2ecc71';
    } else {
      ctx.fillStyle = '#3498db';
    }
    ctx.fill();
    
    // Inner white circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(city.x, city.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // City number
    ctx.shadowBlur = 0;
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((i + 1).toString(), city.x, city.y);
  }
  
  // Draw start label
  if(cities[startCityValue]) {
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('START', cities[startCityValue].x, cities[startCityValue].y - 18);
  }
}

// Function to generate new cities (called by New Cities button)
function generateNewCities() {
  const layoutSelect = document.getElementById('city-layout');
  const cityCountSelect = document.getElementById('city-count');
  
  const layout = layoutSelect ? layoutSelect.value : 'random';
  const count = cityCountSelect ? parseInt(cityCountSelect.value) : 10;
  
  const layoutFunc = CITY_LAYOUTS[layout];
  if(layoutFunc) {
    cities = layoutFunc(count);
  } else {
    cities = CITY_LAYOUTS.random(count);
  }
  
  // Update start city dropdown
  const startCitySelect = document.getElementById('start-city');
  if(startCitySelect) {
    startCitySelect.innerHTML = '';
    for(let i = 0; i < cities.length; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = 'City ' + (i + 1);
      startCitySelect.appendChild(option);
    }
    startCitySelect.value = '0';
  }
  
  // Create new solver with random route
  const startCity = 0;
  currentSolver = new TSPSolver(cities, startCity);
  currentSolver.randomInit();
  currentRoute = currentSolver.route;
  
  drawMap(currentRoute, startCity);
  
  // Update stats display
  const distanceEl = document.getElementById('distance');
  const bestDistanceEl = document.getElementById('best-distance');
  const statusEl = document.getElementById('status');
  
  if(distanceEl) distanceEl.textContent = Math.round(currentSolver.distance);
  if(bestDistanceEl) bestDistanceEl.textContent = Math.round(currentSolver.distance);
  if(statusEl) statusEl.textContent = 'Ready';
  
  // Update route info
  updateRouteInfo(currentRoute);
  addLog('Generated new random cities', 'info');
}

// Function to generate random route (called by Random Route button)
function generateRandomRoute() {
  if(solving) return;
  
  const startCitySelect = document.getElementById('start-city');
  const startCity = startCitySelect ? parseInt(startCitySelect.value) : 0;
  
  // Create new solver with same cities but new random route
  currentSolver = new TSPSolver(cities, startCity);
  currentSolver.randomInit();
  currentRoute = currentSolver.route;
  
  drawMap(currentRoute, startCity);
  
  // Update stats
  const distanceEl = document.getElementById('distance');
  const bestDistanceEl = document.getElementById('best-distance');
  
  if(distanceEl) distanceEl.textContent = Math.round(currentSolver.distance);
  if(bestDistanceEl) bestDistanceEl.textContent = Math.round(currentSolver.distance);
  
  updateRouteInfo(currentRoute);
  addLog('Generated new random route', 'info');
}

// Function to change start city only (does NOT change route)
function changeStartCity() {
  if(solving) return;
  
  const startCitySelect = document.getElementById('start-city');
  const newStartCity = startCitySelect ? parseInt(startCitySelect.value) : 0;
  
  if(currentRoute && currentRoute.length > 0) {
    // Reorder existing route to start at new city
    const reorderedRoute = reorderRouteToStart(currentRoute, newStartCity);
    currentRoute = reorderedRoute;
    
    // Update solver with new start city but same route
    currentSolver = new TSPSolver(cities, newStartCity, currentRoute);
    currentSolver.route = currentRoute;
    currentSolver.distance = calculateTotalDistance(cities, currentRoute);
    currentSolver.bestRoute = [...currentRoute];
    currentSolver.bestDistance = currentSolver.distance;
    
    drawMap(currentRoute, newStartCity);
    updateRouteInfo(currentRoute);
    addLog('Start city changed to City ' + (newStartCity + 1) + ' (route preserved)', 'info');
  }
}

// Helper function to reorder route to start at specific city
function reorderRouteToStart(route, newStartCity) {
  const index = route.indexOf(newStartCity);
  if(index === -1) return [...route];
  return [...route.slice(index), ...route.slice(0, index)];
}

// Update route info display
function updateRouteInfo(route) {
  const routeInfoEl = document.getElementById('route-info');
  const routeLengthEl = document.getElementById('route-length');
  
  if(!routeInfoEl) return;
  
  if(!route || route.length === 0) {
    routeInfoEl.textContent = 'No route selected';
    if(routeLengthEl) routeLengthEl.textContent = '';
    return;
  }
  
  const segments = [];
  for(let i = 0; i < route.length; i++) {
    segments.push(route[i] + 1);
  }
  segments.push(route[0] + 1);
  
  routeInfoEl.innerHTML = segments.join(' -> ');
  if(routeLengthEl) routeLengthEl.textContent = route.length + ' cities + return to start';
}

// Add log message
function addLog(message, type) {
  const logDiv = document.getElementById('log');
  if(!logDiv) return;
  
  const entry = document.createElement('div');
  entry.className = 'log-entry ' + (type || 'info');
  const time = new Date().toLocaleTimeString();
  entry.textContent = '[' + time + '] ' + message;
  logDiv.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  while(logDiv.children.length > 100) {
    logDiv.removeChild(logDiv.firstChild);
  }
}

// Update stats
function updateStats(iter, distance, bestDistance, exploration) {
  const iterationsEl = document.getElementById('iterations');
  const distanceEl = document.getElementById('distance');
  const bestDistanceEl = document.getElementById('best-distance');
  const explorationEl = document.getElementById('exploration');
  const explorationPercent = document.getElementById('exploration-percent');
  const explorationFill = document.getElementById('exploration-fill');
  
  if(iterationsEl) iterationsEl.textContent = iter.toLocaleString();
  if(distanceEl) distanceEl.textContent = Math.round(distance);
  if(bestDistanceEl) bestDistanceEl.textContent = Math.round(bestDistance);
  if(explorationEl) explorationEl.textContent = Math.floor(exploration) + '%';
  if(explorationPercent) explorationPercent.textContent = Math.floor(exploration) + '%';
  
  if(explorationFill) {
    const percent = Math.min(100, Math.floor((exploration / 100) * 100));
    explorationFill.style.width = percent + '%';
    
    if(exploration > 70) {
      explorationFill.style.background = 'linear-gradient(90deg, #e74c3c, #e67e22)';
    } else if(exploration > 30) {
      explorationFill.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
    } else {
      explorationFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
    }
  }
}

// Animation function
function animateSolving() {
  if(!solving || stepIndex >= steps.length) {
    if(solving) {
      solving = false;
      
      const solveBtn = document.getElementById('solve-btn');
      const resetBtn = document.getElementById('reset-btn');
      const randomBtn = document.getElementById('random-btn');
      const layoutSelect = document.getElementById('city-layout');
      const cityCountSelect = document.getElementById('city-count');
      const startCitySelect = document.getElementById('start-city');
      const statusEl = document.getElementById('status');
      
      if(solveBtn) solveBtn.disabled = false;
      if(resetBtn) resetBtn.disabled = false;
      if(randomBtn) randomBtn.disabled = false;
      if(layoutSelect) layoutSelect.disabled = false;
      if(cityCountSelect) cityCountSelect.disabled = false;
      if(startCitySelect) startCitySelect.disabled = false;
      if(statusEl) statusEl.textContent = 'Complete';
      
      if(animationId) {
        clearTimeout(animationId);
        animationId = null;
      }
      
      // Save the final route
      if(currentSolver) {
        currentRoute = currentSolver.bestRoute;
      }
      
      addLog('Optimization complete! Best distance: ' + Math.round(currentSolver.bestDistance), 'success');
    }
    return;
  }
  
  const step = steps[stepIndex];
  const startCitySelect = document.getElementById('start-city');
  const startCity = startCitySelect ? parseInt(startCitySelect.value) : 0;
  
  drawMap(step.route, startCity);
  updateStats(step.iter, step.distance, step.bestDistance, step.exploration);
  updateRouteInfo(step.route);
  
  if(stepIndex > 0 && step.bestDistance < steps[stepIndex-1].bestDistance) {
    const improvement = steps[stepIndex-1].bestDistance - step.bestDistance;
    addLog('Iter ' + step.iter + ': Improved by ' + Math.round(improvement) + ' to ' + Math.round(step.bestDistance), 'accept');
  }
  
  stepIndex++;
  animationId = setTimeout(animateSolving, 150);
}

// Start solving
function startSolving() {
  if(solving) return;
  
  solving = true;
  
  const solveBtn = document.getElementById('solve-btn');
  const resetBtn = document.getElementById('reset-btn');
  const randomBtn = document.getElementById('random-btn');
  const layoutSelect = document.getElementById('city-layout');
  const cityCountSelect = document.getElementById('city-count');
  const startCitySelect = document.getElementById('start-city');
  const statusEl = document.getElementById('status');
  
  if(solveBtn) solveBtn.disabled = true;
  if(resetBtn) resetBtn.disabled = true;
  if(randomBtn) randomBtn.disabled = true;
  if(layoutSelect) layoutSelect.disabled = true;
  if(cityCountSelect) cityCountSelect.disabled = true;
  if(startCitySelect) startCitySelect.disabled = true;
  if(statusEl) statusEl.textContent = 'Solving...';
  
  addLog('Starting Simulated Annealing...', 'info');
  
  const startCity = startCitySelect ? parseInt(startCitySelect.value) : 0;
  currentSolver = new TSPSolver(cities, startCity);
  
  const options = {
    initialExploration: 100,
    coolingRate: 0.999,
    minExploration: 0.01,
    maxIterations: 50000
  };
  
  const result = currentSolver.solve(options);
  steps = result.steps;
  stepIndex = 0;
  
  animateSolving();
}

// Initialize everything when page loads
window.onload = function() {
  console.log('Page loaded, initializing TSP solver');
  
  canvas = document.getElementById('map-canvas');
  if(!canvas) {
    console.error('Canvas not found!');
    return;
  }
  
  ctx = canvas.getContext('2d');
  console.log('Canvas found');
  
  // Set up event listeners
  const solveBtn = document.getElementById('solve-btn');
  const resetBtn = document.getElementById('reset-btn');
  const randomBtn = document.getElementById('random-btn');
  const layoutSelect = document.getElementById('city-layout');
  const cityCountSelect = document.getElementById('city-count');
  const startCitySelect = document.getElementById('start-city');
  
  if(solveBtn) solveBtn.addEventListener('click', startSolving);
  if(resetBtn) resetBtn.addEventListener('click', generateNewCities);
  if(randomBtn) randomBtn.addEventListener('click', generateRandomRoute);
  
  if(layoutSelect) {
    layoutSelect.addEventListener('change', function() {
      generateNewCities();
    });
  }
  
  if(cityCountSelect) {
    cityCountSelect.addEventListener('change', function() {
      generateNewCities();
    });
  }
  
  if(startCitySelect) {
    startCitySelect.addEventListener('change', function() {
      changeStartCity();
    });
  }
  
  // Generate initial cities
  generateNewCities();
  console.log('Initialization complete');
};