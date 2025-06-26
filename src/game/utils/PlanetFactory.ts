// src/game/utils/PlanetFactory.ts
import { Scene, GameObjects } from 'phaser';

export const PlanetType = {
    EARTH: 'earth',
    MARS: 'mars', 
    GAS_GIANT: 'gas_giant',
    ICE: 'ice',
    ROCKY: 'rocky',
    LAVA: 'lava',
    CRYSTAL: 'crystal',
    ALIEN: 'alien',
    RINGS: 'rings'
} as const;
export type PlanetType = typeof PlanetType[keyof typeof PlanetType];


export class PlanetFactory {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  createPlanet(x: number, y: number, radius: number, type: PlanetType): GameObjects.Container {
    const container = this.scene.add.container(x, y);

    switch (type) {
      case PlanetType.EARTH:
        return this.createEarthPlanet(container, radius);
      case PlanetType.MARS:
        return this.createMarsPlanet(container, radius);
      case PlanetType.GAS_GIANT:
        return this.createGasGiant(container, radius);
      case PlanetType.ICE:
        return this.createIcePlanet(container, radius);
      case PlanetType.ROCKY:
        return this.createRockyPlanet(container, radius);
      case PlanetType.LAVA:
        return this.createLavaPlanet(container, radius);
      case PlanetType.CRYSTAL:
        return this.createCrystalPlanet(container, radius);
      case PlanetType.ALIEN:
        return this.createAlienPlanet(container, radius);
      case PlanetType.RINGS:
        return this.createRingedPlanet(container, radius);
      default:
        return this.createBasicPlanet(container, radius);
    }
  }

  private createEarthPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base azul del océano
    const ocean = this.scene.add.circle(0, 0, radius, 0x1e6ba8);
    
    // Continentes usando Graphics para formas irregulares
    const continents = this.scene.add.graphics();
    continents.fillStyle(0x228b22);
    
    // Dibujar continentes como formas orgánicas
    this.drawContinent(continents, -radius * 0.3, -radius * 0.2, radius * 0.4);
    this.drawContinent(continents, radius * 0.2, radius * 0.3, radius * 0.3);
    this.drawContinent(continents, -radius * 0.1, radius * 0.4, radius * 0.25);
    
    // Nubes usando círculos semitransparentes
    const clouds = this.createClouds(radius);
    
    // Atmósfera (brillo exterior)
    const atmosphere = this.scene.add.circle(0, 0, radius * 1.1, 0x87ceeb, 0.2);
    atmosphere.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([ocean, continents, clouds, atmosphere]);
    
    // Animación de rotación de nubes
    this.scene.tweens.add({
      targets: clouds,
      rotation: Math.PI * 2,
      duration: 30000,
      repeat: -1,
      ease: 'none'
    });
    
