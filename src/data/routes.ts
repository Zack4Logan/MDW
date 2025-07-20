// Interfaz que define la estructura de los datos de una ruta
export interface RouteData {
  codigo: number; // Código único de la ruta
  origen: string; // Ciudad de origen
  destino: string; // Ciudad de destino
  costo_referencial: number; // Costo estimado del viaje
  duracion_horas: number; // Duración del viaje en horas
  distancia_km: number; // Distancia del viaje en kilómetros
  popular: boolean; // Indica si la ruta es popular
  descripcion: string; // Descripción breve de la ruta
  atractivos: string[]; // Lista de atractivos turísticos en la ruta o destino
}

// Arreglo con las rutas del norte del Perú y sus datos principales
export const northernRoutes: RouteData[] = [
  {
    codigo: 1,
    origen: 'Lima',
    destino: 'Trujillo',
    costo_referencial: 35.00,
    duracion_horas: 8,
    distancia_km: 560,
    popular: true,
    descripcion: 'La ciudad de la eterna primavera, cuna de la cultura Moche y Chimú',
    atractivos: ['Huacas del Sol y de la Luna', 'Chan Chan', 'Huanchaco', 'Centro Histórico']
  },
  // ...otras rutas con la misma estructura...
  {
    codigo: 2,
    origen: 'Lima',
    destino: 'Chiclayo',
    costo_referencial: 40.00,
    duracion_horas: 10,
    distancia_km: 770,
    popular: true,
    descripcion: 'Capital gastronómica del norte, tierra del Señor de Sipán',
    atractivos: ['Museo Tumbas Reales', 'Mercado Modelo', 'Pimentel', 'Lambayeque']
  },
  // ...continúa con las demás rutas...
];

// Función que busca una ruta específica según origen y destino
export const getRouteByOriginDestination = (origen: string, destino: string): RouteData | undefined => {
  return northernRoutes.find(route => 
    route.origen === origen && route.destino === destino
  );
};

// Función que retorna todas las rutas marcadas como populares
export const getPopularRoutes = (): RouteData[] => {
  return northernRoutes.filter(route => route.popular);
};