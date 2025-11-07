import StatCard from "../atoms/StatCard"

export default function Stats() {
  const stats = [
    { value: "2M+", label: "Usuarios Activos" },
    { value: "$5B+", label: "Activos Asegurados" },
    { value: "150+", label: "Países" },
    { value: "99.9%", label: "Disponibilidad" },
  ]

  return (
    <section className="py-20 px-6 lg:px-8 border-y border-white/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
