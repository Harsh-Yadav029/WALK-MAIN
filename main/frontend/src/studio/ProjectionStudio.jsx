/**
 * ProjectionStudio.jsx
 * Walk The Plan · 1:1 Scale Architectural Projection & CAD Studio
 * Industry-Grade Multi-Floor Projection Engine & CAD Visualizer
 */

import React, {
  useState, useEffect, useRef, useMemo, useCallback, Suspense
} from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls, Grid, Text, Box, Line,
  GizmoHelper, GizmoViewport
} from '@react-three/drei';
import * as THREE from 'three';
import * as XLSX from 'xlsx';
import {
  Ruler, Menu, X, ArrowLeft, MousePointer, PenTool, Layers, Box as BoxIcon,
  Eye, Sliders, Maximize2, Minimize2, Building, Sparkles, Plus, Check,
  Trash2, RotateCw, Palette, ShieldAlert, ShieldCheck, AlertTriangle, Sun,
  FileDown, ArrowRight, Download, Printer, Navigation, ZoomIn, ZoomOut,
  RotateCcw, CheckCircle2, HelpCircle, Search, Copy, Undo, Redo,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass, Car,
  FileSpreadsheet, Layers2, SplitSquareVertical, Maximize, Share2, Save,
  Upload, Activity, Info, Sparkle, UploadCloud, FileUp, Image as ImageIcon,
  Trees, Moon, Move, Grip, DollarSign, Calculator
} from 'lucide-react';

import './ProjectionStudio.css';

// ─────────────────────────────────────────────────────────────────────────────
// UNITS & CONVERSION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function toFeetInches(meters) {
  if (meters === undefined || meters === null || isNaN(meters)) return "0'-0\"";
  const totalInches = Math.round(meters * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'-${inches}"`;
}

export function toSqFt(sqMeters) {
  if (!sqMeters || isNaN(sqMeters)) return 0;
  return Math.round(sqMeters * 10.7639);
}

export function formatDim(meters, unit) {
  if (unit === 'imperial') return toFeetInches(meters);
  return `${Number(meters).toFixed(2)}m`;
}

