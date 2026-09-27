# Standards and references

The design of anywidget-automotives draws on the regulations, standards and guidelines
listed below: they shape the colours, the symbols, the legibility and the restraint of
the widgets. This page names them so that readers can go to the original texts.

!!! warning "Disclaimer"
    * **No claim of conformity.** anywidget-automotives does not claim to conform to,
      comply with, or implement any of these documents, in whole or in part. It has not
      been assessed, tested or certified against them by anyone, and the organizations
      that publish them have neither reviewed nor endorsed it.
    * **Not type-approved.** Several references are vehicle type-approval regulations.
      They are cited as design references; a widget is not vehicle equipment, and using
      one does not make a vehicle, a device or an application compliant.
    * **Inspiration, not implementation.** Where a widget follows a convention (a colour,
      a symbol, an error direction), the behaviour is our own reading of publicly known
      principles and may be incomplete, simplified or outdated. It is not tied to a
      particular edition of any document. Figures quoted below must be checked against
      the official text before being relied on.
    * **Safety.** The functional safety standard below is cited only to state what the
      library is *not* (see the [safety notice](safety.md)).
    * **Copyright and trademarks.** The standards are copyrighted documents of their
      publishers; no text of them is reproduced here. Names such as ISO, SAE, UNECE,
      NHTSA and JAMA are names of their respective owners and are used only to identify
      the documents.

## Vehicle regulations

| Reference | Subject | How it informs the library | Requirements |
|---|---|---|---|
| UN Regulation No. 121 (UNECE) | Location and identification of hand controls, tell-tales and indicators | Tell-tale colour code — red for danger, yellow/amber for warning, green for a function on, blue for high beam — and the symbols a tell-tale uses | TEL-001 .. TEL-005 |
| FMVSS No. 101 (United States) | Controls and displays | The same concerns for the US market: symbols, colours, illumination | TEL-001 .. TEL-005 |
| UN Regulation No. 39 (UNECE) | Speedometer and odometer equipment | A speedometer never shows less than the true speed; the shown speed may exceed it by at most 10 % plus 4 km/h. A widget cannot measure speed, but it can refuse to round down | SPD-001 .. SPD-004 |
| Directive 80/181/EEC and the SI | Units of measurement | km/h and L/100 km as defaults, mph and mpg where a market uses them | UNIT-001 .. UNIT-003 |

## Human-machine interface standards

| Reference | Subject | How it informs the library | Requirements |
|---|---|---|---|
| ISO 2575 | Road vehicles — Symbols for controls, indicators and tell-tales | The tell-tale symbol set and its colour assignments | TEL-002, TEL-003 |
| ISO 15008 | Road vehicles — Ergonomic aspects of in-vehicle visual presentation | Legibility: character height expressed as a visual angle at the viewing distance, contrast and luminance for day and night, colour combinations | LEG-001 .. LEG-005 |
| ISO 15005 | Road vehicles — Dialogue management principles for in-vehicle systems | A display that does not demand attention the driving task needs | DIS-001 .. DIS-004 |
| ISO 16951 | Road vehicles — Priority of messages presented to drivers | Ordering of simultaneous warnings | TEL-006 |
| SAE J1757-1 and J1757-2 | Metrology for vehicular displays and for head-up displays | Vocabulary and measurement conditions for the HUD mode | HUD-001 .. HUD-006 |

## Driver distraction guidelines

| Reference | Subject | How it informs the library | Requirements |
|---|---|---|---|
| European Statement of Principles on HMI (Commission Recommendation 2006/453/EC) | Design of in-vehicle information systems | Few items, readable at a glance, no interaction required while driving | DIS-001 .. DIS-004 |
| NHTSA Visual-Manual Driver Distraction Guidelines for In-Vehicle Electronic Devices | Distraction from displays and controls | Glances of about 2 s and about 12 s in total per task as the order of magnitude a page must stay within | DIS-001, DIS-002 |
| JAMA Guideline for In-vehicle Display Systems | The Japanese industry's equivalent | Same principles | DIS-001 .. DIS-004 |

## Functional safety (scope only)

| Reference | Subject |
|---|---|
| ISO 26262 | Road vehicles — Functional safety. Cited to state that the library is outside its scope. |

## Accessibility and requirements method

| Reference | Subject | How it informs the library |
|---|---|---|
| W3C WCAG 2.1 | Web content accessibility guidelines | Contrast targets inherited from anywidget-instruments, alongside ISO 15008 |
| EARS (A. Mavin et al., 2009) | Easy Approach to Requirements Syntax | Sentence patterns of the [specification](specification.md) |
