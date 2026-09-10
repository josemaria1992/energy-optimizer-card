# Energy Optimizer Card

A responsive, read-only Home Assistant Lovelace card for the Energy Optimizer
pipeline. It presents battery SOC, live power, Nord Pool pricing, forecast
readiness, accounting, and safety state in one view.

The card never calls an inverter service. Home Assistant remains the control
authority and the optimizer remains observe-only.

## Installation

The live installation uses HACS as its single resource source. Do not add a
second `/local/` or CDN resource for the same custom element.

For an isolated local development installation, copy `dist/energy-optimizer-card.js` to the Home
Assistant configuration directory under `www/` and add it as a dashboard
resource with type `module`:

```yaml
url: /local/energy-optimizer-card.js
type: module
```

The repository is structured for HACS Dashboard/Plugin distribution. The
publishable bundle is at the repository root as `energy-optimizer-card.js`;
`dist/` remains the build/test copy used by this workspace.

The public HACS repository is
`https://github.com/josemaria1992/energy-optimizer-card`. Add that repository
as a HACS custom Dashboard repository, download it, and let HACS register the
resource automatically.

## Basic card

The same bundle registers a dedicated delivery-price card. It calls Home
Assistant's read-only `nordpool.get_prices_for_date` action and plots every
15-minute interval for today and tomorrow on one continuous graph. Today and
tomorrow have independent show/hide buttons. Tomorrow stays disabled until
Home Assistant reports that the curve is available, and peak labels use the
configured Home Assistant timezone.

```yaml
type: custom:nordpool-delivery-card
title: Nord Pool SE4 — today & tomorrow
nordpool_config_entry: YOUR_NORDPOOL_CONFIG_ENTRY_ID
area: SE4
currency: SEK
display_unit: kWh
```

Set `currency: EUR` and `display_unit: MWh` to match the units used by the
Nord Pool delivery-day website. Use `currency: SEK` and `display_unit: kWh`
for optimizer accounting units.

```yaml
type: custom:energy-optimizer-card
title: Energy Optimizer
```

The default entity IDs match the current MQTT entities. Any entity can be
overridden without changing the backend:

```yaml
type: custom:energy-optimizer-card
title: Energy Control
entities:
  soc: sensor.optimizer_battery_soc
  load: sensor.optimizer_load_power
  grid: sensor.optimizer_grid_power
```

Optional flags are `show_financials`, `show_safety`, and `show_timeline` (all
default to `true`). The timeline plots the raw Nord Pool spot price (excluding
VAT and supplier/grid fees) together with measured battery SOC, house-load and
battery-discharge history. When the core Nord Pool entity has no `today` array,
the card uses Home Assistant recorder history for today's price trace. A Tomorrow button is enabled only
when the Nord Pool entity exposes tomorrow's curve; future SOC/load traces are
left blank because they are not measured yet. The card also exposes a small
visual editor for the title and visibility flags on Home Assistant versions
that support custom card form schemas.

The local audit fixes throttle failed history requests, preserve unavailable
history gaps, and use the Home Assistant timezone with 23/25-hour DST days.
They are not published to GitHub or installed on Home Assistant automatically.

