// Browser Geolocation Helper for FarmDirect
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface LocationResult {
  district: string;
  coords: Coordinates;
  formattedText: string;
}

// Major districts with coordinate centroids for smart nearest district resolution
const AP_AND_INDIAN_DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { name: 'Kurnool', lat: 15.8281, lng: 78.0373 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  { name: 'Rajahmundry', lat: 17.0005, lng: 81.8040 },
  { name: 'Eluru', lat: 16.7107, lng: 81.0952 },
  { name: 'Anantapur', lat: 14.6819, lng: 77.6006 },
  { name: 'Nellore', lat: 14.4426, lng: 79.9865 },
  { name: 'Chittoor', lat: 13.2172, lng: 79.1003 },
  { name: 'Kadapa', lat: 14.4673, lng: 78.8242 },
  { name: 'Ongole', lat: 15.5057, lng: 80.0499 },
  { name: 'Srikakulam', lat: 18.2969, lng: 83.8966 },
  { name: 'Vizianagaram', lat: 18.1067, lng: 83.3956 },
  { name: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  { name: 'Nandyal', lat: 15.4886, lng: 78.4836 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function requestUserLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Find closest Andhra Pradesh/Indian district
        let closest = AP_AND_INDIAN_DISTRICTS[0];
        let minDistance = Infinity;

        for (const dist of AP_AND_INDIAN_DISTRICTS) {
          const d = getDistance(latitude, longitude, dist.lat, dist.lng);
          if (d < minDistance) {
            minDistance = d;
            closest = dist;
          }
        }

        const districtName = closest.name;
        const formattedText = `${districtName} (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;

        resolve({
          district: districtName,
          coords: { latitude, longitude, accuracy },
          formattedText,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
