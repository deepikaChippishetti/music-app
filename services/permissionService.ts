import {
  requestPermissionsAsync,
  getPermissionsAsync,
} from 'expo-media-library';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'undetermined';

function mapStatus(status: string): PermissionStatus {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    case 'restricted':
    case 'limited':
      return 'blocked';
    default:
      return 'undetermined';
  }
}

export async function checkPermission(): Promise<PermissionStatus> {
  const result = await getPermissionsAsync();
  return mapStatus(result.status);
}

export async function requestPermission(): Promise<PermissionStatus> {
  const result = await requestPermissionsAsync();

  if (result.granted) return 'granted';
  if (!result.canAskAgain) return 'blocked';
  if (result.status === 'denied') return 'denied';
  return 'undetermined';
}