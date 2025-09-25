import { SPDKNamespaceType } from 'app/enums/spdk.enum';
import { zvolPath } from 'app/helpers/storage.helper';

/**
 * Detects the namespace type based on the device path.
 * ZVOL paths start with '/dev/zvol/', everything else is treated as FILE.
 */
export function getNamespaceType(devicePath: string): SPDKNamespaceType {
  if (devicePath.startsWith(zvolPath)) {
    return SPDKNamespaceType.Zvol;
  }
  return SPDKNamespaceType.File;
}
