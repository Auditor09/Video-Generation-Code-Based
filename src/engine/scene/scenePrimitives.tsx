/**
 * CinemaToon 2.5D Illustrated Scene Backgrounds, Foreground Framing & Animated Props
 * Unified painted 2.5D vector staging across all 13 environments with atmospheric depth,
 * tonal flooring, directional key lighting, and foreground framing.
 */

import React from 'react';
import { BackgroundSceneId, RenderStyle, ScenePropSpec } from '../../schemas/character.schema';

export const BACKGROUND_OPTIONS: Array<{ id: BackgroundSceneId; label: string; category: string }> = [
  { id: 'podcast_studio', label: 'Podcast Studio', category: 'Studio' },
  { id: 'laboratory', label: 'Quantum Laboratory', category: 'Indoor' },
  { id: 'cafe_diner', label: 'Neighborhood Cafe', category: 'Indoor' },
  { id: 'neighborhood_street', label: 'Neighborhood Cottages', category: 'Outdoor' },
  { id: 'police_precinct', label: 'Police Precinct', category: 'Indoor' },
  { id: 'rooftop_night', label: 'Moonlit Rooftop', category: 'Outdoor' },
  { id: 'cozy_living_room', label: 'Cozy Living Room', category: 'Indoor' },
  { id: 'office_desk', label: 'Modern Office', category: 'Indoor' },
  { id: 'city_street', label: 'Downtown City Street', category: 'Outdoor' },
  { id: 'forest_trail', label: 'Pine Forest Trail', category: 'Outdoor' },
  { id: 'classroom', label: 'School Classroom', category: 'Indoor' },
  { id: 'tv_studio', label: 'Broadcast TV Studio', category: 'Studio' },
  { id: 'studio_backdrop', label: 'Clean Studio Cyclorama', category: 'Studio' },
];

type FloorKind = 'wood' | 'stone' | 'studio' | 'earth';

