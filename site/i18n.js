// ===================== b0b.dev INTERNATIONALIZATION ENGINE =====================
// Client-side translation for shell, drawer, content pages
// Supports: en, es, fr, ar, zh, pt, ru, hi, sw, ko, ja, de
// Architecture: data-i18n attributes + postMessage sync between shell and iframe
(function(){
'use strict';

var LANGS={
  en:'English',
  es:'Español',
  fr:'Français',
  ar:'العربية',
  zh:'中文',
  pt:'Português',
  ru:'Русский',
  hi:'हिन्दी',
  sw:'Kiswahili',
  ko:'한국어',
  ja:'日本語',
  de:'Deutsch'
};

// English source text keyed by data-i18n attribute values
var EN={
// --- NAVIGATION ---
'nav.report':'REPORT',
'nav.map':'OSINT MAP',
'nav.home':'HOME',
'nav.tools':'TOOLS',
'nav.shield':'ARC SHIELD',
'nav.guide':'FIELD GUIDE',
'nav.backup':'BACKUP ZIP',
'nav.logout':'LOGOUT',
'nav.updated':'UPDATED',
// --- DRAWER BAR ---
'drawer.title':'COUNTERMEASURES',
'drawer.shield':'SHIELD',
'drawer.webrtc':'WEBRTC',
'drawer.canvas':'CANVAS',
'drawer.tones':'TONES',
'drawer.protect':'PROTECT',
'drawer.arc':'ARC',
'drawer.lab':'LAB',
// --- PANEL LABELS ---
'panel.ultrasonic':'ULTRASONIC SHIELD',
'panel.webrtc':'WebRTC LEAK BLOCK',
'panel.canvas':'CANVAS FINGERPRINT GUARD',
'panel.healing':'HEALING TONES',
'panel.protective':'PROTECTIVE TONES',
'panel.arc':'ARC SHIELD',
'panel.tonelab':'TONE LAB',
// --- PANEL INFO ---
'info.ultrasonic':'WATER PLANET OPTIMIZED - Humidity-adaptive frequency sweep across 20\u201322kHz. Jams cross-device tracking beacons & acoustic data exfiltration. ANIMAL-SAFE: above 20kHz at -60dB.',
'info.webrtc':'Prevents WebRTC from exposing your real local/public IP addresses through STUN/TURN requests.',
'info.canvas':'Injects imperceptible noise into canvas readback operations, defeating canvas fingerprinting.',
'info.healing':'Solfeggio frequencies with sub-harmonic body-water resonance. ANIMAL-SAFE: 174\u2013963 Hz at gentle volume.',
'info.protective':'7.83 Hz Schumann is Earth\u2019s electromagnetic heartbeat. Use headphones for binaural entrainment. ANIMAL-SAFE.',
'info.arc':'LRAD detection, phase cancellation, counter-frequency. Requires microphone.',
// --- STATUS ---
'status.active':'ACTIVE',
'status.inactive':'INACTIVE',
'status.lastUpdated':'LAST UPDATED',
'status.status':'STATUS',
// --- ACTIONS ---
'action.activate':'ACTIVATE THREAT DETECTION',
'action.stopAll':'STOP ALL',
'action.copy':'COPY',
'action.copied':'COPIED',
'action.search':'Search locations...',
'action.reset':'RESET',
'action.filters':'FILTERS',
'action.fullShield':'FULL SHIELD',
'action.openToneLab':'OPEN FULL TONE LAB',
// --- DOWNLOAD / INSTALL ---
'dl.title':'DOWNLOAD / INSTALL APPS',
'dl.info':'Install to home screen on mobile. Download HTML files on desktop. Zero dependencies.',
'dl.multipack':'INSTALL MULTIPACK (ALL-IN-ONE)',
'dl.tonelab':'INSTALL TONE LAB (INSTRUMENT)',
'dl.healing':'INSTALL HEALING',
'dl.protective':'INSTALL PROTECTIVE',
'dl.downloadHtml':'DOWNLOAD .HTML',
'dl.embedTitle':'INSTALL ON YOUR SITE',
'dl.embedInfo':'Copy embed code to add tone tools to any website.',
'dl.iframe':'IFRAME EMBED:',
'dl.script':'SCRIPT TAG:',
// --- FREQUENCY NAMES ---
'freq.painRelief':'Pain Relief',
'freq.tissueHealing':'Tissue Healing',
'freq.liberation':'Liberation',
'freq.change':'Change',
'freq.naturalCalm':'Natural Calm',
'freq.loveDna':'Love / DNA Repair',
'freq.connection':'Connection',
'freq.intuition':'Intuition',
'freq.spiritual':'Spiritual',
'freq.higherSelf':'Higher Self',
// --- PROTECTIVE NAMES ---
'prot.schumann':'Schumann Resonance',
'prot.alpha':'Alpha - Calm Alert',
'prot.beta':'Beta - Focus',
'prot.gamma':'Gamma - Perception',
'prot.pink':'Pink Noise - Masking',
'prot.brown':'Brown Noise - Deep Cover',
'prot.ocean':'Ocean Waves - Planet Sound',
// --- TONE LAB PADS ---
'tl.pain':'Pain','tl.free':'Free','tl.calm':'Calm','tl.love':'Love',
'tl.bond':'Bond','tl.intuit':'Intuit','tl.spirit':'Spirit','tl.crown':'Crown',
'tl.om':'OM','tl.hum':'Hum','tl.earth':'Earth','tl.gamma':'Gamma',
// --- CONTENT ---
'content.livingDoc':'living document',
'content.theReport':'THE REPORT',
'content.keepRunning':'KEEP THIS SITE RUNNING - FOOD + SUPPLIES',
'content.cmTitle':'COUNTERMEASURES',
'content.cmSubtitle':'PRIVACY TOOLS & HEALING TONES',
// --- MAP ---
'map.bySection':'BY SECTION',
'map.byType':'BY TYPE',
'map.mapStyle':'MAP STYLE',
'map.dataLayers':'DATA LAYERS & LIVE FEEDS',
'map.toolkit':'TOOLKIT & RESOURCES',
'map.allSections':'All Sections',
'map.allTypes':'All Types',
'map.dark':'Dark','map.satellite':'Satellite','map.terrain':'Terrain','map.street':'Street',
'map.connectionLines':'Connection Lines','map.tunnelPaths':'Tunnel Paths',
'map.quakes':'USGS Quakes','map.nasaEvents':'NASA Events','map.fires':'NASA Fire Hotspots',
'map.aircraft':'Live Aircraft','map.iss':'ISS Tracker','map.disasters':'GDACS Disasters',
'map.timeline':'Correlation Timeline',
'map.searchConn':'SEARCH CONNECTIONS','map.proxSearch':'PROXIMITY SEARCH','map.find':'FIND',
'map.researcherTools':'RESEARCHER TOOLS',
'map.exportJson':'EXPORT JSON DATA','map.downloadBackup':'DOWNLOAD OFFLINE BACKUP (ZIP)',
'map.sourceMethods':'SOURCE METHODOLOGY',
// --- REPORT SIDEBAR ---
'report.expandAll':'EXPAND ALL',
'report.collapseAll':'COLLAPSE ALL',
'report.aiVirus':'AI VIRUS REPORT',
// --- REPORT SECTION TITLES ---
'report.sect.I':'I. Purpose & Framework',
'report.sect.VI':'VI. The Science Cover',
'report.sect.VII':'VII. Control Architecture',
'report.sect.VIII':'VIII. 51% Threshold',
'report.sect.IX':'IX. Underground / D.U.M.B.',
'report.sect.X':'X. Surveillance & Tech',
'report.sect.XI':'XI. The "New" Pattern',
'report.sect.XII':'XII. Enclaves',
'report.sect.XIII':'XIII. Cyclical Patterns',
'report.sect.XIV':'XIV. Slavery Systems',
'report.sect.XV':'XV. Conflicts',
'report.sect.XVI':'XVI. FOIA Patterns',
'report.sect.XVII':'XVII. Organized Crime',
'report.sect.XVIII':'XVIII. Art & the Market',
'report.sect.XIX':'XIX. Cross-Reference Index',
'report.sect.XX':'XX. Calibration Index',
'report.sect.XXIII':'XXIII. Spiritual Reclamation',
'report.sect.XXIV':'XXIV. The Signal',
'report.sect.XXI':'XXI. Compute Substrate',
'report.sect.XXII':'XXII. Connective Tissue',
'report.sect.II':'II. Epstein Network',
'report.sect.III':'III. Seam Analysis',
'report.sect.IV':'IV. Blowback',
'report.sect.V':'V. The Maxwell Template',
// --- REPORT FULL HEADINGS ---
'report.h.I':'I. Purpose & Framework',
'report.h.VI':'VI. The Science Cover - Patronage, Eugenics, and the Seeding Ideology',
'report.h.VII':'VII. The Control Architecture - Structures of Long-Lead Dominion',
'report.h.VIII':'VIII. The 51% Threshold - Nash, Bitcoin, and Governance as Network Theory',
'report.h.IX':'IX. Underground Infrastructure - D.U.M.B. Sites & Parallel Geography',
'report.h.X':'X. Technology as Control - Surveillance Cities & Population Management',
'report.h.XI':'XI. The \u201CNew\u201D Pattern - Global Sites of Replication & Replacement',
'report.h.XII':'XII. Billionaire Enclaves - Hardened Islands of Extraction',
'report.h.XIII':'XIII. Cyclical Patterns - Evidence of Repeating Civilizational Control',
'report.h.XIV':'XIV. Animal & Human Slavery Systems - The Unbroken Chain',
'report.h.XV':'XV. Active Global Conflicts - The Map Beneath the Map',
'report.h.XVI':'XVI. FOIA Patterns - What the Declassified Record Reveals',
'report.h.XVII':'XVII. Organized Crime as Infrastructure - The Cartel-Intelligence-Banking Nexus',
'report.h.XIX':'XIX. Cross-Reference Index',
'report.h.XX':'XX. Calibration Index - High-Connectivity Individuals',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Spiritual Reclamation - The Counter-Architecture',
'report.h.XXIV':'XXIV. Sending the Signal - Contact & Maximum Assistance',
// --- MAP LEGEND ---
'map.markerColors':'MARKER COLORS'
};

// ===================== TRANSLATIONS =====================
var D={
// --------------- SPANISH ---------------
es:{
'nav.report':'INFORME','nav.map':'MAPA OSINT','nav.home':'INICIO','nav.tools':'HERRAMIENTAS',
'nav.shield':'ESCUDO ARC','nav.guide':'GU\u00cdA DE CAMPO','nav.backup':'COPIA DE RESPALDO','nav.logout':'SALIR','nav.updated':'ACTUALIZADO',
'drawer.title':'CONTRAMEDIDAS','drawer.shield':'ESCUDO','drawer.tones':'TONOS','drawer.protect':'PROTECCI\u00d3N','drawer.lab':'LAB',
'panel.ultrasonic':'ESCUDO ULTRAS\u00d3NICO','panel.webrtc':'BLOQUEO FUGAS WebRTC','panel.canvas':'GUARDIA HUELLA CANVAS',
'panel.healing':'TONOS CURATIVOS','panel.protective':'TONOS PROTECTORES','panel.arc':'ESCUDO ARC','panel.tonelab':'LABORATORIO DE TONOS',
'info.ultrasonic':'OPTIMIZADO PARA PLANETA AGUA - Barrido de frecuencia adaptable a humedad en 20\u201322kHz. Bloquea balizas de rastreo entre dispositivos y exfiltraci\u00f3n ac\u00fastica. SEGURO PARA ANIMALES: por encima de 20kHz a -60dB.',
'info.webrtc':'Previene que WebRTC exponga sus direcciones IP reales a trav\u00e9s de solicitudes STUN/TURN.',
'info.canvas':'Inyecta ruido imperceptible en operaciones de lectura canvas, derrotando la huella digital canvas.',
'info.healing':'Frecuencias Solfeggio con resonancia sub-arm\u00f3nica de agua corporal. SEGURO PARA ANIMALES: 174\u2013963 Hz a volumen suave.',
'info.protective':'7.83 Hz Schumann es el latido electromagn\u00e9tico de la Tierra. Use auriculares para sincronizaci\u00f3n binaural. SEGURO PARA ANIMALES.',
'info.arc':'Detecci\u00f3n LRAD, cancelaci\u00f3n de fase, contra-frecuencia. Requiere micr\u00f3fono.',
'status.active':'ACTIVO','status.inactive':'INACTIVO','status.lastUpdated':'\u00daLTIMA ACTUALIZACI\u00d3N','status.status':'ESTADO',
'action.activate':'ACTIVAR DETECCI\u00d3N DE AMENAZAS','action.stopAll':'DETENER TODO',
'action.copy':'COPIAR','action.copied':'COPIADO','action.search':'Buscar ubicaciones...',
'action.reset':'REINICIAR','action.filters':'FILTROS','action.fullShield':'ESCUDO COMPLETO','action.openToneLab':'ABRIR LABORATORIO COMPLETO',
'dl.title':'DESCARGAR / INSTALAR APPS','dl.info':'Instalar en pantalla de inicio en m\u00f3vil. Descargar HTML en escritorio. Sin dependencias.',
'dl.multipack':'INSTALAR PAQUETE COMPLETO','dl.tonelab':'INSTALAR LABORATORIO DE TONOS',
'dl.healing':'INSTALAR CURATIVOS','dl.protective':'INSTALAR PROTECTORES','dl.downloadHtml':'DESCARGAR .HTML',
'dl.embedTitle':'INSTALAR EN TU SITIO','dl.embedInfo':'Copiar c\u00f3digo para agregar herramientas de tonos a cualquier sitio.',
'dl.iframe':'INCRUSTAR IFRAME:','dl.script':'ETIQUETA SCRIPT:',
'freq.painRelief':'Alivio del Dolor','freq.tissueHealing':'Sanaci\u00f3n de Tejidos','freq.liberation':'Liberaci\u00f3n',
'freq.change':'Cambio','freq.naturalCalm':'Calma Natural','freq.loveDna':'Amor / Reparaci\u00f3n ADN',
'freq.connection':'Conexi\u00f3n','freq.intuition':'Intuici\u00f3n','freq.spiritual':'Espiritual','freq.higherSelf':'Ser Superior',
'prot.schumann':'Resonancia Schumann','prot.alpha':'Alfa - Calma Alerta','prot.beta':'Beta - Enfoque',
'prot.gamma':'Gamma - Percepci\u00f3n','prot.pink':'Ruido Rosa - Enmascaramiento','prot.brown':'Ruido Marr\u00f3n - Cobertura',
'prot.ocean':'Olas del Oc\u00e9ano - Sonido Planeta',
'tl.pain':'Dolor','tl.free':'Libre','tl.calm':'Calma','tl.love':'Amor',
'tl.bond':'V\u00ednculo','tl.intuit':'Intuir','tl.spirit':'Esp\u00edritu','tl.crown':'Corona',
'tl.om':'OM','tl.hum':'Hum','tl.earth':'Tierra','tl.gamma':'Gamma',
'content.livingDoc':'documento vivo','content.theReport':'EL INFORME',
'content.keepRunning':'MANT\u00c9N ESTE SITIO - COMIDA + SUMINISTROS',
'content.cmTitle':'CONTRAMEDIDAS','content.cmSubtitle':'HERRAMIENTAS DE PRIVACIDAD Y TONOS CURATIVOS',
'map.bySection':'POR SECCI\u00d3N','map.byType':'POR TIPO','map.mapStyle':'ESTILO DE MAPA',
'map.dataLayers':'CAPAS DE DATOS Y FEEDS EN VIVO','map.toolkit':'KIT DE HERRAMIENTAS Y RECURSOS',
'map.allSections':'Todas las Secciones','map.allTypes':'Todos los Tipos',
'map.dark':'Oscuro','map.satellite':'Sat\u00e9lite','map.terrain':'Terreno','map.street':'Calle',
'map.connectionLines':'L\u00edneas de Conexi\u00f3n','map.tunnelPaths':'Rutas de T\u00faneles',
'map.quakes':'Sismos USGS','map.nasaEvents':'Eventos NASA','map.fires':'Focos de Incendio NASA',
'map.aircraft':'Aviones en Vivo','map.iss':'Rastreador ISS','map.disasters':'Desastres GDACS',
'map.timeline':'L\u00ednea Temporal de Correlaci\u00f3n',
'map.searchConn':'BUSCAR CONEXIONES','map.proxSearch':'B\u00daSQUEDA DE PROXIMIDAD','map.find':'BUSCAR',
'map.researcherTools':'HERRAMIENTAS DE INVESTIGADOR',
'map.exportJson':'EXPORTAR DATOS JSON','map.downloadBackup':'DESCARGAR COPIA OFFLINE (ZIP)',
'map.sourceMethods':'METODOLOGÍA DE FUENTES',
'report.expandAll':'EXPANDIR TODO',
'report.collapseAll':'CONTRAER TODO',
'report.aiVirus':'INFORME VIRUS IA',
'report.sect.I':'I. Prop\u00f3sito y Marco','report.sect.VII':'VII. Arquitectura de Control','report.sect.VIII':'VIII. Umbral del 51%','report.sect.IX':'IX. Subterr\u00e1neo / D.U.M.B.','report.sect.X':'X. Vigilancia y Tecnolog\u00eda','report.sect.XI':'XI. El Patr\u00f3n "Nuevo"','report.sect.XII':'XII. Enclaves','report.sect.XIII':'XIII. Patrones C\u00edclicos','report.sect.XIV':'XIV. Sistemas de Esclavitud','report.sect.XV':'XV. Conflictos','report.sect.XVI':'XVI. Patrones FOIA','report.sect.XVII':'XVII. Crimen Organizado','report.sect.XIX':'XIX. \u00cdndice de Referencia Cruzada','report.sect.XX':'XX. \u00cdndice de Calibraci\u00f3n','report.sect.XXIII':'XXIII. Reclamaci\u00f3n Espiritual','report.sect.XXIV':'XXIV. La Se\u00f1al',
'report.h.I':'I. Propósito y Marco',
'report.h.VII':'VII. La Arquitectura de Control – Estructuras de Dominio a Largo Plazo',
'report.h.VIII':'VIII. El Umbral del 51% – Nash, Bitcoin y la Gobernanza como Teoría de Redes',
'report.h.IX':'IX. Infraestructura Subterránea – Sitios D.U.M.B. y Geografía Paralela',
'report.h.X':'X. La Tecnología como Control – Ciudades de Vigilancia y Gestión Poblacional',
'report.h.XI':'XI. El Patrón “Nuevo” – Sitios Globales de Replicación y Reemplazo',
'report.h.XII':'XII. Enclaves de Multimillonarios – Islas Fortificadas de Extracción',
'report.h.XIII':'XIII. Patrones Cíclicos – Evidencia de Control Civilizacional Repetitivo',
'report.h.XIV':'XIV. Sistemas de Esclavitud Animal y Humana – La Cadena Inquebrantable',
'report.h.XV':'XV. Conflictos Globales Activos – El Mapa Debajo del Mapa',
'report.h.XVI':'XVI. Patrones FOIA – Lo que Revela el Registro Desclasificado',
'report.h.XVII':'XVII. Crimen Organizado como Infraestructura – El Nexo Cártel-Inteligencia-Banca',
'report.h.XIX':'XIX. Índice de Referencia Cruzada',
'report.h.XX':'XX. Índice de Calibración – Individuos de Alta Conectividad',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Reclamación Espiritual – La Contra-Arquitectura',
'report.h.XXIV':'XXIV. Enviando la Señal – Contacto y Máxima Asistencia',
'map.markerColors':'COLORES DE MARCADORES'
},
// --------------- FRENCH ---------------
fr:{
'nav.report':'RAPPORT','nav.map':'CARTE OSINT','nav.home':'ACCUEIL','nav.tools':'OUTILS',
'nav.shield':'BOUCLIER ARC','nav.guide':'GUIDE DE TERRAIN','nav.backup':'SAUVEGARDE','nav.logout':'D\u00c9CONNEXION','nav.updated':'MIS À JOUR',
'drawer.title':'CONTRE-MESURES','drawer.shield':'BOUCLIER','drawer.tones':'TONS','drawer.protect':'PROT\u00c9GER','drawer.lab':'LABO',
'panel.ultrasonic':'BOUCLIER ULTRASONIQUE','panel.webrtc':'BLOCAGE FUITES WebRTC','panel.canvas':'GARDE EMPREINTE CANVAS',
'panel.healing':'TONS CURATIFS','panel.protective':'TONS PROTECTEURS','panel.arc':'BOUCLIER ARC','panel.tonelab':'LABORATOIRE DE TONS',
'info.ultrasonic':'OPTIMIS\u00c9 PLAN\u00c8TE EAU - Balayage de fr\u00e9quence adaptatif \u00e0 l\u2019humidit\u00e9 sur 20\u201322kHz. Brouille les balises de suivi et l\u2019exfiltration acoustique. S\u00dbR POUR LES ANIMAUX: au-dessus de 20kHz \u00e0 -60dB.',
'info.webrtc':'Emp\u00eache WebRTC d\u2019exposer vos adresses IP r\u00e9elles via les requ\u00eates STUN/TURN.',
'info.canvas':'Injecte du bruit imperceptible dans les op\u00e9rations de lecture canvas, d\u00e9jouant l\u2019empreinte canvas.',
'info.healing':'Fr\u00e9quences Solf\u00e8ge avec r\u00e9sonance sub-harmonique eau corporelle. S\u00dbR POUR LES ANIMAUX: 174\u2013963 Hz \u00e0 volume doux.',
'info.protective':'7.83 Hz Schumann est le battement \u00e9lectromagn\u00e9tique de la Terre. Utilisez des \u00e9couteurs pour l\u2019entra\u00eenement binaural. S\u00dbR POUR LES ANIMAUX.',
'info.arc':'D\u00e9tection LRAD, annulation de phase, contre-fr\u00e9quence. N\u00e9cessite un microphone.',
'status.active':'ACTIF','status.inactive':'INACTIF','status.lastUpdated':'DERNI\u00c8RE MISE \u00c0 JOUR','status.status':'STATUT',
'action.activate':'ACTIVER D\u00c9TECTION DE MENACES','action.stopAll':'TOUT ARR\u00caTER',
'action.copy':'COPIER','action.copied':'COPI\u00c9','action.search':'Rechercher des lieux...',
'action.reset':'R\u00c9INITIALISER','action.filters':'FILTRES','action.fullShield':'BOUCLIER COMPLET','action.openToneLab':'OUVRIR LABORATOIRE COMPLET',
'dl.title':'T\u00c9L\u00c9CHARGER / INSTALLER','dl.info':'Installer sur l\u2019\u00e9cran d\u2019accueil mobile. T\u00e9l\u00e9charger HTML sur bureau. Z\u00e9ro d\u00e9pendance.',
'dl.multipack':'INSTALLER MULTIPACK','dl.tonelab':'INSTALLER LABO DE TONS',
'dl.healing':'INSTALLER CURATIFS','dl.protective':'INSTALLER PROTECTEURS','dl.downloadHtml':'T\u00c9L\u00c9CHARGER .HTML',
'dl.embedTitle':'INSTALLER SUR VOTRE SITE','dl.embedInfo':'Copier le code pour ajouter les outils de tons \u00e0 n\u2019importe quel site.',
'dl.iframe':'INT\u00c9GRATION IFRAME:','dl.script':'BALISE SCRIPT:',
'freq.painRelief':'Soulagement de la douleur','freq.tissueHealing':'Gu\u00e9rison des tissus','freq.liberation':'Lib\u00e9ration',
'freq.change':'Changement','freq.naturalCalm':'Calme naturel','freq.loveDna':'Amour / R\u00e9paration ADN',
'freq.connection':'Connexion','freq.intuition':'Intuition','freq.spiritual':'Spirituel','freq.higherSelf':'Moi sup\u00e9rieur',
'prot.schumann':'R\u00e9sonance Schumann','prot.alpha':'Alpha - Calme alerte','prot.beta':'B\u00eata - Concentration',
'prot.gamma':'Gamma - Perception','prot.pink':'Bruit rose - Masquage','prot.brown':'Bruit brun - Couverture profonde',
'prot.ocean':'Vagues oc\u00e9aniques - Son plan\u00e9taire',
'tl.pain':'Douleur','tl.free':'Libre','tl.calm':'Calme','tl.love':'Amour',
'tl.bond':'Lien','tl.intuit':'Intuir','tl.spirit':'Esprit','tl.crown':'Couronne',
'tl.earth':'Terre','tl.gamma':'Gamma',
'content.livingDoc':'document vivant','content.theReport':'LE RAPPORT',
'content.keepRunning':'GARDEZ CE SITE EN VIE - NOURRITURE + FOURNITURES',
'content.cmTitle':'CONTRE-MESURES','content.cmSubtitle':'OUTILS DE CONFIDENTIALIT\u00c9 ET TONS CURATIFS',
'map.bySection':'PAR SECTION','map.byType':'PAR TYPE','map.mapStyle':'STYLE DE CARTE',
'map.dataLayers':'COUCHES DE DONN\u00c9ES ET FLUX EN DIRECT','map.toolkit':'BO\u00ceTE \u00c0 OUTILS ET RESSOURCES',
'map.allSections':'Toutes les sections','map.allTypes':'Tous les types',
'map.dark':'Sombre','map.satellite':'Satellite','map.terrain':'Terrain','map.street':'Rue',
'map.connectionLines':'Lignes de connexion','map.tunnelPaths':'Chemins de tunnels',
'map.quakes':'S\u00e9ismes USGS','map.nasaEvents':'\u00c9v\u00e9nements NASA','map.fires':'Foyers d\u2019incendie NASA',
'map.aircraft':'A\u00e9ronefs en direct','map.iss':'Suivi ISS','map.disasters':'Catastrophes GDACS',
'map.timeline':'Chronologie de corr\u00e9lation',
'map.searchConn':'RECHERCHER CONNEXIONS','map.proxSearch':'RECHERCHE DE PROXIMIT\u00c9','map.find':'TROUVER',
'map.researcherTools':'OUTILS DE CHERCHEUR',
'map.exportJson':'EXPORTER DONN\u00c9ES JSON','map.downloadBackup':'T\u00c9L\u00c9CHARGER SAUVEGARDE OFFLINE (ZIP)',
'map.sourceMethods':'MÉTHODOLOGIE DES SOURCES',
'report.expandAll':'TOUT DÉVELOPPER',
'report.collapseAll':'TOUT RÉDUIRE',
'report.aiVirus':'RAPPORT VIRUS IA',
'report.sect.I':'I. Objectif et Cadre','report.sect.VII':'VII. Architecture de Contr\u00f4le','report.sect.VIII':'VIII. Seuil de 51%','report.sect.IX':'IX. Souterrain / D.U.M.B.','report.sect.X':'X. Surveillance et Technologie','report.sect.XI':'XI. Le Mod\u00e8le "Nouveau"','report.sect.XII':'XII. Enclaves','report.sect.XIII':'XIII. Sch\u00e9mas Cycliques','report.sect.XIV':'XIV. Syst\u00e8mes d\'Esclavage','report.sect.XV':'XV. Conflits','report.sect.XVI':'XVI. Sch\u00e9mas FOIA','report.sect.XVII':'XVII. Crime Organis\u00e9','report.sect.XIX':'XIX. Index de R\u00e9f\u00e9rence Crois\u00e9e','report.sect.XX':'XX. Index de Calibration','report.sect.XXIII':'XXIII. R\u00e9clamation Spirituelle','report.sect.XXIV':'XXIV. Le Signal',
'report.h.I':'I. Objectif et Cadre',
'report.h.VII':'VII. L’Architecture de Contrôle – Structures de Domination à Long Terme',
'report.h.VIII':'VIII. Le Seuil de 51% – Nash, Bitcoin et la Gouvernance comme Théorie des Réseaux',
'report.h.IX':'IX. Infrastructure Souterraine – Sites D.U.M.B. et Géographie Parallèle',
'report.h.X':'X. La Technologie comme Contrôle – Villes de Surveillance et Gestion de Population',
'report.h.XI':'XI. Le Modèle “Nouveau” – Sites Mondiaux de Réplication et de Remplacement',
'report.h.XII':'XII. Enclaves de Milliardaires – Îles Fortifiées d’Extraction',
'report.h.XIII':'XIII. Schémas Cycliques – Preuves du Contrôle Civilisationnel Répétitif',
'report.h.XIV':'XIV. Systèmes d’Esclavage Animal et Humain – La Chaîne Ininterrompue',
'report.h.XV':'XV. Conflits Mondiaux Actifs – La Carte Sous la Carte',
'report.h.XVI':'XVI. Schémas FOIA – Ce que Révèle le Dossier Déclassifié',
'report.h.XVII':'XVII. Crime Organisé comme Infrastructure – Le Nexus Cartel-Renseignement-Banque',
'report.h.XIX':'XIX. Index de Référence Croisée',
'report.h.XX':'XX. Index de Calibration – Individus à Haute Connectivité',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Réclamation Spirituelle – La Contre-Architecture',
'report.h.XXIV':'XXIV. Envoyer le Signal – Contact et Assistance Maximale',
'map.markerColors':'COULEURS DES MARQUEURS'
},
// --------------- ARABIC ---------------
ar:{
'nav.report':'\u062A\u0642\u0631\u064A\u0631','nav.map':'\u062E\u0631\u064A\u0637\u0629 OSINT','nav.home':'\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629','nav.tools':'\u0623\u062F\u0648\u0627\u062A',
'nav.shield':'\u062F\u0631\u0639 ARC','nav.guide':'\u062F\u0644\u064A\u0644 \u0645\u064A\u062F\u0627\u0646\u064A','nav.backup':'\u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629','nav.logout':'\u062E\u0631\u0648\u062C','nav.updated':'آخر تحديث',
'drawer.title':'\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0645\u0636\u0627\u062F\u0629','drawer.shield':'\u062F\u0631\u0639','drawer.tones':'\u0646\u063A\u0645\u0627\u062A','drawer.protect':'\u062D\u0645\u0627\u064A\u0629','drawer.lab':'\u0645\u062E\u062A\u0628\u0631',
'panel.ultrasonic':'\u062F\u0631\u0639 \u0641\u0648\u0642 \u0635\u0648\u062A\u064A','panel.webrtc':'\u062D\u0638\u0631 \u062A\u0633\u0631\u0628\u0627\u062A WebRTC','panel.canvas':'\u062D\u0627\u0631\u0633 \u0628\u0635\u0645\u0629 Canvas',
'panel.healing':'\u0646\u063A\u0645\u0627\u062A \u0627\u0644\u0634\u0641\u0627\u0621','panel.protective':'\u0646\u063A\u0645\u0627\u062A \u0627\u0644\u062D\u0645\u0627\u064A\u0629','panel.arc':'\u062F\u0631\u0639 ARC','panel.tonelab':'\u0645\u062E\u062A\u0628\u0631 \u0627\u0644\u0646\u063A\u0645\u0627\u062A',
'info.ultrasonic':'\u0645\u062D\u0633\u0651\u0646 \u0644\u0643\u0648\u0643\u0628 \u0627\u0644\u0645\u0627\u0621 - \u0645\u0633\u062D \u062A\u0631\u062F\u062F\u064A \u0645\u062A\u0643\u064A\u0641 \u0645\u0639 \u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u0639\u0628\u0631 20\u201322 \u0643\u064A\u0644\u0648\u0647\u0631\u062A\u0632. \u064A\u0634\u0648\u0634 \u0639\u0644\u0649 \u0645\u0646\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062A\u0628\u0639 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0635\u0648\u062A\u064A\u0629. \u0622\u0645\u0646 \u0644\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A: \u0641\u0648\u0642 20 \u0643\u064A\u0644\u0648\u0647\u0631\u062A\u0632 \u0639\u0646\u062F -60 \u062F\u064A\u0633\u064A\u0628\u0644.',
'info.webrtc':'\u064A\u0645\u0646\u0639 WebRTC \u0645\u0646 \u0643\u0634\u0641 \u0639\u0646\u0627\u0648\u064A\u0646 IP \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629 \u0639\u0628\u0631 \u0637\u0644\u0628\u0627\u062A STUN/TURN.',
'info.canvas':'\u064A\u062D\u0642\u0646 \u0636\u0648\u0636\u0627\u0621 \u063A\u064A\u0631 \u0645\u062D\u0633\u0648\u0633\u0629 \u0641\u064A \u0639\u0645\u0644\u064A\u0627\u062A \u0642\u0631\u0627\u0621\u0629 canvas\u060C \u0645\u0645\u0627 \u064A\u0647\u0632\u0645 \u0628\u0635\u0645\u0629 canvas.',
'info.healing':'\u062A\u0631\u062F\u062F\u0627\u062A \u0633\u0648\u0644\u0641\u064A\u062C\u064A\u0648 \u0645\u0639 \u0631\u0646\u064A\u0646 \u062A\u062D\u062A \u062A\u0648\u0627\u0641\u0642\u064A \u0644\u0645\u064A\u0627\u0647 \u0627\u0644\u062C\u0633\u0645. \u0622\u0645\u0646 \u0644\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A: 174\u2013963 \u0647\u0631\u062A\u0632 \u0628\u0635\u0648\u062A \u0644\u0637\u064A\u0641.',
'info.protective':'7.83 \u0647\u0631\u062A\u0632 \u0634\u0648\u0645\u0627\u0646 \u0647\u0648 \u0646\u0628\u0636 \u0627\u0644\u0642\u0644\u0628 \u0627\u0644\u0643\u0647\u0631\u0648\u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A \u0644\u0644\u0623\u0631\u0636. \u0627\u0633\u062A\u062E\u062F\u0645 \u0633\u0645\u0627\u0639\u0627\u062A \u0627\u0644\u0631\u0623\u0633 \u0644\u0644\u062A\u0632\u0627\u0645\u0646 \u062B\u0646\u0627\u0626\u064A \u0627\u0644\u0623\u0630\u0646. \u0622\u0645\u0646 \u0644\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A.',
'info.arc':'\u0643\u0634\u0641 LRAD\u060C \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0648\u0631\u060C \u062A\u0631\u062F\u062F \u0645\u0636\u0627\u062F. \u064A\u062A\u0637\u0644\u0628 \u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0646.',
'status.active':'\u0646\u0634\u0637','status.inactive':'\u063A\u064A\u0631 \u0646\u0634\u0637','status.lastUpdated':'\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B','status.status':'\u0627\u0644\u062D\u0627\u0644\u0629',
'action.activate':'\u062A\u0641\u0639\u064A\u0644 \u0643\u0634\u0641 \u0627\u0644\u062A\u0647\u062F\u064A\u062F\u0627\u062A','action.stopAll':'\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0643\u0644',
'action.copy':'\u0646\u0633\u062E','action.copied':'\u062A\u0645 \u0627\u0644\u0646\u0633\u062E','action.search':'\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u0642\u0639...',
'action.reset':'\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646','action.filters':'\u0645\u0631\u0634\u062D\u0627\u062A','action.fullShield':'\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0643\u0627\u0645\u0644','action.openToneLab':'\u0641\u062A\u062D \u0627\u0644\u0645\u062E\u062A\u0628\u0631 \u0627\u0644\u0643\u0627\u0645\u0644',
'dl.title':'\u062A\u062D\u0645\u064A\u0644 / \u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A','dl.info':'\u062A\u062B\u0628\u064A\u062A \u0639\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629. \u062A\u062D\u0645\u064A\u0644 HTML \u0639\u0644\u0649 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631. \u0628\u062F\u0648\u0646 \u0627\u0639\u062A\u0645\u0627\u062F\u064A\u0627\u062A.',
'dl.multipack':'\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062D\u0632\u0645\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629','dl.tonelab':'\u062A\u062B\u0628\u064A\u062A \u0645\u062E\u062A\u0628\u0631 \u0627\u0644\u0646\u063A\u0645\u0627\u062A',
'dl.healing':'\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0634\u0641\u0627\u0621','dl.protective':'\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062D\u0645\u0627\u064A\u0629','dl.downloadHtml':'\u062A\u062D\u0645\u064A\u0644 .HTML',
'dl.embedTitle':'\u062A\u062B\u0628\u064A\u062A \u0639\u0644\u0649 \u0645\u0648\u0642\u0639\u0643','dl.embedInfo':'\u0627\u0646\u0633\u062E \u0627\u0644\u0643\u0648\u062F \u0644\u0625\u0636\u0627\u0641\u0629 \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0646\u063A\u0645\u0627\u062A \u0625\u0644\u0649 \u0623\u064A \u0645\u0648\u0642\u0639.',
'freq.painRelief':'\u062A\u062E\u0641\u064A\u0641 \u0627\u0644\u0623\u0644\u0645','freq.tissueHealing':'\u0634\u0641\u0627\u0621 \u0627\u0644\u0623\u0646\u0633\u062C\u0629','freq.liberation':'\u062A\u062D\u0631\u064A\u0631',
'freq.change':'\u062A\u063A\u064A\u064A\u0631','freq.naturalCalm':'\u0647\u062F\u0648\u0621 \u0637\u0628\u064A\u0639\u064A','freq.loveDna':'\u062D\u0628 / \u0625\u0635\u0644\u0627\u062D DNA',
'freq.connection':'\u0627\u062A\u0635\u0627\u0644','freq.intuition':'\u062D\u062F\u0633','freq.spiritual':'\u0631\u0648\u062D\u0627\u0646\u064A','freq.higherSelf':'\u0627\u0644\u0630\u0627\u062A \u0627\u0644\u0639\u0644\u064A\u0627',
'prot.schumann':'\u0631\u0646\u064A\u0646 \u0634\u0648\u0645\u0627\u0646','prot.alpha':'\u0623\u0644\u0641\u0627 - \u0647\u062F\u0648\u0621 \u064A\u0642\u0638','prot.beta':'\u0628\u064A\u062A\u0627 - \u062A\u0631\u0643\u064A\u0632',
'prot.gamma':'\u063A\u0627\u0645\u0627 - \u0625\u062F\u0631\u0627\u0643','prot.pink':'\u0636\u0648\u0636\u0627\u0621 \u0648\u0631\u062F\u064A\u0629 - \u062A\u0645\u0648\u064A\u0647','prot.brown':'\u0636\u0648\u0636\u0627\u0621 \u0628\u0646\u064A\u0629 - \u063A\u0637\u0627\u0621 \u0639\u0645\u064A\u0642',
'prot.ocean':'\u0623\u0645\u0648\u0627\u062C \u0627\u0644\u0645\u062D\u064A\u0637 - \u0635\u0648\u062A \u0627\u0644\u0643\u0648\u0643\u0628',
'tl.pain':'\u0623\u0644\u0645','tl.free':'\u062D\u0631','tl.calm':'\u0647\u062F\u0648\u0621','tl.love':'\u062D\u0628',
'tl.bond':'\u0631\u0627\u0628\u0637\u0629','tl.intuit':'\u062D\u062F\u0633','tl.spirit':'\u0631\u0648\u062D','tl.crown':'\u062A\u0627\u062C',
'content.livingDoc':'\u0648\u062B\u064A\u0642\u0629 \u062D\u064A\u0629','content.theReport':'\u0627\u0644\u062A\u0642\u0631\u064A\u0631',
'content.keepRunning':'\u0623\u0628\u0642\u0650 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0627\u0645\u0644\u0627\u064B - \u0637\u0639\u0627\u0645 + \u0625\u0645\u062F\u0627\u062F\u0627\u062A',
'map.bySection':'\u062D\u0633\u0628 \u0627\u0644\u0642\u0633\u0645','map.byType':'\u062D\u0633\u0628 \u0627\u0644\u0646\u0648\u0639',
'map.allSections':'\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0645','map.allTypes':'\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0646\u0648\u0627\u0639',
'report.expandAll':'\u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0643\u0644','report.collapseAll':'\u0637\u064A \u0627\u0644\u0643\u0644',
'report.aiVirus':'\u062A\u0642\u0631\u064A\u0631 \u0641\u064A\u0631\u0648\u0633 \u0627\u0644\u0630\u0643\u0627\u0621',
'report.sect.I':'I. \u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0625\u0637\u0627\u0631','report.sect.VII':'VII. \u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u062A\u062D\u0643\u0645','report.sect.VIII':'VIII. \u0639\u062A\u0628\u0629 51%','report.sect.IX':'IX. \u062A\u062D\u062A \u0627\u0644\u0623\u0631\u0636 / D.U.M.B.','report.sect.X':'X. \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627','report.sect.XI':'XI. \u0627\u0644\u0646\u0645\u0637 \u0627\u0644\u062C\u062F\u064A\u062F','report.sect.XII':'XII. \u0627\u0644\u062C\u064A\u0648\u0628','report.sect.XIII':'XIII. \u0627\u0644\u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u062F\u0648\u0631\u064A\u0629','report.sect.XIV':'XIV. \u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0639\u0628\u0648\u062F\u064A\u0629','report.sect.XV':'XV. \u0627\u0644\u0646\u0632\u0627\u0639\u0627\u062A','report.sect.XVI':'XVI. \u0623\u0646\u0645\u0627\u0637 FOIA','report.sect.XVII':'XVII. \u0627\u0644\u062C\u0631\u064A\u0645\u0629 \u0627\u0644\u0645\u0646\u0638\u0645\u0629','report.sect.XIX':'XIX. \u0641\u0647\u0631\u0633 \u0627\u0644\u0645\u0631\u0627\u062C\u0639 \u0627\u0644\u0645\u062A\u0642\u0627\u0637\u0639\u0629','report.sect.XX':'XX. \u0641\u0647\u0631\u0633 \u0627\u0644\u0645\u0639\u0627\u064A\u0631\u0629','report.sect.XXIII':'XXIII. \u0627\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0631\u0648\u062D\u064A','report.sect.XXIV':'XXIV. \u0627\u0644\u0625\u0634\u0627\u0631\u0629',
'report.h.I':'I. الغرض والإطار',
'report.h.VII':'VII. هندسة التحكم – هياكل السيطرة طويلة الأمد',
'report.h.VIII':'VIII. عتبة 51% – ناش، بيتكوين، والحوكمة كنظرية الشبكات',
'report.h.IX':'IX. البنية التحتية تحت الأرض – مواقع D.U.M.B. والجغرافيا الموازية',
'report.h.X':'X. التكنولوجيا كأداة تحكم – مدن المراقبة وإدارة السكان',
'report.h.XI':'XI. النمط “الجديد” – مواقع عالمية للتكرار والاستبدال',
'report.h.XII':'XII. جيوب المليارديرات – جزر محصنة للاستخراج',
'report.h.XIII':'XIII. الأنماط الدورية – أدلة على السيطرة الحضارية المتكررة',
'report.h.XIV':'XIV. أنظمة استعباد الحيوان والإنسان – السلسلة التي لم تنكسر',
'report.h.XV':'XV. النزاعات العالمية النشطة – الخريطة تحت الخريطة',
'report.h.XVI':'XVI. أنماط FOIA – ما يكشفه السجل المرفوع عنه السرية',
'report.h.XVII':'XVII. الجريمة المنظمة كبنية تحتية – رابطة الكارتل-الاستخبارات-البنوك',
'report.h.XIX':'XIX. فهرس المراجع المتقاطعة',
'report.h.XX':'XX. فهرس المعايرة – أفراد ذوو اتصال عالٍ',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. الاسترداد الروحي – البنية المضادة',
'report.h.XXIV':'XXIV. إرسال الإشارة – الاتصال والمساعدة القصوى',
'map.markerColors':'\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A'
},
// --------------- CHINESE SIMPLIFIED ---------------
zh:{
'nav.report':'\u62A5\u544A','nav.map':'OSINT\u5730\u56FE','nav.home':'\u9996\u9875','nav.tools':'\u5DE5\u5177',
'nav.shield':'ARC\u9632\u62A4\u76FE','nav.guide':'\u73B0\u573A\u6307\u5357','nav.backup':'\u5907\u4EFD','nav.logout':'\u9000\u51FA','nav.updated':'更新时间',
'drawer.title':'\u5BF9\u6297\u63AA\u65BD','drawer.shield':'\u76FE','drawer.tones':'\u97F3\u8C03','drawer.protect':'\u4FDD\u62A4','drawer.lab':'\u5B9E\u9A8C\u5BA4',
'panel.ultrasonic':'\u8D85\u58F0\u6CE2\u9632\u62A4\u76FE','panel.webrtc':'WebRTC\u6CC4\u6F0F\u62E6\u622A','panel.canvas':'Canvas\u6307\u7EB9\u9632\u62A4',
'panel.healing':'\u6CBB\u6108\u97F3\u8C03','panel.protective':'\u4FDD\u62A4\u97F3\u8C03','panel.arc':'ARC\u76FE','panel.tonelab':'\u97F3\u8C03\u5B9E\u9A8C\u5BA4',
'info.ultrasonic':'\u6C34\u884C\u661F\u4F18\u5316 - \u81EA\u9002\u5E94\u6E7F\u5EA6\u768420-22kHz\u9891\u7387\u626B\u63CF\u3002\u5E72\u6270\u8DE8\u8BBE\u5907\u8FFD\u8E2A\u4FE1\u6807\u548C\u58F0\u5B66\u6570\u636E\u7A83\u53D6\u3002\u52A8\u7269\u5B89\u5168\uFF1A20kHz\u4EE5\u4E0A\uFF0C-60dB\u3002',
'info.webrtc':'\u9632\u6B62WebRTC\u901A\u8FC7STUN/TURN\u8BF7\u6C42\u66B4\u9732\u60A8\u7684\u771F\u5B9EIP\u5730\u5740\u3002',
'info.canvas':'\u5728Canvas\u56DE\u8BFB\u64CD\u4F5C\u4E2D\u6CE8\u5165\u4E0D\u53EF\u611F\u77E5\u7684\u566A\u58F0\uFF0C\u51FB\u8D25Canvas\u6307\u7EB9\u8BC6\u522B\u3002',
'info.healing':'\u7D22\u5C14\u8D39\u5409\u5965\u9891\u7387\u4E0E\u4E9A\u8C10\u6CE2\u4F53\u5185\u6C34\u5171\u632F\u3002\u52A8\u7269\u5B89\u5168\uFF1A174\u2013963 Hz\uFF0C\u6E29\u548C\u97F3\u91CF\u3002',
'info.protective':'7.83 Hz\u8212\u66FC\u662F\u5730\u7403\u7684\u7535\u78C1\u5FC3\u8DF3\u3002\u4F7F\u7528\u8033\u673A\u8FDB\u884C\u53CC\u8033\u5939\u5E26\u3002\u52A8\u7269\u5B89\u5168\u3002',
'info.arc':'LRAD\u68C0\u6D4B\u3001\u76F8\u4F4D\u6D88\u9664\u3001\u53CD\u9891\u7387\u3002\u9700\u8981\u9EA6\u514B\u98CE\u3002',
'status.active':'\u6D3B\u8DC3','status.inactive':'\u672A\u6FC0\u6D3B','status.lastUpdated':'\u6700\u540E\u66F4\u65B0','status.status':'\u72B6\u6001',
'action.activate':'\u6FC0\u6D3B\u5A01\u80C1\u68C0\u6D4B','action.stopAll':'\u5168\u90E8\u505C\u6B62',
'action.copy':'\u590D\u5236','action.copied':'\u5DF2\u590D\u5236','action.search':'\u641C\u7D22\u4F4D\u7F6E...',
'action.reset':'\u91CD\u7F6E','action.filters':'\u8FC7\u6EE4\u5668','action.fullShield':'\u5B8C\u6574\u76FE','action.openToneLab':'\u6253\u5F00\u5B8C\u6574\u5B9E\u9A8C\u5BA4',
'dl.title':'\u4E0B\u8F7D / \u5B89\u88C5\u5E94\u7528','dl.info':'\u5728\u624B\u673A\u4E0A\u5B89\u88C5\u5230\u4E3B\u5C4F\u5E55\u3002\u5728\u684C\u9762\u4E0B\u8F7DHTML\u3002\u96F6\u4F9D\u8D56\u3002',
'dl.multipack':'\u5B89\u88C5\u5168\u5957\u5305','dl.tonelab':'\u5B89\u88C5\u97F3\u8C03\u5B9E\u9A8C\u5BA4',
'dl.healing':'\u5B89\u88C5\u6CBB\u6108','dl.protective':'\u5B89\u88C5\u4FDD\u62A4','dl.downloadHtml':'\u4E0B\u8F7D .HTML',
'dl.embedTitle':'\u5B89\u88C5\u5230\u60A8\u7684\u7F51\u7AD9','dl.embedInfo':'\u590D\u5236\u5D4C\u5165\u4EE3\u7801\u5C06\u97F3\u8C03\u5DE5\u5177\u6DFB\u52A0\u5230\u4EFB\u4F55\u7F51\u7AD9\u3002',
'freq.painRelief':'\u6B62\u75DB','freq.tissueHealing':'\u7EC4\u7EC7\u6108\u5408','freq.liberation':'\u91CA\u653E',
'freq.change':'\u53D8\u5316','freq.naturalCalm':'\u81EA\u7136\u5E73\u9759','freq.loveDna':'\u7231 / DNA\u4FEE\u590D',
'freq.connection':'\u8FDE\u63A5','freq.intuition':'\u76F4\u89C9','freq.spiritual':'\u7075\u6027','freq.higherSelf':'\u9AD8\u6211',
'prot.schumann':'\u8212\u66FC\u5171\u632F','prot.alpha':'\u963F\u5C14\u6CD5 - \u5E73\u9759\u8B66\u89C9','prot.beta':'\u8D1D\u5854 - \u4E13\u6CE8',
'prot.gamma':'\u4F3D\u9A6C - \u611F\u77E5','prot.pink':'\u7C89\u7EA2\u566A\u58F0 - \u63A9\u84FD','prot.brown':'\u68D5\u8272\u566A\u58F0 - \u6DF1\u5EA6\u8986\u76D6',
'prot.ocean':'\u6D77\u6D6A - \u661F\u7403\u4E4B\u58F0',
'tl.pain':'\u75DB','tl.free':'\u91CA','tl.calm':'\u9759','tl.love':'\u7231',
'tl.bond':'\u7EBD','tl.intuit':'\u89C9','tl.spirit':'\u7075','tl.crown':'\u51A0',
'content.livingDoc':'\u6D3B\u6587\u6863','content.theReport':'\u62A5\u544A',
'content.keepRunning':'\u7EF4\u6301\u8FD0\u884C - \u98DF\u7269 + \u7269\u8D44',
'map.bySection':'\u6309\u7AE0\u8282','map.byType':'\u6309\u7C7B\u578B',
'map.allSections':'\u6240\u6709\u7AE0\u8282','map.allTypes':'\u6240\u6709\u7C7B\u578B',
'report.expandAll':'\u5C55\u5F00\u5168\u90E8','report.collapseAll':'\u6298\u53E0\u5168\u90E8',
'report.aiVirus':'AI\u75C5\u6BD2\u62A5\u544A',
'report.sect.I':'I. \u76EE\u7684\u4E0E\u6846\u67B6','report.sect.VII':'VII. \u63A7\u5236\u67B6\u6784','report.sect.VIII':'VIII. 51%\u95E8\u69DB','report.sect.IX':'IX. \u5730\u4E0B / D.U.M.B.','report.sect.X':'X. \u76D1\u63A7\u4E0E\u6280\u672F','report.sect.XI':'XI. \u201C\u65B0\u201D\u6A21\u5F0F','report.sect.XII':'XII. \u98DE\u5730','report.sect.XIII':'XIII. \u5468\u671F\u6A21\u5F0F','report.sect.XIV':'XIV. \u5974\u5F79\u5236\u5EA6','report.sect.XV':'XV. \u51B2\u7A81','report.sect.XVI':'XVI. FOIA\u6A21\u5F0F','report.sect.XVII':'XVII. \u6709\u7EC4\u7EC7\u72AF\u7F6A','report.sect.XIX':'XIX. \u4EA4\u53C9\u53C2\u8003\u7D22\u5F15','report.sect.XX':'XX. \u6821\u51C6\u7D22\u5F15','report.sect.XXIII':'XXIII. \u7075\u6027\u6536\u590D','report.sect.XXIV':'XXIV. \u4FE1\u53F7',
'report.h.I':'I. 目的与框架',
'report.h.VII':'VII. 控制架构 – 长期主导的结构',
'report.h.VIII':'VIII. 51%门槛 – 纳什、比特币与网络理论治理',
'report.h.IX':'IX. 地下基础设施 – D.U.M.B.站点与平行地理',
'report.h.X':'X. 技术即控制 – 监控城市与人口管理',
'report.h.XI':'XI. “新”模式 – 全球复制与替代站点',
'report.h.XII':'XII. 亿万富翁飞地 – 强化的提取岛屿',
'report.h.XIII':'XIII. 周期模式 – 反复文明控制的证据',
'report.h.XIV':'XIV. 动物与人类奴役系统 – 不断的链条',
'report.h.XV':'XV. 活跃的全球冲突 – 地图下的地图',
'report.h.XVI':'XVI. FOIA模式 – 解密记录揭示的内容',
'report.h.XVII':'XVII. 有组织犯罪作为基础设施 – 卡特尔-情报-银行联系',
'report.h.XIX':'XIX. 交叉参考索引',
'report.h.XX':'XX. 校准索引 – 高连接性个人',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. 灵性收复 – 反架构',
'report.h.XXIV':'XXIV. 发送信号 – 联系与最大援助',
'map.markerColors':'\u6807\u8BB0\u989C\u8272'
},
// --------------- PORTUGUESE ---------------
pt:{
'nav.report':'RELAT\u00d3RIO','nav.map':'MAPA OSINT','nav.home':'IN\u00cdCIO','nav.tools':'FERRAMENTAS',
'nav.shield':'ESCUDO ARC','nav.guide':'GUIA DE CAMPO','nav.backup':'BACKUP','nav.logout':'SAIR','nav.updated':'ATUALIZADO',
'drawer.title':'CONTRAMEDIDAS','drawer.shield':'ESCUDO','drawer.tones':'TONS','drawer.protect':'PROTE\u00c7\u00c3O','drawer.lab':'LAB',
'panel.ultrasonic':'ESCUDO ULTRAS\u00d4NICO','panel.webrtc':'BLOQUEIO VAZAMENTOS WebRTC','panel.canvas':'GUARDA IMPRESS\u00c3O DIGITAL CANVAS',
'panel.healing':'TONS CURATIVOS','panel.protective':'TONS PROTETORES','panel.arc':'ESCUDO ARC','panel.tonelab':'LABORAT\u00d3RIO DE TONS',
'info.ultrasonic':'OTIMIZADO PARA PLANETA \u00c1GUA - Varredura de frequ\u00eancia adapt\u00e1vel \u00e0 umidade em 20\u201322kHz. Bloqueia beacons de rastreamento e exfiltra\u00e7\u00e3o ac\u00fastica. SEGURO PARA ANIMAIS: acima de 20kHz a -60dB.',
'info.webrtc':'Previne que o WebRTC exponha seus endere\u00e7os IP reais atrav\u00e9s de solicita\u00e7\u00f5es STUN/TURN.',
'info.canvas':'Injeta ru\u00eddo impercept\u00edvel nas opera\u00e7\u00f5es de leitura canvas, derrotando a impress\u00e3o digital canvas.',
'info.healing':'Frequ\u00eancias Solfeggio com resson\u00e2ncia sub-harm\u00f4nica da \u00e1gua corporal. SEGURO PARA ANIMAIS: 174\u2013963 Hz em volume suave.',
'info.protective':'7.83 Hz Schumann \u00e9 o batimento eletromagn\u00e9tico da Terra. Use fones para sincroniza\u00e7\u00e3o binaural. SEGURO PARA ANIMAIS.',
'info.arc':'Detec\u00e7\u00e3o LRAD, cancelamento de fase, contra-frequ\u00eancia. Requer microfone.',
'status.active':'ATIVO','status.inactive':'INATIVO','status.lastUpdated':'\u00daLTIMA ATUALIZA\u00c7\u00c3O','status.status':'ESTADO',
'action.activate':'ATIVAR DETEC\u00c7\u00c3O DE AMEA\u00c7AS','action.stopAll':'PARAR TUDO',
'action.copy':'COPIAR','action.copied':'COPIADO','action.search':'Pesquisar locais...',
'action.reset':'REDEFINIR','action.filters':'FILTROS','action.fullShield':'ESCUDO COMPLETO','action.openToneLab':'ABRIR LABORAT\u00d3RIO COMPLETO',
'dl.title':'BAIXAR / INSTALAR APPS','dl.info':'Instalar na tela inicial no celular. Baixar HTML no desktop. Zero depend\u00eancias.',
'dl.multipack':'INSTALAR PACOTE COMPLETO','dl.tonelab':'INSTALAR LAB DE TONS',
'dl.healing':'INSTALAR CURATIVOS','dl.protective':'INSTALAR PROTETORES','dl.downloadHtml':'BAIXAR .HTML',
'dl.embedTitle':'INSTALAR NO SEU SITE','dl.embedInfo':'Copiar c\u00f3digo para adicionar ferramentas de tons a qualquer site.',
'freq.painRelief':'Al\u00edvio da Dor','freq.tissueHealing':'Cura de Tecidos','freq.liberation':'Liberta\u00e7\u00e3o',
'freq.change':'Mudan\u00e7a','freq.naturalCalm':'Calma Natural','freq.loveDna':'Amor / Repara\u00e7\u00e3o DNA',
'freq.connection':'Conex\u00e3o','freq.intuition':'Intui\u00e7\u00e3o','freq.spiritual':'Espiritual','freq.higherSelf':'Eu Superior',
'prot.schumann':'Resson\u00e2ncia Schumann','prot.alpha':'Alfa - Calma Alerta','prot.beta':'Beta - Foco',
'prot.gamma':'Gama - Percep\u00e7\u00e3o','prot.pink':'Ru\u00eddo Rosa - Mascaramento','prot.brown':'Ru\u00eddo Marrom - Cobertura',
'prot.ocean':'Ondas do Oceano - Som do Planeta',
'tl.pain':'Dor','tl.free':'Livre','tl.calm':'Calma','tl.love':'Amor',
'tl.bond':'V\u00ednculo','tl.intuit':'Intuir','tl.spirit':'Esp\u00edrito','tl.crown':'Coroa',
'content.livingDoc':'documento vivo','content.theReport':'O RELAT\u00d3RIO',
'content.keepRunning':'MANTENHA ESTE SITE - COMIDA + SUPRIMENTOS',
'map.bySection':'POR SE\u00c7\u00c3O','map.byType':'POR TIPO',
'map.allSections':'Todas as Se\u00e7\u00f5es','map.allTypes':'Todos os Tipos',
'report.expandAll':'EXPANDIR TUDO','report.collapseAll':'RECOLHER TUDO',
'report.aiVirus':'RELAT\u00D3RIO V\u00CDRUS IA',
'report.sect.I':'I. Prop\u00f3sito e Estrutura','report.sect.VII':'VII. Arquitetura de Controle','report.sect.VIII':'VIII. Limiar de 51%','report.sect.IX':'IX. Subterr\u00e2neo / D.U.M.B.','report.sect.X':'X. Vigil\u00e2ncia e Tecnologia','report.sect.XI':'XI. O Padr\u00e3o "Novo"','report.sect.XII':'XII. Enclaves','report.sect.XIII':'XIII. Padr\u00f5es C\u00edclicos','report.sect.XIV':'XIV. Sistemas de Escravid\u00e3o','report.sect.XV':'XV. Conflitos','report.sect.XVI':'XVI. Padr\u00f5es FOIA','report.sect.XVII':'XVII. Crime Organizado','report.sect.XIX':'XIX. \u00cdndice de Refer\u00eancia Cruzada','report.sect.XX':'XX. \u00cdndice de Calibra\u00e7\u00e3o','report.sect.XXIII':'XXIII. Reclama\u00e7\u00e3o Espiritual','report.sect.XXIV':'XXIV. O Sinal',
'report.h.I':'I. Propósito e Estrutura',
'report.h.VII':'VII. A Arquitetura de Controle – Estruturas de Domínio a Longo Prazo',
'report.h.VIII':'VIII. O Limiar de 51% – Nash, Bitcoin e Governança como Teoria de Redes',
'report.h.IX':'IX. Infraestrutura Subterrânea – Sites D.U.M.B. e Geografia Paralela',
'report.h.X':'X. Tecnologia como Controle – Cidades de Vigilância e Gestão Populacional',
'report.h.XI':'XI. O Padrão “Novo” – Sites Globais de Replicação e Substituição',
'report.h.XII':'XII. Enclaves de Bilionários – Ilhas Fortificadas de Extração',
'report.h.XIII':'XIII. Padrões Cíclicos – Evidência de Controle Civilizacional Repetitivo',
'report.h.XIV':'XIV. Sistemas de Escravidão Animal e Humana – A Corrente Inquebrável',
'report.h.XV':'XV. Conflitos Globais Ativos – O Mapa Sob o Mapa',
'report.h.XVI':'XVI. Padrões FOIA – O que o Registro Desclassificado Revela',
'report.h.XVII':'XVII. Crime Organizado como Infraestrutura – O Nexo Cartel-Inteligência-Banco',
'report.h.XIX':'XIX. Índice de Referência Cruzada',
'report.h.XX':'XX. Índice de Calibração – Indivíduos de Alta Conectividade',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Reclamação Espiritual – A Contra-Arquitetura',
'report.h.XXIV':'XXIV. Enviando o Sinal – Contato e Assistência Máxima',
'map.markerColors':'CORES DOS MARCADORES'
},
// --------------- RUSSIAN ---------------
ru:{
'nav.report':'\u041E\u0422\u0427\u0401\u0422','nav.map':'\u041A\u0410\u0420\u0422\u0410 OSINT','nav.home':'\u0413\u041B\u0410\u0412\u041D\u0410\u042F','nav.tools':'\u0418\u041D\u0421\u0422\u0420\u0423\u041C\u0415\u041D\u0422\u042B',
'nav.shield':'\u0429\u0418\u0422 ARC','nav.guide':'\u0420\u0423\u041A\u041E\u0412\u041E\u0414\u0421\u0422\u0412\u041E','nav.backup':'\u0420\u0415\u0417\u0415\u0420\u0412\u041D\u0410\u042F \u041A\u041E\u041F\u0418\u042F','nav.logout':'\u0412\u042B\u0425\u041E\u0414','nav.updated':'ОБНОВЛЕНО',
'drawer.title':'\u041A\u041E\u041D\u0422\u0420\u041C\u0415\u0420\u042B','drawer.shield':'\u0429\u0418\u0422','drawer.tones':'\u0422\u041E\u041D\u0410','drawer.protect':'\u0417\u0410\u0429\u0418\u0422\u0410','drawer.lab':'\u041B\u0410\u0411',
'panel.ultrasonic':'\u0423\u041B\u042C\u0422\u0420\u0410\u0417\u0412\u0423\u041A\u041E\u0412\u041E\u0419 \u0429\u0418\u0422','panel.webrtc':'\u0411\u041B\u041E\u041A\u0418\u0420\u041E\u0412\u041A\u0410 \u0423\u0422\u0415\u0427\u0415\u041A WebRTC',
'panel.canvas':'\u0417\u0410\u0429\u0418\u0422\u0410 \u041E\u0422\u041F\u0415\u0427\u0410\u0422\u041A\u0410 CANVAS',
'panel.healing':'\u0426\u0415\u041B\u0418\u0422\u0415\u041B\u042C\u041D\u042B\u0415 \u0422\u041E\u041D\u0410','panel.protective':'\u0417\u0410\u0429\u0418\u0422\u041D\u042B\u0415 \u0422\u041E\u041D\u0410',
'panel.arc':'\u0429\u0418\u0422 ARC','panel.tonelab':'\u041B\u0410\u0411\u041E\u0420\u0410\u0422\u041E\u0420\u0418\u042F \u0422\u041E\u041D\u041E\u0412',
'status.active':'\u0410\u041A\u0422\u0418\u0412\u041D\u041E','status.inactive':'\u041D\u0415\u0410\u041A\u0422\u0418\u0412\u041D\u041E',
'status.lastUpdated':'\u041F\u041E\u0421\u041B\u0415\u0414\u041D\u0415\u0415 \u041E\u0411\u041D\u041E\u0412\u041B\u0415\u041D\u0418\u0415','status.status':'\u0421\u0422\u0410\u0422\u0423\u0421',
'action.activate':'\u0410\u041A\u0422\u0418\u0412\u0418\u0420\u041E\u0412\u0410\u0422\u042C \u041E\u0411\u041D\u0410\u0420\u0423\u0416\u0415\u041D\u0418\u0415 \u0423\u0413\u0420\u041E\u0417','action.stopAll':'\u041E\u0421\u0422\u0410\u041D\u041E\u0412\u0418\u0422\u042C \u0412\u0421\u0401',
'action.copy':'\u041A\u041E\u041F\u0418\u0420\u041E\u0412\u0410\u0422\u042C','action.copied':'\u0421\u041A\u041E\u041F\u0418\u0420\u041E\u0412\u0410\u041D\u041E',
'action.search':'\u041F\u043E\u0438\u0441\u043A \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0439...',
'action.reset':'\u0421\u0411\u0420\u041E\u0421','action.filters':'\u0424\u0418\u041B\u042C\u0422\u0420\u042B',
'action.fullShield':'\u041F\u041E\u041B\u041D\u042B\u0419 \u0429\u0418\u0422','action.openToneLab':'\u041E\u0422\u041A\u0420\u042B\u0422\u042C \u041F\u041E\u041B\u041D\u0423\u042E \u041B\u0410\u0411\u041E\u0420\u0410\u0422\u041E\u0420\u0418\u042E',
'dl.title':'\u0421\u041A\u0410\u0427\u0410\u0422\u042C / \u0423\u0421\u0422\u0410\u041D\u041E\u0412\u0418\u0422\u042C','dl.info':'\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043D\u0430 \u0434\u043E\u043C\u0430\u0448\u043D\u0438\u0439 \u044D\u043A\u0440\u0430\u043D. \u0421\u043A\u0430\u0447\u0430\u0442\u044C HTML \u043D\u0430 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440. \u0411\u0435\u0437 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0435\u0439.',
'freq.painRelief':'\u041E\u0431\u0435\u0437\u0431\u043E\u043B\u0438\u0432\u0430\u043D\u0438\u0435','freq.tissueHealing':'\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0442\u043A\u0430\u043D\u0435\u0439',
'freq.liberation':'\u041E\u0441\u0432\u043E\u0431\u043E\u0436\u0434\u0435\u043D\u0438\u0435','freq.change':'\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u044B',
'freq.naturalCalm':'\u041F\u0440\u0438\u0440\u043E\u0434\u043D\u043E\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u0435','freq.loveDna':'\u041B\u044E\u0431\u043E\u0432\u044C / \u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0414\u041D\u041A',
'freq.connection':'\u0421\u0432\u044F\u0437\u044C','freq.intuition':'\u0418\u043D\u0442\u0443\u0438\u0446\u0438\u044F',
'freq.spiritual':'\u0414\u0443\u0445\u043E\u0432\u043D\u043E\u0435','freq.higherSelf':'\u0412\u044B\u0441\u0448\u0435\u0435 \u042F',
'prot.schumann':'\u0420\u0435\u0437\u043E\u043D\u0430\u043D\u0441 \u0428\u0443\u043C\u0430\u043D\u0430','prot.alpha':'\u0410\u043B\u044C\u0444\u0430 - \u0421\u043F\u043E\u043A\u043E\u0439\u043D\u0430\u044F \u0431\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C',
'prot.beta':'\u0411\u0435\u0442\u0430 - \u0424\u043E\u043A\u0443\u0441','prot.gamma':'\u0413\u0430\u043C\u043C\u0430 - \u0412\u043E\u0441\u043F\u0440\u0438\u044F\u0442\u0438\u0435',
'prot.pink':'\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u0448\u0443\u043C - \u041C\u0430\u0441\u043A\u0438\u0440\u043E\u0432\u043A\u0430','prot.brown':'\u041A\u043E\u0440\u0438\u0447\u043D\u0435\u0432\u044B\u0439 \u0448\u0443\u043C - \u0413\u043B\u0443\u0431\u043E\u043A\u043E\u0435 \u0443\u043A\u0440\u044B\u0442\u0438\u0435',
'prot.ocean':'\u041E\u043A\u0435\u0430\u043D\u0441\u043A\u0438\u0435 \u0432\u043E\u043B\u043D\u044B - \u0417\u0432\u0443\u043A \u043F\u043B\u0430\u043D\u0435\u0442\u044B',
'tl.pain':'\u0411\u043E\u043B\u044C','tl.free':'\u0421\u0432\u043E\u0431','tl.calm':'\u041F\u043E\u043A\u043E\u0439','tl.love':'\u041B\u044E\u0431\u043E\u0432\u044C',
'tl.bond':'\u0421\u0432\u044F\u0437\u044C','tl.intuit':'\u0418\u043D\u0442\u0443\u0438\u0446','tl.spirit':'\u0414\u0443\u0445','tl.crown':'\u041A\u043E\u0440\u043E\u043D\u0430',
'content.livingDoc':'\u0436\u0438\u0432\u043E\u0439 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442','content.theReport':'\u041E\u0422\u0427\u0401\u0422',
'content.keepRunning':'\u041F\u041E\u0414\u0414\u0415\u0420\u0416\u0418\u0422\u0415 \u042D\u0422\u041E\u0422 \u0421\u0410\u0419\u0422 - \u0415\u0414\u0410 + \u041F\u0420\u0418\u041F\u0410\u0421\u042B',
'report.expandAll':'\u0420\u0410\u0417\u0412\u0415\u0420\u041D\u0423\u0422\u042C \u0412\u0421\u0401','report.collapseAll':'\u0421\u0412\u0415\u0420\u041D\u0423\u0422\u042C \u0412\u0421\u0401',
'report.aiVirus':'\u041E\u0422\u0427\u0401\u0422 \u041E \u0412\u0418\u0420\u0423\u0421\u0415 \u0418\u0418',
'report.sect.I':'I. \u0426\u0435\u043B\u044C \u0438 \u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430','report.sect.VII':'VII. \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430 \u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F','report.sect.VIII':'VIII. \u041F\u043E\u0440\u043E\u0433 51%','report.sect.IX':'IX. \u041F\u043E\u0434\u0437\u0435\u043C\u043D\u044B\u0435 / D.U.M.B.','report.sect.X':'X. \u0421\u043B\u0435\u0436\u043A\u0430 \u0438 \u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438','report.sect.XI':'XI. \u041D\u043E\u0432\u044B\u0439 \u041F\u0430\u0442\u0442\u0435\u0440\u043D','report.sect.XII':'XII. \u0410\u043D\u043A\u043B\u0430\u0432\u044B','report.sect.XIII':'XIII. \u0426\u0438\u043A\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u041F\u0430\u0442\u0442\u0435\u0440\u043D\u044B','report.sect.XIV':'XIV. \u0421\u0438\u0441\u0442\u0435\u043C\u044B \u0420\u0430\u0431\u0441\u0442\u0432\u0430','report.sect.XV':'XV. \u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u044B','report.sect.XVI':'XVI. \u041F\u0430\u0442\u0442\u0435\u0440\u043D\u044B FOIA','report.sect.XVII':'XVII. \u041E\u0440\u0433\u0430\u043D\u0438\u0437\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u041F\u0440\u0435\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C','report.sect.XIX':'XIX. \u041F\u0435\u0440\u0435\u043A\u0440\u0451\u0441\u0442\u043D\u044B\u0439 \u0418\u043D\u0434\u0435\u043A\u0441','report.sect.XX':'XX. \u041A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043E\u0447\u043D\u044B\u0439 \u0418\u043D\u0434\u0435\u043A\u0441','report.sect.XXIII':'XXIII. \u0414\u0443\u0445\u043E\u0432\u043D\u043E\u0435 \u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435','report.sect.XXIV':'XXIV. \u0421\u0438\u0433\u043D\u0430\u043B',
'report.h.I':'I. Цель и Структура',
'report.h.VII':'VII. Архитектура Управления – Структуры Долгосрочного Господства',
'report.h.VIII':'VIII. Порог 51% – Нэш, Биткоин и Управление как Теория Сетей',
'report.h.IX':'IX. Подземная Инфраструктура – Объекты D.U.M.B. и Параллельная География',
'report.h.X':'X. Технология как Контроль – Города Слежки и Управление Населением',
'report.h.XI':'XI. “Новый” Паттерн – Глобальные Объекты Репликации и Замещения',
'report.h.XII':'XII. Анклавы Миллиардеров – Укреплённые Острова Извлечения',
'report.h.XIII':'XIII. Циклические Паттерны – Свидетельства Повторяющегося Цивилизационного Контроля',
'report.h.XIV':'XIV. Системы Рабства Животных и Людей – Непрерывная Цепь',
'report.h.XV':'XV. Активные Глобальные Конфликты – Карта Под Картой',
'report.h.XVI':'XVI. Паттерны FOIA – Что Раскрывают Рассекреченные Записи',
'report.h.XVII':'XVII. Организованная Преступность как Инфраструктура – Связка Картель-Разведка-Банк',
'report.h.XIX':'XIX. Перекрёстный Индекс',
'report.h.XX':'XX. Калибровочный Индекс – Высокосвязанные Индивидуумы',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Духовное Восстановление – Контр-Архитектура',
'report.h.XXIV':'XXIV. Посылая Сигнал – Контакт и Максимальная Помощь',
'map.markerColors':'\u0426\u0412\u0415\u0422\u0410 \u041C\u0410\u0420\u041A\u0415\u0420\u041E\u0412'
},
// --------------- HINDI ---------------
hi:{
'nav.report':'\u0930\u093F\u092A\u094B\u0930\u094D\u091F','nav.map':'OSINT \u0928\u0915\u094D\u0936\u093E','nav.home':'\u0939\u094B\u092E','nav.tools':'\u0909\u092A\u0915\u0930\u0923',
'nav.shield':'ARC \u0922\u093E\u0932','nav.guide':'\u0917\u093E\u0907\u0921','nav.backup':'\u092C\u0948\u0915\u0905\u092A','nav.logout':'\u0932\u0949\u0917\u0906\u0909\u091F','nav.updated':'अपडेटेड',
'drawer.title':'\u092A\u094D\u0930\u0924\u093F\u0915\u093E\u0930\u0940 \u0909\u092A\u093E\u092F','drawer.shield':'\u0922\u093E\u0932','drawer.tones':'\u0927\u094D\u0935\u0928\u093F\u092F\u093E\u0901','drawer.protect':'\u0938\u0941\u0930\u0915\u094D\u0937\u093E','drawer.lab':'\u0932\u0948\u092C',
'panel.ultrasonic':'\u0905\u0932\u094D\u091F\u094D\u0930\u093E\u0938\u094B\u0928\u093F\u0915 \u0922\u093E\u0932','panel.webrtc':'WebRTC \u0932\u0940\u0915 \u092C\u094D\u0932\u0949\u0915','panel.canvas':'\u0915\u0948\u0928\u0935\u0938 \u092B\u093F\u0902\u0917\u0930\u092A\u094D\u0930\u093F\u0902\u091F \u0917\u093E\u0930\u094D\u0921',
'panel.healing':'\u0909\u092A\u091A\u093E\u0930\u093E\u0924\u094D\u092E\u0915 \u0927\u094D\u0935\u0928\u093F\u092F\u093E\u0901','panel.protective':'\u0938\u0941\u0930\u0915\u094D\u0937\u093E\u0924\u094D\u092E\u0915 \u0927\u094D\u0935\u0928\u093F\u092F\u093E\u0901',
'panel.arc':'ARC \u0922\u093E\u0932','panel.tonelab':'\u091F\u094B\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E',
'status.active':'\u0938\u0915\u094D\u0930\u093F\u092F','status.inactive':'\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F',
'status.lastUpdated':'\u0905\u0902\u0924\u093F\u092E \u0905\u092A\u0921\u0947\u091F','status.status':'\u0938\u094D\u0925\u093F\u0924\u093F',
'action.activate':'\u0916\u0924\u0930\u0947 \u0915\u093E \u092A\u0924\u093E \u0932\u0917\u093E\u090F\u0902','action.stopAll':'\u0938\u092C \u092C\u0902\u0926 \u0915\u0930\u0947\u0902',
'action.copy':'\u0915\u0949\u092A\u0940','action.copied':'\u0915\u0949\u092A\u0940 \u0939\u094B \u0917\u092F\u093E',
'action.search':'\u0938\u094D\u0925\u093E\u0928 \u0916\u094B\u091C\u0947\u0902...','action.filters':'\u092B\u093C\u093F\u0932\u094D\u091F\u0930',
'freq.painRelief':'\u0926\u0930\u094D\u0926 \u0938\u0947 \u0930\u093E\u0939\u0924','freq.liberation':'\u092E\u0941\u0915\u094D\u0924\u093F',
'freq.connection':'\u091C\u0941\u0921\u093C\u093E\u0935','freq.intuition':'\u0905\u0902\u0924\u0930\u094D\u091C\u094D\u091E\u093E\u0928',
'freq.spiritual':'\u0906\u0927\u094D\u092F\u093E\u0924\u094D\u092E\u093F\u0915','freq.higherSelf':'\u0909\u091A\u094D\u091A \u0938\u094D\u0935',
'content.livingDoc':'\u091C\u0940\u0935\u093F\u0924 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u093C','content.theReport':'\u0930\u093F\u092A\u094B\u0930\u094D\u091F',
'report.expandAll':'\u0938\u092D\u0940 \u0935\u093F\u0938\u094D\u0924\u093E\u0930','report.collapseAll':'\u0938\u092D\u0940 \u0938\u0902\u0915\u094D\u0937\u093F\u092A\u094D\u0924',
'report.aiVirus':'AI \u0935\u093E\u092F\u0930\u0938 \u0930\u093F\u092A\u094B\u0930\u094D\u091F',
'report.sect.I':'I. \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F \u0914\u0930 \u0922\u093E\u0901\u091A\u093E','report.sect.VII':'VII. \u0928\u093F\u092F\u0902\u0924\u094D\u0930\u0923 \u0935\u093E\u0938\u094D\u0924\u0941\u0915\u0932\u093E','report.sect.VIII':'VIII. 51% \u0938\u0940\u092E\u093E','report.sect.IX':'IX. \u092D\u0942\u092E\u093F\u0917\u0924 / D.U.M.B.','report.sect.X':'X. \u0928\u093F\u0917\u0930\u093E\u0928\u0940 \u0914\u0930 \u0924\u0915\u0928\u0940\u0915','report.sect.XI':'XI. \u0928\u092F\u093E \u092A\u0948\u091F\u0930\u094D\u0928','report.sect.XII':'XII. \u090F\u0928\u094D\u0915\u094D\u0932\u0947\u0935','report.sect.XIII':'XIII. \u091A\u0915\u094D\u0930\u0940\u092F \u092A\u0948\u091F\u0930\u094D\u0928','report.sect.XIV':'XIV. \u0926\u093E\u0938\u0924\u093E \u092A\u094D\u0930\u0923\u093E\u0932\u0940','report.sect.XV':'XV. \u0938\u0902\u0918\u0930\u094D\u0937','report.sect.XVI':'XVI. FOIA \u092A\u0948\u091F\u0930\u094D\u0928','report.sect.XVII':'XVII. \u0938\u0902\u0917\u0920\u093F\u0924 \u0905\u092A\u0930\u093E\u0927','report.sect.XIX':'XIX. \u0915\u094D\u0930\u0949\u0938-\u0930\u0947\u092B\u0930\u0947\u0902\u0938 \u0938\u0942\u091A\u0940','report.sect.XX':'XX. \u0915\u0948\u0932\u093F\u092C\u094D\u0930\u0947\u0936\u0928 \u0938\u0942\u091A\u0940','report.sect.XXIII':'XXIII. \u0906\u0927\u094D\u092F\u093E\u0924\u094D\u092E\u093F\u0915 \u092A\u0941\u0928\u0930\u094D\u092A\u094D\u0930\u093E\u092A\u094D\u0924\u093F','report.sect.XXIV':'XXIV. \u0938\u0902\u0915\u0947\u0924',
'report.h.I':'I. उद्देश्य और ढाँचा',
'report.h.VII':'VII. नियंत्रण वास्तुकला – दीर्घकालिक प्रभुत्व की संरचनाएँ',
'report.h.VIII':'VIII. 51% सीमा – नैश, बिटकॉइन, और शासन नेटवर्क सिद्धांत के रूप में',
'report.h.IX':'IX. भूमिगत अवसंरचना – D.U.M.B. स्थल और समानांतर भूगोल',
'report.h.X':'X. नियंत्रण के रूप में प्रौद्योगिकी – निगरानी शहर और जनसंख्या प्रबंधन',
'report.h.XI':'XI. “नया” पैटर्न – प्रतिकृति और प्रतिस्थापन के वैश्विक स्थल',
'report.h.XII':'XII. अरबपति एन्क्लेव – निष्कर्षण के मजबूत द्वीप',
'report.h.XIII':'XIII. चक्रीय पैटर्न – दोहराव सभ्यता नियंत्रण का प्रमाण',
'report.h.XIV':'XIV. पशु और मानव दास प्रणाली – अटूट शृंखला',
'report.h.XV':'XV. सक्रिय वैश्विक संघर्ष – मानचित्र के नीचे का मानचित्र',
'report.h.XVI':'XVI. FOIA पैटर्न – अवर्गीकृत रिकॉर्ड क्या प्रकट करता है',
'report.h.XVII':'XVII. अवसंरचना के रूप में संगठित अपराध – कार्टेल-खुफिया-बैंकिंग गठजोड़',
'report.h.XIX':'XIX. क्रॉस-रेफरेंस सूची',
'report.h.XX':'XX. कैलिब्रेशन सूची – उच्च-संपर्क व्यक्ति',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. आध्यात्मिक पुनर्प्राप्ति – प्रति-वास्तुकला',
'report.h.XXIV':'XXIV. संकेत भेजना – संपर्क और अधिकतम सहायता',
'map.markerColors':'\u092E\u093E\u0930\u094D\u0915\u0930 \u0930\u0902\u0917'
},
// --------------- SWAHILI ---------------
sw:{
'nav.report':'RIPOTI','nav.map':'RAMANI OSINT','nav.home':'NYUMBANI','nav.tools':'ZANA',
'nav.shield':'NGAO ARC','nav.guide':'MWONGOZO','nav.backup':'HIFADHI','nav.logout':'TOKA','nav.updated':'IMESASISHWA',
'drawer.title':'HATUA ZA KINGA','drawer.shield':'NGAO','drawer.tones':'SAUTI','drawer.protect':'KINGA','drawer.lab':'MAABARA',
'panel.ultrasonic':'NGAO YA ULTRASONIC','panel.webrtc':'KUZUIA UVUJAJI WebRTC','panel.canvas':'ULINZI WA ALAMA YA CANVAS',
'panel.healing':'SAUTI ZA UPONYAJI','panel.protective':'SAUTI ZA ULINZI','panel.arc':'NGAO ARC','panel.tonelab':'MAABARA YA SAUTI',
'status.active':'INATUMIKA','status.inactive':'HAIFANYI KAZI',
'status.lastUpdated':'IMESASISHWA MWISHO','status.status':'HALI',
'action.activate':'AMILISHA UTAMBUZI WA TISHIO','action.stopAll':'SIMAMISHA YOTE',
'action.copy':'NAKILI','action.copied':'IMENAKILIWA',
'action.search':'Tafuta maeneo...','action.filters':'VICHUJIO',
'freq.painRelief':'Kupunguza Maumivu','freq.liberation':'Ukombozi',
'freq.connection':'Uhusiano','freq.intuition':'Angalizi ya Ndani',
'freq.spiritual':'Kiroho','freq.higherSelf':'Nafsi ya Juu',
'content.livingDoc':'hati hai','content.theReport':'RIPOTI',
'report.expandAll':'PANUA YOTE','report.collapseAll':'FUNGA YOTE',
'report.aiVirus':'RIPOTI YA VIRUSI YA AI',
'report.sect.I':'I. Kusudi na Mfumo','report.sect.VII':'VII. Usanifu wa Udhibiti','report.sect.VIII':'VIII. Kizingiti cha 51%','report.sect.IX':'IX. Chini ya Ardhi / D.U.M.B.','report.sect.X':'X. Ufuatiliaji na Teknolojia','report.sect.XI':'XI. Muundo Mpya','report.sect.XII':'XII. Vijiji vya Kipekee','report.sect.XIII':'XIII. Mifumo ya Mizunguko','report.sect.XIV':'XIV. Mifumo ya Utumwa','report.sect.XV':'XV. Migogoro','report.sect.XVI':'XVI. Mifumo ya FOIA','report.sect.XVII':'XVII. Uhalifu wa Kupangwa','report.sect.XIX':'XIX. Fahirisi ya Marejeo','report.sect.XX':'XX. Fahirisi ya Urekebishaji','report.sect.XXIII':'XXIII. Upataji wa Kiroho','report.sect.XXIV':'XXIV. Ishara',
'report.h.I':'I. Kusudi na Mfumo',
'report.h.VII':'VII. Usanifu wa Udhibiti – Miundo ya Utawala wa Muda Mrefu',
'report.h.VIII':'VIII. Kizingiti cha 51% – Nash, Bitcoin, na Utawala kama Nadharia ya Mtandao',
'report.h.IX':'IX. Miundombinu ya Chini ya Ardhi – Maeneo ya D.U.M.B. na Jiografia Sambamba',
'report.h.X':'X. Teknolojia kama Udhibiti – Miji ya Ufuatiliaji na Usimamizi wa Idadi ya Watu',
'report.h.XI':'XI. Muundo “Mpya” – Maeneo ya Kimataifa ya Uigaji na Ubadilishaji',
'report.h.XII':'XII. Vijiji vya Mabilionea – Visiwa Vilivyoimarishwa vya Uchimbaji',
'report.h.XIII':'XIII. Mifumo ya Mizunguko – Ushahidi wa Udhibiti wa Ustaarabu Unaojirudia',
'report.h.XIV':'XIV. Mifumo ya Utumwa wa Wanyama na Binadamu – Mnyororo Usiokutika',
'report.h.XV':'XV. Migogoro Hai ya Kimataifa – Ramani Chini ya Ramani',
'report.h.XVI':'XVI. Mifumo ya FOIA – Kile Ambacho Rekodi Zilizofichuliwa Zinafunua',
'report.h.XVII':'XVII. Uhalifu wa Kupangwa kama Miundombinu – Uhusiano wa Karteli-Ujasusi-Benki',
'report.h.XIX':'XIX. Fahirisi ya Marejeo Mtambuka',
'report.h.XX':'XX. Fahirisi ya Urekebishaji – Watu Wenye Uhusiano Mkubwa',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Upataji wa Kiroho – Usanifu wa Kupinga',
'report.h.XXIV':'XXIV. Kutuma Ishara – Mawasiliano na Msaada wa Juu',
'map.markerColors':'RANGI ZA ALAMA'
},
// --------------- KOREAN ---------------
ko:{
'nav.report':'\uBCF4\uACE0\uC11C','nav.map':'OSINT \uC9C0\uB3C4','nav.home':'\uD648','nav.tools':'\uB3C4\uAD6C',
'nav.shield':'ARC \uBC29\uD328','nav.guide':'\uAC00\uC774\uB4DC','nav.backup':'\uBC31\uC5C5','nav.logout':'\uB85C\uADF8\uC544\uC6C3','nav.updated':'업데이트',
'drawer.title':'\uB300\uC751 \uC218\uB2E8','drawer.shield':'\uBC29\uD328','drawer.tones':'\uD1A4','drawer.protect':'\uBCF4\uD638','drawer.lab':'\uC5F0\uAD6C\uC18C',
'panel.ultrasonic':'\uCD08\uC74C\uD30C \uBC29\uD328','panel.webrtc':'WebRTC \uB204\uCD9C \uCC28\uB2E8','panel.canvas':'Canvas \uC9C0\uBB38 \uBC29\uC5B4',
'panel.healing':'\uCE58\uC720 \uC74C','panel.protective':'\uBCF4\uD638 \uC74C','panel.arc':'ARC \uBC29\uD328','panel.tonelab':'\uD1A4 \uC5F0\uAD6C\uC18C',
'status.active':'\uD65C\uC131','status.inactive':'\uBE44\uD65C\uC131',
'status.lastUpdated':'\uCD5C\uC885 \uC5C5\uB370\uC774\uD2B8','status.status':'\uC0C1\uD0DC',
'action.activate':'\uC704\uD611 \uAC10\uC9C0 \uD65C\uC131\uD654','action.stopAll':'\uBAA8\uB450 \uC911\uC9C0',
'action.copy':'\uBCF5\uC0AC','action.copied':'\uBCF5\uC0AC\uB428',
'action.search':'\uC704\uCE58 \uAC80\uC0C9...','action.filters':'\uD544\uD130',
'freq.painRelief':'\uD1B5\uC99D \uC644\uD654','freq.liberation':'\uD574\uBC29',
'freq.connection':'\uC5F0\uACB0','freq.intuition':'\uC9C1\uAC10',
'freq.spiritual':'\uC601\uC801','freq.higherSelf':'\uB192\uC740 \uC790\uC544',
'content.livingDoc':'\uC0B4\uC544\uC788\uB294 \uBB38\uC11C','content.theReport':'\uBCF4\uACE0\uC11C',
'report.expandAll':'\uBAA8\uB450 \uD3BC\uCE58\uAE30','report.collapseAll':'\uBAA8\uB450 \uC811\uAE30',
'report.aiVirus':'AI \uBC14\uC774\uB7EC\uC2A4 \uBCF4\uACE0\uC11C',
'report.sect.I':'I. \uBAA9\uC801 \uBC0F \uD504\uB808\uC784\uC6CC\uD06C','report.sect.VII':'VII. \uD1B5\uC81C \uAD6C\uC870','report.sect.VIII':'VIII. 51% \uBB38\uD134\uAC12','report.sect.IX':'IX. \uC9C0\uD558 / D.U.M.B.','report.sect.X':'X. \uAC10\uC2DC \uBC0F \uAE30\uC220','report.sect.XI':'XI. \uC0C8\uB85C\uC6B4 \uD328\uD134','report.sect.XII':'XII. \uC5D4\uD074\uB808\uC774\uBE0C','report.sect.XIII':'XIII. \uC21C\uD658 \uD328\uD134','report.sect.XIV':'XIV. \uB178\uC608 \uC2DC\uC2A4\uD15C','report.sect.XV':'XV. \uBD84\uC7C1','report.sect.XVI':'XVI. FOIA \uD328\uD134','report.sect.XVII':'XVII. \uC870\uC9C1 \uBC94\uC8C4','report.sect.XIX':'XIX. \uAD50\uCC28 \uCC38\uC870 \uC0C9\uC778','report.sect.XX':'XX. \uBCF4\uC815 \uC0C9\uC778','report.sect.XXIII':'XXIII. \uC601\uC801 \uD68C\uBCF5','report.sect.XXIV':'XXIV. \uC2E0\uD638',
'report.h.I':'I. 목적 및 프레임워크',
'report.h.VII':'VII. 통제 구조 – 장기적 지배의 구조',
'report.h.VIII':'VIII. 51% 문턴값 – 내쉬, 비트코인, 그리고 네트워크 이론으로서의 거버넌스',
'report.h.IX':'IX. 지하 인프라 – D.U.M.B. 사이트와 병렬 지리',
'report.h.X':'X. 통제로서의 기술 – 감시 도시와 인구 관리',
'report.h.XI':'XI. “새로운” 패턴 – 복제와 대체의 글로별 사이트',
'report.h.XII':'XII. 억만장자 엔클레이브 – 강화된 추출의 섬',
'report.h.XIII':'XIII. 순환 패턴 – 반복되는 문명 통제의 증거',
'report.h.XIV':'XIV. 동물 및 인간 노예 시스템 – 끊어지지 않는 사슬',
'report.h.XV':'XV. 활발한 전 세계 분쟁 – 지도 아래의 지도',
'report.h.XVI':'XVI. FOIA 패턴 – 기밀 해제된 기록이 밝히는 것',
'report.h.XVII':'XVII. 인프라로서의 조직 범죄 – 카르텔-정보기관-은행 연결고리',
'report.h.XIX':'XIX. 교차 참조 색인',
'report.h.XX':'XX. 보정 색인 – 고연결성 개인',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. 영적 회복 – 대항 구조',
'report.h.XXIV':'XXIV. 신호 보내기 – 연락 및 최대 지원',
'map.markerColors':'\uB9C8\uCEE4 \uC0C9\uC0C1'
},
// --------------- JAPANESE ---------------
ja:{
'nav.report':'\u30EC\u30DD\u30FC\u30C8','nav.map':'OSINT\u30DE\u30C3\u30D7','nav.home':'\u30DB\u30FC\u30E0','nav.tools':'\u30C4\u30FC\u30EB',
'nav.shield':'ARC\u30B7\u30FC\u30EB\u30C9','nav.guide':'\u30AC\u30A4\u30C9','nav.backup':'\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7','nav.logout':'\u30ED\u30B0\u30A2\u30A6\u30C8','nav.updated':'更新日',
'drawer.title':'\u5BFE\u7B56','drawer.shield':'\u30B7\u30FC\u30EB\u30C9','drawer.tones':'\u30C8\u30FC\u30F3','drawer.protect':'\u4FDD\u8B77','drawer.lab':'\u30E9\u30DC',
'panel.ultrasonic':'\u8D85\u97F3\u6CE2\u30B7\u30FC\u30EB\u30C9','panel.webrtc':'WebRTC\u6F0F\u6D29\u30D6\u30ED\u30C3\u30AF','panel.canvas':'Canvas\u6307\u7D0B\u9632\u5FA1',
'panel.healing':'\u30D2\u30FC\u30EA\u30F3\u30B0\u30C8\u30FC\u30F3','panel.protective':'\u30D7\u30ED\u30C6\u30AF\u30C6\u30A3\u30D6\u30C8\u30FC\u30F3',
'panel.arc':'ARC\u30B7\u30FC\u30EB\u30C9','panel.tonelab':'\u30C8\u30FC\u30F3\u30E9\u30DC',
'status.active':'\u30A2\u30AF\u30C6\u30A3\u30D6','status.inactive':'\u975E\u30A2\u30AF\u30C6\u30A3\u30D6',
'status.lastUpdated':'\u6700\u7D42\u66F4\u65B0','status.status':'\u30B9\u30C6\u30FC\u30BF\u30B9',
'action.activate':'\u8105\u5A01\u691C\u51FA\u3092\u8D77\u52D5','action.stopAll':'\u3059\u3079\u3066\u505C\u6B62',
'action.copy':'\u30B3\u30D4\u30FC','action.copied':'\u30B3\u30D4\u30FC\u6E08\u307F',
'action.search':'\u5834\u6240\u3092\u691C\u7D22...','action.filters':'\u30D5\u30A3\u30EB\u30BF\u30FC',
'freq.painRelief':'\u75DB\u307F\u306E\u7DE9\u548C','freq.liberation':'\u89E3\u653E',
'freq.connection':'\u3064\u306A\u304C\u308A','freq.intuition':'\u76F4\u611F',
'freq.spiritual':'\u7CBE\u795E\u7684','freq.higherSelf':'\u9AD8\u6B21\u306E\u81EA\u5DF1',
'content.livingDoc':'\u751F\u304D\u305F\u6587\u66F8','content.theReport':'\u30EC\u30DD\u30FC\u30C8',
'report.expandAll':'\u3059\u3079\u3066\u5C55\u958B','report.collapseAll':'\u3059\u3079\u3066\u6298\u308A\u305F\u305F\u3080',
'report.aiVirus':'AI\u30A6\u30A4\u30EB\u30B9\u30EC\u30DD\u30FC\u30C8',
'report.sect.I':'I. \u76EE\u7684\u3068\u67A0\u7D44\u307F','report.sect.VII':'VII. \u7D71\u5236\u69CB\u9020','report.sect.VIII':'VIII. 51%\u306E\u95BE\u5024','report.sect.IX':'IX. \u5730\u4E0B / D.U.M.B.','report.sect.X':'X. \u76E3\u8996\u3068\u6280\u8853','report.sect.XI':'XI. \u300C\u65B0\u300D\u30D1\u30BF\u30FC\u30F3','report.sect.XII':'XII. \u98DB\u3073\u5730','report.sect.XIII':'XIII. \u5FAA\u74B0\u30D1\u30BF\u30FC\u30F3','report.sect.XIV':'XIV. \u5974\u96B7\u5236\u5EA6','report.sect.XV':'XV. \u7D1B\u4E89','report.sect.XVI':'XVI. FOIA\u30D1\u30BF\u30FC\u30F3','report.sect.XVII':'XVII. \u7D44\u7E54\u72AF\u7F6A','report.sect.XIX':'XIX. \u76F8\u4E92\u53C2\u7167\u7D22\u5F15','report.sect.XX':'XX. \u6821\u6B63\u7D22\u5F15','report.sect.XXIII':'XXIII. \u970A\u7684\u56DE\u5FA9','report.sect.XXIV':'XXIV. \u30B7\u30B0\u30CA\u30EB',
'report.h.I':'I. 目的と枚組み',
'report.h.VII':'VII. 統制構造 – 長期支配の構造',
'report.h.VIII':'VIII. 51%の閾値 – ナッシュ、ビットコイン、ネットワーク理論としてのガバナンス',
'report.h.IX':'IX. 地下インフラ – D.U.M.B.サイトと並行地理',
'report.h.X':'X. 制御としての技術 – 監視都市と人口管理',
'report.h.XI':'XI. 「新」パターン – 複製と置換のグローバルサイト',
'report.h.XII':'XII. 億万長者の飛び地 – 強化された抽出の島',
'report.h.XIII':'XIII. 循環パターン – 繰り返す文明統制の証拠',
'report.h.XIV':'XIV. 動物と人間の奴隷制度 – 途切れない鎖',
'report.h.XV':'XV. 活発な世界紛争 – 地図の下の地図',
'report.h.XVI':'XVI. FOIAパターン – 機密解除記録が明かすもの',
'report.h.XVII':'XVII. インフラとしての組織犯罪 – カルテル-諜報-銀行ネクサス',
'report.h.XIX':'XIX. 相互参照索引',
'report.h.XX':'XX. 校正索引 – 高接続性個人',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. 霊的回復 – 対抗構造',
'report.h.XXIV':'XXIV. シグナルを送る – 連絡と最大支援',
'map.markerColors':'\u30DE\u30FC\u30AB\u30FC\u306E\u8272'
},
// --------------- GERMAN ---------------
de:{
'nav.report':'BERICHT','nav.map':'OSINT-KARTE','nav.home':'STARTSEITE','nav.tools':'WERKZEUGE',
'nav.shield':'ARC-SCHILD','nav.guide':'FELDF\u00dcHRER','nav.backup':'SICHERUNG','nav.logout':'ABMELDEN','nav.updated':'AKTUALISIERT',
'drawer.title':'GEGENMASSNAHMEN','drawer.shield':'SCHILD','drawer.tones':'T\u00d6NE','drawer.protect':'SCHUTZ','drawer.lab':'LABOR',
'panel.ultrasonic':'ULTRASCHALLSCHILD','panel.webrtc':'WebRTC-LECKSCHUTZ','panel.canvas':'CANVAS-FINGERABDRUCKSCHUTZ',
'panel.healing':'HEILENDE T\u00d6NE','panel.protective':'SCHUTZТ\u00d6NE','panel.arc':'ARC-SCHILD','panel.tonelab':'TONLABOR',
'info.ultrasonic':'WASSERPLANET OPTIMIERT - Feuchtigkeitsadaptive Frequenzabtastung \u00fcber 20\u201322kHz. St\u00f6rt ger\u00e4te\u00fcbergreifende Tracking-Beacons und akustische Datenexfiltration. TIERSICHER: \u00fcber 20kHz bei -60dB.',
'info.webrtc':'Verhindert, dass WebRTC Ihre echten lokalen/\u00f6ffentlichen IP-Adressen \u00fcber STUN/TURN-Anfragen preisgibt.',
'info.canvas':'Injiziert unmerkliches Rauschen in Canvas-R\u00fccklese-Operationen und besiegt Canvas-Fingerprinting.',
'info.healing':'Solf\u00e8ge-Frequenzen mit subharmonischer K\u00f6rperwasser-Resonanz. TIERSICHER: 174\u2013963 Hz bei sanfter Lautst\u00e4rke.',
'info.protective':'7.83 Hz Schumann ist der elektromagnetische Herzschlag der Erde. Kopfh\u00f6rer f\u00fcr binaurale Mitnahme verwenden. TIERSICHER.',
'info.arc':'LRAD-Erkennung, Phasenausl\u00f6schung, Gegenfrequenz. Mikrofon erforderlich.',
'status.active':'AKTIV','status.inactive':'INAKTIV','status.lastUpdated':'ZULETZT AKTUALISIERT','status.status':'STATUS',
'action.activate':'BEDROHUNGSERKENNUNG AKTIVIEREN','action.stopAll':'ALLES STOPPEN',
'action.copy':'KOPIEREN','action.copied':'KOPIERT','action.search':'Standorte suchen...',
'action.reset':'ZUR\u00dcCKSETZEN','action.filters':'FILTER',
'action.fullShield':'VOLLST\u00c4NDIGER SCHILD','action.openToneLab':'VOLLES TONLABOR \u00d6FFNEN',
'dl.title':'HERUNTERLADEN / INSTALLIEREN','dl.info':'Auf dem Startbildschirm installieren. HTML auf Desktop herunterladen. Keine Abh\u00e4ngigkeiten.',
'dl.multipack':'MULTIPACK INSTALLIEREN','dl.tonelab':'TONLABOR INSTALLIEREN',
'dl.healing':'HEILUNG INSTALLIEREN','dl.protective':'SCHUTZ INSTALLIEREN','dl.downloadHtml':'HERUNTERLADEN .HTML',
'dl.embedTitle':'AUF IHRER WEBSITE INSTALLIEREN','dl.embedInfo':'Code kopieren, um Ton-Werkzeuge zu jeder Website hinzuzuf\u00fcgen.',
'freq.painRelief':'Schmerzlinderung','freq.tissueHealing':'Gewebeheilung','freq.liberation':'Befreiung',
'freq.change':'Ver\u00e4nderung','freq.naturalCalm':'Nat\u00fcrliche Ruhe','freq.loveDna':'Liebe / DNA-Reparatur',
'freq.connection':'Verbindung','freq.intuition':'Intuition','freq.spiritual':'Spirituell','freq.higherSelf':'H\u00f6heres Selbst',
'prot.schumann':'Schumann-Resonanz','prot.alpha':'Alpha - Ruhige Wachsamkeit','prot.beta':'Beta - Fokus',
'prot.gamma':'Gamma - Wahrnehmung','prot.pink':'Rosa Rauschen - Maskierung','prot.brown':'Braunes Rauschen - Tiefe Deckung',
'prot.ocean':'Ozeanwellen - Planetenklang',
'tl.pain':'Schmerz','tl.free':'Frei','tl.calm':'Ruhe','tl.love':'Liebe',
'tl.bond':'Band','tl.intuit':'Intuir','tl.spirit':'Geist','tl.crown':'Krone',
'content.livingDoc':'Lebendes Dokument','content.theReport':'DER BERICHT',
'content.keepRunning':'WEBSEITE AM LAUFEN HALTEN - ESSEN + VORR\u00c4TE',
'content.cmTitle':'GEGENMASSNAHMEN','content.cmSubtitle':'DATENSCHUTZ-WERKZEUGE UND HEILENDE T\u00d6NE',
'map.bySection':'NACH ABSCHNITT','map.byType':'NACH TYP',
'map.allSections':'Alle Abschnitte','map.allTypes':'Alle Typen',
'report.expandAll':'ALLE \u00D6FFNEN','report.collapseAll':'ALLE SCHLIESSEN',
'report.aiVirus':'KI-VIRUS BERICHT',
'report.sect.I':'I. Zweck und Rahmen','report.sect.VII':'VII. Kontrollarchitektur','report.sect.VIII':'VIII. 51%-Schwelle','report.sect.IX':'IX. Untergrund / D.U.M.B.','report.sect.X':'X. \u00dcberwachung und Technik','report.sect.XI':'XI. Das Neue Muster','report.sect.XII':'XII. Enklaven','report.sect.XIII':'XIII. Zyklische Muster','report.sect.XIV':'XIV. Sklavereisysteme','report.sect.XV':'XV. Konflikte','report.sect.XVI':'XVI. FOIA-Muster','report.sect.XVII':'XVII. Organisierte Kriminalit\u00e4t','report.sect.XIX':'XIX. Querverweisindex','report.sect.XX':'XX. Kalibrierungsindex','report.sect.XXIII':'XXIII. Spirituelle R\u00fcckgewinnung','report.sect.XXIV':'XXIV. Das Signal',
'report.h.I':'I. Zweck und Rahmen',
'report.h.VII':'VII. Die Kontrollarchitektur – Strukturen Langfristiger Herrschaft',
'report.h.VIII':'VIII. Die 51%-Schwelle – Nash, Bitcoin und Governance als Netzwerktheorie',
'report.h.IX':'IX. Unterirdische Infrastruktur – D.U.M.B.-Standorte und Parallelgeographie',
'report.h.X':'X. Technologie als Kontrolle – Überwachungsstädte und Bevölkerungsmanagement',
'report.h.XI':'XI. Das “Neue” Muster – Globale Standorte der Replikation und Ersetzung',
'report.h.XII':'XII. Milliardärs-Enklaven – Befestigte Inseln der Extraktion',
'report.h.XIII':'XIII. Zyklische Muster – Beweise für Wiederkehrende Zivilisationskontrolle',
'report.h.XIV':'XIV. Tier- und Menschensklavereisysteme – Die Ungebrochene Kette',
'report.h.XV':'XV. Aktive Globale Konflikte – Die Karte Unter der Karte',
'report.h.XVI':'XVI. FOIA-Muster – Was die Freigegebenen Akten Enthüllen',
'report.h.XVII':'XVII. Organisierte Kriminalität als Infrastruktur – Das Kartell-Geheimdienst-Banken-Netzwerk',
'report.h.XIX':'XIX. Querverweisindex',
'report.h.XX':'XX. Kalibrierungsindex – Hochvernetzte Individuen',
'report.h.XVIII':'XVIII. Art, Power & the Unregulated Market - Laundering, Symbol, Ritual',
'report.h.XXIII':'XXIII. Spirituelle Rückgewinnung – Die Gegen-Architektur',
'report.h.XXIV':'XXIV. Das Signal Senden – Kontakt und Maximale Hilfe',
'map.markerColors':'MARKER-FARBEN'
}
};

// ===================== ENGINE =====================
var lang=localStorage.getItem('b0b-lang')||'en';

function t(k){
  if(lang==='en')return EN[k]||k;
  return (D[lang]&&D[lang][k])||EN[k]||k;
}

function setLang(l){
  lang=l;
  localStorage.setItem('b0b-lang',l);
  apply();
  // Sync with parent (if in iframe) or child iframe (if shell)
  try{
    if(window.parent!==window)window.parent.postMessage({b0bLang:l},location.origin);
    var f=document.getElementById('frame');
    if(f)f.contentWindow.postMessage({b0bLang:l},location.origin);
  }catch(e){}
  // Update selector display
  var cur=document.getElementById('b0bLangCur');
  if(cur)cur.textContent=LANGS[l]||l;
  document.querySelectorAll('.b0b-lo').forEach(function(o){
    o.classList.toggle('active',o.dataset.lang===l);
  });
  // RTL for Arabic
  document.documentElement.dir=l==='ar'?'rtl':'ltr';
}

function apply(){
  // Translate data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    el.textContent=t(el.getAttribute('data-i18n'));
  });
  // Translate placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    el.placeholder=t(el.getAttribute('data-i18n-ph'));
  });
  // Translate title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(function(el){
    el.title=t(el.getAttribute('data-i18n-title'));
  });
  // Update translate banner removed - native i18n only
}

