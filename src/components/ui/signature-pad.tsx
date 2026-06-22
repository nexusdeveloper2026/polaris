"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Eraser, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  locked?: boolean;
  onLock?: () => void;
  subtitle?: string;
  width?: number;
  height?: number;
}

export function SignaturePad({ label, value, onChange, locked = false, onLock, subtitle, width = 500, height = 150 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (locked) return;
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  }, [locked, getPos]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!drawing || locked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0B1424";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, [drawing, locked, getPos]);

  const stopDraw = useCallback(() => {
    if (drawing) {
      setDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onChange(canvas.toDataURL("image/png"));
      }
    }
  }, [drawing, onChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }, [onChange]);

  useEffect(() => {
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    } else if (!value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-navy-700 dark:text-white/80">{label}</label>
          {subtitle && <p className="text-xs text-navy-500 dark:text-white/40">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
          {!locked && (
            <Button variant="ghost" size="sm" onClick={clear} className="h-7 px-2 text-xs">
              <Eraser className="mr-1 h-3 w-3" />Limpiar
            </Button>
          )}
          {onLock && (
            <Button
              variant={locked ? "default" : "outline"}
              size="sm"
              onClick={onLock}
              disabled={locked || !value}
              className={`h-7 px-2 text-xs ${locked ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
            >
              {locked ? <Lock className="mr-1 h-3 w-3" /> : <Unlock className="mr-1 h-3 w-3" />}
              {locked ? "Aceptada" : "Aceptar"}
            </Button>
          )}
        </div>
      </div>
      <div className={`rounded-xl border-2 bg-white dark:bg-white/[0.02] ${locked ? "border-green-400 dark:border-green-600" : "border-dashed border-navy-200 dark:border-white/10"}`}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`w-full ${locked ? "cursor-default" : "cursor-crosshair"}`}
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      {!locked && <p className="text-[10px] text-navy-400 dark:text-white/30">Dibuja tu firma con el mouse o dedo</p>}
      {locked && <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Firma aceptada y bloqueada</p>}
    </div>
  );
}
