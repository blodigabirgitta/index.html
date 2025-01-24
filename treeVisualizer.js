export class TreeVisualizer {
  constructor(container, data) {
    this.container = d3.select(container);
    this.data = data;
    this.width = this.container.node().getBoundingClientRect().width;
    this.height = this.container.node().getBoundingClientRect().height;
    this.svg = null;
    this.simulation = null;
    this.eventHandlers = new Map();
    this.zoom = null;

    this.init();
  }

  init() {
    this.setupSVG();
    this.setupSimulation();
    this.setupZoom();
    this.checkIconVisibility();
    window.addEventListener('resize', () => this.handleResize());
  }

  setupSVG() {
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    // Add arrow marker definitions for directed connections
    const defs = this.svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-10 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M-10,-5L0,0L-10,5')
      .style('fill', '#999');

    // Add lightning effect filter
    defs.append('filter')
      .attr('id', 'glow')
      .append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');

    // Add basic icon filters for enhanced visual quality
    defs.append('filter')
      .attr('id', 'iconGlow')
      .append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');

    // Define detailed icons for characters
    this.defineIcons(defs);

    this.g = this.svg.append('g');
  }

  defineIcons(defs) {
    // Universe Variants - Add specific themed icons for different universes
    
    // Red Son Icons - Enhanced Soviet theme
    defs.append('symbol')
      .attr('id', 'redSonIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#CC0000" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M40 40 L60 40 M45 50 L55 50 M40 60 L60 60" stroke="#FFD700" stroke-width="2"/>
        <path d="M50 25 L55 35 L45 35 Z" fill="#FFD700"/>
        <text x="50" y="80" text-anchor="middle" fill="#FFD700" font-size="12">★</text>
      `);

    // Kingdom Come Icons - More epic and aged aesthetic
    defs.append('symbol')
      .attr('id', 'kingdomComeIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4B0082" stroke="#FFD700" stroke-width="2"/>
        <path d="M25 40 Q50 20 75 40 L60 70 Q50 80 40 70 Z" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="45" r="15" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M40 60 Q50 70 60 60" stroke="#FFD700" stroke-width="2" fill="none"/>
      `);

    // Gaslight Icons - Victorian steampunk style
    defs.append('symbol')
      .attr('id', 'gaslightIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#704214" stroke="#B87333" stroke-width="2"/>
        <path d="M40 30 Q50 20 60 30 L55 50 Q50 55 45 50 Z" fill="#B87333"/>
        <circle cx="50" cy="45" r="10" fill="none" stroke="#B87333" stroke-width="2"/>
        <path d="M30 60 Q50 80 70 60" fill="none" stroke="#B87333" stroke-width="2"/>
      `);

    // Dark Multiverse Icons - More twisted and corrupted design
    defs.append('symbol')
      .attr('id', 'darkMultiverseIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#1A1A1A" stroke="#4B0082" stroke-width="2"/>
        <path d="M30 30 L70 70 M30 70 L70 30" stroke="#4B0082" stroke-width="3"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#4B0082" stroke-width="2"/>
        <path d="M40 40 L60 40 M40 60 L60 60" stroke="#4B0082" stroke-width="2"/>
      `);

    // Bizarro Icons
    defs.append('symbol')
      .attr('id', 'bizarroIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#87CEEB" stroke="#4169E1" stroke-width="2"/>
        <path d="M30 70 L50 30 L70 70 Z" fill="none" stroke="#4169E1" stroke-width="2" transform="rotate(180 50 50)"/>
        <path d="M40 40 L60 40 M45 50 L55 50 M40 60 L60 60" stroke="#4169E1" stroke-width="2" transform="rotate(180 50 50)"/>
      `);

    // Flashpoint Icons
    defs.append('symbol')
      .attr('id', 'flashpointIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FF4500" stroke="#FFD700" stroke-width="2"/>
        <path d="M60 20 L45 50 L60 50 L40 80" fill="#FFD700" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.5"/>
      `);

    // Earth-8 Icons (Marvel-inspired)
    defs.append('symbol')
      .attr('id', 'earth8Icon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4169E1" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M40 50 L60 50 M50 40 L50 60" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add specific character variants
    // Red Son Superman
    defs.append('symbol')
      .attr('id', 'redSonSupermanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#CC0000" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 30 L40 25 L50 20 L60 25 L70 35 L60 45 L50 50 L40 45 Z" 
              fill="#FFD700" stroke="#CC0000" stroke-width="1"/>
        <path d="M50 20 L50 50 M40 35 L60 35" stroke="#CC0000" stroke-width="2"/>
        <text x="50" y="70" text-anchor="middle" fill="#FFD700" font-size="20">★</text>
      `);

    // Kingdom Come Superman
    defs.append('symbol')
      .attr('id', 'kingdomComeSupermanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#0033CC" stroke="#C0C0C0" stroke-width="2"/>
        <path d="M30 35 L40 25 L50 20 L60 25 L70 35 L60 45 L50 50 L40 45 Z" 
              fill="#FFD700" stroke="#C0C0C0" stroke-width="1"/>
        <path d="M25 60 Q50 80 75 60" fill="none" stroke="#C0C0C0" stroke-width="3"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#C0C0C0" stroke-width="2" opacity="0.5"/>
      `);

    // Batman Who Laughs
    defs.append('symbol')
      .attr('id', 'batmanWhoLaughsIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#1A1A1A" stroke="#FF0000" stroke-width="2"/>
        <path d="M20 40 Q50 20 80 40" fill="none" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 35 Q50 60 70 35" fill="none" stroke="#FF0000" stroke-width="2"/>
        <circle cx="40" cy="45" r="5" fill="#FF0000"/>
        <circle cx="60" cy="45" r="5" fill="#FF0000"/>
        <path d="M30 60 Q50 80 70 60" fill="none" stroke="#FF0000" stroke-width="2"/>
      `);

    // Generic hero base - update with more intricate design
    defs.append('symbol')
      .attr('id', 'defaultIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4169E1" stroke="#FFD700" stroke-width="2"/>
        <path d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z" 
              fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add Cosmic Entity Icon
    defs.append('symbol')
      .attr('id', 'cosmicIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4B0082" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 50 L80 50 M50 20 L50 80" stroke="#FFD700" stroke-width="2" transform="rotate(45, 50, 50)"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 30 Q50 10 70 30 Q90 50 70 70 Q50 90 30 70 Q10 50 30 30" 
              fill="none" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
      `);

    // Add Location Icon
    defs.append('symbol')
      .attr('id', 'locationIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#006400" stroke="#003200" stroke-width="2"/>
        <path d="M50 20 L80 80 L20 80 Z" fill="#003200"/>
        <rect x="40" y="50" width="20" height="30" fill="#003200"/>
        <path d="M45 40 L55 40 M50 35 L50 45" stroke="#003200" stroke-width="2"/>
      `);

    // Add Organization Icon
    defs.append('symbol')
      .attr('id', 'organizationIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#666699" stroke="#444477" stroke-width="2"/>
        <path d="M30 40 L70 40 L70 70 L30 70 Z" fill="none" stroke="#444477" stroke-width="2"/>
        <circle cx="50" cy="30" r="10" fill="#444477"/>
        <path d="M40 55 L60 55 M40 62 L60 62" stroke="#444477" stroke-width="2"/>
      `);

    // Add Item Icon
    defs.append('symbol')
      .attr('id', 'itemIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#CC6600" stroke="#884400" stroke-width="2"/>
        <rect x="35" y="30" width="30" height="40" fill="#884400"/>
        <path d="M40 35 L60 35 M40 45 L60 45 M40 55 L60 55" stroke="#CC6600" stroke-width="2"/>
      `);

    // Add Event Icon
    defs.append('symbol')
      .attr('id', 'eventIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#660066" stroke="#440044" stroke-width="2"/>
        <path d="M25 50 L75 50 M50 25 L50 75" stroke="#440044" stroke-width="3"/>
        <circle cx="50" cy="50" r="15" fill="#440044"/>
        <path d="M35 35 L65 65 M35 65 L65 35" stroke="#440044" stroke-width="2"/>
      `);

    // Add Planet Icon
    defs.append('symbol')
      .attr('id', 'planetIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4169E1" stroke="#000000" stroke-width="2"/>
        <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#000000" stroke-width="2"/>
        <path d="M20 45 Q50 65 80 45" fill="none" stroke="#000000" stroke-width="2"/>
        <circle cx="35" cy="35" r="8" fill="#FFFFFF" opacity="0.3"/>
      `);

    // Add Dimension Icon
    defs.append('symbol')
      .attr('id', 'dimensionIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#3300CC" stroke="#2200AA" stroke-width="2"/>
        <path d="M25 25 L75 75 M25 75 L75 25" stroke="#2200AA" stroke-width="3"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#2200AA" stroke-width="2"/>
        <path d="M30 50 L70 50 M50 30 L50 70" stroke="#2200AA" stroke-width="2"/>
      `);

    // Add Universe Icon
    defs.append('symbol')
      .attr('id', 'universeIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000066" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#FFD700" stroke-width="1"/>
        <circle cx="50" cy="50" r="15" fill="#FFD700"/>
        <path d="M20 50 Q50 20 80 50 Q50 80 20 50" fill="none" stroke="#FFD700" stroke-width="1"/>
      `);

    // Add Variant Icon
    defs.append('symbol')
      .attr('id', 'variantIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#CC00CC" stroke="#AA00AA" stroke-width="2"/>
        <path d="M25 50 L75 50" stroke="#AA00AA" stroke-width="3" transform="rotate(45, 50, 50)"/>
        <path d="M25 50 L75 50" stroke="#AA00AA" stroke-width="3" transform="rotate(-45, 50, 50)"/>
        <circle cx="50" cy="50" r="15" fill="#AA00AA"/>
      `);

    // Add Civilization Icon
    defs.append('symbol')
      .attr('id', 'civilizationIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#009999" stroke="#007777" stroke-width="2"/>
        <path d="M30 70 L50 30 L70 70 Z" fill="#007777"/>
        <rect x="35" y="50" width="30" height="20" fill="#007777"/>
        <path d="M40 60 L60 60" stroke="#009999" stroke-width="2"/>
      `);

    // Add Character Icon
    defs.append('symbol')
      .attr('id', 'characterIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#339933" stroke="#227722" stroke-width="2"/>
        <circle cx="50" cy="35" r="15" fill="#227722"/>
        <path d="M30 80 Q50 60 70 80" fill="#227722"/>
        <rect x="40" y="45" width="20" height="25" fill="#227722"/>
      `);

    // Add Villain Icon
    defs.append('symbol')
      .attr('id', 'villainIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#CC0000" stroke="#AA0000" stroke-width="2"/>
        <path d="M30 40 L45 35 L50 20 L55 35 L70 40 L55 45 L50 60 L45 45 Z" 
              fill="#AA0000" stroke="#CC0000" stroke-width="1"/>
        <path d="M35 50 Q50 70 65 50" fill="none" stroke="#AA0000" stroke-width="2"/>
      `);

    // Superman - More iconic S-shield design with better cape flow
    defs.append('symbol')
      .attr('id', 'supermanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#0033CC" stroke="#DC143C" stroke-width="2"/>
        <path d="M30 35 L40 25 L50 20 L60 25 L70 35 L60 45 L50 50 L40 45 Z" 
              fill="#FFD700" stroke="#DC143C" stroke-width="1"/>
        <path d="M25 35 Q50 15 75 35 Q85 45 85 60 Q85 75 75 85 Q50 95 25 85 Q15 75 15 60 Q15 45 25 35" 
              fill="none" stroke="#DC143C" stroke-width="2" opacity="0.7"/>
        <path d="M50 20 L50 50 M40 35 L60 35" stroke="#FFD700" stroke-width="2"/>
      `);

    // Batman - Enhanced cowl design with more detailed bat symbol
    defs.append('symbol')
      .attr('id', 'batmanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#333333" stroke="#000000" stroke-width="2"/>
        <path d="M20 45 Q35 30 50 25 Q65 30 80 45 Q65 55 50 60 Q35 55 20 45 Z" 
              fill="#000000" stroke="#000000" stroke-width="1"/>
        <path d="M30 40 Q50 20 70 40 L65 50 Q50 60 35 50 Z" 
              fill="#000000" stroke="#FFD700" stroke-width="0.5"/>
        <path d="M25 30 Q50 10 75 30" fill="none" stroke="#000000" stroke-width="2"/>
        <path d="M35 35 Q50 45 65 35" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.7"/>
      `);

    // Wonder Woman - Enhanced Amazonian design with eagle motif
    defs.append('symbol')
      .attr('id', 'wonderWomanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#BD0F1E" stroke="#FFD700" stroke-width="2"/>
        <path d="M25 35 L50 25 L75 35 L65 60 L35 60 Z" fill="#FFD700"/>
        <path d="M30 40 Q50 30 70 40 M40 50 Q50 40 60 50" stroke="#BD0F1E" stroke-width="2"/>
        <path d="M45 30 L50 35 L55 30" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 45 L65 45" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 55 Q50 65 70 55" fill="none" stroke="#FFD700" stroke-width="1.5"/>
      `);

    // Flash - Dynamic lightning design with speed force energy
    defs.append('symbol')
      .attr('id', 'flashIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="40" fill="#DC143C" stroke="#FFD700" stroke-width="2"/>
        <path d="M60 20 L45 45 L55 45 L40 80" fill="#FFD700" stroke="#FFD700" stroke-width="0"/>
        <path d="M30 50 Q50 20 70 50 Q50 80 30 50" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.7"/>
        <path d="M25 50 Q50 20 75 50 Q50 80 25 50" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
      `);

    // Speed Force - More ethereal design with temporal energy
    defs.append('symbol')
      .attr('id', 'speedForceIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="40" fill="#FFD700" fill-opacity="0.3" stroke="#DC143C" stroke-width="2"/>
        <path d="M50 10 Q80 50 50 90 Q20 50 50 10" fill="none" stroke="#DC143C" stroke-width="2"/>
        <path d="M55 15 L45 45 L60 45 L40 85" fill="#DC143C" stroke="#DC143C" stroke-width="0.5"/>
        <path d="M30 50 Q50 30 70 50 Q50 70 30 50" fill="none" stroke="#FFD700" stroke-width="1.5"/>
      `);

    // Joker - More menacing and chaotic design
    defs.append('symbol')
      .attr('id', 'jokerIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#1B8047" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M30 60 Q50 85 70 60" fill="none" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M25 55 Q50 80 75 55" fill="none" stroke="#FF0000" stroke-width="1.5"/>
        <circle cx="35" cy="40" r="5" fill="#FFFFFF"/>
        <circle cx="65" cy="40" r="5" fill="#FFFFFF"/>
        <path d="M35 35 L45 30 M55 30 L65 35" stroke="#FFFFFF" stroke-width="2"/>
      `);

    // Continue with other detailed icon definitions...
    // [Previous icon definitions remain but with similar quality improvements]

    // Add missing character icons
    defs.append('symbol')
      .attr('id', 'zatannaIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#191970" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 30 L65 30 L65 70 L35 70 Z" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M40 40 L60 60 M40 60 L60 40" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#FFD700" stroke-width="2"/>
        <text x="50" y="80" text-anchor="middle" fill="#FFD700" font-size="12">⭐</text>
      `);

    defs.append('symbol')
      .attr('id', 'shazamIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#DC143C" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 40 L70 40 M40 30 L40 70 M60 30 L60 70" stroke="#FFD700" stroke-width="2"/>
        <path d="M45 45 L55 55 M45 55 L55 45" stroke="#FFD700" stroke-width="2"/>
        <text x="50" y="65" text-anchor="middle" fill="#FFD700" font-size="20">⚡</text>
      `);

    // Add missing cosmic entity icons
    defs.append('symbol')
      .attr('id', 'presenceIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 50 L80 50 M50 20 L50 80" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="#FFD700"/>
      `);

    defs.append('symbol')
      .attr('id', 'monitorMindIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000000" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M25 25 L75 75 M25 75 L75 25" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M35 50 L65 50 M50 35 L50 65" stroke="#FFFFFF" stroke-width="2"/>
      `);

    // Add missing location icons
    defs.append('symbol')
      .attr('id', 'fortressOfSolitudeIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#87CEEB" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M30 70 L50 20 L70 70 Z" fill="#FFFFFF" stroke="#87CEEB" stroke-width="1"/>
        <path d="M40 70 L50 40 L60 70" fill="#87CEEB" stroke="#FFFFFF" stroke-width="1"/>
        <path d="M35 50 L65 50 M40 60 L60 60" stroke="#FFFFFF" stroke-width="1"/>
      `);

    // Add missing team icons
    defs.append('symbol')
      .attr('id', 'justiceLeagueIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4169E1" stroke="#FFD700" stroke-width="2"/>
        <path d="M25 40 L75 40 L50 75 Z" fill="#FFD700"/>
        <path d="M40 25 L60 25 L50 40 Z" fill="#FFD700"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add missing event icons
    defs.append('symbol')
      .attr('id', 'crisisIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FF4500" stroke="#FFD700" stroke-width="2"/>
        <path d="M25 25 L75 75 M25 75 L75 25" stroke="#FFD700" stroke-width="3"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 50 L65 50 M50 35 L50 65" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add missing artifact icons
    defs.append('symbol')
      .attr('id', 'artifactIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#8B4513" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="10" fill="#FFD700"/>
        <path d="M40 45 L60 45 M40 55 L60 55" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add missing dimension icons
    defs.append('symbol')
      .attr('id', 'dimensionalGateIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#9932CC" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 50 L80 50 M50 20 L50 80" stroke="#FFD700" stroke-width="1" transform="rotate(45, 50, 50)"/>
      `);

    // Add missing organization icons
    defs.append('symbol')
      .attr('id', 'teamIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4682B4" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="35" cy="40" r="10" fill="#FFFFFF"/>
        <circle cx="65" cy="40" r="10" fill="#FFFFFF"/>
        <circle cx="50" cy="60" r="10" fill="#FFFFFF"/>
        <path d="M30 75 Q50 85 70 75" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      `);

    defs.append('symbol')
      .attr('id', 'greenArrowIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#006400" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 50 L50 20 L70 50 M45 45 L50 70 L55 45" fill="none" stroke="#FFD700" stroke-width="3"/>
        <path d="M35 40 Q50 35 65 40" stroke="#FFD700" stroke-width="2" fill="none"/>
      `);

    defs.append('symbol')
      .attr('id', 'aquamanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FF9900" stroke="#006994" stroke-width="2"/>
        <path d="M25 50 Q50 70 75 50 Q50 30 25 50" fill="#006994"/>
        <path d="M40 40 L60 40 M45 50 L55 50" stroke="#FFD700" stroke-width="2"/>
      `);

    defs.append('symbol')
      .attr('id', 'brainiacIcon') 
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#00FF00" stroke="#003300" stroke-width="2"/>
        <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="#003300" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="#003300"/>
        <path d="M40 40 L60 40 M40 60 L60 60" stroke="#003300" stroke-width="2"/>
      `);

    defs.append('symbol')
      .attr('id', 'blackCanaryIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000000" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 40 Q50 30 70 40 L60 60 Q50 70 40 60 Z" fill="#FFD700"/>
        <path d="M45 45 L55 45" stroke="#000000" stroke-width="2"/>
      `);

    defs.append('symbol')
      .attr('id', 'greenLanternIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#006400" stroke="#00FF00" stroke-width="2"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#00FF00" stroke-width="3"/>
        <path d="M35 50 L65 50 M50 35 L50 65" stroke="#00FF00" stroke-width="3"/>
      `);

    defs.append('symbol')
      .attr('id', 'darkseidIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4A0404" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 40 L70 40 M30 60 L70 60" stroke="#FF0000" stroke-width="3"/>
        <path d="M40 30 L40 70 M60 30 L60 70" stroke="#FF0000" stroke-width="3"/>
      `);

    defs.append('symbol')
      .attr('id', 'sourceIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="#FFD700"/>
        <path d="M20 50 L80 50 M50 20 L50 80" stroke="#FFD700" stroke-width="2" transform="rotate(45, 50, 50)"/>
      `);

    defs.append('symbol')
      .attr('id', 'monitorIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000000" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M25 25 L75 75 M25 75 L75 25" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      `);

    defs.append('symbol')
      .attr('id', 'perpetuaIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4B0082" stroke="#FFD700" stroke-width="2"/>
        <path d="M25 25 Q50 0 75 25 L75 75 Q50 100 25 75 Z" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="50" r="20" fill="#FFD700"/>
      `);

    // Add missing location icons
    defs.append('symbol')
      .attr('id', 'metropolisIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4169E1" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 70 L40 30 L60 30 L80 70" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 70 L30 40 L50 20 L70 40 L70 70" fill="none" stroke="#FFD700" stroke-width="2"/>
      `);

    defs.append('symbol')
      .attr('id', 'gothamIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#191970" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 70 L40 20 L60 20 L80 70" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 70 L35 30 L65 30 L65 70" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M45 40 L55 40 M45 50 L55 50" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add missing item icons
    defs.append('symbol')
      .attr('id', 'kryptoniteIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#00FF00" stroke="#003300" stroke-width="2"/>
        <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="#003300"/>
        <circle cx="50" cy="50" r="10" fill="#00FF00"/>
      `);

    defs.append('symbol')
      .attr('id', 'lassoIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#B8860B" stroke-width="2"/>
        <path d="M30 30 Q50 20 70 30 Q80 40 70 50 Q50 60 30 50 Q20 40 30 30" 
              fill="none" stroke="#B8860B" stroke-width="3"/>
      `);

    // Add Martian Manhunter Icon
    defs.append('symbol')
      .attr('id', 'martianManhunterIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#006400" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 35 Q50 25 70 35 L60 55 Q50 65 40 55 Z" fill="#FF0000"/>
        <path d="M35 40 L45 40 M55 40 L65 40" stroke="#006400" stroke-width="2"/>
        <path d="M35 60 Q50 70 65 60" fill="none" stroke="#FF0000" stroke-width="2"/>
        <circle cx="40" cy="45" r="3" fill="#FF0000"/>
        <circle cx="60" cy="45" r="3" fill="#FF0000"/>
        <path d="M25 50 Q50 70 75 50" fill="none" stroke="#FF0000" stroke-width="2" opacity="0.5"/>
      `);

    // Add White Martian Icon
    defs.append('symbol')
      .attr('id', 'whiteMartianIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
        <path d="M30 35 Q50 25 70 35 L60 55 Q50 65 40 55 Z" fill="#000000"/>
        <path d="M35 40 L45 40 M55 40 L65 40" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M35 60 Q50 70 65 60" fill="none" stroke="#000000" stroke-width="2"/>
        <circle cx="40" cy="45" r="3" fill="#000000"/>
        <circle cx="60" cy="45" r="3" fill="#000000"/>
      `);

    // Add Miss Martian Icon
    defs.append('symbol')
      .attr('id', 'missMartianIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FF69B4" stroke="#006400" stroke-width="2"/>
        <path d="M30 35 Q50 25 70 35 L60 55 Q50 65 40 55 Z" fill="#006400"/>
        <path d="M35 40 L45 40 M55 40 L65 40" stroke="#FF69B4" stroke-width="2"/>
        <path d="M35 60 Q50 70 65 60" fill="none" stroke="#006400" stroke-width="2"/>
        <circle cx="40" cy="45" r="3" fill="#006400"/>
        <circle cx="60" cy="45" r="3" fill="#006400"/>
        <path d="M45 25 L50 20 L55 25" fill="none" stroke="#006400" stroke-width="2"/>
      `);

    // Add Vigilante Icon
    defs.append('symbol')
      .attr('id', 'vigilanteIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000080" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 40 L70 40 L60 60 L40 60 Z" fill="#FF0000"/>
        <rect x="45" y="25" width="10" height="15" fill="#FF0000"/>
        <path d="M35 50 L65 50" stroke="#000080" stroke-width="2"/>
      `);

    // Add Metallo Icon
    defs.append('symbol')
      .attr('id', 'metalloIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#808080" stroke="#00FF00" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="#00FF00"/>
        <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="#00FF00" stroke-width="2"/>
        <path d="M40 40 L60 40 M40 60 L60 60" stroke="#00FF00" stroke-width="2"/>
      `);

    // Add Parasite Icon
    defs.append('symbol')
      .attr('id', 'parasiteIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#800080" stroke="#00FF00" stroke-width="2"/>
        <path d="M30 40 Q50 20 70 40 Q80 50 70 60 Q50 80 30 60 Q20 50 30 40" 
              fill="none" stroke="#00FF00" stroke-width="2"/>
        <circle cx="40" cy="45" r="5" fill="#00FF00"/>
        <circle cx="60" cy="45" r="5" fill="#00FF00"/>
        <path d="M40 60 Q50 70 60 60" fill="none" stroke="#00FF00" stroke-width="2"/>
      `);

    // Add Toyman Icon
    defs.append('symbol')
      .attr('id', 'toymanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 40 L70 40 L70 70 L30 70 Z" fill="#FF0000"/>
        <circle cx="40" cy="50" r="5" fill="#FFD700"/>
        <circle cx="60" cy="50" r="5" fill="#FFD700"/>
        <path d="M45 60 L55 60" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 30 L45 20 L55 20 L65 30" fill="none" stroke="#FF0000" stroke-width="2"/>
      `);

    // Add Silver Banshee Icon
    defs.append('symbol')
      .attr('id', 'silverBansheeIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#C0C0C0" stroke="#000000" stroke-width="2"/>
        <path d="M30 30 Q50 20 70 30 L60 60 Q50 70 40 60 Z" fill="#000000"/>
        <path d="M40 40 L45 40 M55 40 L60 40" stroke="#C0C0C0" stroke-width="2"/>
        <path d="M45 50 Q50 55 55 50" fill="none" stroke="#C0C0C0" stroke-width="2"/>
        <path d="M30 60 Q50 80 70 60" fill="none" stroke="#000000" stroke-width="2"/>
      `);

    // Add Guardian Icon
    defs.append('symbol')
      .attr('id', 'guardianIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000080" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 40 L70 40 L60 70 L40 70 Z" fill="#FFD700"/>
        <circle cx="50" cy="30" r="10" fill="#FFD700"/>
        <path d="M45 50 L55 50 M45 60 L55 60" stroke="#000080" stroke-width="2"/>
      `);

    // Add Steel Icon
    defs.append('symbol')
      .attr('id', 'steelIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#C0C0C0" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 40 L50 20 L70 40 L60 70 L40 70 Z" fill="#FF0000"/>
        <path d="M45 45 L55 45 M45 55 L55 55" stroke="#C0C0C0" stroke-width="2"/>
        <path d="M40 35 L60 35" stroke="#C0C0C0" stroke-width="3"/>
      `);

    // Add Supergirl Icon
    defs.append('symbol')
      .attr('id', 'supergirlIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#0033CC" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 35 L40 25 L50 20 L60 25 L70 35 L60 45 L50 50 L40 45 Z" 
              fill="#FFD700" stroke="#FF0000" stroke-width="1"/>
        <path d="M25 40 Q50 20 75 40" fill="none" stroke="#FF0000" stroke-width="2"/>
        <path d="M50 20 L50 50" stroke="#FF0000" stroke-width="2"/>
      `);

    // Add Superboy Icon
    defs.append('symbol')
      .attr('id', 'superboyIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000000" stroke="#FF0000" stroke-width="2"/>
        <path d="M30 35 L40 25 L50 20 L60 25 L70 35 L60 45 L50 50 L40 45 Z" 
              fill="#FFD700" stroke="#FF0000" stroke-width="1"/>
        <path d="M25 40 Q50 20 75 40" fill="none" stroke="#FF0000" stroke-width="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add Hawkman Icon
    defs.append('symbol')
      .attr('id', 'hawkmanIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#8B4513" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 40 Q50 20 80 40" fill="none" stroke="#FFD700" stroke-width="3"/>
        <path d="M30 35 Q50 25 70 35" fill="#FFD700"/>
        <path d="M40 45 L60 45" stroke="#8B4513" stroke-width="2"/>
        <path d="M35 60 Q50 70 65 60" fill="none" stroke="#FFD700" stroke-width="2"/>
      `);

    // Add Hawkgirl Icon
    defs.append('symbol')
      .attr('id', 'hawkgirlIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#8B4513" stroke="#C0C0C0" stroke-width="2"/>
        <path d="M20 40 Q50 20 80 40" fill="none" stroke="#C0C0C0" stroke-width="3"/>
        <path d="M30 35 Q50 25 70 35" fill="#C0C0C0"/>
        <path d="M40 45 L60 45" stroke="#8B4513" stroke-width="2"/>
        <path d="M35 60 Q50 70 65 60" fill="none" stroke="#C0C0C0" stroke-width="2"/>
        <circle cx="50" cy="30" r="5" fill="#FFD700"/>
      `);

    // ... continue with previous icon definitions ...

    // Teen Titans Icons
    defs.append('symbol')
      .attr('id', 'teenTitansIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4169E1" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 40 L70 40 L50 70 Z" fill="#FFD700"/>
        <text x="50" y="35" text-anchor="middle" fill="#FFD700" font-size="20">T</text>
      `);

    // Robin/Nightwing
    defs.append('symbol')
      .attr('id', 'nightwingIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#0000CD" stroke="#87CEEB" stroke-width="2"/>
        <path d="M25 45 Q50 20 75 45" fill="none" stroke="#87CEEB" stroke-width="3"/>
        <path d="M35 35 L65 35 L50 60 Z" fill="#87CEEB"/>
      `);

    // Starfire
    defs.append('symbol')
      .attr('id', 'starfireIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FF6B00" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 40 Q50 20 70 40" fill="#FFD700"/>
        <path d="M40 45 L60 45 L50 70 Z" fill="#FFD700"/>
        <circle cx="50" cy="35" r="10" fill="#FFD700"/>
      `);

    // Raven
    defs.append('symbol')
      .attr('id', 'ravenIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#191970" stroke="#9400D3" stroke-width="2"/>
        <path d="M30 45 Q50 20 70 45 L60 70 Q50 80 40 70 Z" fill="#9400D3"/>
        <path d="M40 50 L60 50" stroke="#191970" stroke-width="2"/>
      `);

    // Beast Boy
    defs.append('symbol')
      .attr('id', 'beastBoyIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#228B22" stroke="#32CD32" stroke-width="2"/>
        <path d="M30 40 Q50 30 70 40 L60 60 Q50 70 40 60 Z" fill="#32CD32"/>
        <circle cx="40" cy="45" r="5" fill="#228B22"/>
        <circle cx="60" cy="45" r="5" fill="#228B22"/>
      `);

    // Cyborg
    defs.append('symbol')
      .attr('id', 'cyborgIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#4682B4" stroke="#C0C0C0" stroke-width="2"/>
        <circle cx="40" cy="40" r="10" fill="#FF0000"/>
        <rect x="30" y="45" width="40" height="20" fill="#C0C0C0"/>
        <path d="M35 50 L65 50 M35 55 L65 55" stroke="#4682B4" stroke-width="2"/>
      `);

    // Kid Flash
    defs.append('symbol')
      .attr('id', 'kidFlashIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#FF0000" stroke-width="2"/>
        <path d="M60 20 L45 45 L55 45 L40 80" fill="#FF0000" stroke="#FF0000"/>
        <path d="M30 50 Q50 20 70 50" fill="none" stroke="#FF0000" stroke-width="2"/>
      `);

    // Terra
    defs.append('symbol')
      .attr('id', 'terraIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#8B4513" stroke="#FFD700" stroke-width="2"/>
        <path d="M20 60 Q50 20 80 60" fill="#FFD700"/>
        <path d="M30 70 Q50 40 70 70" fill="#8B4513"/>
      `);

    // Aqualad
    defs.append('symbol')
      .attr('id', 'aqualadIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000080" stroke="#00FFFF" stroke-width="2"/>
        <path d="M25 50 Q50 70 75 50 Q50 30 25 50" fill="#00FFFF"/>
        <path d="M40 40 L60 40" stroke="#000080" stroke-width="2"/>
      `);

    // Speedy/Arsenal
    defs.append('symbol')
      .attr('id', 'speedyIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#8B0000" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 50 L50 20 L70 50" fill="none" stroke="#FFD700" stroke-width="3"/>
        <path d="M45 45 L50 70 L55 45" fill="none" stroke="#FFD700" stroke-width="3"/>
      `);

    // Wonder Girl
    defs.append('symbol')
      .attr('id', 'wonderGirlIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#CD0000" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 40 L70 40 L50 70 Z" fill="#FFD700"/>
        <circle cx="50" cy="30" r="10" fill="#FFD700"/>
      `);

    // Flash Family Additional Icons
    // Jesse Quick
    defs.append('symbol')
      .attr('id', 'jesseQuickIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#FF0000" stroke-width="2"/>
        <path d="M60 20 L45 45 L55 45 L40 80" fill="#FF0000" stroke="#FF0000"/>
        <text x="50" y="40" text-anchor="middle" fill="#FF0000" font-size="12">JSA</text>
      `);

    // Max Mercury
    defs.append('symbol')
      .attr('id', 'maxMercuryIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#C0C0C0" stroke="#4169E1" stroke-width="2"/>
        <path d="M60 20 L45 45 L55 45 L40 80" fill="#4169E1" stroke="#4169E1"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#4169E1" stroke-width="2"/>
      `);

    // XS
    defs.append('symbol')
      .attr('id', 'xsIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#FF1493" stroke-width="2"/>
        <path d="M30 30 L70 70 M30 70 L70 30" stroke="#FF1493" stroke-width="3"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#FF1493" stroke-width="2"/>
      `);

    // Johnny Quick
    defs.append('symbol')
      .attr('id', 'johnnyQuickIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#B8860B" stroke="#FFD700" stroke-width="2"/>
        <path d="M60 20 L45 45 L55 45 L40 80" fill="#FFD700" stroke="#FFD700"/>
        <text x="50" y="40" text-anchor="middle" fill="#FFD700" font-size="12">3x2(9YZ)4A</text>
      `);

    // Impulse
    defs.append('symbol')
      .attr('id', 'impulseIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#FF4500" stroke="#FFD700" stroke-width="2"/>
        <path d="M60 20 L40 50 L60 50 L30 80" fill="#FFD700" stroke="#FFD700"/>
        <path d="M20 50 Q50 20 80 50" fill="none" stroke="#FFD700" stroke-width="2"/>
      `);

    // Liberty Belle
    defs.append('symbol')
      .attr('id', 'libertyBelleIcon')
      .attr('viewBox', '0 0 100 100')
      .append('g')
      .html(`
        <circle cx="50" cy="50" r="45" fill="#000080" stroke="#FFD700" stroke-width="2"/>
        <path d="M35 30 Q50 20 65 30 L60 60 Q50 70 40 60 Z" fill="#FFD700"/>
        <path d="M45 40 L55 40" stroke="#000080" stroke-width="2"/>
      `);
  }

  setupSimulation() {
    // Enhanced simulation parameters for better connection clarity and layout
    const simulationStrength = -2000;
    const linkDistance = 200;
    const alphaDecay = 0.005;
    const velocityDecay = 0.4;
    const centerStrength = 0.05;

    // Create map of node IDs for efficient lookup
    const nodeMap = new Map(this.data.nodes.map(node => [node.id, node]));

    // Process connections to ensure they reference valid nodes
    const validConnections = this.data.connections.filter(conn => {
      const sourceNode = typeof conn.source === 'string' ? nodeMap.get(conn.source) : conn.source;
      const targetNode = typeof conn.target === 'string' ? nodeMap.get(conn.target) : conn.target;
      return sourceNode && targetNode;
    });

    this.simulation = d3.forceSimulation(this.data.nodes)
      .force('charge', d3.forceManyBody()
        .strength(d => simulationStrength * (this.getNodeSize(d) / 20))
        .distanceMax(2000)
        .theta(0.9)
      )
      .force('center', d3.forceCenter(this.width / 2, this.height / 2)
        .strength(centerStrength)
      )
      .force('collision', d3.forceCollide()
        .radius(d => this.getNodeSize(d) * 2.5)
        .strength(0.9)
        .iterations(3)
      )
      .force('x', d3.forceX(this.width / 2).strength(0.05))
      .force('y', d3.forceY(this.height / 2).strength(0.05))
      .force('link', d3.forceLink(validConnections)
        .id(d => d.id)
        .distance(d => {
          const sourceSize = this.getNodeSize(d.source);
          const targetSize = this.getNodeSize(d.target);
          return linkDistance * Math.log(sourceSize + targetSize) / 2;
        })
        .strength(d => {
          // Enhanced connection strength based on relationship type
          const baseStrength = 0.3;
          const typeMultipliers = {
            'family': 1.2,
            'alliance': 1.1,
            'conflict': 0.9,
            'protects': 1.0,
            'threatens': 0.8,
            'mentored': 1.1,
            'cosmic': 1.3,
            'speedforce': 1.2,
            'multiverse': 1.2,
            'dark_multiverse': 1.1,
            'absolute': 1.3
          };
          return baseStrength * (typeMultipliers[d.type] || 1);
        })
      )
      .velocityDecay(velocityDecay)
      .alphaMin(0.001)
      .alphaDecay(alphaDecay)
      .on('tick', () => this.ticked());

    // Initial alpha boost for better layout
    this.simulation.alpha(1).restart();
  }

  getNodeSize(node) {
    if (!node) return 10;

    // Adjust base sizes for different node types
    const typeBaseSizes = {
      'cosmic': 35,
      'dimensions': 32,
      'universe': 30,
      'events': 28,
      'planets': 26,
      'heroes': 24,
      'villains': 24,
      'organizations': 22,
      'locations': 20,
      'items': 18,
      'variants': 22,
      'characters': 20
    };

    // Get base size from type or default to 20
    const baseSize = typeBaseSizes[node.type] || 20;
    
    // Apply importance scaling
    const importance = this.data.getNodeImportance(node);
    const sizeMultiplier = Math.sqrt(importance) / 8;

    // Calculate final size
    return Math.max(15, Math.min(40, baseSize * sizeMultiplier));
  }

  setupZoom() {
    this.zoom = d3.zoom()
      .scaleExtent([0.01, 10]) // Allow zooming out much further
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    const initialScale = 0.1; // Start more zoomed out
    const transform = d3.zoomIdentity
      .translate(this.width / 2, this.height / 2)
      .scale(initialScale)
      .translate(-this.width / 2, -this.height / 2);

    this.svg.call(this.zoom)
      .call(this.zoom.transform, transform);
  }

  render() {
    // Enhanced connection rendering with special effects
    const links = this.g.selectAll('.link')
      .data(this.data.connections)
      .join('line')
      .attr('class', d => {
        const classes = ['link'];
        if (this.isSpeedForceConnection(d)) classes.push('speed-force');
        if (this.isCosmicConnection(d)) classes.push('cosmic');
        if (this.isAbsoluteConnection(d)) classes.push('absolute');
        return classes.join(' ');
      })
      .style('stroke', d => this.getLinkColor(d))
      .style('stroke-opacity', d => {
        if (this.isSpeedForceConnection(d)) return 0.8;
        if (this.isCosmicConnection(d)) return 0.7;
        if (this.isAbsoluteConnection(d)) return 0.9;
        return 0.4;
      })
      .style('stroke-width', d => {
        const baseWidth = Math.max(0.5, d.strength || 1);
        if (this.isCosmicConnection(d)) return baseWidth * 2;
        if (this.isSpeedForceConnection(d)) return baseWidth * 1.8;
        if (this.isAbsoluteConnection(d)) return baseWidth * 2.2;
        return baseWidth;
      });

    // Add special effects for certain connection types
    links.filter(this.isSpeedForceConnection)
      .style('stroke-dasharray', '5,5')
      .style('animation', 'dash 20s linear infinite');

    links.filter(this.isCosmicConnection)
      .style('filter', 'url(#glow)');

    links.filter(this.isAbsoluteConnection)
      .style('stroke-dasharray', '10,10')
      .style('animation', 'dash 30s linear infinite reverse');

    // Enhanced node rendering
    const nodes = this.g.selectAll('.node')
      .data(this.data.nodes)
      .join('g')
      .attr('class', 'node')
      .call(this.drag());

    nodes.selectAll('*').remove();

    // Add click target
    nodes.append('circle')
      .attr('class', 'click-target')
      .attr('r', d => this.getNodeSize(d) * 1.5)
      .style('cursor', 'pointer');

    // Add icons with error handling
    nodes.append('use')
      .attr('href', d => {
        const iconId = this.getNodeIcon(d);
        // Verify icon exists
        if (!this.svg.select(iconId).empty()) {
          return iconId;
        }
        // Fall back to default if missing
        console.warn(`Missing icon ${iconId} for ${d.id}, using default`);
        return '#defaultIcon';
      })
      .attr('width', d => this.getNodeSize(d) * 2)
      .attr('height', d => this.getNodeSize(d) * 2)
      .attr('x', d => -this.getNodeSize(d))
      .attr('y', d => -this.getNodeSize(d))
      .style('pointer-events', 'none')
      .style('fill', d => this.data.getNodeColor(d.id));

    // Update label positioning and styling
    nodes.append('text')
      .attr('dx', d => this.getNodeSize(d) + 8)
      .attr('dy', '.35em')
      .text(d => d.name)
      .style('fill', '#fff')
      .style('font-size', d => `${Math.max(10, this.getNodeSize(d) / 2)}px`)
      .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none');

    // Set up node interactions on the click-target circle
    nodes.select('.click-target')
      .on('click', (event, d) => this.emit('nodeClick', d));

    return nodes;
  }

  getNodeIcon(d) {
    // Default icon mappings 
    const defaultTypeIcons = {
      'heroes': '#defaultIcon',
      'villains': '#villainIcon',
      'locations': '#locationIcon', 
      'items': '#itemIcon',
      'events': '#eventIcon',
      'planets': '#planetIcon',
      'dimensions': '#dimensionIcon',
      'civilizations': '#civilizationIcon',
      'organizations': '#organizationIcon',
      'variants': '#variantIcon',
      'cosmic': '#cosmicIcon',
      'characters': '#characterIcon',
      'universe': '#universeIcon'
    };

    // Comprehensive icon mapping
    const specificIconMap = {
      // Heroes
      'superman': '#supermanIcon',
      'batman': '#batmanIcon',
      'wonderWoman': '#wonderWomanIcon', 
      'flash': '#flashIcon',
      'greenLantern': '#greenLanternIcon',
      'aquaman': '#aquamanIcon',
      'martianManhunter': '#martianManhunterIcon',
      'greenArrow': '#greenArrowIcon',
      'blackCanary': '#blackCanaryIcon',
      'hawkman': '#hawkmanIcon',
      'hawkgirl': '#hawkgirlIcon',
      'zatanna': '#zatannaIcon',
      'shazam': '#shazamIcon',
      'booster_gold': '#heroIcon',
      'doctor_fate': '#heroIcon',

      // Villains
      'joker': '#jokerIcon',
      'lexLuthor': '#villainIcon',
      'brainiac': '#brainiacIcon',
      'darkseid': '#darkseidIcon', 
      'harleyQuinn': '#harleyIcon',
      'poisonIvy': '#ivyIcon',
      'cheetah': '#villainIcon',
      'black_adam': '#villainIcon',
      'deathstroke': '#villainIcon',

      // Locations 
      'gotham': '#gothamIcon',
      'metropolis': '#metropolisIcon',
      'themyscira': '#locationIcon',
      'fortress_of_solitude': '#fortressOfSolitudeIcon',
      'batcave': '#locationIcon',
      'watchtower': '#locationIcon',
      'arkhamAsylum': '#locationIcon',

      // Cosmic Entities
      'presence': '#presenceIcon',
      'source': '#sourceIcon',
      'monitor_mind': '#monitorMindIcon',
      'perpetua': '#cosmicIcon',
      'monitor': '#monitorIcon',
      'anti_monitor': '#monitorIcon',
      'world_forger': '#cosmicIcon',

      // Planets
      'krypton': '#planetIcon',
      'apokolips': '#planetIcon', 
      'new_genesis': '#planetIcon',
      'oa': '#planetIcon',
      'thanagar': '#planetIcon',
      'mars': '#planetIcon',

      // Variants
      'red_son_superman': '#redSonIcon',
      'kingdom_come_superman': '#kingdomComeIcon', 
      'gaslight_batman': '#gaslightIcon',
      'dark_batman': '#darkMultiverseIcon',
      'bizarro_superman': '#bizarroIcon',
      'flashpoint_batman': '#flashpointIcon',
      'earth8_heroes': '#earth8Icon',
      'absolute_superman': '#defaultIcon',

      // Speed Force
      'speedForce': '#speedForceIcon',
      'negative_speedforce': '#speedForceIcon',

      // Organizations
      'justice_league': '#organizationIcon',
      'suicide_squad': '#organizationIcon',
      'legion_of_doom': '#organizationIcon',

      // Add remaining mappings for all possible nodes...
      // Default backup icon
      'default': '#defaultIcon'
    };

    // Try to get specific icon first
    if (d.id && specificIconMap[d.id]) {
      return specificIconMap[d.id];
    }
    // Fall back to type-based icon
    else if (d.type && defaultTypeIcons[d.type]) {
      return defaultTypeIcons[d.type];
    }
    // Final fallback
    return '#defaultIcon';
  }

  getLinkColor(connection) {
    // Special color overrides for thematic connections
  
    // Flash/Speed Force connections get gold lightning color
    if (connection.source.id.includes('flash') || 
        connection.target.id.includes('flash') || 
        connection.source.id.includes('speedForce') || 
        connection.target.id.includes('speedForce')) {
      return '#FFD700'; // Gold color for Speed Force connections
    }

    // Dark Multiverse connections get dark purple
    if (connection.source.id.includes('dark_') || 
        connection.target.id.includes('dark_')) {
      return '#4B0082'; // Dark purple for Dark Multiverse
    }

    // Cosmic entity connections get bright cyan
    if (connection.source.type === 'cosmic' || 
        connection.target.type === 'cosmic') {
      return '#00FFFF'; // Cyan for cosmic connections
    }

    // Multiverse connections get magenta
    if (connection.source.id.includes('earth') || 
        connection.target.id.includes('earth') ||
        connection.source.id.includes('multiverse') || 
        connection.target.id.includes('multiverse')) {
      return '#FF00FF'; // Magenta for multiversal connections
    }

    // Kingdom Come connections get golden amber
    if (connection.source.id.includes('kingdom_come') || 
        connection.target.id.includes('kingdom_come')) {
      return '#FFB90F'; // Golden amber for Kingdom Come
    }

    // Red Son connections get soviet red
    if (connection.source.id.includes('red_son') || 
        connection.target.id.includes('red_son')) {
      return '#CC0000'; // Soviet red for Red Son universe
    }

    // Bizarro connections get pale blue
    if (connection.source.id.includes('bizarro') || 
        connection.target.id.includes('bizarro')) {
      return '#87CEEB'; // Sky blue for Bizarro world
    }

    // Gaslight connections get sepia brown
    if (connection.source.id.includes('gaslight') || 
        connection.target.id.includes('gaslight')) {
      return '#704214'; // Sepia for Gaslight universe
    }

    // Absolute connections get pure white
    if (connection.source.id.includes('absolute') || 
        connection.target.id.includes('absolute')) {
      return '#FFFFFF'; // Pure white for Absolute realm
    }

    // Base relationship types
    const relationshipColors = {
      'family': '#FF69B4',     // Pink for family connections
      'alliance': '#32CD32',   // Lime green for alliances
      'conflict': '#FF4500',   // Red-orange for conflicts
      'protects': '#4169E1',   // Royal blue for protection
      'threatens': '#8B0000',  // Dark red for threats
      'mentored': '#DEB887',   // Burlywood for mentor relationships
      'cosmic': '#9932CC',     // Purple for cosmic connections
      'multiversal': '#FF00FF' // Magenta for multiversal connections
    };

    return relationshipColors[connection.type] || '#666666'; // Default gray
  }

  ticked() {
    this.g.selectAll('.link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this.g.selectAll('.node')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

  drag() {
    return d3.drag()
      .on('start', this.dragstarted.bind(this))
      .on('drag', this.dragged.bind(this))
      .on('end', this.dragended.bind(this));
  }

  dragstarted(event) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  dragended(event) {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  handleResize() {
    this.width = this.container.node().getBoundingClientRect().width;
    this.height = this.container.node().getBoundingClientRect().height;
    
    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2).strength(0.03));
    this.simulation.force('x', d3.forceX(this.width / 2).strength(0.03));
    this.simulation.force('y', d3.forceY(this.height / 2).strength(0.03));
    
    this.simulation.alpha(0.3).restart();
  }

  highlightNodes(nodes) {
    this.g.selectAll('.node')
      .style('opacity', d => nodes.includes(d) ? 1 : 0.2);
  }

  applyFilter(filter) {
    const filteredNodes = this.data.getFilteredNodes(filter);
    this.highlightNodes(filteredNodes);
  }

  focusNode(node) {
    if (!node || !this.zoom || !this.svg || !this.g) return;

    const bounds = this.svg.node().getBoundingClientRect();
    const scale = 1.5;
    
    const x = (node.x !== undefined) ? node.x : bounds.width / 2;
    const y = (node.y !== undefined) ? node.y : bounds.height / 2;

    const transform = d3.zoomIdentity
      .translate(bounds.width / 2, bounds.height / 2)
      .scale(scale)
      .translate(-x, -y);

    this.g.selectAll('.node').style('opacity', 1);
    this.g.selectAll('.link').style('opacity', 0.6);

    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, transform);

    if (node) {
      this.g.selectAll('.node')
        .style('opacity', d => (d === node || this.isConnectedNode(d, node)) ? 1 : 0.2);
      
      this.g.selectAll('.link')
        .style('opacity', d => {
          const isConnected = d.source === node || d.target === node || 
                            d.source.id === node.id || d.target.id === node.id;
          return isConnected ? 1 : 0.1;
        })
        .style('stroke-width', d => {
          const isConnected = d.source === node || d.target === node || 
                            d.source.id === node.id || d.target.id === node.id;
          return isConnected ? Math.max(0.5, d.strength || 1) * 2 : Math.max(0.5, d.strength || 1);
        });
    }
  }

  isConnectedNode(nodeA, nodeB) {
    if (!nodeA || !nodeB) return false;
    
    return this.data.connections.some(conn => {
      const sourceId = typeof conn.source === 'object' ? conn.source.id : conn.source;
      const targetId = typeof conn.target === 'object' ? conn.target.id : conn.target;
      const nodeAId = typeof nodeA === 'object' ? nodeA.id : nodeA;
      const nodeBId = typeof nodeB === 'object' ? nodeB.id : nodeB;
      
      return (sourceId === nodeAId && targetId === nodeBId) ||
             (sourceId === nodeBId && targetId === nodeAId);
    });
  }

  on(event, handler) {
    this.eventHandlers.set(event, handler);
  }

  emit(event, data) {
    const handler = this.eventHandlers.get(event);
    if (handler) handler(data);
  }

  checkIconVisibility() {
    const svg = this.svg;
    const defs = svg.select('defs');

    // Check each potential icon reference
    this.data.nodes.forEach(node => {
      const iconId = this.getNodeIcon(node).substring(1); // Remove #
      const icon = defs.select(`#${iconId}`);
      
      // If icon is missing, create a default replacement
      if (icon.empty()) {
        console.warn(`Creating replacement icon for missing: ${iconId}`);
        
        defs.append('symbol')
          .attr('id', iconId)
          .attr('viewBox', '0 0 100 100')
          .append('g')
          .html(`
            <circle cx="50" cy="50" r="45" fill="#666666" stroke="#ffffff" stroke-width="2"/>
            <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#ffffff" font-size="40">?</text>
          `);
      }
    });

    // Log final icon count
    console.log(`Total icons available: ${defs.selectAll('symbol').size()}`);
  }

  isSpeedForceConnection(d) {
    return d.source.id?.includes('flash') || 
           d.target.id?.includes('flash') || 
           d.source.id?.includes('speedForce') || 
           d.target.id?.includes('speedForce') ||
           d.type === 'speedforce';
  }

  isCosmicConnection(d) {
    return d.source.type === 'cosmic' || 
           d.target.type === 'cosmic' ||
           d.type === 'cosmic';
  }

  isAbsoluteConnection(d) {
    return d.source.id?.includes('absolute') || 
           d.target.id?.includes('absolute') ||
           d.type === 'absolute';
  }
}