function renderStageFloor(
  uid: string,
  fullX: number,
  fullW: number,
  floorY: number,
  bottomY: number,
  width: number,
  fillTop: string,
  fillBot: string,
  seamColor: string,
  kind: FloorKind = 'wood'
): React.ReactNode {
  const floorH = bottomY - floorY;
  return (
    <g>
      <defs>
        <linearGradient id={`sf_floor_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="100%" stopColor={fillBot} />
        </linearGradient>
        <linearGradient id={`sf_floor_ao_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x={fullX} y={floorY} width={fullW} height={floorH} fill={`url(#sf_floor_${uid})`} />

      {kind === 'wood' && (
        <g stroke={seamColor} strokeWidth={1.1} opacity={0.18}>
          {[0.08, 0.2, 0.36, 0.56].map((f, idx) => (
            <line
              key={`plh_${idx}`}
              x1={fullX}
              y1={floorY + floorH * f * 0.62}
              x2={fullX + fullW}
              y2={floorY + floorH * f * 0.62}
            />
          ))}
          {[-0.25, 0.0, 0.25, 0.5, 0.75, 1.0, 1.25].map((fx, i) => (
            <line
              key={`plv_${i}`}
              x1={width * fx}
              y1={floorY}
              x2={width * (0.5 + (fx - 0.5) * 1.45)}
              y2={bottomY}
            />
          ))}
        </g>
      )}

      {kind === 'stone' && (
        <g stroke={seamColor} strokeWidth={1.1} opacity={0.16}>
          {[0.12, 0.3, 0.55].map((f, idx) => (
            <line
              key={`sth_${idx}`}
              x1={fullX}
              y1={floorY + floorH * f * 0.55}
              x2={fullX + fullW}
              y2={floorY + floorH * f * 0.55}
            />
          ))}
          {[-0.2, 0.08, 0.36, 0.64, 0.92, 1.2].map((fx, i) => (
            <line
              key={`stv_${i}`}
              x1={width * fx}
              y1={floorY}
              x2={width * (0.5 + (fx - 0.5) * 1.38)}
              y2={bottomY}
            />
          ))}
        </g>
      )}

      {kind === 'studio' && (
        <ellipse
          cx={width * 0.5}
          cy={floorY + 34}
          rx={width * 0.42}
          ry={34}
          fill="#FFFFFF"
          opacity={0.05}
        />
      )}

      {/* Subtle wall-floor contact ambient occlusion shadow */}
      <rect x={fullX} y={floorY} width={fullW} height={22} fill={`url(#sf_floor_ao_${uid})`} />
      <line x1={fullX} y1={floorY} x2={fullX + fullW} y2={floorY} stroke={seamColor} strokeWidth={1.5} opacity={0.35} />
    </g>
  );
}

export function renderSceneBackground(
  background: BackgroundSceneId,
  width: number,
  height: number,
  t: number,
  camX = 0,
  _renderStyle: RenderStyle = '2.5d_parallax'
): React.ReactNode {
  const padX = 420;
  const padY = 280;
  const fullX = -padX;
  const fullY = -padY;
  const fullW = width + padX * 2;
  const fullH = height + padY * 2;
  const bottomY = height + padY;

  switch (background) {
    case 'podcast_studio': {
      const floorY = height * 0.78;
      const onAirPulse = 0.82 + 0.18 * Math.sin(t * 2.5);
      return (
        <g>
          <defs>
            <linearGradient id="sf_pod_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1120" />
              <stop offset="58%" stopColor="#162033" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <radialGradient id="sf_pod_warm_l" cx="27%" cy="48%" r="42%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sf_pod_cool_r" cx="73%" cy="48%" r="42%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_pod_wall)" />
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_pod_warm_l)" />
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_pod_cool_r)" />

          {/* Architectural Acoustic Walnut Wood Slats */}
          <g transform={`translate(${-camX * 0.08}, 0)`}>
            {[-0.09, -0.02, 0.05, 0.12, 0.19, 0.81, 0.88, 0.95, 1.02, 1.09].map((px, i) => (
              <g key={`slat_${i}`} transform={`translate(${width * px}, 0)`}>
                <rect x={0} y={fullY} width={width * 0.036} height={floorY - fullY} fill={i % 2 === 0 ? '#5C2D12' : '#713817'} opacity={0.62} />
                <rect x={width * 0.03} y={fullY} width={width * 0.006} height={floorY - fullY} fill="#F59E0B" opacity={0.1} />
              </g>
            ))}

            {/* Center Acoustic Diffuser Wall */}
            <g transform={`translate(${width * 0.27}, ${height * 0.09})`}>
              <rect width={width * 0.46} height={height * 0.5} rx={12} fill="#0B1220" stroke="#1E293B" strokeWidth={2} />
              {[0, 1, 2, 3, 4, 5].map((col) =>
                [0, 1, 2, 3].map((row) => (
                  <rect
                    key={`foam_${col}_${row}`}
                    x={18 + col * ((width * 0.46 - 36) / 6)}
                    y={18 + row * ((height * 0.5 - 36) / 4)}
                    width={(width * 0.46 - 58) / 6}
                    height={(height * 0.5 - 54) / 4}
                    rx={5}
                    fill={(col + row) % 2 === 0 ? '#162032' : '#1E293B'}
                    stroke="#0F172A"
                    strokeWidth={1}
                  />
                ))
              )}
              <rect x={18} y={height * 0.5 - 12} width={width * 0.46 - 36} height={3} rx={1.5} fill="#38BDF8" opacity={0.65} />
            </g>

            {/* Illuminated ON AIR Studio Sign */}
            <g transform={`translate(${width * 0.5}, ${height * 0.21})`}>
              <rect x={-76} y={-24} width={152} height={48} rx={10} fill="#EF4444" opacity={0.14 * onAirPulse} />
              <rect x={-68} y={-20} width={136} height={40} rx={8} fill="#09090B" stroke="#F87171" strokeWidth={1.8} opacity={onAirPulse} />
              <text
                x={0}
                y={7}
                textAnchor="middle"
                fill="#FECACA"
                fontSize={18}
                fontWeight={800}
                letterSpacing={3.5}
                fontFamily="JetBrains Mono, monospace"
                opacity={onAirPulse}
              >
                ON AIR
              </text>
            </g>

            {/* Vertical Rim Light Bars */}
            <rect x={width * 0.23} y={height * 0.13} width={5} height={height * 0.44} rx={2.5} fill="#F59E0B" opacity={0.7} />
            <rect x={width * 0.77} y={height * 0.13} width={5} height={height * 0.44} rx={2.5} fill="#38BDF8" opacity={0.7} />

            {/* Studio Bookshelf & Plant Silhouettes */}
            <g transform={`translate(${width * 0.04}, ${height * 0.26})`} opacity={0.65}>
              <rect x={0} y={0} width={width * 0.12} height={10} rx={2} fill="#451A03" />
              <rect x={14} y={-26} width={12} height={26} rx={2} fill="#D97706" />
              <rect x={28} y={-22} width={10} height={22} rx={2} fill="#0284C7" />
              <circle cx={width * 0.09} cy={-16} r={14} fill="#15803D" />
            </g>
          </g>

          {/* Ergonomic Studio Chairs behind Seated Hosts */}
          {[0.28, 0.72].map((cx, i) => (
            <g key={`chair_${i}`} transform={`translate(${width * cx}, ${height * 0.85})`}>
              <rect x={-46} y={-232} width={92} height={114} rx={18} fill="#182235" stroke="#0B1120" strokeWidth={1.6} />
              <rect x={-34} y={-216} width={68} height={82} rx={12} fill="#26334D" opacity={0.6} />
              <rect x={-9} y={-118} width={18} height={85} fill="#0F172A" />
            </g>
          ))}

          {renderStageFloor('pod', fullX, fullW, floorY, bottomY, width, '#182235', '#090D16', '#334155', 'studio')}
        </g>
      );
    }

    case 'neighborhood_street': {
      const floorY = height * 0.74;
      const cloudShift = (t * 5 - camX * 0.08) % (width + 320);
      return (
        <g>
          <defs>
            <linearGradient id="sf_neigh_sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="52%" stopColor="#4F7CA6" />
              <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.88" />
            </linearGradient>
            <radialGradient id="sf_neigh_sun" cx="76%" cy="28%" r="48%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_neigh_sky)" />
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_neigh_sun)" />

          {/* Soft Golden Hour Clouds */}
          <g transform={`translate(${cloudShift - 180}, ${height * 0.13})`} opacity={0.72}>
            <ellipse cx={60} cy={22} rx={58} ry={18} fill="#FEF3C7" />
            <ellipse cx={112} cy={14} rx={44} ry={20} fill="#FFFBEB" />
          </g>

          {/* Far Rolling Hills + Soft Painted Pines */}
          <g transform={`translate(${-camX * 0.12}, 0)`}>
            <path
              d={`M ${fullX} ${floorY} Q ${width * 0.22} ${floorY - 165} ${width * 0.52} ${floorY - 68} Q ${width * 0.8} ${floorY - 185} ${fullX + fullW} ${floorY - 40} L ${fullX + fullW} ${floorY} Z`}
              fill="#314C5E"
              opacity={0.72}
            />
            {[0.28, 0.39, 0.66, 0.78].map((px, i) => {
              const tx = width * px;
              const ty = floorY - 12 - (i % 2) * 16;
              const sc = 0.84 + (i % 2) * 0.2;
              return (
                <g key={`npine_${i}`} transform={`translate(${tx}, ${ty}) scale(${sc})`}>
                  <rect x={-6} y={-24} width={12} height={30} fill="#4A2E1B" />
                  <polygon points="0,-165 -42,-82 42,-82" fill="#2F6B55" stroke="#1E4235" strokeWidth={1.3} strokeLinejoin="round" />
                  <polygon points="0,-125 -52,-38 52,-38" fill="#275A47" stroke="#1E4235" strokeWidth={1.3} strokeLinejoin="round" />
                  <polygon points="0,-82 -58,0 58,0" fill="#204D3C" stroke="#1E4235" strokeWidth={1.3} strokeLinejoin="round" />
                </g>
              );
            })}
            <g transform={`translate(${width * 0.53}, ${floorY - 14})`}>
              <rect x={-9} y={-88} width={18} height={92} rx={4} fill="#5C3A21" />
              <circle cx={0} cy={-122} r={54} fill="#2D7A5E" />
              <circle cx={-16} cy={-136} r={24} fill="#6EE7B7" opacity={0.22} />
            </g>
          </g>

          {/* Midground Cozy Cottages (Crisp Painted Strokes) */}
          <g transform={`translate(${-camX * 0.28}, 0)`}>
            <g transform={`translate(${width * 0.04}, ${floorY})`}>
              <rect x={0} y={-228} width={185} height={228} rx={4} fill="#EAE0CE" stroke="#8C7A65" strokeWidth={1.5} />
              <rect x={156} y={-228} width={29} height={228} fill="#D6C6AE" opacity={0.55} />
              <polygon points="-14,-228 92,-332 199,-228" fill="#B45309" stroke="#78350F" strokeWidth={1.6} strokeLinejoin="round" />
              <circle cx={92} cy={-272} r={19} fill="#FEF08A" stroke="#78350F" strokeWidth={1.6} />
              <rect x={28} y={-190} width={46} height={54} rx={3} fill="#FEF08A" stroke="#78350F" strokeWidth={1.5} />
              <rect x={110} y={-190} width={46} height={54} rx={3} fill="#FEF08A" stroke="#78350F" strokeWidth={1.5} />
              <rect x={68} y={-96} width={50} height={96} rx={4} fill="#0F766E" stroke="#134E4A" strokeWidth={1.5} />
              <circle cx={106} cy={-48} r={4} fill="#FDE047" />
            </g>

            <g transform={`translate(${width * 0.79}, ${floorY})`}>
              <rect x={0} y={-195} width={165} height={195} rx={4} fill="#DDD6C7" stroke="#8C7A65" strokeWidth={1.5} />
              <polygon points="-12,-195 82,-282 177,-195" fill="#9A3412" stroke="#7C2D12" strokeWidth={1.6} strokeLinejoin="round" />
              <rect x={26} y={-152} width={42} height={46} rx={3} fill="#FEF08A" stroke="#78350F" strokeWidth={1.5} />
              <rect x={92} y={-84} width={46} height={84} rx={3} fill="#5C3A21" stroke="#451A03" strokeWidth={1.5} />
            </g>
          </g>

          {/* Soft Curb + Paved Cobblestone Walkway */}
          <rect x={fullX} y={floorY - 12} width={fullW} height={12} fill="#CBD5E1" opacity={0.85} />
          {renderStageFloor('neigh', fullX, fullW, floorY, bottomY, width, '#94A3B8', '#475569', '#334155', 'stone')}
        </g>
      );
    }

    case 'forest_trail': {
      const floorY = height * 0.75;
      return (
        <g>
          <defs>
            <linearGradient id="sf_forest_sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="60%" stopColor="#3B6978" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_forest_sky)" />

          {/* Sunbeams filtering through trees */}
          <polygon points={`${width * 0.28},${fullY} ${width * 0.44},${fullY} ${width * 0.72},${floorY} ${width * 0.42},${floorY}`} fill="#FEF08A" opacity={0.12} />

          {/* Distant Misty Ridge */}
          <g transform={`translate(${-camX * 0.1}, 0)`}>
            <polygon
              points={`${fullX},${floorY} ${width * 0.15},${height * 0.34} ${width * 0.4},${floorY - 40} ${width * 0.68},${height * 0.28} ${fullX + fullW},${floorY}`}
              fill="#1E3A4C"
              opacity={0.55}
            />
          </g>

          {/* Midground Pine Grove */}
          <g transform={`translate(${-camX * 0.25}, 0)`}>
            {[-0.02, 0.12, 0.26, 0.43, 0.59, 0.75, 0.9, 1.04].map((px, i) => {
              const scale = 0.8 + (i % 3) * 0.18;
              const col = i % 2 === 0 ? '#1E4D3B' : '#255F49';
              return (
                <g key={`ftree_${i}`} transform={`translate(${width * px}, ${floorY}) scale(${scale})`}>
                  <rect x={-7} y={-36} width={14} height={36} fill="#452719" />
                  <polygon points="0,-210 -44,-110 44,-110" fill={col} />
                  <polygon points="0,-150 -54,-56 54,-56" fill={col} />
                  <polygon points="0,-95 -62,-12 62,-12" fill={col} />
                </g>
              );
            })}
          </g>

          {renderStageFloor('for', fullX, fullW, floorY, bottomY, width, '#6D543E', '#3D2C1E', '#291D12', 'earth')}
        </g>
      );
    }

    case 'cozy_living_room': {
      const floorY = height * 0.74;
      return (
        <g>
          <defs>
            <linearGradient id="sf_living_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDF6E9" />
              <stop offset="100%" stopColor="#F3E5CE" />
            </linearGradient>
            <radialGradient id="sf_lamp_glow" cx="16%" cy="38%" r="36%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_living_wall)" />
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_lamp_glow)" />

          {/* Wainscoting */}
          <rect x={fullX} y={height * 0.56} width={fullW} height={floorY - height * 0.56} fill="#E7D4B5" />
          <rect x={fullX} y={height * 0.55} width={fullW} height={8} fill="#C6AB84" />

          {/* Picture Window */}
          <g transform={`translate(${width * 0.62}, ${height * 0.14})`}>
            <rect width={width * 0.24} height={height * 0.3} rx={6} fill="#BAE6FD" stroke="#7C5836" strokeWidth={4} />
            <line x1={width * 0.12} y1={0} x2={width * 0.12} y2={height * 0.3} stroke="#7C5836" strokeWidth={2.5} />
            <line x1={0} y1={height * 0.15} x2={width * 0.24} y2={height * 0.15} stroke="#7C5836" strokeWidth={2.5} />
          </g>

          {/* Cozy Sofa */}
          <g transform={`translate(${width * 0.26}, ${floorY})`}>
            <rect x={0} y={-92} width={width * 0.38} height={66} rx={12} fill="#0F766E" stroke="#134E4A" strokeWidth={1.6} />
            <rect x={-16} y={-62} width={34} height={54} rx={8} fill="#115E59" stroke="#134E4A" strokeWidth={1.6} />
            <rect x={width * 0.38 - 18} y={-62} width={34} height={54} rx={8} fill="#115E59" stroke="#134E4A" strokeWidth={1.6} />
            <rect x={10} y={-44} width={width * 0.38 - 20} height={36} rx={6} fill="#14B8A6" stroke="#134E4A" strokeWidth={1.4} />
          </g>

          {/* Warm Floor Lamp */}
          <g transform={`translate(${width * 0.14}, ${floorY})`}>
            <rect x={-3.5} y={-215} width={7} height={215} fill="#334155" />
            <polygon points="-28,-210 28,-210 18,-252 -18,-252" fill="#FEF08A" stroke="#CA8A04" strokeWidth={1.6} />
          </g>

          {renderStageFloor('liv', fullX, fullW, floorY, bottomY, width, '#C8925A', '#8C5E34', '#5C3A21', 'wood')}
          {/* Woven Area Rug */}
          <ellipse cx={width * 0.48} cy={floorY + 54} rx={width * 0.28} ry={26} fill="#B45309" opacity={0.28} />
        </g>
      );
    }

    case 'cafe_diner': {
      const floorY = height * 0.74;
      const steamShift = (t * 14) % 24;
      return (
        <g>
          <defs>
            <linearGradient id="sf_cafe_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
            <radialGradient id="sf_cafe_lamp1" cx="28%" cy="32%" r="36%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_cafe_wall)" />
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_cafe_lamp1)" />

          {/* Warm Cafe Wainscot */}
          <rect x={fullX} y={height * 0.56} width={fullW} height={floorY - height * 0.56} fill="#D6B89C" />
          <rect x={fullX} y={height * 0.55} width={fullW} height={8} fill="#926C4A" />

          {/* Chalkboard Menu */}
          <g transform={`translate(${width * 0.12}, ${height * 0.12})`}>
            <rect width={width * 0.3} height={height * 0.25} rx={6} fill="#1E293B" stroke="#78350F" strokeWidth={4} />
            <line x1={width * 0.03} y1={height * 0.06} x2={width * 0.24} y2={height * 0.06} stroke="#FDE047" strokeWidth={3} strokeLinecap="round" />
            <line x1={width * 0.03} y1={height * 0.12} x2={width * 0.2} y2={height * 0.12} stroke="#E2E8F0" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
            <line x1={width * 0.03} y1={height * 0.17} x2={width * 0.22} y2={height * 0.17} stroke="#E2E8F0" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
          </g>

          {/* Hanging Edison Pendant Lamps */}
          {[0.28, 0.52, 0.74].map((lx, i) => (
            <g key={`pendant_${i}`} transform={`translate(${width * lx}, 0)`}>
              <line x1={0} y1={fullY} x2={0} y2={height * 0.14} stroke="#334155" strokeWidth={2} />
              <path d="M -16 ${height * 0.14 + 14} Q 0 ${height * 0.12} 16 ${height * 0.14 + 14} Z" fill="#1E293B" />
              <circle cx={0} cy={height * 0.14 + 16} r={6} fill="#FEF08A" />
            </g>
          ))}

          {/* Espresso Counter & Machine */}
          <g transform={`translate(${width * 0.54}, ${floorY})`}>
            <rect x={0} y={-96} width={width * 0.34} height={96} rx={4} fill="#78350F" stroke="#451A03" strokeWidth={1.6} />
            <rect x={-10} y={-108} width={width * 0.34 + 20} height={14} rx={3} fill="#E7E5E4" stroke="#78716C" strokeWidth={1.4} />
            <rect x={44} y={-160} width={72} height={52} rx={5} fill="#475569" stroke="#1E293B" strokeWidth={1.5} />
            {/* Pastry Dome */}
            <path d="M 164 -108 A 28 24 0 0 1 220 -108 Z" fill="#E0F2FE" fillOpacity={0.55} stroke="#94A3B8" strokeWidth={1.4} />
            {/* Animated Steam */}
            <path
              d={`M 82 ${-166 - steamShift * 0.3} Q 76 ${-180 - steamShift * 0.4} 84 ${-192 - steamShift * 0.4}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2}
              opacity={0.45}
            />
          </g>

          {renderStageFloor('cafe', fullX, fullW, floorY, bottomY, width, '#D6C7B2', '#A8947A', '#78634B', 'wood')}
        </g>
      );
    }

    case 'laboratory': {
      const floorY = height * 0.74;
      const pulse = 0.58 + 0.42 * Math.sin(t * 3.2);
      return (
        <g>
          <defs>
            <linearGradient id="sf_lab_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1120" />
              <stop offset="65%" stopColor="#162238" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="sf_lab_tube" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id="sf_lab_core_glow" cx="58%" cy="44%" r="36%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_lab_wall)" />
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_lab_core_glow)" />

          {[-0.08, 0.14, 0.36, 0.58, 0.8, 1.02].map((rx, i) => (
            <rect
              key={`lab_rib_${i}`}
              x={width * rx}
              y={fullY}
              width={12}
              height={floorY - fullY}
              fill="#263449"
              opacity={0.55}
            />
          ))}
          <rect x={fullX} y={floorY - 20} width={fullW} height={14} fill="#1E293B" />
          <rect x={fullX} y={floorY - 6} width={fullW} height={5} fill="#F59E0B" opacity={0.78} />

          {/* Telemetry Screen */}
          <g transform={`translate(${width * 0.11}, ${height * 0.13})`}>
            <rect width={width * 0.36} height={height * 0.34} rx={10} fill="#1E293B" stroke="#334155" strokeWidth={2.5} />
            <rect x={12} y={12} width={width * 0.36 - 24} height={height * 0.34 - 24} rx={5} fill="#090F1C" />
            {[0.25, 0.5, 0.75].map((f, idx) => (
              <line
                key={`grid_h_${idx}`}
                x1={16}
                y1={12 + (height * 0.34 - 24) * f}
                x2={width * 0.36 - 16}
                y2={12 + (height * 0.34 - 24) * f}
                stroke="#1E293B"
                strokeWidth={1}
              />
            ))}
            <polyline
              points={`24,${height * 0.18} ${width * 0.08},${height * 0.18} ${width * 0.12},${height * 0.11} ${width * 0.17},${height * 0.24} ${width * 0.22},${height * 0.14} ${width * 0.27},${height * 0.18} ${width * 0.32},${height * 0.18}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6 + 0.4 * pulse}
            />
            <circle cx={width * 0.31} cy={28} r={4.5} fill="#EF4444" opacity={Math.floor(t * 2.5) % 2 === 0 ? 1 : 0.35} />
          </g>

          {/* Quantum Core Chamber */}
          <g transform={`translate(${width * 0.53}, ${height * 0.16})`}>
            <rect x={0} y={0} width={width * 0.1} height={floorY - height * 0.16} rx={6} fill="#263449" stroke="#1E293B" strokeWidth={1.8} />
            <rect x={8} y={24} width={width * 0.1 - 16} height={floorY - height * 0.16 - 48} rx={4} fill="url(#sf_lab_tube)" stroke="#38BDF8" strokeWidth={1.2} />
            {[0, 1, 2].map((b) => {
              const by = (t * 32 + b * 55) % (floorY - height * 0.24);
              return (
                <circle
                  key={`bub_${b}`}
                  cx={width * 0.05 + Math.sin(t * 2 + b) * 8}
                  cy={floorY - height * 0.2 - by}
                  r={3.5 + (b % 2) * 1.8}
                  fill="#E0F2FE"
                  opacity={0.7}
                />
              );
            })}
          </g>

          {/* Server Rack */}
          <g transform={`translate(${width * 0.67}, ${height * 0.21})`}>
            <rect width={width * 0.22} height={floorY - height * 0.21} rx={8} fill="#263449" stroke="#1E293B" strokeWidth={2} />
            {[0, 1, 2, 3, 4].map((row) => (
              <g key={`rack_${row}`} transform={`translate(14, ${18 + row * (height * 0.088)})`}>
                <rect width={width * 0.22 - 28} height={height * 0.06} rx={4} fill="#0F172A" />
                <circle cx={14} cy={height * 0.03} r={4} fill={(Math.floor(t * 3) + row) % 2 === 0 ? '#22C55E' : '#38BDF8'} />
                <circle cx={28} cy={height * 0.03} r={3.5} fill="#F59E0B" opacity={row % 2 === 0 ? 0.9 : 0.35} />
                <rect x={44} y={height * 0.022} width={width * 0.1} height={4} rx={2} fill="#1E293B" />
              </g>
            ))}
          </g>

          {renderStageFloor('lab', fullX, fullW, floorY, bottomY, width, '#243247', '#0B1120', '#38BDF8', 'studio')}
        </g>
      );
    }

    case 'city_street': {
      const sideY = height * 0.72;
      const roadY = height * 0.85;
      const cloudShift = (t * 7 - camX * 0.08) % (width + 300);
      return (
        <g>
          <defs>
            <linearGradient id="sf_city_sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0369A1" />
              <stop offset="55%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_city_sky)" />

          <g transform={`translate(${cloudShift - 160}, ${height * 0.11})`} opacity={0.85}>
            <ellipse cx={60} cy={22} rx={52} ry={20} fill="#FFFFFF" />
            <ellipse cx={102} cy={14} rx={42} ry={24} fill="#FFFFFF" />
            <ellipse cx={140} cy={25} rx={36} ry={16} fill="#FFFFFF" />
          </g>

          {/* Far Atmospheric City Silhouettes */}
          <g transform={`translate(${-camX * 0.08}, 0)`} opacity={0.38}>
            {[-0.08, 0.08, 0.22, 0.39, 0.54, 0.69, 0.84, 0.98].map((rx, i) => (
              <rect
                key={`far_${i}`}
                x={width * rx}
                y={height * (0.2 + (i % 3) * 0.07)}
                width={width * 0.13}
                height={sideY - height * (0.2 + (i % 3) * 0.07)}
                fill="#475569"
              />
            ))}
          </g>

          {/* Midground Architectural Facades */}
          <g transform={`translate(${-camX * 0.2}, 0)`}>
            {[
              { x: -0.05, w: 0.19, y: 0.26, col: '#B45309', trim: '#78350F', win: '#FEF08A' },
              { x: 0.16, w: 0.2, y: 0.18, col: '#475569', trim: '#334155', win: '#E0F2FE' },
              { x: 0.38, w: 0.22, y: 0.3, col: '#9A3412', trim: '#7C2D12', win: '#FDE68A' },
              { x: 0.62, w: 0.2, y: 0.22, col: '#334155', trim: '#1E293B', win: '#BAE6FD' },
              { x: 0.84, w: 0.22, y: 0.28, col: '#64748B', trim: '#475569', win: '#FEF9C3' },
            ].map((b, idx) => {
              const bx = width * b.x;
              const bw = width * b.w;
              const by = height * b.y;
              const bh = sideY - by;
              return (
                <g key={`bldg_${idx}`}>
                  <rect x={bx} y={by} width={bw} height={bh} fill={b.col} stroke={b.trim} strokeWidth={1.6} />
                  <rect x={bx - 4} y={by - 10} width={bw + 8} height={12} rx={2} fill={b.trim} />
                  {[0.14, 0.34, 0.54].map((wy, r) =>
                    [0.18, 0.56].map((wx, c) => (
                      <rect
                        key={`w_${idx}_${r}_${c}`}
                        x={bx + bw * wx}
                        y={by + bh * wy}
                        width={bw * 0.24}
                        height={bh * 0.13}
                        rx={2}
                        fill={b.win}
                        stroke={b.trim}
                        strokeWidth={1.2}
                      />
                    ))
                  )}
                </g>
              );
            })}
          </g>

          <rect x={fullX} y={sideY} width={fullW} height={roadY - sideY} fill="#CBD5E1" />
          <rect x={fullX} y={roadY - 10} width={fullW} height={10} fill="#94A3B8" />
          <rect x={fullX} y={roadY} width={fullW} height={fullH - (roadY - fullY)} fill="#334155" />
          {[-0.1, 0.1, 0.3, 0.5, 0.7, 0.9, 1.1].map((rx, i) => (
            <rect key={`dash_${i}`} x={width * rx} y={roadY + (height - roadY) * 0.46} width={width * 0.1} height={7} rx={3} fill="#FACC15" opacity={0.85} />
          ))}
        </g>
      );
    }

    case 'police_precinct': {
      const floorY = height * 0.74;
      return (
        <g>
          <defs>
            <linearGradient id="sf_precinct_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#DBE4EE" />
            </linearGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_precinct_wall)" />
          <rect x={fullX} y={height * 0.52} width={fullW} height={floorY - height * 0.52} fill="#CBD5E1" />
          <rect x={fullX} y={height * 0.51} width={fullW} height={9} fill="#94A3B8" />
          <g transform={`translate(${width * 0.58}, ${height * 0.12})`}>
            <rect width={width * 0.28} height={height * 0.34} rx={4} fill="#BAE6FD" stroke="#64748B" strokeWidth={3.5} />
            {[0, 1, 2, 3, 4, 5, 6].map((slat) => (
              <line key={`blind_${slat}`} x1={4} y1={14 + slat * (height * 0.044)} x2={width * 0.28 - 4} y2={14 + slat * (height * 0.044)} stroke="#64748B" strokeWidth={2.2} />
            ))}
          </g>
          <g transform={`translate(${width * 0.09}, ${height * 0.12})`}>
            <rect width={width * 0.38} height={height * 0.35} rx={6} fill="#C2814B" stroke="#78350F" strokeWidth={4} />
            <rect x={18} y={20} width={70} height={84} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.2} transform="rotate(-3 50 60)" />
            <rect x={30} y={32} width={46} height={36} fill="#94A3B8" transform="rotate(-3 50 60)" />
            <rect x={125} y={26} width={86} height={64} fill="#FEF08A" stroke="#CA8A04" strokeWidth={1.2} transform="rotate(2 165 55)" />
            <rect x={235} y={38} width={76} height={74} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.2} transform="rotate(-2 270 70)" />
            <line x1={55} y1={28} x2={165} y2={34} stroke="#DC2626" strokeWidth={2} />
            <line x1={165} y1={34} x2={270} y2={44} stroke="#DC2626" strokeWidth={2} />
            <circle cx={55} cy={28} r={4} fill="#EF4444" />
            <circle cx={165} cy={34} r={4} fill="#EF4444" />
            <circle cx={270} cy={44} r={4} fill="#EF4444" />
          </g>
          {renderStageFloor('prec', fullX, fullW, floorY, bottomY, width, '#94A3B8', '#64748B', '#475569', 'stone')}
        </g>
      );
    }

    case 'rooftop_night': {
      const floorY = height * 0.75;
      const fanRot = (t * 210) % 360;
      return (
        <g>
          <defs>
            <linearGradient id="sf_night_sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
            <radialGradient id="sf_moon_halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_night_sky)" />
          {[
            [0.08, 0.1], [0.16, 0.22], [0.27, 0.08], [0.38, 0.19], [0.49, 0.12],
            [0.61, 0.07], [0.7, 0.24], [0.89, 0.11], [0.94, 0.27],
          ].map(([sx, sy], i) => (
            <circle
              key={`star_${i}`}
              cx={width * sx}
              cy={height * sy}
              r={i % 3 === 0 ? 2.2 : 1.4}
              fill="#F8FAFC"
              opacity={0.45 + 0.5 * Math.abs(Math.sin(t * 1.8 + i * 1.7))}
            />
          ))}
          <circle cx={width * 0.8} cy={height * 0.18} r={96} fill="url(#sf_moon_halo)" />
          <circle cx={width * 0.8} cy={height * 0.18} r={38} fill="#FEF9C3" />
          <g transform={`translate(${-camX * 0.14}, 0)`}>
            {[
              { x: -0.04, w: 0.16, y: 0.34 },
              { x: 0.14, w: 0.15, y: 0.28 },
              { x: 0.31, w: 0.18, y: 0.38 },
              { x: 0.51, w: 0.16, y: 0.31 },
              { x: 0.69, w: 0.15, y: 0.4 },
              { x: 0.86, w: 0.18, y: 0.33 },
            ].map((b, i) => (
              <g key={`nsky_${i}`}>
                <rect x={width * b.x} y={height * b.y} width={width * b.w} height={floorY - height * b.y} fill="#1E293B" />
                {[0.12, 0.28, 0.44].map((wy, r) =>
                  [0.2, 0.6].map((wx, c) =>
                    (i + r + c) % 2 === 0 ? (
                      <rect
                        key={`nw_${i}_${r}_${c}`}
                        x={width * (b.x + b.w * wx)}
                        y={height * (b.y + (0.72 - b.y) * wy)}
                        width={width * b.w * 0.18}
                        height={12}
                        rx={1.5}
                        fill="#FDE047"
                        opacity={0.75}
                      />
                    ) : null
                  )
                )}
              </g>
            ))}
          </g>
          <rect x={fullX} y={floorY - 40} width={fullW} height={40} fill="#263348" />
          <rect x={fullX} y={floorY - 46} width={fullW} height={9} fill="#475569" />
          <g transform={`translate(${width * 0.11}, ${floorY - 94})`}>
            <rect width={96} height={74} rx={5} fill="#334155" stroke="#1E293B" strokeWidth={1.8} />
            <circle cx={48} cy={37} r={24} fill="#0F172A" />
            <g transform={`translate(48, 37) rotate(${fanRot})`}>
              <rect x={-4} y={-20} width={8} height={40} rx={3} fill="#94A3B8" />
              <rect x={-20} y={-4} width={40} height={8} rx={3} fill="#94A3B8" />
            </g>
          </g>
          {renderStageFloor('roof', fullX, fullW, floorY, bottomY, width, '#273449', '#0F172A', '#475569', 'stone')}
        </g>
      );
    }

    case 'office_desk': {
      const floorY = height * 0.74;
      return (
        <g>
          <defs>
            <linearGradient id="sf_office_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_office_wall)" />
          <g transform={`translate(${width * 0.12}, ${height * 0.12})`}>
            <rect width={width * 0.32} height={height * 0.36} rx={6} fill="#BAE6FD" stroke="#64748B" strokeWidth={4} />
            <line x1={width * 0.16} y1={0} x2={width * 0.16} y2={height * 0.36} stroke="#64748B" strokeWidth={3} />
            <line x1={0} y1={height * 0.18} x2={width * 0.32} y2={height * 0.18} stroke="#64748B" strokeWidth={3} />
          </g>
          <g transform={`translate(${width * 0.56}, ${height * 0.22})`}>
            <rect width={width * 0.28} height={floorY - height * 0.22} rx={4} fill="#78350F" stroke="#451A03" strokeWidth={2} />
            {[0.18, 0.44, 0.7].map((ry, i) => (
              <g key={`shelf_${i}`}>
                <line x1={8} y1={(floorY - height * 0.22) * ry} x2={width * 0.28 - 8} y2={(floorY - height * 0.22) * ry} stroke="#451A03" strokeWidth={4} />
                <rect x={18} y={(floorY - height * 0.22) * ry - 32} width={14} height={32} rx={2} fill="#2563EB" />
                <rect x={34} y={(floorY - height * 0.22) * ry - 26} width={12} height={26} rx={2} fill="#DC2626" />
                <rect x={48} y={(floorY - height * 0.22) * ry - 35} width={15} height={35} rx={2} fill="#0F766E" />
              </g>
            ))}
          </g>
          <rect x={fullX} y={floorY - 10} width={fullW} height={10} fill="#94A3B8" />
          {renderStageFloor('off', fullX, fullW, floorY, bottomY, width, '#CBD5E1', '#94A3B8', '#64748B', 'wood')}
        </g>
      );
    }

    case 'tv_studio': {
      const floorY = height * 0.76;
      return (
        <g>
          <defs>
            <linearGradient id="sf_tv_bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="55%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_tv_bg)" />
          <circle cx={width * 0.5} cy={height * 0.36} r={height * 0.25} fill="none" stroke="#38BDF8" strokeWidth={2} opacity={0.28} />
          <circle cx={width * 0.5} cy={height * 0.36} r={height * 0.18} fill="none" stroke="#F59E0B" strokeWidth={1.6} opacity={0.35} />
          <rect x={width * 0.14} y={height * 0.12} width={width * 0.72} height={height * 0.42} rx={12} fill="#0F172A" fillOpacity={0.65} stroke="#38BDF8" strokeWidth={1.8} />
          <polyline
            points={`${width * 0.18},${height * 0.36} ${width * 0.3},${height * 0.28} ${width * 0.42},${height * 0.4} ${width * 0.55},${height * 0.25} ${width * 0.68},${height * 0.38} ${width * 0.82},${height * 0.3}`}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={2.5}
            opacity={0.75}
          />
          <rect x={width * 0.14} y={height * 0.48} width={width * 0.72} height={height * 0.06} fill="#DC2626" opacity={0.85} />
          <rect x={fullX} y={floorY - 10} width={fullW} height={10} fill="#38BDF8" opacity={0.65} />
          {renderStageFloor('tv', fullX, fullW, floorY, bottomY, width, '#1E293B', '#09090B', '#38BDF8', 'studio')}
        </g>
      );
    }

    case 'classroom': {
      const floorY = height * 0.75;
      return (
        <g>
          <defs>
            <linearGradient id="sf_class_wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF9E7" />
              <stop offset="100%" stopColor="#F8E9C8" />
            </linearGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_class_wall)" />
          <rect x={fullX} y={height * 0.55} width={fullW} height={floorY - height * 0.55} fill="#D9B98A" />
          <g transform={`translate(${width * 0.24}, ${height * 0.12})`}>
            <rect width={width * 0.52} height={height * 0.36} rx={6} fill="#14532D" stroke="#78350F" strokeWidth={5} />
            <path d="M 38 72 L 95 72 L 65 28 Z" fill="none" stroke="#F8FAFC" strokeWidth={1.8} opacity={0.75} />
            <line x1={140} y1={42} x2={265} y2={42} stroke="#FDE047" strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
            <line x1={140} y1={68} x2={240} y2={68} stroke="#F8FAFC" strokeWidth={1.8} strokeLinecap="round" opacity={0.65} />
            <rect x={18} y={height * 0.36 - 8} width={44} height={6} rx={2} fill="#F8FAFC" />
          </g>
          <g transform={`translate(${width * 0.85}, ${height * 0.18})`}>
            <circle r={24} fill="#FFFFFF" stroke="#451A03" strokeWidth={2} />
            <line x1={0} y1={0} x2={0} y2={-13} stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
            <line x1={0} y1={0} x2={10} y2={4} stroke="#0F172A" strokeWidth={1.8} strokeLinecap="round" />
          </g>
          <g transform={`translate(${width * 0.05}, ${height * 0.12})`}>
            <rect width={width * 0.14} height={height * 0.36} rx={4} fill="#BAE6FD" stroke="#78350F" strokeWidth={3} />
            <line x1={width * 0.07} y1={0} x2={width * 0.07} y2={height * 0.36} stroke="#78350F" strokeWidth={2.2} />
            <line x1={0} y1={height * 0.18} x2={width * 0.14} y2={height * 0.18} stroke="#78350F" strokeWidth={2.2} />
          </g>
          {renderStageFloor('cls', fullX, fullW, floorY, bottomY, width, '#D9A76A', '#9A6B38', '#5C3A21', 'wood')}
        </g>
      );
    }

    case 'studio_backdrop':
    default: {
      const floorY = height * 0.76;
      return (
        <g>
          <defs>
            <radialGradient id="sf_studio_cyc" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="68%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>
          </defs>
          <rect x={fullX} y={fullY} width={fullW} height={fullH} fill="url(#sf_studio_cyc)" />
          {renderStageFloor('cyc', fullX, fullW, floorY, bottomY, width, '#E2E8F0', '#CBD5E1', '#94A3B8', 'studio')}
        </g>
      );
    }
  }
}

