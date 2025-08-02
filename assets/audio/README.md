# Audio Files Placeholder

Este directorio contendrá los archivos de audio de los versos del Bhagavad Gita.

## Estructura sugerida:
```
assets/audio/
├── chapters/
│   ├── 1/
│   │   ├── verse-1.mp3
│   │   ├── verse-2.mp3
│   │   └── ...
│   ├── 2/
│   │   ├── verse-1.mp3
│   │   └── ...
│   └── ...
├── sounds/
│   ├── correct.mp3
│   ├── incorrect.mp3
│   ├── lesson-complete.mp3
│   └── level-up.mp3
└── README.md
```

## Formato recomendado:
- Formato: MP3 o M4A
- Calidad: 128 kbps (para optimizar tamaño)
- Duración: Variable según el verso
- Idioma: Sánscrito (pronunciación correcta)

## URLs de ejemplo:
Para testing, el sistema genera URLs como:
`https://gitalearn-audio.com/chapters/1/verse-1.mp3`

En una implementación real, estos archivos estarían alojados en un CDN o servicio de almacenamiento como AWS S3.
