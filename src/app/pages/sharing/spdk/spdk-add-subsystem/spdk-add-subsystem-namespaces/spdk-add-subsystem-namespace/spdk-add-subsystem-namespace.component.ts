import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlideInRef } from 'app/modules/slide-ins/slide-in-ref';
import { SPDKBaseNamespaceFormComponent } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-base-namespace-form/spdk-base-namespace-form.component';
import { SPDKNamespaceChanges } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-base-namespace-form/spdk-namespace-changes.interface';

@Component({
  selector: 'spdk-add-subsystem-namespace',
  templateUrl: './spdk-add-subsystem-namespace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SPDKBaseNamespaceFormComponent,
  ],
})
export class SPDKAddSubsystemNamespaceComponent {
  slideInRef = inject<SlideInRef<void, SPDKNamespaceChanges>>(SlideInRef);


  onSubmit(newNamespace: SPDKNamespaceChanges): void {
    this.slideInRef.close({
      response: newNamespace,
      error: null,
    });
  }
}
