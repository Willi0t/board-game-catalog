"""Generate repo-native, text-free SVG placeholders. Python standard library only."""
import argparse
import re
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / 'public/images/placeholders/v2'
PALETTES = {
    'rose': {'accent': '#95616f', 'tint': '#efe1e5'},
    'sage': {'accent': '#648155', 'tint': '#e6eddf'},
    'teal': {'accent': '#397c79', 'tint': '#dfefeb'},
    'slate': {'accent': '#526c85', 'tint': '#e3eaf1'},
    'gold': {'accent': '#a58043', 'tint': '#f2ead9'},
    'violet': {'accent': '#78658f', 'tint': '#ebe4f1'},
}
# Every motif uses the SAME local coordinates in all three formats.
# Only uniform scale and translation change; the background fills the canvas.
MOTIFS = {
 'castle': '''<path d="M-158 150V-44H-76V150H-44V-120H44V150H76V-24H158V150Z"/>
 <path class="ink" d="M-174-44L-117-134L-60-44ZM-63-120L0-214L63-120ZM60-24L117-114L174-24Z"/>
 <path class="ink" d="M-23 150V78Q0 35 23 78V150Z"/>
 <path class="ink" opacity=".4" d="M-132-10H-104V30H-132ZM104 8H132V48H104Z"/>''',
 'planet': '''<circle r="124"/>
 <ellipse rx="202" ry="53" transform="rotate(-24)" fill="none" stroke="var(--cream)" stroke-width="24"/>
 <path class="ink" opacity=".3" d="M-103-65Q-20-94 86-29L111 20Q-28-20-121-4Z"/>
 <circle class="ink" cx="-31" cy="57" r="17" opacity=".25"/>
 <path d="M153-137v30m-15-15h30M-168 108v22m-11-11h22" fill="none" stroke="var(--cream)" stroke-width="6"/>''',
 'geometric': '''<path d="M0-170L142 0L0 170L-142 0Z"/>
 <path class="ink" d="M0-113L94 0L0 113L-94 0Z"/>
 <circle cx="-166" cy="-105" r="14" opacity=".7"/>
 <circle cx="163" cy="113" r="20" opacity=".7"/>
 <path d="M-154 138H-102M123-151H171" fill="none" stroke="var(--cream)" stroke-width="8"/>''',
 'garden': '''<path d="M-178 24Q-148 172 0 172Q148 172 178 24Z"/>
 <path class="ink" d="M-146 39Q0 82 146 39" fill="none" stroke="var(--ink)" stroke-width="9"/>
 <path d="M-95 14L-115-80Q-38-98-58-29Z"/>
 <path d="M-88-88Q-158-154-107-174Q-68-168-88-88ZM-85-92Q-61-173-25-157Q-3-128-85-92Z"/>
 <circle cx="69" cy="-38" r="65"/>
 <path class="ink" d="M69-94L48-67L69-77L91-67Z"/>
 <path d="M-9 15Q-59-103-1-126Q48-97-9 15Z"/>
 <path class="ink" d="M-8-97L-8-8" fill="none" stroke="var(--ink)" stroke-width="6"/>''',
 'forest': '''<path d="M-139 156V50H-117V156ZM-12 156V30H12V156ZM117 156V50H139V156Z"/>
 <path d="M-128-118L-188-14H-161L-204 65H-52L-95-14H-68Z"/>
 <path d="M0-205L-83-66H-51L-111 63H111L51-66H83Z"/>
 <path d="M128-118L68-14H95L52 65H204L161-14H188Z"/>
 <path class="ink" opacity=".3" d="M0-166V44H80Z"/>
 <path d="M-193 168Q0 136 193 168" fill="none" stroke="var(--cream)" stroke-width="7"/>''',
 'ocean': '''<path d="M-143-11Q-49-122 71-7L150-72V76L71 12Q-49 122-143 11Z"/>
 <circle class="ink" cx="-91" cy="-5" r="8"/>
 <path class="ink" opacity=".3" d="M-12-47L-45 0L-12 47Q26 0-12-47Z"/>
 <circle cx="-134" cy="-107" r="13"/><circle cx="-112" cy="-151" r="8"/>
 <path d="M-193 126Q-145 91-97 126T0 126T97 126T193 126M-155 165Q-107 130-59 165T38 165T135 165" fill="none" stroke="var(--cream)" stroke-width="9"/>
 <path d="M-178 69V20M-178 48L-196 30M178 111V70M178 91L195 73" fill="none" stroke="var(--cream)" stroke-width="7"/>''',
 'ship': '''<path d="M-177 67H177L120 145H-118Z"/>
 <path d="M-7 66V-196" fill="none" stroke="var(--cream)" stroke-width="12"/>
 <path d="M-24-171L-24 42H-156Z"/><path d="M14-132L153 42H14Z" opacity=".8"/>
 <path class="ink" d="M-104 96H103" fill="none" stroke="var(--ink)" stroke-width="8"/>
 <path d="M-198 173Q-148 148-98 173T2 173T102 173T202 173" fill="none" stroke="var(--cream)" stroke-width="8"/>
 <path d="M5-198H79L55-163H5Z"/>''',
 'city': '''<path d="M-175 155V-34H-98V155H-76V-119H3V155H28V-64H98V155H118V-9H180V155Z"/>
 <path d="M-37-119V-175" fill="none" stroke="var(--cream)" stroke-width="8"/>
 <path class="ink" opacity=".6" d="M-152-6H-127V15H-152ZM-152 38H-127V59H-152ZM-51-91H-23V-68H-51ZM-51-44H-23V-21H-51ZM52-35H76V-12H52ZM52 13H76V36H52ZM138 23H159V45H138Z"/>
 <path class="ink" d="M-19 155V101H9V155Z"/>
 <path d="M-201 169H201" fill="none" stroke="var(--cream)" stroke-width="8"/>''',
 'industry': '''<path d="M-176 151V-10L-91-61V-10L-8-61V-10H121V151Z"/>
 <path d="M57-14V-164H91V-14M131 151V-118H166V151Z"/>
 <path d="M72-185Q29-220 64-233Q111-240 112-208Q146-235 166-206" fill="none" stroke="var(--cream)" stroke-width="15" opacity=".6"/>
 <path class="ink" d="M-147 32H-109V70H-147ZM-79 32H-41V70H-79ZM-9 32H29V70H-9ZM59 32H97V70H59Z"/>
 <path d="M-194 178H194M-148 165V190M-84 165V190M-20 165V190M44 165V190M108 165V190M172 165V190" fill="none" stroke="var(--cream)" stroke-width="7"/>''',
 'arcane': '''<path d="M-116 151V-19Q-116-164 0-191Q116-164 116-19V151Z"/>
 <path class="ink" d="M-83 151V-19Q-83-132 0-157Q83-132 83-19V151Z"/>
 <circle cx="0" cy="-45" r="43"/>
 <path d="M0 1V115M-30 115H30" fill="none" stroke="var(--cream)" stroke-width="12"/>
 <path d="M-174-44v38m-19-19h38M170 47v28m-14-14h28" fill="none" stroke="var(--cream)" stroke-width="7"/>
 <path d="M-143 153H143M-163 174H163" fill="none" stroke="var(--cream)" stroke-width="10"/>''',
 'desert': '''<path d="M-194 143L-28-142L139 143Z"/>
 <path class="ink" opacity=".36" d="M-28-142V143H139Z"/>
 <path d="M62 144L129 17L200 144Z" opacity=".7"/>
 <path class="ink" d="M-52 143V92Q-28 64-4 92V143Z"/>
 <path d="M-185 169Q-56 139 76 175T204 169" fill="none" stroke="var(--cream)" stroke-width="9"/>''',
 'cards': '''<g transform="rotate(-17 -70 0)"><rect x="-163" y="-145" width="153" height="257" rx="15" opacity=".6"/></g>
 <g transform="rotate(17 70 0)"><rect x="10" y="-145" width="153" height="257" rx="15" opacity=".8"/></g>
 <rect x="-78" y="-134" width="156" height="266" rx="15"/>
 <path class="ink" d="M0-57L39 0L0 57L-39 0Z"/>
 <circle class="ink" cx="-49" cy="-101" r="7"/><circle class="ink" cx="49" cy="100" r="7"/>
 <ellipse cx="-98" cy="162" rx="40" ry="14"/><ellipse cx="101" cy="164" rx="39" ry="14"/>''',
}

