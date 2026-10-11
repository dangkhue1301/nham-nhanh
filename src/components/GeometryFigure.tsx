import React from 'react';
import { GeometryDiagram } from '../engine/types.ts';

export const GeometryFigure: React.FC<{ diagram: GeometryDiagram }> = ({ diagram }) => {
  const { kind, dimensions: d, unit } = diagram;
  const label = (value: number) => `${value} ${unit}`;
  const text = (x: number, y: number, value: string) => <text x={x} y={y} textAnchor="middle">{value}</text>;
  const line = (x1: number, y1: number, x2: number, y2: number) => <line className="dimension-line" x1={x1} y1={y1} x2={x2} y2={y2} />;
  let shape: React.ReactNode;
  if (kind === 'circle') shape = <><circle className="figure-shape" cx="180" cy="112" r="72" />{line(180,112,252,112)}{text(210,99,`r = ${label(d.radius)}`)}<circle cx="180" cy="112" r="3" className="figure-point" /></>;
  else if (kind === 'triangle') shape = <><polygon className="figure-shape" points="70,180 290,180 170,40" />{line(170,40,170,180)}<path className="right-angle" d="M170 167 h13 v13" />{text(180,210,`Đáy ${label(d.base)}`)}{text(222,115,`h = ${label(d.height)}`)}</>;
  else if (kind === 'parallelogram') shape = <><polygon className="figure-shape" points="55,180 270,180 310,50 95,50" />{line(95,50,95,180)}<path className="right-angle" d="M95 167 h13 v13" />{text(178,210,`Đáy ${label(d.base)}`)}{text(165,119,`h = ${label(d.height)}`)}</>;
  else if (kind === 'trapezoid') shape = <><polygon className="figure-shape" points="65,180 295,180 235,50 125,50" />{line(125,50,125,180)}<path className="right-angle" d="M125 167 h13 v13" />{text(180,30,label(d.top))}{text(180,210,label(d.base))}{text(192,123,`h = ${label(d.height)}`)}</>;
  else if (kind === 'rhombus') shape = <><polygon className="figure-shape" points="180,35 290,112 180,189 70,112" />{line(70,112,290,112)}{line(180,35,180,189)}{text(180,217,`d₁ = ${label(d.d1)}`)}{text(247,73,`d₂ = ${label(d.d2)}`)}</>;
  else if (kind === 'composite') {
    const cutX = 290 - d.cutWidth / d.width * 220, cutY = 50 + d.cutHeight / d.height * 140;
    shape = <><path className="figure-shape" d={`M70 50 H${cutX} V${cutY} H290 V190 H70 Z`} /><rect className="cutout" x={cutX} y="50" width={290-cutX} height={cutY-50} />{text(180,221,label(d.width))}{text(36,123,label(d.height))}{text((cutX+290)/2,31,label(d.cutWidth))}{text(324,Math.max(73,(cutY+50)/2),label(d.cutHeight))}</>;
  } else {
    const left = kind === 'square' ? 110 : 70, width = kind === 'square' ? 140 : 220;
    shape = <><rect className="figure-shape" x={left} y="50" width={width} height="140" />{text(180,220,label(d.width))}{text(left - 35,123,label(d.height))}</>;
  }
  const names: Record<string, string> = { width: 'chiều dài', height: 'chiều cao', base: 'đáy', top: 'đáy nhỏ', radius: 'bán kính', d1: 'đường chéo thứ nhất', d2: 'đường chéo thứ hai', cutWidth: 'chiều dài phần cắt', cutHeight: 'chiều cao phần cắt' };
  return <figure className="geometry-figure"><svg viewBox="0 0 360 240" role="img" aria-label={`Hình minh họa: ${Object.entries(d).map(([key, value]) => `${names[key]} ${value} ${unit}`).join(', ')}`}>{shape}</svg><figcaption>Sơ đồ minh họa, không theo tỷ lệ</figcaption></figure>;
};
