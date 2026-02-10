// src/data/mockData.js

const mockData = {
  navItems: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'library', label: 'Library', icon: 'library' },
    { id: 'playlist', label: 'Playlist', icon: 'playlist' },
  ],

  playlists: [
    'Cinematic Focus',
    'Quiet Quartz',
    'Midnight Glass',
    'Obsidian Air',
    'Neonless Nights',
    'Studio Silence',
  ],

  albums: [
    { title: 'Midnight Drive', artist: 'Sable District', art: 'art-1' },
    { title: 'Velvet Static', artist: 'Northbound', art: 'art-2' },
    { title: 'Blacktop Bloom', artist: 'Lumen State', art: 'art-3' },
    { title: 'Amber Reverb', artist: 'Coldframe', art: 'art-4' },
    { title: 'Quartz Horizon', artist: 'Greyhaven', art: 'art-5' },
    { title: 'Low Tide', artist: 'Harborline', art: 'art-6' },
  ],

  // IMPORTANT → add real audioUrl field
  tracks: [
    {
      title: 'Shadowline',
      artist: 'Sable District',
      duration: '4:32',
      audioUrl: '/audio/shadowline.flac',
    },
    {
      title: 'Soft Motion',
      artist: 'Northbound',
      duration: '3:58',
      audioUrl: '/audio/soft-motion.flac',
    },
    {
      title: 'Cinder Room',
      artist: 'Lumen State',
      duration: '5:12',
      audioUrl: '/audio/cinder-room.flac',
    },
    {
      title: 'Glass Hours',
      artist: 'Greyhaven',
      duration: '4:04',
      audioUrl: '/audio/glass-hours.flac',
    },
  ],

  libraryCollections: [
    { title: 'Studio Sessions', tracks: '126 tracks', art: 'art-7' },
    { title: 'Evening Loops', tracks: '84 tracks', art: 'art-8' },
    { title: 'Monochrome', tracks: '62 tracks', art: 'art-9' },
  ],

  playlistTracks: [
    { title: 'Nocturne Signal', artist: 'Coldframe', duration: '4:21' },
    { title: 'Low Light', artist: 'Harborline', duration: '3:39' },
    { title: 'Windowless', artist: 'Greyhaven', duration: '5:04' },
    { title: 'Night Glass', artist: 'Northbound', duration: '4:42' },
  ],

  searchResults: [
    { title: 'Velvet Static', meta: 'Album - Northbound', art: 'art-2' },
    { title: 'Quiet Quartz', meta: 'Playlist - 24 tracks', art: 'art-5' },
    { title: 'Greyhaven', meta: 'Artist - 6 albums', art: 'art-8' },
  ],
}

export default mockData
