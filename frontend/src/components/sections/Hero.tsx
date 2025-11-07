"use client";

import { animate, AnimatePresence, motion } from "framer-motion";
import Button from "../atoms/Button";
import walletImg from "/wallet.png";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const balanceRef = useRef<HTMLParagraphElement | null>(null);
  const targetBalance = 124592.0;

  useEffect(() => {
    const node = balanceRef.current; // El elemento <p>
    if (!node) return;

    // Inicia la animación de 0 al número objetivo
    const controls = animate(0, targetBalance, {
      duration: 5, // Duración de 10 segundos
      ease: "easeOut", // Empieza rápido y termina suave
      onUpdate(value) {
        // Formatea el número con comas y 2 decimales
        const formattedValue = value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        // Actualiza el texto del <p>
        node.textContent = `$${formattedValue}`;
      },
    });
    return () => controls.stop();
  }, []);

  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const quickActions = [
    {
      name: "Enviar",
      description: "Transfiere fondos a cualquier cuenta de forma instantánea y segura.",
    },
    {
      name: "Recibir",
      description: "Genera un enlace o QR para recibir pagos de cualquier persona.",
    },
    {
      name: "Intercambiar",
      description: "Convierte tus saldos entre diferentes monedas al instante.",
    },
    {
      name: "Análisis",
      description: "Revisa tus gastos y patrones de ingresos con gráficos detallados.",
    },
  ];

  return (
    <section className="pt-24 pb-20 px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-balance leading-[1.1] tracking-tight text-foreground">
              La plataforma completa para{" "}
              <span className="bg-gradient-to-r from-blue-500 via-black to-blue-500 bg-clip-text text-transparent bg-[size:200%] animate-[gradient-wave_3s_linear_infinite]">
                finanzas digitales
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center mt-6 mb-12">
              <div className="mb-4">
                <img
                  src={walletImg}
                  alt="Billetera de finanzas digitales"
                  width={500}
                  height={500}
                  className="mx-auto w-full max-w-md"
                />
              </div>
              <div>
                <p className="text-xl sm:text-2xl text-muted-foreground mb-12 text-pretty leading-relaxed max-w-3xl mx-auto">
                  Tu puerta de entrada a la banca sin complicaciones. Envía, recibe y administra tu dinero con la
                  seguridad de la banca tradicional y la velocidad de la tecnología moderna.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    to="/register"
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-blue-400/20 to-blue-900/20 backdrop-blur-3xl border border-white/20">
                    Comenzar
                  </Button>
                  <Button
                    to="/features"
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-3xl border border-white/20">
                    Explorar Características
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative">
            <div className="relative bg-gradient-to-br from-card via-secondary to-card border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              {/* Mock Dashboard */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 text-start">Saldo Total</p>
                    <div className="flex items-end gap-2">
                      <p
                        ref={balanceRef}
                        className="text-5xl font-bold text-foreground">
                        $0.00
                      </p>{" "}
                      <span>ARS</span>
                    </div>
                    <motion.div
                      animate={{ backgroundColor: ["#1E3A8A", "#3B82F6", "#1E3A8A"] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                      className="py-3 rounded-2xl font-bold shadow-2xl text-foreground border-white/20 my-4 w-50">
                      100% Seguro
                    </motion.div>
                  </div>

                  <div>
                    <motion.div
                      animate={{ y: [0, 0, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                      className="bg-primary text-primary-foreground rounded-2xl font-bold shadow-2xl">
                      Transferencia Instantánea
                    </motion.div>
                    <div className="flex items-center justify-end bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold text-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-4 h-4 text-green-500">
                        {" "}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                        />
                      </svg>
                      +12.5%
                    </div>
                  </div>
                </div>

                {/* Chart Visualization */}
                <div className="h-48 relative">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 400 150"
                    preserveAspectRatio="none">
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%">
                        <stop
                          offset="0%"
                          stopColor="rgb(59, 130, 246)"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgb(59, 130, 246)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 120 L 50 110 L 100 90 L 150 95 L 200 70 L 250 75 L 300 50 L 350 45 L 400 30"
                      fill="none"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 120 L 50 110 L 100 90 L 150 95 L 200 70 L 250 75 L 300 50 L 350 45 L 400 30 L 400 150 L 0 150 Z"
                      fill="url(#chartGradient)"
                    />
                  </svg>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <div
                      key={action.name}
                      className="relative">
                      <div
                        onClick={() => setExpandedAction((prev) => (prev === action.name ? null : action.name))}
                        className={
                          `${expandedAction === action.name ? "bg-blue-900/90 scale-105 " : "" }bg-secondary hover:bg-muted border border-white/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105`
                        }>
                        <p className="font-semibold text-foreground">{action.name}</p>
                      </div>

                      {/* El contenedor animado de la descripción */}
                      <AnimatePresence>
                        {expandedAction === action.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: 10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-2 z-10 bg-blue-900/90 backdrop-blur-3xl">
                            <div className="p-3  border border-white/30 rounded-md shadow-lg">
                              <p className="text-sm text-muted-foreground text-left">{action.description}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
