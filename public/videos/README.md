# Weather Video Backgrounds

This directory contains the video files for weather-specific backgrounds in the 7-day forecast cards.

## Required Video Files

Please add the following video files to this directory:

### 1. `sun.mp4`
- **Purpose**: Background for sunny weather conditions
- **Format**: MP4 video
- **Duration**: 10-30 seconds (will loop automatically)
- **Resolution**: 720p or higher recommended
- **Content**: Sun, sunlight, bright sky, warm atmosphere

### 2. `rain.mp4`
- **Purpose**: Background for rainy/stormy weather conditions
- **Format**: MP4 video
- **Duration**: 10-30 seconds (will loop automatically)
- **Resolution**: 720p or higher recommended
- **Content**: Rain, water droplets, stormy sky, wet atmosphere

### 3. `clouds.mp4`
- **Purpose**: Background for cloudy/partly-cloudy weather conditions
- **Format**: MP4 video
- **Duration**: 10-30 seconds (will loop automatically)
- **Resolution**: 720p or higher recommended
- **Content**: Clouds, overcast sky, moving clouds, gray atmosphere

## Video Specifications

- **Transparency**: Videos will be displayed at 30% opacity
- **Looping**: Videos will loop automatically
- **Muted**: Videos will be muted by default
- **Responsive**: Videos will scale to fit the card dimensions
- **Performance**: Optimize file sizes for web delivery (recommended: < 5MB each)

## File Structure
```
public/
└── videos/
    ├── sun.mp4
    ├── rain.mp4
    ├── clouds.mp4
    └── README.md
```

## Usage

The videos are automatically selected based on the weather condition:
- **Sunny** → `sun.mp4`
- **Rainy/Stormy** → `rain.mp4`
- **Cloudy/Partly Cloudy** → `clouds.mp4`
- **Snowy** → `rain.mp4` (fallback)
- **Default** → `sun.mp4` (fallback)

## Fallback

If video files are not available, the cards will display with the existing hover effects and gradients.
