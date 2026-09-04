# Braille Peg Cell field guide — source for docs/guides/braille-peg-cell.pdf
#
# Regenerate:
#   python3 docs/guides/braille-peg-cell.build.py        # writes the HTML
#   then print it to PDF from any browser (A4, background graphics on)
#
# The braille diagrams are generated from the CELLS table below rather than
# drawn by hand, so the alphabet chart cannot drift out of step with the dot
# numbers. Edit the copy in this file, not the PDF.
# Generates the Braille Peg Cell field guide as print-ready HTML.
# Diagrams are drawn as SVG here rather than lifted from the model page:
# they need to be accurate, high contrast and legible when photocopied,
# and we should not be republishing someone else's photos.
import io

CELLS = {
 'a':'1','b':'12','c':'14','d':'145','e':'15','f':'124','g':'1245','h':'125','i':'24','j':'245',
 'k':'13','l':'123','m':'134','n':'1345','o':'135','p':'1234','q':'12345','r':'1235','s':'234','t':'2345',
 'u':'136','v':'1236','w':'2456','x':'1346','y':'13456','z':'1356',
}
POS = {1:(0,0),2:(0,1),3:(0,2),4:(1,0),5:(1,1),6:(1,2)}

def cell(dots, r=7, gap=26, pad=10, numbered=False, label=None):
    """One braille cell. Raised dots filled, flat dots outlined."""
    w, h = gap + pad*2, gap*2 + pad*2
    on = set(int(c) for c in dots)
    parts = [f'<svg viewBox="0 0 {w} {h+ (16 if label else 0)}" width="{w}" height="{h+(16 if label else 0)}" role="img">']
    for n,(cx,cy) in POS.items():
        x, y = pad + cx*gap, pad + cy*gap
        if n in on:
            parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#111"/>')
        else:
            parts.append(f'<circle cx="{x}" cy="{y}" r="{r-1.5}" fill="none" stroke="#bbb" stroke-width="1.5" stroke-dasharray="2 2"/>')
        if numbered:
            parts.append(f'<text x="{x}" y="{y+4}" font-size="10" text-anchor="middle" '
                         f'fill="{"#fff" if n in on else "#999"}" font-family="system-ui">{n}</text>')
    if label:
        parts.append(f'<text x="{w/2}" y="{h+12}" font-size="13" text-anchor="middle" font-family="system-ui" font-weight="600">{label}</text>')
    parts.append('</svg>')
    return ''.join(parts)

def chart(letters):
    return ''.join(f'<div class="ch">{cell(CELLS[c], label=c)}</div>' for c in letters)

# --- exploded assembly diagram -------------------------------------------
ASSEMBLY = '''
<svg viewBox="0 0 620 150" width="100%" role="img" aria-label="Exploded view: button cap, spring, cell case, button cap">
  <g font-family="system-ui" font-size="12" text-anchor="middle">
    <ellipse cx="60" cy="60" rx="26" ry="12" fill="#e6efee" stroke="#0f766e" stroke-width="2"/>
    <rect x="34" y="60" width="52" height="12" fill="#e6efee" stroke="#0f766e" stroke-width="2"/>
    <text x="60" y="100">button cap</text><text x="60" y="115" fill="#777">×12</text>

    <path d="M150 40 h44 M150 52 q22 10 44 0 M150 64 q22 10 44 0 M150 76 q22 10 44 0 M150 88 h44"
          fill="none" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
    <text x="172" y="112">spring</text><text x="172" y="127" fill="#777">×6</text>

    <rect x="256" y="26" width="96" height="76" rx="8" fill="#f6f3ee" stroke="#444" stroke-width="2"/>
    <g fill="#fff" stroke="#999">
      <circle cx="284" cy="48" r="8"/><circle cx="284" cy="64" r="8"/><circle cx="284" cy="80" r="8"/>
      <circle cx="324" cy="48" r="8"/><circle cx="324" cy="64" r="8"/><circle cx="324" cy="80" r="8"/>
    </g>
    <text x="304" y="118">cell case</text><text x="304" y="133" fill="#777">×1</text>

    <ellipse cx="420" cy="60" rx="26" ry="12" fill="#e6efee" stroke="#0f766e" stroke-width="2"/>
    <rect x="394" y="60" width="52" height="12" fill="#e6efee" stroke="#0f766e" stroke-width="2"/>
    <text x="420" y="100">button cap</text><text x="420" y="115" fill="#777">far side</text>

    <text x="110" y="66" font-size="20" fill="#999">+</text>
    <text x="226" y="66" font-size="20" fill="#999">+</text>
    <text x="378" y="66" font-size="20" fill="#999">+</text>
    <text x="480" y="66" font-size="20" fill="#999">=</text>

    <rect x="512" y="26" width="90" height="76" rx="8" fill="#f6f3ee" stroke="#444" stroke-width="2"/>
    <circle cx="538" cy="48" r="9" fill="#111"/><circle cx="538" cy="64" r="9" fill="#111"/>
    <circle cx="538" cy="80" r="7" fill="none" stroke="#bbb" stroke-dasharray="2 2"/>
    <circle cx="576" cy="48" r="9" fill="#111"/>
    <circle cx="576" cy="64" r="7" fill="none" stroke="#bbb" stroke-dasharray="2 2"/>
    <circle cx="576" cy="80" r="7" fill="none" stroke="#bbb" stroke-dasharray="2 2"/>
    <text x="557" y="118">one finished cell</text>
  </g>
</svg>'''

