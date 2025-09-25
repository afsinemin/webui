import { marker as T } from '@biesbjerg/ngx-translate-extract-marker';
import { UiSearchableElement } from 'app/modules/global-search/interfaces/ui-searchable-element.interface';

export const subsystemHostsCardElements = {
  hierarchy: [T('Shares'), T('SPDK')],
  anchorRouterLink: ['/sharing', 'spdk'],
  elements: {
    addHost: { hierarchy: [T('Add Host')] },
  },
} satisfies UiSearchableElement;