/**
 * Multi-plane foreground parallax framing, podcast studio desk/mics, & atmospheric particles.
 */
export function renderSceneForeground(
  background: BackgroundSceneId,
  width: number,
  height: number,
  t: number,
  camX = 0,
  _renderStyle: RenderStyle = '2.5d_parallax'
): React.ReactNode {
  const steamRise = (t * 16) % 26;

  const podcastDeskAndMics =
    background === 'podcast_studio' ? (
      <g pointerEvents="none">
        {/* Sleek Studio Broadcast Desk in front of seated hosts */}
        <rect
          x={width * 0.09}
          y={height * 0.77}
          width={width * 0.82}
          height={height * 0.35}
          rx={10}
          fill="#162032"
          stroke="#0B1120"
          strokeWidth={1.6}
        />
        <rect
          x={width * 0.07}
          y={height * 0.755}
          width={width * 0.86}
          height={17}
          rx={6}
          fill="#78350F"
          stroke="#451A03"
          strokeWidth={1.4}
        />
        {/* Studio Ceramic Mugs with Gentle Steam */}
        <g transform={`translate(${width * 0.42}, ${height * 0.755})`}>
          <rect x={-9} y={-22} width={18} height={22} rx={3} fill="#F8FAFC" stroke="#334155" strokeWidth={1.3} />
          <path d="M 9 -17 Q 15 -17 15 -11 Q 15 -5 9 -5" fill="none" stroke="#334155" strokeWidth={1.3} />
          <path d={`M -2 ${-26 - steamRise * 0.35} Q 3 ${-34 - steamRise * 0.4} -1 ${-42 - steamRise * 0.45}`} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.35} />
        </g>
        <g transform={`translate(${width * 0.58}, ${height * 0.755})`}>
          <rect x={-9} y={-22} width={18} height={22} rx={3} fill="#F59E0B" stroke="#78350F" strokeWidth={1.3} />
          <path d="M -9 -17 Q -15 -17 -15 -11 Q -15 -5 -9 -5" fill="none" stroke="#78350F" strokeWidth={1.3} />
          <path d={`M 2 ${-26 - steamRise * 0.3} Q -3 ${-34 - steamRise * 0.35} 1 ${-42 - steamRise * 0.4}`} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.35} />
        </g>

        {/* Left Boom Arm + Condenser Microphone */}
        <g transform={`translate(${width * 0.35}, ${height * 0.755})`}>
          <rect x={-8} y={-8} width={16} height={10} rx={2} fill="#334155" stroke="#0F172A" strokeWidth={1.2} />
          <polyline points="0,-6 -42,-92 -14,-154" fill="none" stroke="#18181B" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0,-6 -42,-92 -14,-154" fill="none" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(-14, -154) rotate(24)">
            <rect x={-7} y={-14} width={14} height={26} rx={6} fill="#334155" stroke="#09090B" strokeWidth={1.4} />
            <rect x={-5} y={-12} width={10} height={11} rx={4} fill="#94A3B8" />
            <circle cx={-12} cy={-4} r={10} fill="#09090B" fillOpacity={0.7} stroke="#475569" strokeWidth={1.2} />
          </g>
        </g>

        {/* Right Boom Arm + Condenser Microphone */}
        <g transform={`translate(${width * 0.65}, ${height * 0.755})`}>
          <rect x={-8} y={-8} width={16} height={10} rx={2} fill="#334155" stroke="#0F172A" strokeWidth={1.2} />
          <polyline points="0,-6 42,-92 14,-154" fill="none" stroke="#18181B" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0,-6 42,-92 14,-154" fill="none" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(14, -154) rotate(-24)">
            <rect x={-7} y={-14} width={14} height={26} rx={6} fill="#334155" stroke="#09090B" strokeWidth={1.4} />
            <rect x={-5} y={-12} width={10} height={11} rx={4} fill="#94A3B8" />
            <circle cx={12} cy={-4} r={10} fill="#09090B" fillOpacity={0.7} stroke="#475569" strokeWidth={1.2} />
          </g>
        </g>
      </g>
    ) : null;

  return (
    <g pointerEvents="none">
      {podcastDeskAndMics}
      {background !== 'studio_backdrop' && (
        <g transform={`translate(${-camX * 0.25}, 0)`}>
          {[0.14, 0.31, 0.53, 0.75, 0.89].map((px, i) => {
            const mx = width * px + Math.sin(t * 0.7 + i * 2) * 12;
            const my = height * (0.22 + ((i * 0.16) % 0.52)) + Math.cos(t * 1.0 + i) * 9;
            return (
              <circle
                key={`mote_${i}`}
                cx={mx}
                cy={my}
                r={2.5 + (i % 3) * 1.4}
                fill="#E0F2FE"
                opacity={0.14 + 0.1 * Math.sin(t * 1.8 + i)}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

export function renderSceneProp(
  prop: ScenePropSpec,
  width: number,
  height: number,
  t: number
): React.ReactNode {
  const px = prop.position.x * width;
  const py = prop.position.y * height;
  const sc = prop.scale ?? 1.0;

  if (prop.type === 'bomb_device') {
    const startSec = prop.state?.countdownSeconds ?? 12;
    const armed = prop.state?.armed ?? true;
    const remaining = armed ? Math.max(0, Math.ceil(startSec - t)) : startSec;
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    const blinkOn = armed && Math.floor(t * 4) % 2 === 0;
    const wiresCut = prop.state?.wiresCut ?? [];

    return (
      <g key={prop.id} transform={`translate(${px}, ${py}) scale(${sc})`}>
        <ellipse cx={0} cy={4} rx={52} ry={8} fill="#09090B" opacity={0.22} />
        <rect x={-46} y={-56} width={92} height={56} rx={8} fill="#334155" stroke="#0F172A" strokeWidth={2} />
        <rect x={-42} y={-52} width={84} height={6} rx={3} fill="#475569" />
        <rect x={-38} y={-44} width={76} height={24} rx={4} fill="#09090B" stroke="#1E293B" strokeWidth={1.6} />
        <text
          x={0}
          y={-26}
          textAnchor="middle"
          fill={armed ? '#EF4444' : '#22C55E'}
          fontSize={17}
          fontWeight="bold"
          fontFamily="JetBrains Mono, monospace"
        >
          {mm}:{ss}
        </text>
        <circle cx={30} cy={-11} r={5} fill={blinkOn ? '#EF4444' : '#7F1D1D'} stroke="#0F172A" strokeWidth={1.3} />
        {[
          { idx: 0, color: '#EF4444', y: -14 },
          { idx: 1, color: '#3B82F6', y: -8 },
          { idx: 2, color: '#EAB308', y: -2 },
        ].map((w) =>
          wiresCut.includes(w.idx) ? (
            <g key={`wire_cut_${w.idx}`}>
              <path d={`M -34 ${w.y} Q -18 ${w.y - 4} -8 ${w.y + 3}`} fill="none" stroke={w.color} strokeWidth={2.8} strokeLinecap="round" />
              <path d={`M 8 ${w.y - 2} Q 16 ${w.y + 2} 20 ${w.y}`} fill="none" stroke={w.color} strokeWidth={2.8} strokeLinecap="round" />
            </g>
          ) : (
            <path
              key={`wire_${w.idx}`}
              d={`M -34 ${w.y} Q -6 ${w.y - 6} 20 ${w.y}`}
              fill="none"
              stroke={w.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          )
        )}
      </g>
    );
  }

  if (prop.type === 'wooden_crate') {
    return (
      <g key={prop.id} transform={`translate(${px}, ${py}) scale(${sc})`}>
        <ellipse cx={0} cy={4} rx={48} ry={8} fill="#0F172A" opacity={0.18} />
        <rect x={-44} y={-76} width={88} height={76} rx={4} fill="#B45309" stroke="#451A03" strokeWidth={2} />
        <line x1={-44} y1={-76} x2={44} y2={0} stroke="#78350F" strokeWidth={3.5} />
        <line x1={44} y1={-76} x2={-44} y2={0} stroke="#78350F" strokeWidth={3.5} />
        <rect x={-36} y={-68} width={72} height={60} fill="none" stroke="#78350F" strokeWidth={3.5} />
      </g>
    );
  }

  if (prop.type === 'lab_console') {
    return (
      <g key={prop.id} transform={`translate(${px}, ${py}) scale(${sc})`}>
        <ellipse cx={0} cy={4} rx={60} ry={9} fill="#0F172A" opacity={0.2} />
        <rect x={-56} y={-92} width={112} height={92} rx={6} fill="#334155" stroke="#0F172A" strokeWidth={2} />
        <rect x={-44} y={-82} width={88} height={42} rx={3} fill="#0F172A" />
        <polyline
          points="-36,-60 -18,-60 -10,-72 0,-50 10,-66 20,-60 36,-60"
          fill="none"
          stroke="#22C55E"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <rect x={-40} y={-28} width={80} height={16} rx={2} fill="#1E293B" />
      </g>
    );
  }

  if (prop.type === 'street_lamp') {
    return (
      <g key={prop.id} transform={`translate(${px}, ${py}) scale(${sc})`}>
        <ellipse cx={0} cy={4} rx={24} ry={5} fill="#0F172A" opacity={0.2} />
        <rect x={-5} y={-240} width={10} height={240} fill="#334155" stroke="#1E293B" strokeWidth={1.6} />
        <path d="M 0 -240 Q 28 -252 44 -236" fill="none" stroke="#334155" strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={44} cy={-232} rx={12} ry={6} fill="#FEF08A" stroke="#CA8A04" strokeWidth={1.4} />
        <polygon points="34,-226 54,-226 84,0 4,0" fill="#FEF08A" opacity={0.14} />
      </g>
    );
  }

  return null;
}
