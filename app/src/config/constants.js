export const ALERTS = {
  // ----------- Home Alerts ----------- //
  LOCATION_PERMISSION_DENIED: 'Se denegó el acceso a la ubicación.',
  // ----------- SignIn Alerts ----------- //
}

export const ALERT_TITLES = {
  ERROR: '¡Error!',
  SUCCESS: '¡Éxito!',
  WARNING: '¡Cuidado!',
  INFO: 'Información'
}

export const TYPE_ALERT = {
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info'
}

export const MAP_DATA = {
  LATITUDE_DELTA: 0.0306097200809905,
  LONGITUDE_DELTA: 0.016958601772799398,
  MAP_TYPES:{
    STANDARD: {
      LABEL: 'Normal',
      VALUE: 'standard'
    },
    SATELLITE: {
      LABEL: 'Satélite',
      VALUE: 'satellite'
    },
    TERRAIN: {
      LABEL: 'Terreno',
      VALUE: 'terrain'
    },
  },
  PROVIDER: 'google'
}

export const BUTTONS = {
  SAVE: 'Guardar',
  CANCEL: 'Cancelar',
  DELETE: 'Borrar',
  OK: 'OK',
  INVENTARIO: 'Inventario',
  BUSCAR: 'Buscar',
  CERRAR: 'Cerrar',

}

export const ICONS = {
  MCI_HOME: 'home',
  MCI_HOME_OUTLINE: 'home-outline',
  MCI_ARCHIVE: 'archive',
  MCI_ARCHIVE_OUTLINE: 'archive-outline',
  MCI_PLUS: 'plus',
  MCI_UNDO: 'undo',
  MCI_PLAY: 'play',
  MCI_PAUSE: 'pause'
}

export const SCREENS = {
  HOME: 'Home',
}

export const DRAWER_OPTIONS = [
  // [SCREEN, TITLE, ICON]
  [SCREENS.HOME, 'Inicio', ICONS.MCI_HOME],
]

export const PLACEHOLDERS = {
  MAPVIEW_TYPE: 'Tipo de vista del mapa' ,
  FAB_POINT: 'Punto',
  FAB_RESET: 'Reiniciar',
  FAB_TRACKING: 'Tracking',

}

export const TITLES = {
  POINTRACK: 'PoinTrack',
  HOME: 'Inicio',
  BIENVENIDO: '¡Bienvenido!',
  START: 'Inicio',
  END: 'Final',
  NAME: 'Nombre: ',
  LATITUDE: 'Latitud: ',
  LONGITUDE: 'Longitud: ',
  ALTITUDE: 'Altitud: ',
  DESCRIPTION: 'Descripción: ',
  OBSERVATIONS: 'Observaciones: ',
  TIMESTAMP: 'Hora: ',
  DISTANCE: 'Distancia: ',
  KM: 'km',
  M:'m',
  EDIT_POINT: 'Editar punto',
  POINT_SELECTED: 'Punto seleccionado',
  TAP_TO_EDIT: 'Pulse para editar'

}

