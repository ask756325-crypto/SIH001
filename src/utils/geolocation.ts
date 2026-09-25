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
const KERALA_DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { name: 'Kollam', lat: 8.8932, lng: 76.6141 },
  { name: 'Kottayam', lat: 9.5916, lng: 76.5222 },
  { name: 'Idukki', lat: 9.8493, lng: 76.9804 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
  { name: 'Palakkad', lat: 10.7867, lng: 76.6548 },
  { name: 'Malappuram', lat: 11.0732, lng: 76.0740 },
  { name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  { name: 'Wayanad', lat: 11.6854, lng: 76.1320 },
  { name: 'Kannur', lat: 11.8745, lng: 75.3704 },
  { name: 'Kasaragod', lat: 12.5102, lng: 74.9852 },
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

        // Find closest Kerala/Indian district
        let closest = KERALA_DISTRICTS[0];
        let minDistance = Infinity;

        for (const dist of KERALA_DISTRICTS) {
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