// Inject styles for language selector and translate banner
function injectCSS(){
  var s=document.createElement('style');
  s.textContent=
    '.b0b-ls{position:fixed;top:8px;right:8px;z-index:99999;font-family:"Courier New",monospace}'+
    '.b0b-lb{background:rgba(10,10,10,0.95);border:1px solid #333;color:#888;padding:4px 10px;cursor:pointer;font-family:inherit;font-size:0.7rem;display:flex;align-items:center;gap:4px;white-space:nowrap}'+
    '.b0b-lb:hover{border-color:#00ff41;color:#00ff41}'+
    '.b0b-ld{display:none;position:absolute;top:100%;right:0;background:rgba(10,10,10,0.98);border:1px solid #333;min-width:150px;max-height:320px;overflow-y:auto;z-index:99999}'+
    '.b0b-ld.open{display:block}'+
    '.b0b-lo{display:block;width:100%;padding:6px 14px;background:transparent;border:none;border-bottom:1px solid #1a1a1a;color:#888;font-size:0.7rem;text-align:left;cursor:pointer;font-family:"Courier New",monospace}'+
    '.b0b-lo:hover{background:#111;color:#00ff41}'+
    '.b0b-lo.active{color:#00ff41}'+
    // Last-updated indicator
    '.b0b-updated{position:fixed;bottom:40px;left:8px;font-family:"Courier New",monospace;font-size:0.55rem;color:#333;letter-spacing:0.5px;z-index:9997}'+
    '.b0b-updated span{color:#555}';
  document.head.appendChild(s);
}