def svg(motif, palette, kind):
    p = PALETTES[palette]
    w,h,cx,cy,scale = {'cover': (600,760,300,441,.99), 'scene': (1600,640,800,358,1.1), 'detail': (960,720,480,414,1.22)}[kind]
    # Color variables are baked into standalone files for browser/image portability.
    art = re.sub(r'<[^>]+>', lambda m: m[0].replace('class="ink"', '' if 'fill=' in m[0] else f'fill="{p["accent"]}"'), MOTIFS[motif]).replace('var(--cream)','#fff6e5').replace('var(--ink)',p['accent'])
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice" overflow="hidden">
  <title>Generisk reservillustration – {motif}</title>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{p['tint']}"/><stop offset="1" stop-color="{p['accent']}"/></linearGradient>
    <pattern id="grain" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="#fff6e5" opacity=".22"/></pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#background)"/>
  <circle cx="{w*.77:.1f}" cy="{h*.25:.1f}" r="{h*.29:.1f}" fill="#fff6e5" opacity=".53"/>
  <path d="M0 {h*.70}Q{w*.22} {h*.43} {w*.50} {h*.72}T{w} {h*.61}V{h}H0Z" fill="{p['accent']}" opacity=".23"/>
  <path d="M0 {h*.87}Q{w*.25} {h*.59} {w*.54} {h*.89}T{w} {h*.80}V{h}H0Z" fill="{p['accent']}" opacity=".36"/>
  <rect width="{w}" height="{h}" fill="url(#grain)"/>
  <g fill="#fff6e5" opacity=".89" stroke-linecap="round" stroke-linejoin="round" transform="translate({cx} {cy}) scale({scale})">{art}</g>
