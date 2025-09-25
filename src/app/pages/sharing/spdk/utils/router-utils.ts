import { Location } from '@angular/common';

export function setSubsystemNameInUrl(location: Location, name: string | null): void {
  const baseUrl = 'sharing/spdk';
  const newUrl = name ? `${baseUrl}/${encodeURIComponent(name)}` : baseUrl;
  location.replaceState(newUrl);
}
