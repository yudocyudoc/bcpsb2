// src\game\scenes\ObservatoryScene.ts
import { Scene, GameObjects } from 'phaser';
import { PlanetFactory, PlanetType } from '../utils/PlanetFactory';

interface PlanetData {
  container: GameObjects.Container;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  centerX: number;
  centerY: number;
}

export class ObservatoryScene extends Scene {
  private planetFactory!: PlanetFactory;
  private planets: PlanetData[] = [];
  private stars: GameObjects.Arc[] = [];

  constructor() {
    super('ObservatoryScene');
  }

  create() {
    // Inicializar la fábrica de planetas
    this.planetFactory = new PlanetFactory(this);
    
    // Crear fondo estrellado
    this.createStarField();
    
    // Crear sistema planetario
    this.createPlanetarySystem();
  }

  private createStarField() {
    // Crear estrellas de fondo más sutiles para no competir con los planetas
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.Between(1, 2);
      const brightness = Phaser.Math.FloatBetween(0.2, 0.6);
      
      const star = this.add.circle(x, y, size, 0xffffff, brightness);
      this.stars.push(star);
      
      // Parpadeo aleatorio
      if (Math.random() > 0.8) {
        this.tweens.add({
          targets: star,
          alpha: 0.1,
          duration: Phaser.Math.Between(3000, 6000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  private createPlanetarySystem() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Sol central (estrella)
    const sun = this.add.container(centerX, centerY);
    const sunCore = this.add.circle(0, 0, 40, 0xffd700);
    const sunGlow = this.add.circle(0, 0, 60, 0xffa500, 0.3);
    const sunFlare = this.add.circle(0, 0, 80, 0xff4500, 0.1);
    
    sunGlow.setBlendMode(Phaser.BlendModes.ADD);
    sunFlare.setBlendMode(Phaser.BlendModes.ADD);
    sun.add([sunFlare, sunGlow, sunCore]);
    
    // Animación del sol
    this.tweens.add({
      targets: sun,
      rotation: Math.PI * 2,
      duration: 10000,
      repeat: -1,
      ease: 'none'
    });
    
    // Configuración de planetas (tipo, distancia, velocidad, tamaño)
    const planetConfigs = [
      { type: PlanetType.ROCKY, radius: 120, speed: 0.02, size: 20 },
      { type: PlanetType.EARTH, radius: 180, speed: 0.015, size: 35 },
      { type: PlanetType.MARS, radius: 240, speed: 0.012, size: 25 },
      { type: PlanetType.GAS_GIANT, radius: 320, speed: 0.008, size: 50 },
      { type: PlanetType.RINGS, radius: 400, speed: 0.006, size: 45 },
      { type: PlanetType.ICE, radius: 480, speed: 0.004, size: 30 },
      { type: PlanetType.ALIEN, radius: 560, speed: 0.003, size: 28 }
    ];
    
    // Crear planetas
    planetConfigs.forEach((config, index) => {
      // Crear órbita visible
      const orbit = this.add.graphics();
      orbit.lineStyle(1, 0x333333, 0.3);
      orbit.strokeCircle(centerX, centerY, config.radius);
      
      // Crear planeta
      const planet = this.planetFactory.createPlanet(
        centerX + config.radius, 
        centerY, 
        config.size, 
        config.type
      );
      
      // Configurar datos del planeta
      const planetData: PlanetData = {
        container: planet,
        orbitRadius: config.radius,
        orbitSpeed: config.speed,
        orbitAngle: (index * Math.PI * 2) / planetConfigs.length, // Distribuir uniformemente
        centerX: centerX,
        centerY: centerY
      };
      
      this.planets.push(planetData);
      
      // Añadir rotación propia al planeta
      this.tweens.add({
        targets: planet,
        rotation: Math.PI * 2,
        duration: 15000 + index * 5000, // Diferentes velocidades de rotación
        repeat: -1,
        ease: 'none'
      });
    });
    
    // Crear algunos asteroides aleatorios
    this.createAsteroidBelt(centerX, centerY, 280, 300);
  }

  private createAsteroidBelt(centerX: number, centerY: number, innerRadius: number, outerRadius: number) {
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.5;
      const distance = Phaser.Math.Between(innerRadius, outerRadius);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const asteroidSize = Phaser.Math.Between(2, 6);
      const asteroid = this.add.circle(x, y, asteroidSize, 0x696969, 0.8);
      
      // Órbita lenta de asteroides
      this.tweens.add({
        targets: asteroid,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(20000, 40000),
        repeat: -1,
        ease: 'none'
      });
    }
  }

  update() {
    // Actualizar órbitas de todos los planetas
    this.planets.forEach(planetData => {
      // Incrementar ángulo de órbita
      planetData.orbitAngle += planetData.orbitSpeed;
      
      // Calcular nueva posición
      const newX = planetData.centerX + Math.cos(planetData.orbitAngle) * planetData.orbitRadius;
      const newY = planetData.centerY + Math.sin(planetData.orbitAngle) * planetData.orbitRadius;
      
      // Actualizar posición del planeta
      planetData.container.setPosition(newX, newY);
    });
    
    // Efecto sutil de parpadeo en las estrellas
    if (this.time.now % 500 < 16) { // Aproximadamente cada 0.5 segundos
      const randomStar = this.stars[Math.floor(Math.random() * this.stars.length)];
      if (randomStar) {
        randomStar.alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      }
    }
  }
}