</svg>
'''

def write_preview(output):
    # Preview: real cover and hero SVGs side by side, with no aspect distortion.
    tiles=[]
    colors=list(PALETTES)
    for i,motif in enumerate(MOTIFS):
        palette=colors[i%len(colors)]
        x=40+(i%3)*520; y=100+(i//3)*315
        def inner(kind):
            text=svg(motif,palette,kind)
            return text[text.index('>')+1:text.rindex('</svg>')]
        # Isolate repeated SVG ids by prefixing each instance.
        cover=inner('cover').replace('background',f'bg{i}c').replace('grain',f'gr{i}c')
        scene=inner('scene').replace('background',f'bg{i}s').replace('grain',f'gr{i}s')
        tiles.append(f'<g transform="translate({x} {y})"><rect width="500" height="290" rx="16" fill="#fff"/><svg x="16" y="16" width="132" height="167.2" viewBox="0 0 600 760" overflow="hidden">{cover}</svg><svg x="162" y="16" width="322" height="128.8" viewBox="0 0 1600 640" overflow="hidden">{scene}</svg><text x="18" y="226" font-size="24" fill="#343a39">{motif.title()} · {palette}</text><text x="18" y="260" font-size="17" fill="#69716c">Omslag + bred scen · samma proportioner</text></g>')
    preview=f'<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="1380" viewBox="0 0 1640 1380"><rect width="1640" height="1380" fill="#f4f4ef"/><g font-family="sans-serif"><text x="40" y="59" font-size="32" fill="#343a39">Spelhyllan — reservillustrationer</text>{"".join(tiles)}</g></svg>'
    output.write_text(preview, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(
        description='Generate SVG illustrations only; catalog data and theme mappings are never written.'
    )
    parser.add_argument('--output-dir', type=Path, default=DEFAULT_OUTPUT,
                        help='Image directory (default: public/images/placeholders/v2 in this repository).')
    parser.add_argument('--preview', type=Path, help='Optional SVG preview path; must end in .svg.')
    args = parser.parse_args()
    if args.preview and args.preview.resolve().suffix.lower() != '.svg':
        parser.error('--preview must be an SVG file, not catalog JSON or a theme manifest.')
    generated = 0
    for motif in MOTIFS:
        for palette in PALETTES:
            folder = args.output_dir / motif / palette
            folder.mkdir(parents=True, exist_ok=True)
            for kind in ['cover', 'scene', 'detail']:
                content = svg(motif, palette, kind)
                ET.fromstring(content)
                (folder / f'{kind}.svg').write_text(content, encoding='utf-8')
                generated += 1
    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        write_preview(args.preview)
    print(f'Generated {generated} SVGs in {args.output_dir}. No catalog data or theme mappings were written.')


if __name__ == '__main__':
    main()
