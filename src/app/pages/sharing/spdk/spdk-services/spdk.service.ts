import { Injectable, inject } from '@angular/core';
import {
  combineLatest,
  from, mergeMap, Observable, of, switchMap, tap, toArray,
} from 'rxjs';
import { map, take } from 'rxjs/operators';
import { SPDKTransportType } from 'app/enums/spdk.enum';
import { SPDKHost, SPDKPort, SPDKSubsystem } from 'app/interfaces/spdk.interface';
import { ApiService } from 'app/modules/websocket/api.service';
import { LicenseService } from 'app/services/license.service';

@Injectable({
  providedIn: 'root',
})
export class SPDKService {
  private api = inject(ApiService);
  private license = inject(LicenseService);

  private maxConcurrentRequests = 15;

  private cachedRdmaEnabled: boolean | null = null;

  getSupportedTransports(): Observable<SPDKTransportType[]> {
    return combineLatest([
      this.license.hasFibreChannel$,
      this.isRdmaEnabled(),
    ])
      .pipe(
        map(([hasFibreChannel, isRdmaEnabled]) => {
          const transports = [SPDKTransportType.Tcp];

          if (hasFibreChannel) {
            transports.push(SPDKTransportType.FibreChannel);
          }

          if (isRdmaEnabled) {
            transports.push(SPDKTransportType.Rdma);
          }

          return transports;
        }),
        take(1),
      );
  }

  isRdmaEnabled(): Observable<boolean> {
    if (this.cachedRdmaEnabled === null) {
      return this.api.call('spdk.global.rdma_enabled').pipe(
        tap((rdmaEnabled) => {
          this.cachedRdmaEnabled = rdmaEnabled;
        }),
      );
    }

    return of(this.cachedRdmaEnabled);
  }

  associatePorts(subsystem: { id: number }, ports: SPDKPort[]): Observable<unknown> {
    if (ports.length === 0) {
      return of(undefined);
    }

    return from(ports).pipe(
      mergeMap((port) => {
        return this.api.call('spdk.port_subsys.create', [{ port_id: port.id, subsys_id: subsystem.id }]);
      }, this.maxConcurrentRequests),
      toArray(),
    );
  }

  removePortAssociation(subsystem: { id: number }, port: SPDKPort): Observable<unknown> {
    return this.api.call('spdk.port_subsys.query', [[['subsys_id', '=', subsystem.id], ['port_id', '=', port.id]]]).pipe(
      switchMap((connection) => {
        if (connection.length === 0) {
          return of(undefined);
        }

        return this.api.call('spdk.port_subsys.delete', [connection[0].id]);
      }),
    );
  }

  associateHosts(subsystem: { id: number }, hosts: SPDKHost[]): Observable<unknown> {
    if (hosts.length === 0) {
      return of(undefined);
    }

    return from(hosts).pipe(
      mergeMap((host) => {
        return this.api.call('spdk.host_subsys.create', [{ host_id: host.id, subsys_id: subsystem.id }]);
      }, this.maxConcurrentRequests),
      toArray(),
    );
  }

  removeHostAssociation(subsystem: { id: number }, host: SPDKHost): Observable<unknown> {
    return this.api.call('spdk.host_subsys.query', [[['subsys_id', '=', subsystem.id], ['host_id', '=', host.id]]]).pipe(
      switchMap((connection) => {
        if (connection.length === 0) {
          return of(undefined);
        }

        return this.api.call('spdk.host_subsys.delete', [connection[0].id]);
      }),
    );
  }

  updateSubsystem(subsystem: { id: number }, params: Partial<SPDKSubsystem>): Observable<SPDKSubsystem> {
    return this.api.call('spdk.subsys.update', [subsystem.id, { ...params }]);
  }
}
