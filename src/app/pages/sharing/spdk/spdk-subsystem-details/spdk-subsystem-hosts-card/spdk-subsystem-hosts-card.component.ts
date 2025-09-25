import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle,
} from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UiSearchDirective } from 'app/directives/ui-search.directive';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { LoaderService } from 'app/modules/loader/loader.service';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { subsystemHostsCardElements } from 'app/pages/sharing/nvme-of/subsystem-details/subsystem-hosts-card/subsystem-hosts-card.elements';
import { ErrorHandlerService } from 'app/services/errors/error-handler.service';
import { SPDKSubsystemDetails, SPDKHost } from 'app/interfaces/spdk.interface';
import { SPDKService } from 'app/pages/sharing/spdk/spdk-services/spdk.service';
import { SPDKStore } from 'app/pages/sharing/spdk/spdk-services/spdk.store';
import { helptextNvmeOf } from 'app/helptext/sharing/nvme-of/nvme-of';
import { SPDKAddHostMenuComponent } from 'app/pages/sharing/spdk/spdk-hosts/spdk-add-host-menu/spdk-add-host-menu.component';

@UntilDestroy()
@Component({
  selector: 'spdk-subsystem-hosts-card',
  templateUrl: './spdk-subsystem-hosts-card.component.html',
  styleUrl: './spdk-subsystem-hosts-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IxIconComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    TranslateModule,
    MatTooltip,
    SPDKAddHostMenuComponent,
    MatIconButton,
    TestDirective,
    UiSearchDirective,
  ],
})
export class SPDKSubsystemHostsCardComponent {
  private loader = inject(LoaderService);
  private errorHandler = inject(ErrorHandlerService);
  private SPDKService = inject(SPDKService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);
  private SPDKStore = inject(SPDKStore);

  subsystem = input.required<SPDKSubsystemDetails>();

  protected helptext = helptextNvmeOf;

  protected readonly searchableElements = subsystemHostsCardElements;

  protected hostAdded(host: SPDKHost): void {
    const subsystem = this.subsystem();

    const disallowAll$ = subsystem.allow_any_host
      ? this.SPDKService.updateSubsystem(subsystem, { allow_any_host: false })
      : of(null);

    disallowAll$
      .pipe(
        switchMap(() => this.SPDKService.associateHosts(subsystem, [host])),
        this.loader.withLoader(),
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        // TODO: Consider reloading a single record or removing loading animation.
        this.snackbar.success(this.translate.instant('Host added to the subsystem'));
        this.SPDKStore.initialize();
      });
  }

  protected allowAllHostsSelected(): void {
    const subsystem = this.subsystem();

    this.SPDKService.updateSubsystem(subsystem, { allow_any_host: true })
      .pipe(
        switchMap(() => {
          const removalCalls = subsystem.hosts.map((host) => (
            this.SPDKService.removeHostAssociation(subsystem, host)
          ));

          return removalCalls.length ? forkJoin(removalCalls) : of([]);
        }),
        this.loader.withLoader(),
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.snackbar.success(this.translate.instant('All hosts are now allowed'));
        this.SPDKStore.initialize();
      });
  }

  protected removeAssociation(host: SPDKHost): void {
    this.SPDKService.removeHostAssociation(this.subsystem(), host)
      .pipe(
        this.loader.withLoader(),
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.snackbar.success(this.translate.instant('Host removed from the subsystem'));
        this.SPDKStore.initialize();
      });
  }
}