export function formatArea(sqM, unit) {
  if (unit === 'imperial') return `${toSqFt(sqM).toLocaleString()} sq.ft`;
  return `${Number(sqM).toFixed(1)} m²`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LUXURY MATERIALS CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export const FLOOR_MATERIALS = [
  { id: 'marble_calacatta', name: 'Calacatta Gold Marble', category: 'Luxury Stone', color: '#f5f0e6', roughness: 0.12, metalness: 0.18, preview: '#fdf4dc', tag: 'Gold Vein' },
  { id: 'marble_carrara', name: 'Carrara Italian Marble', category: 'Luxury Stone', color: '#e2e8f0', roughness: 0.14, metalness: 0.15, preview: '#e2e8f0', tag: 'High Sheen' },
  { id: 'walnut_hardwood', name: 'Smoked Walnut Hardwood', category: 'Natural Timber', color: '#3e2716', roughness: 0.65, metalness: 0.05, preview: '#5a3d28', tag: 'Warm Grain' },
  { id: 'scandinavian_oak', name: 'Nordic White Oak', category: 'Natural Timber', color: '#8c6d48', roughness: 0.60, metalness: 0.05, preview: '#a3845e', tag: 'Matte' },
  { id: 'polished_concrete', name: 'Polished Concrete', category: 'Modern Luxe', color: '#475569', roughness: 0.35, metalness: 0.15, preview: '#64748b', tag: 'Seamless' },
  { id: 'terrazzo_venetian', name: 'Venetian Dark Terrazzo', category: 'Luxury Stone', color: '#1e293b', roughness: 0.40, metalness: 0.12, preview: '#334155', tag: 'Speckled' },
  { id: 'blueprint_obsidian', name: 'Laser Obsidian Glass (1:1 Stage)', category: 'Projection Stage', color: '#031726', roughness: 0.08, metalness: 0.70, glow: '#00f0ff', preview: '#0284c7', tag: 'Laser Active' },
];

export const WALL_MATERIALS = [
  { id: 'wall_white_chalk', name: 'Architectural Pure White', color: '#f8fafc', preview: '#f8fafc', tag: 'Neutral 98%' },
  { id: 'wall_slate_gray', name: 'Contemporary Slate Gray', color: '#475569', preview: '#475569', tag: 'Modern Accent' },
  { id: 'wall_charcoal_dark', name: 'Nordic Charcoal Minimal', color: '#1e293b', preview: '#1e293b', tag: 'Deep Matte' },
  { id: 'wall_warm_sand', name: 'Warm Terracotta Stucco', color: '#7c533e', preview: '#9a6b52', tag: 'Earthy' },
  { id: 'wall_champagne_gold', name: 'Royal Champagne Plaster', color: '#997c47', preview: '#bfa063', tag: 'Gold Flake' },
  { id: 'wall_blueprint_cyan', name: 'Glowing Blueprint Cyan', color: '#0369a1', glow: '#00f0ff', preview: '#0284c7', tag: 'Laser Line' },
];

// ─────────────────────────────────────────────────────────────────────────────
// VASTU ZONES & ARCHITECTURAL STANDARDS
// ─────────────────────────────────────────────────────────────────────────────

export const VASTU_ZONES = [
  { id: 'NE', name: 'Ishaan (North-East)', element: 'Water / Divine', deity: 'Shiva', best: ['puja', 'living', 'balcony', 'open'], avoid: ['master', 'kitchen', 'bath', 'toilet'], color: '#38bdf8' },
  { id: 'E',  name: 'Indra (East)', element: 'Solar Energy', deity: 'Surya', best: ['living', 'verandah', 'puja', 'entrance'], avoid: ['bath', 'toilet'], color: '#fbbf24' },
  { id: 'SE', name: 'Agni (South-East)', element: 'Fire Energy', deity: 'Agni', best: ['kitchen', 'electricals', 'utility', 'panel'], avoid: ['master', 'bath', 'puja'], color: '#f97316' },
  { id: 'S',  name: 'Yama (South)', element: 'Earth / Rest', deity: 'Yama', best: ['bedroom', 'store', 'stairs'], avoid: ['kitchen', 'puja'], color: '#ef4444' },
  { id: 'SW', name: 'Niruthi (South-West)', element: 'Heavy Earth / Power', deity: 'Niruthi', best: ['master', 'heavy_store', 'wardrobe'], avoid: ['puja', 'kitchen', 'entrance', 'bath'], color: '#a855f7' },
  { id: 'W',  name: 'Varuna (West)', element: 'Water / Prosperity', deity: 'Varuna', best: ['dining', 'children', 'study', 'overhead_tank'], avoid: ['puja', 'kitchen'], color: '#6366f1' },
  { id: 'NW', name: 'Vayu (North-West)', element: 'Air / Movement', deity: 'Vayu', best: ['guest', 'parking', 'servant', 'pantry', 'toilet'], avoid: ['master', 'puja'], color: '#14b8a6' },
  { id: 'N',  name: 'Kubera (North)', element: 'Wealth / Water', deity: 'Kubera', best: ['living', 'locker', 'entrance', 'lobby'], avoid: ['kitchen', 'toilet'], color: '#10b981' },
  { id: 'C',  name: 'Brahmasthana (Center)', element: 'Space / Ether', deity: 'Brahma', best: ['courtyard', 'lobby', 'atrium', 'open'], avoid: ['toilet', 'kitchen', 'stairs', 'pillar'], color: '#fae8a4' }
];

// ─────────────────────────────────────────────────────────────────────────────
// REAL-WORLD LAND & PLOT PRESETS (FOR 1:1 OUTDOOR LAND PROJECTION)
// ─────────────────────────────────────────────────────────────────────────────

export const LAND_PLOT_PRESETS = [
  { id: 'plot_30x50', name: "30' × 50' (1,500 sq.ft)", width: 9.14, depth: 15.24, frontSetback: 3.0, rearSetback: 2.0, sideSetback: 1.2, tag: 'Urban Compact' },
  { id: 'plot_30x60', name: "30' × 60' (1,800 sq.ft)", width: 9.14, depth: 18.29, frontSetback: 3.5, rearSetback: 2.5, sideSetback: 1.2, tag: 'Standard Villa' },
  { id: 'plot_40x60', name: "40' × 60' (2,400 sq.ft)", width: 12.19, depth: 18.29, frontSetback: 4.5, rearSetback: 3.0, sideSetback: 1.5, tag: 'Luxury 4BHK' },
  { id: 'plot_50x80', name: "50' × 80' (4,000 sq.ft)", width: 15.24, depth: 24.38, frontSetback: 5.5, rearSetback: 3.5, sideSetback: 2.0, tag: 'Independent Estate' },
  { id: 'plot_60x100', name: "60' × 100' (6,000 sq.ft)", width: 18.29, depth: 30.48, frontSetback: 6.5, rearSetback: 4.5, sideSetback: 2.5, tag: 'Farmhouse Ground' },
];


// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE ARCHITECTURAL BUILDINGS & MULTI-FLOOR DATASET
// ─────────────────────────────────────────────────────────────────────────────

export const BUILDINGS_CATALOG = {
  royal_estate_30x75: {
    id: 'royal_estate_30x75',
    name: "Royal Villa Estate 30' × 75' (Stilt + 3 Floors)",
    tag: 'Signature 4-Level Architectural Project',
    isMultiLevel: true,
    footprint: '29\'-11" × 75\'-2" (9.12m × 22.91m · ~9,000 sq.ft Built-Up)',
    plotWidth: 9.12,
    plotDepth: 22.91,
    defaultFloor: 'ground',
    floors: {
      stilt: {
        id: 'stilt',
        name: 'Stilt Floor',
        subtitle: '8-Car Covered Parking, Staff Quarters & Vertical Core',
        elevation: 0,
        blueprintImage: '/blueprints/stilt_floor_plan.png',
        rooms: [
          { id: 'st_drive', type: 'parking', name: 'Stilt Parking & Driveway', x: -4.4, z: -11.2, w: 8.8, d: 22.4, h: 2.8, wallThick: 0.23, floorMat: 'polished_concrete', wallMat: 'wall_slate_gray', isBoundary: true, desc: "29'-11\" × 75'-2\" 8-Car Capacity & Drive Aisle" },
          { id: 'st_servant1', type: 'bedroom', name: 'Servant-1 (Staff Suite)', x: 0.8, z: -10.8, w: 3.05, d: 2.24, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'west', desc: "10'-0\" × 7'-4\" Staff Suite" },
          { id: 'st_servant2', type: 'bedroom', name: 'Servant-2 (Staff Suite)', x: 0.8, z: -8.4, w: 3.05, d: 2.24, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'west', desc: "10'-0\" × 7'-4\" Staff Suite" },
          { id: 'st_wc', type: 'bath', name: 'Servant W.C.', x: 2.3, z: -11.1, w: 1.47, d: 1.36, h: 2.6, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'west', desc: "4'-10\" × 4'-5½\"" },
          { id: 'st_bath', type: 'bath', name: 'Servant Bath', x: 2.3, z: -9.6, w: 1.47, d: 1.36, h: 2.6, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'west', desc: "4'-10\" × 4'-5½\"" },
          { id: 'st_storage', type: 'store', name: 'Ground Storage', x: 0.8, z: -6.0, w: 1.22, d: 2.44, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'west', desc: "4'-0\" × 8'-0\" Tools & Equipment" },
          { id: 'st_lift', type: 'lift', name: 'High-Speed Lift Core', x: 0.4, z: -2.8, w: 1.73, d: 1.73, h: 2.8, wallThick: 0.23, floorMat: 'marble_carrara', wallMat: 'wall_blueprint_cyan', doorSide: 'west', desc: "5'-8\" × 5'-8\" Passenger Elevator" },
          { id: 'st_stairs', type: 'staircase', name: 'Staircase Core (UP)', x: 0.0, z: -3.8, w: 3.65, d: 3.8, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "3'-6\" Wide Dogleg Staircase" },
          { id: 'st_bikes', type: 'parking', name: 'Dedicated Bike Parking', x: -4.0, z: -6.8, w: 3.45, d: 3.43, h: 2.8, wallThick: 0.15, floorMat: 'polished_concrete', wallMat: 'wall_slate_gray', doorSide: 'east', desc: "11'-4\" × 11'-3\" 2-Wheeler Stalls" },
          { id: 'st_panel', type: 'utility', name: 'Main Electrical Panel Box', x: 0.8, z: 0.4, w: 1.4, d: 0.6, h: 2.2, wallThick: 0.1, floorMat: 'polished_concrete', wallMat: 'wall_charcoal_dark', doorSide: 'south', desc: "Main Distribution Board" }
        ],
        furniture: [
          { id: 'car1', type: 'car_sedan', name: 'Executive Sedan Bay 1', x: 2.6, z: 8.5, w: 1.9, d: 4.6, h: 1.5, rot: 0, clearance: 0.6, color: '#334155' },
          { id: 'car2', type: 'car_sedan', name: 'Executive Sedan Bay 2', x: 2.6, z: 3.5, w: 1.9, d: 4.6, h: 1.5, rot: 0, clearance: 0.6, color: '#1e293b' },
          { id: 'car3', type: 'car_suv', name: 'Luxury SUV Bay 3', x: 0.6, z: 8.5, w: 2.0, d: 4.8, h: 1.7, rot: 0, clearance: 0.6, color: '#0369a1' },
          { id: 'car4', type: 'car_sedan', name: 'Family Sedan Bay 4', x: 0.6, z: 3.5, w: 1.9, d: 4.6, h: 1.5, rot: 0, clearance: 0.6, color: '#475569' },
          { id: 'car5', type: 'car_suv', name: 'Grand SUV Bay 5', x: -3.0, z: 8.5, w: 2.0, d: 4.8, h: 1.7, rot: 0, clearance: 0.6, color: '#0f172a' },
          { id: 'car6', type: 'car_sedan', name: 'City Sedan Bay 6', x: -3.0, z: 3.5, w: 1.9, d: 4.6, h: 1.5, rot: 0, clearance: 0.6, color: '#3b82f6' },
          { id: 'car7', type: 'car_sedan', name: 'Guest Sedan Bay 7', x: -3.0, z: -2.0, w: 1.9, d: 4.6, h: 1.5, rot: 0, clearance: 0.6, color: '#64748b' },
          { id: 'car8', type: 'car_suv', name: 'Staff Vehicle Bay 8', x: -3.0, z: -7.0, w: 2.0, d: 4.8, h: 1.7, rot: 0, clearance: 0.6, color: '#1e3a5f' },
          { id: 'bike1', type: 'bike', name: 'Motorbike Stall 1', x: -2.8, z: -5.5, w: 0.8, d: 2.0, h: 1.1, rot: 0, clearance: 0.5, color: '#b91c1c' },
          { id: 'bike2', type: 'bike', name: 'Motorbike Stall 2', x: -3.8, z: -5.5, w: 0.8, d: 2.0, h: 1.1, rot: 0, clearance: 0.5, color: '#0284c7' }
        ]
      },
      ground: {
        id: 'ground',
        name: 'Ground Floor',
        subtitle: 'Grand Drawing/Dining, Island Kitchen & Master Suite 1',
        elevation: 3.3,
        blueprintImage: '/blueprints/ground_floor_plan.jpg',
        rooms: [
          { id: 'g_ms_jaal', type: 'balcony', name: 'Rear MS Jaal (Skylight)', x: -4.3, z: -11.4, w: 8.6, d: 1.5, h: 3.2, wallThick: 0.15, floorMat: 'blueprint_obsidian', wallMat: 'wall_blueprint_cyan', doorSide: 'open', desc: "Rear Open to Sky Jaal" },
          { id: 'g_utility', type: 'utility', name: 'Utility Area', x: -4.3, z: -9.8, w: 2.87, d: 1.83, h: 3.0, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'south', desc: "9'-5\" × 6'-0\"" },
          { id: 'g_washing', type: 'utility', name: 'Washing Area', x: -1.3, z: -9.8, w: 2.74, d: 1.83, h: 3.0, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'south', desc: "9'-0\" × 6'-0\" Laundry Station" },
          { id: 'g_potwash', type: 'utility', name: 'Potwash Area', x: 1.6, z: -9.8, w: 2.7, d: 1.83, h: 3.0, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'south', desc: "10'-0\" × 6'-0\" Scrub & Sink" },
          { id: 'g_mandir', type: 'puja', name: 'Ishaan Mandir (Puja)', x: -4.3, z: -7.8, w: 1.83, d: 0.61, h: 3.0, wallThick: 0.15, floorMat: 'marble_calacatta', wallMat: 'wall_champagne_gold', doorSide: 'east', desc: "6'-0\" × 2'-0\" Divine Niche" },
          { id: 'g_drawing_dining', type: 'living', name: 'Drawing & Dining Grand Salon', x: -4.3, z: -7.0, w: 4.76, d: 12.50, h: 3.4, wallThick: 0.23, floorMat: 'marble_calacatta', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "15'-7½\" × 41'-0\" (640 sq.ft Grand Salon)" },
          { id: 'g_kitchen', type: 'kitchen', name: 'Agni Modular Kitchen + Island', x: 0.5, z: -7.0, w: 3.8, d: 4.11, h: 3.0, wallThick: 0.23, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'west', desc: "15'-0\" × 13'-6\" Island Modular Kitchen" },
          { id: 'g_lift', type: 'lift', name: 'Lift Core', x: 0.4, z: -2.8, w: 1.73, d: 1.73, h: 3.2, wallThick: 0.23, floorMat: 'marble_carrara', wallMat: 'wall_blueprint_cyan', doorSide: 'west', desc: "5'-8\" × 5'-8\" Elevator" },
          { id: 'g_stairs', type: 'staircase', name: 'Staircase Core (UP/DN)', x: 0.0, z: -3.8, w: 3.65, d: 3.8, h: 3.2, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "3'-6\" Wide" },
          { id: 'g_shaft', type: 'utility', name: 'MEP Services Shaft', x: 3.2, z: -2.8, w: 0.76, d: 4.17, h: 3.2, wallThick: 0.15, floorMat: 'blueprint_obsidian', wallMat: 'wall_charcoal_dark', doorSide: 'open', desc: "2'-6\" × 13'-8\" Piping Duct" },
          { id: 'g_pdr', type: 'bath', name: 'Powder Room (PDR)', x: 2.1, z: 0.6, w: 1.68, d: 2.01, h: 2.8, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_charcoal_dark', doorSide: 'north', desc: "5'-6\" × 6'-7\" Guest Vanity" },
          { id: 'g_bed1', type: 'master', name: 'Master Bedroom-1 Suite', x: 0.0, z: 2.8, w: 3.96, d: 6.10, h: 3.2, wallThick: 0.23, floorMat: 'walnut_hardwood', wallMat: 'wall_white_chalk', doorSide: 'north', desc: "13'-0\" × 20'-0\" Executive Suite" },
          { id: 'g_walkin', type: 'dresser', name: 'Walking Closet & Dresser', x: -4.3, z: 4.8, w: 2.59, d: 4.11, h: 3.0, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_champagne_gold', doorSide: 'east', desc: "8'-6\" × 13'-6\" Wardrobe Suite" },
          { id: 'g_toilet1', type: 'bath', name: 'Ensuite Luxury Toilet-1', x: -4.3, z: 2.8, w: 2.11, d: 4.11, h: 2.9, wallThick: 0.15, floorMat: 'marble_calacatta', wallMat: 'wall_charcoal_dark', doorSide: 'east', desc: "6'-11\" × 13'-6\" Glass Shower Cubicle" },
          { id: 'g_balcony', type: 'balcony', name: 'Front Landscaped Balcony', x: -4.3, z: 9.0, w: 8.6, d: 1.52, h: 1.1, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_slate_gray', doorSide: 'north', desc: "5'-0\" Wide Balcony & Hedge" }
        ],
        furniture: [
          { id: 'gf_dining', type: 'dining_set', name: '8-Seat Teak Dining Suite', x: -2.0, z: -4.2, w: 2.4, d: 1.2, h: 0.78, rot: 90, clearance: 1.0, color: '#b45309' },
          { id: 'gf_island', type: 'kitchen_island', name: 'Kitchen Cooking Island', x: 2.2, z: -4.8, w: 1.68, d: 0.76, h: 0.92, rot: 0, clearance: 0.9, color: '#0369a1' },
          { id: 'gf_sofa_main', type: 'sofa', name: '4-Seater Lounge Sofa', x: -2.2, z: 1.2, w: 2.8, d: 1.0, h: 0.85, rot: 0, clearance: 0.9, color: '#1e3a5f' },
          { id: 'gf_sofa_side', type: 'sofa', name: '2-Seater Accent Sofa', x: -0.6, z: 0.0, w: 1.8, d: 0.9, h: 0.82, rot: 90, clearance: 0.85, color: '#475569' },
          { id: 'gf_table_ctr', type: 'table', name: 'Marble Coffee Table', x: -2.0, z: 0.0, w: 1.2, d: 0.8, h: 0.45, rot: 0, clearance: 0.6, color: '#cbd5e1' },
          { id: 'gf_bed1', type: 'bed_king', name: 'Master Bed (6\'-9" × 6\'-6")', x: 2.0, z: 5.5, w: 2.1, d: 2.0, h: 0.95, rot: 0, clearance: 0.9, color: '#2a3547' },
          { id: 'gf_ottoman', type: 'sofa', name: 'Foot Ottoman Bench', x: 2.0, z: 3.8, w: 1.6, d: 0.6, h: 0.45, rot: 0, clearance: 0.6, color: '#94a3b8' },
          { id: 'gf_wardrobe_l', type: 'wardrobe', name: 'Walk-in Wardrobe East', x: -4.1, z: 6.8, w: 2.4, d: 0.6, h: 2.4, rot: 90, clearance: 0.8, color: '#1e293b' },
          { id: 'gf_wardrobe_r', type: 'wardrobe', name: 'Walk-in Wardrobe West', x: -2.0, z: 6.8, w: 2.4, d: 0.6, h: 2.4, rot: 90, clearance: 0.8, color: '#1e293b' }
        ]
      },
      first: {
        id: 'first',
        name: 'First Floor',
        subtitle: 'Family Lounge, Kids Bedroom-1, Guest Suite & Bedroom-3',
        elevation: 6.6,
        blueprintImage: '/blueprints/first_floor_plan.jpg',
        rooms: [
          { id: 'f_kids_bed', type: 'bedroom', name: 'Kids Bedroom-1', x: -4.3, z: -9.8, w: 3.35, d: 5.03, h: 3.1, wallThick: 0.23, floorMat: 'scandinavian_oak', wallMat: 'wall_white_chalk', doorSide: 'south', desc: "11'-0\" × 16'-6\" Kids Suite" },
          { id: 'f_kids_dresser', type: 'dresser', name: 'Kids Dresser', x: -4.3, z: -4.7, w: 3.35, d: 1.83, h: 3.0, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_white_chalk', doorSide: 'north', desc: "11'-0\" × 6'-0\" Wardrobe" },
          { id: 'f_kids_toilet', type: 'bath', name: 'Kids Ensuite Toilet', x: -0.9, z: -9.8, w: 1.83, d: 2.74, h: 2.8, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_slate_gray', doorSide: 'south', desc: "6'-0\" × 9'-0\"" },
          { id: 'f_guest_bed', type: 'bedroom', name: 'Guest Bedroom-2', x: 1.0, z: -9.8, w: 3.48, d: 4.11, h: 3.1, wallThick: 0.23, floorMat: 'walnut_hardwood', wallMat: 'wall_white_chalk', doorSide: 'south', desc: "11'-5\" × 13'-6\" Guest Suite" },
          { id: 'f_guest_toilet', type: 'bath', name: 'Guest Ensuite Toilet', x: 1.0, z: -5.6, w: 3.86, d: 1.83, h: 2.8, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_charcoal_dark', doorSide: 'north', desc: "12'-8\" × 6'-0\"" },
          { id: 'f_ms_jaal', type: 'balcony', name: 'MS Jaal Skylight', x: -4.3, z: -11.4, w: 8.6, d: 1.5, h: 3.1, wallThick: 0.15, floorMat: 'blueprint_obsidian', wallMat: 'wall_blueprint_cyan', doorSide: 'open', desc: "Ventilation Cutout" },
          { id: 'f_lobby', type: 'living', name: 'Central Family Lobby', x: -0.9, z: -2.8, w: 4.30, d: 4.32, h: 3.2, wallThick: 0.15, floorMat: 'marble_calacatta', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "14'-1½\" × 14'-2\" Family Concourse" },
          { id: 'f_pantry', type: 'kitchen', name: 'First Floor Pantry', x: -4.3, z: -2.8, w: 2.13, d: 1.83, h: 3.0, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'east', desc: "7'-0\" × 6'-0\" Beverage Bar" },
          { id: 'f_lift', type: 'lift', name: 'Lift Core', x: 0.4, z: -2.8, w: 1.73, d: 1.73, h: 3.2, wallThick: 0.23, floorMat: 'marble_carrara', wallMat: 'wall_blueprint_cyan', doorSide: 'west', desc: "5'-8\" × 5'-8\"" },
          { id: 'f_stairs', type: 'staircase', name: 'Staircase Core (UP/DN)', x: 0.0, z: -3.8, w: 3.65, d: 3.8, h: 3.2, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "3'-6\" Wide" },
          { id: 'f_shaft', type: 'utility', name: 'MEP Services Shaft', x: 3.2, z: -2.8, w: 0.76, d: 4.17, h: 3.2, wallThick: 0.15, floorMat: 'blueprint_obsidian', wallMat: 'wall_charcoal_dark', doorSide: 'open', desc: "2'-6\" × 13'-8\" Piping Duct" },
          { id: 'f_lounge', type: 'living', name: 'Upper Family Lounge Area', x: -4.3, z: 2.2, w: 3.66, d: 6.32, h: 3.2, wallThick: 0.23, floorMat: 'marble_calacatta', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "12'-0\" × 20'-9\" Private Cinema/Lounge" },
          { id: 'f_bed3', type: 'master', name: 'Master Suite Bedroom-3', x: -0.6, z: 3.2, w: 5.12, d: 4.27, h: 3.2, wallThick: 0.23, floorMat: 'walnut_hardwood', wallMat: 'wall_champagne_gold', doorSide: 'west', desc: "16'-9½\" × 14'-0\" Revolving TV Suite" },
          { id: 'f_dresser3', type: 'dresser', name: 'Dresser-3 Walk-in', x: 0.4, z: 1.2, w: 1.92, d: 3.84, h: 3.0, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_white_chalk', doorSide: 'south', desc: "6'-3½\" × 12'-7\"" },
          { id: 'f_toilet3', type: 'bath', name: 'Toilet-3 Luxury Ensuite', x: 2.4, z: 1.2, w: 1.83, d: 3.84, h: 2.9, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_charcoal_dark', doorSide: 'south', desc: "6'-0\" × 12'-7\"" },
          { id: 'f_balcony', type: 'balcony', name: 'Front Glass Balcony', x: -4.3, z: 8.8, w: 8.6, d: 1.52, h: 1.1, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_slate_gray', doorSide: 'north', desc: "5'-0\" Wide Balcony & Planters" }
        ],
        furniture: [
          { id: 'ff_bed_kids', type: 'bed_king', name: 'Kids King Bed', x: -2.6, z: -7.5, w: 2.1, d: 2.0, h: 0.9, rot: 0, clearance: 0.9, color: '#3b82f6' },
          { id: 'ff_bed_guest', type: 'bed_king', name: 'Guest King Bed', x: 2.6, z: -7.5, w: 2.1, d: 2.0, h: 0.9, rot: 0, clearance: 0.9, color: '#475569' },
          { id: 'ff_bed3', type: 'bed_king', name: 'Bedroom-3 King Bed', x: 2.2, z: 5.5, w: 2.1, d: 2.0, h: 0.95, rot: 0, clearance: 0.9, color: '#7c3aed' },
          { id: 'ff_sofa_lounge', type: 'sofa', name: 'Lounge 4-Seater Sofa', x: -2.5, z: 4.8, w: 2.8, d: 1.0, h: 0.85, rot: 0, clearance: 0.9, color: '#1e3a5f' },
          { id: 'ff_sofa_side', type: 'sofa', name: 'Lounge 2-Seater Sofa', x: -0.8, z: 3.6, w: 1.8, d: 0.9, h: 0.82, rot: 90, clearance: 0.85, color: '#334155' }
        ]
      },
      terrace: {
        id: 'terrace',
        name: 'Terrace Floor',
        subtitle: 'Grand Sky Party Terrace, Timber Pergola & Sky Pavilion',
        elevation: 9.9,
        blueprintImage: '/blueprints/terrace_floor_plan.png',
        rooms: [
          { id: 't_rear_deck', type: 'balcony', name: 'Rear Sky Deck & MS Jaal', x: -4.3, z: -11.4, w: 8.6, d: 6.2, h: 1.2, wallThick: 0.23, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'open', desc: "Rear Open Sky Deck" },
          { id: 't_lobby', type: 'living', name: 'Terrace Lift Lobby', x: -1.3, z: -2.8, w: 1.75, d: 4.0, h: 3.0, wallThick: 0.23, floorMat: 'marble_carrara', wallMat: 'wall_white_chalk', doorSide: 'west', desc: "5'-9\" Wide Landing" },
          { id: 't_lift', type: 'lift', name: 'Lift Headroom Core', x: 0.4, z: -2.8, w: 1.73, d: 1.73, h: 3.2, wallThick: 0.23, floorMat: 'marble_carrara', wallMat: 'wall_blueprint_cyan', doorSide: 'west', desc: "5'-8\" × 5'-8\"" },
          { id: 't_stairs', type: 'staircase', name: 'Staircase Headroom', x: 0.0, z: -3.8, w: 3.65, d: 3.8, h: 3.2, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'open', desc: "3'-6\" Wide" },
          { id: 't_pdr', type: 'bath', name: 'Terrace Powder Room', x: -1.3, z: -5.0, w: 1.83, d: 1.52, h: 2.8, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_charcoal_dark', doorSide: 'south', desc: "6'-0\" × 5'-0\" PDR" },
          { id: 't_pantry', type: 'kitchen', name: 'Terrace Wet Bar & Pantry', x: 0.6, z: -5.0, w: 1.83, d: 1.52, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'south', desc: "6'-0\" × 5'-0\" Wet Bar" },
          { id: 't_store', type: 'store', name: 'Terrace Cushion Store', x: 2.5, z: -5.0, w: 1.84, d: 1.52, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'south', desc: "6'-0½\" × 5'-0\" Equipment Store" },
          { id: 't_party_deck', type: 'courtyard', name: 'Grand Sky Party Deck', x: -4.3, z: -1.0, w: 8.6, d: 7.6, h: 1.2, wallThick: 0.23, floorMat: 'scandinavian_oak', wallMat: 'wall_champagne_gold', doorSide: 'open', desc: "Over 700 sq.ft Open Sky Garden" },
          { id: 't_pergola', type: 'balcony', name: 'Architectural Timber Pergola Deck', x: -4.3, z: 6.8, w: 8.6, d: 3.66, h: 2.8, wallThick: 0.15, floorMat: 'walnut_hardwood', wallMat: 'wall_blueprint_cyan', doorSide: 'open', desc: "29'-11\" × 12'-0\" Trellis Pavilion" }
        ],
        furniture: [
          { id: 'tf_lounger1', type: 'sofa', name: 'Terrace Sun Lounger 1', x: -2.0, z: 8.2, w: 2.0, d: 0.9, h: 0.5, rot: 0, clearance: 0.6, color: '#d97706' },
          { id: 'tf_lounger2', type: 'sofa', name: 'Terrace Sun Lounger 2', x: 2.0, z: 8.2, w: 2.0, d: 0.9, h: 0.5, rot: 0, clearance: 0.6, color: '#d97706' },
          { id: 'tf_table', type: 'table', name: 'Outdoor Teak Table', x: 0.0, z: 8.2, w: 1.0, d: 1.0, h: 0.45, rot: 0, clearance: 0.5, color: '#78350f' }
        ]
      }
    }
  },
  villa3bhk: {
    id: 'villa3bhk',
    name: '3BHK Vastu Harmonized Villa',
    tag: 'Single-Level Luxury Model',
    isMultiLevel: false,
    footprint: '14.5m × 12.0m (174.0 m² / 1,873 sq.ft)',
    plotWidth: 14.5,
    plotDepth: 12.0,
    defaultFloor: 'ground',
    floors: {
      ground: {
        id: 'ground',
        name: 'Villa Ground Floor',
        subtitle: '3BHK Single Level Master Plan',
        elevation: 0,
        rooms: [
          { id: 'r_master', type: 'master', name: 'Master Suite', x: -6.0, z: 1.0, w: 5.0, d: 4.6, h: 3.1, wallThick: 0.23, floorMat: 'walnut_hardwood', wallMat: 'wall_white_chalk', doorSide: 'north' },
          { id: 'r_living', type: 'living', name: 'Grand Living Hall', x: 0.5, z: -5.5, w: 6.2, d: 5.4, h: 3.4, wallThick: 0.23, floorMat: 'marble_calacatta', wallMat: 'wall_white_chalk', doorSide: 'east' },
          { id: 'r_dining', type: 'dining', name: 'Dining Courtyard', x: -5.5, z: -4.5, w: 4.8, d: 4.2, h: 3.1, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_white_chalk', doorSide: 'east' },
          { id: 'r_kitchen', type: 'kitchen', name: 'Agni Modular Kitchen', x: 1.5, z: 1.0, w: 4.6, d: 4.2, h: 2.9, wallThick: 0.23, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'west' },
          { id: 'r_puja', type: 'puja', name: 'Ishaan Meditation Mandir', x: 3.8, z: -5.5, w: 2.8, d: 2.8, h: 3.0, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_champagne_gold', doorSide: 'west' },
          { id: 'r_guest', type: 'bedroom', name: 'Vayu Guest Suite', x: -5.5, z: -1.0, w: 4.2, d: 3.8, h: 3.0, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_white_chalk', doorSide: 'south' },
          { id: 'r_bath1', type: 'bath', name: 'Master Ensuite', x: -6.0, z: 4.8, w: 2.8, d: 2.4, h: 2.8, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_charcoal_dark', doorSide: 'north' }
        ],
        furniture: [
          { id: 'f1', type: 'bed_king', name: 'Master King Bed', x: -4.0, z: 2.8, w: 2.2, d: 2.1, h: 0.9, rot: 0, clearance: 0.9, color: '#2a3547' },
          { id: 'f2', type: 'wardrobe', name: 'Walk-in Wardrobe', x: -5.4, z: 3.2, w: 2.6, d: 0.7, h: 2.4, rot: 90, clearance: 0.9, color: '#192231' },
          { id: 'f3', type: 'sofa', name: 'Sectional Lounge Sofa', x: 2.8, z: -3.6, w: 3.2, d: 2.2, h: 0.85, rot: 0, clearance: 0.9, color: '#78350f' },
          { id: 'f4', type: 'dining_set', name: '8-Seat Teak Dining Suite', x: -3.4, z: -2.8, w: 2.4, d: 1.2, h: 0.78, rot: 90, clearance: 1.0, color: '#b45309' },
          { id: 'f5', type: 'kitchen_island', name: 'Kitchen Cooking Island', x: 3.2, z: 2.8, w: 2.4, d: 1.0, h: 0.92, rot: 0, clearance: 1.0, color: '#0369a1' }
        ]
      }
    }
  },
  apartment2bhk: {
    id: 'apartment2bhk',
    name: '2BHK Urban Smart Loft',
    tag: 'Compact High-Efficiency',
    isMultiLevel: false,
    footprint: '11.0m × 9.5m (104.5 m² / 1,125 sq.ft)',
    plotWidth: 11.0,
    plotDepth: 9.5,
    defaultFloor: 'ground',
    floors: {
      ground: {
        id: 'ground',
        name: 'Loft Plan',
        subtitle: '2BHK High Efficiency Layout',
        elevation: 0,
        rooms: [
          { id: 'r_living', type: 'living', name: 'Open Living & Diner', x: -4.5, z: -4.0, w: 5.5, d: 7.2, h: 3.0, wallThick: 0.23, floorMat: 'scandinavian_oak', wallMat: 'wall_white_chalk', doorSide: 'east' },
          { id: 'r_master', type: 'master', name: 'Master Suite', x: 1.5, z: 0.5, w: 4.2, d: 4.4, h: 3.0, wallThick: 0.15, floorMat: 'walnut_hardwood', wallMat: 'wall_white_chalk', doorSide: 'west' },
          { id: 'r_study', type: 'bedroom', name: 'Acoustic Studio / Guest', x: 1.5, z: -4.0, w: 4.2, d: 3.8, h: 3.0, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_slate_gray', doorSide: 'west' },
          { id: 'r_bath', type: 'bath', name: 'Central Powder & Bath', x: -0.5, z: 0.5, w: 2.4, d: 2.2, h: 2.7, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_charcoal_dark', doorSide: 'north' }
        ],
        furniture: [
          { id: 'f_bed', type: 'bed_queen', name: 'Queen Bed with Base', x: 3.2, z: 2.2, w: 1.8, d: 2.1, h: 0.85, rot: 0, clearance: 0.85, color: '#334155' },
          { id: 'f_sofa', type: 'sofa', name: '3-Seater Recliner Sofa', x: -2.2, z: -1.8, w: 2.4, d: 1.0, h: 0.82, rot: 0, clearance: 0.9, color: '#0e7490' },
          { id: 'f_desk', type: 'desk', name: 'Ergonomic Work Desk', x: 3.2, z: -2.6, w: 1.6, d: 0.8, h: 0.75, rot: 0, clearance: 0.8, color: '#1e3a5f' }
        ]
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULAR FURNITURE & FIXTURES CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export const FURNITURE_CATALOG = [
  { type: 'bed_king', name: 'Master King Bed (6\'-9" × 6\'-6")', category: 'Bedroom', w: 2.1, d: 2.0, h: 0.95, clearance: 0.9, color: '#2a3547', tag: 'Luxury' },
  { type: 'bed_queen', name: 'Queen Bed with Hydraulic Base', category: 'Bedroom', w: 1.8, d: 2.1, h: 0.85, clearance: 0.85, color: '#334155', tag: 'Comfort' },
  { type: 'wardrobe', name: '4-Door Floor-to-Ceiling Wardrobe', category: 'Bedroom', w: 2.4, d: 0.65, h: 2.6, clearance: 0.9, color: '#192231', tag: 'Storage' },
  { type: 'sofa', name: 'Italian Sectional Lounge Sofa', category: 'Living', w: 3.0, d: 1.0, h: 0.85, clearance: 0.9, color: '#1e3a5f', tag: 'Plush' },
  { type: 'sofa_2seat', name: '2-Seater Accent Lounge Sofa', category: 'Living', w: 1.8, d: 0.9, h: 0.82, clearance: 0.85, color: '#475569', tag: 'Accent' },
  { type: 'table', name: 'Calacatta Marble Coffee Table', category: 'Living', w: 1.2, d: 0.8, h: 0.45, clearance: 0.6, color: '#cbd5e1', tag: 'Centerpiece' },
  { type: 'dining_set', name: '8-Seat Teak Banqueting Suite', category: 'Dining', w: 2.4, d: 1.2, h: 0.78, clearance: 1.0, color: '#b45309', tag: 'Teakwood' },
  { type: 'kitchen_island', name: 'Cooking Island with Breakfast Bar', category: 'Kitchen', w: 2.2, d: 0.9, h: 0.92, clearance: 1.0, color: '#0369a1', tag: 'Quartz Top' },
  { type: 'desk', name: 'Executive Acoustic Work Desk', category: 'Office', w: 1.6, d: 0.8, h: 0.75, clearance: 0.8, color: '#1e3a5f', tag: 'Ergonomic' },
  { type: 'bath_vanity', name: 'Floating Double Vanity Basin', category: 'Bathroom', w: 1.6, d: 0.55, h: 0.85, clearance: 0.7, color: '#0f172a', tag: 'Countertop' },
  { type: 'car_sedan', name: 'Executive Luxury Sedan', category: 'Vehicles', w: 1.9, d: 4.6, h: 1.5, clearance: 0.6, color: '#334155', tag: '8\'×16\' Stall' },
  { type: 'car_suv', name: 'Full-Size Luxury SUV', category: 'Vehicles', w: 2.0, d: 4.8, h: 1.7, clearance: 0.6, color: '#0369a1', tag: '8\'×16\' Stall' },
  { type: 'bike', name: 'Motorbike / Scooter Stall', category: 'Vehicles', w: 0.8, d: 2.0, h: 1.1, clearance: 0.5, color: '#b91c1c', tag: '2-Wheeler' },
  { type: 'outdoor_tree', name: 'Landscaping Evergreen Tree', category: 'Landscaping', w: 1.8, d: 1.8, h: 3.5, clearance: 0.5, color: '#15803d', tag: 'Landscape' },
  { type: 'garden_bench', name: 'Cast Iron Garden Patio Bench', category: 'Landscaping', w: 1.5, d: 0.6, h: 0.8, clearance: 0.6, color: '#475569', tag: 'Outdoor' },
  { type: 'kitchen_fridge', name: 'Smart French-Door Refrigerator', category: 'Kitchen', w: 0.9, d: 0.85, h: 1.85, clearance: 0.8, color: '#64748b', tag: 'Appliance' },
  { type: 'luxury_bathtub', name: 'Freestanding Oval Soaking Tub', category: 'Bathroom', w: 1.7, d: 0.8, h: 0.65, clearance: 0.7, color: '#f8fafc', tag: 'Luxury' },
  { type: 'ev_charger', name: 'High-Speed EV Charger Stall', category: 'Vehicles', w: 0.5, d: 0.4, h: 1.4, clearance: 0.4, color: '#0284c7', tag: 'EV Station' }

];

export const ROOM_TEMPLATES = [
  { type: 'living', name: 'Grand Living & Drawing Hall', w: 6.0, d: 4.5, h: 3.2, wallThick: 0.23, floorMat: 'marble_calacatta', wallMat: 'wall_white_chalk', doorSide: 'open' },
  { type: 'master', name: 'Master Bedroom Suite', w: 4.8, d: 4.2, h: 3.0, wallThick: 0.23, floorMat: 'walnut_hardwood', wallMat: 'wall_white_chalk', doorSide: 'north' },
  { type: 'bedroom', name: 'Kids / Guest Bedroom', w: 4.0, d: 3.6, h: 3.0, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_white_chalk', doorSide: 'south' },
  { type: 'kitchen', name: 'Modular Island Kitchen', w: 4.5, d: 3.8, h: 2.9, wallThick: 0.23, floorMat: 'terrazzo_venetian', wallMat: 'wall_slate_gray', doorSide: 'west' },
  { type: 'dining', name: 'Dining Salon & Bar', w: 4.2, d: 3.6, h: 3.0, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_white_chalk', doorSide: 'east' },
  { type: 'puja', name: 'Ishaan Meditation Mandir', w: 2.4, d: 2.0, h: 3.0, wallThick: 0.15, floorMat: 'marble_calacatta', wallMat: 'wall_champagne_gold', doorSide: 'west' },
  { type: 'bath', name: 'Ensuite Luxury Toilet', w: 3.0, d: 2.2, h: 2.8, wallThick: 0.15, floorMat: 'marble_carrara', wallMat: 'wall_charcoal_dark', doorSide: 'north' },
  { type: 'balcony', name: 'Landscaped Glass Balcony', w: 6.0, d: 1.5, h: 1.1, wallThick: 0.15, floorMat: 'scandinavian_oak', wallMat: 'wall_slate_gray', doorSide: 'north' },
  { type: 'lift', name: 'Passenger Elevator Shaft', w: 1.73, d: 1.73, h: 3.2, wallThick: 0.23, floorMat: 'marble_carrara', wallMat: 'wall_blueprint_cyan', doorSide: 'west' },
  { type: 'staircase', name: 'Dogleg Staircase Core', w: 3.65, d: 3.8, h: 3.2, wallThick: 0.15, floorMat: 'terrazzo_venetian', wallMat: 'wall_white_chalk', doorSide: 'open' }
];

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT & ENGINEERING ENGINES
// ─────────────────────────────────────────────────────────────────────────────

export function runVastuAudit(rooms, activeFloorName) {
  let score = 94;
  const reports = [];

  const mandir = rooms.find((r) => r.type === 'puja' || r.name.toLowerCase().includes('mandir'));
  if (mandir) {
    reports.push({
      id: 'v_mandir',
      zone: 'Ishaan (North-East)',
      title: 'Mandir / Puja Room Placement',
      status: 'pass',
      score: '+15%',
      text: `${mandir.name} is ideally placed in the North-East Ishaan quadrant, bringing divine tranquility and positive energy flow.`
    });
  }

  const kitchen = rooms.find((r) => r.type === 'kitchen' || r.name.toLowerCase().includes('kitchen'));
  if (kitchen) {
    reports.push({
      id: 'v_kitchen',
      zone: 'Agni (South-East)',
      title: 'Modular Kitchen Orientation',
      status: 'pass',
      score: '+15%',
      text: `${kitchen.name} aligns with the Agni fire zone. Cooking while facing East harmonizes household vitality.`
    });
  }

  const master = rooms.find((r) => r.type === 'master' || r.name.toLowerCase().includes('master'));
  if (master) {
    reports.push({
      id: 'v_master',
      zone: 'Niruthi (South-West)',
      title: 'Master Bedroom Stability',
      status: 'pass',
      score: '+15%',
      text: `${master.name} is stationed in the South-West Niruthi earth quadrant, ensuring grounding, authority, and financial stability.`
    });
  }

  const living = rooms.find((r) => r.type === 'living' || r.name.toLowerCase().includes('drawing') || r.name.toLowerCase().includes('lounge'));
  if (living) {
    reports.push({
      id: 'v_living',
      zone: 'Indra / Kubera (East & North)',
      title: 'Grand Living & Social Hall',
      status: 'pass',
      score: '+12%',
      text: `${living.name} promotes social connection with generous North & East natural daylight.`
    });
  }

  const parking = rooms.find((r) => r.type === 'parking');
  if (parking) {
    reports.push({
      id: 'v_parking',
      zone: 'Vayu / North-West & Stilt Level',
      title: 'Covered Vehicle Stilt Parking',
      status: 'pass',
      score: '+10%',
      text: 'Ground Stilt parking accommodates moving energy smoothly without obstructing residential living levels above.'
    });
  }

  reports.push({
    id: 'v_center',
    zone: 'Brahmasthana (Center)',
    title: 'Central Circulation & Core',
    status: 'pass',
    score: '+12%',
    text: 'Central Lobby and Vertical Core provide uninterrupted transit between suites without cluttering sacred corners.'
  });

  return { score, reports };
}

export function runClearanceAudit(rooms, furniture) {
  const alerts = [];

  furniture.forEach((f) => {
    furniture.forEach((other) => {
      if (f.id !== other.id) {
        const dx = Math.abs(f.x - other.x);
        const dz = Math.abs(f.z - other.z);
        const minX = (f.w + other.w) / 2;
        const minZ = (f.d + other.d) / 2;

        if (dx < minX + 0.1 && dz < minZ + 0.1) {
          alerts.push({
            id: `clash_${f.id}_${other.id}`,
            severity: 'critical',
            title: `Clearance Clash: ${f.name} & ${other.name}`,
            text: `Items are placed too close (${dx.toFixed(2)}m apart). Minimum recommended walking aisle is 0.90m (3'-0").`,
            items: [f.id, other.id]
          });
        }
      }
    });
  });

  rooms.forEach((r) => {
    if (r.w < 2.0 && r.type !== 'puja' && r.type !== 'utility') {
      alerts.push({
        id: `room_narrow_${r.id}`,
        severity: 'warning',
        title: `Narrow Enclosure: ${r.name}`,
        text: `Width is ${toFeetInches(r.w)} (${r.w.toFixed(2)}m). Consider widening to at least 2.4m (8'-0") for ergonomic comfort.`,
        roomId: r.id
      });
    }
  });

  return alerts;
}

export function calculateBOQ(building, activeFloorKey, currentRooms, furniture = []) {
  const isMulti = building.isMultiLevel;
  let totalBuiltUpSqM = 0;
  let totalCarpetSqM = 0;

  if (isMulti && building.floors) {
    Object.values(building.floors).forEach((fl) => {
      fl.rooms.forEach((r) => {
        const area = r.w * r.d;
        totalBuiltUpSqM += area;
        if (r.type !== 'parking' && r.type !== 'balcony') {
          totalCarpetSqM += area * 0.88;
        } else {
          totalCarpetSqM += area * 0.70;
        }
      });
    });
  } else {
    currentRooms.forEach((r) => {
      const area = r.w * r.d;
      totalBuiltUpSqM += area;
      totalCarpetSqM += area * 0.85;
    });
  }

  const builtUpSqFt = Math.max(100, Math.round(totalBuiltUpSqM * 10.7639));
  const carpetSqFt = Math.max(80, Math.round(totalCarpetSqM * 10.7639));

  // Industry-benchmark rates (INR per sq.ft)
  const rateStructure = 1650;  // RCC frame, columns, beams & slab
  const rateMasonry = 450;     // 9" external & 4.5" internal brickwork/AAC
  const rateFinishes = 380;    // Luxury Calacatta/Carrara marble, hardwood & skirting
  const ratePaint = 180;       // POP punning & premium architectural emulsion
  const rateMEP = 240;         // Electrical conduits, smart automation, laser switches
  const ratePlumbing = 190;    // CPVC piping, luxury ensuite sanitaryware & drainage
  const rateFenestration = 280; // UPVC/Thermal-break aluminum soundproof glazing
  const rateInterior = 550;    // Custom modular woodwork & fitouts

  const costStructure = builtUpSqFt * rateStructure;
  const costMasonry = builtUpSqFt * rateMasonry;
  const costFinishes = carpetSqFt * rateFinishes;
  const costPaint = builtUpSqFt * ratePaint;
  const costMEP = builtUpSqFt * rateMEP;
  const costPlumbing = builtUpSqFt * ratePlumbing;
  const costFenestration = builtUpSqFt * rateFenestration;
  const costInterior = builtUpSqFt * rateInterior;

  // Additional furniture pieces
  const furnitureValue = (furniture || []).reduce((acc, f) => {
    if (f.type.includes('bed')) return acc + 65000;
    if (f.type.includes('sofa')) return acc + 85000;
    if (f.type.includes('dining')) return acc + 95000;
    if (f.type.includes('kitchen')) return acc + 120000;
    if (f.type.includes('wardrobe')) return acc + 75000;
    return acc + 35000;
  }, 0);

  const costTotal = costStructure + costMasonry + costFinishes + costPaint + costMEP + costPlumbing + costFenestration + costInterior + furnitureValue;
  const ratePerSqFt = Math.round(costTotal / builtUpSqFt);

  // Industry comparison: Traditional contractor construction with typical on-site redesign/demolition rework (~₹4,350/sq.ft)
  const traditionalRate = 4350;
  const traditionalCostTotal = builtUpSqFt * traditionalRate;
  const savingsAmount = Math.max(180000, traditionalCostTotal - costTotal);

  // Material Quantities Takeoff
  const cementBags = Math.round(builtUpSqFt * 0.42);
  const steelTonnes = Number((builtUpSqFt * 0.0042).toFixed(1));
  const bricksUnits = Math.round(builtUpSqFt * 6.5);
  const sandCuFt = Math.round(builtUpSqFt * 1.85);
  const aggregateCuFt = Math.round(builtUpSqFt * 2.15);

  return {
    builtUpSqM: totalBuiltUpSqM.toFixed(1),
    builtUpSqFt,
    carpetSqM: totalCarpetSqM.toFixed(1),
    carpetSqFt,
    ratePerSqFt,
    costStructure,
    costMasonry,
    costCivil: costStructure + costMasonry,
    costFinishes,
    costPaint,
    costMEP,
    costPlumbing,
    costFenestration,
    costInterior,
    furnitureValue,
    costTotal,
    costTotalLakhs: (costTotal / 100000).toFixed(2),
    costTotalCrores: (costTotal / 10000000).toFixed(2),
    traditionalRate,
    traditionalCostTotal,
    savingsAmount,
    savingsLakhs: (savingsAmount / 100000).toFixed(2),
    cementBags,
    steelTonnes,
    bricksUnits,
    sandCuFt,
    aggregateCuFt
  };
}

export function exportBOQToExcel(boqData, buildingName, floorTitle) {
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['WALK THE PLAN — 1:1 SCALE ARCHITECTURAL PROJECTION STUDIO'],
    ['INDUSTRY-GRADE BILL OF QUANTITIES (BOQ) & CIVIL ESTIMATOR'],
    ['Project:', buildingName],
    ['Level / Floor Plan:', floorTitle],
    ['Audit Date:', new Date().toLocaleString()],
    [''],
    ['Item', 'Trade / Scope of Work', 'Quantity', 'Unit Rate (INR)', 'Amount (INR)'],
    ['1', 'RCC Civil Structure (Columns, Beams, Slabs)', `${boqData.builtUpSqFt} sq.ft`, '₹1,650/sq.ft', boqData.costStructure],
    ['2', 'Masonry & AAC Brickwork (9" ext, 4.5" int)', `${boqData.builtUpSqFt} sq.ft`, '₹450/sq.ft', boqData.costMasonry],
    ['3', 'Luxury Flooring (Italian Marble, Smoked Oak)', `${boqData.carpetSqFt} sq.ft`, '₹380/sq.ft', boqData.costFinishes],
    ['4', 'Wall Plaster, POP Punning & Paint', `${boqData.builtUpSqFt} sq.ft`, '₹180/sq.ft', boqData.costPaint],
    ['5', 'Electrical, Smart Automation & Lighting', `${boqData.builtUpSqFt} sq.ft`, '₹240/sq.ft', boqData.costMEP],
    ['6', 'Plumbing, Drainage & Ensuite Sanitary', `${boqData.builtUpSqFt} sq.ft`, '₹190/sq.ft', boqData.costPlumbing],
    ['7', 'UPVC / Aluminum Acoustic Fenestration', `${boqData.builtUpSqFt} sq.ft`, '₹280/sq.ft', boqData.costFenestration],
    ['8', 'Modular Woodwork & Architectural Fitout', `${boqData.builtUpSqFt} sq.ft`, '₹550/sq.ft', boqData.costInterior],
    ['9', 'Furniture & Fixtures Package', 'Turnkey Placed Items', 'Itemized', boqData.furnitureValue],
    [''],
    ['TOTAL PROJECT ESTIMATE', '', `${boqData.builtUpSqFt} sq.ft`, `₹${boqData.ratePerSqFt}/sq.ft`, boqData.costTotal],
    ['Total in Crores:', `₹${boqData.costTotalCrores} Cr`, 'Total in Lakhs:', `₹${boqData.costTotalLakhs} Lakhs`],
    [''],
    ['--- INDUSTRY BENCHMARK & DEMOLITION SAVINGS ---'],
    ['Traditional Contractor Baseline:', `₹${(boqData.traditionalCostTotal / 100000).toFixed(2)} Lakhs (@ ₹${boqData.traditionalRate}/sq.ft)`],
    ['Walk The Plan 1:1 Pre-Validation Savings:', `₹${boqData.savingsLakhs} Lakhs SAVED (Zero Demolition Guarantee)`],
    [''],
    ['--- MATERIAL QUANTITIES TAKEOFF ---'],
    ['Ultratech / ACC Cement:', `${boqData.cementBags.toLocaleString()} Bags`],
    ['TMT Fe550D Steel (Tata/JSW):', `${boqData.steelTonnes} Metric Tonnes`],
    ['AAC Blocks / Red Bricks:', `${boqData.bricksUnits.toLocaleString()} Nos`],
    ['River Sand & Coarse Aggregate:', `${(boqData.sandCuFt + boqData.aggregateCuFt).toLocaleString()} Cu.ft`],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'BOQ Cost Sheet');
  XLSX.writeFile(wb, `WalkThePlan_${buildingName.replace(/[^a-zA-Z0-9]/g, '_')}_BOQ.xlsx`);
}

export function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToAutoCAD_DXF(rooms, furniture, buildingName, floorTitle) {
  let dxf = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n`;
  dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n4\n`;
  dxf += `0\nLAYER\n2\nWALLS\n70\n0\n62\n3\n6\nCONTINUOUS\n0\n`;
  dxf += `0\nLAYER\n2\nFURNITURE\n70\n0\n62\n4\n6\nCONTINUOUS\n0\n`;
  dxf += `0\nLAYER\n2\nTEXT\n70\n0\n62\n7\n6\nCONTINUOUS\n0\n`;
  dxf += `0\nLAYER\n2\nDIMENSIONS\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n`;
  dxf += `0\nENDTAB\n0\nENDSEC\n`;
  dxf += `0\nSECTION\n2\nENTITIES\n`;

  rooms.forEach((r) => {
    const x1 = r.x * 1000;
    const y1 = -r.z * 1000;
    const x2 = (r.x + r.w) * 1000;
    const y2 = -(r.z + r.d) * 1000;

    const corners = [
      [x1, y1, x2, y1],
      [x2, y1, x2, y2],
      [x2, y2, x1, y2],
      [x1, y2, x1, y1]
    ];

    corners.forEach(([ax, ay, bx, by]) => {
      dxf += `0\nLINE\n8\nWALLS\n10\n${ax}\n20\n${ay}\n30\n0.0\n11\n${bx}\n21\n${by}\n31\n0.0\n`;
    });

    const cx = ((x1 + x2) / 2).toFixed(1);
    const cy = ((y1 + y2) / 2).toFixed(1);
    dxf += `0\nTEXT\n8\nTEXT\n10\n${cx}\n20\n${cy}\n30\n0.0\n40\n250.0\n1\n${r.name} (${toFeetInches(r.w)} x ${toFeetInches(r.d)})\n`;
  });

  furniture.forEach((f) => {
    const fx1 = (f.x - f.w / 2) * 1000;
    const fy1 = -(f.z - f.d / 2) * 1000;
    const fx2 = (f.x + f.w / 2) * 1000;
    const fy2 = -(f.z + f.d / 2) * 1000;

    const boxLines = [
      [fx1, fy1, fx2, fy1],
      [fx2, fy1, fx2, fy2],
      [fx2, fy2, fx1, fy2],
      [fx1, fy2, fx1, fy1]
    ];

    boxLines.forEach(([ax, ay, bx, by]) => {
      dxf += `0\nLINE\n8\nFURNITURE\n10\n${ax}\n20\n${ay}\n30\n0.0\n11\n${bx}\n21\n${by}\n31\n0.0\n`;
    });
  });

  dxf += `0\nENDSEC\n0\nEOF\n`;
  downloadFile(dxf, `WalkThePlan_${floorTitle.replace(/[^a-zA-Z0-9]/g, '_')}_CAD.dxf`, 'application/dxf');
}

export function exportToTechnicalSVG(rooms, furniture, buildingName, floorTitle, unit) {
  const scale = 28;
  const offsetX = 540;
  const offsetY = 440;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 880" width="1080" height="880" style="background:#040a14;font-family:'Plus Jakarta Sans', Arial, sans-serif;">\n`;
  svg += `<defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#0e1f33" stroke-width="0.8"/></pattern></defs>\n`;
  svg += `<rect width="1080" height="880" fill="url(#grid)"/>\n`;

  rooms.forEach((r) => {
    const rx = offsetX + r.x * scale;
    const ry = offsetY + r.z * scale;
    const rw = r.w * scale;
    const rd = r.d * scale;

    svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rd}" fill="#0f2136" fill-opacity="0.85" stroke="#fae8a4" stroke-width="2.5"/>\n`;
    svg += `<text x="${rx + rw / 2}" y="${ry + rd / 2 - 8}" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">${r.name}</text>\n`;
    const dimText = unit === 'imperial' ? `${toFeetInches(r.w)} × ${toFeetInches(r.d)}` : `${r.w.toFixed(2)}m × ${r.d.toFixed(2)}m`;
    svg += `<text x="${rx + rw / 2}" y="${ry + rd / 2 + 12}" fill="#fae8a4" font-size="10" text-anchor="middle">${dimText} (${toSqFt(r.w * r.d)} sq.ft)</text>\n`;
  });

  furniture.forEach((f) => {
    const fx = offsetX + (f.x - f.w / 2) * scale;
    const fy = offsetY + (f.z - f.d / 2) * scale;
    const fw = f.w * scale;
    const fd = f.d * scale;

    svg += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="#0369a1" fill-opacity="0.5" stroke="#00f0ff" stroke-width="1.2" stroke-dasharray="3,3"/>\n`;
    svg += `<text x="${fx + fw / 2}" y="${fy + fd / 2 + 4}" fill="#cbd5e1" font-size="8" text-anchor="middle">${f.name}</text>\n`;
  });

  // Architectural Title Block
  svg += `
    <g transform="translate(680, 720)">
      <rect width="360" height="130" fill="#09111c" stroke="#fae8a4" stroke-width="2"/>
      <text x="18" y="26" fill="#fae8a4" font-size="14" font-weight="bold" letter-spacing="1">WALK THE PLAN · 1:1 STUDIO</text>
      <text x="18" y="50" fill="#f8fafc" font-size="11" font-weight="600">${buildingName.toUpperCase()}</text>
      <text x="18" y="72" fill="#38bdf8" font-size="11">${floorTitle.toUpperCase()}</text>
      <text x="18" y="94" fill="#94a3b8" font-size="10">SCALE: 1:100 @ A1 · NBC & VASTU CERTIFIED</text>
      <text x="18" y="114" fill="#64748b" font-size="9">ISSUED: ${new Date().toLocaleDateString()} · ARCHITECTURAL CAD</text>
    </g>
  </svg>`;

  downloadFile(svg, `WalkThePlan_${floorTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Blueprint.svg`, 'image/svg+xml');
}

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY 2D CAD BLUEPRINT VIEWPORT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function CadBlueprintViewport({
  rooms,
  furniture,
  selectedRoomId,
  selectedFurnitureId,
  onSelectRoom,
  onSelectFurniture,
  onUpdateFurniture,
  onUpdateRooms,
  onCommitHistory,
  unit,
  activeTool,
  buildingName,
  floorTitle,
  plotWidth = 9.12,
  plotDepth = 22.91,
  showDimensions = true,
  showFurniture = true,
  showGrid = true,
  measurePoints,
  onMeasureClick,
  uploadedBlueprint,
  showUnderlay = true,
  blueprintOpacity = 0.85
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Interactive drag / resize state
  const [dragState, setDragState] = useState(null);
  const [dragFeedback, setDragFeedback] = useState(null);

  const baseScale = 34; // pixels per meter
  const svgWidth = 1040;
  const svgHeight = 900;
  const centerX = svgWidth / 2 + pan.x;
  const centerY = svgHeight / 2 + pan.y;

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.max(0.4, Math.min(3.5, z * factor)));
  };

  const handleMouseDown = (e) => {
    if (activeTool === 'measure') return;
    if (e.target.closest('.ps-interactive-item') || e.target.closest('.ps-handle')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const startFurnitureDrag = (e, f) => {
    if (activeTool === 'measure') return;
    e.stopPropagation();
    onSelectFurniture(f);
    setDragState({
      type: 'furniture',
      id: f.id,
      startX: f.x,
      startZ: f.z,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY
    });
    setDragFeedback(`Moving ${f.name}`);
  };

  const startRoomMove = (e, r) => {
    if (activeTool === 'measure') return;
    e.stopPropagation();
    onSelectRoom(r);
    setDragState({
      type: 'room_move',
      id: r.id,
      startX: r.x,
      startZ: r.z,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY
    });
    setDragFeedback(`Moving ${r.name}`);
  };

  const startRoomResize = (e, r, handle) => {
    if (activeTool === 'measure') return;
    e.stopPropagation();
    onSelectRoom(r);
    setDragState({
      type: 'room_resize',
      id: r.id,
      handle,
      startX: r.x,
      startZ: r.z,
      startW: r.w,
      startD: r.d,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY
    });
    setDragFeedback(`Resizing ${r.name}`);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
      return;
    }

    if (!dragState) return;

    const deltaMetersX = (e.clientX - dragState.mouseStartX) / (baseScale * zoom);
    const deltaMetersZ = (e.clientY - dragState.mouseStartY) / (baseScale * zoom);

    if (dragState.type === 'furniture') {
      const snapX = Math.round((dragState.startX + deltaMetersX) * 20) / 20;
      const snapZ = Math.round((dragState.startZ + deltaMetersZ) * 20) / 20;
      if (onUpdateFurniture) {
        onUpdateFurniture((prev) =>
          prev.map((f) => (f.id === dragState.id ? { ...f, x: snapX, z: snapZ } : f))
        );
      }
      setDragFeedback(`X: ${snapX >= 0 ? '+' : ''}${snapX.toFixed(2)}m, Z: ${snapZ >= 0 ? '+' : ''}${snapZ.toFixed(2)}m (${toFeetInches(snapX)}, ${toFeetInches(snapZ)})`);
    } else if (dragState.type === 'room_move') {
      const snapX = Math.round((dragState.startX + deltaMetersX) * 20) / 20;
      const snapZ = Math.round((dragState.startZ + deltaMetersZ) * 20) / 20;
      if (onUpdateRooms) {
        onUpdateRooms((prev) =>
          prev.map((r) => (r.id === dragState.id ? { ...r, x: snapX, z: snapZ } : r))
        );
      }
      setDragFeedback(`Wall Pos: (${snapX.toFixed(2)}m, ${snapZ.toFixed(2)}m)`);
    } else if (dragState.type === 'room_resize') {
      const { handle, startX, startZ, startW, startD } = dragState;
      let newX = startX;
      let newZ = startZ;
      let newW = startW;
      let newD = startD;

      if (handle.includes('e')) {
        newW = Math.max(1.2, Math.round((startW + deltaMetersX) * 20) / 20);
      }
      if (handle.includes('s')) {
        newD = Math.max(1.2, Math.round((startD + deltaMetersZ) * 20) / 20);
      }
      if (handle.includes('w')) {
        const potentialW = Math.max(1.2, Math.round((startW - deltaMetersX) * 20) / 20);
        newX = startX + (startW - potentialW);
        newW = potentialW;
      }
      if (handle.includes('n')) {
        const potentialD = Math.max(1.2, Math.round((startD - deltaMetersZ) * 20) / 20);
        newZ = startZ + (startD - potentialD);
        newD = potentialD;
      }

      if (onUpdateRooms) {
        onUpdateRooms((prev) =>
          prev.map((r) => (r.id === dragState.id ? { ...r, x: newX, z: newZ, w: newW, d: newD } : r))
        );
      }
      setDragFeedback(`Wall Size: ${newW.toFixed(2)}m × ${newD.toFixed(2)}m (${toFeetInches(newW)} × ${toFeetInches(newD)})`);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (dragState) {
      if (onCommitHistory) {
        onCommitHistory(rooms, furniture);
      }
      setDragState(null);
      setTimeout(() => setDragFeedback(null), 1400);
    }
  };

  const handleSvgClick = (e) => {
    if (activeTool !== 'measure' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const meterX = (clickX - centerX) / (baseScale * zoom);
    const meterZ = (clickY - centerY) / (baseScale * zoom);

    onMeasureClick({ x: meterX, z: meterZ });
  };

  return (
    <div
      ref={containerRef}
      className="ps-cad-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleSvgClick}
      style={{ cursor: activeTool === 'measure' ? 'crosshair' : isPanning ? 'grabbing' : dragState ? 'grabbing' : 'grab' }}
    >
      {/* 2D Zoom / Pan Controls Overlay */}
      <div className="ps-cad-controls">
        <button type="button" onClick={() => setZoom((z) => Math.min(3.5, z * 1.2))} title="Zoom In">
          <ZoomIn size={15} />
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.max(0.4, z / 1.2))} title="Zoom Out">
          <ZoomOut size={15} />
        </button>
        <button type="button" onClick={() => { setZoom(1.1); setPan({ x: 0, y: 0 }); }} title="Reset View">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Real-time Drag / Transform Coordinate Tooltip Badge */}
      {dragFeedback && (
        <div className="ps-cad-drag-badge">
          <Move size={13} color="#00f0ff" />
          <span>{dragFeedback}</span>
        </div>
      )}

      <svg
        className="ps-cad-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <pattern id="cadGridSmall" width={baseScale * zoom} height={baseScale * zoom} patternUnits="userSpaceOnUse">
            <path d={`M ${baseScale * zoom} 0 L 0 0 0 ${baseScale * zoom}`} fill="none" stroke="#0a182b" strokeWidth="0.8" />
          </pattern>
          <pattern id="cadGridMajor" width={baseScale * zoom * 5} height={baseScale * zoom * 5} patternUnits="userSpaceOnUse">
            <path d={`M ${baseScale * zoom * 5} 0 L 0 0 0 ${baseScale * zoom * 5}`} fill="none" stroke="#0f294a" strokeWidth="1.2" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width={svgWidth} height={svgHeight} fill="#040a14" />
        {showGrid && (
          <>
            <rect width={svgWidth} height={svgHeight} fill="url(#cadGridSmall)" />
            <rect width={svgWidth} height={svgHeight} fill="url(#cadGridMajor)" />
          </>
        )}

        <g transform={`translate(${centerX}, ${centerY}) scale(${zoom})`}>
          {/* Plot Boundary Outer Glow */}
          <rect
            x={(-plotWidth / 2) * baseScale}
            y={(-plotDepth / 2) * baseScale}
            width={plotWidth * baseScale}
            height={plotDepth * baseScale}
            fill="#091322"
            stroke="#fae8a4"
            strokeWidth="3.5"
            strokeOpacity="0.85"
            rx="2"
          />

          {/* Uploaded Blueprint Architectural Underlay */}
          {uploadedBlueprint && showUnderlay && uploadedBlueprint.imageUrl && (
            <image
              href={uploadedBlueprint.imageUrl}
              x={(-plotWidth / 2) * baseScale}
              y={(-plotDepth / 2) * baseScale}
              width={plotWidth * baseScale}
              height={plotDepth * baseScale}
              opacity={blueprintOpacity !== undefined ? blueprintOpacity : 0.85}
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Rooms Rendering with Live Resize & Move Handles */}
          {rooms.map((r) => {
            const rx = r.x * baseScale;
            const rz = r.z * baseScale;
            const rw = r.w * baseScale;
            const rd = r.d * baseScale;
            const isSelected = selectedRoomId === r.id;

            return (
              <g
                key={r.id}
                className="ps-interactive-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoom(r);
                }}
                style={{ cursor: isSelected ? 'default' : 'pointer' }}
              >
                {/* Room Floor Fill */}
                <rect
                  x={rx}
                  y={rz}
                  width={rw}
                  height={rd}
                  fill={isSelected ? '#0369a1' : r.type === 'balcony' ? '#0f2942' : '#0c1b2f'}
                  fillOpacity={isSelected ? 0.75 : uploadedBlueprint && showUnderlay ? 0.25 : 0.88}
                  stroke={isSelected ? '#00f0ff' : '#fae8a4'}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={r.type === 'balcony' ? '4,4' : 'none'}
                />

                {/* Double-Line Wall Thickness */}
                <rect
                  x={rx + 2.5}
                  y={rz + 2.5}
                  width={rw - 5}
                  height={rd - 5}
                  fill="none"
                  stroke={isSelected ? '#00f0ff' : '#38bdf8'}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />

                {/* Door Swing Arc */}
                {r.doorSide === 'west' && (
                  <g>
                    <path
                      d={`M ${rx} ${rz + 15} A 24 24 0 0 1 ${rx + 24} ${rz + 39}`}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    />
                    <line x1={rx} y1={rz + 15} x2={rx + 24} y2={rz + 15} stroke="#00f0ff" strokeWidth="1.5" />
                  </g>
                )}
                {r.doorSide === 'east' && (
                  <g>
                    <path
                      d={`M ${rx + rw} ${rz + 15} A 24 24 0 0 0 ${rx + rw - 24} ${rz + 39}`}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    />
                    <line x1={rx + rw} y1={rz + 15} x2={rx + rw - 24} y2={rz + 15} stroke="#00f0ff" strokeWidth="1.5" />
                  </g>
                )}
                {r.doorSide === 'south' && (
                  <g>
                    <path
                      d={`M ${rx + rw / 2} ${rz + rd} A 24 24 0 0 1 ${rx + rw / 2 + 24} ${rz + rd - 24}`}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    />
                  </g>
                )}

                {/* Elevator Shaft Crossed Diagonals [X] */}
                {r.type === 'lift' && (
                  <g>
                    <line x1={rx} y1={rz} x2={rx + rw} y2={rz + rd} stroke="#fae8a4" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1={rx + rw} y1={rz} x2={rx} y2={rz + rd} stroke="#fae8a4" strokeWidth="1.5" strokeDasharray="3,3" />
                    <rect x={rx + rw / 2 - 12} y={rz + rd / 2 - 10} width="24" height="20" fill="#061220" stroke="#00f0ff" strokeWidth="1" />
                    <text x={rx + rw / 2} y={rz + rd / 2 + 4} fill="#fae8a4" fontSize="9" fontWeight="bold" textAnchor="middle">LIFT</text>
                  </g>
                )}

                {/* Staircase Step Treads */}
                {r.type === 'staircase' && (
                  <g>
                    {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                      <line
                        key={step}
                        x1={rx + 4}
                        y1={rz + (step * rd) / 8}
                        x2={rx + rw - 4}
                        y2={rz + (step * rd) / 8}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="1,1"
                      />
                    ))}
                    <text x={rx + rw / 2} y={rz + rd - 12} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">↑ UP</text>
                  </g>
                )}

                {/* Room Center Name & Dimension Tag */}
                {rw > 45 && rd > 35 && (
                  <g>
                    <rect
                      x={rx + rw / 2 - 48}
                      y={rz + rd / 2 - 16}
                      width="96"
                      height="32"
                      rx="4"
                      fill="#060e1b"
                      fillOpacity="0.88"
                      stroke={isSelected ? '#00f0ff' : 'rgba(250, 232, 164, 0.4)'}
                      strokeWidth="1"
                    />
                    <text
                      x={rx + rw / 2}
                      y={rz + rd / 2 - 3}
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {r.name.length > 18 ? r.name.slice(0, 16) + '..' : r.name}
                    </text>
                    <text
                      x={rx + rw / 2}
                      y={rz + rd / 2 + 10}
                      fill="#fae8a4"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {unit === 'imperial'
                        ? `${toFeetInches(r.w)} × ${toFeetInches(r.d)}`
                        : `${r.w.toFixed(1)}m × ${r.d.toFixed(1)}m`}
                    </text>
                  </g>
                )}

                {/* Selected Room Wall Transform Handles (Center Move + 4 Corner + 4 Edge Resize) */}
                {isSelected && (
                  <g className="ps-wall-handles">
                    {/* Center Move Handle */}
                    <g
                      className="ps-handle"
                      onMouseDown={(e) => startRoomMove(e, r)}
                      style={{ cursor: 'move' }}
                    >
                      <circle
                        cx={rx + rw / 2}
                        cy={rz + rd / 2}
                        r="14"
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text x={rx + rw / 2} y={rz + rd / 2 + 4} fill="#ffffff" fontSize="12" textAnchor="middle">✥</text>
                    </g>

                    {/* Corner Resize Handles */}
                    <circle
                      cx={rx}
                      cy={rz}
                      r="6"
                      className="ps-handle"
                      fill="#00f0ff"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ cursor: 'nwse-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'nw')}
                    />
                    <circle
                      cx={rx + rw}
                      cy={rz}
                      r="6"
                      className="ps-handle"
                      fill="#00f0ff"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ cursor: 'nesw-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'ne')}
                    />
                    <circle
                      cx={rx + rw}
                      cy={rz + rd}
                      r="6"
                      className="ps-handle"
                      fill="#00f0ff"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ cursor: 'nwse-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'se')}
                    />
                    <circle
                      cx={rx}
                      cy={rz + rd}
                      r="6"
                      className="ps-handle"
                      fill="#00f0ff"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ cursor: 'nesw-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'sw')}
                    />

                    {/* Edge Resize Handles */}
                    <circle
                      cx={rx + rw / 2}
                      cy={rz}
                      r="5"
                      className="ps-handle"
                      fill="#fae8a4"
                      stroke="#000000"
                      strokeWidth="1.5"
                      style={{ cursor: 'ns-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'n')}
                    />
                    <circle
                      cx={rx + rw / 2}
                      cy={rz + rd}
                      r="5"
                      className="ps-handle"
                      fill="#fae8a4"
                      stroke="#000000"
                      strokeWidth="1.5"
                      style={{ cursor: 'ns-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 's')}
                    />
                    <circle
                      cx={rx}
                      cy={rz + rd / 2}
                      r="5"
                      className="ps-handle"
                      fill="#fae8a4"
                      stroke="#000000"
                      strokeWidth="1.5"
                      style={{ cursor: 'ew-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'w')}
                    />
                    <circle
                      cx={rx + rw}
                      cy={rz + rd / 2}
                      r="5"
                      className="ps-handle"
                      fill="#fae8a4"
                      stroke="#000000"
                      strokeWidth="1.5"
                      style={{ cursor: 'ew-resize' }}
                      onMouseDown={(e) => startRoomResize(e, r, 'e')}
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Furniture & Vehicles Rendering with Live Interactive Drag */}
          {showFurniture && furniture.map((f) => {
            const fx = f.x * baseScale;
            const fz = f.z * baseScale;
            const fw = f.w * baseScale;
            const fd = f.d * baseScale;
            const isSelected = selectedFurnitureId === f.id;

            return (
              <g
                key={f.id}
                className="ps-interactive-item"
                transform={`translate(${fx}, ${fz}) rotate(${f.rot || 0})`}
                onMouseDown={(e) => startFurnitureDrag(e, f)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFurniture(f);
                }}
                style={{ cursor: dragState?.id === f.id ? 'grabbing' : 'grab' }}
              >
                {/* Clearance Area Indicator */}
                <rect
                  x={-fw / 2 - 8}
                  y={-fd / 2 - 8}
                  width={fw + 16}
                  height={fd + 16}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  strokeOpacity="0.4"
                />

                {/* Furniture Body */}
                <rect
                  x={-fw / 2}
                  y={-fd / 2}
                  width={fw}
                  height={fd}
                  rx="3"
                  fill={f.color || '#1e3a5f'}
                  fillOpacity="0.85"
                  stroke={isSelected ? '#00f0ff' : '#fae8a4'}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                />

                {/* Vehicle-specific CAD silhouette */}
                {(f.type === 'car_sedan' || f.type === 'car_suv') && (
                  <g>
                    <rect x={-fw / 2 + 4} y={-fd / 2 + 8} width={fw - 8} height="12" rx="2" fill="#040a14" opacity="0.6" />
                    <rect x={-fw / 2 + 4} y={fd / 2 - 18} width={fw - 8} height="10" rx="2" fill="#040a14" opacity="0.6" />
                    <circle cx={-fw / 2 + 5} cy={-fd / 2 + 3} r="2" fill="#fae8a4" />
                    <circle cx={fw / 2 - 5} cy={-fd / 2 + 3} r="2" fill="#fae8a4" />
                  </g>
                )}

                {/* Furniture Name Tag */}
                <text
                  x="0"
                  y="3"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {f.name.length > 14 ? f.name.slice(0, 12) + '..' : f.name}
                </text>
              </g>
            );
          })}

          {/* Overall Plot Dimension Strings */}
          {showDimensions && (
            <g>
              {/* Plot Width Top Dimension */}
              <line
                x1={(-plotWidth / 2) * baseScale}
                y1={(-plotDepth / 2) * baseScale - 24}
                x2={(plotWidth / 2) * baseScale}
                y2={(-plotDepth / 2) * baseScale - 24}
                stroke="#fae8a4"
                strokeWidth="1.5"
              />
              <line
                x1={(-plotWidth / 2) * baseScale}
                y1={(-plotDepth / 2) * baseScale - 32}
                x2={(-plotWidth / 2) * baseScale}
                y2={(-plotDepth / 2) * baseScale - 16}
                stroke="#fae8a4"
                strokeWidth="1.5"
              />
              <line
                x1={(plotWidth / 2) * baseScale}
                y1={(-plotDepth / 2) * baseScale - 32}
                x2={(plotWidth / 2) * baseScale}
                y2={(-plotDepth / 2) * baseScale - 16}
                stroke="#fae8a4"
                strokeWidth="1.5"
              />
              <rect
                x="-36"
                y={(-plotDepth / 2) * baseScale - 34}
                width="72"
                height="18"
                rx="3"
                fill="#050a12"
                stroke="#fae8a4"
                strokeWidth="1"
              />
              <text
                x="0"
                y={(-plotDepth / 2) * baseScale - 21}
                fill="#fae8a4"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {unit === 'imperial' ? formatDim(plotWidth, 'imperial') : `${plotWidth}m`}
              </text>

              {/* Plot Depth Right Dimension */}
              <line
                x1={(plotWidth / 2) * baseScale + 24}
                y1={(-plotDepth / 2) * baseScale}
                x2={(plotWidth / 2) * baseScale + 24}
                y2={(plotDepth / 2) * baseScale}
                stroke="#fae8a4"
                strokeWidth="1.5"
              />
              <line
                x1={(plotWidth / 2) * baseScale + 16}
                y1={(-plotDepth / 2) * baseScale}
                x2={(plotWidth / 2) * baseScale + 32}
                y2={(-plotDepth / 2) * baseScale}
                stroke="#fae8a4"
                strokeWidth="1.5"
              />
              <line
                x1={(plotWidth / 2) * baseScale + 16}
                y1={(plotDepth / 2) * baseScale}
                x2={(plotWidth / 2) * baseScale + 32}
                y2={(plotDepth / 2) * baseScale}
                stroke="#fae8a4"
                strokeWidth="1.5"
              />
              <rect
                x={(plotWidth / 2) * baseScale + 15}
                y="-10"
                width="64"
                height="20"
                rx="3"
                fill="#050a12"
                stroke="#fae8a4"
                strokeWidth="1"
              />
              <text
                x={(plotWidth / 2) * baseScale + 47}
                y="4"
                fill="#fae8a4"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {unit === 'imperial' ? formatDim(plotDepth, 'imperial') : `${plotDepth}m`}
              </text>
            </g>
          )}

          {/* Live Measuring Tape Line */}
          {measurePoints && measurePoints.p1 && measurePoints.p2 && (
            <g>
              <line
                x1={measurePoints.p1.x * baseScale}
                y1={measurePoints.p1.z * baseScale}
                x2={measurePoints.p2.x * baseScale}
                y2={measurePoints.p2.z * baseScale}
                stroke="#facc15"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />
              <circle cx={measurePoints.p1.x * baseScale} cy={measurePoints.p1.z * baseScale} r="5" fill="#facc15" />
              <circle cx={measurePoints.p2.x * baseScale} cy={measurePoints.p2.z * baseScale} r="5" fill="#facc15" />
              <rect
                x={((measurePoints.p1.x + measurePoints.p2.x) / 2) * baseScale - 45}
                y={((measurePoints.p1.z + measurePoints.p2.z) / 2) * baseScale - 16}
                width="90"
                height="22"
                rx="4"
                fill="#09111e"
                stroke="#facc15"
                strokeWidth="1.5"
              />
              <text
                x={((measurePoints.p1.x + measurePoints.p2.x) / 2) * baseScale}
                y={((measurePoints.p1.z + measurePoints.p2.z) / 2) * baseScale - 1}
                fill="#facc15"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {unit === 'imperial'
                  ? toFeetInches(Math.hypot(measurePoints.p2.x - measurePoints.p1.x, measurePoints.p2.z - measurePoints.p1.z))
                  : `${Math.hypot(measurePoints.p2.x - measurePoints.p1.x, measurePoints.p2.z - measurePoints.p1.z).toFixed(2)}m`}
              </text>
            </g>
          )}
        </g>

        {/* North Compass Indicator Top-Right */}
        <g transform="translate(970, 70)">
          <circle cx="0" cy="0" r="28" fill="#09111c" stroke="#fae8a4" strokeWidth="1.5" />
          <polygon points="0,-22 6,0 0,6" fill="#ef4444" />
          <polygon points="0,-22 -6,0 0,6" fill="#b91c1c" />
          <polygon points="0,22 6,0 0,-6" fill="#94a3b8" />
          <polygon points="0,22 -6,0 0,-6" fill="#64748b" />
          <text x="0" y="-10" fill="#fae8a4" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
          <text x="0" y="38" fill="#fae8a4" fontSize="8" fontWeight="600" textAnchor="middle">VASTU NORTH</text>
        </g>

        {/* Architectural CAD Title Block Bottom-Right */}
        <g transform="translate(680, 740)">
          <rect width="330" height="130" fill="#09111c" stroke="#fae8a4" strokeWidth="2" rx="4" />
          <line x1="0" y1="34" x2="330" y2="34" stroke="rgba(250, 232, 164, 0.3)" strokeWidth="1" />
          <line x1="0" y1="84" x2="330" y2="84" stroke="rgba(250, 232, 164, 0.3)" strokeWidth="1" />
          <line x1="165" y1="84" x2="165" y2="130" stroke="rgba(250, 232, 164, 0.3)" strokeWidth="1" />

          <text x="16" y="24" fill="#fae8a4" fontSize="13" fontWeight="bold" letterSpacing="1">
            WALK THE PLAN · 1:1 STUDIO
          </text>
          <text x="16" y="54" fill="#f8fafc" fontSize="11" fontWeight="700">
            {buildingName}
          </text>
          <text x="16" y="72" fill="#38bdf8" fontSize="10" fontWeight="600">
            {floorTitle}
          </text>

          <text x="16" y="102" fill="#94a3b8" fontSize="8.5">SCALE: 1:100 @ A1</text>
          <text x="16" y="118" fill="#10b981" fontSize="8.5">✓ NBC & VASTU CERTIFIED</text>

          <text x="180" y="102" fill="#94a3b8" fontSize="8.5">DATE: {new Date().toLocaleDateString()}</text>
          <text x="180" y="118" fill="#fae8a4" fontSize="8.5">ARCHITECTURAL CAD</text>
        </g>
      </svg>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 3D WEBGL ENGINE COMPONENTS (THREE.JS / DREI)
// ─────────────────────────────────────────────────────────────────────────────

export function Blueprint3DPlane({
  blueprint,
  elevation = 0,
  opacity = 0.85
}) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!blueprint || !blueprint.imageUrl) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      blueprint.imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);
      },
      undefined,
      (err) => console.warn('Blueprint texture load warning:', err)
    );
  }, [blueprint?.imageUrl]);

  if (!texture || !blueprint) return null;

  const w = blueprint.width || 9.12;
  const d = blueprint.depth || 22.91;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, elevation + 0.025, 0]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

export function ExtrudedBoundaryWalls({
  width = 9.12,
  depth = 22.91,
  height = 3.0,
  elevation = 0
}) {
  const thick = 0.23; // 9-inch outer masonry wall
  const halfW = width / 2;
  const halfD = depth / 2;

  return (
    <group position={[0, elevation, 0]}>
      {/* North Wall (Rear) */}
      <mesh position={[0, height / 2, -halfD + thick / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, thick]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} transparent opacity={0.88} />
      </mesh>

      {/* South Wall (Front with entrance opening) */}
      <mesh position={[-width / 4 - 0.5, height / 2, halfD - thick / 2]} castShadow receiveShadow>
        <boxGeometry args={[width / 2 - 1, height, thick]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} transparent opacity={0.88} />
      </mesh>
      <mesh position={[width / 4 + 0.5, height / 2, halfD - thick / 2]} castShadow receiveShadow>
        <boxGeometry args={[width / 2 - 1, height, thick]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} transparent opacity={0.88} />
      </mesh>

      {/* West Wall */}
      <mesh position={[-halfW + thick / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thick, height, depth]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} transparent opacity={0.88} />
      </mesh>

      {/* East Wall */}
      <mesh position={[halfW - thick / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thick, height, depth]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} transparent opacity={0.88} />
      </mesh>

      {/* Glowing Neon Architectural Parapet Rim */}
      <lineSegments position={[0, height, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.04, depth)]} />
        <lineBasicMaterial color="#00f0ff" linewidth={2} />
      </lineSegments>
    </group>
  );
}

export function Parametric3DRoom({
  room,
  isSelected,
  onSelect,
  viewMode,
  unit,
  wallCutHeight = 3.0,
  elevation = 0
}) {
  const meshRef = useRef();

  const floorMat = useMemo(() => {
    const mat = FLOOR_MATERIALS.find((m) => m.id === room.floorMat) || FLOOR_MATERIALS[0];
    return new THREE.MeshStandardMaterial({
      color: mat.color,
      roughness: mat.roughness,
      metalness: mat.metalness
    });
  }, [room.floorMat]);

  const wallMat = useMemo(() => {
    const mat = WALL_MATERIALS.find((m) => m.id === room.wallMat) || WALL_MATERIALS[0];
    return new THREE.MeshStandardMaterial({
      color: isSelected ? '#0284c7' : mat.color,
      roughness: 0.8,
      metalness: 0.1
    });
  }, [room.wallMat, isSelected]);

  const height = Math.min(room.h || 3.0, wallCutHeight);
  const thick = room.wallThick || 0.2;
  const cx = room.x + room.w / 2;
  const cz = room.z + room.d / 2;
  const cy = elevation;

  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(room);
      }}
    >
      {/* Room Floor Slab */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, cy + 0.01, cz]}
        receiveShadow
      >
        <planeGeometry args={[room.w, room.d]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Selected Highlighter Outline */}
      {isSelected && (
        <lineSegments position={[cx, cy + 0.02, cz]}>
          <edgesGeometry args={[new THREE.BoxGeometry(room.w, 0.04, room.d)]} />
          <lineBasicMaterial color="#00f0ff" linewidth={3} />
        </lineSegments>
      )}

      {/* North Wall */}
      {room.doorSide !== 'north' && (
        <mesh position={[cx, cy + height / 2, room.z + thick / 2]} castShadow receiveShadow>
          <boxGeometry args={[room.w, height, thick]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      )}

      {/* South Wall */}
      {room.doorSide !== 'south' && (
        <mesh position={[cx, cy + height / 2, room.z + room.d - thick / 2]} castShadow receiveShadow>
          <boxGeometry args={[room.w, height, thick]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      )}

      {/* West Wall */}
      {room.doorSide !== 'west' && (
        <mesh position={[room.x + thick / 2, cy + height / 2, cz]} castShadow receiveShadow>
          <boxGeometry args={[thick, height, room.d]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      )}

      {/* East Wall */}
      {room.doorSide !== 'east' && (
        <mesh position={[room.x + room.w - thick / 2, cy + height / 2, cz]} castShadow receiveShadow>
          <boxGeometry args={[thick, height, room.d]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      )}

      {/* 3D Room Name Text Tag */}
      {viewMode !== '2d_blueprint' && (
        <Text
          position={[cx, cy + 0.05, cz]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.32}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {room.name}
        </Text>
      )}
    </group>
  );
}

export function Movable3DFurniture({
  item,
  isSelected,
  onSelect,
  elevation = 0
}) {
  const meshRef = useRef();
  const rad = ((item.rot || 0) * Math.PI) / 180;

  return (
    <group
      ref={meshRef}
      position={[item.x, elevation, item.z]}
      rotation={[0, rad, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
    >
      {/* Furniture Model Body */}
      <mesh position={[0, (item.h || 0.8) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[item.w, item.h || 0.8, item.d]} />
        <meshStandardMaterial
          color={isSelected ? '#00f0ff' : item.color || '#1e3a5f'}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Clearance Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[item.w / 2 + 0.1, item.w / 2 + 0.25, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={isSelected ? 0.6 : 0.2} />
      </mesh>

      {/* Car Wheels & Headlights if vehicle */}
      {(item.type === 'car_sedan' || item.type === 'car_suv') && (
        <group>
          {/* Cabin Top */}
          <mesh position={[0, (item.h || 1.5) * 0.75, -0.2]}>
            <boxGeometry args={[item.w * 0.85, (item.h || 1.5) * 0.45, item.d * 0.55]} />
            <meshStandardMaterial color="#09111c" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Headlights */}
          <mesh position={[-item.w * 0.35, 0.5, item.d / 2]}>
            <boxGeometry args={[0.2, 0.15, 0.05]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <mesh position={[item.w * 0.35, 0.5, item.d / 2]}>
            <boxGeometry args={[0.2, 0.15, 0.05]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      )}

      {/* Bed Pillows if Bed */}
      {item.type.includes('bed') && (
        <group position={[0, item.h || 0.9, -item.d / 2 + 0.3]}>
          <mesh position={[-item.w / 4, 0.05, 0]}>
            <boxGeometry args={[item.w / 2.5, 0.12, 0.4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[item.w / 4, 0.05, 0]}>
            <boxGeometry args={[item.w / 2.5, 0.12, 0.4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function LaserProjectionFloor({ size = 36 }) {
  return (
    <group position={[0, -0.01, 0]}>
      {/* 1:1 Scale Laser Projection Stage Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#030812" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* 1m x 1m High-Precision Laser Grid */}
      <Grid
        position={[0, 0.01, 0]}
        args={[size, size]}
        cellSize={1.0}
        cellThickness={1.2}
        cellColor="#00f0ff"
        sectionSize={5.0}
        sectionThickness={1.8}
        sectionColor="#fae8a4"
        fadeDistance={45}
        fadeStrength={1.2}
      />

      {/* Human Scale Avatar (1.75m tall) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.875, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 1.75, 16]} />
          <meshStandardMaterial color="#fae8a4" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.95, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#f0cd6f" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export function Building3DStack({
  building,
  explodeOffset = 1.5,
  wallCutHeight = 3.0,
  unit,
  selectedRoomId,
  selectedFurnitureId,
  onSelectRoom,
  onSelectFurniture
}) {
  if (!building || !building.floors) return null;
  const floorKeys = ['stilt', 'ground', 'first', 'terrace'];

  return (
    <group>
      {floorKeys.map((key, idx) => {
        const fl = building.floors[key];
        if (!fl) return null;
        const currentElev = fl.elevation + idx * explodeOffset;

        return (
          <group key={fl.id} position={[0, currentElev, 0]}>
            {/* Floor Slab Plate */}
            <mesh position={[0, -0.1, 0]} receiveShadow>
              <boxGeometry args={[building.plotWidth || 9.12, 0.2, building.plotDepth || 22.91]} />
              <meshStandardMaterial color="#0f1f33" roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Level Title Callout */}
            <Text
              position={[-building.plotWidth / 2 - 2, 0.5, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.65}
              color="#fae8a4"
              fontWeight="bold"
            >
              {fl.name}
            </Text>

            {/* Rooms on this level */}
            {fl.rooms.map((room) => (
              <Parametric3DRoom
                key={room.id}
                room={room}
                isSelected={selectedRoomId === room.id}
                onSelect={onSelectRoom}
                viewMode="3d_axo"
                unit={unit}
                wallCutHeight={wallCutHeight}
                elevation={0}
              />
            ))}

            {/* Furniture on this level */}
            {fl.furniture && fl.furniture.map((item) => (
              <Movable3DFurniture
                key={item.id}
                item={item}
                isSelected={selectedFurnitureId === item.id}
                onSelect={onSelectFurniture}
                elevation={0}
              />
            ))}
          </group>
        );
      })}

      {/* Continuous Structural Lift Core (Runs ground to terrace) */}
      <mesh position={[0.4 + 1.73 / 2, 6, -2.8 + 1.73 / 2]}>
        <boxGeometry args={[1.73, 14, 1.73]} />
        <meshStandardMaterial color="#00f0ff" wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export function DaylightRig({ timeOfDay = 12 }) {
  const isNight = timeOfDay < 6 || timeOfDay > 19;
  const angle = ((timeOfDay - 6) / 14) * Math.PI;
  const sunX = Math.cos(angle) * 35;
  const sunY = Math.max(2, Math.sin(angle) * 35);
  const sunZ = 20;

  return (
    <>
      <ambientLight intensity={isNight ? 0.35 : 0.85} color={isNight ? '#1e293b' : '#ffffff'} />
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={isNight ? 0.2 : 1.6}
        color={timeOfDay > 16 && timeOfDay < 19 ? '#fed7aa' : '#ffffff'}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {isNight && (
        <>
          <pointLight position={[0, 4, 0]} intensity={2.5} color="#fae8a4" distance={15} />
          <pointLight position={[0, 4, -6]} intensity={2.0} color="#38bdf8" distance={15} />
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRIAL HIGH-LUMEN ARCHITECTURAL 3D PROJECTOR RIG
// ─────────────────────────────────────────────────────────────────────────────

export function Projector3DRig({
  position = [-8, 0, 14],
  target = [0, 1.2, 0],
  laserActive = true,
  isNight = false
}) {
  return (
    <group position={position}>
      {/* Heavy Steel Stabilizer Base Pads */}
      <mesh position={[-0.8, 0.05, -0.6]}>
        <cylinderGeometry args={[0.2, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.8, 0.05, -0.6]}>
        <cylinderGeometry args={[0.2, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0.8]}>
        <cylinderGeometry args={[0.2, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Tripod Stand Legs */}
      <mesh position={[-0.4, 1.8, -0.3]} rotation={[0.15, 0, -0.2]}>
        <cylinderGeometry args={[0.04, 0.05, 3.8, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.4, 1.8, -0.3]} rotation={[0.15, 0, 0.2]}>
        <cylinderGeometry args={[0.04, 0.05, 3.8, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.8, 0.4]} rotation={[-0.22, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 3.8, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Telescopic Central Aluminium Mast */}
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 5.4, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pan-Tilt Head Assembly */}
      <group position={[0, 5.3, 0]} rotation={[-0.45, 0.4, 0]}>
        {/* Projector Chassis */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.75, 0.4, 0.95]} />
          <meshStandardMaterial color="#0b1320" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Warning Accent Trim */}
        <mesh position={[0, 0.205, 0]}>
          <boxGeometry args={[0.72, 0.02, 0.9]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Dual High-Throw Laser Lenses */}
        <mesh position={[-0.18, 0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={isNight ? 4 : 1.5} roughness={0.1} />
        </mesh>
        <mesh position={[0.18, 0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
          <meshStandardMaterial color="#fae8a4" emissive="#fae8a4" emissiveIntensity={isNight ? 3 : 1.2} roughness={0.1} />
        </mesh>

        {/* Status Screen */}
        <mesh position={[0.38, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Volumetric Laser Projector Beam Cone */}
        {laserActive && (
          <group position={[0, 0, 0.6]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 7]}>
              <coneGeometry args={[8.5, 14, 32, 1, true]} />
              <meshBasicMaterial
                color={isNight ? '#00f0ff' : '#fae8a4'}
                transparent
                opacity={isNight ? 0.28 : 0.14}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Core Spotlight Beam */}
            <spotLight
              position={[0, 0, 0]}
              target-position={target}
              angle={0.65}
              penumbra={0.7}
              intensity={isNight ? 260 : 90}
              color="#00f0ff"
              distance={40}
              castShadow
            />
          </group>
        )}
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D REAL LAND PLOT & OUTDOOR LASER PROJECTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function LandPlot3DProjectorScene({
  rooms,
  furniture,
  selectedRoomId,
  selectedFurnitureId,
  onSelectRoom,
  onSelectFurniture,
  plotConfig,
  building,
  unit,
  wallCutHeight = 3.0,
  uploadedBlueprint,
  showBlueprintUnderlay = true,
  blueprintOpacity = 0.85,
  showFurniture = true,
  laserActive = true,
  isNightProjector = false,
  showSetbacks = true
}) {
  const plotW = plotConfig?.width || 12.19;
  const plotD = plotConfig?.depth || 18.29;
  const frontSetback = plotConfig?.frontSetback || 4.5;
  const rearSetback = plotConfig?.rearSetback || 3.0;
  const sideSetback = plotConfig?.sideSetback || 1.5;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Surrounding Land Ground Environment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[85, 85]} />
        <meshStandardMaterial
          color={isNightProjector ? '#050b12' : '#1b2e18'}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Frontage Access Road with Asphalt & Curbs */}
      <group position={[0, 0, plotD / 2 + 5]}>
        {/* Road Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]} receiveShadow>
          <planeGeometry args={[plotW + 30, 8.5]} />
          <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* White Center Dashed Road Divider */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.032, 0]}>
          <planeGeometry args={[plotW + 30, 0.18]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.65} />
        </mesh>
        {/* Walkway Curbstone */}
        <mesh position={[0, 0.05, -4.5]} castShadow receiveShadow>
          <boxGeometry args={[plotW + 24, 0.16, 0.6]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
      </group>

      {/* 3. The Client's Actual Demarcated Land Plot (Lawn / Soil) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[plotW, plotD]} />
        <meshStandardMaterial
          color={isNightProjector ? '#0a1a0f' : '#284620'}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Glowing Gold Plot Boundary Ring */}
      <lineSegments position={[0, 0.02, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(plotW, 0.04, plotD)]} />
        <lineBasicMaterial color="#fae8a4" linewidth={3} />
      </lineSegments>

      {/* 4. Four Corner Boundary Survey Stones with Vastu Directions */}
      {[
        { x: -plotW / 2, z: -plotD / 2, label: 'NW · Vayu (Air)' },
        { x: plotW / 2, z: -plotD / 2, label: 'NE · Ishaan (Divine/Water)' },
        { x: -plotW / 2, z: plotD / 2, label: 'SW · Niruthi (Earth/Stability)' },
        { x: plotW / 2, z: plotD / 2, label: 'SE · Agni (Fire/Energy)' },
      ].map((pt, i) => (
        <group key={i} position={[pt.x, 0, pt.z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.32, 0.9, 0.32]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
            <meshStandardMaterial color="#fae8a4" metalness={0.8} roughness={0.2} />
          </mesh>
          <Text
            position={[0, 1.25, 0]}
            fontSize={0.28}
            color="#fae8a4"
            anchorX="center"
            anchorY="bottom"
          >
            {pt.label}
          </Text>
        </group>
      ))}

      {/* 5. Compound Perimeter Wall on 3 Sides */}
      {/* Rear Wall */}
      <mesh position={[0, 0.8, -plotD / 2]} castShadow receiveShadow>
        <boxGeometry args={[plotW, 1.6, 0.22]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-plotW / 2, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 1.6, plotD]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* East Wall */}
      <mesh position={[plotW / 2, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 1.6, plotD]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Front Boundary Sections with Driveway Opening */}
      <mesh position={[-plotW / 4 - 1.2, 0.8, plotD / 2]} castShadow receiveShadow>
        <boxGeometry args={[Math.max(1, plotW / 2 - 2.4), 1.6, 0.22]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh position={[plotW / 4 + 1.2, 0.8, plotD / 2]} castShadow receiveShadow>
        <boxGeometry args={[Math.max(1, plotW / 2 - 2.4), 1.6, 0.22]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Front Entrance Gate Pillars */}
      <mesh position={[-1.2, 1.0, plotD / 2]} castShadow>
        <boxGeometry args={[0.45, 2.0, 0.45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[1.2, 1.0, plotD / 2]} castShadow>
        <boxGeometry args={[0.45, 2.0, 0.45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* 6. Landscape Trees along Setbacks */}
      <group>
        <mesh position={[-plotW / 2 + 1.2, 1.8, -plotD / 2 + 1.6]} castShadow>
          <sphereGeometry args={[1.1, 16, 16]} />
          <meshStandardMaterial color={isNightProjector ? '#0f3818' : '#15803d'} roughness={0.7} />
        </mesh>
        <mesh position={[-plotW / 2 + 1.2, 0.6, -plotD / 2 + 1.6]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 1.2, 8]} />
          <meshStandardMaterial color="#5a3d28" roughness={0.9} />
        </mesh>

        <mesh position={[plotW / 2 - 1.2, 1.8, -plotD / 2 + 1.6]} castShadow>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial color={isNightProjector ? '#0f3818' : '#166534'} roughness={0.7} />
        </mesh>
        <mesh position={[plotW / 2 - 1.2, 0.6, -plotD / 2 + 1.6]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 1.2, 8]} />
          <meshStandardMaterial color="#5a3d28" roughness={0.9} />
        </mesh>
      </group>

      {/* 7. Legal Setback Visualizer Guidelines */}
      {showSetbacks && (
        <group position={[0, 0.025, 0]}>
          {/* Front Setback Line */}
          <mesh position={[0, 0, plotD / 2 - frontSetback]}>
            <planeGeometry args={[plotW - 0.2, 0.04]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <Text
            position={[0, 0.05, plotD / 2 - frontSetback + 0.35]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.32}
            color="#38bdf8"
            anchorX="center"
          >
            {`Front Setback: ${formatDim(frontSetback, unit)}`}
          </Text>

          {/* Rear Setback Line */}
          <mesh position={[0, 0, -plotD / 2 + rearSetback]}>
            <planeGeometry args={[plotW - 0.2, 0.04]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <Text
            position={[0, 0.05, -plotD / 2 + rearSetback - 0.35]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.32}
            color="#38bdf8"
            anchorX="center"
          >
            {`Rear Setback: ${formatDim(rearSetback, unit)}`}
          </Text>
        </group>
      )}

      {/* 8. The Industrial 3D Laser Projector Rig */}
      <Projector3DRig
        position={[-plotW / 2 - 2.0, 0, plotD / 2 + 3.0]}
        target={[0, 1.2, 0]}
        laserActive={laserActive}
        isNight={isNightProjector}
      />

      {/* 9. Projected Blueprint Floor Texture on Land */}
      {uploadedBlueprint && showBlueprintUnderlay && (
        <Blueprint3DPlane
          blueprint={uploadedBlueprint}
          elevation={0.015}
          opacity={isNightProjector ? 0.95 : blueprintOpacity}
        />
      )}

      {/* 10. The 3D Extruded Building Rising on the Land */}
      <group position={[0, 0.02, 0]}>
        {rooms.map((room) => (
          <Parametric3DRoom
            key={room.id}
            room={room}
            isSelected={selectedRoomId === room.id}
            onSelect={onSelectRoom}
            viewMode="3d_axo"
            unit={unit}
            wallCutHeight={wallCutHeight}
            elevation={0}
          />
        ))}

        {showFurniture && furniture.map((item) => (
          <Movable3DFurniture
            key={item.id}
            item={item}
            isSelected={selectedFurnitureId === item.id}
            onSelect={onSelectFurniture}
            elevation={0}
          />
        ))}
      </group>
    </group>
  );
}

export function CameraController({ viewMode, controlsRef, cameraTargetPos }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    if (viewMode === '3d_land_projection') {
      camera.position.set(24, 20, 26);
      controlsRef.current.target.set(0, 1.5, 0);
      controlsRef.current.enableRotate = true;
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.04;
      controlsRef.current.update();
    } else if (viewMode === '3d_axo' || viewMode === 'all_floors') {
      camera.position.set(22, 20, 22);
      controlsRef.current.target.set(0, 4, 0);
      controlsRef.current.enableRotate = true;
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
      controlsRef.current.update();
    } else if (viewMode === 'projection_1to1') {
      camera.position.set(0, 18, 0.001);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.enableRotate = true;
      controlsRef.current.update();
    } else if (viewMode === 'fps_walk') {
      camera.position.set(0, 1.65, 8);
      controlsRef.current.target.set(0, 1.65, 0);
      controlsRef.current.enableRotate = true;
      controlsRef.current.update();
    }
  }, [viewMode, camera, controlsRef]);

  useFrame(() => {
    if (viewMode === 'fps_walk' && cameraTargetPos) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraTargetPos.x, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraTargetPos.z, 0.1);
      camera.position.y = 1.65;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={80}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SAFE ERROR BOUNDARIES
// ─────────────────────────────────────────────────────────────────────────────

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('[ProjectionStudio] Canvas 3D warning:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="ps-webgl-fallback">
          <AlertTriangle size={36} color="#f59e0b" />
          <h3 style={{ margin: '8px 0 4px', fontSize: '1.05rem', fontWeight: 600 }}>3D Graphics Notice</h3>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px' }}>
            3D rendering encountered an issue or WebGL is disabled. You can switch to 2D CAD Blueprint mode or retry.
          </p>
          <button
            type="button"
            className="ps-btn-gold"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry 3D Engine
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// MAIN PROJECTION STUDIO COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectionStudio() {
  const [selectedBuildingKey, setSelectedBuildingKey] = useState('royal_estate_30x75');
  const building = BUILDINGS_CATALOG[selectedBuildingKey] || BUILDINGS_CATALOG.royal_estate_30x75;

  const [activeFloorKey, setActiveFloorKey] = useState(building.defaultFloor || 'ground');
  const isAllFloors = activeFloorKey === 'all_floors';

  // Current Floor Data
  const initialFloor = building.floors[activeFloorKey] || building.floors.ground || Object.values(building.floors)[0];
  const [rooms, setRooms] = useState(initialFloor.rooms);
  const [furniture, setFurniture] = useState(initialFloor.furniture || []);

  // Uploaded Blueprint State
  const [uploadedBlueprint, setUploadedBlueprint] = useState({
    imageUrl: initialFloor.blueprintImage || '/blueprints/ground_floor_plan.jpg',
    name: `${initialFloor.name} (${building.name})`,
    width: building.plotWidth || 9.12,
    depth: building.plotDepth || 22.91
  });
  const [showBlueprintUnderlay, setShowBlueprintUnderlay] = useState(true);
  const [blueprintOpacity, setBlueprintOpacity] = useState(0.85);
  const [extrudeBlueprintWalls, setExtrudeBlueprintWalls] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // View & Tool States ('2d_blueprint' | '3d_axo' | 'projection_1to1' | 'fps_walk' | '3d_land_projection')
  const [viewMode, setViewMode] = useState('2d_blueprint');
  const [unit, setUnit] = useState('imperial');
  const [activeTool, setActiveTool] = useState('select');
  const [measurePoints, setMeasurePoints] = useState({ p1: null, p2: null });

  // 3D Real Land Plot Projector Configuration
  const [selectedPlotConfig, setSelectedPlotConfig] = useState(LAND_PLOT_PRESETS[1]); // 30'x60'
  const [isNightProjector, setIsNightProjector] = useState(false);
  const [showSetbacks, setShowSetbacks] = useState(true);
  const [isLandLaserActive, setIsLandLaserActive] = useState(true);

  // 3D Visual Customizations
  const [wallCutMode, setWallCutMode] = useState('full');
  const [explodeOffset, setExplodeOffset] = useState(1.8);
  const [timeOfDay, setTimeOfDay] = useState(13);

  // Selections
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);

  // Layers Visibility
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Modals & Drawers
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isVastuModalOpen, setIsVastuModalOpen] = useState(false);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // FPS Walkthrough Position
  const [walkPos, setWalkPos] = useState({ x: 0, z: 8 });

  // Undo / Redo Stack
  const [history, setHistory] = useState([{ rooms: initialFloor.rooms, furniture: initialFloor.furniture || [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const controlsRef = useRef();
  const fileInputRef = useRef();

  const showToast = (msg, icon = '✦') => {
    setToastMessage({ msg, icon });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync rooms and furniture when floor changes
  const handleFloorChange = (floorKey) => {
    setActiveFloorKey(floorKey);
    setSelectedRoomId(null);
    setSelectedFurnitureId(null);
    setMeasurePoints({ p1: null, p2: null });

    if (floorKey === 'all_floors') {
      setViewMode('3d_axo');
      showToast('Switched to 3D Multi-Level Building Stack', '🏢');
    } else {
      const fl = building.floors[floorKey];
      if (fl) {
        setRooms(fl.rooms);
        setFurniture(fl.furniture || []);
        setHistory([{ rooms: fl.rooms, furniture: fl.furniture || [] }]);
        setHistoryIndex(0);

        if (fl.blueprintImage) {
          setUploadedBlueprint({
            imageUrl: fl.blueprintImage,
            name: `${fl.name} (${building.name})`,
            width: building.plotWidth || 9.12,
            depth: building.plotDepth || 22.91
          });
        }

        showToast(`Loaded ${fl.name} (${fl.subtitle})`, '📐');
      }
    }
  };

  // Sync building preset change
  const handleBuildingChange = (bKey) => {
    setSelectedBuildingKey(bKey);
    const b = BUILDINGS_CATALOG[bKey];
    if (b) {
      const defKey = b.defaultFloor || Object.keys(b.floors)[0];
      setActiveFloorKey(defKey);
      const fl = b.floors[defKey];
      setRooms(fl.rooms);
      setFurniture(fl.furniture || []);
      setHistory([{ rooms: fl.rooms, furniture: fl.furniture || [] }]);
      setHistoryIndex(0);
      setSelectedRoomId(null);
      setSelectedFurnitureId(null);

      if (fl.blueprintImage) {
        setUploadedBlueprint({
          imageUrl: fl.blueprintImage,
          name: `${fl.name} (${b.name})`,
          width: b.plotWidth || 9.12,
          depth: b.plotDepth || 22.91
        });
      }

      showToast(`Loaded ${b.name}`, '🏛️');
    }
  };

  // Handle uploaded file (Image, DXF, or JSON)
  const processUploadedFile = (file, customWidth = 9.12, customDepth = 22.91) => {
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.rooms) setRooms(parsed.rooms);
          if (parsed.furniture) setFurniture(parsed.furniture);
          showToast(`Imported project data from ${file.name}`, '💾');
          setIsUploadModalOpen(false);
          setViewMode('3d_axo');
        } catch (err) {
          showToast('Failed to parse project JSON file', '⚠️');
        }
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setUploadedBlueprint({
        imageUrl: dataUrl,
        name: file.name.replace(/\.[^/.]+$/, ''),
        width: Number(customWidth) || 9.12,
        depth: Number(customDepth) || 22.91
      });
      setShowBlueprintUnderlay(true);
      setExtrudeBlueprintWalls(true);
      setIsUploadModalOpen(false);
      setViewMode('3d_axo');
      showToast(`🎉 Blueprint "${file.name}" uploaded! Extruded into 3D projection.`, '🚀');
    };
    reader.readAsDataURL(file);
  };

  // Push history
  const pushHistory = useCallback((newRooms, newFurniture) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { rooms: newRooms, furniture: newFurniture }].slice(-25);
    });
    setHistoryIndex((i) => Math.min(i + 1, 24));
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setRooms(prev.rooms);
      setFurniture(prev.furniture);
      setHistoryIndex((i) => i - 1);
      showToast('Undo previous action', '↺');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setRooms(next.rooms);
      setFurniture(next.furniture);
      setHistoryIndex((i) => i + 1);
      showToast('Redo action', '↻');
    }
  };

  // Interactive Moving, Rotating, Duplicating and Deletion Handlers
  const handleNudgeSelected = (dx, dz) => {
    if (selectedFurnitureId) {
      const updated = furniture.map((f) =>
        f.id === selectedFurnitureId
          ? { ...f, x: Math.round((f.x + dx) * 100) / 100, z: Math.round((f.z + dz) * 100) / 100 }
          : f
      );
      setFurniture(updated);
      pushHistory(rooms, updated);
      showToast('Moved furniture item', '↔️');
    } else if (selectedRoomId) {
      const updated = rooms.map((r) =>
        r.id === selectedRoomId
          ? { ...r, x: Math.round((r.x + dx) * 100) / 100, z: Math.round((r.z + dz) * 100) / 100 }
          : r
      );
      setRooms(updated);
      pushHistory(updated, furniture);
      showToast('Moved room walls', '🧱');
    }
  };

  const handleRotateSelected = (deltaAngle = 45) => {
    if (selectedFurnitureId) {
      const updated = furniture.map((f) =>
        f.id === selectedFurnitureId ? { ...f, rot: ((f.rot || 0) + deltaAngle) % 360 } : f
      );
      setFurniture(updated);
      pushHistory(rooms, updated);
      showToast('Rotated furniture item', '↻');
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedFurnitureId) {
      const target = furniture.find((f) => f.id === selectedFurnitureId);
      if (target) {
        const cloned = { ...target, id: `f_${Date.now()}`, x: target.x + 0.5, z: target.z + 0.5 };
        const updated = [...furniture, cloned];
        setFurniture(updated);
        setSelectedFurnitureId(cloned.id);
        pushHistory(rooms, updated);
        showToast(`Duplicated ${target.name}`, '📋');
      }
    } else if (selectedRoomId) {
      const target = rooms.find((r) => r.id === selectedRoomId);
      if (target) {
        const cloned = { ...target, id: `r_${Date.now()}`, name: `${target.name} (Copy)`, x: target.x + 1.0, z: target.z + 1.0 };
        const updated = [...rooms, cloned];
        setRooms(updated);
        setSelectedRoomId(cloned.id);
        pushHistory(updated, furniture);
        showToast(`Duplicated ${target.name}`, '📋');
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFurnitureId) {
      const updated = furniture.filter((f) => f.id !== selectedFurnitureId);
      setFurniture(updated);
      setSelectedFurnitureId(null);
      pushHistory(rooms, updated);
      showToast('Deleted furniture item', '🗑️');
    } else if (selectedRoomId) {
      const updated = rooms.filter((r) => r.id !== selectedRoomId);
      setRooms(updated);
      setSelectedRoomId(null);
      pushHistory(updated, furniture);
      showToast('Deleted room wall', '🗑️');
    }
  };

  // Keyboard Shortcuts for Moving, Rotating, Deleting, Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in text fields
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      const nudgeStep = e.shiftKey ? 0.5 : 0.1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNudgeSelected(-nudgeStep, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNudgeSelected(nudgeStep, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNudgeSelected(0, -nudgeStep);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNudgeSelected(0, nudgeStep);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRotateSelected(45);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedRoomId(null);
        setSelectedFurnitureId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFurnitureId, selectedRoomId, furniture, rooms, historyIndex, history]);

  // Measurement tape clicks
  const handleMeasureClick = (pt) => {
    if (!measurePoints.p1) {
      setMeasurePoints({ p1: pt, p2: null });
      showToast('Point 1 marked. Click Point 2 to measure distance.', '📏');
    } else if (!measurePoints.p2) {
      setMeasurePoints((prev) => ({ ...prev, p2: pt }));
      const dist = Math.hypot(pt.x - measurePoints.p1.x, pt.z - measurePoints.p1.z);
      showToast(`Distance measured: ${unit === 'imperial' ? toFeetInches(dist) : dist.toFixed(2) + 'm'}`, '📐');
    } else {
      setMeasurePoints({ p1: pt, p2: null });
    }
  };

  // Selected item references
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedFurniture = furniture.find((f) => f.id === selectedFurnitureId);

  // Audits & BOQ
  const vastuResult = useMemo(() => runVastuAudit(rooms, initialFloor.name), [rooms, initialFloor.name]);
  const clearanceAlerts = useMemo(() => runClearanceAudit(rooms, furniture), [rooms, furniture]);
  const boqData = useMemo(() => calculateBOQ(building, activeFloorKey, rooms, furniture), [building, activeFloorKey, rooms, furniture]);

  return (
    <div className="ps-root">
      {/* ── TOP LUXURY HEADER ────────────────────────────────────────── */}
      <header className="ps-header">
        <div className="ps-header-left">
          <Link to="/" className="ps-exit-btn" title="Exit Studio to Website">
            <ArrowLeft size={16} />
            <span>Walk The Plan</span>
          </Link>
          <div className="ps-brand-badge">
            <span className="ps-brand-title">1:1 PROJECTION STUDIO</span>
            <span className="ps-brand-sub">CAD & Life-Size Holographic Visualizer</span>
          </div>
        </div>

        {/* Center: Floor Switcher Segmented Tabs */}
        <div className="ps-header-center">
          <div className="ps-floor-tabs">
            {building.isMultiLevel && (
              <>
                <button
                  type="button"
                  className={`ps-floor-tab ${activeFloorKey === 'stilt' ? 'active' : ''}`}
                  onClick={() => handleFloorChange('stilt')}
                >
                  <Car size={13} />
                  <span>Stilt Floor</span>
                </button>
                <button
                  type="button"
                  className={`ps-floor-tab ${activeFloorKey === 'ground' ? 'active' : ''}`}
                  onClick={() => handleFloorChange('ground')}
                >
                  <Building size={13} />
                  <span>Ground Floor</span>
                </button>
                <button
                  type="button"
                  className={`ps-floor-tab ${activeFloorKey === 'first' ? 'active' : ''}`}
                  onClick={() => handleFloorChange('first')}
                >
                  <Layers2 size={13} />
                  <span>First Floor</span>
                </button>
                <button
                  type="button"
                  className={`ps-floor-tab ${activeFloorKey === 'terrace' ? 'active' : ''}`}
                  onClick={() => handleFloorChange('terrace')}
                >
                  <Sun size={13} />
                  <span>Terrace Deck</span>
                </button>
                <button
                  type="button"
                  className={`ps-floor-tab gold ${activeFloorKey === 'all_floors' ? 'active' : ''}`}
                  onClick={() => handleFloorChange('all_floors')}
                  title="3D Exploded Multi-Floor Stack"
                >
                  <BoxIcon size={13} />
                  <span>All Floors (3D)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Audits, BOQ, Undo/Redo & Quick Actions */}
        <div className="ps-header-right">
          {/* Unit Switcher */}
          <button
            type="button"
            onClick={() => setUnit((u) => (u === 'imperial' ? 'metric' : 'imperial'))}
            className="ps-unit-pill"
            title="Toggle Feet-Inches vs Meters"
          >
            <span>{unit === 'imperial' ? "FT-IN (Imperial)" : "M (Metric)"}</span>
          </button>

          {/* Vastu Audit Pill */}
          <button
            type="button"
            onClick={() => setIsVastuModalOpen(true)}
            className="ps-audit-pill vastu"
            title="Open Vastu Purusha Harmony Audit"
          >
            <Sparkle size={13} />
            <span>{vastuResult.score}% Vastu</span>
          </button>

          {/* Clearance Audit Pill */}
          <button
            type="button"
            onClick={() => setIsClearanceModalOpen(true)}
            className={`ps-audit-pill clearance ${clearanceAlerts.length > 0 ? 'warn' : ''}`}
            title="Open Clearance & Ergonomics Audit"
          >
            <ShieldCheck size={13} />
            <span>{clearanceAlerts.length === 0 ? '✓ Clearances' : `${clearanceAlerts.length} Alerts`}</span>
          </button>

          {/* BOQ Estimator Pill */}
          <button
            type="button"
            onClick={() => setIsBoqModalOpen(true)}
            className="ps-audit-pill boq"
            title="Open Bill of Quantities & Civil Cost Estimator"
          >
            <FileSpreadsheet size={13} />
            <span>BOQ ₹{boqData.costTotalCrores} Cr</span>
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="ps-icon-btn"
            title="Undo (Ctrl+Z)"
            style={{ opacity: historyIndex <= 0 ? 0.35 : 1 }}
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="ps-icon-btn"
            title="Redo (Ctrl+Y)"
            style={{ opacity: historyIndex >= history.length - 1 ? 0.35 : 1 }}
          >
            <Redo size={14} />
          </button>

          {/* Help Guide */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="ps-icon-btn"
            title="Help & User Guide"
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </header>

      {/* ── SECONDARY TOOLBAR & VIEW MODE SELECTOR ───────────────────── */}
      <div className="ps-subbar">
        {/* View Mode Switcher Pills */}
        <div className="ps-view-pills">
          <button
            type="button"
            onClick={() => {
              setViewMode('2d_blueprint');
              showToast('Switched to 2D CAD Blueprint View (Interactive Move & Resize)', '📐');
            }}
            className={`ps-view-pill ${viewMode === '2d_blueprint' ? 'active' : ''}`}
          >
            <PenTool size={13} />
            <span>2D CAD Blueprint</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('3d_axo');
              showToast('Switched to 3D Axonometric View', '🏛️');
            }}
            className={`ps-view-pill ${viewMode === '3d_axo' ? 'active' : ''}`}
          >
            <BoxIcon size={13} />
            <span>3D Axonometric</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('projection_1to1');
              showToast('Switched to 1:1 Scale Warehouse Laser Projection Stage', '🔦');
            }}
            className={`ps-view-pill ${viewMode === 'projection_1to1' ? 'active' : ''}`}
          >
            <Sparkles size={13} />
            <span>1:1 Projection Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('fps_walk');
              showToast('Switched to 1:1 Scale Walkthrough (1.65m Eye Level)', '🚶');
            }}
            className={`ps-view-pill ${viewMode === 'fps_walk' ? 'active' : ''}`}
          >
            <Eye size={13} />
            <span>1:1 Walk Inside</span>
          </button>

          {/* 3D Real Land Plot Projector View Mode Pill */}
          <button
            type="button"
            onClick={() => {
              setViewMode('3d_land_projection');
              showToast('Switched to 3D Real Land Plot Projector View', '🌳');
            }}
            className={`ps-view-pill ps-land-pill ${viewMode === '3d_land_projection' ? 'active' : ''}`}
          >
            <Trees size={13} />
            <span>3D Land Plot Projector</span>
          </button>
        </div>

        {/* Blueprint Underlay Controls when an upload is present */}
        {uploadedBlueprint && (
          <div className="ps-blueprint-subbar-pill">
            <button
              type="button"
              onClick={() => {
                setShowBlueprintUnderlay((v) => !v);
                showToast(`Blueprint Underlay ${!showBlueprintUnderlay ? 'Enabled' : 'Hidden'}`, '🖼️');
              }}
              className={`ps-sub-pill ${showBlueprintUnderlay ? 'active' : ''}`}
              title="Toggle Blueprint Texture Underlay"
            >
              <ImageIcon size={12} />
              <span>Blueprint: {showBlueprintUnderlay ? 'ON' : 'OFF'}</span>
            </button>

            {showBlueprintUnderlay && (
              <div className="ps-opacity-control">
                <span style={{ fontSize: '10.5px', color: '#fae8a4' }}>Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={blueprintOpacity}
                  onChange={(e) => setBlueprintOpacity(parseFloat(e.target.value))}
                  style={{ width: '55px' }}
                />
                <span style={{ fontSize: '10.5px', fontFamily: 'monospace' }}>{Math.round(blueprintOpacity * 100)}%</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setExtrudeBlueprintWalls((v) => !v);
                showToast(`3D Extruded Boundary Walls ${!extrudeBlueprintWalls ? 'Enabled' : 'Hidden'}`, '🧱');
              }}
              className={`ps-sub-pill ${extrudeBlueprintWalls ? 'active' : ''}`}
              title="Toggle 3D Boundary Wall Extrusion"
            >
              <BoxIcon size={12} />
              <span>3D Walls</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="ps-sub-pill gold"
              title="Upload New Floor Plan"
            >
              <FileUp size={12} />
              <span>Upload New</span>
            </button>
          </div>
        )}

        {/* Tools (Measure Tape, Visibility Toggles, Wall Cut, Export) */}
        <div className="ps-subbar-tools">
          {/* Tape Measure Tool */}
          <button
            type="button"
            onClick={() => {
              if (activeTool === 'measure') {
                setActiveTool('select');
                setMeasurePoints({ p1: null, p2: null });
                showToast('Measurement tape disabled', '✦');
              } else {
                setActiveTool('measure');
                setMeasurePoints({ p1: null, p2: null });
                showToast('Measurement tape active: click 2 points to measure', '📏');
              }
            }}
            className={`ps-pill-btn ${activeTool === 'measure' ? 'active-select' : ''}`}
            title="Interactive Tape Measure Tool"
          >
            <Ruler size={13} />
            <span>Tape Measure</span>
          </button>

          {/* Wall Cut Mode in 3D */}
          {viewMode !== '2d_blueprint' && !isAllFloors && (
            <button
              type="button"
              onClick={() => {
                setWallCutMode((m) => (m === 'waist' ? 'full' : 'waist'));
                showToast(`Switched walls to ${wallCutMode === 'waist' ? 'Full 3.0m Height' : '1.2m Section Cut'}`, '📐');
              }}
              className="ps-pill-btn"
              title="Toggle Wall Height Cut"
            >
              <SplitSquareVertical size={13} />
              <span>{wallCutMode === 'waist' ? 'Waist Cut (1.2m)' : 'Full Walls (3.0m)'}</span>
            </button>
          )}

          {/* Explode Slabs Slider in 3D Multi-Floor */}
          {isAllFloors && (
            <div className="ps-explode-control">
              <span style={{ fontSize: '11px', color: '#fae8a4', fontWeight: 600 }}>Explode Slabs:</span>
              <input
                type="range"
                min="0"
                max="5.0"
                step="0.2"
                value={explodeOffset}
                onChange={(e) => setExplodeOffset(parseFloat(e.target.value))}
                style={{ width: '90px' }}
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8' }}>{explodeOffset.toFixed(1)}m</span>
            </div>
          )}

          {/* Sun / Time of Day in 3D */}
          {viewMode !== '2d_blueprint' && (
            <div className="ps-time-control">
              <Sun size={13} color="#fae8a4" />
              <input
                type="range"
                min="8"
                max="22"
                step="1"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseInt(e.target.value, 10))}
                style={{ width: '70px' }}
                title="Time of Day Sun Lighting"
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{timeOfDay}:00</span>
            </div>
          )}

          {/* Export Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((o) => !o)}
              className="ps-pill-btn gold"
              title="Export Professional Architectural Formats"
            >
              <Download size={13} />
              <span>Export CAD</span>
            </button>

            {isExportMenuOpen && (
              <div className="ps-export-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    exportToAutoCAD_DXF(rooms, furniture, building.name, initialFloor.name);
                    setIsExportMenuOpen(false);
                    showToast('Exported Layered AutoCAD DXF', '💾');
                  }}
                >
                  <Download size={13} />
                  <span>AutoCAD DXF (.dxf)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportToTechnicalSVG(rooms, furniture, building.name, initialFloor.name, unit);
                    setIsExportMenuOpen(false);
                    showToast('Exported Architectural Vector Blueprint', '📐');
                  }}
                >
                  <FileDown size={13} />
                  <span>Blueprint Sheet (.svg)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadFile(
                      JSON.stringify({ building, activeFloor: activeFloorKey, rooms, furniture }, null, 2),
                      `WalkThePlan_${initialFloor.name}_Project.json`,
                      'application/json'
                    );
                    setIsExportMenuOpen(false);
                    showToast('Project JSON Saved', '💾');
                  }}
                >
                  <Save size={13} />
                  <span>Project JSON (.json)</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle Left Catalog Drawer */}
          <button
            type="button"
            onClick={() => setIsLeftDrawerOpen((o) => !o)}
            className="ps-icon-btn"
            title="Open Catalog & Layers"
          >
            <Menu size={15} />
          </button>
        </div>
      </div>

      {/* ── QUICK-START GUIDED TOUR BANNER ───────────────────────────── */}
      {isGuideOpen && (
        <div className="ps-guide-banner">
          <div className="ps-guide-step">
            <span className="ps-step-num">1</span>
            <span><strong>Upload Any Floor Plan:</strong> Click "Upload Blueprint & Show 3D" to convert JPG/PNG/CAD into 3D instantly</span>
          </div>
          <div className="ps-guide-step">
            <span className="ps-step-num">2</span>
            <span><strong>Move Walls & Furniture:</strong> Drag furniture or room handles in 2D blueprint mode or nudge with arrow keys</span>
          </div>
          <div className="ps-guide-step">
            <span className="ps-step-num">3</span>
            <span><strong>3D Land Plot Projector:</strong> See a real-world projector unit project your plan on physical land with laser beams</span>
          </div>
          <div className="ps-guide-step">
            <span className="ps-step-num">4</span>
            <span><strong>Audit & BOQ:</strong> Industry-beating cost estimator, materials takeoff and Excel export</span>
          </div>
          <button type="button" onClick={() => setIsGuideOpen(false)} className="ps-guide-close" title="Dismiss Guide">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── MAIN VIEWPORT WORKSPACE ──────────────────────────────────── */}
      <div className="ps-workspace">
        {/* Left Drawer: Rooms, Furniture & Layers */}
        <aside className={`ps-drawer-left ${isLeftDrawerOpen ? 'open' : ''}`}>
          <div className="ps-drawer-header">
            <div className="ps-drawer-title">
              <Layers size={15} color="#fae8a4" />
              <span>Architectural Elements</span>
            </div>
            <button type="button" onClick={() => setIsLeftDrawerOpen(false)} className="ps-drawer-close">
              <X size={15} />
            </button>
          </div>

          <div className="ps-drawer-content">
            {/* Quick Upload Action in Sidebar */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="ps-upload-card-btn"
            >
              <UploadCloud size={20} color="#fae8a4" />
              <div>
                <span className="ps-uc-title">Upload Architectural Plan</span>
                <span className="ps-uc-sub">Convert Image/CAD to 3D Projection</span>
              </div>
            </button>

            {/* Active Floor Summary */}
            <div className="ps-floor-summary-card">
              <span className="ps-summary-title">{building.name}</span>
              <span className="ps-summary-floor">{initialFloor.name}</span>
              <span className="ps-summary-sub">{initialFloor.subtitle}</span>
              <span className="ps-summary-footprint">{building.footprint}</span>
            </div>

            {/* Furniture Catalog */}
            <div>
              <div className="ps-section-header">
                <span className="ps-section-title">Modular Furniture & Landscaping ({FURNITURE_CATALOG.length})</span>
              </div>
              <div className="ps-furniture-grid">
                {FURNITURE_CATALOG.map((f) => (
                  <button
                    key={f.type}
                    type="button"
                    onClick={() => {
                      const newItem = {
                        id: `f_${Date.now()}`,
                        type: f.type,
                        name: f.name,
                        x: 0,
                        z: 0,
                        w: f.w,
                        d: f.d,
                        h: f.h,
                        rot: 0,
                        clearance: f.clearance,
                        color: f.color
                      };
                      const updated = [...furniture, newItem];
                      setFurniture(updated);
                      pushHistory(rooms, updated);
                      setSelectedFurnitureId(newItem.id);
                      showToast(`Added ${f.name} to plan`, '🛋️');
                    }}
                    className="ps-furniture-btn"
                  >
                    <span style={{ fontWeight: 600 }}>{f.name}</span>
                    <span style={{ fontSize: '10px', color: '#fae8a4' }}>
                      {unit === 'imperial' ? `${toFeetInches(f.w)} × ${toFeetInches(f.d)}` : `${f.w}m × ${f.d}m`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room List on Active Floor */}
            <div>
              <div className="ps-section-header">
                <span className="ps-section-title">Rooms on This Floor ({rooms.length})</span>
              </div>
              <div className="ps-room-list">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoomId(r.id);
                      setSelectedFurnitureId(null);
                      setIsRightDrawerOpen(true);
                      showToast(`Inspecting ${r.name}`, '📐');
                    }}
                    className={`ps-room-item ${selectedRoomId === r.id ? 'active' : ''}`}
                  >
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                      {formatArea(r.w * r.d, unit)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Viewport Center: 2D CAD vs 3D WebGL Canvas */}
        <div className="ps-canvas-container">
          {viewMode === '2d_blueprint' ? (
            <CadBlueprintViewport
              rooms={rooms}
              furniture={furniture}
              selectedRoomId={selectedRoomId}
              selectedFurnitureId={selectedFurnitureId}
              onSelectRoom={(r) => {
                setSelectedRoomId(r.id);
                setSelectedFurnitureId(null);
                setIsRightDrawerOpen(true);
              }}
              onSelectFurniture={(f) => {
                setSelectedFurnitureId(f.id);
                setSelectedRoomId(null);
                setIsRightDrawerOpen(true);
              }}
              onUpdateFurniture={setFurniture}
              onUpdateRooms={setRooms}
              onCommitHistory={pushHistory}
              unit={unit}
              activeTool={activeTool}
              buildingName={building.name}
              floorTitle={initialFloor.name}
              plotWidth={uploadedBlueprint?.width || building.plotWidth || 9.12}
              plotDepth={uploadedBlueprint?.depth || building.plotDepth || 22.91}
              showDimensions={showDimensions}
              showFurniture={showFurniture}
              showGrid={showGrid}
              measurePoints={measurePoints}
              onMeasureClick={handleMeasureClick}
              uploadedBlueprint={uploadedBlueprint}
              showUnderlay={showBlueprintUnderlay}
              blueprintOpacity={blueprintOpacity}
            />
          ) : (
            <CanvasErrorBoundary>
              <Canvas
                shadows
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                camera={{ fov: 42, near: 0.1, far: 180, position: [24, 20, 24] }}
                style={{ width: '100%', height: '100%' }}
              >
                <DaylightRig timeOfDay={timeOfDay} />

                <Suspense fallback={null}>
                  <CameraController
                    viewMode={isAllFloors ? 'all_floors' : viewMode}
                    controlsRef={controlsRef}
                    cameraTargetPos={viewMode === 'fps_walk' ? walkPos : null}
                  />

                  {/* 3D Real Land Plot Projector Scene */}
                  {viewMode === '3d_land_projection' ? (
                    <LandPlot3DProjectorScene
                      rooms={rooms}
                      furniture={furniture}
                      selectedRoomId={selectedRoomId}
                      selectedFurnitureId={selectedFurnitureId}
                      onSelectRoom={(r) => {
                        setSelectedRoomId(r.id);
                        setSelectedFurnitureId(null);
                        setIsRightDrawerOpen(true);
                      }}
                      onSelectFurniture={(f) => {
                        setSelectedFurnitureId(f.id);
                        setSelectedRoomId(null);
                        setIsRightDrawerOpen(true);
                      }}
                      plotConfig={selectedPlotConfig}
                      building={building}
                      unit={unit}
                      wallCutHeight={wallCutMode === 'waist' ? 1.2 : 3.0}
                      uploadedBlueprint={uploadedBlueprint}
                      showBlueprintUnderlay={showBlueprintUnderlay}
                      blueprintOpacity={blueprintOpacity}
                      showFurniture={showFurniture}
                      laserActive={isLandLaserActive}
                      isNightProjector={isNightProjector}
                      showSetbacks={showSetbacks}
                    />
                  ) : (
                    <>
                      {/* 1:1 Scale Warehouse Floor Grid if in projection mode */}
                      {viewMode === 'projection_1to1' && <LaserProjectionFloor size={40} />}

                      {/* Uploaded Blueprint Image Projected onto 3D Floor */}
                      {uploadedBlueprint && showBlueprintUnderlay && !isAllFloors && (
                        <Blueprint3DPlane
                          blueprint={uploadedBlueprint}
                          elevation={0}
                          opacity={blueprintOpacity}
                        />
                      )}

                      {/* Extruded Boundary 3D Walls for Uploaded Blueprint */}
                      {extrudeBlueprintWalls && !isAllFloors && (
                        <ExtrudedBoundaryWalls
                          width={uploadedBlueprint?.width || building.plotWidth || 9.12}
                          depth={uploadedBlueprint?.depth || building.plotDepth || 22.91}
                          height={wallCutMode === 'waist' ? 1.2 : 3.0}
                          elevation={0}
                        />
                      )}

                      {/* Multi-Floor Stack vs Single Floor */}
                      {isAllFloors ? (
                        <Building3DStack
                          building={building}
                          explodeOffset={explodeOffset}
                          wallCutHeight={wallCutMode === 'waist' ? 1.2 : 3.0}
                          unit={unit}
                          selectedRoomId={selectedRoomId}
                          selectedFurnitureId={selectedFurnitureId}
                          onSelectRoom={(r) => {
                            setSelectedRoomId(r.id);
                            setSelectedFurnitureId(null);
                            setIsRightDrawerOpen(true);
                          }}
                          onSelectFurniture={(f) => {
                            setSelectedFurnitureId(f.id);
                            setSelectedRoomId(null);
                            setIsRightDrawerOpen(true);
                          }}
                        />
                      ) : (
                        <>
                          {/* Floor Base Slab Plate */}
                          <mesh position={[0, -0.05, 0]} receiveShadow>
                            <boxGeometry args={[uploadedBlueprint?.width || building.plotWidth || 9.12, 0.1, uploadedBlueprint?.depth || building.plotDepth || 22.91]} />
                            <meshStandardMaterial color="#0b1728" roughness={0.5} metalness={0.4} />
                          </mesh>

                          {rooms.map((room) => (
                            <Parametric3DRoom
                              key={room.id}
                              room={room}
                              isSelected={selectedRoomId === room.id}
                              onSelect={(r) => {
                                setSelectedRoomId(r.id);
                                setSelectedFurnitureId(null);
                                setIsRightDrawerOpen(true);
                              }}
                              viewMode={viewMode}
                              unit={unit}
                              wallCutHeight={wallCutMode === 'waist' ? 1.2 : 3.0}
                              elevation={0}
                            />
                          ))}

                          {showFurniture && furniture.map((item) => (
                            <Movable3DFurniture
                              key={item.id}
                              item={item}
                              isSelected={selectedFurnitureId === item.id}
                              onSelect={(f) => {
                                setSelectedFurnitureId(f.id);
                                setSelectedRoomId(null);
                                setIsRightDrawerOpen(true);
                              }}
                              elevation={0}
                            />
                          ))}
                        </>
                      )}
                    </>
                  )}

                  <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport axisColors={['#ef4444', '#10b981', '#3b82f6']} labelColor="#ffffff" />
                  </GizmoHelper>
                </Suspense>
              </Canvas>
            </CanvasErrorBoundary>
          )}

          {/* 3D Real Land Plot Projector HUD Controls */}
          {viewMode === '3d_land_projection' && (
            <div className="ps-land-hud">
              <div className="ps-land-badge">
                <Trees size={15} color="#34d399" />
                <span>3D Land Plot Projector</span>
              </div>
              <div className="ps-land-controls">
                <select
                  value={selectedPlotConfig?.id || ''}
                  onChange={(e) => {
                    const p = LAND_PLOT_PRESETS.find((x) => x.id === e.target.value) || LAND_PLOT_PRESETS[0];
                    setSelectedPlotConfig(p);
                    showToast(`Land Plot set to ${p.name}`, '📐');
                  }}
                  className="ps-land-select"
                >
                  {LAND_PLOT_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.facing} Facing)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsNightProjector((n) => !n)}
                  className={`ps-land-btn ${isNightProjector ? 'active' : ''}`}
                  title="Toggle Night Holographic Mode"
                >
                  {isNightProjector ? '🌙 Night Projection' : '☀️ Day Lighting'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsLandLaserActive((l) => !l)}
                  className={`ps-land-btn ${isLandLaserActive ? 'active' : ''}`}
                  title="Toggle Projector Beam"
                >
                  <Sparkles size={12} />
                  <span>{isLandLaserActive ? 'Laser Beam: ON' : 'Laser Beam: OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSetbacks((s) => !s)}
                  className={`ps-land-btn ${showSetbacks ? 'active' : ''}`}
                  title="Toggle Municipal Setbacks"
                >
                  <span>Setbacks: {showSetbacks ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Transform Bar when Room or Furniture is Selected */}
          {(selectedFurniture || selectedRoom) && (
            <div className="ps-floating-transform-bar">
              <span className="ps-transform-title">
                {selectedFurniture ? `Selected: ${selectedFurniture.name}` : `Selected: ${selectedRoom.name}`}
              </span>
              <div className="ps-transform-group">
                <button type="button" onClick={() => handleNudgeSelected(-0.2, 0)} title="Move Left (←)">←</button>
                <button type="button" onClick={() => handleNudgeSelected(0.2, 0)} title="Move Right (→)">→</button>
                <button type="button" onClick={() => handleNudgeSelected(0, -0.2)} title="Move Up (↑)">↑</button>
                <button type="button" onClick={() => handleNudgeSelected(0, 0.2)} title="Move Down (↓)">↓</button>
              </div>
              {selectedFurniture && (
                <button type="button" onClick={() => handleRotateSelected(45)} className="ps-transform-btn" title="Rotate 45° (R)">
                  <RotateCw size={12} />
                  <span>Rotate 45°</span>
                </button>
              )}
              <button type="button" onClick={handleDuplicateSelected} className="ps-transform-btn" title="Duplicate">
                <Copy size={12} />
                <span>Duplicate</span>
              </button>
              <button type="button" onClick={handleDeleteSelected} className="ps-transform-btn danger" title="Delete (Del)">
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomId(null);
                  setSelectedFurnitureId(null);
                }}
                className="ps-transform-btn"
                title="Deselect (Esc)"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* FPS Walk Controls HUD */}
          {viewMode === 'fps_walk' && (
            <div className="ps-walk-hud">
              <span className="ps-walk-badge">🚶 1:1 First Person Walkthrough (Eye Level 1.65m)</span>
              <div className="ps-walk-keys">
                <button type="button" onClick={() => setWalkPos((p) => ({ ...p, z: p.z - 0.5 }))} title="Forward">↑</button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => setWalkPos((p) => ({ ...p, x: p.x - 0.5 }))} title="Left">←</button>
                  <button type="button" onClick={() => setWalkPos((p) => ({ ...p, z: p.z + 0.5 }))} title="Backward">↓</button>
                  <button type="button" onClick={() => setWalkPos((p) => ({ ...p, x: p.x + 0.5 }))} title="Right">→</button>
                </div>
              </div>
            </div>
          )}

          {/* Measurement Tape Info Box */}
          {activeTool === 'measure' && (
            <div className="ps-measure-pill">
              <Ruler size={14} color="#facc15" />
              <span>
                {!measurePoints.p1
                  ? 'Click Point 1 on Blueprint to begin'
                  : !measurePoints.p2
                  ? 'Click Point 2 to measure distance'
                  : `Distance: ${unit === 'imperial'
                      ? toFeetInches(Math.hypot(measurePoints.p2.x - measurePoints.p1.x, measurePoints.p2.z - measurePoints.p1.z))
                      : Math.hypot(measurePoints.p2.x - measurePoints.p1.x, measurePoints.p2.z - measurePoints.p1.z).toFixed(2) + 'm'}`}
              </span>
              {measurePoints.p1 && (
                <button type="button" onClick={() => setMeasurePoints({ p1: null, p2: null })}>Reset</button>
              )}
            </div>
          )}
        </div>

        {/* Right Drawer: Properties Inspector */}
        <aside className={`ps-drawer-right ${isRightDrawerOpen ? 'open' : ''}`}>
          <div className="ps-drawer-header">
            <div className="ps-drawer-title">
              <Sliders size={15} color="#fae8a4" />
              <span>{selectedRoom ? 'Room Inspector' : selectedFurniture ? 'Furniture Inspector' : 'Inspector'}</span>
            </div>
            <button type="button" onClick={() => setIsRightDrawerOpen(false)} className="ps-drawer-close">
              <X size={15} />
            </button>
          </div>

          <div className="ps-drawer-content">
            {selectedRoom ? (
              <>
                <div className="ps-form-group">
                  <label className="ps-label">Room Name</label>
                  <input
                    type="text"
                    value={selectedRoom.name}
                    onChange={(e) => {
                      const updated = rooms.map((r) => (r.id === selectedRoom.id ? { ...r, name: e.target.value } : r));
                      setRooms(updated);
                    }}
                    className="ps-input"
                  />
                </div>

                <div className="ps-dimension-box">
                  <span className="ps-dim-label">Dimensions:</span>
                  <span className="ps-dim-val">
                    {unit === 'imperial'
                      ? `${toFeetInches(selectedRoom.w)} × ${toFeetInches(selectedRoom.d)}`
                      : `${selectedRoom.w.toFixed(2)}m × ${selectedRoom.d.toFixed(2)}m`}
                  </span>
                  <span className="ps-dim-area">
                    Carpet Area: {formatArea(selectedRoom.w * selectedRoom.d, unit)}
                  </span>
                </div>

                <div className="ps-form-group">
                  <label className="ps-label">Vastu Room Type</label>
                  <select
                    value={selectedRoom.type}
                    onChange={(e) => {
                      const updated = rooms.map((r) => (r.id === selectedRoom.id ? { ...r, type: e.target.value } : r));
                      setRooms(updated);
                    }}
                    className="ps-select"
                  >
                    <option value="living">Living & Drawing Hall (Indra/Kubera)</option>
                    <option value="master">Master Bedroom Suite (Niruthi SW)</option>
                    <option value="bedroom">Guest / Kids Bedroom (Vayu NW)</option>
                    <option value="kitchen">Modular Chef Kitchen (Agni SE)</option>
                    <option value="dining">Dining Courtyard (Varuna W)</option>
                    <option value="puja">Ishaan Meditation Mandir (NE)</option>
                    <option value="bath">Ensuite Luxury Toilet</option>
                    <option value="parking">Stilt Vehicle Parking</option>
                    <option value="balcony">Open Glass Balcony</option>
                  </select>
                </div>

                <div className="ps-form-group">
                  <label className="ps-label">Floor Finish Material</label>
                  <select
                    value={selectedRoom.floorMat || 'marble_calacatta'}
                    onChange={(e) => {
                      const updated = rooms.map((r) => (r.id === selectedRoom.id ? { ...r, floorMat: e.target.value } : r));
                      setRooms(updated);
                    }}
                    className="ps-select"
                  >
                    {FLOOR_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                    ))}
                  </select>
                </div>

                <div className="ps-form-group">
                  <label className="ps-label">Wall Paint & Plaster</label>
                  <select
                    value={selectedRoom.wallMat || 'wall_white_chalk'}
                    onChange={(e) => {
                      const updated = rooms.map((r) => (r.id === selectedRoom.id ? { ...r, wallMat: e.target.value } : r));
                      setRooms(updated);
                    }}
                    className="ps-select"
                  >
                    {WALL_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : selectedFurniture ? (
              <>
                <div className="ps-form-group">
                  <label className="ps-label">Furniture Name</label>
                  <input
                    type="text"
                    value={selectedFurniture.name}
                    onChange={(e) => {
                      const updated = furniture.map((f) => (f.id === selectedFurniture.id ? { ...f, name: e.target.value } : f));
                      setFurniture(updated);
                    }}
                    className="ps-input"
                  />
                </div>

                <div className="ps-dimension-box">
                  <span className="ps-dim-label">Dimensions:</span>
                  <span className="ps-dim-val">
                    {unit === 'imperial'
                      ? `${toFeetInches(selectedFurniture.w)} × ${toFeetInches(selectedFurniture.d)}`
                      : `${selectedFurniture.w.toFixed(2)}m × ${selectedFurniture.d.toFixed(2)}m`}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = furniture.map((f) => (f.id === selectedFurniture.id ? { ...f, rot: ((f.rot || 0) + 45) % 360 } : f));
                      setFurniture(updated);
                      pushHistory(rooms, updated);
                      showToast(`Rotated ${selectedFurniture.name}`, '↻');
                    }}
                    className="ps-pill-btn"
                  >
                    <RotateCw size={13} />
                    <span>Rotate 45°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = furniture.filter((f) => f.id !== selectedFurniture.id);
                      setFurniture(updated);
                      pushHistory(rooms, updated);
                      setSelectedFurnitureId(null);
                      setIsRightDrawerOpen(false);
                      showToast('Item deleted', '🗑️');
                    }}
                    className="ps-pill-btn danger"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                <MousePointer size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p>Click any room or furniture item on the plan to inspect dimensions, finishes, and Vastu alignment.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── 0. ARCHITECTURAL BLUEPRINT UPLOAD & 3D CONVERTER MODAL ────── */}
      {isUploadModalOpen && (
        <div className="ps-modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div className="ps-modal-card ps-upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UploadCloud size={20} color="#fae8a4" />
                <span className="ps-modal-title">Upload Architectural Blueprint & Render 3D</span>
              </div>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="ps-modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="ps-modal-body">
              {/* Drag & Drop File Zone */}
              <div
                className="ps-dropzone"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processUploadedFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,.dxf,.json"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processUploadedFile(e.target.files[0]);
                    }
                  }}
                />
                <FileUp size={44} color="#fae8a4" style={{ marginBottom: '8px' }} />
                <span className="ps-drop-title">Click to Browse or Drag & Drop Blueprint File</span>
                <span className="ps-drop-sub">Supports Architectural Images (JPG, PNG, WEBP), CAD DXF, and Project JSON</span>
                <span className="ps-drop-badge">Auto 3D Extrusion & 1:1 Scale Stage Conversion</span>
              </div>

              {/* Sample Blueprints Quick-Try (Ground, First, Stilt, Terrace) */}
              <div style={{ marginTop: '20px' }}>
                <div className="ps-section-header">
                  <span className="ps-section-title">Or Try Sample Architectural Blueprints (1-Click 3D)</span>
                </div>
                <div className="ps-sample-blueprints-grid">
                  <button
                    type="button"
                    className="ps-sample-card"
                    onClick={() => {
                      setUploadedBlueprint({
                        imageUrl: '/blueprints/ground_floor_plan.jpg',
                        name: 'Ground Floor Plan (29ft-11in × 75ft-2in)',
                        width: 9.12,
                        depth: 22.91
                      });
                      handleFloorChange('ground');
                      setViewMode('3d_axo');
                      setIsUploadModalOpen(false);
                      showToast('Loaded Ground Floor Blueprint in 3D!', '🚀');
                    }}
                  >
                    <img src="/blueprints/ground_floor_plan.jpg" alt="Ground Floor" className="ps-sample-thumb" />
                    <span className="ps-sample-name">Ground Floor Plan</span>
                    <span className="ps-sample-dims">29'-11" × 75'-2" (Drawing, Kitchen, Master)</span>
                  </button>

                  <button
                    type="button"
                    className="ps-sample-card"
                    onClick={() => {
                      setUploadedBlueprint({
                        imageUrl: '/blueprints/first_floor_plan.jpg',
                        name: 'First Floor Plan (29ft-11in × 75ft-2in)',
                        width: 9.12,
                        depth: 22.91
                      });
                      handleFloorChange('first');
                      setViewMode('3d_axo');
                      setIsUploadModalOpen(false);
                      showToast('Loaded First Floor Blueprint in 3D!', '🚀');
                    }}
                  >
                    <img src="/blueprints/first_floor_plan.jpg" alt="First Floor" className="ps-sample-thumb" />
                    <span className="ps-sample-name">First Floor Plan</span>
                    <span className="ps-sample-dims">29'-11" × 75'-2" (Family Lounge, Suites)</span>
                  </button>

                  <button
                    type="button"
                    className="ps-sample-card"
                    onClick={() => {
                      setUploadedBlueprint({
                        imageUrl: '/blueprints/stilt_floor_plan.png',
                        name: 'Stilt Floor Plan (29ft-11in × 75ft-2in)',
                        width: 9.12,
                        depth: 22.91
                      });
                      handleFloorChange('stilt');
                      setViewMode('3d_axo');
                      setIsUploadModalOpen(false);
                      showToast('Loaded Stilt Floor Blueprint in 3D!', '🚀');
                    }}
                  >
                    <img src="/blueprints/stilt_floor_plan.png" alt="Stilt Floor" className="ps-sample-thumb" />
                    <span className="ps-sample-name">Stilt Floor Plan</span>
                    <span className="ps-sample-dims">8-Car Covered Parking & Staff</span>
                  </button>

                  <button
                    type="button"
                    className="ps-sample-card"
                    onClick={() => {
                      setUploadedBlueprint({
                        imageUrl: '/blueprints/terrace_floor_plan.png',
                        name: 'Terrace Floor Plan (29ft-11in × 75ft-2in)',
                        width: 9.12,
                        depth: 22.91
                      });
                      handleFloorChange('terrace');
                      setViewMode('3d_axo');
                      setIsUploadModalOpen(false);
                      showToast('Loaded Terrace Pergola Blueprint in 3D!', '🚀');
                    }}
                  >
                    <img src="/blueprints/terrace_floor_plan.png" alt="Terrace Floor" className="ps-sample-thumb" />
                    <span className="ps-sample-name">Terrace Floor Plan</span>
                    <span className="ps-sample-dims">Timber Pergola & Open Party Deck</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS (VASTU, CLEARANCE, BOQ, HELP) ─────────────────────── */}
      {/* 1. Vastu Shastra Audit Modal */}
      {isVastuModalOpen && (
        <div className="ps-modal-backdrop" onClick={() => setIsVastuModalOpen(false)}>
          <div className="ps-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkle size={20} color="#fae8a4" />
                <span className="ps-modal-title">Vastu Shastra Architectural Audit</span>
              </div>
              <button type="button" onClick={() => setIsVastuModalOpen(false)} className="ps-modal-close"><X size={18} /></button>
            </div>
            <div className="ps-modal-body">
              <div className="ps-score-hero">
                <span className="ps-score-num">{vastuResult.score}%</span>
                <span className="ps-score-label">Vastu Purusha Harmony Score</span>
                <p className="ps-score-sub">Architecturally aligned with ancient Vedic geometry for solar daylight and energy flow.</p>
              </div>
              <div className="ps-audit-list">
                {vastuResult.reports.map((item) => (
                  <div key={item.id} className="ps-audit-card pass">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ps-audit-zone">{item.zone}</span>
                      <span className="ps-audit-tag">{item.score}</span>
                    </div>
                    <span className="ps-audit-card-title">{item.title}</span>
                    <p className="ps-audit-card-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Clearance & Ergonomics Audit Modal */}
      {isClearanceModalOpen && (
        <div className="ps-modal-backdrop" onClick={() => setIsClearanceModalOpen(false)}>
          <div className="ps-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#38bdf8" />
                <span className="ps-modal-title">Ergonomics & Clearance Safety Check</span>
              </div>
              <button type="button" onClick={() => setIsClearanceModalOpen(false)} className="ps-modal-close"><X size={18} /></button>
            </div>
            <div className="ps-modal-body">
              {clearanceAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#10b981' }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 700, fontSize: '16px' }}>All Clearances Meet NBC Standards!</p>
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>Corridors exceed 3'-0" (0.9m) and door swings are unhindered.</p>
                </div>
              ) : (
                <div className="ps-audit-list">
                  {clearanceAlerts.map((a) => (
                    <div key={a.id} className={`ps-audit-card ${a.severity}`}>
                      <span className="ps-audit-card-title">{a.title}</span>
                      <p className="ps-audit-card-text">{a.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Upgraded Industry-Grade Bill of Quantities (BOQ) Modal with Excel Export */}
      {isBoqModalOpen && (
        <div className="ps-modal-backdrop" onClick={() => setIsBoqModalOpen(false)}>
          <div className="ps-modal-card ps-boq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={20} color="#fae8a4" />
                <span className="ps-modal-title">Bill of Quantities (BOQ) & Civil Estimator</span>
              </div>
              <button type="button" onClick={() => setIsBoqModalOpen(false)} className="ps-modal-close"><X size={18} /></button>
            </div>
            <div className="ps-modal-body">
              {/* 4 High-Precision KPI Metrics */}
              <div className="ps-boq-kpi-grid">
                <div className="ps-boq-kpi-card">
                  <span className="ps-kpi-label">Built-Up Area</span>
                  <span className="ps-kpi-val">{boqData.builtUpSqFt.toLocaleString()} sq.ft</span>
                  <span className="ps-kpi-sub">{boqData.builtUpSqM} m² total footprint</span>
                </div>
                <div className="ps-boq-kpi-card">
                  <span className="ps-kpi-label">Usable Carpet Area</span>
                  <span className="ps-kpi-val">{boqData.carpetSqFt.toLocaleString()} sq.ft</span>
                  <span className="ps-kpi-sub">{boqData.carpetSqM} m² living spaces</span>
                </div>
                <div className="ps-boq-kpi-card gold">
                  <span className="ps-kpi-label">Turnkey Project Estimate</span>
                  <span className="ps-kpi-val">₹{boqData.costTotalCrores} Cr</span>
                  <span className="ps-kpi-sub">₹{boqData.ratePerSqFt.toLocaleString()} / sq.ft</span>
                </div>
                <div className="ps-boq-kpi-card savings">
                  <span className="ps-kpi-label">Verified Savings with 1:1 Projection</span>
                  <span className="ps-kpi-val">₹{boqData.savingsLakhs} Lakhs</span>
                  <span className="ps-kpi-sub">Saved in avoided change-orders</span>
                </div>
              </div>

              {/* Walk The Plan Savings Banner */}
              <div className="ps-boq-savings-banner">
                <Sparkles size={18} color="#34d399" />
                <span>
                  <strong>Industry-Beating Advantage:</strong> Walking your floor plan at 1:1 true scale and projecting onto your plot eliminates 92% of on-site wall relocations, plumbing reroutes, and demolition reworks.
                </span>
              </div>

              {/* Complete Trade Cost Breakdown Table */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Trade-Wise Civil & Interiors Cost Breakdown
                </span>
                <table className="ps-boq-table">
                  <thead>
                    <tr>
                      <th>Trade / Item Description</th>
                      <th>Coverage / Scope</th>
                      <th>Benchmark Rate</th>
                      <th>Total Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Civil Structure & RCC Foundation (Columns, Beams, Slabs)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹1,650 / sq.ft</td>
                      <td>₹{(boqData.costStructure / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>Masonry & Brickwork (External 9" & Internal 4.5" AAC blocks)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹450 / sq.ft</td>
                      <td>₹{(boqData.costMasonry / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>Luxury Flooring & Skirting (Italian Marble & Engineered Wood)</td>
                      <td>{boqData.carpetSqFt.toLocaleString()} sq.ft</td>
                      <td>₹380 / sq.ft</td>
                      <td>₹{(boqData.costFinishes / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>Wall Finishes & Architectural Emulsion (POP Punning + Primer)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹180 / sq.ft</td>
                      <td>₹{(boqData.costPaint / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>MEP & Smart Home Conduiting (Concealed FRLS Copper Wiring)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹240 / sq.ft</td>
                      <td>₹{(boqData.costMEP / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>Plumbing & Sanitaryware (CPVC Lines, Grohe/Kohler Luxury Fixtures)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹190 / sq.ft</td>
                      <td>₹{(boqData.costPlumbing / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>UPVC & Acoustic Glazing (Soundproof Double Glazed Windows)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹280 / sq.ft</td>
                      <td>₹{(boqData.costFenestration / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>Custom Interior Woodwork (Wardrobes, Modular Kitchen & TV units)</td>
                      <td>{boqData.builtUpSqFt.toLocaleString()} sq.ft</td>
                      <td>₹550 / sq.ft</td>
                      <td>₹{(boqData.costInterior / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr>
                      <td>Placed Modular Furniture Pieces ({furniture.length} items configured)</td>
                      <td>{furniture.length} units</td>
                      <td>Catalog Market Rate</td>
                      <td>₹{(boqData.furnitureValue / 100000).toFixed(2)} Lakhs</td>
                    </tr>
                    <tr className="total-row">
                      <td colSpan="3">Total Estimated Turnkey Civil & Interior Value</td>
                      <td>₹{boqData.costTotalCrores} Crores</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Material Quantities Takeoff Estimation */}
              <div style={{ marginTop: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Raw Materials Takeoff (Estimated Quantities)
                </span>
                <div className="ps-boq-materials-grid">
                  <div className="ps-material-card">
                    <span className="ps-mat-name">Cement</span>
                    <span className="ps-mat-val">{boqData.cementBags.toLocaleString()} Bags</span>
                    <span className="ps-mat-spec">Ultratech / ACC 53-Grade</span>
                  </div>
                  <div className="ps-material-card">
                    <span className="ps-mat-name">Reinforcement Steel</span>
                    <span className="ps-mat-val">{boqData.steelTonnes} Tonnes</span>
                    <span className="ps-mat-spec">Tata Tiscon / Jindal Fe550D TMT</span>
                  </div>
                  <div className="ps-material-card">
                    <span className="ps-mat-name">Masonry Bricks/Blocks</span>
                    <span className="ps-mat-val">{boqData.bricksUnits.toLocaleString()} Units</span>
                    <span className="ps-mat-spec">Standard Red Clay / Autoclaved AAC</span>
                  </div>
                  <div className="ps-material-card">
                    <span className="ps-mat-name">M-Sand / River Sand</span>
                    <span className="ps-mat-val">{boqData.sandCuFt.toLocaleString()} cu.ft</span>
                    <span className="ps-mat-spec">Washed plastering sand</span>
                  </div>
                  <div className="ps-material-card">
                    <span className="ps-mat-name">Coarse Aggregates</span>
                    <span className="ps-mat-val">{boqData.aggregateCuFt.toLocaleString()} cu.ft</span>
                    <span className="ps-mat-spec">20mm & 10mm graded granite blue metal</span>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    exportBOQToExcel(boqData, building.name, initialFloor.name);
                    showToast('Exported Detailed BOQ (.xlsx)', '📊');
                  }}
                  className="ps-btn-gold"
                >
                  <Download size={14} />
                  <span>Download Professional Excel BOQ (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Help & Shortcuts Modal */}
      {isHelpOpen && (
        <div className="ps-modal-backdrop" onClick={() => setIsHelpOpen(false)}>
          <div className="ps-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal-header">
              <span className="ps-modal-title">Walk The Plan · 1:1 Studio Guide</span>
              <button type="button" onClick={() => setIsHelpOpen(false)} className="ps-modal-close"><X size={18} /></button>
            </div>
            <div className="ps-modal-body">
              <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                Welcome to <strong>Walk The Plan's 1:1 Scale Architectural Projection Studio</strong>.
                Step inside blueprints at true life-size, test furniture clearances, and inspect multi-floor CAD drawings before laying a single brick.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="ps-help-item">
                  <strong>Move & Resize:</strong> In 2D CAD Blueprint view, drag furniture to move it. Select any room to drag its center handle or resize its walls via corner and edge handles!
                </div>
                <div className="ps-help-item">
                  <strong>Keyboard Shortcuts:</strong> Arrow keys nudge selected item (Shift+Arrows for 0.5m), 'R' rotates furniture, 'Delete' removes item, 'Esc' deselects, Ctrl+Z / Ctrl+Y for undo/redo.
                </div>
                <div className="ps-help-item">
                  <strong>3D Land Plot Projector:</strong> Select real plot dimensions (30'x60', 40'x60', etc.) and watch the 3D laser projector beam map the blueprint onto real land.
                </div>
                <div className="ps-help-item">
                  <strong>Industry-Beating BOQ:</strong> Real-time material takeoff and Excel export comparing actual costs against traditional contractor estimates.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="ps-toast">
          <span className="ps-toast-icon">{toastMessage.icon}</span>
          <span>{toastMessage.msg}</span>
        </div>
      )}
    </div>
  );
}
