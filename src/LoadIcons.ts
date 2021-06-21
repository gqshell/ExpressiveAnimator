import { IconsetSVG } from '@spectrum-web-components/iconset';
import {html, TemplateResult} from 'lit-element';

export function createIconSet(name: string, icons: any) {
    icons = html([icons] as any);

    return class extends IconsetSVG {
        public constructor() {
            super();
            this.name = name;
        }

        protected renderDefaultContent(): TemplateResult {
            return icons;
        }
    }
}

export async function loadIconSet(name: string, data: string) {
    customElements.define('sp-icons-' + name, createIconSet(name, data));
    return customElements.whenDefined('sp-icons-' + name);
}

/*
export default function LoadIcons(data: string): SVGElement | null {
    const svg = (new DOMParser())
        .parseFromString(data, "image/svg+xml")
        .firstChild as SVGElement;

    if (!svg || svg.tagName !== 'svg') {
        return null;
    }

    svg.style.display = 'none';

    document.head.insertBefore(svg, null);

    return svg;
}*/