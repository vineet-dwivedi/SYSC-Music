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
    { title: 'Yours Truly', artist: 'KRSNA', art: 'https://i.pinimg.com/736x/e0/1b/3b/e01b3bf29c3dc54326757eb70649d674.jpg' },
    { title: 'Monopoly Moves', artist: 'KING', art: 'https://i.pinimg.com/736x/8d/fb/62/8dfb62fa7c6b928e88050941d1769eb7.jpg' },
    { title: 'Dhurandhar', artist: 'Various Artists', art: 'https://i.pinimg.com/736x/ac/48/21/ac482151bc04a97eb44ee0b385ab6986.jpg' },
    { title: 'P-POP CULTURE', artist: 'Karan Aujla', art: 'https://i.pinimg.com/736x/da/4d/0c/da4d0c5903beb770571d0a0d9b28b1a9.jpg' },
    { title: 'GLORY', artist: 'Honey Singh', art: 'https://i.pinimg.com/736x/e3/8a/72/e38a7293f391d326d8fc1d330b6b3c94.jpg' },
    { title: 'HARD DRIVE', artist: 'Raftaar', art: 'https://i.pinimg.com/736x/fa/75/36/fa7536cdae4d55798f0efc53b18e3340.jpg' },
    { title: 'How Much A Rhyme Cost', artist: 'KARMA', art: 'https://i.pinimg.com/736x/b6/0d/6e/b60d6e9d383f093cdcc52ca50649aa4a.jpg' },
    { title: 'Lunch Break', artist: 'Seedhe Maut', art: 'https://i.pinimg.com/736x/1e/29/8e/1e298e2cb1ace5e11eeba24f82963c8d.jpg' },
    { title: 'Making Memories', artist: 'Karan Aujla', art: 'https://i.pinimg.com/1200x/ba/59/65/ba5965021af8172e25a5f2761708ddfe.jpg'},
    { title: 'Ek Tha Raja', artist: 'Badshah', art: 'https://i.pinimg.com/1200x/8a/77/35/8a7735a860f19cb316e8e76a6636291d.jpg'}
  ],

  // IMPORTANT → add real audioUrl field
  tracks: [
    {
      title: 'Shadowline',
      artist: 'KRSNA',
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

  libraryCollections: [],

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