CROSS = '''
<svg viewBox="0 0 560 120" width="100%" role="img" aria-label="Cross section: pressing a button from one side raises the dot on the other">
  <g font-family="system-ui" font-size="12">
    <rect x="30" y="34" width="170" height="52" rx="6" fill="#f6f3ee" stroke="#444" stroke-width="2"/>
    <rect x="95" y="18" width="40" height="16" rx="4" fill="#0f766e"/>
    <rect x="95" y="86" width="40" height="16" rx="4" fill="#cbd5d3"/>
    <text x="115" y="14" text-anchor="middle" fill="#0f766e" font-weight="600">raised</text>
    <text x="115" y="116" text-anchor="middle" fill="#888">flat</text>
    <text x="230" y="64" font-size="22" fill="#999">→</text>
    <text x="265" y="52" fill="#555">press</text><text x="265" y="68" fill="#555">this side</text>
    <rect x="360" y="34" width="170" height="52" rx="6" fill="#f6f3ee" stroke="#444" stroke-width="2"/>
    <rect x="425" y="18" width="40" height="16" rx="4" fill="#cbd5d3"/>
    <rect x="425" y="86" width="40" height="16" rx="4" fill="#0f766e"/>
    <text x="445" y="14" text-anchor="middle" fill="#888">flat</text>
    <text x="445" y="116" text-anchor="middle" fill="#0f766e" font-weight="600">raised</text>
  </g>
</svg>'''

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Braille Peg Cell — field guide</title>
<style>
 @page {{ size: A4; margin: 16mm 14mm; }}
 * {{ box-sizing: border-box; }}
 body {{ font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        color:#1f2937; font-size:11pt; line-height:1.5; margin:0; }}
 h1 {{ font-size:24pt; margin:0 0 4px; letter-spacing:-0.5px; }}
 h2 {{ font-size:14pt; margin:22px 0 8px; padding-bottom:4px; border-bottom:2px solid #0f766e; color:#0f766e; }}
 h3 {{ font-size:11.5pt; margin:14px 0 4px; }}
 p, li {{ margin:6px 0; }}
 .sub {{ color:#6b7280; font-size:10.5pt; margin-bottom:14px; }}
 .box {{ border:1px solid #d6d3d1; background:#faf9f7; border-radius:6px; padding:10px 14px; margin:12px 0; }}
 .warn {{ border-color:#f59e0b; background:#fffbeb; }}
 .cred {{ border-color:#0f766e; background:#f0fdfa; }}
 table {{ border-collapse:collapse; width:100%; margin:10px 0; font-size:10.5pt; }}
 th, td {{ border:1px solid #d6d3d1; padding:5px 8px; text-align:left; }}
 th {{ background:#f3f4f6; }}
 .grid {{ display:flex; flex-wrap:wrap; gap:12px 16px; margin:12px 0; }}
 .ch {{ width:52px; text-align:center; }}
 .row {{ display:flex; gap:26px; align-items:flex-start; }}
 /* No forced breaks: a section taller than a page spilled into a nearly
    blank one. Let it flow, and instead stop diagrams, tables and callouts
    from being split across a page boundary. */
 .page {{ }}
 /* Major sections start a page. Without this the heading stranded itself at
    the foot of the previous page while its diagram moved on. */
 h2.newpage {{ page-break-before: always; break-before: page; }}
 h1, h2, h3 {{ page-break-after: avoid; break-after: avoid; }}
 table, svg, .box, .grid, .row, ol, ul {{ page-break-inside: avoid; break-inside: avoid; }}

 .muted {{ color:#6b7280; }}
 ul {{ padding-left:18px; }}
 code {{ background:#f3f4f6; padding:1px 4px; border-radius:3px; font-size:10pt; }}
 .foot {{ margin-top:26px; padding-top:8px; border-top:1px solid #e5e7eb; color:#6b7280; font-size:9.5pt; }}
</style></head><body>

<div class="page">
<h1>Braille Peg Cell</h1>
<div class="sub">Field guide for ChipuRobo school visits &middot; tactile object &amp; 3D printing</div>

<div class="box cred">
<strong>Model:</strong> Braille Peg Cell by <strong>3D Printy</strong> &mdash; Printables model 146102<br>
<strong>Licence:</strong> Creative Commons &mdash; Attribution (CC&nbsp;BY). <strong>3D Printy must be credited</strong>
wherever this object appears: on the object, in photographs, in reports and in funder material.<br>
<strong>Cost:</strong> free STL download &middot; printables.com/model/146102-braille-peg-cell
</div>

<h2>What it is</h2>
<p>A single braille cell &mdash; six dots &mdash; where each dot is a <strong>button that pushes
through from either side</strong>. Press a dot from below and it stands proud. Press it from
above and it drops flat.</p>
{CROSS}
<p>That is the whole idea, and it is a good one. A learner can <strong>set</strong> a letter with their
own fingers instead of only reading one that has been printed for them &mdash; then feel it,
clear it, and set the next.</p>

<h2>Why it matters for us</h2>
<p>Everything else we hand a learner is fixed. A printed skull is always a skull. A braille
sheet always says the same thing. This is the first object a learner can <strong>change</strong>.</p>
<ul>
<li>A blind learner can <strong>write</strong> as well as read &mdash; the loop closes.</li>
<li>A sighted teacher who does not know braille can learn alongside the class. In a
mainstream school that is usually the real blocker.</li>
<li>Cheap enough to print <strong>one per learner</strong> rather than one per classroom. Sharing a
tactile object means most of the class waits.</li>
</ul>
</div>

<div class="page">
<h2 class="newpage">The cell, and how the dots are numbered</h2>
<p>Six dots, two columns of three. The <strong>numbering</strong> is what everything else is built on.
Teach it before any letters &mdash; drill it until it is automatic, and every letter afterwards
is just a list of numbers.</p>
<div class="row">
  <div style="text-align:center">{cell('123456', r=13, gap=44, pad=18, numbered=True)}
  <div class="muted" style="font-size:10pt">left column 1&nbsp;2&nbsp;3 &middot; right column 4&nbsp;5&nbsp;6</div></div>
  <div>
    <p style="margin-top:0"><strong>The first ten letters use only the top four dots</strong>
    (1, 2, 4, 5). Learn these ten and two rules, and you have the whole alphabet &mdash;
    far easier than memorising twenty-six unrelated shapes.</p>
    <table>
      <tr><th>k&ndash;t</th><td>the same shapes as a&ndash;j, <strong>plus dot 3</strong></td></tr>
      <tr><th>u, v, x, y, z</th><td>the same as a, b, c, d, e, <strong>plus dots 3 and 6</strong></td></tr>
      <tr><th>w</th><td><strong>2-4-5-6</strong> &mdash; the exception. French braille had no <em>w</em>, so it
      was added later and does not fit the pattern. Learners always ask.</td></tr>
    </table>
  </div>
</div>

<h3>a &ndash; j &nbsp;<span class="muted" style="font-weight:400">(top four dots only)</span></h3>
<div class="grid">{chart('abcdefghij')}</div>
<h3>k &ndash; t &nbsp;<span class="muted" style="font-weight:400">(a&ndash;j plus dot 3)</span></h3>
<div class="grid">{chart('klmnopqrst')}</div>
<h3>u &ndash; z &nbsp;<span class="muted" style="font-weight:400">(plus dots 3 and 6 &mdash; except w)</span></h3>
<div class="grid">{chart('uvwxyz')}</div>

<div class="box">
<strong>Two more for day one.</strong>
<div class="row" style="margin-top:8px">
  <div style="text-align:center">{cell('6')}<div style="font-size:10pt;font-weight:600">capital</div></div>
  <div style="text-align:center">{cell('3456')}<div style="font-size:10pt;font-weight:600">number</div></div>
  <div style="flex:1">
   <p style="margin-top:0"><strong>Capital sign</strong> &mdash; dot 6, placed before the letter.</p>
   <p><strong>Number sign</strong> &mdash; dots 3-4-5-6, after which <strong>a&ndash;j mean 1&ndash;0</strong>.</p>
  </div>
</div>
</div>
<p class="muted">Confirm with the partner school which braille code they teach. This is standard
English braille, but the school&rsquo;s own practice is what the learner is examined on &mdash; they
are the authority, not this sheet.</p>
</div>

<div class="page">
<h2 class="newpage">Printing</h2>
<table>
<tr><th style="width:60%">Part</th><th>Quantity per cell</th></tr>
<tr><td>Cell case</td><td>1</td></tr>
<tr><td>Spring</td><td>6 &mdash; one per dot</td></tr>
<tr><td>Button cap</td><td>12 &mdash; two per spring, one each side</td></tr>
<tr><th>Total</th><th>19 pieces per cell</th></tr>
</table>

<div class="box warn">
<strong>The spring is the part that decides whether this works.</strong> Print it with
<strong>enough perimeter lines that the flexible arms come out solid</strong>. If infill ends up
inside the arms they will be weak and the button will not hold its position. This is the
most common way the print fails.
</div>

<ul>
<li><strong>No supports</strong> are needed for any part.</li>
<li><strong>Tested in PLA and PETG.</strong> PETG is the better choice for something handled daily
by a class; PLA is fine for a first trial.</li>
<li><strong>Test print one spring and one button cap first</strong> and check they seat properly in
the cell case &mdash; before committing to the other seventeen pieces, let alone thirty sets.</li>
</ul>

<h2>Assembly</h2>
{ASSEMBLY}
<p>Per dot, <strong>six times</strong>:</p>
<ol>
<li><strong>Snap a button cap onto one side of the spring.</strong></li>
<li><strong>Insert the spring into the cell case.</strong> It only fits one way round.</li>
<li><strong>Press the button all the way in</strong>, so the spring pops through the case and can be
reached from the other side.</li>
<li><strong>Snap the second button cap on</strong> that far side.</li>
</ol>
<p>Both faces then have buttons, and pressing from either side toggles that dot.</p>
</div>

<div>
<h2 class="newpage">Using it with a class</h2>
<ul>
<li><strong>Set, feel, clear, repeat.</strong> The rhythm matters more than the content. A learner who
sets <em>a</em>, feels it, clears it and sets <em>b</em> has done more than one who has had ten
letters read at them.</li>
<li><strong>Teach the numbering before any letters.</strong> A learner who knows the six positions can
be taught a new letter over the phone.</li>
<li><strong>Use the pattern openly.</strong> Ten letters, then &ldquo;add dot 3&rdquo;, then &ldquo;add dots 3 and 6&rdquo;.</li>
<li><strong>Sighted learners work with eyes shut, or the cell under the desk.</strong> Otherwise they
read the dots visually, learn nothing about touch, and leave believing braille is easier
than it is.</li>
<li><strong>Give a blind learner the cell first and longest.</strong> For them this is the lesson itself,
not an illustration of it.</li>
<li><strong>Record it in the dashboard.</strong> Session adaptations already include braille and tactile
materials. Recording it is what turns &ldquo;we make tactile materials&rdquo; into a number we can report.</li>
</ul>

<h2>Related models by the same designer</h2>
<p>Same author, so the same attribution applies. The millimetre figures are <strong>dot spacing</strong>.</p>
<table>
<tr><th>Model</th><th>Where</th></tr>
<tr><td>Braille Training Cell &mdash; 6MM</td><td>Printables 807178</td></tr>
<tr><td>Braille Training Cell &mdash; 4.5MM</td><td>Thingiverse 6538334</td></tr>
<tr><td>Braille Sheet &mdash; 4.5MM</td><td>Printables 1231140</td></tr>
</table>
<p><strong>Standard braille is smaller than either figure.</strong> Oversized cells are kinder to a
beginner&rsquo;s fingers and to a sighted teacher, but a learner has to reach standard spacing
eventually. Decide deliberately whether we are teaching braille or teaching <em>about</em>
braille &mdash; and ask the partner school which they want.</p>

<h2>Before the first visit</h2>
<table>
<tr><td style="width:26px">&#9744;</td><td>Print one spring + one button cap and check the fit. Do not skip.</td></tr>
<tr><td>&#9744;</td><td>Print and assemble one complete cell. Time yourself &mdash; 19 parts.</td></tr>
<tr><td>&#9744;</td><td>Check the buttons still hold position after ~50 presses.</td></tr>
<tr><td>&#9744;</td><td>Decide PLA or PETG for the class set.</td></tr>
<tr><td>&#9744;</td><td>Agree dot spacing with the school.</td></tr>
<tr><td>&#9744;</td><td>Work out print time and filament cost per cell, then per class.</td></tr>
<tr><td>&#9744;</td><td>Note the attribution to 3D Printy wherever the object appears.</td></tr>
</table>

<div class="box">
<strong>Deliberately left blank.</strong> Dot spacing, overall dimensions, print time and filament
cost per cell are not stated here. They should be <strong>measured from our own first print</strong>
rather than asserted from a general claim &mdash; and once measured, they belong on this sheet.
The diagrams above are drawn for this guide, not taken from the model page; photographs of
our own printed cells should replace nothing here but should be added alongside.
</div>
</div>

</body></html>'''

io.open('docs/guides/braille-peg-cell.html', 'w', encoding='utf-8').write(html)
print('html written:', len(html), 'bytes')
