import type { Franja } from "@/lib/horario";

// Parrilla de ejemplo. La emisora no ha entregado los horarios reales;
// donde no hay franja suena "Señal musical".
export const horariosEjemplo: Franja[] = [
  { id: "f1", programa: "despertar-con-cristo", dias: [1, 2, 3, 4, 5, 6], inicio: "05:00", fin: "06:00" },
  { id: "f2", programa: "noticias-107", dias: [1, 2, 3, 4, 5], inicio: "06:00", fin: "08:00" },
  { id: "f3", programa: "mesa-redonda", dias: [1, 2, 3, 4, 5], inicio: "08:00", fin: "10:00" },
  { id: "f4", programa: "el-defensor", dias: [1, 3, 5], inicio: "10:00", fin: "11:00" },
  { id: "f5", programa: "hablando-con-tu-hospital", dias: [2, 4], inicio: "10:00", fin: "11:00" },
  { id: "f6", programa: "noticias-107", dias: [1, 2, 3, 4, 5], inicio: "12:00", fin: "13:00" },
  { id: "f7", programa: "las-mas-sonadas", dias: [1, 2, 3, 4, 5], inicio: "15:00", fin: "18:00" },
  { id: "f8", programa: "noticias-107", dias: [1, 2, 3, 4, 5], inicio: "18:00", fin: "19:00" },
  { id: "f9", programa: "mujer-visible", dias: [6], inicio: "09:00", fin: "11:00" },
  { id: "f10", programa: "el-baul-antillano", dias: [6], inicio: "14:00", fin: "18:00" },
  { id: "f11", programa: "el-baul-antillano", dias: [0], inicio: "10:00", fin: "14:00" },
  { id: "f12", programa: "las-mas-sonadas", dias: [5, 6], inicio: "20:00", fin: "00:00" },
];
