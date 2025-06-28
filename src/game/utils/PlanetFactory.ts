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
    
    // Capa de hielo
    const iceLayer = this.scene.add.circle(0, 0, radius * 0.9, 0xe0ffff, 0.8);
    
    // Grietas de hielo usando Graphics
    const cracks = this.scene.add.graphics();
    cracks.lineStyle(2, 0x4682b4, 0.6);
    this.drawIceCracks(cracks, radius);
    
    // Brillos de cristales de hielo
    const shine1 = this.scene.add.circle(-radius * 0.3, radius * 0.2, radius * 0.1, 0xffffff, 0.7);
    const shine2 = this.scene.add.circle(radius * 0.2, -radius * 0.4, radius * 0.08, 0xffffff, 0.6);
    
    shine1.setBlendMode(Phaser.BlendModes.ADD);
    shine2.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, iceLayer, cracks, shine1, shine2]);
    
    // Animación sutil de brillos
    this.scene.tweens.add({
      targets: [shine1, shine2],
      alpha: 0.3,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createRockyPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base rocosa
    const base = this.scene.add.circle(0, 0, radius, 0x696969);
    
    // Capa de terreno irregular
    const layer1 = this.scene.add.circle(0, 0, radius * 0.8, 0x808080);
    
    // Formaciones rocosas usando Graphics
    const terrain = this.scene.add.graphics();
    terrain.fillStyle(0x556b2f, 0.7);
    
    // Crear montañas/crestas
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * radius * 0.6;
      const y = Math.sin(angle) * radius * 0.6;
      terrain.fillTriangle(x, y, x - 10, y + 15, x + 10, y + 15);
    }
    
    // Detalles rocosos
    const details = this.scene.add.graphics();
    details.lineStyle(1, 0x2f4f4f, 0.6);
    
    for (let i = 0; i < 8; i++) {
      const startAngle = (i / 8) * Math.PI * 2;
      const startX = Math.cos(startAngle) * radius * 0.3;
      const startY = Math.sin(startAngle) * radius * 0.3;
      const endX = Math.cos(startAngle) * radius * 0.7;
      const endY = Math.sin(startAngle) * radius * 0.7;
      
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
    const shine2 = this.scene.add.circle(radius * 0.3, radius * 0.1, 
                                        radius * 0.1, 0xffffff, 0.5);
    
    shine1.setBlendMode(Phaser.BlendModes.ADD);
    shine2.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, crystal1, shine1, shine2]);
    
    // Animación de cristales pulsantes
    this.scene.tweens.add({
      targets: crystal1,
      alpha: 0.4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createAlienPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Base alienígena con colores extraños
    const base = this.scene.add.circle(0, 0, radius, 0x4b0082);
    
    // Capas con colores alienígenas
    const layer1 = this.scene.add.circle(0, 0, radius * 0.8, 0x8b008b, 0.7);
    const layer2 = this.scene.add.circle(0, 0, radius * 0.6, 0x9400d3, 0.5);
    
    // Estructuras alienígenas usando Graphics
    const structures = this.scene.add.graphics();
    structures.fillStyle(0x00ff00, 0.6);
    
    // Crear formas geométricas extrañas
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const x = Math.cos(angle) * radius * 0.4;
      const y = Math.sin(angle) * radius * 0.4;
      
      structures.fillTriangle(
        x, y - 10,
        x - 8, y + 5,
        x + 8, y + 5
      );
    }
    
    // Luces pulsantes
    const light1 = this.scene.add.circle(radius * 0.2, -radius * 0.3, radius * 0.05, 0x00ff00);
    const light2 = this.scene.add.circle(-radius * 0.3, radius * 0.2, radius * 0.05, 0xff00ff);
    
    light1.setBlendMode(Phaser.BlendModes.ADD);
    light2.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([base, layer1, layer2, structures, light1, light2]);
    
    // Animación de luces alienígenas
    this.scene.tweens.add({
      targets: [light1, light2],
      scaleX: 2,
      scaleY: 2,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  private createRingedPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    // Planeta base
    const planet = this.scene.add.circle(0, 0, radius, 0xdaa520);
    
    // Anillos usando Graphics
    const rings = this.scene.add.graphics();
    const ringColors = [0xffd700, 0xffb347, 0xff8c69];
    
    ringColors.forEach((color, index) => {
      const ringRadius = radius * (1.5 + index * 0.3);
      rings.lineStyle(radius * 0.05, color, 0.6 - index * 0.1);
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

  private createBasicPlanet(container: GameObjects.Container, radius: number): GameObjects.Container {
    const planet = this.scene.add.circle(0, 0, radius, 0x666666);
    container.add(planet);
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

  // Método para crear planetas aleatorios
  createRandomPlanet(x: number, y: number, radius: number): GameObjects.Container {
    const types = Object.values(PlanetType);
    const randomType = types[Math.floor(Math.random() * types.length)] as PlanetType;
    return this.createPlanet(x, y, radius, randomType);
  }

  public createPlanetFromEmbedding(
    x: number, 
    y: number, 
    radius: number, 
    embedding: number[] | null
  ): GameObjects.Container {
    
    const container = this.scene.add.container(x, y);

    // Si no hay embedding, dibujamos un planeta por defecto
    if (!embedding || embedding.length === 0) {
      return this.createBasicPlanet(container, radius);
    }
    
    // Mapeamos el primer valor del embedding a un tono de gris
    const grayValue = Math.floor(((embedding[0] + 1) / 2) * 255);
    const planetColor = Phaser.Display.Color.GetColor(grayValue, grayValue, grayValue);
    
    // Mapeamos el segundo valor al radio
    const planetRadius = radius * (1 + (embedding[1] * 0.5));
    
    const planet = this.scene.add.circle(0, 0, planetRadius, planetColor);
    container.add(planet);

    // Añadimos una atmósfera cuyo color depende del tercer valor del embedding
    if (embedding[2] > 0) {
      const atmosphereColor = Phaser.Display.Color.GetColor(100, 100, Math.floor(((embedding[2] + 1) / 2) * 255));
      const atmosphere = this.scene.add.circle(0, 0, planetRadius * 1.2, atmosphereColor, 0.3);
      atmosphere.setBlendMode(Phaser.BlendModes.ADD);
      container.add(atmosphere);
    }

    return container;
  }
}