    return container;
  }

  private createMarsPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base rojiza
    const base = this.scene.add.circle(0, 0, radius, 0x8b4513);
    
    // Capas de diferentes tonos rojos
    const layer1 = this.scene.add.circle(0, 0, radius * 0.9, 0xcd853f);
    const layer2 = this.scene.add.circle(0, 0, radius * 0.7, 0xa0522d);
    
    // Casquetes polares
    const polarCap1 = this.scene.add.circle(0, -radius * 0.7, radius * 0.3, 0xffffff, 0.8);
    const polarCap2 = this.scene.add.circle(0, radius * 0.7, radius * 0.2, 0xffffff, 0.6);
    
    // Cráteres usando círculos más oscuros
    const crater1 = this.scene.add.circle(-radius * 0.3, radius * 0.2, radius * 0.15, 0x654321, 0.7);
    const crater2 = this.scene.add.circle(radius * 0.4, -radius * 0.3, radius * 0.1, 0x654321, 0.6);
    
    container.add([base, layer1, layer2, crater1, crater2, polarCap1, polarCap2]);
    return container;
  }

  private createGasGiant(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base del gigante gaseoso
    const base = this.scene.add.circle(0, 0, radius, 0x4169e1);
    
    // Bandas atmosféricas usando Graphics
    const bands = this.scene.add.graphics();
    const bandColors = [0x6495ed, 0x4682b4, 0x1e90ff, 0x87ceeb];
    
    for (let i = 0; i < 4; i++) {
      const bandY = -radius * 0.6 + (i * radius * 0.3);
      const bandHeight = radius * 0.2;
      
      bands.fillStyle(bandColors[i], 0.7);
      bands.fillEllipse(0, bandY, radius * 2, bandHeight);
    }
    
    // Gran mancha (como Júpiter)
    const greatSpot = this.scene.add.ellipse(-radius * 0.3, radius * 0.2, 
                                            radius * 0.4, radius * 0.25, 0xff6347, 0.8);
    
    container.add([base, bands, greatSpot]);
    
    // Animación de bandas
    this.scene.tweens.add({
      targets: bands,
      x: radius * 0.1,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createIcePlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base helada
    const base = this.scene.add.circle(0, 0, radius, 0xb0e0e6);
    
    // Capas de hielo
    const ice1 = this.scene.add.circle(0, 0, radius * 0.9, 0xe0ffff, 0.8);
    const ice2 = this.scene.add.circle(0, 0, radius * 0.7, 0xf0f8ff, 0.6);
    
    // Grietas de hielo usando Graphics
    const cracks = this.scene.add.graphics();
    cracks.lineStyle(2, 0x4682b4, 0.8);
    
    // Dibujar grietas irregulares
    this.drawIceCracks(cracks, radius);
    
    // Brillo cristalino
    const shine = this.scene.add.circle(-radius * 0.3, -radius * 0.3, 
                                       radius * 0.4, 0xffffff, 0.4);
    shine.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, ice1, ice2, cracks, shine]);
    
    // Efecto de parpadeo del brillo
    this.scene.tweens.add({
      targets: shine,
      alpha: 0.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createRockyPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base rocosa con un tono gris más natural
    const base = this.scene.add.circle(0, 0, radius, 0x828282);
    
    // Capas de roca con diferentes tonos
    const layer1 = this.scene.add.circle(0, 0, radius * 0.85, 0x696969);
    
    // Cráteres y relieves usando Graphics
    const terrain = this.scene.add.graphics();
    terrain.fillStyle(0x4a4a4a, 0.8);
    
    // Crear cráteres aleatorios
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = Phaser.Math.FloatBetween(0.2, 0.7) * radius;
        const craterX = Math.cos(angle) * distance;
        const craterY = Math.sin(angle) * distance;
        const craterSize = radius * Phaser.Math.FloatBetween(0.1, 0.2);
        
        terrain.fillCircle(craterX, craterY, craterSize);
    }
    
    // Detalles de superficie
    const details = this.scene.add.graphics();
    details.lineStyle(1, 0x595959, 0.6);
    
    // Crear líneas de fractura aleatorias
    for (let i = 0; i < 5; i++) {
        const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const length = radius * Phaser.Math.FloatBetween(0.4, 0.8);
        const startX = Math.cos(startAngle) * radius * 0.3;
        const startY = Math.sin(startAngle) * radius * 0.3;
        const endX = startX + Math.cos(startAngle) * length;
        const endY = startY + Math.sin(startAngle) * length;
        
        details.beginPath();
        details.moveTo(startX, startY);
        details.lineTo(endX, endY);
        details.strokePath();
    }
    
    container.add([base, layer1, terrain, details]);
    
    return container;
  }

  private createLavaPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base oscura
    const base = this.scene.add.circle(0, 0, radius, 0x2f1b14);
    
    // Ríos de lava usando Graphics
    const lava = this.scene.add.graphics();
    
    // Crear patrones de lava
    this.drawLavaPatterns(lava, radius);
    
    // Puntos calientes brillantes
    const hotSpot1 = this.scene.add.circle(-radius * 0.2, radius * 0.3, 
                                          radius * 0.1, 0xff4500, 0.9);
    const hotSpot2 = this.scene.add.circle(radius * 0.3, -radius * 0.2, 
                                          radius * 0.08, 0xff6347, 0.8);
    
    hotSpot1.setBlendMode(Phaser.BlendModes.ADD);
    hotSpot2.setBlendMode(Phaser.BlendModes.ADD);
    
    // Atmósfera caliente
    const heatHaze = this.scene.add.circle(0, 0, radius * 1.05, 0xff4500, 0.1);
    heatHaze.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, lava, hotSpot1, hotSpot2, heatHaze]);
    
    // Animación pulsante de los puntos calientes
    this.scene.tweens.add({
      targets: [hotSpot1, hotSpot2],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createCrystalPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base cristalina
    const base = this.scene.add.circle(0, 0, radius, 0x88c9e8);
    
    // Capas cristalinas
    const crystal1 = this.scene.add.graphics();
    crystal1.lineStyle(2, 0xadd8e6, 0.8);
    
    // Crear patrón cristalino
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const y2 = Math.sin(angle + Math.PI) * radius;
        
        crystal1.beginPath();
        crystal1.moveTo(x1, y1);
        crystal1.lineTo(x2, y2);
        crystal1.strokePath();
    }
    
    // Brillos
    const shine1 = this.scene.add.circle(-radius * 0.2, -radius * 0.2, 
                                        radius * 0.15, 0xffffff, 0.6);
    const shine2 = this.scene.add.circle(radius * 0.3, radius * 0.3, 
                                        radius * 0.1, 0xffffff, 0.4);
    
    shine1.setBlendMode(Phaser.BlendModes.ADD);
    shine2.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, crystal1, shine1, shine2]);
    
    // Efecto de brillo pulsante
    this.scene.tweens.add({
        targets: [shine1, shine2],
        alpha: 0.2,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createAlienPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base del planeta alienígena
    const base = this.scene.add.circle(0, 0, radius, 0x4b0082);
    
    // Patrones extraños en la superficie
    const patterns = this.scene.add.graphics();
    patterns.lineStyle(2, 0x9400d3, 0.7);
    
    // Crear patrones geométricos alienígenas
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * radius * 0.7;
        const y = Math.sin(angle) * radius * 0.7;
        
        patterns.beginPath();
        patterns.moveTo(0, 0);
        patterns.lineTo(x, y);
        patterns.strokePath();
        
        // Agregar símbolos extraños
        const symbol = this.scene.add.circle(x * 0.8, y * 0.8, 
                                           radius * 0.1, 0x00ff00, 0.6);
        container.add(symbol);
    }
    
    // Aura extraña
    const aura = this.scene.add.circle(0, 0, radius * 1.1, 0x32cd32, 0.2);
    aura.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, patterns, aura]);
    
    // Animación de rotación de patrones
    this.scene.tweens.add({
        targets: patterns,
        rotation: Math.PI * 2,
        duration: 20000,
        repeat: -1,
        ease: 'Linear'
    });
    
    return container;
  }

  private createRingedPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Planeta base (como Saturno)
    const planet = this.createGasGiant(container, radius);
    
    // Sistema de anillos
    const rings = this.scene.add.graphics();
    
    // Múltiples anillos con diferentes opacidades
    const ringRadii = [radius * 1.3, radius * 1.5, radius * 1.7, radius * 1.9];
    const ringColors = [0xd2b48c, 0xdaa520, 0xcd853f, 0x8b7355];
    
    ringRadii.forEach((ringRadius, index) => {
      rings.lineStyle(radius * 0.05, ringColors[index], 0.6 - index * 0.1);
      rings.strokeCircle(0, 0, ringRadius);
    });
    
    // Crear sombra del planeta sobre los anillos
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 0, radius * 2, radius * 0.3);
    
    container.add([rings, planet, shadow]);
    
    // Rotación lenta de los anillos
    this.scene.tweens.add({
      targets: rings,
      rotation: Math.PI * 2,
      duration: 50000,
      repeat: -1,
      ease: 'none'
    });
    
    return container;
  }

  // Métodos auxiliares para dibujar formas complejas
  private drawContinent(graphics: GameObjects.Graphics, x: number, y: number, size: number) {
    graphics.beginPath();
    graphics.moveTo(x, y);
    
    // Crear forma orgánica usando curvas
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variance = Phaser.Math.FloatBetween(0.7, 1.3);
      const px = x + Math.cos(angle) * size * variance;
      const py = y + Math.sin(angle) * size * variance * 0.8;
      graphics.lineTo(px, py);
    }
    
    graphics.closePath();
    graphics.fillPath();
  }

  private createClouds(radius: number): GameObjects.Container {
    const cloudContainer = this.scene.add.container(0, 0);
    
    // Crear varias nubes como círculos superpuestos
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = radius * 0.7;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance * 0.5;
      
      const cloud = this.scene.add.circle(x, y, radius * 0.2, 0xffffff, 0.4);
      cloudContainer.add(cloud);
    }
    
    return cloudContainer;
  }

  private drawIceCracks(graphics: GameObjects.Graphics, radius: number) {
    // Dibujar grietas radiales
    for (let i = 0; i < 5; i++) {
      const startAngle = (i / 5) * Math.PI * 2;
      const startX = Math.cos(startAngle) * radius * 0.3;
      const startY = Math.sin(startAngle) * radius * 0.3;
      const endX = Math.cos(startAngle) * radius * 0.8;
      const endY = Math.sin(startAngle) * radius * 0.8;
      
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
    }
    graphics.strokePath();
  }

  private drawLavaPatterns(graphics: GameObjects.Graphics, radius: number) {
    // Ríos de lava serpenteantes
    const colors = [0xff4500, 0xff6347, 0xdc143c];
    
    colors.forEach((color, index) => {
      graphics.fillStyle(color, 0.8 - index * 0.2);
      
      // Crear formas irregulares de lava
      graphics.beginPath();
      const segments = 12;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const variance = Phaser.Math.FloatBetween(0.3, 0.9);
        const distance = radius * variance;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        if (i === 0) graphics.moveTo(x, y);
        else graphics.lineTo(x, y);
      }
      graphics.closePath();
      graphics.fillPath();
    });
  }

  private createBasicPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    const planet = this.scene.add.circle(0, 0, radius, 0x666666);
    container.add(planet);
    return container;
  }

  // Método para crear planetas aleatorios
  createRandomPlanet(x: number, y: number, radius: number): GameObjects.Container {
    const types = Object.values(PlanetType);
    const randomType = types[Math.floor(Math.random() * types.length)] as PlanetType;
    return this.createPlanet(x, y, radius, randomType);
  }
}