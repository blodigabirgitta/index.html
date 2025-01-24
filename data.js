export class DCUniverseData {
  constructor() {
    // Initialize all nodes first with expanded data sets
    this.nodes = [
      ...this.generateCosmicEntities(),
      ...this.generateBaseCharacters(),
      ...this.generateContingencyPlans(),
      ...this.generateEvents(),
      ...this.generateLocations(),
      ...this.generateDimensions(),
      ...this.generateLandmarks(),
      ...this.generateCivilizations(),
      ...this.generateItems(),
      ...this.generateCharacters(),
      ...this.generateSmallItems(),
      ...this.generateMinorLocations(),
      ...this.generateStreetLevelCharacters(),
      ...this.generateBatcaveItems(),
      ...this.generateHideouts(),
      ...this.generateVehicles(),
      ...this.generateSecretBases(),
      ...this.generateCrises(),
      ...this.generateCities(),
      ...this.generateOrganizations(),
      ...this.generateTimelines(),
      ...this.generateRaces(),
      ...this.generateArtifacts(),
      ...this.generateSidekicks(),
      ...this.generateTeenTitans(),
      ...this.generateTitansTower(),
      ...this.generateYoungJustice(),
      ...this.generateJusticeLeagueMembers(),
      ...this.generateLegionOfSuperHeroes(),
      ...this.generateGodsAndDeities(),
      ...this.generateMagicUsers(),
      ...this.generateAlienRaces(),
      ...this.generatePlanets(),
      ...this.generateFlashVariants(),
      ...this.generateVariants(),
      ...this.generateVillainVariants(),
      ...this.generateHeroes(),
      ...this.generateVillains(),
      ...this.generateUniverses(),
      ...this.generateRedSonLocations(),
      ...this.generateRedSonOrganizations(),
      ...this.generateRedSonEvents(),
      ...this.generateDarkMultiverseContent(),
      ...this.generateGaslightContent(),
      ...this.generateEarth32Content(),
      ...this.generateKingdomComeContent(),
      ...this.generateLeatherwingContent(),
      ...this.generateEarth8Content(),
      ...this.generateFlashpointContent(),
      ...this.generateBizarroContent(),
      ...this.generateAbsoluteContent(),
    ].filter((node, index, self) => 
      // Filter out duplicates based on id
      index === self.findIndex((n) => n.id === node.id)
    );

    // Validate and fix connections
    this.validateConnections();

    // Generate connections after nodes are properly initialized
    this.connections = [];
    this.generateConnections();
  }

  validateConnections() {
    const validNodeIds = new Set(this.nodes.map(node => node.id));
    
    this.nodes.forEach(node => {
      if (node.connections) {
        // Remove invalid connections
        const validConnections = node.connections.filter(targetId => {
          const isValid = validNodeIds.has(targetId);
          if (!isValid) {
            console.warn(`Removing invalid connection from ${node.id} to ${targetId}`);
          }
          return isValid;
        });
        
        // Update node's connections
        node.connections = validConnections;
        
        // Ensure important characters have meaningful connections
        if (node.connections.length === 0) {
          switch(node.type) {
            case 'heroes':
              // Connect heroes to their primary city or team
              if (node.id.includes('batman')) {
                node.connections.push('gotham');
              } else if (node.id.includes('superman')) {
                node.connections.push('metropolis');
              }
              break;
              
            case 'villains':
              // Connect villains to their archenemies or bases
              if (node.id.includes('joker')) {
                node.connections.push('batman');
                node.connections.push('arkhamAsylum');
              }
              break;
              
            case 'locations':
              // Connect locations to relevant characters or other locations
              if (node.id.includes('gotham')) {
                node.connections.push('batman');
                node.connections.push('arkhamAsylum');
              }
              break;
          }
        }
      }
    });
  }

  generateConnections() {
    const connections = new Set();
    const validNodeIds = new Set(this.nodes.map(node => node.id));

    // Validate all connections first
    this.nodes.forEach(node => {
      if (node.connections) {
        // Filter out invalid connections
        node.connections = node.connections.filter(targetId => {
          const isValid = validNodeIds.has(targetId);
          if (!isValid) {
            console.warn(`Removing invalid connection from ${node.id} to ${targetId}`);
          }
          return isValid;
        });
      }
    });

    // Create bidirectional connections
    this.nodes.forEach(node => {
      if (node.connections) {
        node.connections.forEach(targetId => {
          const connId = [node.id, targetId].sort().join('-');
          if (!connections.has(connId)) {
            connections.add(connId);
            
            // Get the target node
            const targetNode = this.getNodeById(targetId);
            if (targetNode) {
              // Determine the most appropriate connection type
              const connectionType = this.inferConnectionType(node, targetNode);
              const connectionStrength = this.getConnectionStrength(node, targetNode);
              
              this.connections.push({
                source: node.id,
                target: targetId,
                type: connectionType,
                strength: connectionStrength
              });

              // Ensure bidirectional connection exists
              if (!targetNode.connections) {
                targetNode.connections = [];
              }
              if (!targetNode.connections.includes(node.id)) {
                targetNode.connections.push(node.id);
              }
            }
          }
        });
      }
    });
  }

  inferConnectionType(source, target) {
    if (!source || !target) return 'default';

    // Expanded connection type logic
    const typeMap = {
      // Hero connections
      'heroes-heroes': 'alliance',
      'heroes-villains': 'conflict',
      'heroes-locations': 'protects',
      'heroes-items': 'uses',
      'heroes-civilizations': 'protects',
      
      // Villain connections
      'villains-villains': 'alliance',
      'villains-locations': 'threatens',
      'villains-items': 'uses',
      'villains-civilizations': 'threatens',
      
      // Location connections
      'locations-locations': 'connected',
      'locations-civilizations': 'contains',
      
      // Family connections
      'family-family': 'family',
      
      // Mentor connections
      'mentor-protege': 'mentored',
      
      // Cosmic connections
      'cosmic-cosmic': 'cosmic',
      'cosmic-dimensions': 'encompasses',
      
      // Dimensional connections
      'dimensions-dimensions': 'connected',
      
      // Event connections
      'events-locations': 'affects',
      'events-events': 'sequential',
      
      // Planet connections
      'planets-civilizations': 'contains',
      'planets-locations': 'contains'
    };

    const connectionKey = `${source.type}-${target.type}`;
    return typeMap[connectionKey] || 'default';
  }

  getNodeImportance(node) {
    if (!node) return 1;

    const typeImportance = {
      'cosmic': 100,         // Highest importance for cosmic entities
      'dimensions': 90,      // Fundamental aspects of reality
      'universe': 85,        // Universe-level importance
      'events': 80,         // Major reality-altering events
      'planets': 60,        // Important worlds
      'heroes': 50,         // Major heroes
      'villains': 50,       // Major villains
      'organizations': 40,  // Groups and teams
      'locations': 35,      // Key locations
      'items': 30,          // Significant items
      'variants': 45,       // Important variants
      'characters': 25      // Regular characters
    };

    // Specific entity importance overrides
    const specialImportance = {
      // Cosmic level
      'presence': 200,              // Supreme being
      'source': 190,               // Fundamental force
      'monitor_mind': 185,         // Living multiverse
      'perpetua': 180,             // Mother of multiverse
      'hyperouterverse': 175,      // Contains all existence
      'source_overvoid': 170,      // Contains all stories
      'anti_monitor': 165,         // Universe destroyer
      'world_forger': 160,         // Universe creator

      // Multiversal level
      'multiverse': 150,           // The multiverse itself
      'dark_multiverse': 145,      // Dark reflection
      'bleedSpace': 140,           // Space between universes
      'speedForce': 135,           // Fundamental force of speed
      'absolute_dimension': 130,    // Perfect reality

      // Universe level
      'earth0': 120,               // Prime Earth
      'earth1': 110,               // Main alternate
      'earth3': 110,               // Mirror universe

      // Major Heroes/Villains
      'superman': 100,             // Greatest hero
      'batman': 100,               // Greatest detective
      'wonderWoman': 95,           // Greatest warrior
      'flash': 95,                 // Fastest hero
      'darkseid': 95,              // Ultimate evil
      'barry_allen_flash': 90,     // Main Flash
      'joker': 85,                 // Greatest villain
      'lexLuthor': 85,             // Brilliant adversary

      // Speed Force hierarchy
      'barry_allen_flash': 95,     // The Flash
      'wally_west_flash': 90,      // Fastest Flash
      'jay_garrick_flash': 85,     // Original Flash
      'reverse_flash': 85,         // Main speedster villain
      'zoom': 80,                  // Major speedster villain
      'godspeed': 75,             // Newer speedster villain
      'max_mercury': 70,          // Zen master of speed
      'jesse_quick': 65,          // Legacy speedster

      // Major locations
      'gotham': 70,               // Batman's city
      'metropolis': 70,           // Superman's city
      'themyscira': 65,          // Wonder Woman's home
      'fortress_of_solitude': 60, // Superman's base
      'batcave': 60,             // Batman's base
      'arkhamAsylum': 55,        // Major villain location

      // Important items
      'anti_life_equation': 75,   // Reality-changing formula
      'mother_box': 65,          // New Gods technology
      'batcomputer': 50,         // Batman's supercomputer
      'utility_belt': 45         // Batman's tools
    };

    // Base importance calculation
    const baseImportance = specialImportance[node.id] || typeImportance[node.type] || 20;
  
    // Connection multiplier (more connections = more important)
    const connectionMultiplier = node.connections ? 
      Math.min(2.5, 1 + (node.connections.length / 20)) : 1;

    // Specific theme multipliers
    const speedForceMultiplier = 
      (node.id.includes('flash') || 
       node.id.includes('speedForce') || 
       node.id.includes('speedster')) ? 1.5 : 1;

    const cosmicMultiplier =
      (node.type === 'cosmic' || 
       node.id.includes('monitor') || 
       node.id.includes('source')) ? 1.8 : 1;

    const multiversalMultiplier =
      (node.id.includes('earth_') || 
       node.id.includes('multiverse') || 
       node.id.includes('crisis')) ? 1.3 : 1;

    // Calculate final importance
    return baseImportance * 
           connectionMultiplier * 
           speedForceMultiplier * 
           cosmicMultiplier * 
           multiversalMultiplier;
  }

  getConnectionStrength(source, target) {
    const sourceImportance = this.getNodeImportance(source);
    const targetImportance = this.getNodeImportance(target);
    return (sourceImportance + targetImportance) / (2 * 40); // Normalize to 0-1 range
  }

  getNodeById(id) {
    return this.nodes.find(node => node.id === id);
  }

  search(query) {
    if (!query) return this.nodes;
    
    const lowercaseQuery = query.toLowerCase();
    return this.nodes.filter(node => 
      node.name.toLowerCase().includes(lowercaseQuery) ||
      node.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  getRandomNode() {
    return this.nodes[Math.floor(Math.random() * this.nodes.length)];
  }

  getFilteredNodes(filter) {
    return filter ? this.nodes.filter(node => node.type === filter) : this.nodes;
  }

  getNodeColor(id) {
    const node = this.getNodeById(id);
    if (!node) return '#666666'; // Default gray
    
    const typeColors = {
      'heroes': '#0033CC',        // Blue for heroes
      'villains': '#CC0000',      // Red for villains
      'locations': '#006600',     // Green for locations
      'items': '#CC6600',         // Bronze for items
      'events': '#660066',        // Purple for events
      'planets': '#FF3300',       // Orange for planets
      'dimensions': '#3300CC',    // Deep blue for dimensions
      'civilizations': '#009999', // Teal for civilizations
      'organizations': '#666699', // Slate for organizations
      'variants': '#CC00CC',      // Magenta for variants
      'cosmic': '#FFCC00',        // Gold for cosmic entities
      'characters': '#339933'     // Sage for regular characters
    };

    // Special color overrides for important nodes
    const specialColors = {
      'multiverse': '#FF00FF',      // Bright magenta
      'hyperouterverse': '#FFFF00', // Bright yellow
      'presence': '#FFFFFF',        // White
      'monitor': '#00FFFF',         // Cyan
      'anti_monitor': '#FF0000',    // Bright red
      'perpetua': '#FF9900',        // Bright orange
      'superman': '#0066CC',        // Superman blue
      'batman': '#333333',          // Dark gray
      'wonderWoman': '#CC0033'      // Wonder Woman red
    };

    return specialColors[id] || typeColors[node.type] || '#666666';
  }

  getNodeSize(node) {
    if (!node) return 10;

    // Special size multipliers for Flash-related nodes
    const flashMultiplier = node.id.includes('flash') || 
                           node.id.includes('speedForce') || 
                           node.id.includes('speedster') ? 1.5 : 1;

    const importance = this.getNodeImportance(node);
    // Scale node sizes more proportionally with Flash multiplier
    return Math.max(8, Math.min(35, Math.sqrt(importance) * 2 * flashMultiplier));
  }

  generateBaseCharacters() {
    return [
      {
        id: 'batman',
        type: 'heroes',
        name: 'Batman',
        description: 'The Dark Knight of Gotham, master detective and martial artist.',
        comedicLine: "I have a gadget for everything... except maintaining healthy relationships.",
        connections: ['robin', 'joker', 'gotham']
      },
      {
        id: 'superman',
        type: 'heroes',
        name: 'Superman',
        description: 'The Last Son of Krypton, Earth\'s greatest protector.',
        comedicLine: "My only weakness is kryptonite... and writing convincing excuses for my boss.",
        connections: ['metropolis', 'lexLuthor']
      },
      {
        id: 'joker',
        type: 'villains',
        name: 'The Joker',
        description: 'The Clown Prince of Crime, Batman\'s arch-nemesis.',
        comedicLine: "I used to be a normal criminal, but then I took a chemical bath. My HMO didn't cover that.",
        connections: ['batman', 'gotham', 'harleyQuinn']
      },
      {
        id: 'wonderWoman',
        type: 'heroes',
        name: 'Wonder Woman',
        description: 'Princess Diana of Themyscira, warrior for peace and justice.',
        comedicLine: "I can deflect bullets with my bracelets, but paperwork? That's my true nemesis.",
        connections: ['themyscira', 'cheetah']
      },
      {
        id: 'gotham',
        type: 'locations',
        name: 'Gotham City',
        description: 'A dark and brooding metropolis, home to Batman and countless villains.',
        comedicLine: "Our city motto: 'At least we're not Bludhaven!' The tourism board is still workshopping it.",
        connections: ['batman', 'joker', 'arkhamAsylum']
      },
      {
        id: 'metropolis',
        type: 'locations',
        name: 'Metropolis',
        description: 'The City of Tomorrow, protected by Superman.',
        comedicLine: "The city with the highest building insurance rates in the DC Universe!",
        connections: ['superman', 'lexLuthor', 'dailyPlanet']
      },
      {
        id: 'arkhamAsylum',
        type: 'locations',
        name: 'Arkham Asylum',
        description: 'Psychiatric hospital for Gotham\'s criminally insane.',
        comedicLine: "Our revolving door policy is unmatched in the industry!",
        connections: ['joker', 'gotham', 'harleyQuinn']
      },
      {
        id: 'harleyQuinn',
        type: 'villains',
        name: 'Harley Quinn',
        description: 'Former psychiatrist turned chaotic antihero.',
        comedicLine: "I'm not crazy, I'm just drawn that way!",
        connections: ['joker', 'poisonIvy', 'arkhamAsylum']
      },
      {
        id: 'poisonIvy',
        type: 'villains',
        name: 'Poison Ivy',
        description: 'Botanical biochemist turned eco-terrorist.',
        comedicLine: "My favorite pickup line? 'Hey, want to see my garden?'",
        connections: ['harleyQuinn', 'batman', 'gotham']
      },
      {
        id: 'lexLuthor',
        type: 'villains',
        name: 'Lex Luthor',
        comedicLine: "I could cure cancer, but Superman just makes me so mad!",
        description: 'Brilliant businessman and Superman\'s arch-nemesis.',
        connections: ['superman', 'metropolis']
      },
      {
        id: 'cheetah',
        type: 'villains',
        name: 'Cheetah',
        description: 'Archaeologist cursed with the powers of a cheetah goddess.',
        comedicLine: "I'm basically a really fancy cat lady.",
        connections: ['wonderWoman', 'themyscira']
      },
      {
        id: 'krypton',
        type: 'planets',
        name: 'Krypton',
        description: 'Superman\'s home planet, destroyed due to its unstable radioactive core.',
        comedicLine: "Home of the universe's most indestructible babies and most self-destructive planet core!",
        connections: ['superman', 'kandor']
      },
      {
        id: 'apokolips',
        type: 'planets',
        name: 'Apokolips',
        description: 'Darkseid\'s hellish domain, a planet of fire pits and endless suffering.',
        comedicLine: "The universe's worst vacation destination, 0/5 stars on GalacticTrip Advisor.",
        connections: ['darkseid', 'newGenesis']
      },
      {
        id: 'newGenesis',
        type: 'planets',
        name: 'New Genesis',
        description: 'A technological paradise and eternal rival to Apokolips.',
        comedicLine: "Where even the trash cans are powered by cosmic energy!",
        connections: ['apokolips', 'highfather']
      },
      {
        id: 'oa',
        type: 'planets',
        name: 'Oa',
        description: 'Headquarters of the Green Lantern Corps at the center of the universe.',
        comedicLine: "The only place where wearing green spandex is actually part of the dress code.",
        connections: ['greenLantern', 'guardiansOfTheUniverse']
      },
      {
        id: 'thanagar',
        type: 'planets',
        name: 'Thanagar',
        description: 'Home world of the Hawk-people and their advanced technology.',
        comedicLine: "Where having wings isn't a Red Bull marketing slogan!",
        connections: ['hawkman', 'hawkgirl']
      },
      {
        id: 'mogo',
        type: 'planets',
        name: 'Mogo',
        description: 'The living planet and member of the Green Lantern Corps.',
        comedicLine: "The only Green Lantern who can't attend team meetings in person!",
        connections: ['oa', 'greenLantern']
      },
      {
        id: 'rann',
        type: 'planets',
        name: 'Rann',
        description: 'Advanced technological world, home of Adam Strange.',
        comedicLine: "Where jet packs are considered outdated technology!",
        connections: ['adamStrange', 'sardath']
      },
      {
        id: 'mars',
        type: 'planets',
        name: 'Mars',
        description: 'Home world of the Martian Manhunter and the White Martians.',
        comedicLine: "Not to be confused with the Mars candy bar, though both are out of this world!",
        connections: ['martianManhunter', 'whiteMartians']
      },
      {
        id: 'warworld',
        type: 'planets',
        name: 'Warworld',
        description: 'A mobile artificial planet designed for gladiatorial combat.',
        comedicLine: "Like a Death Star, but with better entertainment options!",
        connections: ['mongul', 'superman']
      },
      {
        id: 'earthPrime',
        type: 'planets',
        name: 'Earth-Prime',
        description: 'The main Earth of the DC Multiverse, designated Earth-0 or New Earth. This is where the primary continuity of DC Comics takes place and where most of the main heroes reside.',
        comedicLine: "Where being a superhero is somehow still a part-time job that lets you maintain a secret identity!",
        connections: ['batman', 'superman', 'wonderWoman', 'metropolis', 'gotham', 'themyscira']
      },
      {
        id: 'multiverse',
        type: 'events',
        name: 'The Multiverse',
        description: 'The vast collection of parallel universes that make up the DC cosmos, with Earth-Prime at its center.',
        comedicLine: "It's like cable TV - infinite channels, but you still can't find anything good to watch!",
        connections: ['earthPrime', 'apokolips', 'newGenesis', 'krypton']
      },
      {
        id: 'martianManhunter',
        type: 'heroes',
        name: 'Martian Manhunter',
        description: 'Last survivor of Mars, shapeshifter and telepath.',
        comedicLine: "I can read minds, but some thoughts I wish I could unread.",
        connections: ['mars', 'justice_league']
      },
      {
        id: 'hawkgirl',
        type: 'heroes',
        name: 'Hawkgirl',
        description: 'Thanagarian warrior with ancient weapons and nth metal.',
        comedicLine: "Yes, the wings are real. No, you can't touch them.",
        connections: ['thanagar', 'justice_league']
      },
      {
        id: 'greenArrow',
        type: 'heroes',
        name: 'Green Arrow',
        description: 'Master archer and social justice warrior.',
        comedicLine: "I fight crime with a stick and string from the paleolithic era.",
        connections: ['starCity', 'justice_league']
      },
      {
        id: 'blackCanary',
        type: 'heroes',
        name: 'Black Canary',
        description: 'Martial artist with supersonic scream.',
        comedicLine: "My superpower is basically screaming. My therapist loves that.",
        connections: ['starCity', 'birds_of_prey']
      }
    ];
  }

  generateLocations() {
    return [
      {
        id: 'hubCity',
        type: 'locations',
        name: 'Hub City',
        description: 'Home of The Question, known for its corruption and mystery.',
        comedicLine: "Where the crime rate is higher than the property values!",
        connections: ['question', 'blue_beetle']
      },
      {
        id: 'opal_city',
        type: 'locations',
        name: 'Opal City',
        description: 'Art deco metropolis protected by Starman.',
        comedicLine: "The only city where Art Deco never went out of style!",
        connections: ['starman', 'shade']
      },
      {
        id: 'kahndaq',
        type: 'locations',
        name: 'Kahndaq',
        description: 'Ancient nation ruled by Black Adam.',
        comedicLine: "Where the tourism slogan is 'Visit or face the wrath of Black Adam!'",
        connections: ['blackAdam', 'isis']
      },
      {
        id: 'ace_chemicals',
        type: 'locations',
        name: 'Ace Chemicals',
        description: 'The chemical plant where Joker was transformed, a significant Gotham landmark.',
        comedicLine: "Our safety record is... well, let's not talk about that!",
        connections: ['joker', 'gotham']
      },
      {
        id: 'iceberg_lounge',
        type: 'locations',
        name: 'Iceberg Lounge',
        description: 'Penguin\'s upscale nightclub and criminal enterprise front.',
        comedicLine: "The only place in Gotham where the drinks are literally ice cold!",
        connections: ['penguin', 'gotham']
      },
      {
        id: 'crime_alley',
        type: 'locations',
        name: 'Crime Alley',
        description: 'The infamous alley where Bruce Wayne\'s parents were murdered.',
        comedicLine: "Gotham's least successful urban renewal project.",
        connections: ['batman', 'gotham']
      },
      {
        id: 'strykers_island',
        type: 'locations',
        name: 'Stryker\'s Island',
        description: 'Maximum security prison in Metropolis harbor.',
        comedicLine: "Where the 'time out corner' is really, really serious.",
        connections: ['metropolis', 'lexLuthor']
      },
      {
        id: 'smallville',
        type: 'locations',
        name: 'Smallville',
        description: 'Rural Kansas town where Clark Kent grew up, known for its strong community values and strange meteor-related incidents.',
        comedicLine: "Where corn fields hide more secrets than the Pentagon!",
        connections: ['superman', 'metropolis']
      },
      {
        id: 'kingdom_come_gulag',
        type: 'locations',
        name: 'The Gulag',
        description: 'Massive superhuman prison facility built to house rogue metahumans, eventually becoming the site of a catastrophic battle.',
        comedicLine: "The world's most super-powered timeout corner.",
        connections: ['kingdom_come_superman', 'kingdom_come_mankind', 'kingdom_come_battle']
      },
      {
        id: 'kingdom_come_batcave',
        type: 'locations',
        name: 'Kingdom Come Batcave',
        description: 'Bruce Wayne\'s modernized command center, filled with automated Batman robots and surveillance technology.',
        comedicLine: "Where the Batcomputer got several million upgrades.",
        connections: ['kingdom_come_batman', 'kingdom_come_mankind', 'kingdom_come_robots']
      },
      {
        id: 'gotham_harbor_494',
        type: 'locations',
        name: 'Port Gotham',
        description: 'A bustling colonial port city, home base of Leatherwing\'s operations.',
        comedicLine: "Where the criminals are as salty as the sea air.",
        connections: ['leatherwing_batman', 'flying_fox', 'bat_cove_494']
      },
      {
        id: 'bat_cove_494',
        type: 'locations',
        name: 'Bat\'s Cove',
        description: 'Secret cove where Leatherwing maintains his base of operations and repairs his ship.',
        comedicLine: "The only bat cave that comes with ocean view!",
        connections: ['leatherwing_batman', 'flying_fox', 'gotham_harbor_494']
      },
      {
        id: 'dark_forge',
        type: 'locations',
        name: 'The Dark Forge',
        description: 'The twisted version of the World Forge where nightmarish realities are created in the Dark Multiverse.',
        comedicLine: "Where bad ideas become worse realities!",
        connections: ['dark_multiverse', 'barbatos', 'world_forge', 'dark_knights']
      },
      {
        id: 'nightmare_batcave',
        type: 'locations',
        name: 'The Nightmare Batcave',
        description: 'The central hub of the Dark Knights in the Dark Multiverse, a twisted version of the Batcave.',
        comedicLine: "Like the regular Batcave, but with more screaming!",
        connections: ['batman_who_laughs', 'dark_knights', 'batcave', 'dark_multiverse']
      },
      {
        id: 'dark_wayne_tower',
        type: 'locations',
        name: 'Dark Wayne Tower',
        description: 'A twisted skyscraper in the Dark Multiverse that serves as a beacon of nightmare.',
        comedicLine: "The worst corporate headquarters ever!",
        connections: ['dark_multiverse', 'batman_who_laughs', 'wayne_tower', 'dark_knights']
      },
      {
        id: 'gotham_gaslight',
        type: 'locations',
        name: 'Victorian Gotham',
        description: 'Gothic, steampunk version of Gotham City in the late 1800s.',
        comedicLine: "Where the fog is thick and the plot is thicker.",
        connections: ['batman_gaslight', 'whitechapel_gaslight', 'arkham_gaslight']
      },
      {
        id: 'whitechapel_gaslight',
        type: 'locations',
        name: 'Whitechapel District',
        description: 'Dangerous neighborhood in Victorian Gotham, site of the Ripper murders.',
        comedicLine: "Tourist rates are surprisingly affordable... for obvious reasons.",
        connections: ['ripper_gotham', 'gotham_gaslight', 'police_gaslight']
      },
      {
        id: 'arkham_gaslight',
        type: 'locations',
        name: 'Arkham Royal Hospital',
        description: 'Victorian psychiatric hospital combining cutting-edge science with questionable practices.',
        comedicLine: "Where the padded cells are actually an upgrade.",
        connections: ['gotham_gaslight', 'batman_gaslight', 'asylum_staff']
      },
      {
        id: 'police_gaslight',
        type: 'locations',
        name: 'Gotham Metropolitan Police',
        description: 'Steam-powered police headquarters in Victorian Gotham.',
        comedicLine: "Where the coffee is always cold but the steam pipes are always hot.",
        connections: ['gordon_gaslight', 'gotham_gaslight', 'batman_gaslight']
      },
      {
        id: 'circus_gaslight',
        type: 'locations',
        name: 'Haly\'s Grand Circus',
        description: 'Victorian circus where Selina Kyle performs.',
        comedicLine: "The greatest show in Gotham... when the Ripper isn't around.",
        connections: ['selina_gaslight', 'gotham_gaslight', 'batman_gaslight']
      }
    ];
  }

  generateDimensions() {
    return [
      {
        id: 'source_wall',
        type: 'dimensions',
        name: 'The Source Wall',
        description: 'The barrier at the edge of known creation containing trapped beings who tried to breach it, protecting The Source.',
        comedicLine: "The universe's biggest 'Do Not Enter' sign.",
        connections: ['source', 'perpetua', 'monitors', 'new_gods']
      },
      {
        id: 'source',
        type: 'cosmic',
        name: 'The Source',
        description: 'The cosmic consciousness behind all creation, the fundamental force of the DC Universe.',
        comedicLine: "The ultimate cosmic parent who doesn't return your calls.",
        connections: ['source_wall', 'presence', 'perpetua', 'sphere_of_gods']
      },
      {
        id: 'presence',
        type: 'cosmic',
        name: 'The Presence',
        description: 'The supreme being of the DC Universe, the creator of all existence.',
        comedicLine: "Even omnipotent beings need a vacation sometimes.",
        connections: ['source', 'great_darkness', 'endless', 'heaven']
      },
      {
        id: 'great_darkness',
        type: 'cosmic',
        name: 'The Great Darkness',
        description: 'The primordial void that existed before creation, eternal opposite of The Presence.',
        comedicLine: "Darker than a black hole's morning coffee.",
        connections: ['presence', 'upside_down_man', 'empty_hand']
      },
      {
        id: 'perpetua',
        type: 'cosmic',
        name: 'Perpetua',
        description: 'The original creator of the DC Multiverse, mother of the Monitor, Anti-Monitor, and World Forger.',
        comedicLine: "Mother knows best... how to create and destroy universes.",
        connections: ['source', 'monitor', 'anti_monitor', 'world_forger']
      },
      {
        id: 'empty_hand',
        type: 'cosmic',
        name: 'The Empty Hand',
        description: 'The entity of absolute ending that exists beyond the Source Wall.',
        comedicLine: "When nothing wants to be something, but destructively.",
        connections: ['source_wall', 'great_darkness', 'gentry']
      },
      {
        id: 'monitor_mind',
        type: 'cosmic',
        name: 'Monitor-Mind The Overvoid',
        description: 'The living consciousness of the blank page on which all of creation is drawn.',
        comedicLine: "The ultimate blank canvas with an attitude.",
        connections: ['monitors', 'source', 'perpetua']
      },
      {
        id: 'world_forge',
        type: 'dimensions',
        name: 'World Forge',
        description: 'The cosmic forge where potential universes are created and failed ones sink into the Dark Multiverse.',
        comedicLine: "Where universes go for their performance review.",
        connections: ['world_forger', 'dark_multiverse', 'dragon']
      },
      {
        id: 'endless',
        type: 'cosmic',
        name: 'The Endless',
        description: 'Seven embodiments of universal constants: Destiny, Death, Dream, Destruction, Desire, Despair, and Delirium.',
        comedicLine: "The most dysfunctional family reunion in existence.",
        connections: ['presence', 'death', 'dream', 'destiny']
      },
      {
        id: 'hypertime',
        type: 'dimensions',
        name: 'Hypertime',
        description: 'The flowing temporal force that contains all possible timelines and variations of reality.',
        comedicLine: "When regular time just isn't complicated enough.",
        connections: ['linear_men', 'time_trapper', 'metron']
      },
      {
        id: 'sphere_of_gods',
        type: 'dimensions',
        name: 'Sphere of the Gods',
        description: 'The realm where gods and higher dimensional beings exist above the multiverse.',
        comedicLine: "Where even gods have to deal with cosmic HOA regulations.",
        connections: ['new_gods', 'presence', 'dream']
      },
      {
        id: 'monitor_sphere',
        type: 'dimensions',
        name: 'Monitor Sphere',
        description: 'The realm of the Monitors who observe and maintain the multiverse.',
        comedicLine: "The ultimate surveillance system of reality.",
        connections: ['monitors', 'nix_uotan', 'source_wall']
      },
      {
        id: 'sixth_dimension',
        type: 'dimensions',
        name: 'Sixth Dimension',
        description: 'The highest plane of existence where all possibilities and impossibilities exist simultaneously.',
        comedicLine: "Where 'anything is possible' is literally true.",
        connections: ['world_forger', 'perpetua', 'mxyzptlk']
      },
      {
        id: 'speedForce',
        type: 'dimensions',
        name: 'The Speed Force',
        description: 'Extra-dimensional energy source that powers all speedsters.',
        comedicLine: "Where running late is physically impossible!",
        connections: ['flash', 'reverse_flash', 'time_wraiths']
      },
      {
        id: 'bleedSpace',
        type: 'dimensions',
        name: 'The Bleed',
        description: 'The crimson space between universes in the multiverse.',
        comedicLine: "The multiversal equivalent of that space between your couch cushions.",
        connections: ['multiverse', 'monitors']
      },
      {
        id: 'dreamDimension',
        type: 'dimensions',
        name: 'The Dreaming',
        description: 'Realm of dreams ruled by Morpheus, one of the Endless.',
        comedicLine: "Where your weirdest dreams go to hang out.",
        connections: ['sandman', 'lucien', 'dream_vortex']
      },
      {
        id: 'house_of_mystery',
        type: 'dimensions',
        name: 'House of Mystery',
        description: 'Sentient structure that serves as a gateway between realms.',
        comedicLine: "Where the furniture rearranges itself just to mess with you.",
        connections: ['johnConstantine', 'cain', 'dreamDimension']
      },
      {
        id: 'house_of_secrets',
        type: 'dimensions',
        name: 'House of Secrets',
        description: 'Sister house to the House of Mystery, repository of dark knowledge.',
        comedicLine: "Like its sister house, but with better ghost stories.",
        connections: ['abel', 'house_of_mystery', 'dreamDimension']
      },
      {
        id: 'limbo',
        type: 'dimensions',
        name: 'Limbo',
        description: 'The space between existence and non-existence.',
        comedicLine: "The multiverse's waiting room.",
        connections: ['multiverse', 'crisis_on_infinite_earths']
      },
      {
        id: 'phantom_zone',
        type: 'dimensions',
        name: 'Phantom Zone',
        description: 'Kryptonian prison dimension where time doesn\'t pass.',
        comedicLine: "The ultimate time-out corner.",
        connections: ['superman', 'zod', 'krypton']
      },
      {
        id: 'fifth_dimension',
        type: 'dimensions',
        name: 'Fifth Dimension',
        description: 'Home of imp-like beings with reality-altering powers.',
        comedicLine: "Where the laws of physics go to party.",
        connections: ['mxyzptlk', 'bat_mite', 'superman']
      },
      {
        id: 'microverse',
        type: 'dimensions',
        name: 'The Microverse',
        description: 'Subatomic universe accessed through size reduction.',
        comedicLine: "Where atoms look like solar systems and dust bunnies are kaiju.",
        connections: ['atom', 'science', 'quantum_realm']
      },
      {
        id: 'dream_dimension',
        type: 'dimensions',
        name: 'The Dream Dimension',
        description: 'Realm of dreams and nightmares ruled by Doctor Destiny.',
        comedicLine: "Where sheep count you to sleep.",
        connections: ['doctor_destiny', 'dreams', 'nightmares']
      },
      {
        id: 'mirror_dimension',
        type: 'dimensions',
        name: 'Mirror Dimension',
        description: 'Parallel realm accessed through reflective surfaces.',
        comedicLine: "Where your reflection does more than just wave back.",
        connections: ['mirror_master', 'flash', 'scudder']
      },
      {
        id: 'underworld',
        type: 'dimensions',
        name: 'The Underworld',
        description: 'Realm of the dead from Greek mythology.',
        comedicLine: "Like Hell, but with better architecture.",
        connections: ['hades', 'wonderWoman', 'greek_gods']
      },
      {
        id: 'oblivion_bar',
        type: 'dimensions',
        name: 'Oblivion Bar',
        description: 'Extra-dimensional tavern for magic users.',
        comedicLine: "Where everybody knows your magical name.",
        connections: ['detective_chimp', 'zatanna', 'shadowpact']
      },
      {
        id: 'dark_multiverse',
        type: 'dimensions',
        name: 'Dark Multiverse',
        description: 'A vast realm beneath the regular multiverse where nightmares and broken timelines exist, created from the fears and hopes that were never meant to be.',
        comedicLine: "Where every 'what if' scenario is a horror story!",
        connections: ['barbatos', 'batman_who_laughs', 'dark_knights', 'world_forge', 'nightmare_worlds']
      },
      {
        id: 'nightmare_worlds',
        type: 'dimensions',
        name: 'Nightmare Worlds',
        description: 'Unstable realities within the Dark Multiverse where each Dark Knight\'s twisted origin occurred.',
        comedicLine: "Where good dreams go to become nightmares.",
        connections: ['dark_multiverse', 'dark_knights', 'batman_who_laughs', 'barbatos']
      }
    ];
  }

  generateEvents() {
    return [
      {
        id: 'crisis_on_infinite_earths',
        type: 'events',
        name: 'Crisis on Infinite Earths',
        description: 'Multiversal event that resulted in the collapse of the infinite universes into one.',
        comedicLine: "When spring cleaning goes too far.",
        connections: ['anti_monitor', 'monitor', 'multiverse']
      },
      {
        id: 'infinite_crisis',
        type: 'events',
        name: 'Infinite Crisis',
        description: 'Reality-altering crisis that threatened the reconstructed universe.',
        comedicLine: "Because one crisis wasn't enough!",
        connections: ['alexander_luthor', 'superboy_prime', 'multiverse']
      },
      {
        id: 'final_crisis',
        type: 'events',
        name: 'Final Crisis',
        description: 'Darkseid\'s ultimate plan to corrupt reality itself.',
        comedicLine: "The crisis to end all crises... until the next one.",
        connections: ['darkseid', 'batman', 'superman']
      },
      // Add DCeased events
      {
        id: 'anti_life_virus',
        type: 'events',
        name: 'Anti-Life Virus Outbreak',
        description: 'The technological version of the Anti-Life Equation that infected humanity.',
        comedicLine: "Finally, a reason to stop checking your phone!",
        connections: ['dceased_earth', 'darkseid', 'cyborg']
      },
      {
        id: 'dceased_earth',
        type: 'events',
        name: 'DCeased Earth',
        description: 'The apocalyptic version of Earth where the Anti-Life virus transformed humanity.',
        comedicLine: "Like a zombie apocalypse, but with capes!",
        connections: ['anti_life_virus', 'earthPrime', 'multiverse']
      },
      {
        id: 'dark_nights_metal',
        type: 'events',
        name: 'Dark Nights: Metal',
        description: 'A crisis event unveiling the Dark Multiverse.',
        comedicLine: "Who knew rock and roll could save or doom the universe?",
        connections: ['batman_who_laughs', 'dark_multiverse']
      },
      {
        id: 'dark_knights_rising',
        type: 'events',
        name: 'Dark Knights Rising',
        description: 'The invasion of the Dark Knights into the main multiverse, spreading nightmare across reality.',
        comedicLine: "The worst family reunion ever!",
        connections: ['dark_knights', 'batman_who_laughs', 'final_batman', 'dark_multiverse']
      },
      {
        id: 'dark_crisis',
        type: 'events',
        name: 'Dark Crisis',
        description: 'The aftermath of the Dark Multiverse invasion, reshaping reality and testing the heroes\' resolve.',
        comedicLine: "Just when you thought it couldn't get darker!",
        connections: ['dark_multiverse', 'barbatos', 'batman_who_laughs', 'dark_knights']
      }
    ];
  }

  generateLandmarks() {
    return [
      {
        id: 'daily_planet',
        type: 'landmarks',
        name: 'Daily Planet',
        description: 'Metropolis\'s premier newspaper and Clark Kent\'s workplace.',
        comedicLine: "Where Superman ensures his own press coverage!",
        connections: ['metropolis', 'superman']
      },
      {
        id: 'wayne_tower',
        type: 'landmarks',
        name: 'Wayne Tower',
        description: 'Headquarters of Wayne Enterprises and Gotham landmark.',
        comedicLine: "The only skyscraper with its own cave system!",
        connections: ['gotham', 'batman']
      },
      {
        id: 'titans_tower',
        type: 'landmarks',
        name: 'Titans Tower',
        description: 'T-shaped headquarters of the Teen Titans.',
        comedicLine: "Architecture by teenagers, for teenagers!",
        connections: ['teen_titans', 'jumpCity']
      }
    ];
  }

  generateCivilizations() {
    return [
      {
        id: 'amazons',
        type: 'civilizations',
        name: 'Amazons of Themyscira',
        description: 'Immortal warrior women blessed by the Greek gods.',
        comedicLine: "Where 'girl power' has been trending for 3000 years!",
        connections: ['themyscira', 'wonderWoman']
      },
      {
        id: 'atlanteans',
        type: 'civilizations',
        name: 'Atlanteans',
        description: 'Advanced underwater civilization ruled by Aquaman.',
        comedicLine: "Living proof that water damage isn't always covered by insurance!",
        connections: ['atlantis', 'aquaman']
      },
      {
        id: 'new_gods',
        type: 'civilizations',
        name: 'New Gods',
        description: 'Divine beings from New Genesis and Apokolips.',
        comedicLine: "Making other gods feel obsolete since the Third World!",
        connections: ['newGenesis', 'apokolips']
      },
      {
        id: 'reach',
        type: 'civilizations',
        name: 'The Reach',
        description: 'Ancient alien civilization of conquerors.',
        comedicLine: "We come in peace... terms and conditions apply.",
        connections: ['blue_beetle', 'scarab', 'invasion']
      }
    ];
  }

  generateItems() {
    return [
      {
        id: 'anti_life_equation',
        type: 'items',
        name: 'Anti-Life Equation',
        description: 'Mathematical proof of the futility of free will.',
        comedicLine: "The universe's most dangerous math homework!",
        connections: ['darkseid', 'mister_miracle']
      },
      {
        id: 'miracle_machine',
        type: 'items',
        name: 'Miracle Machine',
        description: 'Ancient device that can turn thoughts into reality.',
        comedicLine: "Warning: User's imagination may vary!",
        connections: ['legion_of_superheroes', 'brainiac']
      },
      {
        id: 'medusa_mask',
        type: 'items',
        name: 'Medusa Mask',
        description: 'Psycho-Pirate\'s emotion-controlling mask.',
        comedicLine: "The original emoji generator!",
        connections: ['psycho_pirate', 'crisis_on_infinite_earths']
      },
      {
        id: 'nth_metal',
        type: 'items',
        name: 'Nth Metal',
        description: 'Mysterious metal with anti-dark matter properties.',
        comedicLine: "The only metal that makes Dark Knights rust!",
        connections: ['hawkman', 'dark_multiverse', 'thanagar']
      },
      {
        id: 'dark_metal',
        type: 'items',
        name: 'Dark Metal',
        description: 'Metal from the Dark Multiverse that corrupts reality.',
        comedicLine: "Like regular metal, but with more existential dread.",
        connections: ['barbatos', 'dark_multiverse', 'batman_who_laughs']
      },
      {
        id: 'power_ring',
        type: 'items',
        name: 'Green Lantern Ring',
        description: 'Power ring fueled by willpower.',
        comedicLine: "The universe's most powerful jewelry.",
        connections: ['green_lantern', 'oa', 'willpower']
      },
      {
        id: 'mother_box',
        type: 'items',
        name: 'Mother Box',
        description: 'Living computer from New Genesis.',
        comedicLine: "Siri's much, much smarter cousin.",
        connections: ['new_gods', 'technology', 'boom_tube']
      },
      {
        id: 'flying_fox_ship',
        type: 'items',
        name: 'The Flying Fox',
        description: 'Leatherwing\'s advanced ship, equipped with numerous secret weapons and devices.',
        comedicLine: "The only bat-vehicle that actually needs a crew.",
        connections: ['leatherwing_batman', 'flying_fox', 'bat_cove_494']
      },
      {
        id: 'leatherwing_cutlass',
        type: 'items',
        name: 'Bat-Cutlass',
        description: 'Leatherwing\'s signature weapon, a specially modified sword with hidden mechanisms.',
        comedicLine: "Because every bat needs a fancy sword!",
        connections: ['leatherwing_batman', 'flying_fox_ship', 'crew_494']
      },
      {
        id: 'dark_journal',
        type: 'items',
        name: 'The Dark Journal',
        description: 'A tome containing the secrets and histories of the Dark Multiverse.',
        comedicLine: "The worst bedtime reading ever!",
        connections: ['batman_who_laughs', 'barbatos', 'dark_knights', 'dark_multiverse']
      },
      {
        id: 'nightmare_batarangs',
        type: 'items',
        name: 'Nightmare Batarangs',
        description: 'Weapons forged from Dark Metal that spread corruption and fear.',
        comedicLine: "For when regular Batarangs aren't scary enough!",
        connections: ['dark_knights', 'batman_who_laughs', 'dark_metal', 'batarang']
      },
      {
        id: 'steam_batsuit',
        type: 'items',
        name: 'Steam-Powered Batsuit',
        description: 'Victorian Batman\'s costume, featuring brass gadgets and steam-powered enhancements.',
        comedicLine: "The only bat-suit that requires coal to operate.",
        connections: ['batman_gaslight', 'gotham_gaslight', 'wayne_workshop']
      },
      {
        id: 'wayne_ring',
        type: 'items',
        name: 'Wayne\'s Green Lantern Ring',
        description: 'The power ring that chose Bruce Wayne instead of Hal Jordan.',
        comedicLine: "Somehow even more expensive than his regular gadgets.",
        connections: ['batman_lantern', 'earth32', 'jordan_32']
      }
    ];
  }

  generateVariants() {
    return [
      // DCeased variants
      {
        id: 'dceased_superman',
        type: 'variants',
        name: 'DCeased Superman',
        description: 'Superman infected by the Anti-Life virus.',
        comedicLine: "Even in death, still flying... just more murderously.",
        connections: ['superman', 'anti_life_virus', 'dceased_earth']
      },
      // ... other variants ...
      {
        id: 'red_son_superman',
        type: 'variants',
        name: 'Red Son Superman',
        description: 'Superman who landed in Soviet Ukraine instead of Kansas, becoming the leader of the Soviet Union and attempting to spread communist ideals globally through peaceful means.',
        comedicLine: "In Soviet Russia, hope symbol wears you!",
        connections: ['red_son_batman', 'red_son_wonder_woman', 'red_son_earth', 'red_son_brainiac']
      },
      {
        id: 'owlman',
        type: 'variants',
        name: 'Owlman',
        description: 'Evil alternate universe version of Batman.',
        comedicLine: "Like Batman, but with more existential nihilism.",
        connections: ['batman', 'crime_syndicate', 'earth3']
      },
      {
        id: 'kingdom_come_superman',
        type: 'variants',
        name: 'Kingdom Come Superman',
        description: 'An older, more powerful Superman who retreated from humanity after the Joker killed Lois Lane and the Daily Planet staff. He returns to lead the old guard of heroes against a new violent generation.',
        comedicLine: "Still flies faster than a speeding bullet... just with more grey hair.",
        connections: ['kingdom_come_wonder_woman', 'kingdom_come_batman', 'kingdom_come_norman', 'kingdom_come_magog']
      },
      {
        id: 'kingdom_come_batman',
        type: 'variants',
        name: 'Kingdom Come Batman',
        description: 'An aged Bruce Wayne who operates from the Batcave using robots and technology after his body failed him. He leads a human resistance movement.',
        comedicLine: "Who needs a Batsuit when you have an army of robot Batmen?",
        connections: ['kingdom_come_superman', 'kingdom_come_wonder_woman', 'kingdom_come_batcave', 'kingdom_come_titans']
      },
      {
        id: 'kingdom_come_wonder_woman',
        type: 'variants',
        name: 'Kingdom Come Wonder Woman',
        description: 'Diana returns from self-imposed exile to help Superman reform the Justice League and guide humanity back to heroic ideals.',
        comedicLine: "Still an ambassador of peace... just with less patience for nonsense.",
        connections: ['kingdom_come_superman', 'kingdom_come_batman', 'kingdom_come_league', 'themyscira']
      },
      {
        id: 'kingdom_come_magog',
        type: 'villains',
        name: 'Magog',
        description: 'The violent antihero whose killing of the Joker and public approval led to Superman\'s retirement and a new age of brutal vigilantism.',
        comedicLine: "Making Superman retire was probably not the best career move.",
        connections: ['kingdom_come_superman', 'kingdom_come_norman', 'kingdom_come_mankind']
      },
      {
        id: 'kingdom_come_norman',
        type: 'heroes',
        name: 'Norman McCay',
        description: 'An elderly pastor granted the power to witness the coming apocalypse by The Spectre, serving as the story\'s moral center.',
        comedicLine: "When your parish includes superheroes, the confessional gets really interesting.",
        connections: ['kingdom_come_spectre', 'kingdom_come_superman', 'kingdom_come_mankind']
      }
    ];
  }

  generateCharacters() {
    // DCeased characters
    return [
      // ... existing characters ...
      {
        id: 'jonathan_kent',
        type: 'characters',
        name: 'Jonathan Kent',
        description: 'Superman\'s adoptive father who taught him strong moral values.',
        comedicLine: "Raising a super-powered teen is just like regular parenting... with more property damage!",
        connections: ['martha_kent', 'clark_kent', 'kent_farm']
      },
      {
        id: 'martha_kent',
        type: 'characters',
        name: 'Martha Kent',
        description: 'Superman\'s adoptive mother who helped him embrace his humanity.',
        comedicLine: "The only mom who has to wash bulletproof clothes!",
        connections: ['jonathan_kent', 'clark_kent', 'kent_farm']
      },
      {
        id: 'lana_lang',
        type: 'characters',
        name: 'Lana Lang',
        description: 'Clark Kent\'s first love and childhood friend from Smallville.',
        comedicLine: "Being Superman's ex is a super-complicated relationship status!",
        connections: ['clark_kent', 'smallville_high', 'pete_ross']
      },
      {
        id: 'pete_ross',
        type: 'characters',
        name: 'Pete Ross',
        description: 'Clark\'s best friend from Smallville who kept his secret.',
        comedicLine: "Best friend to Superman, still can't get good concert tickets!",
        connections: ['clark_kent', 'smallville_high', 'lana_lang']
      },
      {
        id: 'american_crusader',
        type: 'heroes',
        name: 'American Crusader',
        description: 'Leader of the Retaliators, Earth-8\'s version of Captain America.',
        comedicLine: "He's got a shield too... but it's legally distinct!",
        connections: ['retaliators', 'new_metropolis_8', 'earth8']
      },
      {
        id: 'lord_havok',
        type: 'villains',
        name: 'Lord Havok',
        description: 'Brilliant but megalomaniacal scientist, leader of the Extremists.',
        comedicLine: "Like Doom... but different enough to avoid lawsuits!",
        connections: ['meta_militia', 'angor', 'earth8']
      },
      {
        id: 'bizarro_superman',
        type: 'characters',
        name: 'Bizarro',
        description: 'Imperfect duplicate of Superman who does everything backwards.',
        comedicLine: "Me am not Superman! Me am Bizarro!",
        connections: ['bizarro_world', 'bizarro_metropolis', 'bizarro_league']
      },
      {
        id: 'bizarro_lois',
        type: 'characters',
        name: 'Bizarro Lois',
        description: 'Backwards version of Lois Lane who hates journalism.',
        comedicLine: "Me write worst stories ever! Editor love them!",
        connections: ['bizarro_superman', 'bizarro_metropolis', 'bizarro_daily_planet']
      },
      {
        id: 'thomas_wayne_batman',
        type: 'heroes',
        name: 'Thomas Wayne Batman',
        description: 'Version of Batman where Bruce\'s father survived and became a more violent Dark Knight.',
        comedicLine: "The Dark Knight who makes regular Batman look cheerful!",
        connections: ['martha_wayne_joker', 'flashpoint_gotham', 'flashpoint_flash']
      },
      {
        id: 'martha_wayne_joker',
        type: 'villains',
        name: 'Martha Wayne Joker',
        description: 'Bruce\'s mother who went insane after his death and became the Joker.',
        comedicLine: "When a mother's love turns to madness... literally!",
        connections: ['thomas_wayne_batman', 'flashpoint_gotham', 'flashpoint_batman']
      }
    ];
  }

  generateSmallItems() {
    return [
      {
        id: 'batarang',
        type: 'items',
        name: 'Batarang',
        description: 'Batman\'s signature throwing weapon shaped like a bat.',
        comedicLine: "Because regular boomerangs aren't dramatic enough.",
        connections: ['batman', 'utility_belt']
      },
      {
        id: 'bat_shark_repellent',
        type: 'items',
        name: 'Bat-Shark Repellent',
        description: 'Infamous spray used by Batman to ward off sharks.',
        comedicLine: "For those very specific ocean-based bat-emergencies.",
        connections: ['utility_belt', 'batman']
      },
      {
        id: 'trick_arrows',
        type: 'items',
        name: 'Trick Arrows',
        description: 'Green Arrow\'s arsenal of specialized arrows.',
        comedicLine: "Because sometimes you need a boxing glove on an arrow. Don't ask why.",
        connections: ['greenArrow', 'arrowcave']
      }
    ];
  }

  generateMinorLocations() {
    return [
      {
        id: 'gotham_coffee',
        type: 'locations',
        name: 'Gotham Coffee Shop',
        description: 'Popular coffee shop frequented by GCPD officers.',
        comedicLine: "Where even the coffee is dark and bitter.",
        connections: ['gotham', 'gcpd_officer']
      },
      {
        id: 'big_belly_burger',
        type: 'locations',
        name: 'Big Belly Burger',
        description: 'Popular fast-food chain across multiple DC cities.',
        comedicLine: "Serving heroes and villains alike - we don't judge, we just flip burgers.",
        connections: ['metropolis', 'centralCity']
      },
      {
        id: 'metropolis_park',
        type: 'locations',
        name: 'Centennial Park',
        description: 'Metropolis\'s largest public park, featuring Superman statue.',
        comedicLine: "Home to the only statue Superman feels awkward posing next to.",
        connections: ['metropolis', 'superman']
      }
    ];
  }

  generateStreetLevelCharacters() {
    return [
      {
        id: 'gcpd_officer',
        type: 'characters',
        name: 'GCPD Officer',
        description: 'Dedicated police officer serving Gotham City.',
        comedicLine: "Just trying to do my job in a city where even the plants are criminals.",
        connections: ['commissioner_gordon', 'gotham']
      },
      {
        id: 'arkham_guard',
        type: 'characters',
        name: 'Arkham Guard',
        description: 'Security guard at Arkham Asylum with the world\'s most dangerous job.',
        comedicLine: "My job security is great, but the actual security... not so much.",
        connections: ['arkhamAsylum', 'joker']
      },
      {
        id: 'daily_planet_intern',
        type: 'characters',
        name: 'Daily Planet Intern',
        description: 'Aspiring journalist at Metropolis\'s premier newspaper.',
        comedicLine: "No one notices I'm gone during supervillain attacks either!",
        connections: ['dailyPlanet', 'jimmy_olsen']
      }
    ];
  }

  generateBatcaveItems() {
    return [
      {
        id: 'giant_penny',
        type: 'items',
        name: 'Giant Penny',
        description: 'Trophy from Batman\'s encounter with the Penny Plunderer.',
        comedicLine: "Heads I win, tails you lose... storage space.",
        connections: ['batcave', 'batman', 'trophy_room']
      },
      {
        id: 'trex',
        type: 'items',
        name: 'Mechanical T-Rex',
        description: 'Giant robotic dinosaur from Dinosaur Island, now a Batcave trophy.',
        comedicLine: "The ultimate guard dog, no kibble required!",
        connections: ['batcave', 'trophy_room']
      },
      {
        id: 'joker_card',
        type: 'items',
        name: 'Giant Joker Card',
        description: 'Oversized playing card from one of Joker\'s schemes.',
        comedicLine: "When regular playing cards just aren't dramatic enough.",
        connections: ['batcave', 'joker', 'trophy_room']
      },
      {
        id: 'batcomputer',
        type: 'items',
        name: 'Batcomputer',
        description: 'World\'s most advanced supercomputer system in the Batcave.',
        comedicLine: "Even Batman has to deal with Windows updates.",
        connections: ['batcave', 'batman', 'oracle']
      }
    ];
  }

  generateHideouts() {
    return [
      {
        id: 'trophy_room',
        type: 'locations',
        name: 'Trophy Room',
        description: 'Section of the Batcave housing Batman\'s collection of memorabilia.',
        comedicLine: "The world's most dangerous museum, admission by invitation only.",
        connections: ['batcave', 'giant_penny', 'trex']
      },
      {
        id: 'med_bay',
        type: 'locations',
        name: 'Batcave Medical Bay',
        description: 'Fully equipped emergency medical facility in the Batcave.',
        comedicLine: "Where 'walk it off' meets actual medical treatment.",
        connections: ['batcave', 'alfred', 'batman']
      },
      {
        id: 'arsenal',
        type: 'locations',
        name: 'Bat-Arsenal',
        description: 'Weapons and equipment storage facility in the Batcave.',
        comedicLine: "Home of a million bat-prefixed gadgets.",
        connections: ['batcave', 'utility_belt', 'batman']
      },
      {
        id: 'clock_tower',
        type: 'locations',
        name: 'Clock Tower',
        description: 'Oracle\'s base of operations and information hub.',
        comedicLine: "Time-telling is our least important function!",
        connections: ['barbara_gordon', 'gotham', 'birds_of_prey']
      },
      {
        id: 'bat_cove_494',
        type: 'locations',
        name: 'Bat\'s Cove',
        description: 'Secret cove where Leatherwing maintains his base of operations and repairs his ship.',
        comedicLine: "The only bat cave that comes with ocean view!",
        connections: ['leatherwing_batman', 'flying_fox', 'gotham_harbor_494']
      }
    ];
  }

  generateVehicles() {
    return [
      {
        id: 'batmobile',
        type: 'items',
        name: 'Batmobile',
        description: 'Batman\'s primary vehicle, a high-tech car with multiple capabilities.',
        comedicLine: "Gets terrible mileage, but amazing crime-fighting per gallon.",
        connections: ['batman', 'batcave', 'arsenal']
      },
      {
        id: 'batwing',
        type: 'items',
        name: 'Batwing',
        description: 'Batman\'s personal stealth aircraft.',
        comedicLine: "Because sometimes even Batman doesn't want to deal with Gotham traffic.",
        connections: ['batman', 'batcave', 'arsenal']
      },
      {
        id: 'batboat',
        type: 'items',
        name: 'Batboat',
        description: 'Specialized watercraft for aquatic missions.',
        comedicLine: "For when criminals think water is a safe getaway.",
        connections: ['batman', 'batcave', 'gotham_harbor']
      },
      {
        id: 'batcycle',
        type: 'items',
        name: 'Batcycle',
        description: 'High-speed motorcycle for urban pursuit.',
        comedicLine: "The only motorcycle with bat-themed safety features.",
        connections: ['batman', 'batcave', 'arsenal']
      }
    ];
  }

  generateSecretBases() {
    return [
      {
        id: 'bat_bunker',
        type: 'locations',
        name: 'Bat-Bunker',
        description: 'Secondary base of operations beneath Wayne Tower.',
        comedicLine: "For when working from home gets too literal.",
        connections: ['wayne_tower', 'batman', 'lucius_fox']
      },
      {
        id: 'satellite_cave',
        type: 'locations',
        name: 'Satellite Batcave',
        description: 'One of several auxiliary Batcaves located around Gotham.',
        comedicLine: "Because one secret cave just isn't enough.",
        connections: ['batcave', 'batman', 'gotham']
      },
      {
        id: 'wayne_vault',
        type: 'locations',
        name: 'Wayne Vault',
        description: 'Secure storage facility for dangerous items and contingency plans.',
        comedicLine: "Where Batman keeps his really, really dangerous toys.",
        connections: ['wayne_manor', 'batman', 'lucius_fox']
      },
      {
        id: 'panic_room',
        type: 'locations',
        name: 'Wayne Manor Panic Room',
        description: 'Heavily fortified safe room in Wayne Manor.',
        comedicLine: "The only room in Wayne Manor without a secret passage.",
        connections: ['wayne_manor', 'alfred', 'batman']
      }
    ];
  }

  generateCrises() {
    return [
      {
        id: 'zero_hour',
        type: 'events',
        name: 'Zero Hour',
        description: 'Timeline crisis caused by Parallax attempting to recreate the universe.',
        comedicLine: "When being fashionably late takes on cosmic proportions.",
        connections: ['hal_jordan', 'crisis_on_infinite_earths']
      },
      {
        id: 'identity_crisis',
        type: 'events',
        name: 'Identity Crisis',
        description: 'Murder mystery that revealed dark secrets of the Justice League.',
        comedicLine: "Proof that even superheroes need family counseling.",
        connections: ['elongated_man', 'justice_league']
      },
      {
        id: 'blackest_night',
        type: 'events',
        name: 'Blackest Night',
        description: 'The dead rise as Black Lanterns in a universe-wide crisis.',
        comedicLine: "When 'till death do us part' becomes more of a suggestion.",
        connections: ['black_hand', 'green_lantern']
      },
      {
        id: 'forever_evil',
        type: 'events',
        name: 'Forever Evil',
        description: 'Crime Syndicate takes over Earth after apparently killing the Justice League.',
        comedicLine: "When the evil doppelgangers take 'opposite day' too seriously.",
        connections: ['crime_syndicate', 'lex_luthor']
      }
    ];
  }

  generateCities() {
    return [
      {
        id: 'fawcett_city',
        type: 'locations',
        name: 'Fawcett City',
        description: 'Home of the Marvel Family, stuck in a 1950s aesthetic.',
        comedicLine: "Where even the criminals are polite.",
        connections: ['captain_marvel', 'sivana']
      },
      {
        id: 'keystone_city',
        type: 'locations',
        name: 'Keystone City',
        description: 'Twin city to Central City, home of the original Flash.',
        comedicLine: "Where even the traffic jams move at super speed.",
        connections: ['flash', 'central_city']
      },
      {
        id: 'midway_city',
        type: 'locations',
        name: 'Midway City',
        description: 'Home base of Hawkman and Hawkgirl.',
        comedicLine: "The city with the highest insurance rates for aerial collisions.",
        connections: ['hawkman', 'hawkgirl']
      },
      {
        id: 'coast_city',
        type: 'locations',
        name: 'Coast City',
        description: 'Home city of Green Lantern Hal Jordan.',
        comedicLine: "The city that literally refused to stay dead.",
        connections: ['green_lantern', 'ferris_aircraft', 'parallax']
      },
      {
        id: 'nanda_parbat',
        type: 'locations',
        name: 'Nanda Parbat',
        description: 'Hidden city of mystical warriors and monks.',
        comedicLine: "Where the WiFi password is a deadly secret.",
        connections: ['league_of_assassins', 'ras_al_ghul', 'mysticism']
      },
      {
        id: 'bizarro_world',
        type: 'locations',
        name: 'Bizarro World (Htrae)',
        description: 'Cubic planet where everything is backwards and imperfect.',
        comedicLine: "Hello means goodbye, and this sentence makes perfect nonsense!",
        connections: ['bizarro_superman', 'bizarro_league', 'bizarro_flash']
      },
      {
        id: 'flashpoint_gotham',
        type: 'locations',
        name: 'Flashpoint Gotham',
        description: 'Version of Gotham where Bruce Wayne died and Thomas Wayne became Batman.',
        comedicLine: "Where father knows best... and worst.",
        connections: ['thomas_wayne_batman', 'martha_wayne_joker', 'flashpoint_batman']
      },
      {
        id: 'smallville',
        type: 'locations',
        name: 'Smallville',
        description: 'Rural Kansas town where Clark Kent grew up, known for its strong community values and strange meteor-related incidents.',
        comedicLine: "Where corn fields hide more secrets than the Pentagon!",
        connections: ['kent_farm', 'kent_family', 'smallville_high', 'luthor_mansion']
      },
      {
        id: 'kent_farm',
        type: 'locations',
        name: 'Kent Farm',
        description: 'The Kent family farm where Superman grew up, learning values that would shape him into Earth\'s greatest hero.',
        comedicLine: "Where super-chores build super-character!",
        connections: ['martha_kent', 'jonathan_kent', 'clark_kent', 'smallville']
      },
      {
        id: 'smallville_high',
        type: 'locations',
        name: 'Smallville High School',
        description: 'School where Clark Kent learned to control his powers while navigating teenage life.',
        comedicLine: "Where having super-powers is only the second hardest part of high school!",
        connections: ['lana_lang', 'pete_ross', 'clark_kent', 'smallville']
      },
      {
        id: 'luthor_mansion',
        type: 'locations',
        name: 'Luthor Mansion',
        description: 'Lex Luthor\'s ancestral home in Smallville, transformed into a center of scientific research.',
        comedicLine: "The only mansion in Kansas with its own particle accelerator!",
        connections: ['young_lex_luthor', 'lionel_luthor', 'smallville', 'lexcorp']
      },
      {
        id: 'angor',
        type: 'locations',
        name: 'Angor (Earth-8)',
        description: 'Home world of the Meta Militia, parallel to Marvel\'s Earth.',
        comedicLine: "Any similarity to other comic universes is purely... intentional!",
        connections: ['lord_havok', 'meta_militia', 'earth8']
      },
      {
        id: 'new_metropolis_8',
        type: 'locations',
        name: 'New Metropolis (Earth-8)',
        description: 'Home city of the Retaliators, Earth-8\'s premier superhero team.',
        comedicLine: "Like regular Metropolis, but with more copyright-friendly heroes!",
        connections: ['american_crusader', 'retaliators', 'earth8']
      },
      {
        id: 'bizarro_metropolis',
        type: 'locations',
        name: 'Bizarro Metropolis',
        description: 'Backwards version of Metropolis where everything is intentionally imperfect.',
        comedicLine: "Where the skyscrapers are built upside down... on purpose!",
        connections: ['bizarro_superman', 'bizarro_lois', 'bizarro_world']
      },
      {
        id: 'bizarro_fortress',
        type: 'locations',
        name: 'Fortress of Bizarro',
        description: 'Bizarro\'s home base, a crude copy of Superman\'s Fortress of Solitude.',
        comedicLine: "Like the Fortress of Solitude, but with worse ice sculpting!",
        connections: ['bizarro_superman', 'bizarro_world', 'bizarro_brainiac']
      }
    ];
  }

  generateCharacters() {
    // DCeased characters
    return [
      // ... existing characters ...
      {
        id: 'jonathan_kent',
        type: 'characters',
        name: 'Jonathan Kent',
        description: 'Superman\'s adoptive father who taught him strong moral values.',
        comedicLine: "Raising a super-powered teen is just like regular parenting... with more property damage!",
        connections: ['martha_kent', 'clark_kent', 'kent_farm']
      },
      {
        id: 'martha_kent',
        type: 'characters',
        name: 'Martha Kent',
        description: 'Superman\'s adoptive mother who helped him embrace his humanity.',
        comedicLine: "The only mom who has to wash bulletproof clothes!",
        connections: ['jonathan_kent', 'clark_kent', 'kent_farm']
      },
      {
        id: 'lana_lang',
        type: 'characters',
        name: 'Lana Lang',
        description: 'Clark Kent\'s first love and childhood friend from Smallville.',
        comedicLine: "Being Superman's ex is a super-complicated relationship status!",
        connections: ['clark_kent', 'smallville_high', 'pete_ross']
      },
      {
        id: 'pete_ross',
        type: 'characters',
        name: 'Pete Ross',
        description: 'Clark\'s best friend from Smallville who kept his secret.',
        comedicLine: "Best friend to Superman, still can't get good concert tickets!",
        connections: ['clark_kent', 'smallville_high', 'lana_lang']
      },
      {
        id: 'american_crusader',
        type: 'heroes',
        name: 'American Crusader',
        description: 'Leader of the Retaliators, Earth-8\'s version of Captain America.',
        comedicLine: "He's got a shield too... but it's legally distinct!",
        connections: ['retaliators', 'new_metropolis_8', 'earth8']
      },
      {
        id: 'lord_havok',
        type: 'villains',
        name: 'Lord Havok',
        description: 'Brilliant but megalomaniacal scientist, leader of the Extremists.',
        comedicLine: "Like Doom... but different enough to avoid lawsuits!",
        connections: ['meta_militia', 'angor', 'earth8']
      },
      {
        id: 'bizarro_superman',
        type: 'characters',
        name: 'Bizarro',
        description: 'Imperfect duplicate of Superman who does everything backwards.',
        comedicLine: "Me am not Superman! Me am Bizarro!",
        connections: ['bizarro_world', 'bizarro_metropolis', 'bizarro_league']
      },
      {
        id: 'bizarro_lois',
        type: 'characters',
        name: 'Bizarro Lois',
        description: 'Backwards version of Lois Lane who hates journalism.',
        comedicLine: "Me write worst stories ever! Editor love them!",
        connections: ['bizarro_superman', 'bizarro_metropolis', 'bizarro_daily_planet']
      },
      {
        id: 'thomas_wayne_batman',
        type: 'heroes',
        name: 'Thomas Wayne Batman',
        description: 'Version of Batman where Bruce\'s father survived and became a more violent Dark Knight.',
        comedicLine: "The Dark Knight who makes regular Batman look cheerful!",
        connections: ['martha_wayne_joker', 'flashpoint_gotham', 'flashpoint_flash']
      },
      {
        id: 'martha_wayne_joker',
        type: 'villains',
        name: 'Martha Wayne Joker',
        description: 'Bruce\'s mother who went insane after his death and became the Joker.',
        comedicLine: "When a mother's love turns to madness... literally!",
        connections: ['thomas_wayne_batman', 'flashpoint_gotham', 'flashpoint_batman']
      }
    ];
  }

  generateOrganizations() {
    return [
      {
        id: 'league_assassins',
        type: 'organizations',
        name: 'League of Assassins',
        description: 'Ancient order of assassins led by Ra\'s al Ghul.',
        comedicLine: "Where team building exercises are literally killer.",
        connections: ['ras_al_ghul', 'nanda_parbat']
      },
      {
        id: 'checkmate',
        type: 'organizations',
        name: 'Checkmate',
        description: 'UN-chartered intelligence agency using chess-themed ranks.',
        comedicLine: "Where office politics involve actual pawns.",
        connections: ['amanda_waller', 'suicide_squad']
      },
      {
        id: 'spyral',
        type: 'organizations',
        name: 'Spyral',
        description: 'Covert intelligence agency specializing in identity protection.',
        comedicLine: "Making face blindness a security feature.",
        connections: ['helena_bertinelli', 'dick_grayson']
      },
      {
        id: 'dark_knights',
        type: 'organizations',
        name: 'The Dark Knights',
        description: 'Evil Batmen from the Dark Multiverse serving Barbatos.',
        comedicLine: "The Justice League's worst nightmare... literally!",
        connections: ['batman_who_laughs', 'barbatos', 'dark_multiverse']
      },
      {
        id: 'kingdom_come_league',
        type: 'organizations',
        name: 'Kingdom Come Justice League',
        description: 'Superman\'s reformed Justice League, gathering old and new heroes to restore order to a chaotic world.',
        comedicLine: "The retirement home for superheroes... with world-saving benefits!",
        connections: ['kingdom_come_superman', 'kingdom_come_wonder_woman', 'kingdom_come_battle']
      },
      {
        id: 'kingdom_come_titans',
        type: 'organizations',
        name: 'Kingdom Come Titans',
        description: 'The next generation of heroes, many of whom followed more violent methods of justice.',
        comedicLine: "When teenage rebellion includes super-powers.",
        connections: ['kingdom_come_batman', 'kingdom_come_league', 'kingdom_come_battle']
      },
      {
        id: 'crew_494',
        type: 'organizations',
        name: 'Crew of the Flying Fox',
        description: 'The loyal crew of Leatherwing\'s ship, each member specially selected for their skills and trustworthiness.',
        comedicLine: "The only pirate crew that moonlights as a justice league!",
        connections: ['leatherwing_batman', 'flying_fox', 'leatherwing_alfred']
      },
      {
        id: 'pirate_crew_494',
        type: 'organizations',
        name: 'The Laughing Man\'s Crew',
        description: 'The deranged crew of the Laughing Man\'s ship, loyal to their mad captain.',
        comedicLine: "Where the job interview is just laughing at the captain\'s jokes.",
        connections: ['laughing_man', 'harley_quinn_494', 'pirate_crew_494']
      },
      {
        id: 'asylum_staff',
        type: 'organizations',
        name: 'Arkham Hospital Staff',
        description: 'The doctors and orderlies of Arkham Royal Hospital.',
        comedicLine: "Where the employee turnover rate is historically high.",
        connections: ['arkham_gaslight', 'gotham_gaslight', 'batman_gaslight']
      },
      {
        id: 'yellow_corps_32',
        type: 'organizations',
        name: 'Yellow Lantern Corps (Earth-32)',
        description: 'Sinestro\'s fear-powered organization opposing the Green Lantern Batman.',
        comedicLine: "Making yellow the new black... and blue.",
        connections: ['sinestro_32', 'batman_lantern', 'earth32']
      }
    ];
  }

  generateTimelines() {
    return [
      {
        id: 'age_of_heroes',
        type: 'events',
        name: 'Age of Heroes',
        description: 'The modern era of superhero activity.',
        comedicLine: "When spandex became a legitimate career choice.",
        connections: ['justice_league', 'teen_titans']
      },
      {
        id: 'silver_age',
        type: 'events',
        name: 'Silver Age',
        description: 'Era marked by the return of superheroes and sci-fi elements.',
        comedicLine: "When comics discovered science... sort of.",
        connections: ['barry_allen', 'hal_jordan']
      },
      {
        id: 'golden_age',
        type: 'events',
        name: 'Golden Age',
        description: 'The first era of superhero activity.',
        comedicLine: "When punching Nazis wasn't controversial.",
        connections: ['justice_society', 'jay_garrick']
      }
    ];
  }

  generateRaces() {
    return [
      {
        id: 'kryptonians',
        type: 'civilizations',
        name: 'Kryptonians',
        description: 'Advanced civilization destroyed with their planet.',
        comedicLine: "Superior in everything except planetary maintenance.",
        connections: ['superman', 'krypton']
      },
      {
        id: 'martians',
        type: 'civilizations',
        name: 'Martians',
        description: 'Shape-shifting telepathic species from Mars.',
        comedicLine: "We're not green because of envy, it's just our complexion.",
        connections: ['martianManhunter', 'mars']
      }
    ];
  }

  generateArtifacts() {
    return [
      {
        id: 'spear_of_destiny',
        type: 'items',
        name: 'Spear of Destiny',
        description: 'Mystical weapon that pierced Christ\'s side.',
        comedicLine: "The original point of contention.",
        connections: ['spectre', 'phantom_stranger']
      },
      {
        id: 'helmet_of_fate',
        type: 'items',
        name: 'Helmet of Fate',
        description: 'Magical artifact containing Nabu\'s essence.',
        comedicLine: "The most demanding hat in fashion.",
        connections: ['doctor_fate', 'kent_nelson']
      },
      {
        id: 'miracle_machine',
        type: 'items',
        name: 'Miracle Machine',
        description: 'Device that turns thoughts into reality.',
        comedicLine: "The ultimate wish-granting machine with the worst user manual.",
        connections: ['legion_of_superheroes', 'brainiac']
      }
    ];
  }

  generateSidekicks() {
    return [
      {
        id: 'dick_grayson',
        type: 'heroes',
        name: 'Dick Grayson (Robin I/Nightwing)',
        description: 'Original Robin, later became Nightwing. Former leader of the Teen Titans.',
        comedicLine: "Yes, I wore the scaly shorts. No, we don't talk about it.",
        connections: ['batman', 'teen_titans', 'barbara_gordon', 'titans_tower']
      },
      {
        id: 'jason_todd',
        type: 'heroes',
        name: 'Jason Todd (Robin II/Red Hood)',
        description: 'Second Robin who died and was resurrected, became the vigilante Red Hood.',
        comedicLine: "Death is more of a temporary inconvenience in this line of work.",
        connections: ['batman', 'dick_grayson', 'tim_drake']
      },
      {
        id: 'tim_drake',
        type: 'heroes',
        name: 'Tim Drake (Robin III/Red Robin)',
        description: 'Third Robin, considered the most intelligent of Batman\'s protégés.',
        comedicLine: "I figured out Batman's identity. The hardest part was getting him to hire me.",
        connections: ['batman', 'young_justice', 'stephanie_brown']
      },
      {
        id: 'stephanie_brown',
        type: 'heroes',
        name: 'Stephanie Brown (Spoiler/Robin IV/Batgirl)',
        description: 'Daughter of Cluemaster, became Spoiler, briefly Robin, then Batgirl.',
        comedicLine: "My superhero career is more complicated than a soap opera plotline.",
        connections: ['tim_drake', 'barbara_gordon', 'cassandra_cain']
      },
      {
        id: 'damian_wayne',
        type: 'heroes',
        name: 'Damian Wayne (Robin V)',
        description: 'Son of Batman and Talia al Ghul, trained by the League of Assassins.',
        comedicLine: "I'm not adopted... everyone else is.",
        connections: ['batman', 'talia_al_ghul', 'teen_titans']
      },
      {
        id: 'barbara_gordon',
        type: 'heroes',
        name: 'Barbara Gordon (Batgirl/Oracle)',
        description: 'Original Batgirl, later became Oracle after being paralyzed.',
        comedicLine: "I can hack your system faster than you can say 'Holy CPU, Batman!'",
        connections: ['batman', 'dick_grayson', 'birds_of_prey']
      },
      {
        id: 'cassandra_cain',
        type: 'heroes',
        name: 'Cassandra Cain (Batgirl/Black Bat)',
        description: 'Daughter of assassins, became Batgirl and later Black Bat.',
        comedicLine: "Actions speak louder than words. Literally, in my case.",
        connections: ['batman', 'barbara_gordon', 'stephanie_brown']
      },
      {
        id: 'harper_row',
        type: 'heroes',
        name: 'Harper Row (Bluebird)',
        description: 'Street-smart electrician who became the hero Bluebird.',
        comedicLine: "I'm the only one in the Bat-family who can actually fix the Bat-computer.",
        connections: ['batman', 'tim_drake', 'stephanie_brown']
      },
      {
        id: 'duke_thomas',
        type: 'heroes',
        name: 'Duke Thomas (Signal)',
        description: 'Metahuman with light-based powers, Batman\'s daytime protector.',
        comedicLine: "Someone has to watch Gotham while Batman sleeps... he does sleep, right?",
        connections: ['batman', 'damian_wayne', 'batman_and_signal']
      },
      {
        id: 'carrie_kelley',
        type: 'heroes',
        name: 'Carrie Kelley (Robin)',
        description: 'Robin from The Dark Knight Returns timeline.',
        comedicLine: "The only Robin who actually chose the green tights.",
        connections: ['dark_knight_returns_batman', 'batman']
      },
      {
        id: 'aqualad',
        type: 'heroes',
        name: 'Aqualad',
        description: 'Atlantean protege of Aquaman.',
        comedicLine: "Being a teenager is hard enough without gills.",
        connections: ['aquaman', 'teen_titans', 'atlantis']
      },
      {
        id: 'speedy',
        type: 'heroes',
        name: 'Speedy',
        description: 'Archer protege of Green Arrow.',
        comedicLine: "Not actually that speedy, just good with arrows.",
        connections: ['greenArrow', 'teen_titans', 'arsenal']
      }
    ];
  }

  generateTeenTitans() {
    return [
      {
        id: 'teen_titans',
        type: 'organizations',
        name: 'Teen Titans',
        description: 'Young superhero team originally formed by sidekicks.',
        comedicLine: "Like the Justice League, but with more drama and pizza parties.",
        connections: ['titans_tower', 'dick_grayson', 'starfire']
      },
      {
        id: 'starfire',
        type: 'heroes',
        name: 'Starfire',
        description: 'Tamaranean princess with flight and energy projection powers.',
        comedicLine: "Earth customs are strange. Like, why do you not express joy through radioactive energy blasts?",
        connections: ['teen_titans', 'dick_grayson', 'raven']
      },
      {
        id: 'raven',
        type: 'heroes',
        name: 'Raven',
        description: 'Half-demon empath with dark magic powers.',
        comedicLine: "I'm not goth, I'm just naturally dark and brooding.",
        connections: ['teen_titans', 'trigon', 'beast_boy']
      },
      {
        id: 'beast_boy',
        type: 'heroes',
        name: 'Beast Boy',
        description: 'Shape-shifter who can transform into any animal.',
        comedicLine: "Being green isn't easy, but it makes being a vegetarian much simpler.",
        connections: ['teen_titans', 'doom_patrol', 'cyborg']
      },
      {
        id: 'cyborg',
        type: 'heroes',
        name: 'Cyborg',
        description: 'Half-human, half-machine hero with advanced technology.',
        comedicLine: "I'm the only Titan who comes with built-in WiFi.",
        connections: ['teen_titans', 'justice_league', 'beast_boy']
      },
      {
        id: 'donna_troy',
        type: 'heroes',
        name: 'Donna Troy (Wonder Girl)',
        description: 'Amazon warrior and Wonder Woman\'s sister/protégé.',
        comedicLine: "My origin story is so complicated, even I need a flowchart to follow it.",
        connections: ['wonderWoman', 'teen_titans', 'dick_grayson']
      },
      {
        id: 'wally_west',
        type: 'heroes',
        name: 'Wally West (Kid Flash)',
        description: 'Original Kid Flash who later became the Flash.',
        comedicLine: "Being the fastest teen alive doesn't help with homework deadlines.",
        connections: ['flash', 'teen_titans', 'dick_grayson']
      },
      {
        id: 'roy_harper',
        type: 'heroes',
        name: 'Roy Harper (Speedy/Arsenal)',
        description: 'Green Arrow\'s ward who became the hero Arsenal.',
        comedicLine: "I have an arrow for every occasion. Yes, even that occasion.",
        connections: ['greenArrow', 'teen_titans', 'dick_grayson']
      },
      {
        id: 'aqualad',
        type: 'heroes',
        name: 'Garth (Aqualad/Tempest)',
        description: 'Atlantean sorcerer and original Aqualad.',
        comedicLine: "Everyone thinks being Aqualad is just talking to fish. We do other stuff too!",
        connections: ['aquaman', 'teen_titans', 'donna_troy']
      },
      {
        id: 'kid_devil',
        type: 'heroes',
        name: 'Eddie Bloomberg (Kid Devil)',
        description: 'Former actor\'s assistant turned demonic superhero.',
        comedicLine: "Being literally hot-headed has its challenges.",
        connections: ['teen_titans', 'blue_devil', 'ravager']
      }
    ];
  }

  generateTitansTower() {
    return [
      {
        id: 'titans_gym',
        type: 'locations',
        name: 'Titans Training Gym',
        description: 'High-tech training facility in Titans Tower.',
        comedicLine: "Where super-teens pump super-iron.",
        connections: ['titans_tower', 'teen_titans']
      },
      {
        id: 'titans_ops',
        type: 'locations',
        name: 'Operations Center',
        description: 'Main command center of Titans Tower.',
        comedicLine: "Half mission control, half teenage hangout spot.",
        connections: ['titans_tower', 'cyborg']
      },
      {
        id: 'titans_garage',
        type: 'locations',
        name: 'Titans Garage',
        description: 'Vehicle and equipment storage facility.',
        comedicLine: "Home of the T-Car, T-Ship, and probably some T-Bicycles.",
        connections: ['titans_tower', 'cyborg']
      },
      {
        id: 'titans_pool',
        type: 'locations',
        name: 'Titans Pool',
        description: 'Olympic-sized pool with underwater training facilities.',
        comedicLine: "Because even superheroes need a pool party sometimes.",
        connections: ['titans_tower', 'aqualad']
      },
      {
        id: 'titans_roof',
        type: 'locations',
        name: 'Tower Roof',
        description: 'Landing pad and observation deck.',
        comedicLine: "Best sunset view in Jump City, superhero battles permitting.",
        connections: ['titans_tower', 'starfire']
      }
    ];
  }

  generateYoungJustice() {
    return [
      {
        id: 'young_justice',
        type: 'organizations',
        name: 'Young Justice',
        description: 'Covert operations team of young heroes.',
        comedicLine: "We're not sidekicks, we're covert operatives! ... who are also sidekicks.",
        connections: ['justice_league', 'mount_justice', 'tim_drake']
      },
      {
        id: 'superboy',
        type: 'heroes',
        name: 'Superboy (Kon-El)',
        description: 'Clone combining Superman and Lex Luthor\'s DNA.',
        comedicLine: "I'm not a clone, I'm a genetically engineered meta-human tactical weapon... okay, I'm a clone.",
        connections: ['superman', 'young_justice', 'tim_drake']
      },
      {
        id: 'impulse',
        type: 'heroes',
        name: 'Impulse (Bart Allen)',
        description: 'Time-traveling speedster from the future.',
        comedicLine: "Speed force? More like speed fun!",
        connections: ['flash', 'young_justice', 'tim_drake']
      },
      {
        id: 'wonder_girl',
        type: 'heroes',
        name: 'Cassie Sandsmark',
        description: 'Daughter of Zeus, current Wonder Girl.',
        comedicLine: "Being a demigoddess doesn't help with math homework.",
        connections: ['wonderWoman', 'young_justice', 'superboy']
      },
      {
        id: 'arrowette',
        type: 'heroes',
        name: 'Cissie King-Jones',
        description: 'Olympic archer and former superhero.',
        comedicLine: "I quit being a superhero to become an Olympian. Mom still isn't satisfied.",
        connections: ['young_justice', 'tim_drake', 'wonder_girl']
      }
    ];
  }

  generateJusticeLeagueMembers() {
    return [
      {
        id: 'shazam',
        type: 'heroes',
        name: 'Shazam',
        description: 'A young boy granted the powers of ancient gods.',
        comedicLine: "Say my name and I might show up. Unless it's magic word time!",
        connections: ['justice_league', 'blackAdam']
      },
      {
        id: 'greenLantern',
        type: 'heroes',
        name: 'Green Lantern (Hal Jordan)',
        description: 'A fearless test pilot given a power ring by an alien.',
        comedicLine: "In brightest day, in blackest night... I still have to recharge this thing daily!",
        connections: ['justice_league', 'sinestro', 'oa']
      },
      {
        id: 'aquaman',
        type: 'heroes',
        name: 'Aquaman',
        description: 'King of Atlantis and ruler of the seas.',
        comedicLine: "Yes, I talk to fish. No, they don't tell me to cause hurricanes.",
        connections: ['justice_league', 'atlantis', 'mera']
      }
    ];
  }

  generateLegionOfSuperHeroes() {
    return [
      {
        id: 'saturnGirl',
        type: 'heroes',
        name: 'Saturn Girl',
        description: 'A powerful telepath from Titan.',
        comedicLine: "Reading minds is easy. Ignoring them is the hard part.",
        connections: ['legion_of_superheroes', 'lightingLad', 'cosmicBoy']
      }
    ];
  }

  generateGodsAndDeities() {
    return [
      {
        id: 'hercules',
        type: 'heroes',
        name: 'Hercules',
        description: 'The legendary demigod hero.',
        comedicLine: "Sure, I can lift mountains, but can I find my car keys?",
        connections: ['wonderWoman', 'olympus']
      },
      {
        id: 'odin',
        type: 'characters',
        name: 'Odin',
        description: 'All-Father of the Norse gods.',
        comedicLine: "I've got one eye on you... literally.",
        connections: ['valhalla', 'thor']
      }
    ];
  }

  generateMagicUsers() {
    return [
      {
        id: 'johnConstantine',
        type: 'heroes',
        name: 'John Constantine',
        description: 'A cynical occult detective and magician.',
        comedicLine: "I dabble in magic. And by dabble, I mean tick off every demon in existence.",
        connections: ['justice_league_dark', 'zatanna']
      }
    ];
  }

  generateAlienRaces() {
    return [
      {
        id: 'kryptonians',
        type: 'civilizations',
        name: 'Kryptonians',
        description: 'The advanced race from planet Krypton.',
        comedicLine: "We get superpowers under your sun, but allergies under a red one.",
        connections: ['superman', 'supergirl', 'zod']
      },
      {
        id: 'martians',
        type: 'civilizations',
        name: 'Martians',
        description: 'The shape-shifting inhabitants of Mars.',
        comedicLine: "We're not green because of envy, it's just our complexion.",
        connections: ['martianManhunter', 'missMartian']
      }
    ];
  }

  generateTechnology() {
    return [
      {
        id: 'wayne_tech',
        type: 'items',
        name: 'Wayne Technologies',
        description: 'Advanced technology developed by Wayne Enterprises.',
        comedicLine: "Making the impossible possible, with a bat logo on it.",
        connections: ['batman', 'lucius_fox', 'wayne_tower']
      }
    ];
  }

  generatePlanets() {
    return [
      {
        id: 'nok',
        type: 'planets',
        name: 'Nok',
        description: 'Homeworld of the Indigo Tribe, channeling the power of compassion.',
        comedicLine: "Where feelings aren't just respected, they're weaponized!",
        connections: ['indigo_tribe', 'emotional_spectrum', 'abin_sur']
      },
      {
        id: 'odym',
        type: 'planets',
        name: 'Odym',
        description: 'Base of the Blue Lantern Corps, powered by hope.',
        comedicLine: "The most optimistic rock in space!",
        connections: ['blue_lantern_corps', 'saint_walker', 'hope']
      },
      {
        id: 'ysmault',
        type: 'planets',
        name: 'Ysmault',
        description: 'Bloody homeworld of the Red Lantern Corps.',
        comedicLine: "Where anger management classes are mandatory.",
        connections: ['red_lanterns', 'atrocitus', 'rage']
      },
      {
        id: 'okaara',
        type: 'planets',
        name: 'Okaara',
        description: 'Training world of the Orange Lantern Corps.',
        comedicLine: "Home of the universe's worst sharing policy.",
        connections: ['larfleeze', 'orange_lantern', 'avarice']
      },
      {
        id: 'xanshi',
        type: 'planets',
        name: 'Xanshi',
        description: 'Destroyed homeworld that Green Lantern John Stewart failed to save.',
        comedicLine: "The biggest 'oops' in Green Lantern history.",
        connections: ['john_stewart', 'fatality', 'greenLantern']
      },
      {
        id: 'bgztl',
        type: 'planets',
        name: 'Bgztl',
        description: 'Home planet of the phase-shifting race that includes Phantom Girl.',
        comedicLine: "Where ghosting isn't just a dating term.",
        connections: ['phantom_girl', 'legion_of_superheroes', 'phase']
      },
      {
        id: 'winath',
        type: 'planets',
        name: 'Winath',
        description: 'Agricultural world where twins are the norm.',
        comedicLine: "Two crops for the price of one!",
        connections: ['lightning_lad', 'lightning_lass', 'legion_of_superheroes']
      },
      {
        id: 'krypton',
        type: 'planets',
        name: 'Krypton',
        description: 'Superman\'s doomed homeworld, destroyed by its unstable core.',
        comedicLine: "Home of the universe's most indestructible babies and most self-destructive planet core!",
        connections: ['superman', 'supergirl', 'zod', 'brainiac']
      },
      {
        id: 'apokolips',
        type: 'planets',
        name: 'Apokolips',
        description: 'Hellish world ruled by Darkseid, filled with fire pits and endless suffering.',
        comedicLine: "The universe's worst vacation destination, -5/5 stars on GalacticAdvisor.",
        connections: ['darkseid', 'newGenesis', 'orion']
      },
      {
        id: 'newGenesis',
        type: 'planets',
        name: 'New Genesis',
        description: 'Paradise world of the New Gods, eternal enemies of Apokolips.',
        comedicLine: "Where even the garbage collectors have cosmic powers!",
        connections: ['highfather', 'orion', 'apokolips']
      },
      {
        id: 'oa',
        type: 'planets',
        name: 'Oa',
        description: 'Home of the Green Lantern Corps and the Guardians of the Universe.',
        comedicLine: "The only place where wearing green spandex is mandatory dress code.",
        connections: ['greenLantern', 'guardians', 'kilowog']
      },
      {
        id: 'thanagar',
        type: 'planets',
        name: 'Thanagar',
        description: 'Warrior planet, home of Hawkman and Hawkgirl.',
        comedicLine: "Where having wings isn't just for Red Bull commercials.",
        connections: ['hawkman', 'hawkgirl', 'nth_metal']
      },
      {
        id: 'rann',
        type: 'planets',
        name: 'Rann',
        description: 'Advanced technological world, home of Adam Strange.',
        comedicLine: "Where jet packs are considered Stone Age technology.",
        connections: ['adamStrange', 'sardath', 'alanna']
      },
      {
        id: 'maltus',
        type: 'planets',
        name: 'Maltus',
        description: 'Ancient homeworld of the Guardians of the Universe.',
        comedicLine: "Birthplace of the universe's most serious small blue people.",
        connections: ['guardians', 'oa', 'krona']
      },
      {
        id: 'warworld',
        type: 'planets',
        name: 'Warworld',
        description: 'Mobile artificial planet designed for gladiatorial combat.',
        comedicLine: "Like a Death Star, but with better entertainment options.",
        connections: ['mongul', 'superman', 'cyborg_superman']
      },
      {
        id: 'daxam',
        type: 'planets',
        name: 'Daxam',
        description: 'Xenophobic world of Kryptonian descendants with lead weakness.',
        comedicLine: "Like Krypton's paranoid cousin with a lead allergy.",
        connections: ['mon_el', 'krypton', 'lead']
      },
      {
        id: 'czarnia',
        type: 'planets',
        name: 'Czarnia',
        description: 'Destroyed homeworld of Lobo, the last Czarnian.',
        comedicLine: "Population: 1 (self-inflicted).",
        connections: ['lobo', 'space_dolphins', 'destruction']
      },
      {
        id: 'colu',
        type: 'planets',
        name: 'Colu',
        description: 'Homeworld of Brainiac and the hyper-intelligent Coluans.',
        comedicLine: "Where 200 IQ is considered below average.",
        connections: ['brainiac', 'vril_dox', 'computer_tyrants']
      },
      {
        id: 'mars',
        type: 'planets',
        name: 'Mars',
        description: 'Former home of the Martian civilization.',
        comedicLine: "Not just for chocolate bars anymore.",
        connections: ['martianManhunter', 'miss_martian', 'white_martians']
      },
      {
        id: 'korugar',
        type: 'planets',
        name: 'Korugar',
        description: 'Homeworld of Sinestro, former Green Lantern turned Yellow Lantern.',
        comedicLine: "Where fear is literally the law.",
        connections: ['sinestro', 'yellow_lanterns', 'greenLantern']
      },
      {
        id: 'zamaron',
        type: 'planets',
        name: 'Zamaron',
        description: 'Homeworld of the Star Sapphires and the power of love.',
        comedicLine: "Where love conquers all, literally.",
        connections: ['star_sapphires', 'carol_ferris', 'violet_lanterns']
      },
      {
        id: 'mogo',
        type: 'planets',
        name: 'Mogo',
        description: 'The living planet and member of the Green Lantern Corps.',
        comedicLine: "The only Green Lantern who can't attend meetings in person.",
        connections: ['greenLantern', 'oa', 'ion']
      },
      {
        id: 'qward',
        type: 'planets',
        name: 'Qward',
        description: 'Anti-matter universe planet, home of the Weaponers.',
        comedicLine: "Where they take 'opposite day' very seriously.",
        connections: ['anti_monitor', 'sinestro', 'yellow_lanterns']
      },
      {
        id: 'starhaven',
        type: 'planets',
        name: 'Starhaven',
        description: 'Winged humanoid planet, home to Hawkman-like beings.',
        comedicLine: "The only planet where wing insurance is mandatory.",
        connections: ['hawkman', 'thanagar', 'wings']
      },
      {
        id: 'bismoll',
        type: 'planets',
        name: 'Bismoll',
        description: 'Home planet of Matter-Eater Lad, where inhabitants can eat anything.',
        comedicLine: "No 'Do Not Eat' signs needed here!",
        connections: ['matter_eater_lad', 'legion_of_superheroes']
      }
    ];
  }

  generateFlashVariants() {
    return [
      {
        id: 'barry_allen_flash',
        type: 'heroes',
        name: 'Barry Allen (The Flash)',
        description: 'The second Flash, a police scientist who gained super-speed after being struck by lightning and doused with chemicals.',
        comedicLine: "I'm the fastest man alive... except when the plot needs me to be slower.",
        connections: ['speedForce', 'iris_west', 'central_city', 'wally_west']
      },
      {
        id: 'jay_garrick_flash',
        type: 'heroes',
        name: 'Jay Garrick (The Flash)',
        description: 'The original Flash from the Golden Age, founding member of the Justice Society.',
        comedicLine: "In my day, we didn't need a Speed Force. We just ran really fast!",
        connections: ['speedForce', 'justice_society', 'keystone_city']
      },
      {
        id: 'wally_west_flash',
        type: 'heroes',
        name: 'Wally West (The Flash/Kid Flash)',
        description: 'Former Kid Flash who became the Flash after Barry Allen\'s death, considered the fastest Flash.',
        comedicLine: "Being faster than Barry is great... until you have to explain time paradoxes.",
        connections: ['speedForce', 'barry_allen_flash', 'titans_tower', 'linda_park']
      },
      {
        id: 'bart_allen_flash',
        type: 'heroes',
        name: 'Bart Allen (Impulse/Kid Flash/Flash)',
        description: 'Time-traveling grandson of Barry Allen from the 30th century.',
        comedicLine: "Time travel makes family reunions really complicated.",
        connections: ['speedForce', 'barry_allen_flash', 'young_justice', 'max_mercury']
      },
      {
        id: 'future_flash',
        type: 'variants',
        name: 'Future Flash',
        description: 'A darker version of Barry Allen from a possible future, seeking to prevent tragedies by any means necessary.',
        comedicLine: "I've seen the future. It runs like clockwork... because I make it.",
        connections: ['barry_allen_flash', 'speedForce', 'time_wraiths']
      },
      {
        id: 'reverse_flash',
        type: 'villains',
        name: 'Eobard Thawne (Reverse-Flash)',
        description: 'Barry Allen\'s greatest enemy from the future, obsessed with ruining the Flash\'s life.',
        comedicLine: "It was me, Barry! I was the one who moved your car keys!",
        connections: ['barry_allen_flash', 'speedForce', 'negative_speedforce']
      },
      {
        id: 'zoom',
        type: 'villains',
        name: 'Hunter Zolomon (Zoom)',
        description: 'Former profiler who gained time manipulation powers, believing he could make Wally West a better hero through tragedy.',
        comedicLine: "I'm not slowing time down, I'm just thinking really, really fast!",
        connections: ['wally_west_flash', 'speedForce', 'keystone_city']
      },
      {
        id: 'godspeed',
        type: 'villains',
        name: 'August Heart (Godspeed)',
        description: 'Former police officer who gained speed powers and became a vengeful speedster.',
        comedicLine: "Speed is divine... and I'm its prophet!",
        connections: ['barry_allen_flash', 'speedForce', 'central_city']
      },
      {
        id: 'savitar',
        type: 'villains',
        name: 'Savitar (The God of Speed)',
        description: 'A speedster who became obsessed with the Speed Force and proclaimed himself its god.',
        comedicLine: "I don't run on coffee like other speedsters. I run on pure ego!",
        connections: ['speedForce', 'barry_allen_flash', 'speed_cult']
      },
      {
        id: 'black_flash',
        type: 'cosmic',
        name: 'Black Flash',
        description: 'The Speed Force\'s embodiment of death for speedsters.',
        comedicLine: "Even speedsters can't outrun me forever.",
        connections: ['speedForce', 'barry_allen_flash', 'death']
      },
      {
        id: 'negative_speedforce',
        type: 'dimensions',
        name: 'Negative Speed Force',
        description: 'A corrupted version of the Speed Force created by Eobard Thawne.',
        comedicLine: "Like the Speed Force, but with more brooding and red lightning!",
        connections: ['speedForce', 'reverse_flash', 'time_wraiths']
      },
      {
        id: 'speed_cult',
        type: 'organizations',
        name: 'Speed Force Cult',
        description: 'A group of followers dedicated to worshipping Savitar and the Speed Force.',
        comedicLine: "Our meetings are very quick... get it?",
        connections: ['savitar', 'speedForce', 'central_city']
      },
      {
        id: 'time_wraiths',
        type: 'cosmic',
        name: 'Time Wraiths',
        description: 'Entities that hunt speedsters who abuse time travel.',
        comedicLine: "We're like time travel's hall monitors, but scarier!",
        connections: ['speedForce', 'black_flash', 'barry_allen_flash']
      },
      {
        id: 'max_mercury',
        type: 'heroes',
        name: 'Max Mercury',
        description: 'The Zen Master of Speed, a time-traveling speedster who has lived across centuries.',
        comedicLine: "I've been running so long, I forgot where I parked my car.",
        connections: ['speedForce', 'jay_garrick_flash', 'bart_allen_flash']
      },
      {
        id: 'johnny_quick',
        type: 'heroes',
        name: 'Johnny Quick',
        description: 'A Golden Age speedster who gained his powers through a mathematical formula.',
        comedicLine: "3X2(9YZ)4A... and don't forget to carry the one!",
        connections: ['jesse_quick', 'jay_garrick_flash', 'justice_society']
      },
      {
        id: 'jesse_quick',
        type: 'heroes',
        name: 'Jesse Quick',
        description: 'Daughter of Johnny Quick, using the same speed formula as her father.',
        comedicLine: "Being a speedster and a CEO means I can be late for two jobs at once!",
        connections: ['johnny_quick', 'wally_west_flash', 'titans_tower']
      },
      {
        id: 'hot_pursuit_flash',
        type: 'variants',
        name: 'Hot Pursuit',
        description: 'A version of Barry Allen who became a time-traveling motorcycle cop of the Speed Force.',
        comedicLine: "The only cop who can give you a speeding ticket while breaking the sound barrier!",
        connections: ['barry_allen_flash', 'speedForce', 'cosmic_motorcycle']
      },
      {
        id: 'future_blue_flash',
        type: 'variants',
        name: 'Blue Flash',
        description: 'A future version of Barry Allen who mastered the Speed Force to generate blue lightning.',
        comedicLine: "Running so fast my lightning changed colors... and my electric bill!",
        connections: ['barry_allen_flash', 'speedForce', 'future_flash']
      },
      {
        id: 'dark_flash',
        type: 'variants',
        name: 'Dark Flash',
        description: 'Walter West, a darker version of Wally West from an alternate timeline.',
        comedicLine: "When being the fastest man alive isn't edgy enough!",
        connections: ['wally_west_flash', 'speedForce', 'dark_multiverse']
      },
      {
        id: 'accelerated_flash',
        type: 'variants',
        name: 'Accelerated Flash',
        description: 'A version of Barry Allen who learned to tap into the Speed Force to accelerate his aging and gain experience instantly.',
        comedicLine: "Finally found a way to be late for retirement!",
        connections: ['barry_allen_flash', 'speedForce', 'time_wraiths']
      },
      {
        id: 'speed_demon_flash',
        type: 'variants',
        name: 'Speed Demon Flash',
        description: 'A version of Wally West who made a deal with Neron for greater speed.',
        comedicLine: "Sold my soul for speed... but at least I got express delivery!",
        connections: ['wally_west_flash', 'speedForce', 'neron']
      },
      {
        id: 'cobalt_flash',
        type: 'variants',
        name: 'Cobalt Flash',
        description: 'A version of Barry Allen who merged with the Speed Force and became living speed energy.',
        comedicLine: "I don't need coffee anymore - I AM speed!",
        connections: ['barry_allen_flash', 'speedForce', 'speed_force_avatars']
      },
      {
        id: 'flashpoint_kid_flash',
        type: 'variants',
        name: 'Flashpoint Kid Flash',
        description: 'Alternative version of Bart Allen in the Flashpoint timeline.',
        comedicLine: "When your grandfather changes timeline, but you still have homework due!",
        connections: ['bart_allen_flash', 'flashpoint_flash', 'flashpoint_earth']
      }
    ];
  }

  generateVariants() {
    return [
      // DCeased variants
      {
        id: 'dceased_superman',
        type: 'variants',
        name: 'DCeased Superman',
        description: 'Superman infected by the Anti-Life virus.',
        comedicLine: "Even in death, still flying... just more murderously.",
        connections: ['superman', 'anti_life_virus', 'dceased_earth']
      },
      // ... other variants ...
      {
        id: 'red_son_superman',
        type: 'variants',
        name: 'Red Son Superman',
        description: 'Superman who landed in Soviet Ukraine instead of Kansas, becoming the leader of the Soviet Union and attempting to spread communist ideals globally through peaceful means.',
        comedicLine: "In Soviet Russia, hope symbol wears you!",
        connections: ['red_son_batman', 'red_son_wonder_woman', 'red_son_earth', 'red_son_brainiac']
      },
      {
        id: 'kingdom_come_superman',
        type: 'variants',
        name: 'Kingdom Come Superman',
        description: 'An older, more powerful Superman who retreated from humanity after the Joker killed Lois Lane and the Daily Planet staff. He returns to lead the old guard of heroes against a new violent generation.',
        comedicLine: "Still flies faster than a speeding bullet... just with more grey hair.",
        connections: ['kingdom_come_wonder_woman', 'kingdom_come_batman', 'kingdom_come_norman', 'kingdom_come_magog']
      },
      {
        id: 'kingdom_come_batman',
        type: 'variants',
        name: 'Kingdom Come Batman',
        description: 'An aged Bruce Wayne who operates from the Batcave using robots and technology after his body failed him. He leads a human resistance movement.',
        comedicLine: "Who needs a Batsuit when you have an army of robot Batmen?",
        connections: ['kingdom_come_superman', 'kingdom_come_wonder_woman', 'kingdom_come_batcave', 'kingdom_come_titans']
      },
      {
        id: 'kingdom_come_wonder_woman',
        type: 'variants',
        name: 'Kingdom Come Wonder Woman',
        description: 'Diana returns from self-imposed exile to help Superman reform the Justice League and guide humanity back to heroic ideals.',
        comedicLine: "Still an ambassador of peace... just with less patience for nonsense.",
        connections: ['kingdom_come_superman', 'kingdom_come_batman', 'kingdom_come_league', 'themyscira']
      }
    ];
  }

  generateHeroes() {
    return [
      // ... existing heroes ...
      {
        id: 'booster_gold',
        type: 'heroes',
        name: 'Booster Gold',
        description: 'Time-traveling hero from the future.',
        comedicLine: "History's greatest hero... according to himself.",
        connections: ['time_travel', 'blue_beetle', 'justice_league']
      },
      {
        id: 'doctor_fate',
        type: 'heroes',
        name: 'Doctor Fate',
        description: 'Powerful sorcerer and agent of Order.',
        comedicLine: "Making house calls across dimensions.",
        connections: ['magic', 'helmet_of_fate', 'justice_society']
      }
    ];
  }

  generateVillains() {
    return [
      // ... existing villains ...
      {
        id: 'black_adam',
        type: 'villains',
        name: 'Black Adam',
        description: 'Ancient Egyptian warrior with the power of gods.',
        comedicLine: "Has anger issues older than most civilizations.",
        connections: ['shazam', 'kahndaq', 'justice_society']
      },
      {
        id: 'deathstroke',
        type: 'villains',
        name: 'Deathstroke',
        description: 'Enhanced mercenary and tactical genius.',
        comedicLine: "The world's deadliest senior citizen.",
        connections: ['titans', 'teen_titans', 'ravager']
      }
    ];
  }

  generateCosmicEntities() {
    return [
      {
        id: 'hyperouterverse',
        type: 'cosmic',
        name: 'The Hyperouterverse',
        description: 'The totality of all existence, containing all multiverses, dimensions, and realms ever theorized or created.',
        comedicLine: "When a multiverse just isn't multi enough!",
        connections: ['source_overvoid', 'source', 'presence', 'monitor_mind', 'source_wall']
      },
      {
        id: 'source_overvoid',
        type: 'cosmic',
        name: 'The Source Overvoid/Monitor-Mind',
        description: 'The infinite white void that contains all of existence, a living consciousness that became aware of the stories within itself.',
        comedicLine: "The ultimate blank page that became self-aware and probably needs therapy.",
        connections: ['hyperouterverse', 'monitor_mind', 'monitors', 'source', 'presence']
      },
      {
        id: 'world_forger',
        type: 'cosmic',
        name: 'World Forger',
        description: 'Brother of Monitor and Anti-Monitor, creator of possible universes.',
        comedicLine: "The ultimate universal architect with family issues.",
        connections: ['perpetua', 'monitor', 'anti_monitor', 'world_forge']
      },
      {
        id: 'mandrakk',
        type: 'cosmic',
        name: 'Mandrakk the Dark Monitor',
        description: 'The vampiric cosmic entity that feeds on stories and narratives.',
        comedicLine: "The ultimate critic of the multiverse.",
        connections: ['monitors', 'nix_uotan', 'superman']
      },
      {
        id: 'anti_monitor',
        type: 'cosmic',
        name: 'Anti-Monitor',
        description: 'The destroyer of universes, catalyst of the Crisis on Infinite Earths.',
        comedicLine: "When regular monitoring just isn't destructive enough.",
        connections: ['perpetua', 'monitor', 'crisis_on_infinite_earths']
      },
      {
        id: 'monitor',
        type: 'cosmic',
        name: 'The Original Monitor',
        description: 'The guardian of the positive matter multiverse.',
        comedicLine: "The original cosmic lifeguard.",
        connections: ['perpetua', 'anti_monitor', 'crisis_on_infinite_earths']
      },
      {
        id: 'time_trapper',
        type: 'cosmic',
        name: 'Time Trapper',
        description: 'The enigmatic being controlling the end of time.',
        comedicLine: "Time management taken to cosmic extremes.",
        connections: ['hypertime', 'legion_of_superheroes', 'superman']
      },
      {
        id: 'dr_manhattan',
        type: 'cosmic',
        name: 'Doctor Manhattan',
        description: 'A quantum being with the power to manipulate reality at will.',
        comedicLine: "Doesn't see the point in wearing pants across multiple realities.",
        connections: ['metaverse', 'superman', 'doomsday_clock']
      },
      {
        id: 'monitor_mind',
        type: 'cosmic',
        name: 'Monitor-Mind The Overvoid',
        description: 'The sentient aspect of the Source Overvoid, which fractured into the Monitors upon discovering a flaw in its perfection - the DC Multiverse.',
        comedicLine: "When you're so perfect that finding an imperfection breaks your mind into cosmic fragments.",
        connections: ['source_overvoid', 'monitors', 'source', 'perpetua', 'hyperouterverse']
      },
      {
        id: 'source',
        type: 'cosmic',
        name: 'The Source',
        description: 'The cosmic consciousness behind all creation, the fundamental force of the DC Universe.',
        comedicLine: "The ultimate power source that makes energizer bunnies look temporary.",
        connections: ['hyperouterverse', 'source_overvoid', 'source_wall', 'new_gods', 'presence']
      },
      {
        id: 'presence',
        type: 'cosmic',
        name: 'The Presence',
        description: 'The supreme creator being of the DC Universe, representing the Abrahamic God, though still beneath the Source Overvoid in the cosmic hierarchy.',
        comedicLine: "Even omnipotent beings need a vacation sometimes.",
        connections: ['source_overvoid', 'hyperouterverse', 'source', 'great_darkness', 'endless']
      },
      {
        id: 'great_darkness',
        type: 'cosmic',
        name: 'The Great Darkness',
        description: 'The primordial void that existed before creation, eternal opposite of The Presence, a fundamental force within the Hyperouterverse.',
        comedicLine: "Darker than a black hole's morning coffee.",
        connections: ['presence', 'hyperouterverse', 'source_overvoid', 'empty_hand']
      },
      {
        id: 'perpetua',
        type: 'cosmic',
        name: 'Perpetua',
        description: 'The original creator of the DC Multiverse, mother of the Monitor, Anti-Monitor, and World Forger.',
        comedicLine: "Mother knows best... how to create and destroy universes.",
        connections: ['source', 'monitor', 'anti_monitor', 'world_forger']
      },
      {
        id: 'empty_hand',
        type: 'cosmic',
        name: 'The Empty Hand',
        description: 'The entity of absolute ending that exists beyond the Source Wall.',
        comedicLine: "When nothing wants to be something, but destructively.",
        connections: ['source_wall', 'great_darkness', 'gentry']
      }
    ];
  }

  generateContingencyPlans() {
    return [
      {
        id: 'contingency_protocols',
        type: 'items',
        name: 'Justice League Contingency Protocols',
        description: 'Batman\'s secret plans to neutralize every Justice League member if they go rogue.',
        comedicLine: "The ultimate 'just in case' file that nobody was supposed to find.",
        connections: ['batman', 'justice_league', 'tower_of_babel', 'agamemno']
      },
      {
        id: 'tower_of_babel',
        type: 'events',
        name: 'Tower of Babel',
        description: 'Ra\'s al Ghul steals and implements Batman\'s contingency plans against the Justice League.',
        comedicLine: "When your coworker finds your 'ways to defeat everyone' document.",
        connections: ['ras_al_ghul', 'batman', 'justice_league', 'contingency_protocols']
      },
      {
        id: 'superman_plan',
        type: 'items',
        name: 'Red Kryptonite Exposure Plan',
        description: 'Plan to use synthetic red kryptonite to overload Superman\'s powers.',
        comedicLine: "When regular kryptonite just isn't enough of a headache.",
        connections: ['superman', 'contingency_protocols', 'batman']
      },
      {
        id: 'wonderwoman_plan',
        type: 'items',
        name: 'Virtual Reality Trap',
        description: 'Program designed to trap Wonder Woman in an endless battle simulation.',
        comedicLine: "The ultimate 'this fight will never end' scenario.",
        connections: ['wonderWoman', 'contingency_protocols', 'batman']
      },
      {
        id: 'flash_plan',
        type: 'items',
        name: 'Vibration Inducer',
        description: 'Device that forces Flash into light speed, potentially trapping him in the Speed Force.',
        comedicLine: "When you really need someone to take a speed vacation.",
        connections: ['flash', 'contingency_protocols', 'speedForce', 'batman']
      },
      {
        id: 'greenlantern_plan',
        type: 'items',
        name: 'Post-Hypnotic Suggestion',
        description: 'Subliminal programming to make Green Lantern doubt his willpower.',
        comedicLine: "The ultimate way to give someone ring anxiety.",
        connections: ['greenLantern', 'contingency_protocols', 'batman']
      },
      {
        id: 'martianmanhunter_plan',
        type: 'items',
        name: 'Nanite Fire Generators',
        description: 'Microscopic devices that simulate fire to incapacitate Martian Manhunter.',
        comedicLine: "When you need a microscopic campfire.",
        connections: ['martianManhunter', 'contingency_protocols', 'batman']
      },
      {
        id: 'aquaman_plan',
        type: 'items',
        name: 'Fear Toxin Variant',
        description: 'Modified Scarecrow toxin that induces hydrophobia.',
        comedicLine: "Making the king of the seas afraid of water is just mean.",
        connections: ['aquaman', 'contingency_protocols', 'scarecrow', 'batman']
      },
      {
        id: 'plastic_man_plan',
        type: 'items',
        name: 'Liquid Nitrogen Trap',
        description: 'Plan to freeze and shatter Plastic Man, knowing he can reform.',
        comedicLine: "The ultimate ice bucket challenge.",
        connections: ['plastic_man', 'contingency_protocols', 'batman']
      },
      {
        id: 'agamemno',
        type: 'villains',
        name: 'Agamemno',
        description: 'Alien villain who attempted to steal Batman\'s contingency plans.',
        comedicLine: "If you're going to steal secret plans, steal from the best!",
        connections: ['contingency_protocols', 'justice_league', 'tower_of_babel']
      },
      {
        id: 'justice_league_breakup',
        type: 'events',
        name: 'Justice League Trust Crisis',
        description: 'The aftermath of the revelation of Batman\'s contingency plans.',
        comedicLine: "The worst team building exercise ever.",
        connections: ['justice_league', 'batman', 'tower_of_babel', 'contingency_protocols']
      },
      {
        id: 'backup_plans',
        type: 'items',
        name: 'Secondary Contingencies',
        description: 'Batman\'s backup plans for his contingency plans.',
        comedicLine: "Because one set of secret plans isn't paranoid enough.",
        connections: ['batman', 'contingency_protocols', 'justice_league']
      }
    ];
  }

  generateUniverses() {
    return [
      {
        id: 'earth0',
        type: 'universe',
        name: 'Earth-0 (Prime Earth)',
        description: 'The main continuity of the DC Universe.',
        comedicLine: "Where being a superhero is somehow still a part-time job!",
        connections: ['multiverse', 'superman', 'batman', 'justice_league']
      },
      {
        id: 'earth1',
        type: 'universe', 
        name: 'Earth-1',
        description: 'Modern reimagining of DC heroes in graphic novel continuity.',
        comedicLine: "The universe where everyone gets a fresh start... again.",
        connections: ['multiverse', 'superman_earth1', 'batman_earth1']
      },
      {
        id: 'earth2',
        type: 'universe',
        name: 'Earth-2',
        description: 'Home of the Justice Society and alternate versions of classic heroes.',
        comedicLine: "Where the Golden Age never ended.",
        connections: ['multiverse', 'justice_society', 'alan_scott', 'jay_garrick']
      },
      {
        id: 'earth3',
        type: 'universe',
        name: 'Earth-3',
        description: 'Mirror universe where heroes are villains and villains are heroes.',
        comedicLine: "Where being bad is literally good!",
        connections: ['multiverse', 'crime_syndicate', 'owlman', 'ultraman']
      },
      {
        id: 'earth4',
        type: 'universe',
        name: 'Earth-4',
        description: 'Home of the Charlton Comics heroes.',
        comedicLine: "The universe that inspired Watchmen... just don't tell anyone.",
        connections: ['multiverse', 'blue_beetle', 'question', 'captain_atom']
      },
      {
        id: 'earth5',
        type: 'universe',
        name: 'Earth-5',
        description: 'Home of the Marvel Family and magic-based heroes.',
        comedicLine: "Where saying 'Shazam' is more common than 'hello'.",
        connections: ['multiverse', 'shazam_family', 'thunderworld']
      },
      {
        id: 'earth6',
        type: 'universe',
        name: 'Earth-6 (Just Imagine)',
        description: 'Universe created by Stan Lee with reimagined DC heroes.',
        comedicLine: "Where Spider-Man and Superman are considered new ideas.",
        connections: ['just_imagine', 'stan_lee', 'dc_universe']
      },
      {
        id: 'earth7',
        type: 'universe',
        name: 'Earth-7',
        description: 'Universe destroyed by the Gentry, home of Thunderer.',
        comedicLine: "The universe that proved cosmic horror stories are real.",
        connections: ['multiverse', 'thunderer', 'gentry']
      },
      {
        id: 'earth8',
        type: 'universe',
        name: 'Earth-8',
        description: 'Home to heroes inspired by Marvel Comics characters.',
        comedicLine: "Any resemblance to other comic universes is purely coincidental... mostly.",
        connections: ['multiverse', 'lord_havok', 'american_crusader']
      },
      {
        id: 'earth9',
        type: 'universe',
        name: 'Earth-9 (Tangent Universe)',
        description: 'Universe where familiar names have completely different powers and origins.',
        comedicLine: "Where Superman is psychic and Batman is a knight... literally.",
        connections: ['multiverse', 'tangent_superman', 'tangent_batman']
      },
      {
        id: 'earth10',
        type: 'universe',
        name: 'Earth-10 (Nazi Universe)',
        description: 'Universe where the Nazis won WWII and corrupted Superman.',
        comedicLine: "The darkest timeline, now with superheroes.",
        connections: ['multiverse', 'overman', 'brunhilde']
      },
      {
        id: 'earth11',
        type: 'universe',
        name: 'Earth-11',
        description: 'Universe where traditional gender roles are reversed.',
        comedicLine: "Same heroes, different pronouns.",
        connections: ['multiverse', 'superwoman', 'batwoman_earth11']
      },
      {
        id: 'earth12',
        type: 'universe',
        name: 'Earth-12 (Batman Beyond)',
        description: 'Future timeline where Terry McGinnis becomes the new Batman.',
        comedicLine: "The future is bright... well, neo-Gothic bright.",
        connections: ['multiverse', 'batman_beyond', 'justice_league_beyond']
      },
      {
        id: 'earth13',
        type: 'universe',
        name: 'Earth-13',
        description: 'Universe where the Multiverse is a comic book.',
        comedicLine: "Meta, isn't it?",
        connections: ['multiverse', 'comic_book_limbo', 'ultra_comics']
      },
      {
        id: 'earth15',
        type: 'universe',
        name: 'Earth-15',
        description: 'Perfect universe destroyed by Superboy-Prime.',
        comedicLine: "Too perfect to exist... literally.",
        connections: ['multiverse', 'superboy_prime', 'crisis']
      },
      {
        id: 'earth16',
        type: 'universe',
        name: 'Earth-16 (Young Justice)',
        description: 'Universe of the Young Justice animated series.',
        comedicLine: "Where sidekicks finally get the spotlight.",
        connections: ['multiverse', 'young_justice', 'the_team']
      },
      {
        id: 'earth17',
        type: 'universe',
        name: 'Earth-17 (Post-Apocalyptic)',
        description: 'Post-atomic horror universe.',
        comedicLine: "Where the nuclear option was definitely not the best option.",
        connections: ['multiverse', 'atomic_knights', 'atomic_wonder_woman']
      },
      {
        id: 'earth18',
        type: 'universe',
        name: 'Earth-18 (Justice Riders)',
        description: 'Western-themed universe with cowboy versions of heroes.',
        comedicLine: "Where secret identities include really cool cowboy hats.",
        connections: ['multiverse', 'justice_riders', 'wonder_woman_west']
      },
      {
        id: 'earth19',
        type: 'universe',
        name: 'Earth-19 (Gotham by Gaslight)',
        description: 'Victorian era steampunk universe.',
        comedicLine: "Where Batman fights crime with steam-powered gadgets.",
        connections: ['multiverse', 'batman_gaslight', 'gotham_gaslight']
      },
      {
        id: 'earth20',
        type: 'universe',
        name: 'Earth-20 (Pulp Heroes)',
        description: 'Universe of pulp-style heroes led by Doc Fate.',
        comedicLine: "Where every hero has a dramatic radio voice.",
        connections: ['multiverse', 'doc_fate', 'society_of_super-heroes']
      },
      {
        id: 'earth21',
        type: 'universe',
        name: 'Earth-21 (New Frontier)',
        description: 'Universe of DC: The New Frontier.',
        comedicLine: "The Space Age with spandex.",
        connections: ['multiverse', 'new_frontier_superman', 'new_frontier_batman']
      },
      {
        id: 'earth22',
        type: 'universe',
        name: 'Earth-22 (Kingdom Come)',
        description: 'Future timeline where superheroes face a moral crisis.',
        comedicLine: "Where Superman's S stands for 'Seriously, we need to talk.'",
        connections: ['multiverse', 'kingdom_come_superman', 'kingdom_come_batman']
      },
      {
        id: 'earth23',
        type: 'universe',
        name: 'Earth-23',
        description: 'Universe where Superman is Calvin Ellis, the President.',
        comedicLine: "Where Truth, Justice, and the American Way comes with Executive Orders.",
        connections: ['multiverse', 'president_superman', 'wonder_woman_23']
      },
      {
        id: 'earth26',
        type: 'universe',
        name: 'Earth-26 (Captain Carrot)',
        description: 'Universe populated by anthropomorphic animals.',
        comedicLine: "Where 'funny animal comics' is literally the whole universe.",
        connections: ['multiverse', 'captain_carrot', 'zoo_crew']
      },
      {
        id: 'earth29',
        type: 'universe',
        name: 'Earth-29 (Bizarro World)',
        description: 'Cubic planet where everything is backwards and imperfect.',
        comedicLine: "Where this description should make no sense to be accurate.",
        connections: ['bizarro_world', 'bizarro_superman', 'bizarro_league', 'multiverse']
      },
      {
        id: 'earth30',
        type: 'universe',
        name: 'Earth-30 (Red Son)',
        description: 'Universe where baby Kal-El\'s rocket landed in Soviet Ukraine instead of Kansas, leading to a world where Superman becomes the leader of the Soviet Union and attempts to spread communist ideals globally while facing opposition from American hero Lex Luthor and anarchist terrorist Batman.',
        comedicLine: "In Soviet Russia, cape wears you!",
        connections: ['red_son_superman', 'red_son_earth', 'multiverse', 'red_son_crisis']
      },
      {
        id: 'earth31',
        type: 'universe',
        name: 'Earth-31 (Dark Knight Returns)',
        description: 'Frank Miller\'s Dark Knight Universe.',
        comedicLine: "Where Batman definitely needs a throat lozenge.",
        connections: ['multiverse', 'dark_knight_batman', 'carrie_kelly']
      },
      {
        id: 'earth32',
        type: 'universe',
        name: 'Earth-32 (In Darkest Knight)',
        description: 'Universe where Bruce Wayne became Green Lantern instead of Batman after being chosen by Abin Sur\'s ring. He uses his willpower and detective skills to become one of the greatest Green Lanterns.',
        comedicLine: "When willpower meets detective work!",
        connections: ['batman_lantern', 'sinestro_32', 'jordan_32', 'queen_star']
      },
      {
        id: 'earth33',
        type: 'universe',
        name: 'Earth-33 (Real World)',
        description: 'Our world, where superheroes exist only in comics.',
        comedicLine: "The universe where you're reading this right now.",
        connections: ['multiverse', 'ultra_comics', 'comic_book_limbo']
      },
      {
        id: 'earth34',
        type: 'universe',
        name: 'Earth-34',
        description: 'Universe where Wonder Woman leads a matriarchal society.',
        comedicLine: "Where 'girl power' became 'world power'.",
        connections: ['multiverse', 'amazonia_wonder_woman', 'amazonia']
      },
      {
        id: 'earth36',
        type: 'universe',
        name: 'Earth-36 (Red Racer)',
        description: 'Universe protected by the Justice 9.',
        comedicLine: "Speed isn't everything, but it's most things.",
        connections: ['multiverse', 'red_racer', 'justice_9']
      },
      {
        id: 'earth37',
        type: 'universe',
        name: 'Earth-37 (Wonderous World)',
        description: 'Hippie universe where the Age of Aquarius never ended.',
        comedicLine: "Peace, love, and super-powers, man.",
        connections: ['multiverse', 'prez_rickard', 'sunshine_superman']
      },
      {
        id: 'earth38',
        type: 'universe',
        name: 'Earth-38',
        description: 'Universe where Superman is not a superhero.',
        comedicLine: "The universe that broke the mold... literally.",
        connections: ['multiverse', 'superman_earth38', 'justice_league_earth38']
      },
      {
        id: 'earth40',
        type: 'universe',
        name: 'Earth-40 (Liberty Files)',
        description: 'Pulp spy universe where heroes are secret agents.',
        comedicLine: "The universe where everyone's codename is classified.",
        connections: ['multiverse', 'clock_batman', 'owl_batman']
      },
      {
        id: 'earth41',
        type: 'universe',
        name: 'Earth-41 (Spore)',
        description: 'Universe of darker, edgier versions of heroes.',
        comedicLine: "Where the '90s never ended.",
        connections: ['multiverse', 'spore', 'dino_cop']
      },
      {
        id: 'earth42',
        type: 'universe',
        name: 'Earth-42 (Lil\' Leaguers)',
        description: 'Universe of cute chibi versions of heroes.',
        comedicLine: "Everything's better when it's adorable!",
        connections: ['multiverse', 'lil_batman', 'lil_superman']
      },
      {
        id: 'earth43',
        type: 'universe',
        name: 'Earth-43 (Vampire Batman)',
        description: 'Universe where Batman became a vampire.',
        comedicLine: "The Dark Knight got a bit too literal.",
        connections: ['multiverse', 'vampire_batman', 'blood_league']
      },
      {
        id: 'earth44',
        type: 'universe',
        name: 'Earth-44 (Robot League)',
        description: 'Universe protected by robot versions of heroes.',
        comedicLine: "Where the Justice League got an upgrade... literally.",
        connections: ['multiverse', 'metal_superman', 'metal_batman']
      },
      {
        id: 'earth45',
        type: 'universe',
        name: 'Earth-45',
        description: 'Universe where Superman became a corporate spokesperson.',
        comedicLine: "Truth, Justice, and Product Placement.",
        connections: ['multiverse', 'corporate_superman', 'superdoom']
      },
      {
        id: 'earth47',
        type: 'universe',
        name: 'Earth-47',
        description: 'Universe where the Multiverse is a comic book.',
        comedicLine: "Meta, isn't it?",
        connections: ['multiverse', 'comic_book_limbo', 'ultra_comics']
      },
      {
        id: 'earth50',
        type: 'universe',
        name: 'Earth-50 (Justice Lords)',
        description: 'Universe where Justice League became authoritarian.',
        comedicLine: "Where 'with great power' went really wrong.",
        connections: ['multiverse', 'justice_lords', 'lord_superman']
      },
      {
        id: 'earth494',
        type: 'universe',
        name: 'Earth-494 (Leatherwing)',
        description: 'A pirate-themed universe where Bruce Wayne is a heroic privateer captain known as Leatherwing, operating in colonial Caribbean waters.',
        comedicLine: "Where the Dark Knight became the Night Sailor!",
        connections: ['leatherwing_batman', 'flying_fox', 'gotham_harbor_494']
      }
    ];
  }

  generateRedSonLocations() {
    return [
      {
        id: 'red_son_moscow',
        type: 'locations',
        name: 'Soviet Moscow',
        description: 'Capital of Superman\'s Soviet empire, featuring advanced technology and social programs.',
        comedicLine: "Where the streets are paved with workers\' paradise... and surveillance cameras.",
        connections: ['red_son_superman', 'red_son_brainiac', 'red_son_batman']
      },
      {
        id: 'red_son_america',
        type: 'locations',
        name: 'Red Son America',
        description: 'Last bastion of capitalism, led by Lex Luthor against Superman\'s expanding Soviet influence.',
        comedicLine: "The land of the free... from Soviet super-influence.",
        connections: ['red_son_lex_luthor', 'red_son_green_lantern', 'red_son_resistance']
      },
      {
        id: 'red_son_earth',
        type: 'locations',
        name: 'Red Son Earth',
        description: 'A world where the Cold War is defined by Superman\'s Soviet leadership versus Luthor\'s American ingenuity.',
        comedicLine: "The Iron Curtain got a super-powered upgrade.",
        connections: ['red_son_superman', 'red_son_lex_luthor', 'red_son_wonder_woman']
      }
    ];
  }

  generateRedSonOrganizations() {
    return [
      {
        id: 'red_son_resistance',
        type: 'organizations',
        name: 'Batman\'s Resistance',
        description: 'Underground movement led by Batman to oppose Superman\'s Soviet regime.',
        comedicLine: "Making anti-communist propaganda great again!",
        connections: ['red_son_batman', 'red_son_moscow', 'red_son_earth']
      },
      {
        id: 'red_son_government',
        type: 'organizations',
        name: 'Superman\'s Soviet State',
        description: 'Global Soviet government established by Superman, attempting to create a perfect communist society.',
        comedicLine: "Where the party line is faster than a speeding bullet!",
        connections: ['red_son_superman', 'red_son_brainiac', 'red_son_moscow']
      }
    ];
  }

  generateRedSonEvents() {
    return [
      {
        id: 'red_son_crisis',
        type: 'events',
        name: 'Red Son Crisis',
        description: 'Final confrontation between Superman\'s Soviet forces and Luthor\'s American resistance.',
        comedicLine: "The Cold War gets super-heated!",
        connections: ['red_son_superman', 'red_son_lex_luthor', 'red_son_earth']
      },
      {
        id: 'red_son_revolution',
        type: 'events',
        name: 'Soviet Super-Revolution',
        description: 'Superman\'s peaceful takeover of the Soviet Union and subsequent global expansion.',
        comedicLine: "From Man of Steel to Man of Stalin.",
        connections: ['red_son_superman', 'red_son_moscow', 'red_son_government']
      }
    ];
  }

  generateDarkMultiverseContent() {
    return [
      {
        id: 'dark_multiverse_core',
        type: 'dimensions',
        name: 'Dark Multiverse Core',
        description: 'The central nexus of the Dark Multiverse where all nightmares converge.',
        comedicLine: "Where even darkness needs a nightlight!",
        connections: ['barbatos', 'dark_knights', 'world_forge']
      }
    ];
  }

  generateGaslightContent() {
    return [
      {
        id: 'gaslight_core',
        type: 'dimensions',
        name: 'Victorian Gotham Core',
        description: 'The heart of the Gaslight universe\'s Victorian era.',
        comedicLine: "Where even the smog has proper manners!",
        connections: ['batman_gaslight', 'gotham_gaslight', 'ripper_gotham']
      }
    ];
  }

  generateEarth32Content() {
    return [
      {
        id: 'earth32_core',
        type: 'dimensions',
        name: 'Earth-32 Core',
        description: 'The central reality where Bruce Wayne became Green Lantern.',
        comedicLine: "When willpower meets detective work!",
        connections: ['batman_lantern', 'jordan_32', 'earth32']
      }
    ];
  }

  generateKingdomComeContent() {
    return [
      {
        id: 'kingdom_come_core',
        type: 'dimensions',
        name: 'Kingdom Come Reality',
        description: 'The reality where superheroes face a generational crisis.',
        comedicLine: "Where retirement plans include saving the world... again.",
        connections: ['kingdom_come_superman', 'kingdom_come_batman', 'kingdom_come_wonder_woman']
      }
    ];
  }

  generateLeatherwingContent() {
    return [
      {
        id: 'leatherwing_core',
        type: 'dimensions',
        name: 'Leatherwing Reality',
        description: 'The pirate-themed universe where Batman is a heroic privateer.',
        comedicLine: "Sailing the seven seas with a utility belt!",
        connections: ['leatherwing_batman', 'flying_fox', 'gotham_harbor_494']
      }
    ];
  }

  generateEarth8Content() {
    return [
      {
        id: 'retaliators',
        type: 'organizations',
        name: 'The Retaliators',
        description: 'Earth-8\'s premier superhero team, analogous to the Avengers.',
        comedicLine: "Legally distinct enough to avoid copyright issues!",
        connections: ['american_crusader', 'machinehead', 'behemoth', 'new_metropolis_8']
      },
      {
        id: 'machinehead',
        type: 'heroes',
        name: 'Machinehead',
        description: 'Brilliant industrialist in powered armor, member of the Retaliators.',
        comedicLine: "Any similarity to other armored heroes is purely coincidental!",
        connections: ['retaliators', 'american_crusader', 'new_metropolis_8']
      },
      {
        id: 'behemoth',
        type: 'heroes',
        name: 'Behemoth',
        description: 'Scientist who transforms into a green monster when angry.',
        comedicLine: "Don't make him angry. You wouldn't like him when he's in litigation.",
        connections: ['retaliators', 'american_crusader', 'new_metropolis_8']
      },
      {
        id: 'wundajin',
        type: 'heroes',
        name: 'Wundajin',
        description: 'Norse-inspired hero wielding an enchanted hammer.',
        comedicLine: "His hammer has a very specific user agreement.",
        connections: ['retaliators', 'american_crusader', 'new_metropolis_8']
      },
      {
        id: 'meta_militia',
        type: 'organizations',
        name: 'Meta Militia',
        description: 'Team of enhanced individuals led by Lord Havok.',
        comedicLine: "The most legally distinct team of villains ever!",
        connections: ['lord_havok', 'angor', 'retaliators']
      },
      {
        id: 'spider_x',
        type: 'heroes',
        name: 'Spider-X',
        description: 'Mysterious wall-crawler protecting New Metropolis-8.',
        comedicLine: "Your legally distinct neighborhood hero!",
        connections: ['new_metropolis_8', 'retaliators', 'young_retaliators']
      },
      {
        id: 'young_retaliators',
        type: 'organizations',
        name: 'Young Retaliators',
        description: 'Team of teenage heroes training under the Retaliators.',
        comedicLine: "Like regular Retaliators, but with more homework!",
        connections: ['retaliators', 'spider_x', 'new_metropolis_8']
      }
    ];
  }

  generateFlashpointContent() {
    return [
      {
        id: 'flashpoint_aquaman',
        type: 'villains',
        name: 'Emperor Aquaman',
        description: 'Leader of Atlantis in the Flashpoint timeline, at war with the Amazons.',
        comedicLine: "Making waves in global politics... literally.",
        connections: ['flashpoint_atlantis', 'flashpoint_wonderwoman', 'flashpoint_earth']
      },
      {
        id: 'flashpoint_wonderwoman',
        type: 'villains',
        name: 'Wonder Woman of Flashpoint',
        description: 'Leader of the Amazons in their war against Atlantis.',
        comedicLine: "Peace was never an option... but fashion still is.",
        connections: ['flashpoint_amazons', 'flashpoint_aquaman', 'flashpoint_earth']
      },
      {
        id: 'flashpoint_batman',
        type: 'heroes',
        name: 'Thomas Wayne Batman',
        description: 'Bruce Wayne\'s father who became Batman after his son\'s death.',
        comedicLine: "The Dark Knight who makes regular Batman look optimistic.",
        connections: ['martha_wayne_joker', 'flashpoint_gotham', 'flashpoint_flash']
      },
      {
        id: 'flashpoint_superman',
        type: 'heroes',
        name: 'Subject Superman',
        description: 'Kal-El, raised in government captivity, never becoming Superman.',
        comedicLine: "The Man of Tomorrow who never saw yesterday.",
        connections: ['flashpoint_earth', 'flashpoint_cyborg', 'flashpoint_project']
      },
      {
        id: 'flashpoint_cyborg',
        type: 'heroes',
        name: 'Cyborg of Flashpoint',
        description: 'America\'s greatest hero in the Flashpoint timeline.',
        comedicLine: "Half man, half machine, all American hero!",
        connections: ['flashpoint_superman', 'flashpoint_project', 'flashpoint_resistance']
      },
      {
        id: 'flashpoint_atlantis',
        type: 'locations',
        name: 'Flashpoint Atlantis',
        description: 'Militaristic empire at war with the Amazons.',
        comedicLine: "Where 'sleeping with the fishes' is a lifestyle choice.",
        connections: ['flashpoint_aquaman', 'flashpoint_earth', 'flashpoint_europe']
      },
      {
        id: 'flashpoint_themyscira',
        type: 'locations',
        name: 'Flashpoint Themyscira',
        description: 'Militant Amazon nation conquering Europe.',
        comedicLine: "No men allowed... surviving.",
        connections: ['flashpoint_wonderwoman', 'flashpoint_amazons', 'flashpoint_earth']
      }
    ];
  }

  generateBizarroContent() {
    return [
      {
        id: 'bizarro_brainiac',
        type: 'villains',
        name: 'Bizarro Brainiac',
        description: 'The stupidest being in the universe, trying to shrink cities to make them bigger.',
        comedicLine: "Me make things dumber! Is good!",
        connections: ['bizarro_world', 'bizarro_superman', 'bizarro_fortress']
      },
      {
        id: 'bizarro_flash',
        type: 'heroes',
        name: 'Bizarro Flash',
        description: 'The slowest man alive, proud of his inability to catch anyone.',
        comedicLine: "Me am slowest man alive! Me so proud!",
        connections: ['bizarro_league', 'bizarro_world', 'bizarro_superman']
      },
      {
        id: 'bizarro_league',
        type: 'organizations',
        name: 'Bizarro League',
        description: 'Team of Bizarro heroes who try to make the world worse.',
        comedicLine: "Us am worst heroes ever! That good thing!",
        connections: ['bizarro_superman', 'bizarro_world', 'bizarro_flash']
      },
      {
        id: 'bizarro_daily_planet',
        type: 'locations',
        name: 'Daily Planet of Htrae',
        description: 'Newspaper that only prints lies and mistakes.',
        comedicLine: "All the news that not fit to print!",
        connections: ['bizarro_metropolis', 'bizarro_lois', 'bizarro_world']
      },
      {
        id: 'bizarro_batcave',
        type: 'locations',
        name: 'Bizarro Batcave',
        description: 'A bright, well-lit cave on top of the highest mountain.',
        comedicLine: "This am worst secret base ever! Everyone know where it is!",
        connections: ['bizarro_batman', 'bizarro_world', 'bizarro_league']
      },
      {
        id: 'bizarro_batman',
        type: 'heroes',
        name: 'Bizarro Batman',
        description: 'A bright, cheerful hero who fights crime in broad daylight.',
        comedicLine: "Me am the Day Knight! Me love sunshine!",
        connections: ['bizarro_league', 'bizarro_batcave', 'bizarro_world']
      },
      {
        id: 'bizarro_luthor',
        type: 'heroes',
        name: 'Bizarro Luthor',
        description: 'The world\'s dumbest man who tries to help Bizarro Superman.',
        comedicLine: "Me am dumbest man alive! Me help Superman!",
        connections: ['bizarro_superman', 'bizarro_metropolis', 'bizarro_world']
      },
      {
        id: 'bizarro_flash',
        type: 'heroes',
        name: 'Bizarro Flash',
        description: 'The slowest man alive, proud of his inability to catch anyone.',
        comedicLine: "Me am slowest man alive! Me so proud!",
        connections: ['bizarro_league', 'bizarro_world', 'bizarro_superman']
      },
      {
        id: 'bizarro_brainiac',
        type: 'villains',
        name: 'Bizarro Brainiac',
        description: 'The stupidest being in the universe, trying to shrink cities to make them bigger.',
        comedicLine: "Me make things dumber! Is good!",
        connections: ['bizarro_world', 'bizarro_superman', 'bizarro_fortress']
      },
      {
        id: 'bizarro_fortress',
        type: 'locations',
        name: 'Fortress of Bizarro',
        description: 'Bizarro\'s home base, a crude copy of Superman\'s Fortress of Solitude.',
        comedicLine: "Like the Fortress of Solitude, but with worse ice sculpting!",
        connections: ['bizarro_superman', 'bizarro_world', 'bizarro_brainiac']
      }
    ];
  }

  generateVillainVariants() {
    return [
      {
        id: 'emperor_joker',
        type: 'variants',
        name: 'Emperor Joker',
        description: 'Version of Joker who obtained Mr. Mxyzptlk\'s powers and reshaped reality.',
        comedicLine: "When you have god-like powers but still tell bad jokes!",
        connections: ['joker', 'mxyzptlk', 'superman']
      },
      {
        id: 'flashpoint_joker',
        type: 'variants',
        name: 'Martha Wayne Joker',
        description: 'Martha Wayne who became the Joker after her son Bruce\'s death.',
        comedicLine: "Mother knows worst!",
        connections: ['joker', 'thomas_wayne_batman', 'flashpoint_batman']
      },
      {
        id: 'gaslight_ripper',
        type: 'variants',
        name: 'Jack the Ripper Joker',
        description: 'Victorian era version of the Joker terrorizing Gotham as Jack the Ripper.',
        comedicLine: "Making Victorian London even grimmer!",
        connections: ['joker', 'batman_gaslight', 'gotham_gaslight']
      },
      {
        id: 'red_son_batman',
        type: 'variants',
        name: 'Red Son Batman',
        description: 'Russian anarchist version of Batman opposing Superman\'s Soviet regime.',
        comedicLine: "In Soviet Russia, bat fears you!",
        connections: ['batman', 'red_son_superman', 'red_son_resistance']
      },
      {
        id: 'owlman_thomas',
        type: 'variants',
        name: 'Owlman (Thomas Wayne Jr.)',
        description: 'Evil alternate universe version of Batman from Earth-3.',
        comedicLine: "Being bad is so much more fun than being good!",
        connections: ['batman', 'crime_syndicate', 'earth3']
      },
      {
        id: 'justice_lords_batman',
        type: 'variants',
        name: 'Justice Lord Batman',
        description: 'Authoritarian version of Batman who supports totalitarian control.',
        comedicLine: "Order through fear is still order.",
        connections: ['batman', 'justice_lords', 'justice_lords_superman']
      },
      {
        id: 'dawnbreaker',
        type: 'variants',
        name: 'The Dawnbreaker',
        description: 'Dark Multiverse Batman who received a Green Lantern ring and was corrupted by its power.',
        comedicLine: "In brightest day, in blackest night, no evil shall escape my might... because I AM evil!",
        connections: ['batman', 'dark_knights', 'dark_multiverse']
      },
      {
        id: 'devastator',
        type: 'variants',
        name: 'The Devastator',
        description: 'Dark Multiverse Batman who infected himself with a Doomsday virus.',
        comedicLine: "Superman-proofing yourself has never been so extreme!",
        connections: ['batman', 'dark_knights', 'superman']
      },
      {
        id: 'merciless',
        type: 'variants',
        name: 'The Merciless',
        description: 'Dark Multiverse Batman who took Ares\' helmet and became the God of War.',
        comedicLine: "Peace through superior firepower... lots of it!",
        connections: ['batman', 'dark_knights', 'wonderWoman']
      },
      {
        id: 'red_death',
        type: 'variants',
        name: 'The Red Death',
        description: 'Dark Multiverse Batman who stole Flash\'s powers and merged with the Speed Force.',
        comedicLine: "I am vengeance, I am the night, I am... really, really fast!",
        connections: ['batman', 'dark_knights', 'flash']
      },
      {
        id: 'murder_machine',
        type: 'variants',
        name: 'The Murder Machine',
        description: 'Dark Multiverse Batman who became a cybernetic killing machine after Alfred\'s death.',
        comedicLine: "Alfred would have wanted me to clean up crime... permanently.",
        connections: ['batman', 'dark_knights', 'alfred']
      },
      {
        id: 'drowned',
        type: 'variants',
        name: 'The Drowned',
        description: 'Dark Multiverse female Batman who gave herself aquatic powers to fight Atlanteans.',
        comedicLine: "The Deep Dark Knight rises... from the ocean depths!",
        connections: ['batman', 'dark_knights', 'aquaman']
      },
      {
        id: 'dark_luthor',
        type: 'variants',
        name: 'Dark Multiverse Luthor',
        description: 'Version of Luthor who successfully killed Superman and absorbed his powers.',
        comedicLine: "Finally proved I\'m better than Superman... by becoming him!",
        connections: ['lexLuthor', 'superman', 'dark_multiverse']
      },
      {
        id: 'president_luthor',
        type: 'variants',
        name: 'President Lex Luthor',
        description: 'Version of Luthor who became President of the United States.',
        comedicLine: "Make Metropolis Great Again!",
        connections: ['lexLuthor', 'superman', 'metropolis']
      },
      {
        id: 'salvation_luthor',
        type: 'variants',
        name: 'Salvation Run Luthor',
        description: 'Luthor who led villains stranded on a prison planet.',
        comedicLine: "Even in exile, I\'m still in charge!",
        connections: ['lexLuthor', 'salvation_run', 'villains']
      },
      {
        id: 'antimonitor_prime',
        type: 'variants',
        name: 'Anti-Monitor Prime',
        description: 'The most powerful version of the Anti-Monitor during the Crisis on Infinite Earths.',
        comedicLine: "Universal destruction is really just universal redecorating!",
        connections: ['anti_monitor', 'crisis_on_infinite_earths', 'monitor']
      },
      {
        id: 'black_lantern_freeze',
        type: 'variants',
        name: 'Black Lantern Mr. Freeze',
        description: 'Undead version of Mr. Freeze raised by Nekron.',
        comedicLine: "Now I\'m really giving people the cold shoulder!",
        connections: ['mr_freeze', 'black_lanterns', 'blackest_night']
      },
      {
        id: 'kingdom_come_brainiac',
        type: 'variants',
        name: 'Kingdom Come Brainiac',
        description: 'Future version of Brainiac who merged with multiple cities.',
        comedicLine: "My collection has become my existence!",
        connections: ['brainiac', 'kingdom_come_superman', 'kingdom_come_earth']
      }
    ];
  }

  generateAbsoluteContent() {
    return [
      {
        id: 'absolute_dimension',
        type: 'dimensions',
        name: 'The Absolute',
        description: 'A higher plane of reality where stories achieve their purest, most archetypal form.',
        comedicLine: "Where everything is absolutely perfect... absolutely!",
        connections: ['absolute_superman', 'absolute_batman', 'absolute_monitor']
      },
      {
        id: 'absolute_superman',
        type: 'variants',
        name: 'Absolute Superman',
        description: 'The perfect archetypal version of Superman, representing the pure ideal of hope and heroism.',
        comedicLine: "Even my cape flutters perfectly in every panel!",
        connections: ['superman', 'absolute_dimension', 'absolute_justice']
      },
      {
        id: 'absolute_batman',
        type: 'variants',
        name: 'Absolute Batman',
        description: 'The quintessential Dark Knight, embodying the perfect balance of justice and vengeance.',
        comedicLine: "I am the night... in its most perfectly rendered form.",
        connections: ['batman', 'absolute_dimension', 'absolute_justice']
      },
      {
        id: 'absolute_wonder_woman',
        type: 'variants',
        name: 'Absolute Wonder Woman',
        description: 'The ultimate Amazon warrior, representing perfect truth and compassion.',
        comedicLine: "My golden lasso sparkles with absolute truth!",
        connections: ['wonderWoman', 'absolute_dimension', 'absolute_justice']
      },
      {
        id: 'absolute_justice',
        type: 'organizations',
        name: 'The Absolute Justice League',
        description: 'The perfect incarnation of the Justice League, operating at peak heroic efficiency.',
        comedicLine: "We\'ve absolutely got this under control!",
        connections: ['absolute_superman', 'absolute_batman', 'absolute_wonder_woman']
      },
      {
        id: 'absolute_monitor',
        type: 'cosmic',
        name: 'The Absolute Monitor',
        description: 'The perfect observer of reality, maintaining the balance of the Absolute dimension.',
        comedicLine: "I monitor everything... absolutely everything!",
        connections: ['absolute_dimension', 'monitor', 'monitors']
      },
      {
        id: 'absolute_crisis',
        type: 'events',
        name: 'The Absolute Crisis',
        description: 'A perfect crystallization of all crisis events, where the multiverse achieves perfect balance.',
        comedicLine: "This crisis is absolutely perfect... which is absolutely terrifying!",
        connections: ['absolute_dimension', 'crisis_on_infinite_earths', 'absolute_monitor']
      },
      {
        id: 'absolute_fortress',
        type: 'locations',
        name: 'The Absolute Fortress of Solitude',
        description: 'The perfect sanctuary, containing the purest essence of Kryptonian knowledge and power.',
        comedicLine: "Even the ice crystals are absolutely symmetrical!",
        connections: ['absolute_superman', 'absolute_dimension', 'fortress_of_solitude']
      },
      {
        id: 'absolute_batcave',
        type: 'locations',
        name: 'The Absolute Batcave',
        description: 'The perfect base of operations, containing the ultimate version of every bat-gadget.',
        comedicLine: "Even the bats maintain perfect formation!",
        connections: ['absolute_batman', 'absolute_dimension', 'batcave']
      },
      {
        id: 'absolute_themyscira',
        type: 'locations',
        name: 'The Absolute Themyscira',
        description: 'The perfect Amazon paradise, embodying the purest ideals of their society.',
        comedicLine: "Our architecture is absolutely perfect... literally!",
        connections: ['absolute_wonder_woman', 'absolute_dimension', 'themyscira']
      }
    ];
  }
}