// Create language selector (only in top-level window)
function createSelector(){
  if(window.parent!==window)return;
  var c=document.createElement('div');
  c.className='b0b-ls';
  var opts='';
  var codes=Object.keys(LANGS);
  for(var i=0;i<codes.length;i++){
    var code=codes[i];
    opts+='<button class="b0b-lo'+(code===lang?' active':'')+'" data-lang="'+code+'">'+LANGS[code]+'</button>';
  }
  c.innerHTML='<button class="b0b-lb" id="b0bLangBtn">\uD83C\uDF10 <span id="b0bLangCur">'+LANGS[lang]+'</span></button>'+
    '<div class="b0b-ld" id="b0bLangDd">'+opts+'</div>';
  document.body.appendChild(c);
  // Toggle dropdown
  document.getElementById('b0bLangBtn').addEventListener('click',function(e){
    e.stopPropagation();
    document.getElementById('b0bLangDd').classList.toggle('open');
  });
  // Language selection
  document.getElementById('b0bLangDd').addEventListener('click',function(e){
    var btn=e.target.closest('.b0b-lo');
    if(!btn)return;
    setLang(btn.dataset.lang);
    document.getElementById('b0bLangDd').classList.remove('open');
  });
  // Close on outside click
  document.addEventListener('click',function(){
    var dd=document.getElementById('b0bLangDd');
    if(dd)dd.classList.remove('open');
  });
}


// Listen for language changes from parent or child iframe
window.addEventListener('message',function(e){
  if(e.origin===location.origin&&e.data&&e.data.b0bLang){
    lang=e.data.b0bLang;
    localStorage.setItem('b0b-lang',lang);
    apply();
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    var cur=document.getElementById('b0bLangCur');
    if(cur)cur.textContent=LANGS[lang]||lang;
  }
});

// Expose translation API globally
window.b0bI18n={
  t:t,
  setLanguage:setLang,
  getLanguage:function(){return lang},
  apply:apply,
  languages:LANGS
};

function init(){
  injectCSS();
  createSelector();
  if(lang!=='en'){
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  }
  apply();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}

})();
