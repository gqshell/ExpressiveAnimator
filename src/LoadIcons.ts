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
}