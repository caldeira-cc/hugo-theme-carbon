// IBM Carbon Modular Hugo Engine - Main Bundle
import './theme.js';
import './clock.js';
import './availability.js';
import './weather.js';
import './search.js';
import './csvw-table.js';
import './ui-shell.js';
import './cookie-consent.js';
import './ads.js';
import './geojson-map.js';
import './dashboard.js';
import './code-snippet.js';
import './mermaid-engine.js';
import './spss-engine.js';
import './xml-engine.js';
import { initReadAloud } from './read-aloud.js';
import { initDecryption } from './decrypt.js';
import { initPhysicsSimulation } from './physics.js';
import { initChessArena } from './chess.js';
import { initPersonaAI } from './persona-ai.js';
import { initLatexParser } from './latex-parser.js';
import { initCarbonComponents } from './carbon-components.js';
import { initVCard } from './vcard.js';

document.addEventListener('DOMContentLoaded', () => {
  initReadAloud();
  initDecryption();
  initPhysicsSimulation();
  initChessArena();
  initPersonaAI();
  initLatexParser();
  initCarbonComponents();
  initVCard();
});

console.log('Carbon Design System v11 Hugo Engine initialized with Resilient Web Platform Extensions.');
